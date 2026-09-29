# Spesifikasi Perancangan Sistem Prototipe Coworking Space (CWSpace)

**Judul Skripsi:** Pengembangan Prototipe Aplikasi Coworking Space untuk Reservasi Ruangan, Membership, dan Pembayaran  
**Nama Sistem:** CWSpace  
**Tanggal Dokumen:** 2026-09-29  
**Status:** Divalidasi & Siap untuk Rencana Implementasi  

---

## 1. Ringkasan Eksekutif & Tujuan Produk

Aplikasi **CWSpace** adalah prototipe sistem berbasis web yang dirancang untuk memodernisasi dan mengintegrasikan seluruh operasional layanan coworking space ke dalam satu platform terpusat. CWSpace mengusung arsitektur **Two-Layer System**:
1. **Lapisan 1 (Core System):** Manajemen Ruangan, Pengecekan Ketersediaan, Reservasi Ruangan Bebas Bentrok, Manajemen Paket Membership, Pencatatan & Verifikasi Pembayaran, serta Riwayat Transaksi.
2. **Lapisan 2 (Value-Added Features):**
   - **Rekomendasi Ruangan Berdasarkan Kebutuhan (Must Have):** Menggunakan metode Sistem Pendukung Keputusan formal **Simple Additive Weighting (SAW)**.
   - **Pengingat Masa Berlaku & Pemanfaatan Membership (Must Have):** Pelacakan sisa kuota jam sewa dan hitung mundur masa aktif dengan *renewal alert*.
   - **Waiting List Otomatis untuk Ruangan Penuh (Should Have):** Mekanisme antrean cerdas (FIFO) dengan notifikasi *in-app* dan *claim window* saat terjadi pembatalan reservasi.

---

## 2. Pengguna & Hak Akses (Role-Based Access Control)

Sistem membedakan tiga peran (*role*) pengguna dengan hierarki hak akses sebagai berikut:

| Peran | Deskripsi | Hak Akses Utama |
| :--- | :--- | :--- |
| **Member / Pelanggan** | Pengguna yang memesan ruangan atau membeli membership. | • Eksplorasi katalog ruangan & jadwal ketersediaan.<br>• Menggunakan fitur rekomendasi ruangan SAW.<br>• Melakukan reservasi ruangan & memilih metode bayar.<br>• Bergabung ke antrean *Waiting List* jika slot penuh.<br>• Mengelola langganan membership & memantau kuota jam.<br>• Mengunggah bukti transfer & melihat histori transaksi. |
| **Admin / Operator** | Petugas operasional harian coworking space. | • Manajemen data ruangan, fasilitas, dan harga (CRUD).<br>• Kalender & jadwal pemesanan (pencegahan bentrok).<br>• Verifikasi bukti pembayaran (Approve / Reject).<br>• Monitoring antrean waiting list & alokasi manual jika diperlukan. |
| **Pemilik / Owner** | Manajemen eksekutif coworking space (*Super-User*). | • **Akses penuh ke seluruh panel operasional Admin**.<br>• Dashboard Analitik Eksekutif: Tingkat okupansi ruangan (*occupancy rate*), omzet pendapatan (sewa & membership), tren pertumbuhan member, dan statistik performa bisnis. |

---

## 3. Desain Visual & Pengalaman Pengguna (Design System)

Mengadopsi dan memperluas tema visual dari antarmuka login yang sudah ada:
- **Tema Utama:** Modern Dark Theme (`bg-slate-950`).
- **Glassmorphism UI:** Kartu data, formulir, dan modal menggunakan `bg-white/10` dengan `backdrop-blur-xl`, border halus `border-white/20`, bayangan `shadow-2xl`, dan sudut membulat `rounded-2xl`.
- **Palet Warna Aksen:**
  - *Royal Blue* (`bg-blue-600 hover:bg-blue-500`): Tombol aksi utama, tautan aktif.
  - *Cyan / Bright Blue* (`text-cyan-200`, `border-blue-400`): Fokus input, badge rekomendasi tinggi.
  - *Emerald Green* (`bg-emerald-500/20 text-emerald-300`): Status terkonfirmasi / disetujui.
  - *Amber / Yellow* (`bg-amber-500/20 text-amber-300`): Status menunggu verifikasi, reminder membership $\le 7$ hari.
  - *Rose / Red* (`bg-rose-500/20 text-rose-300`): Status dibatalkan / ditolak, slot penuh.
