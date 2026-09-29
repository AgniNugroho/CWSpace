# CWSpace Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete working prototype of the CWSpace coworking space web application with room reservation, conflict prevention, SAW recommendation, waiting list, membership quota/reminder, and payment verification across Member, Admin, and Owner roles.

**Architecture:** Next.js 16 (App Router) with React 19, TypeScript, Tailwind CSS v4, and Supabase (PostgreSQL with custom ENUMs, Row Level Security, and Realtime Client API). Client-side state and server components handle role-based navigation and deterministic algorithms (SAW and booking anti-collision).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, `@supabase/supabase-js`, `lucide-react`.

**Spec:** `docs/superpowers/specs/2026-09-29-cwspace-prototype-design.md`

## Global Constraints

- Root directory: Move application files from `Halaman Login` to root `d:\Code\Skripsi` and name package `cwspace`.
- PostgreSQL ENUMs: Must define and use `user_role`, `room_category`, `reservation_status`, `payment_method`, `payment_status`, `payment_type`, `user_membership_status`, `waiting_list_status`.
- Visual theme: Modern dark slate (`bg-slate-950`), glassmorphic panels (`bg-white/10`, `backdrop-blur-xl`, `border-white/20`, `rounded-2xl`), royal blue (`bg-blue-600`) and cyan (`text-cyan-200`) accents matching the existing login screen.
- Role hierarchy: Member can access member routes; Admin can access admin routes; Owner has full access to both owner executive analytics (`/owner`) and admin operational panels (`/admin`).
- SAW weights: Capacity $w_1 = 0.30$, Facilities $w_2 = 0.30$, Price $w_3 = 0.25$, Category $w_4 = 0.15$.
- Waiting list claim deadline: 30 minutes from notification timestamp.
- Membership renewal alert: Triggered when remaining days $\le 7$.

## Review Focus

1. **Schedule overlap at boundary times**: A booking ending exactly at 14:00 must not conflict with a booking starting at 14:00 (`start_time < existing.end_time AND end_time > existing.start_time`).
2. **SAW with empty facilities or extreme budget**: If a user selects 0 facilities or a budget lower than any room, the algorithm must handle division by zero gracefully and still rank available rooms.
3. **Membership quota exhaustion**: A user attempting to book a 3-hour slot with only 2 remaining hours on their membership must be prompted to pay the difference or switch payment method.
4. **Waiting list claim expiration**: When the 30-minute claim deadline lapses, the slot must automatically unlock for the next waiting queue number without manual admin intervention.
5. **Unauthorized role navigation**: A member attempting to navigate directly to `/admin` or `/owner` must be blocked with an informative access-denied state.

---

## Tasks

### Task 1: Workspace Reorganization & Package Configuration

