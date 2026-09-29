"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Clock, Sparkles, Plus, ArrowRight } from "lucide-react";
import { Room, WaitingList } from "@/lib/types/database";
import { fetchRoomsFromDatabase } from "@/lib/rooms/service";
import { WaitingListCard } from "@/components/member/WaitingListCard";
import { ClaimSlotModal } from "@/components/member/ClaimSlotModal";
import { fetchUserWaitingLists, joinWaitingList, cancelWaitingList, claimWaitingSlot } from "@/lib/waiting-list/service";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function WaitingListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [waitlists, setWaitlists] = useState<WaitingList[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New queue form state
  const paramRoom = searchParams.get("room") || "";
  const paramDate = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const paramStart = Number(searchParams.get("start") || 10);
  const paramEnd = Number(searchParams.get("end") || 12);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(paramRoom);
  const [selectedDate, setSelectedDate] = useState<string>(paramDate);
  const [startHour, setStartHour] = useState<number>(paramStart);
  const [endHour, setEndHour] = useState<number>(paramEnd);
  const [isJoining, setIsJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState(false);

  // Claim modal state
  const [claimingWaitlist, setClaimingWaitlist] = useState<WaitingList | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // Fetch Rooms from Database
        const dbRooms = await fetchRoomsFromDatabase(true);
        setRooms(dbRooms);
        if (!selectedRoomId && dbRooms.length > 0) {
          setSelectedRoomId(dbRooms[0].id);
        }

        // Fetch User Waitlists from Database
        if (currentUser) {
          const list = await fetchUserWaitingLists(currentUser.id);
          setWaitlists(list || []);
        }
      } catch {
        setWaitlists([]);
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [selectedRoomId]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/waiting-list`);
      return;
    }

    setIsJoining(true);
    const startIso = `${selectedDate}T${String(startHour).padStart(2, "0")}:00:00Z`;
    const endIso = `${selectedDate}T${String(endHour).padStart(2, "0")}:00:00Z`;

    const res = await joinWaitingList(user.id, selectedRoomId, startIso, endIso);

    if (res.success && res.data) {
      setWaitlists([res.data, ...waitlists]);
      setJoinSuccess(true);
      setTimeout(() => setJoinSuccess(false), 2000);
    } else {
      // Offline fallback
      const foundRoom = rooms.find((r) => r.id === selectedRoomId);
      const newDemoItem: WaitingList = {
        id: `wl-${Date.now()}`,
        user_id: user.id,
        room_id: selectedRoomId,
        desired_start_time: startIso,
        desired_end_time: endIso,
        queue_number: waitlists.length + 1,
        status: "waiting",
        created_at: new Date().toISOString(),
        room: foundRoom,
      };
      setWaitlists([newDemoItem, ...waitlists]);
      setJoinSuccess(true);
      setTimeout(() => setJoinSuccess(false), 2000);
    }
    setIsJoining(false);
  };

  const handleCancelWaitlist = async (id: string) => {
    await cancelWaitingList(id);
    setWaitlists(waitlists.map((w) => (w.id === id ? { ...w, status: "cancelled" } : w)));
  };

  const handleConfirmClaim = async () => {
    if (!claimingWaitlist) return;
    await claimWaitingSlot(claimingWaitlist.id);

    const startH = new Date(claimingWaitlist.desired_start_time).getHours();
    const endH = new Date(claimingWaitlist.desired_end_time).getHours();
    const dateStr = claimingWaitlist.desired_start_time.split("T")[0];

    const targetUrl = `/reservasi/${claimingWaitlist.room_id}?date=${dateStr}&start=${startH}&end=${endH}&claimed=true`;
    setClaimingWaitlist(null);
    router.push(targetUrl);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-blue-950/60 via-slate-900/60 to-purple-950/60 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
          <Sparkles size={14} />
          <span>Fitur Bernilai Tambah: Waiting List Otomatis</span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Sistem Antrean Cerdas Saat Ruangan Penuh
        </h1>

        <p className="mt-3 max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed">
          Ruangan yang Anda inginkan sudah terisi? Anda tidak perlu mencari coworking space lain. Masuklah ke antrean <strong>Waiting List (FIFO)</strong>. Ketika ada penyewa yang membatalkan reservasi, sistem otomatis memberikan penawaran slot dengan <strong>batas klaim 30 menit</strong> langsung di akun Anda!
        </p>

        {/* Mechanism Triad */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs">1</span>
            <span>Urutan Antrean Adil (FIFO)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex size-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs">2</span>
            <span>Trigger Otomatis Saat Pembatalan</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">3</span>
            <span>Jendela Waktu Klaim 30 Menit</span>
          </div>
        </div>
      </section>

      {/* Main Grid: Form on Left (5 Cols), Active Queues on Right (7 Cols) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Form: Join Waiting List */}
        <div className="lg:col-span-5 sticky top-24">
          <form onSubmit={handleJoin} className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="text-cyan-400" size={20} />
                <span>Masuk Antrean Waiting List</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Pilih ruangan dan jadwal yang ingin Anda tunggu ketersediaannya.
              </p>
            </div>

            {joinSuccess && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/20 p-4 text-xs text-emerald-200 flex items-center gap-2">
                <Sparkles size={18} />
                <span>Berhasil masuk ke dalam antrean waiting list!</span>
              </div>
            )}

            {/* Room selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Pilih Ruangan</label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-slate-900/90 py-2.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    {r.name} (Kapasitas {r.capacity} orang)
                  </option>
                ))}
              </select>
            </div>

            {/* Date selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Tanggal Penggunaan</label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-slate-900/90 py-2.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            {/* Hours selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Jam Mulai</label>
                <select
                  value={startHour}
                  onChange={(e) => {
                    const newStart = Number(e.target.value);
                    setStartHour(newStart);
                    if (endHour <= newStart) setEndHour(newStart + 1);
                  }}
                  className="w-full rounded-xl border border-white/20 bg-slate-900/90 py-2.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
                >
                  {Array.from({ length: 13 }, (_, i) => i + 8).map((h) => (
                    <option key={h} value={h} className="bg-slate-900 text-white">
                      {String(h).padStart(2, "0")}.00 WIB
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Jam Selesai</label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/20 bg-slate-900/90 py-2.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
                >
                  {Array.from({ length: 14 }, (_, i) => i + 8)
                    .filter((h) => h > startHour)
                    .map((h) => (
                      <option key={h} value={h} className="bg-slate-900 text-white">
                        {String(h).padStart(2, "0")}.00 WIB
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 text-xs font-bold text-white shadow-xl shadow-blue-500/30 hover:from-blue-500 hover:to-cyan-400 transition"
            >
              <span>{isJoining ? "Mendaftarkan Antrean..." : "Konfirmasi Masuk Antrean"}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>

        {/* Right Column: User's Active Waiting Lists */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="text-cyan-400" size={20} />
                <span>Status Antrean Saya</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Pantau posisi nomor antrean dan notifikasi ketersediaan slot ruangan.
              </p>
            </div>
            <span className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
              {waitlists.length} Antrean Terdaftar
            </span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : waitlists.length === 0 ? (
            <div className="rounded-3xl border border-white/15 bg-white/5 p-12 text-center space-y-3">
              <Clock size={36} className="mx-auto text-slate-500" />
              <p className="text-sm font-semibold text-white">Belum Ada Antrean Waiting List</p>
              <p className="text-xs text-slate-400">
                Ketika ruangan yang Anda inginkan penuh, Anda dapat memasukkan antrean di sini untuk diprioritaskan saat ada pembatalan.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {waitlists.map((wl) => (
                <WaitingListCard
                  key={wl.id}
                  waitlist={wl}
                  onClaim={(item) => setClaimingWaitlist(item)}
                  onCancel={handleCancelWaitlist}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Claim Slot Modal with Countdown */}
      {claimingWaitlist && (
        <ClaimSlotModal
          isOpen={Boolean(claimingWaitlist)}
          onClose={() => setClaimingWaitlist(null)}
          onConfirmClaim={handleConfirmClaim}
          waitlist={claimingWaitlist}
        />
      )}
    </div>
  );
}

export default function WaitingListPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat halaman waiting list...</div>}>
      <WaitingListContent />
    </Suspense>
  );
}
