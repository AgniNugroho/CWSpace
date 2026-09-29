"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, Building2, CreditCard, CalendarDays } from "lucide-react";
import { Room } from "@/lib/types/database";
import { RoomCard } from "@/components/member/RoomCard";
import { RoomFilter } from "@/components/member/RoomFilter";

interface MemberCatalogViewProps {
  userEmail: string;
  rooms: Room[];
}

export function MemberCatalogView({ userEmail, rooms }: MemberCatalogViewProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [capacity, setCapacity] = useState("all");

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      // Search query
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = r.name.toLowerCase().includes(query);
        const matchDesc = r.description?.toLowerCase().includes(query);
        const matchFac = (r.facilities || []).some((f) => f.name.toLowerCase().includes(query));
        if (!matchName && !matchDesc && !matchFac) return false;
      }

      // Category filter
      if (category !== "all" && r.category !== category) {
        return false;
      }

      // Capacity filter
      if (capacity === "1-4" && (r.capacity < 1 || r.capacity > 4)) return false;
      if (capacity === "5-10" && (r.capacity < 5 || r.capacity > 10)) return false;
      if (capacity === "11-20" && (r.capacity < 11 || r.capacity > 20)) return false;
      if (capacity === "20+" && r.capacity <= 20) return false;

      return true;
    });
  }, [rooms, search, category, capacity]);

  return (
    <div className="space-y-8">
      {/* Member Compact Header & Quick Shortcuts (No bulky Hero section) */}
      <section className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Portal Aktif Member</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Selamat Datang,{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              {userEmail.split("@")[0]}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Pilih dan reservasi ruangan untuk aktivitas Anda hari ini, atau gunakan rekomendasi cerdas SAW.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/rekomendasi"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-500 transition"
          >
            <Sparkles size={14} />
            <span>Rekomendasi SAW</span>
          </Link>

          <Link
            href="/riwayat"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
          >
            <CalendarDays size={14} className="text-cyan-300" />
            <span>Riwayat Saya</span>
          </Link>

          <Link
            href="/membership"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition"
          >
            <CreditCard size={14} className="text-amber-300" />
            <span>Paket Membership</span>
          </Link>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="text-cyan-400" size={24} />
              <span>Daftar Ruangan Tersedia</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gunakan filter untuk mempersempit kategori dan kapasitas ruang kerja.
            </p>
          </div>
          <span className="text-xs text-cyan-300 font-semibold bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 self-start">
            {filteredRooms.length} Ruangan Ditemukan
          </span>
        </div>

        {/* Filter component */}
        <RoomFilter
          search={search}
          onSearchChange={setSearch}
          selectedCategory={category}
          onCategoryChange={setCategory}
          capacityFilter={capacity}
          onCapacityChange={setCapacity}
        />

        {/* Room Grid */}
        {filteredRooms.length === 0 ? (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-12 text-center">
            <Building2 size={36} className="mx-auto text-slate-500" />
            <p className="mt-3 text-sm font-semibold text-white">Tidak ada ruangan yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau reset filter kategori Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setCapacity("all");
              }}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
