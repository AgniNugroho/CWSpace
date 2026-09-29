import Link from "next/link";
import { Sparkles, ArrowRight, Building2, ShieldCheck, Clock } from "lucide-react";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white/10 to-white/5 p-8 sm:p-12 lg:p-16 backdrop-blur-2xl text-center shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
          <Sparkles size={14} />
          <span>Sistem Reservasi & Rekomendasi Cerdas SAW</span>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Ruang Kerja & Rapat Modern untuk{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
            Produktivitas Terbaik Anda
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Temukan ruangan yang paling sesuai dengan kebutuhan kegiatan Anda secara instan menggunakan algoritma rekomendasi, reservasi tanpa bentrok, dan nikmati fleksibilitas membership.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/rekomendasi"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.02]"
          >
            <Sparkles size={18} />
            <span>Cari Rekomendasi Ruangan (SAW)</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/membership"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <span>Lihat Paket Membership</span>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 grid grid-cols-1 gap-4 border-t border-white/15 pt-8 sm:grid-cols-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600/20 text-cyan-300 border border-blue-400/30">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Bebas Bentrok Jadwal</p>
              <p className="text-[11px] text-slate-400">Validasi otomatis ketersediaan slot jam</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-400/30">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Metode Rekomendasi SAW</p>
              <p className="text-[11px] text-slate-400">Pembobotan kapasitas, fasilitas & budget</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-600/20 text-amber-300 border border-amber-400/30">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Waiting List Otomatis</p>
              <p className="text-[11px] text-slate-400">Notifikasi instan saat terjadi pembatalan</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
