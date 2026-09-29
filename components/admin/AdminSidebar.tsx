"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, LayoutDashboard, DoorOpen, CalendarDays, 
  CreditCard, Clock, LineChart, ArrowLeft, Shield 
} from "lucide-react";
import { UserRole } from "@/lib/types/database";

interface AdminSidebarProps {
  userRole?: UserRole | null;
}

export function AdminSidebar({ userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  const links = [
    { name: "Ringkasan Operasional", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Manajemen Ruangan", href: "/admin/ruangan", icon: DoorOpen },
    { name: "Jadwal Reservasi", href: "/admin/reservasi", icon: CalendarDays },
    { name: "Verifikasi Pembayaran", href: "/admin/pembayaran", icon: CreditCard },
    { name: "Monitoring Waiting List", href: "/admin/waiting-list", icon: Clock },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-white/10 bg-slate-950/90 backdrop-blur-xl flex flex-col justify-between p-5 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Panel Operasional</h2>
            <p className="text-[10px] text-amber-300/80 font-medium">Operator Coworking</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Switchers */}
      <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
        {userRole === "owner" && (
          <Link
            href="/owner/dashboard"
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-emerald-300 hover:bg-emerald-500/20 transition font-medium"
          >
            <LineChart size={15} />
            <span>Dashboard Owner (KPI)</span>
          </Link>
        )}

        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-300 hover:bg-white/15 transition font-medium"
        >
          <ArrowLeft size={15} />
          <span>Ke Halaman Member</span>
        </Link>
      </div>
    </aside>
  );
}
