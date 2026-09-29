"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  DollarSign, Users, DoorOpen, TrendingUp, 
  Sparkles, Shield, ArrowRight, LineChart 
} from "lucide-react";
import { MetricStatCard } from "@/components/owner/MetricStatCard";
import { OccupancyChart } from "@/components/owner/OccupancyChart";
import { RevenueChart } from "@/components/owner/RevenueChart";

export default function OwnerDashboardPage() {
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
              Pantau tingkat keterisian ruangan, pergerakan omzet pendapatan, dan efektivitas fitur bernilai tambah terhadap pertumbuhan bisnis.
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
          title="Total Omzet Bulan Ini"
          value="Rp 47.200.000"
          subtitle="Target bulanan Rp 45.000.000 tercapai"
          trend="+18.4%"
          isPositive={true}
          icon={DollarSign}
        />

        <MetricStatCard
          title="Tingkat Okupansi Ruangan"
          value="69.8%"
          subtitle="838 jam sewa terealisasi"
          trend="+6.2%"
          isPositive={true}
          icon={DoorOpen}
        />

        <MetricStatCard
          title="Member Aktif Berlangganan"
          value="48 Member"
          subtitle="36 Pro, 8 VIP, 4 Starter"
          trend="+12 member"
          isPositive={true}
          icon={Users}
        />

        <MetricStatCard
          title="Rasio Perpanjangan (Renewal Rate)"
          value="84.5%"
          subtitle="Terdorong reminder membership ≤ 7 hari"
          trend="+9.1%"
          isPositive={true}
          icon={TrendingUp}
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
              Mempersingkat waktu pemilihan ruangan dari rata-rata 12 menit menjadi di bawah 2 menit, serta menaikkan konversi reservasi sebesar 28%.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1.5">
            <strong className="text-amber-300 block">2. Pengingat Membership</strong>
            <p className="text-slate-300 leading-relaxed">
              Peringatan sisa hari $\le 7$ hari berhasil memicu retensi pelanggan secara proaktif sehingga rasio perpanjangan mencapai 84.5%.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1.5">
            <strong className="text-purple-300 block">3. Waiting List Otomatis</strong>
            <p className="text-slate-300 leading-relaxed">
              Mengurangi slot kosong akibat pembatalan mendadak hingga 72%, mempertahankan potensi pendapatan dari ruangan yang penuh.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
