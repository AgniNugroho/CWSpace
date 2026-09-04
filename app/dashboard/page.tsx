"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.replace("/login");
          return;
        }
        if (active) setEmail(user.email ?? "");
      } catch {
        router.replace("/login");
      }
    }

    void loadUser();
    return () => { active = false; };
  }, [router]);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-12 text-white">
      <section className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
        <p className="text-sm text-blue-200">Anda sudah masuk sebagai</p>
        <h1 className="mt-2 break-all text-2xl font-bold">{email || "Memuat akun..."}</h1>
        <button type="button" onClick={signOut} className="mt-8 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500">Keluar</button>
      </section>
    </main>
  );
}