**Files:**
- Move: Contents of `d:\Code\Skripsi\Halaman Login\*` to `d:\Code\Skripsi\`
- Modify: `d:\Code\Skripsi\package.json`
- Modify: `d:\Code\Skripsi\app\layout.tsx`

**Interfaces:**
- Produces: Root Next.js application named `cwspace` running directly from `d:\Code\Skripsi`.

- [ ] **Step 1: Move project files from `Halaman Login` to root `d:\Code\Skripsi`**
  Move `app`, `components`, `lib`, `public`, `supabase`, `.env`, `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs` to root directory.

- [ ] **Step 2: Update `package.json` with app metadata**
  Change `"name": "halaman-login"` to `"name": "cwspace"`.

- [ ] **Step 3: Update `app/layout.tsx` metadata**
  Update title to `"CWSpace - Coworking Space & Room Reservation"` and description to `"Prototipe Aplikasi Coworking Space untuk Reservasi Ruangan, Membership, dan Pembayaran"`.

- [ ] **Step 4: Verify build and dependencies**
  Run: `npm run build`
  Expected: Next.js build succeeds with root layout and existing login/signup routes.

- [ ] **Step 5: Commit changes**
  Commit message: `chore: reorganize workspace to root and rename package to cwspace`

---

### Task 2: Supabase Schema Migration with PostgreSQL ENUMs & Seed Data

**Files:**
- Create: `supabase/migrations/20260929000000_cwspace_schema.sql`

**Interfaces:**
- Produces: Full PostgreSQL schema with 8 custom ENUMs, 8 core tables (`profiles`, `rooms`, `facilities`, `room_facilities`, `memberships`, `user_memberships`, `reservations`, `payments`, `waiting_lists`), RLS policies, trigger `handle_new_user`, and seed data for demo testing.

- [ ] **Step 1: Write SQL migration file**
  Define the 8 ENUMs (`user_role`, `room_category`, `reservation_status`, `payment_method`, `payment_status`, `payment_type`, `user_membership_status`, `waiting_list_status`).
  Define tables with foreign keys and check constraints.
  Add RLS policies for authenticated members and admin/owner access.
  Include seed data: 6 representative rooms (Meeting Room Alpha, Podcast Studio, Event Hall, Focus Desk Pod, Executive Boardroom, Creative Suite), 8 facilities, and 3 membership tiers (Starter Pass, Pro Member, Enterprise VIP).

- [ ] **Step 2: Verify SQL syntax**
  Check that all table constraints, foreign key cascades, and ENUM values match the specification document exactly.

- [ ] **Step 3: Commit migration**
  Commit message: `feat(db): add CWSpace schema migration with PostgreSQL enums and seed data`

---

### Task 3: Shared Types, Supabase Client & SAW Recommendation Engine Unit

**Files:**
- Create: `lib/types/database.ts`
- Create: `lib/algorithms/saw.ts`
- Create: `lib/algorithms/__tests__/saw.test.ts`

**Interfaces:**
- Produces:
  - TypeScript types: `UserRole`, `RoomCategory`, `ReservationStatus`, `PaymentMethod`, `PaymentStatus`, `Room`, `Facility`, `Membership`, `UserMembership`, `Reservation`, `WaitingList`.
  - Function: `calculateSawRanking(rooms: RoomWithFacilities[], preferences: UserPreferences): SawResult[]`

- [ ] **Step 1: Define TypeScript database types in `lib/types/database.ts`**
  Map every PostgreSQL ENUM and table to strict TypeScript types.

- [ ] **Step 2: Write failing unit tests for SAW algorithm in `lib/algorithms/__tests__/saw.test.ts`**
  Test cases:
  1. Perfect match yields highest score (> 90%).
  2. Room with insufficient capacity receives lower capacity score.
  3. Cost normalization handles zero or extreme pricing properly.
  4. Empty required facilities checklist does not throw division by zero.
  5. Correct weight multipliers ($0.30, 0.30, 0.25, 0.15$).

- [ ] **Step 3: Implement `calculateSawRanking` in `lib/algorithms/saw.ts`**
  Implement decision matrix normalization ($R$), weighted sum ($V$), and score percentage conversion.

- [ ] **Step 4: Run unit tests to verify pass**
  Run: `npx tsx lib/algorithms/__tests__/saw.test.ts` (or node test runner)
  Expected: All SAW ranking tests pass.

- [ ] **Step 5: Commit changes**
  Commit message: `feat(core): add database types and verified SAW recommendation algorithm`

---

### Task 4: Shared Navigation, Theme Layout & Notification Bell

**Files:**
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/Footer.tsx`
- Create: `components/layout/NotificationBell.tsx`
- Create: `app/(member)/layout.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: Persistent glassmorphism navbar for members and public guests, displaying logo `CWSpace`, navigation links (Beranda, Rekomendasi, Membership, Riwayat), notification bell for waiting list alerts and membership renewal, and user profile badge with sign out button.

- [ ] **Step 1: Create `NotificationBell.tsx` component**
  Fetches user's active waiting list notifications (`status = 'notified'`) and membership renewal warnings ($\le 7$ days). Shows red badge count and dropdown list with direct action links.

- [ ] **Step 2: Create `Navbar.tsx` component**
  Responsive glassmorphic header with role detection (`member`, `admin`, `owner`). Shows links to `/admin` or `/owner` if user has appropriate permissions.

- [ ] **Step 3: Create `Footer.tsx` component**
  Consistent dark glassmorphism footer with CWSpace branding, contact info, and operational hours.

- [ ] **Step 4: Wire `app/(member)/layout.tsx` and home page redirect**
  Ensure root `app/page.tsx` renders the member landing page or redirects cleanly.

- [ ] **Step 5: Verify build**
  Run: `npm run build`
  Expected: Navbar and layout compile with zero errors.

- [ ] **Step 6: Commit changes**
  Commit message: `feat(ui): add persistent glassmorphic navbar, footer, and notification bell`

---

### Task 5: Room Catalog & Availability Viewer

**Files:**
- Create: `app/(member)/page.tsx` (Catalog & Landing)
- Create: `app/(member)/ruangan/[id]/page.tsx` (Room Detail & Slots)
- Create: `components/member/RoomCard.tsx`
- Create: `components/member/RoomFilter.tsx`

**Interfaces:**
- Consumes: `Room`, `Facility` from `lib/types/database.ts`
- Produces: Interactive room catalog with category filtering, capacity filter, search by name, and room detail view with live hourly availability calendar.

- [ ] **Step 1: Create `RoomCard.tsx`**
  Renders room photo/placeholder, title, category badge, capacity with icon, facility tags, price per hour, and "Lihat Detail" / "Pesan" buttons.

- [ ] **Step 2: Create `RoomFilter.tsx`**
  Dropdown/pills for categories (`meeting_room`, `private_office`, `event_space`, `hot_desk`), capacity range, and date picker.

- [ ] **Step 3: Implement `app/(member)/page.tsx`**
  Displays hero banner, quick benefits, room filter, and responsive grid of rooms.

- [ ] **Step 4: Implement `app/(member)/ruangan/[id]/page.tsx`**
  Shows full room specs, complete facilities list, and interactive daily time-slot calendar (08:00 - 22:00) indicating booked vs available slots.

- [ ] **Step 5: Verify UI and compile**
  Run: `npm run build`
  Expected: Catalog and room detail pages compile successfully.

- [ ] **Step 6: Commit changes**
  Commit message: `feat(member): implement room catalog, category filters, and detail slot calendar`

---

### Task 6: Value-Added Feature 1 — SAW Room Recommendation System

**Files:**
- Create: `app/(member)/rekomendasi/page.tsx`
- Create: `components/member/SawRecommendationForm.tsx`
- Create: `components/member/SawResultCard.tsx`

**Interfaces:**
- Consumes: `calculateSawRanking` from `lib/algorithms/saw.ts`
- Produces: Interactive questionnaire for user needs (attendance count, required facilities, max hourly budget, activity type) and ranked room list with breakdown metrics.

- [ ] **Step 1: Create `SawRecommendationForm.tsx`**
  Form with:
  - Number input for attendees.
  - Multi-checkbox for facilities (Proyektor, Smart TV, Whiteboard, Wi-Fi 100Mbps, Sound System, Free Coffee).
  - Range slider for hourly budget (Rp 50.000 - Rp 1.000.000+).
  - Radio selector for activity type (Meeting, Workshop/Seminar, Focus Work, Podcast).

- [ ] **Step 2: Create `SawResultCard.tsx`**
  Shows rank badge (1st, 2nd, 3rd), overall compatibility score (`%`), breakdown bars for the 4 criteria ($C_1, C_2, C_3, C_4$), and instant "Reservasi Ruangan Ini" button.

- [ ] **Step 3: Implement `app/(member)/rekomendasi/page.tsx`**
  Client page connecting form inputs to `calculateSawRanking` with sample or database rooms, animated result presentation, and fallback recommendations.

- [ ] **Step 4: Verify recommendation flow**
  Run: `npm run build`
  Expected: Rekomendasi route compiles and functions cleanly.

- [ ] **Step 5: Commit changes**
  Commit message: `feat(member): implement SAW room recommendation feature with criteria score breakdown`

---

### Task 7: Core System — Reservation Booking & Anti-Collision Engine

**Files:**
- Create: `app/(member)/reservasi/[id]/page.tsx`
- Create: `lib/reservations/conflict.ts`
- Create: `components/member/BookingSummaryModal.tsx`

**Interfaces:**
- Consumes: `Room`, `Reservation`
- Produces:
  - Helper `checkReservationConflict(roomId, startTime, endTime): Promise<boolean>`
  - Booking page with start/end time picker, total hours/price calculation, payment method selector (`transfer_bank`, `qris`, `membership_quota`), and conflict check.

- [ ] **Step 1: Implement `checkReservationConflict` in `lib/reservations/conflict.ts`**
  Query Supabase `reservations` checking for overlap with active bookings (`menunggu_verifikasi`, `dikonfirmasi`). Return true if conflict exists.

- [ ] **Step 2: Implement `app/(member)/reservasi/[id]/page.tsx`**
  Form for booking date, start time, end time. If conflict detected, display red alert and "Masuk Antrean Waiting List" button. If available, show payment choice.

- [ ] **Step 3: Implement transfer proof upload & quota check**
  If `membership_quota`: verify user has active quota $\ge$ duration, deduct hours, set status to `dikonfirmasi`. If transfer/QRIS: show bank destination and file uploader for proof image.

- [ ] **Step 4: Verify booking flow**
  Run: `npm run build`
  Expected: Reservation page compiles with complete validation.

- [ ] **Step 5: Commit changes**
  Commit message: `feat(member): implement booking page with anti-collision schedule validator`

---

### Task 8: Value-Added Feature 2 — Membership Management & Renewal Reminder

**Files:**
- Create: `app/(member)/membership/page.tsx`
- Create: `components/member/MembershipCard.tsx`
- Create: `components/member/UserQuotaCard.tsx`
- Create: `components/member/RenewalAlertBanner.tsx`

**Interfaces:**
- Consumes: `Membership`, `UserMembership`
- Produces: Membership catalog, active subscription status display, circular/linear progress bar for hours used vs remaining, and warning banner when $\le 7$ days remain.

- [ ] **Step 1: Create `MembershipCard.tsx`**
  Show tier name, price, duration, quota hours, discount benefit, and "Pilih Paket" button.

- [ ] **Step 2: Create `UserQuotaCard.tsx`**
  Displays current active plan, expiration date, days countdown, remaining meeting room hours with progress bar, and "Perpanjang Paket" button.

- [ ] **Step 3: Create `RenewalAlertBanner.tsx`**
  Displays amber warning if days remaining $\le 7$ with reminder text: "Masa aktif membership Anda tersisa X hari. Perpanjang sekarang agar kuota tidak hangus!".

- [ ] **Step 4: Implement `app/(member)/membership/page.tsx`**
  Combines active quota card, renewal alert, and tier purchase cards with bank transfer / QRIS simulation.

- [ ] **Step 5: Verify build**
  Run: `npm run build`
  Expected: Membership page compiles and renders properly.

- [ ] **Step 6: Commit changes**
  Commit message: `feat(member): implement membership tier management, quota progress, and renewal reminder`

---

### Task 9: Value-Added Feature 3 — Waiting List & Claim Workflow

**Files:**
- Create: `app/(member)/waiting-list/page.tsx`
- Create: `components/member/WaitingListCard.tsx`
- Create: `components/member/ClaimSlotModal.tsx`
- Create: `lib/waiting-list/service.ts`

**Interfaces:**
- Produces: Waiting list dashboard for users, queue tracking, and 30-minute claim workflow to convert a released booking into an active reservation.

- [ ] **Step 1: Create `lib/waiting-list/service.ts`**
  Functions:
  - `joinWaitingList(userId, roomId, startTime, endTime)`
  - `checkActiveWaitlist(userId)`
  - `claimWaitlistSlot(waitlistId)`

- [ ] **Step 2: Create `WaitingListCard.tsx`**
  Shows room name, desired date/time, queue number, and status badge (`waiting`, `notified`, `claimed`, `expired`).

- [ ] **Step 3: Create `ClaimSlotModal.tsx`**
  Countdown timer for 30-minute claim deadline with "Konfirmasi & Lanjut Pembayaran" button.

- [ ] **Step 4: Implement `app/(member)/waiting-list/page.tsx`**
  Lists all user waitlist items with live status updates and one-click slot claiming.

- [ ] **Step 5: Verify build**
  Run: `npm run build`
  Expected: Waiting list portal compiles.

- [ ] **Step 6: Commit changes**
  Commit message: `feat(member): implement waiting list tracking and 30-minute slot claiming workflow`

---

### Task 10: Member Reservation & Transaction History

**Files:**
- Create: `app/(member)/riwayat/page.tsx`
- Create: `components/member/ReservationHistoryCard.tsx`

**Interfaces:**
- Produces: Detailed history of user's past and upcoming reservations, payment status (`pending`, `verified`, `rejected`), payment receipt details, and booking cancellation button.

- [ ] **Step 1: Create `ReservationHistoryCard.tsx`**
  Card with date, room, hours, price, payment method, status pill, and action buttons (Upload Bukti Bayar / Batalkan Reservasi).

- [ ] **Step 2: Implement cancellation trigger**
  When a user cancels a reservation, update status to `dibatalkan` and trigger notification for the first waiting list queue for that room and time.

- [ ] **Step 3: Implement `app/(member)/riwayat/page.tsx`**
  Tabbed interface: "Reservasi Mendatang", "Selesai", and "Dibatalkan".

- [ ] **Step 4: Verify build**
  Run: `npm run build`
  Expected: Riwayat page compiles.

- [ ] **Step 5: Commit changes**
  Commit message: `feat(member): implement reservation and transaction history with cancellation trigger`

---

### Task 11: Admin Operations Panel

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/dashboard/page.tsx`
- Create: `app/admin/ruangan/page.tsx`
- Create: `app/admin/reservasi/page.tsx`
- Create: `app/admin/pembayaran/page.tsx`
- Create: `app/admin/waiting-list/page.tsx`
- Create: `components/admin/AdminSidebar.tsx`
- Create: `components/admin/PaymentVerificationModal.tsx`

