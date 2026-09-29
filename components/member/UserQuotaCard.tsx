"use client";

import { CreditCard, Clock, Sparkles, ArrowUpRight } from "lucide-react";
import { UserMembership } from "@/lib/types/database";

interface UserQuotaCardProps {
  userMembership: UserMembership;
  onRenewClick?: () => void;
}

export function UserQuotaCard({ userMembership, onRenewClick }: UserQuotaCardProps) {
  const { total_hours, remaining_hours, end_date, memberships } = userMembership as any;
  const usedHours = Math.max(0, total_hours - remaining_hours);
  const usagePercentage = total_hours > 0 ? Math.min(100, Math.round((usedHours / total_hours) * 100)) : 0;

  const endDateObj = new Date(end_date);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((endDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const formattedEndDate = endDateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-400/40 bg-gradient-to-br from-blue-950/80 via-slate-900/90 to-cyan-950/80 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-bold text-cyan-300">
            <Sparkles size={13} />
            <span>Membership Aktif Anda</span>
          </span>
          <h2 className="mt-2 text-2xl font-black text-white">{memberships?.name || "Paket Membership"}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Berlaku hingga <strong className="text-white">{formattedEndDate}</strong> ({daysRemaining} hari lagi)
          </p>
        </div>

        <button
          type="button"
          onClick={onRenewClick}
          className="self-start sm:self-auto flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-4 py-2.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/20 transition"
        >
          <span>Perpanjang / Ganti Paket</span>
          <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Quota Progress Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Clock size={15} className="text-cyan-400" />
            <span>Pemanfaatan Kuota Jam Ruang Meeting</span>
          </span>
          <span className="text-sm font-extrabold text-cyan-300">
            {remaining_hours} / {total_hours} Jam Tersedia
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full rounded-full bg-slate-800/80 border border-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-300 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, 100 - usagePercentage))}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Terpakai: {usedHours} Jam ({usagePercentage}%)</span>
          <span className="text-cyan-300 font-semibold">Tersisa: {remaining_hours} Jam</span>
        </div>
      </div>

      {/* Benefits summary badge */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-cyan-400" />
          <span className="text-slate-200 font-medium">Bebas Biaya Pemesanan Ruang Meeting Menggunakan Saldo Kuota</span>
        </div>
        <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
          Diskon Tambahan {memberships?.discount_percentage || 15}% Sewa
        </span>
      </div>
    </div>
  );
}
