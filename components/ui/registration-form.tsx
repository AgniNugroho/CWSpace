"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Lock, User } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function RegistrationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess("");
    if (!name || !email || !password || !confirmation) {
      setError("Semua kolom wajib diisi.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user?.identities?.length === 0) {
        setError("Email ini sudah terdaftar. Silakan masuk.");
      } else {
        setSuccess("Pendaftaran berhasil. Periksa email untuk mengonfirmasi akun Anda.");
      }
    } catch {
      setError("Konfigurasi Supabase belum lengkap. Periksa file .env.local.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-sm rounded-xl border border-white/20 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:rounded-2xl sm:p-8">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Buat Akun</h1>
        <p className="mt-2 text-sm text-blue-100">Mulai gunakan CWSpace hari ini</p>
      </header>
      <form className="mt-7 space-y-5 sm:mt-9 sm:space-y-7" onSubmit={submit} noValidate>
        <FloatingField label="Nama Lengkap" type="text" value={name} onChange={setName} autoComplete="name" />
        <FloatingField label="Alamat Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <FloatingField label="Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
        <FloatingField label="Konfirmasi Password" type="password" value={confirmation} onChange={setConfirmation} autoComplete="new-password" />
        {error && <p className="text-center text-sm text-red-200" role="alert">{error}</p>}
        {success && <p className="text-center text-sm text-emerald-200" role="status">{success}</p>}
        <button type="submit" disabled={isSubmitting} className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Mendaftarkan..." : "Daftar"} <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" /></button>
      </form>
      <p className="mt-7 text-center text-xs text-blue-100">Sudah punya akun? <Link href="/login" className="font-semibold text-cyan-200 hover:text-white">Masuk</Link></p>
    </section>
  );
}

type FloatingFieldProps = {
  label: string;
  type: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
};

function FloatingField({ label, type, value, onChange, autoComplete }: FloatingFieldProps) {
  const Icon = type === "password" ? Lock : User;

  return (
    <label className="group relative block border-b-2 border-white/35 pt-1 transition focus-within:border-blue-400">
      <Icon className="absolute left-0 top-2.5 text-blue-100 transition-all duration-300 group-focus-within:-top-4 group-focus-within:text-blue-300" size={17} />
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="peer w-full bg-transparent py-2 pl-7 text-sm text-white outline-none placeholder:text-transparent" placeholder={label} autoComplete={autoComplete} />
      <span className="pointer-events-none absolute left-7 top-2.5 text-sm text-blue-100 transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-300 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">{label}</span>
    </label>
  );
}