- **Ikonografi:** `lucide-react`.

---

## 4. Perancangan Skema Basis Data (Supabase PostgreSQL)

Seluruh status dan peran pengguna diatur menggunakan tipe data kustom **PostgreSQL ENUM** untuk menjamin integritas dan keamanan data.

### 4.1. Definisi PostgreSQL ENUMs

```sql
-- Role Pengguna
CREATE TYPE user_role AS ENUM ('member', 'admin', 'owner');

-- Kategori Ruangan
CREATE TYPE room_category AS ENUM ('meeting_room', 'private_office', 'event_space', 'hot_desk');

-- Status Reservasi
CREATE TYPE reservation_status AS ENUM (
  'menunggu_pembayaran', 
  'menunggu_verifikasi', 
  'dikonfirmasi', 
  'selesai', 
  'dibatalkan'
);

-- Metode Pembayaran
CREATE TYPE payment_method AS ENUM ('transfer_bank', 'qris', 'membership_quota');

-- Status Pembayaran
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');

-- Tipe Pembayaran
CREATE TYPE payment_type AS ENUM ('reservasi', 'membership');

-- Status Membership Pengguna
CREATE TYPE user_membership_status AS ENUM ('active', 'expired', 'exhausted');

-- Status Waiting List
CREATE TYPE waiting_list_status AS ENUM ('waiting', 'notified', 'claimed', 'expired', 'cancelled');
```

### 4.2. Definisi Struktur Tabel

1. **`profiles`**
   - `id uuid primary key references auth.users(id) on delete cascade`
   - `full_name text not null`
   - `role user_role not null default 'member'`
   - `phone text`
   - `avatar_url text`
   - `created_at timestamptz not null default now()`
   - `updated_at timestamptz not null default now()`

2. **`rooms`**
   - `id uuid primary key default gen_random_uuid()`
   - `name text not null`
   - `category room_category not null default 'meeting_room'`
   - `capacity int not null check (capacity > 0)`
   - `price_per_hour numeric not null check (price_per_hour >= 0)`
   - `description text`
   - `image_url text`
   - `is_active boolean not null default true`
   - `created_at timestamptz not null default now()`
   - `updated_at timestamptz not null default now()`

3. **`facilities` & `room_facilities`**
   - `facilities`:
     - `id uuid primary key default gen_random_uuid()`
     - `name text not null unique` (Contoh: "Proyektor HD", "Smart TV & Video Conf", "Whiteboard Glass", "High-Speed Wi-Fi 100Mbps", "Sound System & Mic", "Free Flow Coffee & Tea")
   - `room_facilities`:
     - `room_id uuid references rooms(id) on delete cascade`
     - `facility_id uuid references facilities(id) on delete cascade`
     - `primary key (room_id, facility_id)`

4. **`memberships` (Paket Langganan)**
   - `id uuid primary key default gen_random_uuid()`
   - `name text not null` (Contoh: "Starter Pass", "Pro Member", "Enterprise VIP")
   - `price numeric not null check (price >= 0)`
   - `duration_days int not null check (duration_days > 0)`
   - `meeting_room_hours int not null default 0` (Kuota jam ruang meeting gratis)
   - `discount_percentage numeric not null default 0 check (discount_percentage between 0 and 100)`
   - `description text`
   - `is_active boolean not null default true`
   - `created_at timestamptz not null default now()`

5. **`user_memberships` (Transaksi Langganan Pengguna)**
   - `id uuid primary key default gen_random_uuid()`
   - `user_id uuid not null references profiles(id) on delete cascade`
   - `membership_id uuid not null references memberships(id)`
   - `start_date timestamptz not null default now()`
   - `end_date timestamptz not null`
   - `total_hours int not null`
   - `remaining_hours int not null check (remaining_hours >= 0)`
   - `status user_membership_status not null default 'active'`
   - `created_at timestamptz not null default now()`

6. **`reservations` (Pemesanan Ruangan)**
   - `id uuid primary key default gen_random_uuid()`
   - `user_id uuid not null references profiles(id) on delete cascade`
   - `room_id uuid not null references rooms(id) on delete cascade`
   - `start_time timestamptz not null`
   - `end_time timestamptz not null`
   - `total_hours numeric not null check (total_hours > 0)`
   - `total_price numeric not null check (total_price >= 0)`
   - `payment_method payment_method not null`
   - `status reservation_status not null default 'menunggu_pembayaran'`
   - `notes text`
   - `created_at timestamptz not null default now()`
   - `updated_at timestamptz not null default now()`

