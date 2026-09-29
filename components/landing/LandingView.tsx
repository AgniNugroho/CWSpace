"use client";

import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Building2,
  CheckCircle2,
  Users,
  Laptop,
  Briefcase,
  Zap,
  ArrowUpRight
} from "lucide-react";
import { Room } from "@/lib/types/database";
import { RoomCard } from "@/components/member/RoomCard";

interface LandingViewProps {
  rooms: Room[];
}

export function LandingView({ rooms }: LandingViewProps) {
  const previewRooms = rooms.slice(0, 3);

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section (Moved & Enhanced from user dashboard) */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white/15 via-white/10 to-white/5 p-8 sm:p-14 lg:p-20 text-center shadow-2xl backdrop-blur-2xl">
        {/* Decorative background glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-inner">
            <Sparkles size={14} className="animate-pulse" />
            <span>Sistem Reservasi & Rekomendasi Cerdas SAW</span>
          </div>

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Ruang Kerja & Rapat Modern untuk{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
              Produktivitas Terbaik Anda
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Temukan ruangan yang paling sesuai dengan kebutuhan kegiatan Anda secara instan menggunakan algoritma rekomendasi SAW, reservasi tanpa bentrok jadwal, dan nikmati fleksibilitas membership eksklusif.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/daftar"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-blue-500/30 transition hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.02]"
            >
              <Zap size={18} />
              <span>Daftar Akun Sekarang</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/rekomendasi"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-4 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 hover:scale-[1.02]"
            >
              <Sparkles size={18} className="text-cyan-300" />
              <span>Coba Rekomendasi SAW</span>
            </Link>

            <Link
              href="/membership"
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-slate-900/60 px-6 py-4 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              <span>Paket Membership</span>
            </Link>
          </div>

          {/* Value Proposition Triad */}
          <div className="mt-16 grid grid-cols-1 gap-6 border-t border-white/15 pt-10 sm:grid-cols-3 text-left">
            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-600/20 text-cyan-300 border border-blue-400/30">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Bebas Bentrok Jadwal</p>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  Validasi interval waktu otomatis di level database memastikan reservasi Anda bebas tumpang tindih.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-400/30">
                <Sparkles size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Metode Rekomendasi SAW</p>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  Algoritma pembobotan matematis untuk kapasitas, kelengkapan fasilitas, dan efisiensi anggaran.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-600/20 text-amber-300 border border-amber-400/30">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Waiting List Otomatis</p>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                  Antrean cerdas dengan pemberitahuan real-time saat slot yang penuh dibatalkan oleh pemesan sebelumnya.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Feature Highlights (Mengapa CWSpace) */}
      <section className="space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-300">
            <Building2 size={13} />
            <span>Fasilitas Kelas Dunia</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Solusi Ruang Kerja untuk Berbagai Kebutuhan
          </h2>
          <p className="text-sm text-slate-300">
            Dirancang khusus untuk mendukung produktivitas freelancer, tim remote, hingga presentasi skala korporat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-white/10 space-y-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <Laptop size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Focus Pods & Hot Desks</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bekerja dengan fokus penuh di meja kerja ergonomis lengkap dengan koneksi internet serat optik berkecepatan tinggi dan akses kopi gratis.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Internet Dedicated 200 Mbps</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Stopkontak di Setiap Meja</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Free Flow Coffee & Tea</span>
              </li>
            </ul>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-white/10 space-y-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <Briefcase size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Meeting Rooms Akustik</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ruang rapat kedap suara yang dilengkapi perangkat video conference, smart TV 4K, dan papan tulis kaca untuk diskusi tim dan klien.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Peredam Suara Standar Studio</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Webcam 4K & Mic Omnidirectional</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Whiteboard & Marker Lengkap</span>
              </li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-white/15 bg-white/5 p-7 backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-white/10 space-y-4">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-400/30">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Event Hall & Workshop</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Area lapang dengan tata letak fleksibel, sistem tata suara panggung, proyektor resolusi tinggi untuk seminar, talkshow, atau workshop.
            </p>
            <ul className="space-y-2 pt-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Kapasitas hingga 50+ Peserta</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Wireless Microphone & Sound System</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-cyan-400" />
                <span>Laser Projector & Layar Lebar</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. Preview Ruangan Tersedia (Live from Supabase) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <span>Preview Ruangan</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="text-cyan-400" size={26} />
              <span>Ruangan Populer di CWSpace</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Beberapa pilihan ruang kerja dan rapat terbaik yang siap Anda gunakan hari ini.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20 transition self-start sm:self-auto"
          >
            <span>Masuk untuk Reservasi</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {previewRooms.length === 0 ? (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-12 text-center">
            <Building2 size={36} className="mx-auto text-slate-500" />
            <p className="mt-3 text-sm font-semibold text-white">Belum ada ruangan yang dipublikasikan</p>
            <p className="text-xs text-slate-400 mt-1">Data master ruangan sedang disiapkan oleh administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {previewRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Final CTA Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-blue-900/60 via-slate-900/80 to-cyan-950/60 p-8 sm:p-12 text-center shadow-2xl backdrop-blur-2xl">
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Siap Mewujudkan Ruang Kerja Impian Anda?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Bergabunglah bersama komunitas inovator, developer, dan profesional di CWSpace. Buat akun sekarang untuk menikmati reservasi fleksibel tanpa bentrok.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/daftar"
              className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.02]"
            >
              Daftar Akun Baru
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition"
            >
              Sudah Memiliki Akun? Masuk
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