**Interfaces:**
- Produces: Dedicated admin dashboard with navigation sidebar, room CRUD management, reservation schedule table, payment verification (Approve / Reject with reason), and waiting list manager.

- [ ] **Step 1: Create `AdminSidebar.tsx` and `app/admin/layout.tsx`**
  Sidebar with links to Dashboard, Ruangan, Reservasi, Pembayaran, and Waiting List. Access guard allowing only `admin` and `owner`.

- [ ] **Step 2: Implement `app/admin/ruangan/page.tsx`**
  Table of rooms with capacity, price, facilities, and active toggle. Modal to add new room or edit existing room.

- [ ] **Step 3: Implement `app/admin/reservasi/page.tsx`**
  Schedule overview listing upcoming bookings, filtering by date and room, and conflict inspection.

- [ ] **Step 4: Implement `app/admin/pembayaran/page.tsx`**
  Verification list showing payment receipts, amount, user name, and Approve / Reject buttons.

- [ ] **Step 5: Implement `app/admin/waiting-list/page.tsx`**
  Queue viewer showing users waiting for full rooms and current notification status.

- [ ] **Step 6: Verify build**
  Run: `npm run build`
  Expected: All admin routes compile cleanly.

- [ ] **Step 7: Commit changes**
  Commit message: `feat(admin): implement complete admin operational panel with room CRUD and payment verifier`

