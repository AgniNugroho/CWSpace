import test from "node:test";
import assert from "node:assert/strict";
import { checkDuplicateWaitlist } from "../service";

test("checkDuplicateWaitlist detects overlapping waiting list for the same user", () => {
  const existingQueues = [
    {
      user_id: "user-1",
      room_id: "1",
      desired_start_time: "2026-09-30T09:00:00Z",
      desired_end_time: "2026-09-30T11:00:00Z",
      status: "waiting",
    },
    {
      user_id: "user-2",
      room_id: "1",
      desired_start_time: "2026-09-30T09:00:00Z",
      desired_end_time: "2026-09-30T11:00:00Z",
      status: "waiting",
    },
  ];

  // Case 1: user-1 tries to join the exact same slot again -> duplicate!
  const res1 = checkDuplicateWaitlist(
    existingQueues,
    "user-1",
    "1",
    "2026-09-30T09:00:00Z",
    "2026-09-30T11:00:00Z"
  );
  assert.equal(res1.isDuplicate, true);

  // Case 2: user-1 tries to join an overlapping slot (10:00 - 12:00) -> duplicate!
  const res2 = checkDuplicateWaitlist(
    existingQueues,
    "user-1",
    "1",
    "2026-09-30T10:00:00Z",
    "2026-09-30T12:00:00Z"
  );
  assert.equal(res2.isDuplicate, true);

  // Case 3: user-3 (new user) joins the same slot -> not duplicate
  const res3 = checkDuplicateWaitlist(
    existingQueues,
    "user-3",
    "1",
    "2026-09-30T09:00:00Z",
    "2026-09-30T11:00:00Z"
  );
  assert.equal(res3.isDuplicate, false);

  // Case 4: user-1 joins a non-overlapping time slot (13:00 - 15:00) -> not duplicate
  const res4 = checkDuplicateWaitlist(
    existingQueues,
    "user-1",
    "1",
    "2026-09-30T13:00:00Z",
    "2026-09-30T15:00:00Z"
  );
  assert.equal(res4.isDuplicate, false);

  // Case 5: user-1 joins a different room ("2") at the same time -> not duplicate
  const res5 = checkDuplicateWaitlist(
    existingQueues,
    "user-1",
    "2",
    "2026-09-30T09:00:00Z",
    "2026-09-30T11:00:00Z"
  );
  assert.equal(res5.isDuplicate, false);
});

test("checkDuplicateWaitlist ignores cancelled or expired queues", () => {
  const existingQueues = [
    {
      user_id: "user-1",
      room_id: "1",
      desired_start_time: "2026-09-30T09:00:00Z",
      desired_end_time: "2026-09-30T11:00:00Z",
      status: "cancelled",
    },
  ];

  const res = checkDuplicateWaitlist(
    existingQueues,
    "user-1",
    "1",
    "2026-09-30T09:00:00Z",
    "2026-09-30T11:00:00Z"
  );
  assert.equal(res.isDuplicate, false);
});
