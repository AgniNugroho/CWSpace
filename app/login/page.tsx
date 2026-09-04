import { LoginForm, SmokeyBackground } from "@/components/ui/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-5 py-12">
      <SmokeyBackground />
      <div className="absolute inset-0 bg-slate-950/45" aria-hidden="true" />
      <div className="relative z-10 flex w-full justify-center">
        <LoginForm />
      </div>
    </main>
  );
}