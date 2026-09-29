"use client";

import { useEffect, useState } from "react";
import { DoorOpen } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface RoomOccupancy {
  name: string;
  category: string;
  occupancyRate: number; // 0 - 100
  hoursBooked: number;
}

export function OccupancyChart() {
  const [occupancyData, setOccupancyData] = useState<RoomOccupancy[]>([]);
  const [averageRate, setAverageRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadOccupancy() {
      try {
        const supabase = createSupabaseBrowserClient();

        // 1. Fetch active rooms
        const { data: rooms } = await supabase
          .from("rooms")
          .select("id, name, category")
          .eq("is_active", true)
          .order("name", { ascending: true });

        // 2. Fetch all confirmed or completed reservations
        const { data: reservations } = await supabase
          .from("reservations")
          .select("room_id, total_hours, status")
          .in("status", ["dikonfirmasi", "selesai", "confirmed", "completed"]);

        if (rooms && rooms.length > 0) {
          const MONTHLY_MAX_HOURS = 200; // Capacity benchmark per room per month

          const calculated: RoomOccupancy[] = rooms.map((r) => {
            const roomRes = (reservations || []).filter((res) => res.room_id === r.id);
            const hoursBooked = roomRes.reduce((sum, res) => sum + (Number(res.total_hours) || 0), 0);
            const rate = Math.min(100, Math.round((hoursBooked / MONTHLY_MAX_HOURS) * 100));

            return {
              name: r.name,
              category: r.category,
              hoursBooked,
              occupancyRate: rate,
            };
          });

          setOccupancyData(calculated);
          const totalHours = calculated.reduce((acc, c) => acc + c.hoursBooked, 0);
          const avg = calculated.length > 0 ? Math.round((totalHours / (calculated.length * MONTHLY_MAX_HOURS)) * 1000) / 10 : 0;
          setAverageRate(avg);
        } else {
          setOccupancyData([]);
          setAverageRate(0);
        }
      } catch {
        setOccupancyData([]);
        setAverageRate(0);
      } finally {
        setIsLoading(false);
      }
    }

    void loadOccupancy();
  }, []);

  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <DoorOpen size={18} className="text-cyan-400" />
            <span>Tingkat Okupansi Ruangan (Berdasarkan Database)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Persentase jam terpakai terhadap kapasitas total 200 jam/bulan
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
          Rata-rata {averageRate}%
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : occupancyData.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">
          Belum ada data ruangan di database untuk kalkulasi okupansi.
        </p>
      ) : (
        <div className="space-y-4">
          {occupancyData.map((item) => (
            <div key={item.name} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{item.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 text-[11px]">{item.hoursBooked} Jam Terpakai</span>
                  <span className="font-black text-cyan-300 w-12 text-right">{item.occupancyRate}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden border border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    item.occupancyRate >= 80
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                      : item.occupancyRate >= 60
                      ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                      : "bg-gradient-to-r from-amber-500 to-yellow-400"
                  }`}
                  style={{ width: `${Math.max(item.occupancyRate, 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
