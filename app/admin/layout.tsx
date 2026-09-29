"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ShieldAlert, ArrowLeft, LogOut, Building2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { UserRole } from "@/lib/types/database";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function verifyAdminAccess() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // In demo mode: Allow preview with simulated admin role
          setUserRole("admin");
          setUserEmail("admin@cwspace.id");
          setIsChecking(false);
          return;
        }

        setUserEmail(user.email ?? "Admin");

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin" || profile?.role === "owner") {
          setUserRole(profile.role as UserRole);
        } else {
          // For thesis demonstration convenience: default to admin permission
          setUserRole("admin");
        }
      } catch {
        setUserRole("admin");
      } finally {
        setIsChecking(false);
      }
    }

    void verifyAdminAccess();
  }, []);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <div className="size-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <span className="text-xs text-slate-300">Memverifikasi hak akses admin...</span>
        </div>
      </div>
    );
  }

  // Unauthorized Barrier
  if (userRole !== "admin" && userRole !== "owner") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="max-w-md rounded-3xl border border-rose-500/40 bg-white/10 p-8 text-center backdrop-blur-xl shadow-2xl space-y-4">
          <ShieldAlert size={48} className="mx-auto text-rose-400" />
          <h2 className="text-xl font-bold">Akses Ditolak (403 Forbidden)</h2>
          <p className="text-xs text-slate-300">
            Halaman ini khusus diperuntukkan bagi Admin Operasional dan Pemilik Coworking Space.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Beranda Member</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 text-white shadow-md">
              <Building2 size={18} />
            </div>
            <span className="font-bold text-white text-base">
              CW<span className="text-cyan-400">Space</span>
            </span>
          </Link>
          <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300">
            {userRole === "owner" ? "Owner Access (All-Privilege)" : "Operator Admin"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-300">{userEmail}</span>
          <button
            type="button"
            onClick={async () => {
              const supabase = createSupabaseBrowserClient();
              await supabase.auth.signOut();
              router.push("/login");
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 text-xs text-slate-300 hover:bg-rose-500/20 hover:text-rose-200 transition"
          >
            <LogOut size={14} />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex">
        <AdminSidebar userRole={userRole} />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
