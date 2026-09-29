"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface NotificationItem {
  id: string;
  type: "waiting_list" | "membership_expiry";
  title: string;
  message: string;
  link: string;
  timeAgo?: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchNotifications() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const notifs: NotificationItem[] = [];

        // 1. Fetch Waiting List Notifications
        const { data: waitlists } = await supabase
          .from("waiting_lists")
          .select("id, desired_start_time, claim_deadline, rooms(name)")
          .eq("user_id", user.id)
          .eq("status", "notified");

        if (waitlists && waitlists.length > 0) {
          waitlists.forEach((wl: any) => {
            const roomName = wl.rooms?.name || "Ruangan";
            notifs.push({
              id: `wl-${wl.id}`,
              type: "waiting_list",
              title: "Slot Ruangan Tersedia!",
              message: `${roomName} siap untuk Anda sewa. Segera klaim slot Anda!`,
              link: "/waiting-list",
            });
          });
        }

        // 2. Fetch Membership Expiry Warning (<= 7 days)
        const { data: memberships } = await supabase
          .from("user_memberships")
          .select("id, end_date, remaining_hours, memberships(name)")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("end_date", { ascending: true })
          .limit(1);

        if (memberships && memberships.length > 0) {
          const userMem = memberships[0];
          const endDate = new Date(userMem.end_date);
          const now = new Date();
          const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays <= 7 && diffDays >= 0) {
            notifs.push({
              id: `mem-${userMem.id}`,
              type: "membership_expiry",
              title: "Masa Aktif Hampir Habis",
              message: `Membership berakhir dalam ${diffDays} hari. Sisa kuota: ${userMem.remaining_hours} jam.`,
              link: "/membership",
            });
          }
        }

        if (isMounted) {
          setNotifications(notifs);
          setUnreadCount(notifs.length);
        }
      } catch {
        // Ignored in preview/offline mode
      }
    }

    void fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex size-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white transition hover:bg-white/20 hover:text-cyan-200"
        aria-label="Notifikasi"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-lg animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/20 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-2xl z-50">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-semibold text-sm">Notifikasi Terkini</h3>
            <span className="rounded-full bg-blue-600/30 px-2 py-0.5 text-xs text-blue-200 font-medium">
              {unreadCount} baru
            </span>
          </div>

          <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                Tidak ada notifikasi baru saat ini.
              </p>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link}
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:border-cyan-300/40 hover:bg-white/10"
                >
                  <div className="mt-0.5 rounded-lg p-2 bg-blue-600/20 text-cyan-300">
                    {notif.type === "waiting_list" ? (
                      <Clock size={16} />
                    ) : (
                      <AlertTriangle size={16} className="text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white">{notif.title}</p>
                    <p className="mt-1 text-[11px] text-slate-300 line-clamp-2">{notif.message}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 mt-1" />
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
