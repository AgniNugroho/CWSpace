"use client";

import { Check, Sparkles, ArrowRight } from "lucide-react";
import { Membership } from "@/lib/types/database";

interface MembershipCardProps {
  membership: Membership;
  onSelect: (membership: Membership) => void;
  isCurrentPlan?: boolean;
}

export function MembershipCard({ membership, onSelect, isCurrentPlan }: MembershipCardProps) {
  const isPopular = membership.name.toLowerCase().includes("pro");

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const benefits = [
    `Kuota ${membership.meeting_room_hours} Jam Ruang Meeting Gratis`,
    `Diskon Tambahan ${membership.discount_percentage}% untuk Semua Sewa Ruangan`,
    "Akses Flexi Desk Harian Sepuasnya",
    "High-Speed Wi-Fi 100Mbps & Stopkontak",
    "Free Flow Kopi & Teh Setiap Hari",
    "Prioritas Reservasi & Anti-Bentrok",
  ];

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 sm:p-8 backdrop-blur-2xl shadow-2xl transition hover:-translate-y-1 ${
        isPopular
          ? "border-cyan-400 bg-gradient-to-b from-blue-950/70 to-slate-900/90 shadow-cyan-500/20"
          : "border-white/20 bg-white/10"
      }`}
    >
      {isPopular && (
        <span className="absolute right-6 top-6 inline-flex items-center gap-1 rounded-full bg-cyan-400 px-3 py-1 text-[10px] font-extrabold text-slate-950 uppercase tracking-wider">
          <Sparkles size={11} />
          <span>Paling Populer</span>
        </span>
      )}

      <div>
        <h3 className="text-xl font-bold text-white">{membership.name}</h3>
        <p className="mt-1 text-xs text-slate-300 min-h-[32px] line-clamp-2">
          {membership.description || "Akses coworking space fleksibel dengan kuota jam meeting room terintegrasi."}
        </p>

        <div className="mt-6 border-y border-white/10 py-5">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">Biaya Langganan</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold text-white">{formatPrice(membership.price)}</span>
            <span className="text-xs text-slate-400">/ {membership.duration_days} hari</span>
          </div>
        </div>

        {/* Feature bullets */}
        <ul className="mt-6 space-y-3 text-xs text-slate-200">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="rounded-full bg-cyan-400/20 p-1 text-cyan-300 shrink-0 mt-0.5">
                <Check size={12} />
              </div>
              <span className="leading-snug">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Button */}
      <div className="mt-8 pt-4">
        <button
          type="button"
          onClick={() => onSelect(membership)}
          disabled={isCurrentPlan}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition shadow-lg ${
            isCurrentPlan
              ? "border border-white/20 bg-white/5 text-slate-400 cursor-not-allowed"
              : isPopular
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-500 hover:to-cyan-400 shadow-blue-500/30"
              : "bg-white/15 text-white hover:bg-white/25 border border-white/20"
          }`}
        >
          <span>{isCurrentPlan ? "Paket Saat Ini" : "Pilih Paket Ini"}</span>
          {!isCurrentPlan && <ArrowRight size={14} />}
        </button>
      </div>
    </div>
  );
}
