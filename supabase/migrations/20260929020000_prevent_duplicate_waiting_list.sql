-- ==============================================================================
-- CWSpace Migration: Prevent Duplicate Active Waiting List per User & Room Slot
-- ==============================================================================

-- If there are any pre-existing duplicates in the database, keep only the earliest one
DELETE FROM public.waiting_lists w1
USING public.waiting_lists w2
WHERE w1.id > w2.id
  AND w1.user_id = w2.user_id
  AND w1.room_id = w2.room_id
  AND w1.desired_start_time = w2.desired_start_time
  AND w1.status IN ('waiting', 'notified')
  AND w2.status IN ('waiting', 'notified');

-- Create unique index to enforce at PostgreSQL level that a user can only have
-- one active queue entry per room and starting time slot
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_active_waiting_list
ON public.waiting_lists (user_id, room_id, desired_start_time)
WHERE status IN ('waiting', 'notified');
