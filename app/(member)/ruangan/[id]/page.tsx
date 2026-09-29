"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, Users, CheckCircle2, Calendar, Clock, 
  ArrowLeft, ArrowRight, ShieldCheck, AlertCircle 
} from "lucide-react";
import { Room } from "@/lib/types/database";
import { INITIAL_ROOMS } from "@/lib/data/initial-rooms";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoomDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const roomId = resolvedParams.id;

  const [room, setRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [bookedSlots, setBookedSlots] = useState<number[]>([]); // Array of booked start hours (e.g. [9, 10, 14])
  const [isLoading, setIsLoading] = useState(true);

  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 to 21

  useEffect(() => {
    async function loadRoomAndSchedule() {
      setIsLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();

        // 1. Fetch room detail
        const { data: roomData, error } = await supabase
          .from("rooms")
          .select(`
            id, name, category, capacity, price_per_hour, description, image_url, is_active, created_at, updated_at,
            room_facilities (
              facilities ( id, name )
            )
          `)
          .eq("id", roomId)
          .single();

        if (!error && roomData) {
          setRoom({
            id: roomData.id,
            name: roomData.name,
            category: roomData.category,
            capacity: roomData.capacity,
            price_per_hour: Number(roomData.price_per_hour),
            description: roomData.description,
            image_url: roomData.image_url,
            is_active: roomData.is_active,
            created_at: roomData.created_at,
            updated_at: roomData.updated_at,
            facilities: (roomData.room_facilities || []).map((rf: any) => rf.facilities).filter(Boolean),
          });
        } else {
          // Fallback
          const found = INITIAL_ROOMS.find((r) => r.id === roomId);
          setRoom(found || INITIAL_ROOMS[0]);
        }

        // 2. Fetch reservations on selected date
        const startOfDay = `${selectedDate}T00:00:00Z`;
        const endOfDay = `${selectedDate}T23:59:59Z`;

        const { data: resData } = await supabase
          .from("reservations")
          .select("start_time, end_time, status")
          .eq("room_id", roomId)
          .in("status", ["menunggu_verifikasi", "dikonfirmasi"])
          .gte("end_time", startOfDay)
          .lte("start_time", endOfDay);

        const booked: number[] = [];
        if (resData && resData.length > 0) {
          resData.forEach((res) => {
            const startH = new Date(res.start_time).getHours();
            const endH = new Date(res.end_time).getHours();
            for (let h = startH; h < endH; h++) {
              booked.push(h);
            }
          });
        } else {
          // Seed simulation: Mock booked hours for testing
          if (roomId === INITIAL_ROOMS[0].id) {
            booked.push(10, 11, 14, 15);
          }
        }
        setBookedSlots(booked);
      } catch {
        const found = INITIAL_ROOMS.find((r) => r.id === roomId);
        setRoom(found || INITIAL_ROOMS[0]);
        setBookedSlots([10, 11, 14, 15]);
      } finally {
        setIsLoading(false);
      }
    }

    void loadRoomAndSchedule();
  }, [roomId, selectedDate]);

  if (!room && !isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-rose-400" />
        <h1 className="mt-4 text-2xl font-bold text-white">Ruangan Tidak Ditemukan</h1>
        <Link href="/" className="mt-4 inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white transition flex items-center gap-1">
          <ArrowLeft size={14} />
          <span>Kembali ke Katalog</span>
        </Link>
        <span>/</span>
        <span className="text-cyan-300 font-medium">{room?.name}</span>
      </nav>

      {/* Main Info Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Media & Specs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/20 bg-slate-900 shadow-2xl">
            <img
              src={room?.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"}
              alt={room?.name}
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                  {room?.category.replace("_", " ").toUpperCase()}
                </span>
                <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">{room?.name}</h1>
              </div>
              <div className="rounded-2xl border border-white/20 bg-slate-950/80 p-3 text-right backdrop-blur-md">
                <span className="text-[10px] uppercase text-slate-400">Kapasitas</span>
                <p className="flex items-center gap-1 text-sm font-bold text-white">
                  <Users size={16} className="text-cyan-300" />
                  <span>Maks. {room?.capacity} Orang</span>
                </p>
              </div>
            </div>
          </div>

          {/* Description & Features */}
          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 backdrop-blur-xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white">Deskripsi Ruangan</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {room?.description || "Ruangan didesain khusus untuk mendukung produktivitas dan kelancaran kegiatan tim Anda."}
              </p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h2 className="text-lg font-bold text-white">Fasilitas yang Tersedia</h2>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(room?.facilities || []).map((fac) => (
                  <div
                    key={fac.id}
                    className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white"
                  >
                    <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                    <span>{fac.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Price, Live Availability Calendar & Action */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400">Tarif Resmi</span>
              <p className="mt-1 text-3xl font-extrabold text-cyan-300">
                {room ? formatPrice(room.price_per_hour) : "Rp 0"}{" "}
                <span className="text-xs font-normal text-slate-400">/ jam</span>
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                *Member dapat menggunakan saldo kuota jam untuk reservasi gratis.
              </p>
            </div>

            {/* Date picker */}
            <div className="border-t border-white/10 pt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Pilih Tanggal Pengecekan Slot:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-900/90 py-2.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Time Slot Availability Grid */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Clock size={14} className="text-cyan-300" />
                  <span>Jadwal Slot Jam</span>
                </span>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="size-2 rounded-full bg-emerald-400" /> Kosong
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="size-2 rounded-full bg-rose-400" /> Terisi
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {hours.map((h) => {
                  const isBooked = bookedSlots.includes(h);
                  const timeLabel = `${String(h).padStart(2, "0")}.00 - ${String(h + 1).padStart(2, "0")}.00`;
                  return (
                    <div
                      key={h}
                      className={`rounded-xl border p-2 text-center text-[11px] font-semibold transition ${
                        isBooked
                          ? "border-rose-500/40 bg-rose-500/15 text-rose-300 cursor-not-allowed"
                          : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 cursor-pointer"
                      }`}
                      title={isBooked ? "Slot ini sudah terisi. Anda bisa masuk antrean waiting list." : "Slot ini masih kosong dan dapat dipesan."}
                    >
                      <span>{timeLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Booking Action */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <Link
                href={`/reservasi/${room?.id}?date=${selectedDate}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3.5 text-xs font-bold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-500 hover:to-cyan-500"
              >
                <span>Pesan Ruangan Sekarang</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href={`/waiting-list?room=${room?.id}&date=${selectedDate}`}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/15 transition"
              >
                <span>Masuk Antrean Waiting List</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
