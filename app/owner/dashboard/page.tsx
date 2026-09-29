"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  DollarSign, Users, DoorOpen, CalendarDays, 
  Sparkles, Shield, ArrowRight, LineChart 
} from "lucide-react";
import { MetricStatCard } from "@/components/owner/MetricStatCard";
import { OccupancyChart } from "@/components/owner/OccupancyChart";
import { RevenueChart } from "@/components/owner/RevenueChart";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function OwnerDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    activeRooms: 0,
    activeMembers: 0,
    totalReservations: 0,
    hoursBooked: 0,
    avgOccupancy: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOwnerMetrics() {
      try {
        const supabase = createSupabaseBrowserClient();

        // 1. Total Revenue from Payments
        const { data: payments } = await supabase
          .from("payments")
          .select("amount, status")
          .in("status", ["verified", "success", "pending"]);

        const revenueSum = (payments || []).reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

        // 2. Active Rooms
        const { count: roomsCount } = await supabase
          .from("rooms")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true);

        // 3. Active Members
        const { count: membersCount } = await supabase
          .from("user_memberships")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .gte("end_date", new Date().toISOString());

        // 4. Reservations & Booked Hours
        const { data: reservations } = await supabase
          .from("reservations")
          .select("total_hours, status");

        const totalRes = reservations?.length || 0;
        const totalHrs = (reservations || []).reduce((acc, r) => acc + (Number(r.total_hours) || 0), 0);

        const rCount = roomsCount || 1;
        const occupancyRate = Math.min(100, Math.round((totalHrs / (rCount * 200)) * 100));

        setMetrics({
          totalRevenue: revenueSum,
          activeRooms: roomsCount || 0,
          activeMembers: membersCount || 0,
          totalReservations: totalRes,
          hoursBooked: totalHrs,
          avgOccupancy: occupancyRate,
        });
      } catch {
        // Fallback to zeros
      } finally {
        setIsLoading(false);
      }
    }

    void loadOwnerMetrics();
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
      {/* Executive Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-emerald-950/40 via-slate-900/70 to-blue-950/40 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-300">
          <LineChart size={14} />
          <span>Dashboard Eksekutif & Analitik Bisnis Coworking</span>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Ringkasan Kinerja Bisnis CWSpace
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Metrik operasional dan omzet real-time yang dihitung langsung dari basis data Supabase.
            </p>
          </div>

          <Link
            href="/admin/dashboard"
            className="self-start md:self-auto flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition"
          >
            <Shield size={16} />
            <span>Akses Panel Operasional Admin</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricStatCard
          title="Total Omzet Tercatat"
          value={isLoading ? "Memuat..." : formatPrice(metrics.totalRevenue)}
          subtitle={metrics.totalRevenue > 0 ? "Akumulasi pembayaran terverifikasi" : "Belum ada transaksi pembayaran"}
          trend={metrics.totalRevenue > 0 ? "Aktif" : "0"}
          isPositive={metrics.totalRevenue > 0}
          icon={DollarSign}
        />

        <MetricStatCard
          title="Tingkat Okupansi Ruangan"
          value={isLoading ? "Memuat..." : `${metrics.avgOccupancy}%`}
          subtitle={`${metrics.hoursBooked} jam sewa dari ${metrics.activeRooms} ruangan aktif`}
          trend={metrics.hoursBooked > 0 ? `+${metrics.hoursBooked} jam` : "0 jam"}
          isPositive={metrics.avgOccupancy > 0}
          icon={DoorOpen}
        />

        <MetricStatCard
          title="Member Aktif Berlangganan"
          value={isLoading ? "Memuat..." : `${metrics.activeMembers} Member`}
          subtitle="Pelanggan dengan paket membership aktif"
          trend={`${metrics.activeMembers} aktif`}
          isPositive={metrics.activeMembers > 0}
          icon={Users}
        />

        <MetricStatCard
          title="Total Reservasi Berjalan"
          value={isLoading ? "Memuat..." : `${metrics.totalReservations} Reservasi`}
          subtitle="Seluruh pemesanan tercatat di sistem"
          trend={`${metrics.totalReservations} total`}
          isPositive={metrics.totalReservations > 0}
          icon={CalendarDays}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <OccupancyChart />
        <RevenueChart />
      </div>

      {/* Business Insights Callout */}
      <section className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="text-cyan-400" size={18} />
          <span>Evaluasi Dampak Fitur Bernilai Tambah Terhadap Bisnis (Skripsi)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1.5">
            <strong className="text-cyan-300 block">1. Rekomendasi Ruangan (SAW)</strong>
            <p className="text-slate-300 leading-relaxed">
              Membantu calon penyewa menentukan ruangan yang paling tepat berdasarkan multi-kriteria secara otomatis.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1.5">
            <strong className="text-amber-300 block">2. Pengingat Membership</strong>
            <p className="text-slate-300 leading-relaxed">
              Memantau kuota jam dan memberi peringatan saat masa berlaku tersisa ≤ 7 hari untuk memicu perpanjangan tepat waktu.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1.5">
            <strong className="text-purple-300 block">3. Waiting List Otomatis</strong>
            <p className="text-slate-300 leading-relaxed">
              Mengalokasikan kembali slot yang dibatalkan kepada antrean berikutnya (FIFO) dengan batas klaim 30 menit.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
