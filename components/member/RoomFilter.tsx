"use client";

import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { RoomCategory } from "@/lib/types/database";

interface RoomFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  capacityFilter: string;
  onCapacityChange: (cap: string) => void;
}

export function RoomFilter({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  capacityFilter,
  onCapacityChange,
}: RoomFilterProps) {
  const categories = [
    { id: "all", label: "Semua Kategori" },
    { id: "meeting_room", label: "Ruang Rapat" },
    { id: "private_office", label: "Studio / Kantor Privat" },
    { id: "event_space", label: "Aula Event" },
    { id: "hot_desk", label: "Focus Desk" },
  ];

  const capacities = [
    { id: "all", label: "Semua Kapasitas" },
    { id: "1-4", label: "1 – 4 Orang" },
    { id: "5-10", label: "5 – 10 Orang" },
    { id: "11-20", label: "11 – 20 Orang" },
    { id: "20+", label: "> 20 Orang" },
  ];

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari ruangan berdasarkan nama atau fasilitas..."
            className="w-full rounded-xl border border-white/20 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 outline-none transition focus:border-cyan-400 focus:bg-white/10"
          />
        </div>

        {/* Capacity dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={capacityFilter}
              onChange={(e) => onCapacityChange(e.target.value)}
              className="appearance-none rounded-xl border border-white/20 bg-slate-900/90 py-2.5 pl-4 pr-10 text-xs font-medium text-white outline-none focus:border-cyan-400"
            >
              {capacities.map((cap) => (
                <option key={cap.id} value={cap.id} className="bg-slate-900 text-white">
                  {cap.label}
                </option>
              ))}
            </select>
            <SlidersHorizontal size={14} className="pointer-events-none absolute right-3 top-3 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
        <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
          <Filter size={12} />
          <span>Kategori:</span>
        </span>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onCategoryChange(cat.id)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === cat.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-cyan-400/40"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
