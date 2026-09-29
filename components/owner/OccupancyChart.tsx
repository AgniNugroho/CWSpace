"use client";

import { DoorOpen, TrendingUp } from "lucide-react";

interface RoomOccupancy {
  name: string;
  category: string;
  occupancyRate: number; // 0 - 100
  hoursBooked: number;
}

const SAMPLE_OCCUPANCY: RoomOccupancy[] = [
  { name: "Meeting Room Alpha", category: "Meeting", occupancyRate: 78, hoursBooked: 156 },
  { name: "Creative Suite Beta", category: "Meeting", occupancyRate: 64, hoursBooked: 128 },
  { name: "Executive Boardroom", category: "Meeting", occupancyRate: 82, hoursBooked: 164 },
  { name: "Podcast & Creator Studio", category: "Studio", occupancyRate: 58, hoursBooked: 116 },
  { name: "Event & Workshop Hall", category: "Event", occupancyRate: 46, hoursBooked: 92 },
  { name: "Dedicated Focus Pod", category: "Hot Desk", occupancyRate: 91, hoursBooked: 182 },
];

export function OccupancyChart() {
  return (
    <div className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-7 backdrop-blur-xl shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <DoorOpen size={18} className="text-cyan-400" />
            <span>Tingkat Okupansi Ruangan (Bulan Berjalan)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Persentase jam terpakai terhadap kapasitas total 200 jam/bulan
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
          Rata-rata 69.8%
        </span>
      </div>

      <div className="space-y-4">
        {SAMPLE_OCCUPANCY.map((item) => (
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
                style={{ width: `${item.occupancyRate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
