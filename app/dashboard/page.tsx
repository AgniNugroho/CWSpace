"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Building2, Shield, LineChart, ArrowRight } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { UserRole } from "@/lib/types/database";

export default function DashboardPage() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState("Memeriksa kredensial sesi...");
  const [destination, setDestination] = useState<string>("/");
  const [destinationLabel, setDestinationLabel] = useState<string>("Portal Member");
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleRoleBasedRedirect() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (isMounted) router.replace("/login");
          return;
        }

        if (isMounted) {
          setStatusMessage(`Autentikasi berhasil (${user.email}). Mendeteksi hak akses...`);
        }

        // Check profile role
        let detectedRole: UserRole = "member";
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profile?.role) {
            detectedRole = profile.role as UserRole;
          } else if (user.email?.toLowerCase().includes("owner")) {
            detectedRole = "owner";
          } else if (user.email?.toLowerCase().includes("admin")) {
            detectedRole = "admin";
          }
        } catch {
          // Fallback based on email if network or table issue
          if (user.email?.toLowerCase().includes("owner")) {
            detectedRole = "owner";
          } else if (user.email?.toLowerCase().includes("admin")) {
            detectedRole = "admin";
          }
        }

        if (!isMounted) return;
        setUserRole(detectedRole);

        let targetUrl = "/";
        let targetLabel = "Portal Katalog & Reservasi";

        if (detectedRole === "owner") {
          targetUrl = "/owner/dashboard";
          targetLabel = "Dashboard Eksekutif Owner";
        } else if (detectedRole === "admin") {
          targetUrl = "/admin/dashboard";
          targetLabel = "Panel Operasional Admin";
        }

        setDestination(targetUrl);
        setDestinationLabel(targetLabel);
        setStatusMessage(`Mengarahkan ke ${targetLabel}...`);

        // Short timeout for visual smoothness
        const timer = setTimeout(() => {
          if (isMounted) {
            router.replace(targetUrl);
          }
        }, 600);

        return () => clearTimeout(timer);
      } catch {
        if (isMounted) {
          router.replace("/");
        }
      }
    }

    void handleRoleBasedRedirect();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12 text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <section className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-2xl space-y-6">
        {/* CWSpace Brand Badge */}
        <div className="flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/30">
            {userRole === "owner" ? (
              <LineChart size={28} />
            ) : userRole === "admin" ? (
              <Shield size={28} />
            ) : (
              <Building2 size={28} />
            )}
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CW<span className="text-cyan-400">Space</span>
          </h1>
          <p className="mt-2 text-sm text-slate-300">{statusMessage}</p>
        </div>

        {/* Loading Spinner */}
        <div className="flex items-center justify-center gap-3 py-2">
          <Loader2 className="animate-spin text-cyan-400" size={24} />
          <span className="text-xs text-slate-400 font-mono">Memproses perutean cerdas...</span>
        </div>

        {/* Manual Redirect Fallback Link */}
        <div className="pt-4 border-t border-white/10 text-xs">
          <p className="text-slate-400 mb-2">Tidak dialihkan secara otomatis?</p>
          <Link
            href={destination}
            className="inline-flex items-center gap-1.5 font-semibold text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
          >
            <span>Buka {destinationLabel} sekarang</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>
    </main>
  );
}