import Link from "next/link";
import { ArrowRight, Trophy, Users, Sparkles } from "lucide-react";
import { SawResult } from "@/lib/types/database";

interface SawResultCardProps {
  result: SawResult;
  rank: number;
}

export function SawResultCard({ result, rank }: SawResultCardProps) {
  const { room, scores } = result;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const rankThemes: Record<number, { border: string; bgBadge: string; textBadge: string; label: string }> = {
    1: {
      border: "border-amber-400/80 shadow-amber-500/20 shadow-xl",
      bgBadge: "bg-amber-400 text-slate-950",
      textBadge: "text-amber-300",
      label: "Rekomendasi Utama (Peringkat 1)",
    },
    2: {
      border: "border-slate-300/60 shadow-slate-300/10 shadow-lg",
      bgBadge: "bg-slate-200 text-slate-950",
      textBadge: "text-slate-200",
      label: "Peringkat 2",
    },
    3: {
      border: "border-amber-700/60 shadow-amber-900/10 shadow-lg",
      bgBadge: "bg-amber-700 text-white",
      textBadge: "text-amber-400",
      label: "Peringkat 3",
    },
  };

  const currentTheme = rankThemes[rank] || {
    border: "border-white/20",
    bgBadge: "bg-white/20 text-white",
    textBadge: "text-slate-300",
    label: `Peringkat ${rank}`,
  };

  return (
    <article className={`relative flex flex-col overflow-hidden rounded-3xl border ${currentTheme.border} bg-white/10 p-6 sm:p-7 backdrop-blur-xl transition hover:-translate-y-1`}>
      {/* Top Header: Rank & Score */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${currentTheme.bgBadge}`}>
            <Trophy size={14} />
            <span>{currentTheme.label}</span>
          </span>
          {rank === 1 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 animate-pulse">
              <Sparkles size={12} />
              <span>Skor Tertinggi</span>
            </span>
          )}
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase text-slate-400">Tingkat Kesesuaian</span>
          <p className="text-2xl font-black text-cyan-300">{scores.matchPercentage}%</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Room Media & Basic info (5 cols) */}
        <div className="md:col-span-5 space-y-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/15 bg-slate-900">
            <img
              src={room.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"}
              alt={room.name}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-bold text-white">
                <Users size={12} className="text-cyan-400" />
                <span>Kapasitas {room.capacity} Orang</span>
              </span>
              <span className="text-[11px] font-bold text-cyan-300">
                {formatPrice(room.price_per_hour)}/jam
              </span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-white line-clamp-1">{room.name}</h3>
          <p className="text-xs text-slate-300 line-clamp-2">{room.description}</p>
        </div>

        {/* SAW Criteria Breakdown (7 cols) */}
        <div className="md:col-span-7 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 space-y-3.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Rincian Nilai Kriteria SAW
          </h4>

          {/* C1: Capacity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">C1: Kesesuaian Kapasitas (Bobot 30%)</span>
              <span className="font-bold text-cyan-300">{scores.capacityScore}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${Math.min(100, scores.capacityScore)}%` }}
              />
            </div>
          </div>

          {/* C2: Facilities */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">C2: Kelengkapan Fasilitas (Bobot 30%)</span>
              <span className="font-bold text-cyan-300">{scores.facilityScore}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${Math.min(100, scores.facilityScore)}%` }}
              />
            </div>
          </div>

          {/* C3: Price Efficiency */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">C3: Efisiensi Biaya (Bobot 25% - Cost)</span>
              <span className="font-bold text-cyan-300">{scores.priceScore}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${Math.min(100, scores.priceScore)}%` }}
              />
            </div>
          </div>

          {/* C4: Category Match */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">C4: Kesesuaian Kegiatan (Bobot 15%)</span>
              <span className="font-bold text-cyan-300">{scores.categoryScore}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                style={{ width: `${Math.min(100, scores.categoryScore)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Nilai preferensi ternormalisasi V = <strong className="text-white">{scores.totalScore}</strong>
        </span>

        <Link
          href={`/reservasi/${room.id}`}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition"
        >
          <span>Reservasi Ruangan Ini</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
}
