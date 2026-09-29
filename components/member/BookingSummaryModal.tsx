"use client";

import { X, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import { Room, PaymentMethod } from "@/lib/types/database";

interface BookingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  room: Room;
  date: string;
  startHour: number;
  endHour: number;
  totalHours: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  isSubmitting?: boolean;
}

export function BookingSummaryModal({
  isOpen,
  onClose,
  onConfirm,
  room,
  date,
  startHour,
  endHour,
  totalHours,
  totalPrice,
  paymentMethod,
  isSubmitting,
}: BookingSummaryModalProps) {
  if (!isOpen) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const paymentLabels: Record<PaymentMethod, string> = {
    membership_quota: "Saldo Kuota Jam Membership (Gratis Langsung)",
    transfer_bank: "Transfer Bank Manual (BCA / Mandiri)",
    qris: "QRIS Statis (Instan)",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-slate-900/95 p-6 sm:p-8 shadow-2xl text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-blue-600/30 flex items-center justify-center text-cyan-300">
              <ShieldCheck size={18} />
            </div>
            <h3 className="text-base font-bold text-white">Konfirmasi Pemesanan Ruangan</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Details list */}
        <div className="mt-5 space-y-3.5 text-xs">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Ruangan:</span>
            <span className="font-bold text-white">{room.name}</span>
          </div>

          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Tanggal:</span>
            <span className="font-medium text-white">{date}</span>
          </div>

          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Waktu / Durasi:</span>
            <span className="font-medium text-cyan-300">
              {String(startHour).padStart(2, "0")}.00 – {String(endHour).padStart(2, "0")}.00 ({totalHours} Jam)
            </span>
          </div>

          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Tarif Dasar:</span>
            <span className="text-slate-300">{formatPrice(room.price_per_hour)} / jam</span>
          </div>

          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Metode Pembayaran:</span>
            <span className="font-semibold text-white">{paymentLabels[paymentMethod]}</span>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-2 text-sm font-bold bg-white/5 p-3 rounded-xl border border-white/10">
            <span className="text-slate-200">Total Pembayaran:</span>
            <span className="text-lg font-extrabold text-cyan-300">
              {paymentMethod === "membership_quota" ? "0 (Pakai Kuota)" : formatPrice(totalPrice)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
          >
            <span>{isSubmitting ? "Memproses..." : "Selesaikan Reservasi"}</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
