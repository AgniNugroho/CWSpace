-- ====================================================================
-- CWSPACE SUPABASE SCHEMA MIGRATION
-- Migration Date: 2026-09-29
-- Description: PostgreSQL ENUMs, core tables, RLS policies, triggers, and seed data.
-- ====================================================================

-- 1. POSTGRESQL ENUMS
CREATE TYPE user_role AS ENUM ('member', 'admin', 'owner');
CREATE TYPE room_category AS ENUM ('meeting_room', 'private_office', 'event_space', 'hot_desk');
CREATE TYPE reservation_status AS ENUM (
  'menunggu_pembayaran', 
  'menunggu_verifikasi', 
  'dikonfirmasi', 
  'selesai', 
  'dibatalkan'
);
CREATE TYPE payment_method AS ENUM ('transfer_bank', 'qris', 'membership_quota');
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE payment_type AS ENUM ('reservasi', 'membership');
CREATE TYPE user_membership_status AS ENUM ('active', 'expired', 'exhausted');
CREATE TYPE waiting_list_status AS ENUM ('waiting', 'notified', 'claimed', 'expired', 'cancelled');

-- 2. ALTER OR CREATE PROFILES TABLE
-- Pastikan kolom role dan phone ada pada profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role user_role NOT NULL DEFAULT 'member';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone text;
  END IF;
END $$;

-- Update trigger handle_new_user agar menyertakan role jika ada di user_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_role public.user_role := 'member';
  v_meta_role text;
BEGIN
  v_meta_role := lower(trim(new.raw_user_meta_data ->> 'role'));
  IF v_meta_role IN ('member', 'admin', 'owner') THEN
    v_role := v_meta_role::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    new.id,
    COALESCE(NULLIF(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Pengguna CWSpace'),
    v_role,
    NULLIF(trim(new.raw_user_meta_data ->> 'phone'), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN new;
END;
$$;

-- 3. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category room_category NOT NULL DEFAULT 'meeting_room',
  capacity int NOT NULL CHECK (capacity > 0),
  price_per_hour numeric NOT NULL CHECK (price_per_hour >= 0),
  description text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. FACILITIES & ROOM_FACILITIES
CREATE TABLE IF NOT EXISTS public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.room_facilities (
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  PRIMARY KEY (room_id, facility_id)
);

-- 5. MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  duration_days int NOT NULL CHECK (duration_days > 0),
  meeting_room_hours int NOT NULL DEFAULT 0,
  discount_percentage numeric NOT NULL DEFAULT 0 CHECK (discount_percentage BETWEEN 0 AND 100),
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 6. USER_MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.user_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  membership_id uuid NOT NULL REFERENCES public.memberships(id),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  total_hours int NOT NULL DEFAULT 0,
  remaining_hours int NOT NULL CHECK (remaining_hours >= 0),
  status user_membership_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  total_hours numeric NOT NULL CHECK (total_hours > 0),
  total_price numeric NOT NULL CHECK (total_price >= 0),
  payment_method payment_method NOT NULL DEFAULT 'transfer_bank',
  status reservation_status NOT NULL DEFAULT 'menunggu_pembayaran',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_reservation_time CHECK (end_time > start_time)
);

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL,
  user_membership_id uuid REFERENCES public.user_memberships(id) ON DELETE SET NULL,
  amount numeric NOT NULL CHECK (amount >= 0),
  payment_type payment_type NOT NULL,
  payment_method payment_method NOT NULL,
  proof_image_url text,
  status payment_status NOT NULL DEFAULT 'pending',
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. WAITING_LISTS TABLE
CREATE TABLE IF NOT EXISTS public.waiting_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  desired_start_time timestamptz NOT NULL,
  desired_end_time timestamptz NOT NULL,
  queue_number int NOT NULL DEFAULT 1,
  status waiting_list_status NOT NULL DEFAULT 'waiting',
  notified_at timestamptz,
  claim_deadline timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_waiting_time CHECK (desired_end_time > desired_start_time)
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_lists ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin/owner role
CREATE OR REPLACE FUNCTION public.is_admin_or_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'owner')
  );
$$;

-- RLS: Rooms, Facilities, Memberships (Public read, admin/owner write)
CREATE POLICY "Public read active rooms" ON public.rooms FOR SELECT USING (true);
CREATE POLICY "Admin write rooms" ON public.rooms FOR ALL USING (public.is_admin_or_owner());

CREATE POLICY "Public read facilities" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "Admin write facilities" ON public.facilities FOR ALL USING (public.is_admin_or_owner());

CREATE POLICY "Public read room facilities" ON public.room_facilities FOR SELECT USING (true);
CREATE POLICY "Admin write room facilities" ON public.room_facilities FOR ALL USING (public.is_admin_or_owner());

CREATE POLICY "Public read active memberships" ON public.memberships FOR SELECT USING (true);
CREATE POLICY "Admin write memberships" ON public.memberships FOR ALL USING (public.is_admin_or_owner());

-- RLS: User Memberships
CREATE POLICY "User view own membership" ON public.user_memberships FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_owner());
CREATE POLICY "User create own membership" ON public.user_memberships FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin_or_owner());
CREATE POLICY "Admin update user membership" ON public.user_memberships FOR UPDATE USING (auth.uid() = user_id OR public.is_admin_or_owner());

-- RLS: Reservations
CREATE POLICY "User view own reservations" ON public.reservations FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_owner());
CREATE POLICY "User create reservation" ON public.reservations FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin_or_owner());
CREATE POLICY "User/Admin update reservation" ON public.reservations FOR UPDATE USING (auth.uid() = user_id OR public.is_admin_or_owner());

