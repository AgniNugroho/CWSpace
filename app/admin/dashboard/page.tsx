"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  DoorOpen, CalendarDays, CreditCard, Clock, 
  ArrowRight, ShieldCheck, AlertCircle, CheckCircle2 
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { INITIAL_ROOMS } from "@/lib/data/initial-rooms";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    activeRooms: 6,
    todayBookings: 3,
    pendingPayments: 2,
    activeWaitlists: 1,
  });

  const [recentReservations, setRecentReservations] = useState<any[]>([]);

  useEffect(() => {
    async function loadStats() {
      try {
        const supabase = createSupabaseBrowserClient();

        // 1. Rooms count
        const { count: roomsCount } = await supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // 2. Pending payments count
        const { count: pendingCount } = await supabase
          .from("payments")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // 3. Active waitlist count
        const { count: waitlistCount } = await supabase
          .from("waiting_lists")
          .select("*", { count: "exact", head: true })
          .in("status", ["waiting", "notified"]);

        // 4. Recent reservations
        const { data: resData } = await supabase
          .from("reservations")
          .select(`
            id, start_time, end_time, total_price, payment_method, status,
            rooms(name), profiles(full_name)
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        setStats({
          activeRooms: roomsCount ?? 6,
          todayBookings: resData?.length ?? 3,
          pendingPayments: pendingCount ?? 2,
          activeWaitlists: waitlistCount ?? 1,
        });

        if (resData && resData.length > 0) {
          setRecentReservations(resData);
        } else {
          // Demo fallback
          setRecentReservations([
            {
              id: "res-demo-1",
              start_time: `${new Date().toISOString().split("T")[0]}T14:00:00Z`,
              end_time: `${new Date().toISOString().split("T")[0]}T16:00:00Z`,
              total_price: 200000,
              payment_method: "transfer_bank",
              status: "menunggu_verifikasi",
              rooms: { name: "Meeting Room Alpha" },
              profiles: { full_name: "Ahmad Fauzi" },
            },
            {
              id: "res-demo-2",
              start_time: `${new Date().toISOString().split("T")[0]}T10:00:00Z`,
              end_time: `${new Date().toISOString().split("T")[0]}T12:00:00Z`,
              total_price: 360000,
              payment_method: "membership_quota",
              status: "dikonfirmasi",
              rooms: { name: "Creative Suite Beta" },
              profiles: { full_name: "Siti Rahma" },
            },
          ]);
        }
      } catch {
        // Fallback
      }
    }

    void loadStats();
  }, []);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="rounded-3xl border border-white/20 bg-gradient-to-r from-amber-950/40 via-slate-900/60 to-blue-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Ringkasan Operasional Coworking Space
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300">
          Kelola data ruangan, pantau jadwal reservasi anti-bentrok, verifikasi bukti pembayaran, dan monitor antrean waiting list.
        </p>
      </section>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Rooms */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Ruangan Aktif</span>
            <DoorOpen size={18} className="text-cyan-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats.activeRooms}</p>
          <Link href="/admin/ruangan" className="text-[11px] text-cyan-300 hover:underline flex items-center gap-1 pt-1">
            <span>Kelola Ruangan</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Bookings Today */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pemesanan Hari Ini</span>
            <CalendarDays size={18} className="text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats.todayBookings}</p>
          <Link href="/admin/reservasi" className="text-[11px] text-blue-300 hover:underline flex items-center gap-1 pt-1">
            <span>Lihat Kalender Jadwal</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Pending Payments */}
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-semibold">Verifikasi Pembayaran</span>
            <CreditCard size={18} />
          </div>
          <p className="text-3xl font-black text-amber-200">{stats.pendingPayments}</p>
          <Link href="/admin/pembayaran" className="text-[11px] text-amber-300 hover:underline flex items-center gap-1 pt-1 font-semibold">
            <span>Periksa Bukti Bayar</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Active Waitlists */}
        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Antrean Waiting List</span>
            <Clock size={18} className="text-purple-400" />
          </div>
          <p className="text-3xl font-black text-white">{stats.activeWaitlists}</p>
          <Link href="/admin/waiting-list" className="text-[11px] text-purple-300 hover:underline flex items-center gap-1 pt-1">
            <span>Monitor Antrean</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <section className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarDays className="text-cyan-400" size={18} />
              <span>Aktivitas Reservasi Terbaru</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Daftar pemesanan ruangan terbaru dari member</p>
          </div>
          <Link
            href="/admin/reservasi"
            className="text-xs font-semibold text-cyan-300 hover:underline flex items-center gap-1"
          >
            <span>Semua Reservasi</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 bg-white/5">
              <tr>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Ruangan</th>
                <th className="py-3 px-4">Jadwal Waktu</th>
                <th className="py-3 px-4">Metode Bayar</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentReservations.map((res) => {
                const startH = new Date(res.start_time).getHours();
                const endH = new Date(res.end_time).getHours();
                return (
                  <tr key={res.id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-semibold text-white">
                      {res.profiles?.full_name || "Pelanggan"}
                    </td>
                    <td className="py-3 px-4 text-cyan-300 font-medium">
                      {res.rooms?.name || "Ruangan"}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(res.start_time).toLocaleDateString("id-ID", { day: "numeric", month: "short" })},{" "}
                      {String(startH).padStart(2, "0")}.00 - {String(endH).padStart(2, "0")}.00
                    </td>
                    <td className="py-3 px-4 uppercase text-[10px] text-slate-400">
                      {res.payment_method.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {res.payment_method === "membership_quota" ? "0 (Kuota)" : formatPrice(res.total_price)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                        res.status === "dikonfirmasi"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : res.status === "menunggu_verifikasi"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-slate-500/20 text-slate-300"
                      }`}>
                        {res.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
