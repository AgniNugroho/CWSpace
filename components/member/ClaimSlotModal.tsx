"use client";

import { useEffect, useState } from "react";
import { X, Clock, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { WaitingList } from "@/lib/types/database";

interface ClaimSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClaim: () => void;
  waitlist: WaitingList;
}

export function ClaimSlotModal({
  isOpen,
  onClose,
  onConfirmClaim,
  waitlist,
}: ClaimSlotModalProps) {
  const [minutesLeft, setMinutesLeft] = useState(30);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const deadline = waitlist.claim_deadline
      ? new Date(waitlist.claim_deadline).getTime()
      : Date.now() + 30 * 60 * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((deadline - now) / 1000));
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setMinutesLeft(m);
      setSecondsLeft(s);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, waitlist]);

  if (!isOpen) return null;

  const startDate = new Date(waitlist.desired_start_time);
  const endDate = new Date(waitlist.desired_end_time);

  const formattedDate = startDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const formattedTime = `${String(startDate.getHours()).padStart(2, "0")}.00 – ${String(endDate.getHours()).padStart(2, "0")}.00 WIB`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-400/50 bg-slate-900/95 p-6 sm:p-8 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
              <Sparkles size={18} />
            </span>
            <h3 className="text-base font-bold text-white">Klaim Slot Waiting List</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Room & Slot details */}
        <div className="mt-5 space-y-4 text-xs">
          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300">Ruangan:</span>
              <strong className="text-white text-sm">{waitlist.room?.name || "Ruangan"}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Hari & Tanggal:</span>
              <span className="text-white font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Waktu Slot:</span>
              <span className="text-cyan-300 font-bold">{formattedTime}</span>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/15 p-4 text-center space-y-1">
            <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold flex items-center justify-center gap-1">
              <Clock size={14} />
              <span>Batas Waktu Klaim Tersisa</span>
            </span>
            <p className="text-3xl font-black text-amber-200 tracking-wider">
              {String(minutesLeft).padStart(2, "0")}:{String(secondsLeft).padStart(2, "0")}
            </p>
            <p className="text-[10px] text-slate-300">
              Jika tidak diklaim dalam batas waktu, slot akan otomatis diteruskan ke nomor antrean berikutnya.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
          >
            Nanti Dulu
          </button>

          <button
            type="button"
            onClick={onConfirmClaim}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:from-blue-500 hover:to-cyan-400 transition"
          >
            <span>Klaim & Lanjut Reservasi</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