7. **`payments` (Pencatatan & Verifikasi Pembayaran)**
   - `id uuid primary key default gen_random_uuid()`
   - `user_id uuid not null references profiles(id) on delete cascade`
   - `reservation_id uuid references reservations(id) on delete set null`
   - `user_membership_id uuid references user_memberships(id) on delete set null`
   - `amount numeric not null check (amount >= 0)`
   - `payment_type payment_type not null`
   - `payment_method payment_method not null`
   - `proof_image_url text` (URL bukti transfer / referensi transaksi)
   - `status payment_status not null default 'pending'`
   - `verified_by uuid references profiles(id)`
   - `verified_at timestamptz`
   - `rejection_reason text`
   - `created_at timestamptz not null default now()`

8. **`waiting_lists` (Antrean Otomatis Ruangan Penuh)**
   - `id uuid primary key default gen_random_uuid()`
   - `user_id uuid not null references profiles(id) on delete cascade`
   - `room_id uuid not null references rooms(id) on delete cascade`
   - `desired_start_time timestamptz not null`
   - `desired_end_time timestamptz not null`
   - `queue_number int not null`
   - `status waiting_list_status not null default 'waiting'`
   - `notified_at timestamptz`
   - `claim_deadline timestamptz`
   - `created_at timestamptz not null default now()`

---

## 5. Logika Algoritma & Alur Bisnis

### 5.1. Logika Rekomendasi Ruangan (Simple Additive Weighting / SAW)
Ketika pengguna menginput:
- $P$ = Jumlah orang yang akan hadir
- $F_{req}$ = Himpunan fasilitas yang dibutuhkan
- $B_{max}$ = Anggaran biaya per jam
- $T_{act}$ = Kategori/tipe kegiatan

Sistem mengambil seluruh ruangan aktif ($A_1, A_2, \dots, A_m$) dan melakukan proses SAW:
1. **Kriteria & Bobot:**
   - $C_1$: Kesesuaian Kapasitas ($w_1 = 0.30$, Benefit).  
     Skor = $\max(0, 1 - \frac{|\text{Kapasitas} - P|}{\text{Kapasitas}} \times 0.5)$ jika $\text{Kapasitas} \ge P$; jika $\text{Kapasitas} < P$, skor = $0.1$.
   - $C_2$: Kelengkapan Fasilitas ($w_2 = 0.30$, Benefit).  
     Skor = $\frac{|F_{\text{room}} \cap F_{\text{req}}|}{|F_{\text{req}}|}$ (persentase fasilitas terpenuhi).
   - $C_3$: Efisiensi Harga ($w_3 = 0.25$, Cost).  
     Nilai asli adalah harga per jam.
   - $C_4$: Kesesuaian Kategori ($w_4 = 0.15$, Benefit).  
     Skor = $1.0$ jika kategori ruangan sesuai jenis kegiatan, $0.5$ jika netral/bisa digunakan.
2. **Normalisasi Matriks ($R$):**
   - Benefit: $r_{ij} = \frac{x_{ij}}{\max_k(x_{kj})}$
   - Cost: $r_{ij} = \frac{\min_k(x_{kj})}{x_{ij}}$
3. **Nilai Preferensi ($V_i$):**
   $$V_i = \sum_{j=1}^{4} w_j \cdot r_{ij}$$
4. **Penyajian:** Ruangan diurutkan dari skor $V_i$ tertinggi dengan representasi persentase kecocokan.

### 5.2. Pencegahan Bentrok Jadwal (Anti-Collision Booking)
Sebuah pemesanan pada rentang waktu $[t_{\text{start}}, t_{\text{end}}]$ untuk ruangan $R$ valid jika dan hanya jika:
```sql
SELECT count(*) = 0 FROM reservations
WHERE room_id = R
  AND status IN ('menunggu_verifikasi', 'dikonfirmasi')
  AND (start_time < t_end AND end_time > t_start);
```
Jika tidak valid (terjadi bentrok), sistem menghentikan proses pembuatan reservasi dan memberikan tautan tombol *"Masuk Waiting List"*.

