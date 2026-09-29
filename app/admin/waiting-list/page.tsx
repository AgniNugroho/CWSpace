"use client";

import { useEffect, useState, useCallback } from "react";
import { Clock, Bell } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { INITIAL_ROOMS } from "@/lib/data/initial-rooms";

function computeWaitlistDeadline(): string {
  return new Date(Date.now() + 30 * 60 * 1000).toISOString();
}

export default function AdminWaitingListPage() {
  const [waitlists, setWaitlists] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAllWaitlists() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("waiting_lists")
          .select(`
            id, user_id, room_id, desired_start_time, desired_end_time, queue_number, status, notified_at, claim_deadline, created_at,
            rooms(name, capacity),
            profiles(full_name, phone)
          `)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          setWaitlists(data);
        } else {
          // Demo fallback
          const today = new Date().toISOString().split("T")[0];
          setWaitlists([
            {
              id: "wl-1",
              user_id: "u1",
              room_id: INITIAL_ROOMS[0].id,
              desired_start_time: `${today}T10:00:00Z`,
              desired_end_time: `${today}T12:00:00Z`,
              queue_number: 1,
              status: "notified",
              notified_at: new Date().toISOString(),
              claim_deadline: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
              rooms: { name: "Meeting Room Alpha", capacity: 6 },
              profiles: { full_name: "Ahmad Fauzi", phone: "081298765432" },
            },
            {
              id: "wl-2",
              user_id: "u2",
              room_id: INITIAL_ROOMS[0].id,
              desired_start_time: `${today}T10:00:00Z`,
              desired_end_time: `${today}T12:00:00Z`,
              queue_number: 2,
              status: "waiting",
              notified_at: null,
              claim_deadline: null,
              rooms: { name: "Meeting Room Alpha", capacity: 6 },
              profiles: { full_name: "Reza Rahardian", phone: "085611223344" },
            },
          ]);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    void loadAllWaitlists();
  }, []);

  const handleNotifySlot = useCallback(async (waitlistId: string) => {
    const deadline = computeWaitlistDeadline();
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase
        .from("waiting_lists")
        .update({
          status: "notified",
          notified_at: new Date().toISOString(),
          claim_deadline: deadline,
        })
        .eq("id", waitlistId);

      setWaitlists((prev) => prev.map((w) => (w.id === waitlistId ? { ...w, status: "notified", claim_deadline: deadline } : w)));
    } catch {
      setWaitlists((prev) => prev.map((w) => (w.id === waitlistId ? { ...w, status: "notified" } : w)));
    }
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Clock className="text-purple-400" size={24} />
          <span>Monitoring Antrean Waiting List (FIFO)</span>
        </h1>
        <p className="text-xs text-slate-300 mt-1">
          Pantau daftar antrean pelanggan ketika ruangan penuh dan pantau alokasi otomatis klaim 30 menit.
        </p>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-white/20 bg-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 bg-white/5">
              <tr>
                <th className="py-3.5 px-4">Nomor Antrean</th>
                <th className="py-3.5 px-4">Pelanggan</th>
                <th className="py-3.5 px-4">Ruangan</th>
                <th className="py-3.5 px-4">Jadwal yang Dituju</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Aksi Alokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {waitlists.map((w) => {
                const startH = new Date(w.desired_start_time).getHours();
                const endH = new Date(w.desired_end_time).getHours();
                return (
                  <tr key={w.id} className="hover:bg-white/5 transition">
                    <td className="py-3.5 px-4">
                      <span className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-black text-purple-300">
                        Antrean #{w.queue_number}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="text-white block">{w.profiles?.full_name || "Pelanggan"}</strong>
                      <span className="text-[11px] text-slate-400">{w.profiles?.phone || "-"}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-cyan-300">
                      {w.rooms?.name || "Ruangan"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-white font-medium block">
                        {new Date(w.desired_start_time).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        {String(startH).padStart(2, "0")}.00 – {String(endH).padStart(2, "0")}.00 WIB
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-extrabold ${
                        w.status === "notified"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse"
                          : w.status === "claimed"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : w.status === "waiting"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : "bg-slate-500/20 text-slate-300"
                      }`}>
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {w.status === "waiting" && (
                        <button
                          type="button"
                          onClick={() => handleNotifySlot(w.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-purple-500 transition shadow-md"
                        >
                          <Bell size={13} />
                          <span>Buka Slot (30 Mnt)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
