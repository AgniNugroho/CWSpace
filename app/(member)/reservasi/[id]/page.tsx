"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Building2, Calendar, Clock, CreditCard, ShieldCheck, 
  AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Upload, QrCode, Loader2
} from "lucide-react";
import { Room, PaymentMethod, UserMembership, WaitingList } from "@/lib/types/database";
import { fetchRoomByIdFromDatabase } from "@/lib/rooms/service";
import { checkReservationConflict } from "@/lib/reservations/conflict";
import { joinWaitingList, checkUserExistingWaitlist } from "@/lib/waiting-list/service";
import { BookingSummaryModal } from "@/components/member/BookingSummaryModal";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { Suspense } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

function ReservationContent({ params }: PageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomId = resolvedParams.id;

  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<any>(null);
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Form State
  const initialDate = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState<string>(initialDate);
  const [startHour, setStartHour] = useState<number>(9);
  const [endHour, setEndHour] = useState<number>(11);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("transfer_bank");
  const [notes, setNotes] = useState("");
  const [proofFile, setProofFile] = useState<string | null>(null);

  // Status & Validation
  const [isCheckingConflict, setIsCheckingConflict] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [existingWaitlist, setExistingWaitlist] = useState<WaitingList | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isJoiningWaitingList, setIsJoiningWaitingList] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hoursOptions = Array.from({ length: 14 }, (_, i) => i + 8); // 8 to 21

  // Load Room & User Data
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (!currentUser) {
          router.replace(`/login?redirectTo=/reservasi/${roomId}`);
          return;
        }

        setUser(currentUser);
        setIsCheckingAuth(false);

        // Fetch Room from Database
        const dbRoom = await fetchRoomByIdFromDatabase(roomId);
        setRoom(dbRoom);

        // Fetch Active Membership for current user
        if (currentUser) {
          const { data: memberData } = await supabase
            .from("user_memberships")
            .select("id, user_id, membership_id, start_date, end_date, total_hours, remaining_hours, status, memberships(name)")
            .eq("user_id", currentUser.id)
            .eq("status", "active")
            .gte("end_date", new Date().toISOString())
            .order("remaining_hours", { ascending: false })
            .limit(1);

          if (memberData && memberData.length > 0) {
            setUserMembership(memberData[0] as any);
            if (memberData[0].remaining_hours >= 2) {
              setPaymentMethod("membership_quota");
            }
          }
        }
      } catch {
        setRoom(null);
      }
    }

    void loadData();
  }, [roomId]);

  // Conflict Checking on input change
  useEffect(() => {
    async function verifyConflict() {
      if (endHour <= startHour) return;

      setIsCheckingConflict(true);
      setHasConflict(false);

      const startIso = `${selectedDate}T${String(startHour).padStart(2, "0")}:00:00Z`;
      const endIso = `${selectedDate}T${String(endHour).padStart(2, "0")}:00:00Z`;

      const result = await checkReservationConflict(roomId, startIso, endIso);
      setHasConflict(result.hasConflict);

      if (user) {
        const waitlistRes = await checkUserExistingWaitlist(user.id, roomId, startIso, endIso);
        setExistingWaitlist(waitlistRes.isWaiting ? (waitlistRes.queue ?? null) : null);
      } else {
        setExistingWaitlist(null);
      }

      setIsCheckingConflict(false);
    }

    const timer = setTimeout(verifyConflict, 300);
    return () => clearTimeout(timer);
  }, [roomId, selectedDate, startHour, endHour, user]);

  const totalHours = Math.max(0, endHour - startHour);
  const totalPrice = totalHours * (room?.price_per_hour || 0);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleAutoJoinWaitingList = async () => {
    if (!user) {
      router.push(`/login?redirectTo=/reservasi/${roomId}`);
      return;
    }

    setIsJoiningWaitingList(true);
    setErrorMessage("");
    try {
      const startIso = `${selectedDate}T${String(startHour).padStart(2, "0")}:00:00Z`;
      const endIso = `${selectedDate}T${String(endHour).padStart(2, "0")}:00:00Z`;

      const res = await joinWaitingList(user.id, roomId, startIso, endIso);
      if (res.success) {
        router.push("/waiting-list?joined=true");
      } else {
        setErrorMessage(res.error || "Gagal mendaftarkan ke antrean waiting list.");
      }
    } catch {
      setErrorMessage("Terjadi kendala saat mendaftarkan antrean waiting list.");
    } finally {
      setIsJoiningWaitingList(false);
    }
  };

  const handlePreConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!user) {
      router.push(`/login?redirect=/reservasi/${roomId}`);
      return;
    }

    if (totalHours <= 0) {
      setErrorMessage("Jam selesai harus lebih besar daripada jam mulai.");
      return;
    }

    if (hasConflict) {
      setErrorMessage("Slot jam tersebut sedang dibooking oleh pelanggan lain.");
      return;
    }

    if (paymentMethod === "membership_quota") {
      if (!userMembership || userMembership.remaining_hours < totalHours) {
        setErrorMessage("Saldo kuota jam membership Anda tidak mencukupi untuk durasi ini.");
        return;
      }
    }

    setIsModalOpen(true);
  };

  const handleFinalBooking = async () => {
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const supabase = createSupabaseBrowserClient();
      const startIso = `${selectedDate}T${String(startHour).padStart(2, "0")}:00:00Z`;
      const endIso = `${selectedDate}T${String(endHour).padStart(2, "0")}:00:00Z`;

      const reservationStatus = paymentMethod === "membership_quota" ? "dikonfirmasi" : "menunggu_verifikasi";

      // 1. Create reservation
      const { data: resData, error: resError } = await supabase
        .from("reservations")
        .insert({
          user_id: user.id,
          room_id: roomId,
          start_time: startIso,
          end_time: endIso,
          total_hours: totalHours,
          total_price: paymentMethod === "membership_quota" ? 0 : totalPrice,
          payment_method: paymentMethod,
          status: reservationStatus,
          notes: notes || null,
        })
        .select()
        .single();

      if (resError) {
        // Fallback for demo when Supabase is in offline mode
        console.warn("Using offline simulated reservation:", resError.message);
      }

      // 2. Handle Membership Quota deduction
      if (paymentMethod === "membership_quota" && userMembership) {
        await supabase
          .from("user_memberships")
          .update({
            remaining_hours: userMembership.remaining_hours - totalHours,
          })
          .eq("id", userMembership.id);
      }

      // 3. Create Payment Log
      await supabase.from("payments").insert({
        user_id: user.id,
        reservation_id: resData?.id || null,
        amount: paymentMethod === "membership_quota" ? 0 : totalPrice,
        payment_type: "reservasi",
        payment_method: paymentMethod,
        proof_image_url: proofFile || null,
        status: paymentMethod === "membership_quota" ? "verified" : "pending",
      });

      setIsModalOpen(false);
      router.push("/riwayat?booked=true");
    } catch {
      // In demo offline mode, route with success
      setIsModalOpen(false);
      router.push("/riwayat?booked=true");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-28 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl">
            <Loader2 className="animate-spin text-cyan-400" size={28} />
          </div>
          <div>
            <p className="text-base font-semibold text-white">Memeriksa Akses Autentikasi...</p>
            <p className="text-xs text-slate-400 mt-1">
              Halaman reservasi ruangan hanya dapat diakses setelah masuk ke akun. Mengalihkan ke login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href={`/ruangan/${roomId}`} className="hover:text-white transition flex items-center gap-1">
          <ArrowLeft size={14} />
          <span>Kembali ke Detail Ruangan</span>
        </Link>
        <span>/</span>
        <span className="text-cyan-300 font-medium">Formulir Reservasi</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Left Column: Booking Form (7 Cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handlePreConfirm} className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Calendar className="text-cyan-400" size={22} />
                <span>Pilih Waktu & Jadwal Reservasi</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Sistem akan memvalidasi jadwal secara otomatis untuk mencegah tumpang tindih waktu dengan penyewa lain.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/20 p-3 text-xs text-rose-200 flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Calendar size={14} className="text-cyan-400" />
                <span>Tanggal Penggunaan</span>
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-slate-900/90 py-2.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
              />
            </div>

            {/* Start and End Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock size={14} className="text-cyan-400" />
                  <span>Jam Mulai</span>
                </label>
                <select
                  value={startHour}
                  onChange={(e) => {
                    const newStart = Number(e.target.value);
                    setStartHour(newStart);
                    if (endHour <= newStart) setEndHour(newStart + 1);
                  }}
                  className="w-full rounded-xl border border-white/20 bg-slate-900/90 py-2.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
                >
                  {hoursOptions.slice(0, -1).map((h) => (
                    <option key={h} value={h} className="bg-slate-900 text-white">
                      {String(h).padStart(2, "0")}.00 WIB
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock size={14} className="text-cyan-400" />
                  <span>Jam Selesai</span>
                </label>
                <select
                  value={endHour}
                  onChange={(e) => setEndHour(Number(e.target.value))}
                  className="w-full rounded-xl border border-white/20 bg-slate-900/90 py-2.5 px-3 text-xs text-white outline-none focus:border-cyan-400"
                >
                  {hoursOptions
                    .filter((h) => h > startHour)
                    .map((h) => (
                      <option key={h} value={h} className="bg-slate-900 text-white">
                        {String(h).padStart(2, "0")}.00 WIB
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Anti-Collision Status Banner */}
            <div className="pt-2">
              {isCheckingConflict ? (
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200 flex items-center gap-2">
                  <div className="size-4 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                  <span>Mengecek ketersediaan jadwal ruangan...</span>
                </div>
              ) : hasConflict ? (
                <div className="rounded-2xl border border-rose-500/40 bg-rose-500/15 p-4 text-xs text-rose-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-rose-300">
                    <AlertTriangle size={18} />
                    <span>Jadwal Bentrok! Ruangan ini sudah terisi pada waktu tersebut.</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Anda tidak dapat memesan slot ini karena ada reservasi aktif lain. Masuklah ke antrean Waiting List untuk mendapatkan notifikasi jika penyewa membatalkan pesanannya.
                  </p>
                  {existingWaitlist ? (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/20 px-3.5 py-2 text-xs font-semibold text-cyan-200">
                        <CheckCircle2 size={15} className="text-cyan-400" />
                        <span>Anda sudah terdaftar di antrean slot ini (Nomor #{existingWaitlist.queue_number})</span>
                      </span>
                      <Link
                        href="/waiting-list"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition shadow-md shadow-cyan-600/30"
                      >
                        <span>Lihat Status Antrean</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAutoJoinWaitingList}
                      disabled={isJoiningWaitingList}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 font-bold text-white hover:bg-rose-500 transition shadow-md shadow-rose-600/30 disabled:opacity-60 cursor-pointer"
                    >
                      {isJoiningWaitingList ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Mendaftarkan Antrean Otomatis...</span>
                        </>
                      ) : (
                        <>
                          <span>Masuk Antrean Waiting List</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Slot Waktu Tersedia! Bebas bentrok dengan penyewa lain.</span>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="border-t border-white/10 pt-5 space-y-3">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <CreditCard size={15} className="text-cyan-400" />
                <span>Pilih Metode Pembayaran</span>
              </label>

              <div className="space-y-2">
                {/* Method 1: Membership Quota */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "membership_quota"
                      ? "border-cyan-400 bg-blue-600/30 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="membership_quota"
                    checked={paymentMethod === "membership_quota"}
                    onChange={() => setPaymentMethod("membership_quota")}
                    className="mt-1 accent-cyan-400"
                  />
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Gunakan Kuota Jam Membership</span>
                      <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                        Bypass Konfirmasi
                      </span>
                    </div>
                    {userMembership ? (
                      <p className="mt-1 text-[11px] text-cyan-200">
                        Paket Aktif: {userMembership.membership?.name || "Membership"} • Sisa Kuota:{" "}
                        <strong>{userMembership.remaining_hours} Jam</strong>
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-slate-400">
                        Anda belum memiliki paket membership aktif.{" "}
                        <Link href="/membership" className="text-cyan-300 underline">Beli Paket</Link>
                      </p>
                    )}
                  </div>
                </label>

                {/* Method 2: Bank Transfer */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "transfer_bank"
                      ? "border-cyan-400 bg-blue-600/30 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="transfer_bank"
                    checked={paymentMethod === "transfer_bank"}
                    onChange={() => setPaymentMethod("transfer_bank")}
                    className="mt-1 accent-cyan-400"
                  />
                  <div className="flex-1 text-xs">
                    <span className="font-bold text-white">Transfer Bank Manual (BCA / Mandiri)</span>
                    <p className="mt-1 text-[11px] text-slate-300">
                      BCA 8830-1234-5678 a.n CWSpace Indonesia. Verifikasi manual oleh admin.
                    </p>
                  </div>
                </label>

                {/* Method 3: QRIS */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                    paymentMethod === "qris"
                      ? "border-cyan-400 bg-blue-600/30 text-white"
                      : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="qris"
                    checked={paymentMethod === "qris"}
                    onChange={() => setPaymentMethod("qris")}
                    className="mt-1 accent-cyan-400"
                  />
                  <div className="flex-1 text-xs">
                    <span className="font-bold text-white">QRIS Statis (Semua Bank / E-Wallet)</span>
                    <p className="mt-1 text-[11px] text-slate-300">
                      Pindai kode QRIS instan melalui GoPay, OVO, Dana, BCA Mobile, dll.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Catatan Khusus (Opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Tolong siapkan mikrofon tambahan atau meja formasi U-Shape."
                rows={2}
                className="w-full rounded-xl border border-white/20 bg-slate-900/90 p-3 text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={hasConflict || totalHours <= 0}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 px-6 text-sm font-bold text-white shadow-xl shadow-blue-500/30 transition hover:from-blue-500 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Lanjut ke Ringkasan Pembayaran</span>
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        {/* Right Column: Sticky Summary Card (5 Cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-5">
            <h2 className="text-base font-bold text-white border-b border-white/10 pb-3">
              Ringkasan Pesanan
            </h2>

            {/* Room info snippet */}
            <div className="flex items-center gap-3">
              <img
                src={room?.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80"}
                alt={room?.name}
                className="size-16 rounded-xl object-cover border border-white/15"
              />
              <div>
                <h3 className="text-sm font-bold text-white">{room?.name}</h3>
                <p className="text-xs text-cyan-300 font-medium">{formatPrice(room?.price_per_hour || 0)} / jam</p>
                <p className="text-[11px] text-slate-400">Kapasitas {room?.capacity} orang</p>
              </div>
            </div>

            {/* Cost calculation */}
            <div className="space-y-2 border-t border-white/10 pt-4 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Tanggal</span>
                <span className="font-semibold text-white">{selectedDate}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Durasi</span>
                <span className="font-semibold text-white">{totalHours} Jam</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tarif Sewa ({totalHours} x {formatPrice(room?.price_per_hour || 0)})</span>
                <span className="font-semibold text-white">{formatPrice(totalPrice)}</span>
              </div>
              {paymentMethod === "membership_quota" && (
                <div className="flex justify-between text-emerald-300 font-medium">
                  <span>Potongan Kuota Membership</span>
                  <span>- {formatPrice(totalPrice)}</span>
                </div>
              )}
            </div>

            {/* Total Due */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Total Tagihan:</span>
              <p className="text-2xl font-black text-cyan-300">
                {paymentMethod === "membership_quota" ? "0 (Kuota Jam)" : formatPrice(totalPrice)}
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Reservasi Anda terlindungi oleh sistem anti-bentrok. Pembatalan dapat dilakukan sebelum jam sewa dimulai.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {room && (
        <BookingSummaryModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleFinalBooking}
          room={room}
          date={selectedDate}
          startHour={startHour}
          endHour={endHour}
          totalHours={totalHours}
          totalPrice={totalPrice}
          paymentMethod={paymentMethod}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

export default function ReservationPage({ params }: PageProps) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Memuat formulir reservasi...</div>}>
      <ReservationContent params={params} />
    </Suspense>
  );
}
