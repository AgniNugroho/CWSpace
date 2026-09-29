"use client";

import { DollarSign, PieChart, ArrowUpRight } from "lucide-react";

export function RevenueChart() {
  const streams = [
    {
      source: "Langganan Paket Membership",
      amount: 24600000,
      share: 52,
      color: "from-blue-600 to-cyan-500",
      pill: "bg-blue-500",
    },
    {
      source: "Sewa Ruangan Reguler (Hourly)",
      amount: 18250000,
      share: 39,
      color: "from-emerald-500 to-teal-400",
      pill: "bg-emerald-500",
    },
    {
      source: "Layanan Tambahan & Event",
      amount: 4350000,
      share: 9,
      color: "from-purple-500 to-indigo-400",
      pill: "bg-purple-500",
    },
  ];

  const totalRevenue = streams.reduce((acc, s) => acc + s.amount, 0);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <PieChart size={18} className="text-cyan-400" />
            <span>Distribusi Sumber Pendapatan (Revenue Streams)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Komposisi pemasukan bisnis dari membership vs sewa per jam
          </p>
        </div>
        <p className="text-sm font-black text-cyan-300">
          Total: {formatPrice(totalRevenue)}
        </p>
      </div>

      {/* Stacked Visual Bar */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded-full bg-slate-900 overflow-hidden flex border border-white/10">
          {streams.map((s) => (
            <div
              key={s.source}
              className={`h-full bg-gradient-to-r ${s.color} transition-all`}
              style={{ width: `${s.share}%` }}
              title={`${s.source}: ${s.share}%`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Stream Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {streams.map((s) => (
          <div key={s.source} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className={`size-2.5 rounded-full ${s.pill}`} />
              <span className="truncate">{s.source}</span>
            </div>
            <p className="text-base font-extrabold text-white">{formatPrice(s.amount)}</p>
            <p className="text-[11px] text-cyan-300 font-semibold">{s.share}% dari Total Omzet</p>
          </div>
        ))}
      </div>
    </div>
  );
}
