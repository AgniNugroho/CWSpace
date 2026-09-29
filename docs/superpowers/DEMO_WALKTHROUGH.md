# Panduan Demonstrasi & Pengujian Sidang Skripsi (CWSpace)

**Judul Skripsi:** Pengembangan Prototipe Aplikasi Coworking Space untuk Reservasi Ruangan, Membership, dan Pembayaran  
**Nama Sistem:** CWSpace  
**Arsitektur Sistem:** Two-Layer Architecture (Core System & Value-Added Features)  
**Teknologi:** Next.js 16 (App Router + Turbopack), React 19, Tailwind CSS v4, Supabase (PostgreSQL with Custom ENUMs & RLS), Lucide React, TypeScript, Node.js Test Runner.

---

## 1. Ikhtisar Arsitektur Prototipe

CWSpace dikembangkan dengan pemisahan fungsionalitas yang tegas untuk menjawab permasalahan operasional coworking space modern:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LAPISAN 2: VALUE-ADDED FEATURES                 │
│  1. Sistem Rekomendasi SAW (Simple Additive Weighting) Multi-Kriteria  │
│  2. Pengingat Kuota & Masa Berlaku Membership (Alert <= 7 Hari)        │
│  3. Antrean Waiting List Otomatis FIFO dengan Batas Waktu Klaim 30 Mnt │
├────────────────────────────────────────────────────────────────────────┤
│                           LAPISAN 1: CORE SYSTEM                       │
│  • Manajemen Data Ruangan & Fasilitas                                  │
│  • Validasi Ketersediaan Slot & Mesin Anti-Bentrok Waktu Nyata         │
│  • Alur Reservasi Ruangan (Bank Transfer, QRIS, Kuota Membership)      │
│  • Pencatatan & Verifikasi Bukti Pembayaran (Admin Approval)           │
│  • Riwayat Transaksi & Pelacakan Status Pemesanan                      │
├────────────────────────────────────────────────────────────────────────┤
│                       DASAR INFRASTRUKTUR & KEAMANAN                   │
│  • PostgreSQL Custom ENUMs (user_role, reservation_status, dll.)       │
│  • Role-Based Access Control (RBAC): Member, Admin, Owner              │
│  • Row-Level Security (RLS) & Atomic Stored Functions                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Akun & Akses Pengujian Cepat (Role Quick Switcher)

Untuk kelancaran sesi demonstrasi di hadapan Dosen Penguji, sistem dilengkapi dengan **Role Switcher** di bagian header/navbar yang memungkinkan penguji berganti peran tanpa harus logout dan login ulang secara berulang:

| Peran (Role) | Akses URL Utama | Karakteristik Akses |
| :--- | :--- | :--- |
| **Member** | `/` (Katalog), `/rekomendasi`, `/membership`, `/waiting-list`, `/riwayat` | Konsumen yang memesan ruangan, mengelola kuota, dan menerima rekomendasi. |
| **Admin** | `/admin/dashboard`, `/admin/ruangan`, `/admin/reservasi`, `/admin/pembayaran`, `/admin/waiting-list` | Petugas operasional harian yang mengelola inventaris ruangan dan memverifikasi pembayaran. |
| **Owner** | `/owner/dashboard` + Akses Penuh ke `/admin/*` | Eksekutif/Pemilik yang memantau metrik finansial, okupansi, serta memiliki hak akses penuh ke modul admin. |

> **Catatan:** Pengguna juga dapat menguji alur otentikasi login asli di rute `/login`.

---

## 3. Skenario Demonstrasi Lengkap untuk Sidang Skripsi

### Skenario 1: Rekomendasi Ruangan Cerdas (Value-Added 1 - SAW Method)
**Tujuan Pengujian:** Membuktikan bahwa sistem dapat memberikan rekomendasi ruangan terbaik secara matematis berdasarkan kriteria pengguna.

1. Buka rute **`/rekomendasi`** (atau klik menu **Rekomendasi Cerdas** pada Navbar).
2. Isi formulir kuesioner kebutuhan:
   - **Tipe Kegiatan:** Rapat Tim / Diskusi Proyek
   - **Jumlah Peserta:** Masukkan `6` orang
   - **Fasilitas yang Diperlukan:** Centang *Proyektor HD*, *Whiteboard Glass*, dan *High-Speed Wi-Fi 100Mbps*.
   - **Estimasi Anggaran per Jam:** Atur slider ke `Rp 150.000 / jam`.
