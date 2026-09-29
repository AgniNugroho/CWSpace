"use client";

import { Calendar, Clock, CreditCard, ShieldCheck, XCircle, CheckCircle2 } from "lucide-react";
import { Reservation, ReservationStatus } from "@/lib/types/database";

interface ReservationHistoryCardProps {
  reservation: Reservation;
  onCancel: (id: string) => void;
}

export function ReservationHistoryCard({
  reservation,
  onCancel,
}: ReservationHistoryCardProps) {
  const { id, room, start_time, end_time, total_hours, total_price, payment_method, status, notes } = reservation;

  const startDate = new Date(start_time);
  const endDate = new Date(end_time);

  const formattedDate = startDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = `${String(startDate.getHours()).padStart(2, "0")}.00 – ${String(endDate.getHours()).padStart(2, "0")}.00 WIB`;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const statusConfig: Record<ReservationStatus, { label: string; badge: string; icon: any }> = {
    menunggu_pembayaran: {
      label: "Menunggu Pembayaran",
      badge: "border-amber-400/40 bg-amber-500/20 text-amber-300",
      icon: Clock,
    },
    menunggu_verifikasi: {
      label: "Menunggu Verifikasi Admin",
      badge: "border-blue-400/40 bg-blue-500/20 text-blue-200",
      icon: Clock,
    },
    dikonfirmasi: {
      label: "Terkonfirmasi & Siap Pakai",
      badge: "border-emerald-400/50 bg-emerald-500/25 text-emerald-300",
      icon: CheckCircle2,
    },
    selesai: {
      label: "Selesai",
      badge: "border-slate-500/40 bg-slate-500/20 text-slate-300",
      icon: CheckCircle2,
    },
    dibatalkan: {
      label: "Dibatalkan",
      badge: "border-rose-500/40 bg-rose-500/20 text-rose-300",
      icon: XCircle,
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.menunggu_verifikasi;
  const StatusIcon = currentStatus.icon;

  const paymentLabels: Record<string, string> = {
    membership_quota: "Saldo Kuota Membership",
    transfer_bank: "Transfer Bank BCA",
    qris: "QRIS Statis",
  };

  const canCancel = status === "menunggu_verifikasi" || status === "dikonfirmasi" || status === "menunggu_pembayaran";

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <img
            src={room?.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80"}
            alt={room?.name || "Ruangan"}
            className="size-14 rounded-2xl object-cover border border-white/15"
          />
          <div>
            <h3 className="text-base font-bold text-white">{room?.name || "Ruang Coworking"}</h3>
            <span className="text-xs text-slate-400">Kode Booking: #{id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>

        <span className={`self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold ${currentStatus.badge}`}>
          <StatusIcon size={14} />
          <span>{currentStatus.label}</span>
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Calendar size={12} className="text-cyan-400" />
            <span>Hari & Tanggal</span>
          </span>
          <p className="font-semibold text-white">{formattedDate}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock size={12} className="text-cyan-400" />
            <span>Waktu ({total_hours} Jam)</span>
          </span>
          <p className="font-semibold text-cyan-300">{formattedTime}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 space-y-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <CreditCard size={12} className="text-cyan-400" />
            <span>Pembayaran & Total</span>
          </span>
          <p className="font-semibold text-white">
            {payment_method === "membership_quota" ? "0 (Kuota Jam)" : formatPrice(total_price)}
          </p>
          <p className="text-[10px] text-slate-400">{paymentLabels[payment_method] || payment_method}</p>
        </div>
      </div>

      {notes && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
          <strong className="text-white">Catatan:</strong> {notes}
        </div>
      )}

      {/* Footer & Cancellation trigger */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/10">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-cyan-400" />
          <span>Jadwal terverifikasi anti-bentrok</span>
        </div>

        {canCancel && (
          <button
            type="button"
            onClick={() => onCancel(id)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 hover:text-white transition"
          >
            <XCircle size={14} />
            <span>Batalkan Pemesanan</span>
          </button>
        )}
      </div>
    </article>
  );
}
