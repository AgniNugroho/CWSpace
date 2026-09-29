"use client";

import { useState, useEffect } from "react";
import { Sparkles, BookOpen, CheckCircle, ArrowDown } from "lucide-react";
import { Room, UserPreferences, SawResult } from "@/lib/types/database";
import { fetchRoomsFromDatabase } from "@/lib/rooms/service";
import { calculateSawRanking } from "@/lib/algorithms/saw";
import { SawRecommendationForm } from "@/components/member/SawRecommendationForm";
import { SawResultCard } from "@/components/member/SawResultCard";

export default function RekomendasiPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [results, setResults] = useState<SawResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  // Fetch rooms on mount
  useEffect(() => {
    async function loadRooms() {
      try {
        const dbRooms = await fetchRoomsFromDatabase(true);
        setRooms(dbRooms);
        if (dbRooms.length > 0) {
          const initialRanking = calculateSawRanking(dbRooms, {
            attendees: 6,
            requiredFacilities: ["Smart TV & Video Conf", "Whiteboard Glass"],
            maxBudgetPerHour: 200000,
            activityType: "meeting",
          });
          setResults(initialRanking);
          setHasCalculated(true);
        }
      } catch {
        setRooms([]);
      }
    }

    void loadRooms();
  }, []);

  const handleCalculate = (preferences: UserPreferences) => {
    setIsLoading(true);
    // Simulate brief calculation tick for visual UX
    setTimeout(() => {
      const ranking = calculateSawRanking(rooms, preferences);
      setResults(ranking);
      setHasCalculated(true);
      setIsLoading(false);

      // Smooth scroll to results
      const resultsEl = document.getElementById("saw-results");
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-blue-950/60 via-slate-900/60 to-cyan-950/60 p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
          <Sparkles size={14} />
          <span>Fitur Bernilai Tambah (Value-Added)</span>
        </div>

        <h1 className="mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          Rekomendasi Ruangan Cerdas{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Metode Simple Additive Weighting (SAW)
          </span>
        </h1>

        <p className="mt-3 max-w-3xl text-xs sm:text-sm text-slate-300 leading-relaxed">
          Fitur ini mengatasi kesulitan dalam memilih ruangan coworking yang paling efisien. Sistem secara otomatis
          menormalisasi matriks kriteria dan mengalikan bobot preferensi: <strong>Kapasitas (30%)</strong>, <strong>Fasilitas (30%)</strong>, <strong>Biaya (25%)</strong>, dan <strong>Kategori (15%)</strong>.
        </p>

        {/* Academic Method Callout */}
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
            <BookOpen size={14} />
            <span>Landasan Teori Skripsi:</span>
          </span>
          <span>Normalisasi Matriks Keputusan $R$</span>
          <span>•</span>
          <span>Nilai Preferensi V_i = ∑ w_j · r_ij</span>
          <span>•</span>
          <span className="text-emerald-300 font-medium">Bebas Bias Subjektif</span>
        </div>
      </section>

      {/* Main Grid: Form on Left, Results on Right */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Form (5 Cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <SawRecommendationForm onSubmit={handleCalculate} isLoading={isLoading} />
        </div>

        {/* Right Column: Results List (7 Cols) */}
        <div id="saw-results" className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between border-b border-white/15 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="text-amber-400" size={20} />
                <span>Hasil Perankingan Ruangan</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Diurutkan berdasarkan nilai preferensi tertinggi yang paling memenuhi kriteria Anda.
              </p>
            </div>
            {hasCalculated && (
              <span className="rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-300">
                {results.length} Opsi Dievaluasi
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="rounded-3xl border border-white/15 bg-white/5 p-12 text-center">
              <p className="text-sm font-semibold text-white">Belum ada hasil kalkulasi</p>
              <p className="text-xs text-slate-400 mt-1">Klik tombol &quot;Hitung Rekomendasi SAW&quot; untuk memulai evaluasi.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {results.map((res, index) => (
                <SawResultCard key={res.room.id} result={res} rank={index + 1} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
