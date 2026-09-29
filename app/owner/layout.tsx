"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, LogOut, Building2, ExternalLink } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>("owner@cwspace.id");

  useEffect(() => {
    async function verifyOwnerAccess() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUserEmail(user.email ?? "owner@cwspace.id");
        }
      } catch {
        // Fallback
      }
    }

    void verifyOwnerAccess();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Executive Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl h-16 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-md">
              <Building2 size={18} />
            </div>
            <span className="font-bold text-white text-base">
              CW<span className="text-cyan-400">Space</span>
            </span>
          </Link>

          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300">
            Executive Owner Portal
          </span>
        </div>

        {/* Quick Nav Switchers */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/25 transition shadow-sm"
          >
            <Shield size={14} />
            <span className="hidden sm:inline">Beralih ke Panel Operasional Admin</span>
            <span className="sm:hidden">Admin</span>
            <ExternalLink size={12} />
          </Link>

          <span className="text-xs text-slate-400 hidden md:inline px-2">{userEmail}</span>

          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/10 transition"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">Portal Member</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              const supabase = createSupabaseBrowserClient();
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="rounded-xl border border-white/15 p-2 text-slate-300 hover:bg-rose-500/20 hover:text-rose-200 transition"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        {children}
      </main>
    </div>
  );
}
