"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, Sparkles, CreditCard, Clock, History, Shield, LineChart, LogOut, Menu, X, User } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { NotificationBell } from "./NotificationBell";
import { UserRole } from "@/lib/types/database";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserEmail(null);
          setUserRole(null);
          return;
        }

        setUserEmail(user.email ?? "Member");

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role) {
          setUserRole(profile.role as UserRole);
        } else {
          setUserRole("member");
        }
      } catch {
        // Fallback for offline/setup
      }
    }

    void loadUserData();
  }, [pathname]);

  async function handleSignOut() {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      setUserEmail(null);
      setUserRole(null);
      router.push("/login");
    } catch {
      router.push("/login");
    }
  }

  const navLinks = [
    { name: "Katalog Ruangan", href: "/", icon: Building2 },
    { name: "Rekomendasi (SAW)", href: "/rekomendasi", icon: Sparkles, highlight: true },
    { name: "Membership", href: "/membership", icon: CreditCard },
    { name: "Waiting List", href: "/waiting-list", icon: Clock },
    { name: "Riwayat", href: "/riwayat", icon: History },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/15 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 text-white shadow-lg shadow-blue-500/25 transition group-hover:scale-105">
            <Building2 size={22} />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-200 transition">
              CW<span className="text-cyan-400">Space</span>
            </span>
            <span className="hidden sm:inline-block ml-1 text-[10px] uppercase font-semibold text-blue-300 tracking-wider">
              Coworking
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "bg-blue-600/30 text-cyan-200 border border-cyan-400/40 shadow-sm"
                    : link.highlight
                    ? "text-cyan-300 hover:bg-cyan-500/10 hover:text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={15} />
                <span>{link.name}</span>
                {link.highlight && (
                  <span className="ml-0.5 rounded-full bg-cyan-400/20 px-1.5 py-0.2 text-[9px] font-bold text-cyan-300">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons & User Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {userEmail && <NotificationBell />}

          {/* Quick Admin & Owner Access Switchers */}
          {userRole && (userRole === "admin" || userRole === "owner") && (
            <Link
              href="/admin/dashboard"
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/15 px-3 py-2 text-xs font-medium text-amber-200 hover:bg-amber-500/25 transition"
            >
              <Shield size={14} />
              <span>Panel Admin</span>
            </Link>
          )}

          {userRole === "owner" && (
            <Link
              href="/owner/dashboard"
              className="hidden lg:flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-200 hover:bg-emerald-500/25 transition"
            >
              <LineChart size={14} />
              <span>Owner KPI</span>
            </Link>
          )}

          {userEmail ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white max-w-[120px] truncate">{userEmail}</span>
                <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                  {userRole ?? "Member"}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-slate-300 hover:bg-red-500/20 hover:text-red-300 transition"
                title="Keluar"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition"
              >
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition"
              >
                Daftar
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950/95 px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? "bg-blue-600/30 text-cyan-200 border border-cyan-400/40"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {userRole && (userRole === "admin" || userRole === "owner") && (
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/15 px-3 py-2.5 text-sm font-medium text-amber-200"
            >
              <Shield size={18} />
              <span>Panel Operasional Admin</span>
            </Link>
          )}

          {userRole === "owner" && (
            <Link
              href="/owner/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2.5 text-sm font-medium text-emerald-200"
            >
              <LineChart size={18} />
              <span>Dashboard Analitik Owner</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
