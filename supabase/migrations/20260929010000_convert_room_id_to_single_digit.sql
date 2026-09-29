-- ==============================================================================
-- CWSpace Migration: Convert Room ID to Single / Double Digit Sequence
-- 1, 2, 3, 4, 5, 6 ... 10, 11, etc.
-- ==============================================================================

-- 1. Create room ID sequence if not exists
CREATE SEQUENCE IF NOT EXISTS public.rooms_id_seq START WITH 1;

-- 2. Drop foreign key constraints referencing rooms(id)
ALTER TABLE public.room_facilities DROP CONSTRAINT IF EXISTS room_facilities_room_id_fkey;
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_room_id_fkey;
ALTER TABLE public.waiting_lists DROP CONSTRAINT IF EXISTS waiting_lists_room_id_fkey;

-- 3. Alter columns from uuid to text
ALTER TABLE public.rooms ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.rooms ALTER COLUMN id TYPE text USING id::text;

ALTER TABLE public.room_facilities ALTER COLUMN room_id TYPE text USING room_id::text;
ALTER TABLE public.reservations ALTER COLUMN room_id TYPE text USING room_id::text;
ALTER TABLE public.waiting_lists ALTER COLUMN room_id TYPE text USING room_id::text;

-- 4. Update existing 6 seed rooms and referencing records to 1, 2, 3, 4, 5, 6
DO $$
DECLARE
  rec RECORD;
  new_num int := 1;
BEGIN
  FOR rec IN (
    SELECT id, name FROM public.rooms 
    ORDER BY 
      CASE name
        WHEN 'Meeting Room Alpha' THEN 1
        WHEN 'Creative Suite Beta' THEN 2
        WHEN 'Executive Boardroom' THEN 3
        WHEN 'Podcast & Creator Studio' THEN 4
        WHEN 'Event & Workshop Hall' THEN 5
        WHEN 'Dedicated Focus Pod' THEN 6
        ELSE 99
      END,
      created_at ASC
  ) LOOP
    -- Update foreign keys in room_facilities, reservations, waiting_lists
    UPDATE public.room_facilities SET room_id = new_num::text WHERE room_id = rec.id;
    UPDATE public.reservations SET room_id = new_num::text WHERE room_id = rec.id;
    UPDATE public.waiting_lists SET room_id = new_num::text WHERE room_id = rec.id;
    
    -- Update room id
    UPDATE public.rooms SET id = new_num::text WHERE id = rec.id;
    
    new_num := new_num + 1;
  END LOOP;
  
  -- Set sequence to the next number (e.g. 7)
  PERFORM setval('public.rooms_id_seq', GREATEST(new_num, 7), false);
END $$;

-- 5. Set default value for rooms.id to auto-increment from sequence as text ('7', '8', '9', '10', ...)
ALTER TABLE public.rooms ALTER COLUMN id SET DEFAULT nextval('public.rooms_id_seq')::text;

-- 6. Restore foreign key constraints with ON DELETE CASCADE
ALTER TABLE public.room_facilities
  ADD CONSTRAINT room_facilities_room_id_fkey 
  FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_room_id_fkey 
  FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;

ALTER TABLE public.waiting_lists
  ADD CONSTRAINT waiting_lists_room_id_fkey 
  FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;

-- 7. Update conflict check function parameter to text
CREATE OR REPLACE FUNCTION public.check_reservation_conflict(
  p_room_id text,
  p_start timestamptz,
  p_end timestamptz
)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.reservations
    WHERE room_id = p_room_id
      AND status IN ('menunggu_verifikasi', 'dikonfirmasi')
      AND (start_time < p_end AND end_time > p_start)
  );
$$;