### 5.3. Mekanisme Waiting List Otomatis (FIFO)
1. Pelanggan menyetujui bergabung dalam antrean untuk rentang waktu bentrok. Nomor antrean dihitung: `MAX(queue_number) + 1`.
2. Jika ada pembatalan pemesanan (`status` reservasi menjadi `'dibatalkan'`):
   - Sistem mencari record `waiting_lists` teratas (`queue_number` terkecil dengan status `'waiting'`).
   - Ubah status menjadi `'notified'`, simpan `notified_at = now()`, dan set `claim_deadline = now() + interval '30 minutes'`.
3. Notifikasi visual muncul di navbar pelanggan. Pelanggan dapat menekan tombol *"Klaim Slot"*, yang langsung mengarahkan ke form konfirmasi pemesanan.
4. Jika `now() > claim_deadline` dan belum diklaim, status beralih ke `'expired'`, dan tawaran diteruskan otomatis ke nomor antrean berikutnya.

### 5.4. Pemanfaatan & Pengingat Membership
1. **Kuota Jam:** Jika member memilih metode bayar `membership_quota`, sistem memeriksa `remaining_hours >= total_hours`. Jika mencukupi:
   - `user_memberships.remaining_hours` dikurangi `total_hours`.
   - `reservations.status` langsung menjadi `'dikonfirmasi'` tanpa verifikasi manual transfer.
2. **Reminder Renewal:**
   - Dihitung dari `end_date - current_timestamp`.
   - Jika $\le 7$ hari: Ditampilkan kartu peringatan kuning di beranda member dan halaman membership untuk perpanjangan.
   - Jika $\le 0$ hari: Status membership berubah menjadi `'expired'`.

---

## 6. Peta Rute & Struktur Modul Proyek

Proyek ditempatkan di root direktori dengan struktur Next.js App Router:

```text
d:\Code\Skripsi\
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── daftar/page.tsx
│   ├── (member)/
│   │   ├── layout.tsx                 # Navbar & footer member + lonceng notifikasi
│   │   ├── page.tsx                   # Beranda & katalog ruangan
│   │   ├── rekomendasi/page.tsx       # Antarmuka input & hasil Rekomendasi SAW
│   │   ├── ruangan/[id]/page.tsx      # Detail ruangan & kalender slot
│   │   ├── reservasi/page.tsx         # Booking form, pemilihan metode bayar
│   │   ├── membership/page.tsx        # Pembelian paket, kuota jam, reminder
│   │   ├── waiting-list/page.tsx      # Dashboard antrean & klaim slot
│   │   └── riwayat/page.tsx           # Riwayat reservasi & upload bukti transfer
│   ├── admin/
│   │   ├── layout.tsx                 # Admin sidebar & header (akses: admin & owner)
│   │   ├── dashboard/page.tsx         # Ringkasan operasional harian
│   │   ├── ruangan/page.tsx           # CRUD ruangan & fasilitas
│   │   ├── reservasi/page.tsx         # Jadwal reservasi & pemantauan bentrok
│   │   ├── pembayaran/page.tsx        # Verifikasi bukti transfer (Approve/Reject)
│   └── waiting-list/page.tsx          # Monitoring & aksi antrean
│   └── owner/
│       ├── layout.tsx                 # Owner header + Switcher ke panel Admin
│       └── dashboard/page.tsx         # Analitik eksekutif, okupansi, omzet
├── components/
│   ├── ui/                            # SmokeyBackground, Card, Modal, Button, Badges
│   ├── member/                        # RoomCard, SawResultCard, MembershipCard
│   ├── admin/                         # AdminRoomTable, PaymentVerifierModal
│   └── owner/                         # MetricCard, OccupancyChart, RevenueChart
├── lib/
│   ├── supabase/                      # client.ts, server.ts, types.ts
│   └── algorithms/
│       └── saw.ts                     # Engine perhitungan Simple Additive Weighting
├── supabase/
│   └── migrations/
│       └── 20260929000000_cwspace_schema.sql
└── docs/
    └── superpowers/specs/2026-09-29-cwspace-prototype-design.md
```

---

## 7. Batasan Sistem (Out of Scope Terkendali)

Sesuai proposal skripsi, prototipe dibatasi pada:
- Simulasi pembayaran transfer/QRIS (upload bukti bayar + verifikasi admin), tanpa integrasi payment gateway berbayar pihak ketiga.
- Notifikasi waiting list dan renewal disajikan secara *in-app* (modal & notification bell di navbar), tanpa SMS/WhatsApp API berbayar.
- Berjalan sebagai Web Application responsif modern.
