import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { WaitingList } from "@/lib/types/database";

export function checkDuplicateWaitlist(
  existingQueues: Array<{
    user_id: string;
    room_id: string;
    desired_start_time: string;
    desired_end_time: string;
    status: string;
  }>,
  userId: string,
  roomId: string,
  startTimeIso: string,
  endTimeIso: string
): { isDuplicate: boolean; conflictingQueue?: any } {
  const duplicate = existingQueues.find((q) => {
    if (q.user_id !== userId || q.room_id !== roomId) return false;
    if (q.status !== "waiting" && q.status !== "notified") return false;

    const existingStart = new Date(q.desired_start_time).getTime();
    const existingEnd = new Date(q.desired_end_time).getTime();
    const newStart = new Date(startTimeIso).getTime();
    const newEnd = new Date(endTimeIso).getTime();

    return existingStart < newEnd && existingEnd > newStart;
  });

  return {
    isDuplicate: Boolean(duplicate),
    conflictingQueue: duplicate,
  };
}

export async function checkUserExistingWaitlist(
  userId: string,
  roomId: string,
  startTimeIso: string,
  endTimeIso: string
): Promise<{ isWaiting: boolean; queue?: WaitingList }> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase
      .from("waiting_lists")
      .select(`
        id, user_id, room_id, desired_start_time, desired_end_time, queue_number, status, notified_at, claim_deadline, created_at,
        rooms ( id, name, category, capacity, price_per_hour, image_url )
      `)
      .eq("user_id", userId)
      .eq("room_id", roomId)
      .in("status", ["waiting", "notified"])
      .lt("desired_start_time", endTimeIso)
      .gt("desired_end_time", startTimeIso)
      .limit(1);

    if (data && data.length > 0) {
      return { isWaiting: true, queue: data[0] as any };
    }
    return { isWaiting: false };
  } catch {
    return { isWaiting: false };
  }
}

export async function joinWaitingList(
  userId: string,
  roomId: string,
  startTimeIso: string,
  endTimeIso: string
): Promise<{ success: boolean; data?: WaitingList; error?: string }> {
  try {
    const supabase = createSupabaseBrowserClient();

    // 1. Prevent duplicate active waiting list entry for the same user on overlapping slot
    const existingUserWaitlist = await checkUserExistingWaitlist(userId, roomId, startTimeIso, endTimeIso);
    if (existingUserWaitlist.isWaiting && existingUserWaitlist.queue) {
      return {
        success: false,
        error: `Anda sudah terdaftar dalam antrean waiting list untuk jadwal ruangan ini (Nomor Antrean #${existingUserWaitlist.queue.queue_number}).`,
      };
    }

    // 2. Calculate next queue number for this room & overlapping time
    const { data: existingQueues } = await supabase
      .from("waiting_lists")
      .select("queue_number")
      .eq("room_id", roomId)
      .eq("desired_start_time", startTimeIso)
      .in("status", ["waiting", "notified"])
      .order("queue_number", { ascending: false })
      .limit(1);

    const nextQueueNumber = (existingQueues && existingQueues.length > 0)
      ? existingQueues[0].queue_number + 1
      : 1;

    // 2. Insert into waiting_lists
    const { data, error } = await supabase
      .from("waiting_lists")
      .insert({
        user_id: userId,
        room_id: roomId,
        desired_start_time: startTimeIso,
        desired_end_time: endTimeIso,
        queue_number: nextQueueNumber,
        status: "waiting",
      })
      .select(`
        id, user_id, room_id, desired_start_time, desired_end_time, queue_number, status, notified_at, claim_deadline, created_at,
        rooms ( id, name, category, capacity, price_per_hour, image_url )
      `)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as any };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function fetchUserWaitingLists(userId: string): Promise<WaitingList[]> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("waiting_lists")
      .select(`
        id, user_id, room_id, desired_start_time, desired_end_time, queue_number, status, notified_at, claim_deadline, created_at,
        rooms ( id, name, category, capacity, price_per_hour, image_url )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map((item: any) => ({
      ...item,
      room: item.rooms,
    }));
  } catch {
    return [];
  }
}

export async function claimWaitingSlot(waitlistId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("waiting_lists")
      .update({
        status: "claimed",
      })
      .eq("id", waitlistId);

    return !error;
  } catch {
    return true;
  }
}

export async function cancelWaitingList(waitlistId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase
      .from("waiting_lists")
      .update({
        status: "cancelled",
      })
      .eq("id", waitlistId);

    return !error;
  } catch {
    return true;
  }
}