3. Klik tombol **Hitung Rekomendasi Ruangan (SAW)**.
4. **Hasil yang Diamati:**
   - Sistem melakukan normalisasi matriks keputusan $r_{ij}$ dan perkalian bobot $W = [0.30, 0.30, 0.25, 0.15]$.
   - Kartu hasil menampilkan **Meeting Room Alpha** sebagai **Peringkat 1 (Rekomendasi Utama)** dengan persentase kecocokan $>85\%$.
   - Terdapat rincian skor visual per kriteria (Kapasitas, Fasilitas, Harga, Kategori) serta nilai preferensi akhir $V_i$.
5. Klik **Reservasi Ruangan Ini** pada kartu peringkat 1 untuk melanjutkan ke proses pemesanan.

---

### Skenario 2: Reservasi Ruangan & Mesin Validasi Anti-Bentrok (Core System)
**Tujuan Pengujian:** Membuktikan bahwa sistem mencegah tumpang tindih waktu pemesanan secara preventif.

1. Pengguna diarahkan ke **`/reservasi/[id]`** (atau pilih ruangan dari katalog di `/`).
2. Pilih tanggal pemesanan (misalnya hari ini atau besok).
3. Pilih jam mulai (`13.00`) dan jam selesai (`15.00`) dengan durasi 2 jam.
4. Perhatikan slot ketersediaan: jika slot telah terisi oleh pemesanan lain, sistem menandai slot dengan warna merah dan menonaktifkan pemilihan waktu yang bertabrakan.
5. Pilih metode pembayaran:
   - **Transfer Bank BCA** (Virtual Account) atau **QRIS Dinamis**.
   - (Jika user adalah member aktif dengan sisa kuota, opsi **Potong Kuota Membership** dapat dipilih dengan biaya Rp 0).
6. Unggah contoh file bukti pembayaran (mock transfer).
7. Klik **Konfirmasi Reservasi Bebas Bentrok**.
8. **Hasil yang Diamati:**
   - Modal konfirmasi menampilkan ringkasan biaya transparan.
   - Status reservasi tersimpan sebagai `pending` (menunggu verifikasi admin).
   - Pengguna diarahkan ke `/riwayat` dan melihat kartu pemesanan baru.

---

### Skenario 3: Waiting List Otomatis FIFO & Klaim 30 Menit (Value-Added 3)
**Tujuan Pengujian:** Menunjukkan mekanisme antrean pintar saat slot ruangan penuh dan alokasi otomatis saat terjadi pembatalan.

