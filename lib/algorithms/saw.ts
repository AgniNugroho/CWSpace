import { Room, UserPreferences, SawResult, SawScoreBreakdown } from "../types/database";

/**
 * Weights for SAW criteria (Total must equal 1.0)
 * C1: Capacity Suitability (Benefit)  - 30%
 * C2: Facility Completeness (Benefit) - 30%
 * C3: Price Efficiency (Cost)         - 25%
 * C4: Activity Category Match (Benefit) - 15%
 */
export const SAW_WEIGHTS = {
  capacity: 0.30,
  facility: 0.30,
  price: 0.25,
  category: 0.15,
};

/**
 * Normalizes activity types to room categories
 */
function isCategoryCompatible(activity: string, category: string): number {
  const normAct = activity.toLowerCase();
  const normCat = category.toLowerCase();

  if (normAct === normCat) return 1.0;

  if (normAct === "meeting") {
    if (normCat === "meeting_room") return 1.0;
    if (normCat === "private_office") return 0.7;
    if (normCat === "event_space") return 0.5;
    return 0.3;
  }

  if (normAct === "workshop" || normAct === "seminar") {
    if (normCat === "event_space") return 1.0;
    if (normCat === "meeting_room") return 0.8;
    return 0.2;
  }

  if (normAct === "focus" || normAct === "work") {
    if (normCat === "hot_desk" || normCat === "private_office") return 1.0;
    if (normCat === "meeting_room") return 0.6;
    return 0.2;
  }

  if (normAct === "podcast") {
    if (normCat === "private_office") return 1.0;
    if (normCat === "meeting_room") return 0.6;
    return 0.2;
  }

  return 0.5;
}

/**
 * Calculate SAW (Simple Additive Weighting) Ranking for Rooms
 */
export function calculateSawRanking(
  rooms: Room[],
  preferences: UserPreferences
): SawResult[] {
  if (!rooms || rooms.length === 0) return [];

  // Filter only active rooms
  const activeRooms = rooms.filter((r) => r.is_active);
  if (activeRooms.length === 0) return [];

  const attendees = Math.max(1, preferences.attendees || 1);
  const requiredFacs = preferences.requiredFacilities || [];

  // 1. Construct Decision Matrix X
  const rawScores = activeRooms.map((room) => {
    // C1: Capacity score (raw)
    let rawCapacity = 0.1;
    if (room.capacity >= attendees) {
      // Room fits! The closer to attendees without wasted space, the higher
      const diffRatio = (room.capacity - attendees) / room.capacity;
      rawCapacity = Math.max(0.4, 1 - diffRatio * 0.5);
    } else {
      // Undersized room: heavily penalized
      rawCapacity = Math.max(0.05, (room.capacity / attendees) * 0.25);
    }

    // C2: Facility completeness (raw)
    let rawFacility = 1.0;
    if (requiredFacs.length > 0) {
      const roomFacNames = (room.facilities || []).map((f) => f.name.toLowerCase());
      const matched = requiredFacs.filter((rf) =>
        roomFacNames.some((rfn) => rfn.includes(rf.toLowerCase()) || rf.toLowerCase().includes(rfn))
      ).length;
      rawFacility = matched / requiredFacs.length;
    }

    // C3: Price (Cost criterion: lower price is better)
    const rawPrice = Math.max(1, room.price_per_hour);

    // C4: Category match (Benefit)
    const rawCategory = isCategoryCompatible(preferences.activityType || "meeting", room.category);

    return {
      room,
      rawCapacity,
      rawFacility,
      rawPrice,
      rawCategory,
    };
  });

  // 2. Find Max/Min for Normalization
  const maxCapacity = Math.max(...rawScores.map((s) => s.rawCapacity), 0.01);
  const maxFacility = Math.max(...rawScores.map((s) => s.rawFacility), 0.01);
  const minPrice = Math.min(...rawScores.map((s) => s.rawPrice));
  const maxCategory = Math.max(...rawScores.map((s) => s.rawCategory), 0.01);

  // 3. Normalization (R) and Weighted Sum (V)
  const results: SawResult[] = rawScores.map((item) => {
    // Benefit criteria: r_ij = x_ij / max(x_j)
    const rCapacity = item.rawCapacity / maxCapacity;
    const rFacility = maxFacility > 0 ? item.rawFacility / maxFacility : 1.0;
    const rCategory = item.rawCategory / maxCategory;

    // Cost criterion: r_ij = min(x_j) / x_ij
    const rPrice = minPrice / item.rawPrice;

    // Total preference value V_i = sum(w_j * r_ij)
    const totalScore =
      SAW_WEIGHTS.capacity * rCapacity +
      SAW_WEIGHTS.facility * rFacility +
      SAW_WEIGHTS.price * rPrice +
      SAW_WEIGHTS.category * rCategory;

    const breakdown: SawScoreBreakdown = {
      capacityScore: Number((rCapacity * 100).toFixed(1)),
      facilityScore: Number((rFacility * 100).toFixed(1)),
      priceScore: Number((rPrice * 100).toFixed(1)),
      categoryScore: Number((rCategory * 100).toFixed(1)),
      totalScore: Number(totalScore.toFixed(4)),
      matchPercentage: Math.min(100, Math.round(totalScore * 100)),
    };

    return {
      room: item.room,
      scores: breakdown,
    };
  });

  // 4. Sort descending by total preference score
  results.sort((a, b) => b.scores.totalScore - a.scores.totalScore);

  return results;
}
