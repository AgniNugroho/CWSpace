"use client";

import { useState } from "react";
import { Users, CheckSquare, DollarSign, Briefcase, Sparkles, Sliders } from "lucide-react";
import { UserPreferences } from "@/lib/types/database";

interface SawRecommendationFormProps {
  onSubmit: (prefs: UserPreferences) => void;
  isLoading?: boolean;
}

export function SawRecommendationForm({ onSubmit, isLoading }: SawRecommendationFormProps) {
  const [attendees, setAttendees] = useState<number>(6);
  const [requiredFacilities, setRequiredFacilities] = useState<string[]>([
    "Smart TV & Video Conf",
    "Whiteboard Glass",
    "High-Speed Wi-Fi 100Mbps",
  ]);
  const [maxBudget, setMaxBudget] = useState<number>(250000);
  const [activityType, setActivityType] = useState<UserPreferences["activityType"]>("meeting");

  const availableFacilities = [
    "Proyektor HD",
    "Smart TV & Video Conf",
    "Whiteboard Glass",
    "High-Speed Wi-Fi 100Mbps",
    "Sound System & Mic",
    "Free Flow Coffee & Tea",
    "AC & Air Purifier",
    "Ergonomic Chairs",
  ];

  const activities = [
    { id: "meeting", label: "Rapat Tim / Meeting", desc: "Diskusi & presentasi" },
    { id: "workshop", label: "Workshop / Seminar", desc: "Pelatihan & aula luas" },
    { id: "podcast", label: "Podcast & Konten", desc: "Studio audio kedap suara" },
    { id: "focus", label: "Fokus Kerja", desc: "Pod privat & hening" },
  ];

  const toggleFacility = (fac: string) => {
    if (requiredFacilities.includes(fac)) {
      setRequiredFacilities(requiredFacilities.filter((f) => f !== fac));
    } else {
      setRequiredFacilities([...requiredFacilities, fac]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      attendees,
      requiredFacilities,
      maxBudgetPerHour: maxBudget,
      activityType,
    });
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-7">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Sliders className="text-cyan-400" size={20} />
          <span>Kriteria Kebutuhan Anda</span>
        </h2>
        <p className="text-xs text-slate-300 mt-1">
          Sistem akan menghitung nilai normalisasi dan bobot SAW untuk menghasilkan ranking ruangan paling optimal.
        </p>
      </div>

      {/* 1. Attendees Count */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Users size={15} className="text-cyan-400" />
            <span>Jumlah Orang yang Hadir (Kriteria Kapasitas - 30%)</span>
          </span>
          <span className="text-cyan-300 font-bold text-sm">{attendees} Orang</span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={60}
            value={attendees}
            onChange={(e) => setAttendees(Number(e.target.value))}
            className="w-full h-2 rounded-lg bg-slate-800 accent-cyan-400 cursor-pointer"
          />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {[2, 4, 6, 10, 15, 25, 50].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAttendees(preset)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                attendees === preset
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
              }`}
            >
              {preset} Orang
            </button>
          ))}
        </div>
      </div>

      {/* 2. Activity Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <Briefcase size={15} className="text-cyan-400" />
          <span>Jenis Kegiatan (Kriteria Kategori - 15%)</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {activities.map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => setActivityType(act.id as any)}
              className={`flex flex-col items-start p-3 rounded-xl border text-left transition ${
                activityType === act.id
                  ? "border-cyan-400 bg-blue-600/30 text-white shadow-md shadow-blue-500/20"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              <span className="text-xs font-bold text-white">{act.label}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">{act.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Budget per Hour */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <DollarSign size={15} className="text-cyan-400" />
            <span>Anggaran Maksimal / Jam (Kriteria Biaya - 25%)</span>
          </span>
          <span className="text-cyan-300 font-bold text-sm">{formatPrice(maxBudget)}</span>
        </label>
        <input
          type="range"
          min={25000}
          max={1000000}
          step={25000}
          value={maxBudget}
          onChange={(e) => setMaxBudget(Number(e.target.value))}
          className="w-full h-2 rounded-lg bg-slate-800 accent-cyan-400 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Rp 25.000</span>
          <span>Rp 500.000</span>
          <span>Rp 1.000.000+</span>
        </div>
      </div>

      {/* 4. Facilities Checklist */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckSquare size={15} className="text-cyan-400" />
            <span>Fasilitas yang Diperlukan (Kriteria Fasilitas - 30%)</span>
          </span>
          <span className="text-xs text-slate-400 font-normal">
            {requiredFacilities.length} dipilih
          </span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {availableFacilities.map((fac) => {
            const isChecked = requiredFacilities.includes(fac);
            return (
              <button
                key={fac}
                type="button"
                onClick={() => toggleFacility(fac)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left transition ${
                  isChecked
                    ? "border-cyan-400/60 bg-cyan-500/15 text-white font-medium"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <div className={`size-4 rounded flex items-center justify-center border ${
                  isChecked ? "bg-cyan-500 border-cyan-400 text-slate-950 font-bold" : "border-white/30"
                }`}>
                  {isChecked && "✓"}
                </div>
                <span className="truncate">{fac}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 px-6 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition hover:from-blue-500 hover:to-cyan-400 hover:scale-[1.01] disabled:opacity-50"
      >
        <Sparkles size={18} />
        <span>{isLoading ? "Menghitung Matriks SAW..." : "Hitung Rekomendasi SAW"}</span>
      </button>
    </form>
  );
}