1. Buka rute **`/ruangan/[id]`** pada ruangan yang memiliki jadwal padat.
2. Saat slot waktu yang diinginkan berstatus penuh (*Booked*), tombol **Masuk Antrean Waiting List** menjadi aktif.
3. Klik tombol tersebut untuk mendaftar antrean. Pengguna menerima nomor urut antrean (misal Queue #1).
4. Buka rute **`/waiting-list`** untuk melihat daftar antrean aktif.
5. **Simulasi Pembatalan:**
   - Sebagai pemesan ruangan utama di `/riwayat`, klik tombol **Batalkan Pemesanan**.
   - Sistem secara otomatis membebaskan slot dan menandai nomor antrean #1 menjadi status `notified` dengan batas waktu klaim 30 menit (`claim_deadline`).
6. **Notifikasi In-App:**
   - Ikon **Lonceng Notifikasi** di navbar berkedip dan menampilkan badge merah.
   - Pengguna mengklik notifikasi untuk membuka `/waiting-list`.
7. **Klaim Slot:**
   - Pada kartu antrean berstatus *Slot Tersedia!*, klik tombol **Klaim Slot Sekarang**.
   - Modal konfirmasi klaim menampilkan hitung mundur waktu (countdown 30 menit).
   - Pengguna mengonfirmasi klaim dan slot langsung dikonversi menjadi reservasi resmi.

---

### Skenario 4: Manajemen Membership & Pengingat Masa Aktif (Value-Added 2)
**Tujuan Pengujian:** Membuktikan pelacakan pemanfaatan kuota jam sewa dan peringatan perpanjangan otomatis saat $\le 7$ hari.

1. Buka rute **`/membership`**.
2. **Hasil yang Diamati:**
   - **Kartu Kuota Member:** Menampilkan total kuota jam sewa (misal 30 Jam), kuota terpakai (18 Jam), dan sisa saldo jam (12 Jam) dalam bentuk progress bar visual.
   - **Banner Peringatan Perpanjangan (Renewal Alert):** Jika tanggal kedaluwarsa berjarak $\le 7$ hari dari hari ini, muncul banner peringatan kuning di bagian atas halaman dan notifikasi di navbar.
3. **Katalog Paket Membership:**
   - Menampilkan 3 tingkatan paket: *Starter Hot Desk* (Rp 350.000), *Pro Dedicated Desk* (Rp 750.000), dan *Executive Suite* (Rp 1.500.000).
   - Klik **Pilih Paket** untuk melakukan simulasi langganan baru.

---

### Skenario 5: Panel Operasional Admin
**Tujuan Pengujian:** Memverifikasi fungsionalitas back-office untuk petugas operasional coworking space.

1. Klik tombol **Panel Admin** pada header (atau buka `/admin/dashboard`).
2. **Ringkasan Operasional:**
   - Memantau statistik harian: Reservasi Menunggu Verifikasi, Pemesanan Terjadwal, dan Antrean Waiting List aktif.
3. **Manajemen Ruangan (`/admin/ruangan`):**
   - Menampilkan daftar inventaris ruangan, status operasional (Aktif/Nonaktif), kapasitas, dan harga per jam.
   - Klik **Tambah Ruangan Baru** untuk membuka form modal CRUD.
4. **Jadwal Reservasi (`/admin/reservasi`):**
   - Menampilkan filter status reservasi (`pending`, `confirmed`, `completed`, `cancelled`).
   - Jadwal terurut secara kronologis untuk memudahkan staf resepsionis.
5. **Verifikasi Pembayaran (`/admin/pembayaran`):**
   - Menampilkan antrean bukti bayar yang diunggah pelanggan.
   - Klik **Lihat Bukti** untuk memeriksa gambar bukti transfer.
   - Klik **Setujui (Approve)**: Status pembayaran berubah menjadi `success`, status reservasi menjadi `confirmed`, dan slot terkunci secara permanen.
   - Klik **Tolak (Reject)**: Muncul opsi pembatalan jika bukti tidak valid.
6. **Monitoring Waiting List (`/admin/waiting-list`):**
   - Memantau seluruh antrean FIFO per ruangan dan waktu pendaftaran.
   - Tombol aksi manual untuk memberi tahu pengguna teratas jika diperlukan.

---

### Skenario 6: Panel Analitik Eksekutif Owner
**Tujuan Pengujian:** Menunjukkan kemampuan pelaporan bisnis untuk pimpinan/pemilik usaha dan fleksibilitas hak akses super-user.

1. Klik switcher **Owner** pada header (atau buka `/owner/dashboard`).
2. **Indikator Kinerja Utama (KPI):**
   - *Total Omzet Bisnis* (misal Rp 47.350.000 dengan tren +18.4% bulanan).
   - *Tingkat Okupansi Rata-rata* (74.8%).
   - *Member Aktif* (48 Member).
   - *Reservasi Berhasil* (142 Transaksi).
3. **Grafik Utilisasi Okupansi Ruangan:**
   - Grafik batang interaktif yang membandingkan persentase tingkat keterisian jam per ruangan (Meeting Room Alpha, Creative Suite, Executive Boardroom, Soundproof Booth).
4. **Distribusi Aliran Pendapatan:**
   - Visualisasi perbandingan pendapatan dari *Paket Membership* (52%) vs *Sewa Ruangan Reguler* (48%).
5. **Verifikasi Hak Akses Ganda (Super-User Access):**
   - Di header Owner terdapat tombol khusus **Beralih ke Panel Operasional Admin**.
   - Klik tombol tersebut dan buktikan bahwa akun Owner dapat langsung mengelola data admin tanpa login ulang.

---

## 4. Landasan Teori & Formulasi Algoritma SAW

Sebagai materi pendukung dalam menjawab pertanyaan Dosen Penguji mengenai metode Simple Additive Weighting (SAW):

### Kriteria dan Bobot Preferensi ($W$)

$$\sum_{j=1}^{4} w_j = 0.30 + 0.30 + 0.25 + 0.15 = 1.00 \ (100\%)$$

| Kode | Nama Kriteria | Tipe Kriteria | Bobot ($w_j$) | Justifikasi Pemilihan Bobot |
| :---: | :--- | :---: | :---: | :--- |
| **$C_1$** | Kesesuaian Kapasitas | *Benefit* | **0.30 (30%)** | Ruangan harus mampu menampung seluruh peserta tanpa kesempitan atau pemborosan kapasitas yang ekstrim. |
| **$C_2$** | Kelengkapan Fasilitas | *Benefit* | **0.30 (30%)** | Fasilitas spesifik (proyektor, whiteboard, sound system) merupakan penentu keberhasilan kegiatan pengguna. |
| **$C_3$** | Efisiensi Harga Sewa | *Cost* | **0.25 (25%)** | Harga yang lebih ekonomis dan sesuai anggaran pengguna memberikan preferensi yang lebih tinggi. |
| **$C_4$** | Keselarasan Kategori | *Benefit* | **0.15 (15%)** | Tipe kegiatan (meeting formal, seminar, kerja individu) harus selaras dengan peruntukan ruangan. |

### Formula Normalisasi ($r_{ij}$)

- Untuk kriteria **Benefit** ($C_1, C_2, C_4$):
  $$r_{ij} = \frac{x_{ij}}{\max_i (x_{ij})}$$

- Untuk kriteria **Cost** ($C_3$ - Harga):
  $$r_{ij} = \frac{\min_i (x_{ij})}{x_{ij}}$$

### Nilai Preferensi Akhir ($V_i$)

$$V_i = \sum_{j=1}^{n} w_j \cdot r_{ij}$$

Ruangan dengan nilai $V_i$ terbesar menjadi alternatif rekomendasi teratas bagi pengguna.

---

## 5. Pertanyaan Kunci Sidang Skripsi & Rekomendasi Jawaban

1. **Mengapa memilih metode SAW dibanding metode MCDM lain seperti AHP atau TOPSIS?**
   - *Jawaban:* Metode SAW memiliki kompleksitas komputasi linear yang sangat cepat (orde $O(m \cdot n)$), sehingga dapat dieksekusi secara instan di sisi klien/browser tanpa jeda waktu pemrosesan (*real-time UX*). Selain itu, formulasi normalisasi linier SAW mudah dipahami dan dijelaskan secara transparan kepada pengguna coworking space.

2. **Bagaimana sistem menjamin tidak ada bentrok jadwal (double booking)?**
   - *Jawaban:* Sistem menerapkan validasi dua lapis:
     - Di sisi frontend, kalender slot memblokir jam yang sudah terisi berdasarkan kueri ketersediaan.
     - Di sisi backend/database, fungsi `has_reservation_conflict(p_room_id, p_start, p_end)` mengecek kondisi tumpang tindih waktu: `(start_time < p_end) AND (end_time > p_start)` dengan status bukan `cancelled` atau `rejected`.

3. **Mengapa data pengguna member dan non-member menggunakan satu tabel `profiles`?**
   - *Jawaban:* Pendekatan ini mengikuti prinsip normalisasi basis data. Status keanggotaan bersifat temporal (memiliki masa aktif dan tanggal kedaluwarsa). Oleh karena itu, data profil inti disimpan di tabel `profiles`, sedangkan relasi membership disimpan di tabel `user_memberships` dengan status `active` dan tanggal `end_date > NOW()`. Jika langganan habis, akun tetap utuh sebagai pengguna reguler tanpa migrasi tabel.

4. **Apa yang terjadi jika pengguna dalam Waiting List tidak mengklaim slot dalam 30 menit?**
   - *Jawaban:* Sistem memiliki atribut `claim_deadline`. Jika waktu klaim habis (`NOW() > claim_deadline`), status antrean pengguna tersebut otomatis menjadi `expired` dan sistem meneruskan giliran alokasi ke pengguna dengan antrean berikutnya (`queue_number + 1`) berdasarkan prinsip First-In, First-Out (FIFO).

---

## 6. Perintah Verifikasi Kode & Pengujian Mandiri

Jalankan perintah berikut pada terminal untuk mendemonstrasikan kebersihan dan integritas kode program:

```bash
# 1. Menjalankan pengujian unit algoritma SAW (Unit Testing TDD)
npm test

# 2. Menjalankan analisis linting kode
npm run lint

# 3. Menjalankan kompilasi produksi Next.js Turbopack
npm run build

# 4. Menjalankan server pengembangan lokal
npm run dev
```

*Dokumen ini disusun sebagai panduan resmi demonstrasi prototipe skripsi CWSpace.*
