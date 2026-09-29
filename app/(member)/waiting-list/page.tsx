"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Clock, Sparkles, Building2, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { WaitingList } from "@/lib/types/database";
import { WaitingListCard } from "@/components/member/WaitingListCard";
import { ClaimSlotModal } from "@/components/member/ClaimSlotModal";
import { fetchUserWaitingLists, cancelWaitingList, claimWaitingSlot } from "@/lib/waiting-list/service";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function WaitingListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justJoined = searchParams.get("joined") === "true";

  const [waitlists, setWaitlists] = useState<WaitingList[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "waiting" | "notified" | "history">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Claim modal state
  const [claimingWaitlist, setClaimingWaitlist] = useState<WaitingList | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
          if (isMounted) router.replace("/login?redirectTo=/waiting-list");
          return;
        }

        if (isMounted) setIsCheckingAuth(false);

        // Fetch User Waitlists from Database
        const list = await fetchUserWaitingLists(currentUser.id);
        if (isMounted) setWaitlists(list || []);
      } catch {
        if (isMounted) setWaitlists([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [router]);

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

  const filteredWaitlists = useMemo(() => {
    if (activeTab === "all") return waitlists;
    if (activeTab === "waiting") return waitlists.filter((w) => w.status === "waiting");
    if (activeTab === "notified") return waitlists.filter((w) => w.status === "notified");
    if (activeTab === "history") return waitlists.filter((w) => w.status === "claimed" || w.status === "expired" || w.status === "cancelled");
    return waitlists;
  }, [waitlists, activeTab]);

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center py-28 space-y-4">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl">
          <Loader2 className="animate-spin text-cyan-400" size={28} />
        </div>
        <p className="text-sm font-medium text-slate-300">Memeriksa status akun...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Success Banner if just redirected from reservation auto-join */}
      {justJoined && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/20 p-5 text-xs text-emerald-100 backdrop-blur-xl shadow-xl flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/30 text-emerald-300">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Berhasil Masuk ke Antrean Waiting List!</p>
            <p className="mt-1 text-slate-200 leading-relaxed">
              Jadwal yang Anda pilih telah tersimpan di antrean sistem (FIFO). Begitu penyewa sebelumnya membatalkan reservasi, Anda akan otomatis mendapatkan prioritas dengan jendela klaim 30 menit.
            </p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-blue-950/60 via-slate-900/60 to-purple-950/60 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
          <Sparkles size={14} />
          <span>Sistem Antrean Cerdas FIFO</span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Riwayat & Status Waiting List Saya
        </h1>

        <p className="mt-3 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
          Pantau antrean reservasi ruangan Anda secara real-time. Jika penyewa sebelumnya membatalkan reservasi, sistem otomatis memberikan notifikasi dan jendela waktu klaim selama 30 menit khusus untuk akun Anda.
        </p>

        {/* Mechanism Triad */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-xs">1</span>
            <span>Urutan Antrean Adil (FIFO)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex size-6 items-center justify-center rounded-full bg-blue-500/20 text-blue-300 font-bold text-xs">2</span>
            <span>Auto Trigger Saat Pembatalan</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">3</span>
            <span>Jendela Klaim Eksklusif 30 Mnt</span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="space-y-6">
        {/* Controls & Tab Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "all"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Semua ({waitlists.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("waiting")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "waiting"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Menunggu ({waitlists.filter((w) => w.status === "waiting").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("notified")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "notified"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Siap Diklaim ({waitlists.filter((w) => w.status === "notified").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === "history"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-white/5 text-slate-300 hover:bg-white/10"
              }`}
            >
              Riwayat Lampau
            </button>
          </div>

          <span className="text-xs text-cyan-300 font-semibold bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 self-start sm:self-auto">
            {filteredWaitlists.length} Antrean Ditampilkan
          </span>
        </div>

        {/* List of Waiting List Cards */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
            ))}
          </div>
        ) : filteredWaitlists.length === 0 ? (
          <div className="rounded-3xl border border-white/15 bg-white/5 p-12 text-center space-y-4">
            <Clock size={42} className="mx-auto text-slate-500" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-white">Tidak Ada Antrean Waiting List</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Ketika jadwal ruangan yang Anda inginkan bentrok atau sudah terisi pada menu reservasi, cukup klik tombol <strong>Masuk Antrean Waiting List</strong> untuk otomatis didaftarkan ke sini.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition"
            >
              <Building2 size={15} />
              <span>Eksplorasi Katalog Ruangan</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredWaitlists.map((wl) => (
              <WaitingListCard
                key={wl.id}
                waitlist={wl}
                onClaim={(item) => setClaimingWaitlist(item)}
                onCancel={handleCancelWaitlist}
              />
            ))}
          </div>
        )}
      </section>

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
    <Suspense fallback={
      <div className="flex items-center justify-center py-24 text-xs text-slate-400">
        Memuat halaman waiting list...
      </div>
    }>
      <WaitingListContent />
    </Suspense>
  );
}
