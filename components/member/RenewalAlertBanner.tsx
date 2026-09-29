"use client";

import { AlertTriangle, Clock, ArrowRight } from "lucide-react";

interface RenewalAlertBannerProps {
  daysRemaining: number;
  remainingHours: number;
  planName: string;
  onRenewClick?: () => void;
}

export function RenewalAlertBanner({
  daysRemaining,
  remainingHours,
  planName,
  onRenewClick,
}: RenewalAlertBannerProps) {
  if (daysRemaining > 7) return null;

  const isExpired = daysRemaining <= 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 backdrop-blur-xl shadow-xl transition animate-in fade-in ${
        isExpired
          ? "border-rose-500/50 bg-rose-500/15 text-rose-200"
          : "border-amber-500/50 bg-amber-500/15 text-amber-100"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`rounded-xl p-2.5 shrink-0 ${
              isExpired ? "bg-rose-500/30 text-rose-300" : "bg-amber-500/30 text-amber-300"
            }`}
          >
            {isExpired ? <AlertTriangle size={20} /> : <Clock size={20} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{isExpired ? "Masa Aktif Membership Telah Berakhir" : "Pengingat Perpanjangan Membership"}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                isExpired ? "bg-rose-600 text-white" : "bg-amber-500 text-slate-950"
              }`}>
                {isExpired ? "Expired" : `Sisa ${daysRemaining} Hari`}
              </span>
            </h3>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              {isExpired ? (
                `Paket ${planName} Anda telah kedaluwarsa. Perpanjang sekarang agar kuota jam meeting room dan diskon sewa kembali aktif.`
              ) : (
                `Paket ${planName} Anda akan berakhir dalam ${daysRemaining} hari. Anda masih memiliki sisa ${remainingHours} jam kuota. Lakukan perpanjangan sekarang agar kuota tidak hangus!`
              )}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRenewClick}
          className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition shrink-0 shadow-md ${
            isExpired
              ? "bg-rose-600 hover:bg-rose-500 shadow-rose-600/30"
              : "bg-amber-600 hover:bg-amber-500 shadow-amber-600/30 text-slate-950 font-extrabold"
          }`}
        >
          <span>{isExpired ? "Perbarui Paket" : "Perpanjang Sekarang"}</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
