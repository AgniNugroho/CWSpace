"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle2, XCircle, Eye, AlertCircle, ShieldCheck, X } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [selectedProof, setSelectedProof] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPayments() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("payments")
          .select(`
            id, user_id, reservation_id, user_membership_id, amount, payment_type, payment_method, proof_image_url, status, created_at,
            profiles:user_id(full_name, phone),
            reservations(rooms(name))
          `)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setPayments(data);
        } else {
          setPayments([]);
        }
      } catch {
        setPayments([]);
      } finally {
        setIsLoading(false);
      }
    }

    void loadPayments();
  }, []);

  const handleApprove = async (payment: any) => {
    try {
      const supabase = createSupabaseBrowserClient();

      // 1. Update payment status to verified
      await supabase
        .from("payments")
        .update({ status: "verified", verified_at: new Date().toISOString() })
        .eq("id", payment.id);

      // 2. If for reservation, update reservation status to dikonfirmasi
      if (payment.reservation_id) {
        await supabase
          .from("reservations")
          .update({ status: "dikonfirmasi" })
          .eq("id", payment.reservation_id);
      }

      // 3. If for user_membership, activate membership
      if (payment.user_membership_id) {
        await supabase
          .from("user_memberships")
          .update({ status: "active" })
          .eq("id", payment.user_membership_id);
      }

      setPayments(payments.map((p) => (p.id === payment.id ? { ...p, status: "verified" } : p)));
      setSelectedProof(null);
    } catch {
      setPayments(payments.map((p) => (p.id === payment.id ? { ...p, status: "verified" } : p)));
      setSelectedProof(null);
    }
  };

  const handleReject = async (payment: any) => {
    try {
      const supabase = createSupabaseBrowserClient();

      // 1. Update payment to rejected
      await supabase
        .from("payments")
        .update({ 
          status: "rejected", 
          rejection_reason: rejectionReason || "Bukti transfer tidak valid atau dana belum masuk rekening." 
        })
        .eq("id", payment.id);

      // 2. Cancel reservation and trigger waiting list
      if (payment.reservation_id) {
        await supabase
          .from("reservations")
          .update({ status: "dibatalkan" })
          .eq("id", payment.reservation_id);
      }

      setPayments(payments.map((p) => (p.id === payment.id ? { ...p, status: "rejected" } : p)));
      setSelectedProof(null);
      setRejectionReason("");
    } catch {
      setPayments(payments.map((p) => (p.id === payment.id ? { ...p, status: "rejected" } : p)));
      setSelectedProof(null);
      setRejectionReason("");
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="text-amber-400" size={24} />
          <span>Verifikasi Pembayaran & Bukti Transfer</span>
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Periksa kecocokan bukti bayar transfer bank manual / QRIS untuk mengonfirmasi reservasi ruangan dan aktivasi membership.
        </p>
      </div>

      {/* Payments Table */}
      <div className="rounded-3xl border border-white/20 bg-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 bg-white/5">
              <tr>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Tipe Pembayaran</th>
                <th className="py-3.5 px-4">Metode</th>
                <th className="py-3.5 px-4">Jumlah Tagihan</th>
                <th className="py-3.5 px-4">Bukti Transfer</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                    Belum ada data pembayaran di database.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                <tr key={p.id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 px-4">
                    <strong className="text-white block">{p.profiles?.full_name || "Pelanggan"}</strong>
                    <span className="text-[11px] text-slate-400">{p.profiles?.phone || "-"}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-lg bg-blue-500/20 px-2.5 py-0.5 text-[10px] font-bold text-blue-200 uppercase">
                      {p.payment_type}
                    </span>
                    {p.reservations?.rooms?.name && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.reservations.rooms.name}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-200">
                    {p.payment_method.replace("_", " ").toUpperCase()}
                  </td>
                  <td className="py-3.5 px-4 font-black text-cyan-300 text-sm">
                    {formatPrice(p.amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => setSelectedProof(p)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-cyan-300 hover:bg-white/15"
                    >
                      <Eye size={13} />
                      <span>Lihat Bukti</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-[10px] font-bold ${
                      p.status === "verified"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : p.status === "rejected"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}>
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {p.status === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(p)}
                          className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-md"
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedProof(p)}
                          className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proof Preview & Verification Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-slate-900/95 p-6 sm:p-8 shadow-2xl text-white space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">Pemeriksaan Bukti Pembayaran</h3>
              <button
                type="button"
                onClick={() => setSelectedProof(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Pelanggan:</span>
                <strong className="text-white">{selectedProof.profiles?.full_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Tagihan:</span>
                <strong className="text-cyan-300 text-sm">{formatPrice(selectedProof.amount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Metode:</span>
                <span className="text-white uppercase font-medium">{selectedProof.payment_method}</span>
              </div>
            </div>

            {/* Proof Image */}
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-slate-950 aspect-video flex items-center justify-center">
              <img
                src={selectedProof.proof_image_url}
                alt="Bukti Transfer"
                className="size-full object-contain"
              />
            </div>

            {/* Rejection input */}
            <div className="space-y-1 text-xs">
              <label className="text-slate-300">Alasan Penolakan (Hanya diisi jika menolak)</label>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Contoh: Bukti transfer tidak jelas atau nominal tidak cocok."
                className="w-full rounded-xl border border-white/20 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-rose-400"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleReject(selectedProof)}
                className="rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition"
              >
                Tolak Pembayaran
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedProof)}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition"
              >
                Setujui & Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
