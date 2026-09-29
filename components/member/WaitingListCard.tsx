"use client";

import { Clock, Users, ArrowRight, XCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { WaitingList } from "@/lib/types/database";

interface WaitingListCardProps {
  waitlist: WaitingList;
  onClaim: (waitlist: WaitingList) => void;
  onCancel: (id: string) => void;
}

export function WaitingListCard({ waitlist, onClaim, onCancel }: WaitingListCardProps) {
  const { room, queue_number, status, desired_start_time, desired_end_time, id } = waitlist;

  const startDate = new Date(desired_start_time);
  const endDate = new Date(desired_end_time);

  const formattedDate = startDate.toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const formattedTime = `${String(startDate.getHours()).padStart(2, "0")}.00 – ${String(endDate.getHours()).padStart(2, "0")}.00 WIB`;

  const statusConfig: Record<string, { label: string; badge: string }> = {
    waiting: {
      label: "Dalam Antrean",
      badge: "border-blue-400/40 bg-blue-500/20 text-blue-200",
    },
    notified: {
      label: "Slot Tersedia! Segera Klaim",
      badge: "border-emerald-400/60 bg-emerald-500/25 text-emerald-200 animate-pulse",
    },
    claimed: {
      label: "Slot Berhasil Diklaim",
      badge: "border-cyan-400/40 bg-cyan-500/20 text-cyan-200",
    },
    expired: {
      label: "Batas Waktu Berakhir",
      badge: "border-slate-500/40 bg-slate-500/20 text-slate-400",
    },
    cancelled: {
      label: "Antrean Dibatalkan",
      badge: "border-rose-500/40 bg-rose-500/20 text-rose-300",
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.waiting;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <img
            src={room?.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80"}
            alt={room?.name || "Ruangan"}
            className="size-14 rounded-2xl object-cover border border-white/15"
          />
          <div>
            <h3 className="text-base font-bold text-white">{room?.name || "Ruangan Coworking"}</h3>
            <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <Users size={12} className="text-cyan-400" />
              <span>Kapasitas {room?.capacity || "-"} orang</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-xl border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-bold text-white">
            Nomor Antrean #{queue_number}
          </span>
          <span className={`rounded-xl border px-3 py-1 text-xs font-extrabold ${currentStatus.badge}`}>
            {currentStatus.label}
          </span>
        </div>
      </div>

      {/* Time and Slot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center gap-2">
          <Clock size={16} className="text-cyan-400 shrink-0" />
          <div>
            <p className="text-[10px] uppercase text-slate-400">Jadwal yang Dituju</p>
            <p className="text-white font-medium">{formattedDate}, {formattedTime}</p>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase text-slate-400">Mekanisme Notifikasi</p>
            <p className="text-white font-medium">FIFO (First-In, First-Out)</p>
          </div>
          {status === "notified" && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-300">
              <Sparkles size={13} />
              <span>Batas 30 Menit</span>
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex items-center justify-end gap-3">
        {status === "waiting" && (
          <button
            type="button"
            onClick={() => onCancel(id)}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-rose-500/20 hover:text-rose-200 transition"
          >
            <XCircle size={14} />
            <span>Batalkan Antrean</span>
          </button>
        )}

        {status === "notified" && (
          <button
            type="button"
            onClick={() => onClaim(waitlist)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-500/30 hover:from-emerald-500 hover:to-cyan-400 transition animate-bounce"
          >
            <Sparkles size={15} />
            <span>Klaim Slot Sekarang</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </article>
  );
}
