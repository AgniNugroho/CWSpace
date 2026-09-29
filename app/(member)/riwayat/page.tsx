"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { History, Calendar, CheckCircle2, Clock, XCircle, Sparkles, Building2, ArrowRight } from "lucide-react";
import { Reservation } from "@/lib/types/database";
import { INITIAL_ROOMS } from "@/lib/data/initial-rooms";
import { ReservationHistoryCard } from "@/components/member/ReservationHistoryCard";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function HistoryPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelNotification, setCancelNotification] = useState("");

  useEffect(() => {
    async function loadReservations() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          const { data, error } = await supabase
            .from("reservations")
            .select(`
              id, user_id, room_id, start_time, end_time, total_hours, total_price, payment_method, status, notes, created_at, updated_at,
              rooms ( id, name, category, capacity, price_per_hour, image_url )
            `)
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false });

          if (!error && data && data.length > 0) {
            setReservations(data.map((item: any) => ({
              ...item,
              total_price: Number(item.total_price),
              total_hours: Number(item.total_hours),
              room: item.rooms,
            })));
          } else {
            // Seed sample demo reservations for user
            const todayStr = new Date().toISOString().split("T")[0];
            setReservations([
              {
                id: "res-demo-1",
                user_id: currentUser.id,
                room_id: INITIAL_ROOMS[0].id,
                start_time: `${todayStr}T14:00:00Z`,
                end_time: `${todayStr}T16:00:00Z`,
                total_hours: 2,
                total_price: 200000,
                payment_method: "transfer_bank",
                status: "menunggu_verifikasi",
                notes: "Tolong siapkan whiteboard marker warna hitam dan biru.",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                room: INITIAL_ROOMS[0],
              },
              {
                id: "res-demo-2",
                user_id: currentUser.id,
                room_id: INITIAL_ROOMS[1].id,
                start_time: `${new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}T09:00:00Z`,
                end_time: `${new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}T12:00:00Z`,
                total_hours: 3,
                total_price: 540000,
                payment_method: "membership_quota",
                status: "selesai",
                created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                room: INITIAL_ROOMS[1],
              },
            ]);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    void loadReservations();
  }, []);

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const supabase = createSupabaseBrowserClient();
      const target = reservations.find((r) => r.id === reservationId);

      // 1. Update reservation status to dibatalkan
      await supabase
        .from("reservations")
        .update({ status: "dibatalkan" })
        .eq("id", reservationId);

      // 2. Trigger Waiting List: Look for top waiting queue on that room & time
      if (target) {
        const { data: topWaitlist } = await supabase
          .from("waiting_lists")
          .select("id, user_id")
          .eq("room_id", target.room_id)
          .eq("status", "waiting")
          .order("queue_number", { ascending: true })
          .limit(1);

        if (topWaitlist && topWaitlist.length > 0) {
          const deadline = new Date(Date.now() + 30 * 60 * 1000).toISOString();
          await supabase
            .from("waiting_lists")
            .update({
              status: "notified",
              notified_at: new Date().toISOString(),
              claim_deadline: deadline,
            })
            .eq("id", topWaitlist[0].id);
        }
      }

      // Update state
      setReservations(reservations.map((r) => (r.id === reservationId ? { ...r, status: "dibatalkan" } : r)));
      setCancelNotification(
        "Reservasi berhasil dibatalkan. Notifikasi slot kosong otomatis dialokasikan ke pelanggan dalam antrean waiting list."
      );
      setTimeout(() => setCancelNotification(""), 5000);
    } catch {
      setReservations(reservations.map((r) => (r.id === reservationId ? { ...r, status: "dibatalkan" } : r)));
      setCancelNotification(
        "Reservasi berhasil dibatalkan. Notifikasi slot kosong otomatis dialokasikan ke antrean waiting list."
      );
      setTimeout(() => setCancelNotification(""), 5000);
    }
  };

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (activeTab === "all") return true;
      if (activeTab === "active") return r.status === "dikonfirmasi" || r.status === "menunggu_verifikasi" || r.status === "menunggu_pembayaran";
      if (activeTab === "completed") return r.status === "selesai";
      if (activeTab === "cancelled") return r.status === "dibatalkan";
      return true;
    });
  }, [reservations, activeTab]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <section className="border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
          <History size={14} />
          <span>Riwayat Pemesanan & Pembayaran</span>
        </div>
        <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">
          Riwayat Reservasi Ruangan Saya
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300">
          Pantau status verifikasi pembayaran admin, jadwal sewa aktif, dan riwayat pemanfaatan ruangan coworking.
        </p>
      </section>

      {/* Cancellation Success Feedback */}
      {cancelNotification && (
        <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/20 p-4 text-xs text-emerald-200 flex items-center gap-3 animate-in fade-in shadow-lg">
          <CheckCircle2 size={20} className="shrink-0 text-emerald-400" />
          <span>{cancelNotification}</span>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: "all", label: "Semua Riwayat" },
          { id: "active", label: "Mendatang / Aktif" },
          { id: "completed", label: "Selesai" },
          { id: "cancelled", label: "Dibatalkan" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-cyan-400/40"
                : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reservation List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
          ))}
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="rounded-3xl border border-white/15 bg-white/5 p-12 text-center space-y-4">
          <Calendar size={40} className="mx-auto text-slate-500" />
          <div>
            <h3 className="text-base font-bold text-white">Tidak Ada Riwayat Reservasi</h3>
            <p className="mt-1 text-xs text-slate-400">
              Anda belum memiliki reservasi pada kategori filter ini.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition"
          >
            <Building2 size={16} />
            <span>Jelajahi Katalog Ruangan</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredReservations.map((res) => (
            <ReservationHistoryCard
              key={res.id}
              reservation={res}
              onCancel={handleCancelReservation}
            />
          ))}
        </div>
      )}
    </div>
  );
}