-- RLS: Payments
CREATE POLICY "User view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_owner());
CREATE POLICY "User create payment" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin manage payments" ON public.payments FOR UPDATE USING (public.is_admin_or_owner());

-- RLS: Waiting Lists
CREATE POLICY "User view own waiting lists" ON public.waiting_lists FOR SELECT USING (auth.uid() = user_id OR public.is_admin_or_owner());
CREATE POLICY "User insert waiting list" ON public.waiting_lists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User/Admin update waiting list" ON public.waiting_lists FOR UPDATE USING (auth.uid() = user_id OR public.is_admin_or_owner());

-- 11. CONFLICT CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.check_reservation_conflict(
  p_room_id uuid,
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

-- 12. SEED DATA
-- Facilities
INSERT INTO public.facilities (name) VALUES
  ('Proyektor HD'),
  ('Smart TV & Video Conf'),
  ('Whiteboard Glass'),
  ('High-Speed Wi-Fi 100Mbps'),
  ('Sound System & Mic'),
  ('Free Flow Coffee & Tea'),
  ('AC & Air Purifier'),
  ('Ergonomic Chairs')
ON CONFLICT (name) DO NOTHING;

-- Membership Packages
INSERT INTO public.memberships (name, price, duration_days, meeting_room_hours, discount_percentage, description) VALUES
  ('Starter Pass', 250000, 30, 5, 5, 'Cocok untuk freelancer dan profesional mandiri. Akses flexi desk dan kuota 5 jam ruang meeting.'),
  ('Pro Member', 600000, 30, 20, 15, 'Pilihan terpopuler untuk tim kecil & startup. Kuota 20 jam ruang meeting + prioritas reservasi.'),
  ('Enterprise VIP', 1500000, 30, 60, 25, 'Solusi menyeluruh untuk tim menengah & konsultan. Kuota 60 jam ruang meeting + diskon 25% sewa event.')
ON CONFLICT DO NOTHING;

-- Rooms
INSERT INTO public.rooms (id, name, category, capacity, price_per_hour, description, image_url) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Meeting Room Alpha', 'meeting_room', 6, 100000, 'Ruang meeting nyaman dengan Smart TV 55 inci, whiteboard kaca, dan pencahayaan optimal untuk diskusi produktif.', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'),
  ('22222222-2222-2222-2222-222222222222', 'Creative Suite Beta', 'meeting_room', 12, 180000, 'Ruang kolaborasi luas dilengkapi proyektor HD, sound system jernih, dan meja modular untuk brainstorming tim.', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80'),
  ('33333333-3333-3333-3333-333333333333', 'Executive Boardroom', 'meeting_room', 20, 350000, 'Ruang rapat eksekutif premium dengan kursi ergonomis kulit, dual display video conference, dan layanan kopi personal.', 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800&q=80'),
  ('44444444-4444-4444-4444-444444444444', 'Podcast & Creator Studio', 'private_office', 4, 120000, 'Studio kedap suara dengan mikrofon studio profesional, lighting studio, dan mixer audio untuk rekaman konten berkualitas tinggi.', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80'),
  ('55555555-5555-5555-5555-555555555555', 'Event & Workshop Hall', 'event_space', 50, 750000, 'Aula serbaguna dengan panggung mini, sound system konser, proyektor raksasa, dan konfigurasi tempat duduk fleksibel.', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80'),
  ('66666666-6666-6666-6666-666666666666', 'Dedicated Focus Pod', 'hot_desk', 1, 25000, 'Pod kerja privat kedap suara untuk fokus kerja mendalam tanpa gangguan, dilengkapi stopkontak dan ventilasi udara segar.', 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- Map Room Facilities
INSERT INTO public.room_facilities (room_id, facility_id)
SELECT r.id, f.id
FROM public.rooms r
CROSS JOIN public.facilities f
WHERE 
  -- Alpha (Meeting 6 org)
  (r.name = 'Meeting Room Alpha' AND f.name IN ('Smart TV & Video Conf', 'Whiteboard Glass', 'High-Speed Wi-Fi 100Mbps', 'AC & Air Purifier', 'Free Flow Coffee & Tea'))
  OR
  -- Beta (Meeting 12 org)
  (r.name = 'Creative Suite Beta' AND f.name IN ('Proyektor HD', 'Whiteboard Glass', 'Sound System & Mic', 'High-Speed Wi-Fi 100Mbps', 'AC & Air Purifier', 'Ergonomic Chairs'))
  OR
  -- Executive Boardroom (20 org)
  (r.name = 'Executive Boardroom' AND f.name IN ('Proyektor HD', 'Smart TV & Video Conf', 'Whiteboard Glass', 'Sound System & Mic', 'High-Speed Wi-Fi 100Mbps', 'Free Flow Coffee & Tea', 'AC & Air Purifier', 'Ergonomic Chairs'))
  OR
  -- Podcast Studio (4 org)
  (r.name = 'Podcast & Creator Studio' AND f.name IN ('Sound System & Mic', 'High-Speed Wi-Fi 100Mbps', 'AC & Air Purifier', 'Ergonomic Chairs'))
  OR
  -- Event Hall (50 org)
  (r.name = 'Event & Workshop Hall' AND f.name IN ('Proyektor HD', 'Sound System & Mic', 'High-Speed Wi-Fi 100Mbps', 'Whiteboard Glass', 'AC & Air Purifier'))
  OR
  -- Focus Pod (1 org)
  (r.name = 'Dedicated Focus Pod' AND f.name IN ('High-Speed Wi-Fi 100Mbps', 'AC & Air Purifier', 'Ergonomic Chairs'))
ON CONFLICT DO NOTHING;