---

### Task 12: Owner Executive Analytics Dashboard

**Files:**
- Create: `app/owner/layout.tsx`
- Create: `app/owner/dashboard/page.tsx`
- Create: `components/owner/MetricStatCard.tsx`
- Create: `components/owner/OccupancyChart.tsx`
- Create: `components/owner/RevenueChart.tsx`

**Interfaces:**
- Produces: Executive dashboard displaying high-level business metrics: Occupancy rate (%), Monthly revenue breakdown (room rental vs memberships), Active member count, and quick toggle button to switch to the Admin panel.

- [ ] **Step 1: Create `MetricStatCard.tsx`**
  Cards showing total revenue, active members, occupancy rate, and completed reservations with percentage comparison.

- [ ] **Step 2: Create `OccupancyChart.tsx` and `RevenueChart.tsx`**
  Clean visual bar/progress charts representing room utilization rate and revenue stream distribution without external heavy dependencies.

- [ ] **Step 3: Implement `app/owner/dashboard/page.tsx`**
  Executive summary with KPI cards, charts, recent high-value transactions, and prominent "Beralih ke Panel Operasional Admin" button.

- [ ] **Step 4: Verify build**
  Run: `npm run build`
  Expected: Owner route compiles cleanly.

- [ ] **Step 5: Commit changes**
  Commit message: `feat(owner): implement executive analytics dashboard with occupancy and revenue metrics`

---

### Task 13: End-to-End Verification & Demonstration Polish

**Files:**
- Modify/Review: All pages and components
- Create: `docs/superpowers/DEMO_WALKTHROUGH.md`

**Interfaces:**
- Produces: Verified complete prototype ready for thesis evaluation, complete with seed demo data and walkthrough guide.

- [ ] **Step 1: Run comprehensive build and lint**
  Run: `npm run build && npm run lint`
  Expected: Clean build with 0 errors.

- [ ] **Step 2: Test complete user journeys**
  Verify:
  1. Member login -> Explore catalog -> Run SAW recommendation -> Book room -> Pay.
  2. Member waiting list join -> Cancel reservation -> Notification -> Claim slot.
  3. Membership purchase -> Quota deduction -> Renewal reminder alert.
  4. Admin verify payment -> Room CRUD -> View schedule.
  5. Owner view analytics metrics -> Switch to Admin panel.

- [ ] **Step 3: Write thesis demo walkthrough guide in `docs/superpowers/DEMO_WALKTHROUGH.md`**
  Step-by-step instructions for demonstrating each feature during a thesis defense.

- [ ] **Step 4: Commit changes**
  Commit message: `docs: add comprehensive thesis demo walkthrough guide and final polish`
