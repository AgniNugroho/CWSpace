"use client";

import { useEffect, useState } from "react";
import { PieChart } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface RevenueStream {
  source: string;
  amount: number;
  share: number;
  color: string;
  pill: string;
}

export function RevenueChart() {
  const [streams, setStreams] = useState<RevenueStream[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRevenue() {
      try {
        const supabase = createSupabaseBrowserClient();

        // Fetch verified or completed payments
        const { data: payments } = await supabase
          .from("payments")
          .select("amount, payment_type, status")
          .in("status", ["verified", "success", "pending"]);

        let membershipSum = 0;
        let reservationSum = 0;

        if (payments && payments.length > 0) {
          payments.forEach((p) => {
            const amt = Number(p.amount) || 0;
            if (p.payment_type === "membership") {
              membershipSum += amt;
            } else {
              reservationSum += amt;
            }
          });
        }

        const total = membershipSum + reservationSum;
        setTotalRevenue(total);

        const memShare = total > 0 ? Math.round((membershipSum / total) * 100) : 0;
        const resShare = total > 0 ? 100 - memShare : 0;

        setStreams([
          {
            source: "Langganan Paket Membership",
            amount: membershipSum,
            share: memShare,
            color: "from-blue-600 to-cyan-500",
            pill: "bg-blue-500",
          },
          {
            source: "Sewa Ruangan Reguler (Hourly)",
            amount: reservationSum,
            share: resShare,
            color: "from-emerald-500 to-teal-400",
            pill: "bg-emerald-500",
          },
        ]);
      } catch {
        setStreams([]);
        setTotalRevenue(0);
      } finally {
        setIsLoading(false);
      }
    }

    void loadRevenue();
  }, []);

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
            <span>Distribusi Sumber Pendapatan (Berdasarkan Database)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Komposisi pemasukan bisnis dari membership vs sewa per jam
          </p>
        </div>
        <p className="text-sm font-black text-cyan-300">
          Total: {formatPrice(totalRevenue)}
        </p>
      </div>

      {isLoading ? (
        <div className="h-16 animate-pulse rounded-xl bg-white/5" />
      ) : totalRevenue === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">
          Belum ada transaksi pembayaran di database untuk kalkulasi omzet.
        </p>
      ) : (
        <>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        </>
      )}
    </div>
  );
}
