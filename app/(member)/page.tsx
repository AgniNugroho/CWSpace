"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Clock, Building2 } from "lucide-react";
import { Room } from "@/lib/types/database";
import { fetchRoomsFromDatabase } from "@/lib/rooms/service";
import { RoomCard } from "@/components/member/RoomCard";
import { RoomFilter } from "@/components/member/RoomFilter";

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [capacity, setCapacity] = useState("all");

  useEffect(() => {
    async function loadRooms() {
      try {
        const dbRooms = await fetchRoomsFromDatabase(true);
        setRooms(dbRooms);
      } catch {
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    }

    void loadRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      // Search
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = r.name.toLowerCase().includes(query);
        const matchDesc = r.description?.toLowerCase().includes(query);
        const matchFac = (r.facilities || []).some((f) => f.name.toLowerCase().includes(query));
        if (!matchName && !matchDesc && !matchFac) return false;
      }

      // Category
      if (category !== "all" && r.category !== category) {
        return false;
      }

      // Capacity
      if (capacity === "1-4" && (r.capacity < 1 || r.capacity > 4)) return false;
      if (capacity === "5-10" && (r.capacity < 5 || r.capacity > 10)) return false;
      if (capacity === "11-20" && (r.capacity < 11 || r.capacity > 20)) return false;
      if (capacity === "20+" && r.capacity <= 20) return false;

      return true;
    });
  }, [rooms, search, category, capacity]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white/10 to-white/5 p-8 sm:p-12 lg:p-16 backdrop-blur-2xl text-center shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3.5 py-1.5 text-xs font-semibold text-cyan-300">
          <Sparkles size={14} />
          <span>Sistem Reservasi & Rekomendasi Cerdas SAW</span>
        </div>

        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Ruang Kerja & Rapat Modern untuk{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
            Produktivitas Terbaik Anda
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Temukan ruangan yang paling sesuai dengan kebutuhan kegiatan Anda secara instan menggunakan algoritma rekomendasi, reservasi tanpa bentrok, dan nikmati fleksibilitas membership.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/rekomendasi"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-500 hover:to-cyan-500 hover:scale-[1.02]"
          >
            <Sparkles size={18} />
            <span>Cari Rekomendasi Ruangan (SAW)</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/membership"
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            <span>Lihat Paket Membership</span>
          </Link>
        </div>

        {/* Value Proposition Triad */}
        <div className="mt-12 grid grid-cols-1 gap-4 border-t border-white/15 pt-8 sm:grid-cols-3 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600/20 text-cyan-300 border border-blue-400/30">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Bebas Bentrok Jadwal</p>
              <p className="text-[11px] text-slate-400">Validasi otomatis ketersediaan slot jam</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-600/20 text-cyan-300 border border-cyan-400/30">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Metode Rekomendasi SAW</p>
              <p className="text-[11px] text-slate-400">Pembobotan kapasitas, fasilitas & budget</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-600/20 text-amber-300 border border-amber-400/30">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Waiting List Otomatis</p>
              <p className="text-[11px] text-slate-400">Notifikasi instan saat terjadi pembatalan</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Building2 className="text-cyan-400" size={24} />
              <span>Daftar Ruangan Tersedia</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Pilih ruangan sesuai kebutuhan tim Anda atau gunakan rekomendasi SAW.
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
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="rounded-2xl border border-white/15 bg-white/5 p-12 text-center">
            <Building2 size={36} className="mx-auto text-slate-500" />
            <p className="mt-3 text-sm font-semibold text-white">Tidak ada ruangan yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter kategori Anda.</p>
            <button
              type="button"
              onClick={() => { setSearch(""); setCategory("all"); setCapacity("all"); }}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
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
