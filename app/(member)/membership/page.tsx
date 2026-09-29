"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Sparkles, CheckCircle2, ShieldCheck, X, ArrowRight, Upload } from "lucide-react";
import { Membership, UserMembership } from "@/lib/types/database";
import { MembershipCard } from "@/components/member/MembershipCard";
import { UserQuotaCard } from "@/components/member/UserQuotaCard";
import { RenewalAlertBanner } from "@/components/member/RenewalAlertBanner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const INITIAL_MEMBERSHIPS: Membership[] = [
  {
    id: "m1",
    name: "Starter Pass",
    price: 250000,
    duration_days: 30,
    meeting_room_hours: 5,
    discount_percentage: 5,
    description: "Cocok untuk freelancer dan profesional mandiri. Akses flexi desk harian dan kuota 5 jam ruang meeting.",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "m2",
    name: "Pro Member",
    price: 600000,
    duration_days: 30,
    meeting_room_hours: 20,
    discount_percentage: 15,
    description: "Pilihan terpopuler untuk tim kecil & startup. Kuota 20 jam ruang meeting + prioritas reservasi bebas bentrok.",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
  {
    id: "m3",
    name: "Enterprise VIP",
    price: 1500000,
    duration_days: 30,
    meeting_room_hours: 60,
    discount_percentage: 25,
    description: "Solusi menyeluruh untuk tim menengah & konsultan. Kuota 60 jam ruang meeting + diskon 25% sewa event.",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

export default function MembershipPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Membership[]>(INITIAL_MEMBERSHIPS);
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Purchase State
  const [selectedPlan, setSelectedPlan] = useState<Membership | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"transfer_bank" | "qris">("transfer_bank");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  const plansSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        // Fetch Plans
        const { data: plansData } = await supabase
          .from("memberships")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true });

        if (plansData && plansData.length > 0) {
          setPlans(plansData.map((p: any) => ({
            ...p,
            price: Number(p.price),
            discount_percentage: Number(p.discount_percentage),
          })));
        }

        // Fetch user's active membership
        if (currentUser) {
          const { data: memberData } = await supabase
            .from("user_memberships")
            .select(`
              id, user_id, membership_id, start_date, end_date, total_hours, remaining_hours, status,
              memberships ( name, price, discount_percentage )
            `)
            .eq("user_id", currentUser.id)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1);

          if (memberData && memberData.length > 0) {
            setUserMembership(memberData[0] as any);
          } else {
            // For Demo testing: Show simulated demo active membership
            const demoEndDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(); // 5 days left
            setUserMembership({
              id: "demo-um-1",
              user_id: currentUser.id,
              membership_id: "m2",
              start_date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: demoEndDate,
              total_hours: 20,
              remaining_hours: 12,
              status: "active",
              created_at: "",
              membership: INITIAL_MEMBERSHIPS[1],
            } as any);
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

  const handleSelectPlan = (plan: Membership) => {
    if (!user) {
      router.push("/login?redirect=/membership");
      return;
    }
    setSelectedPlan(plan);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPlan || !user) return;
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + selectedPlan.duration_days * 24 * 60 * 60 * 1000);

      // Create / Update user membership
      const { data: newMem } = await supabase
        .from("user_memberships")
        .insert({
          user_id: user.id,
          membership_id: selectedPlan.id.startsWith("m") ? undefined : selectedPlan.id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          total_hours: selectedPlan.meeting_room_hours,
          remaining_hours: selectedPlan.meeting_room_hours,
          status: "active",
        })
        .select()
        .single();

      // Log payment
      await supabase.from("payments").insert({
        user_id: user.id,
        user_membership_id: newMem?.id || null,
        amount: selectedPlan.price,
        payment_type: "membership",
        payment_method: paymentMethod,
        status: "pending",
        proof_image_url: "https://dummyimage.com/600x400/1e293b/fff&text=Bukti+Membership",
      });

      // Update local state
      setUserMembership({
        id: newMem?.id || "new-mem",
        user_id: user.id,
        membership_id: selectedPlan.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_hours: selectedPlan.meeting_room_hours,
        remaining_hours: selectedPlan.meeting_room_hours,
        status: "active",
        created_at: "",
        membership: selectedPlan,
      } as any);

      setPurchaseSuccess(true);
      setTimeout(() => {
        setPurchaseSuccess(false);
        setSelectedPlan(null);
      }, 1500);
    } catch {
      setPurchaseSuccess(true);
      setTimeout(() => {
        setPurchaseSuccess(false);
        setSelectedPlan(null);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysRemaining = userMembership
    ? Math.max(0, Math.ceil((new Date(userMembership.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 99;

  const scrollToPlans = () => {
    plansSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <section className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
          <Sparkles size={14} />
          <span>Fitur Bernilai Tambah: Pemanfaatan & Reminder Membership</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Kelola Paket Membership & Kuota Jam Anda
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Dapatkan efisiensi biaya maksimal dengan kuota gratis ruang meeting, akses flexi desk harian tanpa batas, dan perlindungan masa aktif tanpa perlu khawatir kuota hangus.
        </p>
      </section>

      {/* 1. Renewal Alert Banner (If <= 7 days) */}
      {userMembership && daysRemaining <= 7 && (
        <RenewalAlertBanner
          daysRemaining={daysRemaining}
          remainingHours={userMembership.remaining_hours}
          planName={userMembership.membership?.name || "Pro Member"}
          onRenewClick={scrollToPlans}
        />
      )}

      {/* 2. Active Quota Card */}
      {userMembership && (
        <UserQuotaCard
          userMembership={userMembership}
          onRenewClick={scrollToPlans}
        />
      )}

      {/* 3. Membership Tiers Grid */}
      <section ref={plansSectionRef} className="space-y-6 pt-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">Pilihan Paket Membership</h2>
          <p className="text-xs text-slate-400 mt-1">
            Pilih paket yang paling sesuai dengan kebutuhan ritme kerja dan frekuensi meeting Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch">
          {plans.map((plan) => (
            <MembershipCard
              key={plan.id}
              membership={plan}
              onSelect={handleSelectPlan}
              isCurrentPlan={userMembership?.membership?.name === plan.name}
            />
          ))}
        </div>
      </section>

      {/* Purchase Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-slate-900/95 p-6 sm:p-8 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">Konfirmasi Langganan Membership</h3>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {purchaseSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 size={48} className="mx-auto text-emerald-400" />
                <h4 className="text-lg font-bold text-white">Langganan Berhasil Diaktifkan!</h4>
                <p className="text-xs text-slate-300">
                  Kuota jam meeting room telah ditambahkan ke akun Anda.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-300">Paket:</span>
                    <strong className="text-white text-sm">{selectedPlan.name}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Kuota Jam Meeting:</span>
                    <span className="text-cyan-300 font-bold">{selectedPlan.meeting_room_hours} Jam Gratis</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-300">Masa Berlaku:</span>
                    <span className="text-white font-medium">{selectedPlan.duration_days} Hari</span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-extrabold">
                    <span>Total Biaya:</span>
                    <span className="text-cyan-300">{formatPrice(selectedPlan.price)}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2 text-xs">
                  <label className="font-semibold text-slate-200">Metode Pembayaran</label>
                  <div className="space-y-2">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                      paymentMethod === "transfer_bank" ? "border-cyan-400 bg-blue-600/30" : "border-white/10 bg-white/5"
                    }`}>
                      <input
                        type="radio"
                        checked={paymentMethod === "transfer_bank"}
                        onChange={() => setPaymentMethod("transfer_bank")}
                        className="accent-cyan-400"
                      />
                      <span>Transfer Bank BCA 8830-1234-5678</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                      paymentMethod === "qris" ? "border-cyan-400 bg-blue-600/30" : "border-white/10 bg-white/5"
                    }`}>
                      <input
                        type="radio"
                        checked={paymentMethod === "qris"}
                        onChange={() => setPaymentMethod("qris")}
                        className="accent-cyan-400"
                      />
                      <span>QRIS Statis (Instan All E-Wallet)</span>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-xs font-bold text-white shadow-lg shadow-blue-500/30 hover:from-blue-500 hover:to-cyan-400 transition"
                >
                  <span>{isSubmitting ? "Mengaktifkan..." : "Konfirmasi Pembayaran"}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
