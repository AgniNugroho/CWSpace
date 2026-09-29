import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Checks if a room has conflicting reservations during the specified time window.
 * An active booking is either in 'menunggu_verifikasi' or 'dikonfirmasi'.
 * Overlap condition: (existing.start_time < new_end) AND (existing.end_time > new_start)
 */
export async function checkReservationConflict(
  roomId: string,
  startTimeIso: string,
  endTimeIso: string,
  excludeReservationId?: string
): Promise<{ hasConflict: boolean; conflictingReservation?: any }> {
  try {
    const supabase = createSupabaseBrowserClient();

    let query = supabase
      .from("reservations")
      .select("id, start_time, end_time, status")
      .eq("room_id", roomId)
      .in("status", ["menunggu_pembayaran", "menunggu_verifikasi", "dikonfirmasi"])
      .lt("start_time", endTimeIso)
      .gt("end_time", startTimeIso);

    if (excludeReservationId) {
      query = query.neq("id", excludeReservationId);
    }

    const { data, error } = await query;

    if (error) {
      // In offline or setup mode, handle gracefully
      return { hasConflict: false };
    }

    if (data && data.length > 0) {
      return { hasConflict: true, conflictingReservation: data[0] };
    }

    return { hasConflict: false };
  } catch {
    return { hasConflict: false };
  }
}
