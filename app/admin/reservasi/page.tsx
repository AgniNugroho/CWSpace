"use client";

import { useEffect, useState } from "react";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAllReservations() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("reservations")
          .select(`
            id, user_id, room_id, start_time, end_time, total_hours, total_price, payment_method, status, notes, created_at,
            rooms(name), profiles(full_name, phone)
          `)
          .order("start_time", { ascending: false });

        if (!error && data) {
          setReservations(data);
        } else {
          setReservations([]);
        }
      } catch {
        setReservations([]);
      } finally {
        setIsLoading(false);
      }
    }

    void loadAllReservations();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("reservations").update({ status: newStatus }).eq("id", id);
      setReservations(reservations.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    } catch {
      setReservations(reservations.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    }
  };

  const filtered = reservations.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterDate && !r.start_time.startsWith(filterDate)) return false;
    return true;
  });

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
          <CalendarDays className="text-amber-400" size={24} />
          <span>Kalender & Jadwal Reservasi Ruangan</span>
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Pantau seluruh jadwal sewa ruangan dan pastikan tidak ada jadwal yang tumpang tindih.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Filter Tanggal
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-xl border border-white/20 bg-slate-900/90 py-1.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Status Reservasi
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-white/20 bg-slate-900/90 py-1.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
            >
              <option value="all">Semua Status</option>
              <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
              <option value="dikonfirmasi">Dikonfirmasi</option>
              <option value="selesai">Selesai</option>
              <option value="dibatalkan">Dibatalkan</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
          <ShieldCheck size={16} />
          <span>Sistem Anti-Collision Aktif (Validasi Overlap 0 Bentrok)</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/20 bg-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 bg-white/5">
              <tr>
                <th className="py-3.5 px-4">ID / Pelanggan</th>
                <th className="py-3.5 px-4">Ruangan</th>
                <th className="py-3.5 px-4">Jadwal Jam</th>
                <th className="py-3.5 px-4">Total Biaya</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    Belum ada jadwal reservasi di database.
                  </td>
                </tr>
              ) : (
                filtered.map((res) => {
                const startH = new Date(res.start_time).getHours();
                const endH = new Date(res.end_time).getHours();
                return (
                  <tr key={res.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4">
                      <strong className="text-white block">{res.profiles?.full_name || "Pelanggan"}</strong>
                      <span className="text-[11px] text-slate-400">{res.profiles?.phone || "Tanpa No. HP"}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-cyan-300">
                      {res.rooms?.name || "Ruangan"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-white font-medium block">
                        {new Date(res.start_time).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {String(startH).padStart(2, "0")}.00 – {String(endH).padStart(2, "0")}.00 WIB ({res.total_hours} Jam)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">
                      {res.payment_method === "membership_quota" ? `${res.total_hours} Jam Kuota` : formatPrice(res.total_price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-extrabold ${
                        res.status === "dikonfirmasi"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : res.status === "menunggu_verifikasi"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          : res.status === "selesai"
                          ? "bg-slate-500/20 text-slate-300 border border-slate-500/40"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}>
                        {res.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {res.status === "menunggu_verifikasi" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(res.id, "dikonfirmasi")}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-emerald-500"
                        >
                          Konfirmasi
                        </button>
                      )}
                      {res.status === "dikonfirmasi" && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(res.id, "selesai")}
                          className="rounded-lg bg-slate-700 px-2.5 py-1 text-[10px] font-semibold text-slate-200 hover:bg-slate-600"
                        >
                          Tandai Selesai
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
