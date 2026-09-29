import test from "node:test";
import assert from "node:assert/strict";
import { calculateSawRanking } from "../saw";
import { Room, UserPreferences } from "../../types/database";

const sampleRooms: Room[] = [
  {
    id: "1",
    name: "Meeting Room Alpha",
    category: "meeting_room",
    capacity: 6,
    price_per_hour: 100000,
    is_active: true,
    created_at: "",
    updated_at: "",
    facilities: [
      { id: "f1", name: "Proyektor HD" },
      { id: "f2", name: "Whiteboard Glass" },
      { id: "f3", name: "High-Speed Wi-Fi 100Mbps" },
    ],
  },
  {
    id: "2",
    name: "Event Hall",
    category: "event_space",
    capacity: 50,
    price_per_hour: 750000,
    is_active: true,
    created_at: "",
    updated_at: "",
    facilities: [
      { id: "f1", name: "Proyektor HD" },
      { id: "f4", name: "Sound System & Mic" },
    ],
  },
  {
    id: "3",
    name: "Focus Pod",
    category: "hot_desk",
    capacity: 1,
    price_per_hour: 25000,
    is_active: true,
    created_at: "",
    updated_at: "",
    facilities: [
      { id: "f3", name: "High-Speed Wi-Fi 100Mbps" },
    ],
  },
];

test("SAW ranks best matching room at the top", () => {
  const preferences: UserPreferences = {
    attendees: 5,
    requiredFacilities: ["Proyektor HD", "Whiteboard Glass"],
    maxBudgetPerHour: 150000,
    activityType: "meeting",
  };

  const results = calculateSawRanking(sampleRooms, preferences);
  assert.equal(results.length, 3);
  // Meeting Room Alpha should be top ranked
  assert.equal(results[0].room.name, "Meeting Room Alpha");
  assert.ok(results[0].scores.matchPercentage > 80);
});

test("SAW handles zero facilities requested without NaN", () => {
  const preferences: UserPreferences = {
    attendees: 2,
    requiredFacilities: [],
    maxBudgetPerHour: 100000,
    activityType: "meeting",
  };

  const results = calculateSawRanking(sampleRooms, preferences);
  assert.ok(!Number.isNaN(results[0].scores.facilityScore));
  assert.ok(!Number.isNaN(results[0].scores.totalScore));
});

test("SAW respects capacity limits by penalizing undersized rooms", () => {
  const preferences: UserPreferences = {
    attendees: 8,
    requiredFacilities: [],
    maxBudgetPerHour: 1000000,
    activityType: "meeting",
  };

  const results = calculateSawRanking(sampleRooms, preferences);
  // Focus Pod (capacity 1) should score lower on capacity than Event Hall (capacity 50)
  const focusPodResult = results.find(r => r.room.name === "Focus Pod")!;
  const eventHallResult = results.find(r => r.room.name === "Event Hall")!;
  assert.ok(eventHallResult.scores.capacityScore > focusPodResult.scores.capacityScore);
});
