"use client";

import { useEffect, useState } from "react";
import { Room } from "@/lib/types/database";
import { fetchRoomsFromDatabase } from "@/lib/rooms/service";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { LandingView } from "@/components/landing/LandingView";
import { MemberCatalogView } from "@/components/member/MemberCatalogView";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function initializePage() {
      // 1. Fetch Rooms from Database
      try {
        const dbRooms = await fetchRoomsFromDatabase(true);
        if (isMounted) setRooms(dbRooms);
      } catch {
        if (isMounted) setRooms([]);
      } finally {
        if (isMounted) setIsLoadingRooms(false);
      }

      // 2. Check Auth State
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (isMounted) {
          setUserEmail(user?.email ?? null);
        }
      } catch {
        if (isMounted) setUserEmail(null);
      } finally {
        if (isMounted) setIsCheckingAuth(false);
      }
    }

    void initializePage();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {isCheckingAuth || isLoadingRooms ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-xl">
            <Loader2 className="animate-spin text-cyan-400" size={28} />
          </div>
          <p className="text-sm font-medium text-slate-300">Memuat layanan CWSpace...</p>
        </div>
      ) : userEmail ? (
        /* Logged In Member View: Compact Dashboard & Room Catalog (Hero section removed) */
        <MemberCatalogView userEmail={userEmail} rooms={rooms} />
      ) : (
        /* Public Guest View: Landing Page with Hero Section, Feature Showcase & CTAs */
        <LandingView rooms={rooms} />
      )}
    </div>
  );
}
