"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowRight, Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const vertexSource = `
attribute vec4 a_position;
void main() { gl_Position = a_position; }
`;

const fragmentSource = `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
uniform vec3 uColor;

void main() {
  vec2 centered = (2.0 * gl_FragCoord.xy - iResolution.xy) / min(iResolution.x, iResolution.y);
  vec2 mouse = 2.0 * (iMouse / iResolution) - 1.0;
  vec2 distortion = centered;
  float time = iTime * 0.38;
  for (float index = 1.0; index < 7.0; index++) {
    distortion.x += 0.34 / index * cos(index * 2.1 * distortion.y + time + mouse.x * 2.0);
    distortion.y += 0.34 / index * cos(index * 2.1 * distortion.x + time + mouse.y * 2.0);
  }
  float wave = abs(sin(distortion.x + distortion.y + time));
  float glow = smoothstep(0.96, 0.12, wave);
  float vignette = 1.0 - 0.22 * dot(centered, centered);
  gl_FragColor = vec4(uColor * glow * vignette, 1.0);
}
`;

type SmokeyBackgroundProps = {
  color?: string;
  className?: string;
};

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized.length === 3 ? normalized.split("").map((part) => part + part).join("") : normalized, 16);
  return [(value >> 16 & 255) / 255, (value >> 8 & 255) / 255, (value & 255) / 255];
}

export function SmokeyBackground({ color = "#1d4ed8", className = "" }: SmokeyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("webgl", { alpha: false });
    if (!context) return;
    const gl: WebGLRenderingContext = context;

    function compileShader(type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "iResolution");
    const time = gl.getUniformLocation(program, "iTime");
    const mouse = gl.getUniformLocation(program, "iMouse");
    const shaderColor = gl.getUniformLocation(program, "uColor");
    const [red, green, blue] = hexToRgb(color);
    gl.uniform3f(shaderColor, red, green, blue);

    let frame = 0;
    const startedAt = performance.now();
    const render = () => {
      const ratio = Math.min(window.devicePixelRatio, 2);
      const width = Math.round(canvas.clientWidth * ratio);
      const height = Math.round(canvas.clientHeight * ratio);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      const currentMouse = mouseRef.current;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(resolution, width, height);
      gl.uniform1f(time, (performance.now() - startedAt) / 1000);
      gl.uniform2f(mouse, (currentMouse.active ? currentMouse.x : canvas.clientWidth / 2) * ratio, (currentMouse.active ? canvas.clientHeight - currentMouse.y : canvas.clientHeight / 2) * ratio);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = requestAnimationFrame(render);
    };
    const move = (event: MouseEvent) => {
      const bounds = canvas.getBoundingClientRect();
      mouseRef.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top, active: true };
    };
    const leave = () => { mouseRef.current.active = false; };
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseleave", leave);
    render();
    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseleave", leave);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(buffer);
    };
  }, [color]);

  return <canvas ref={canvasRef} className={`absolute inset-0 size-full ${className}`} aria-hidden="true" />;
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Email atau password tidak valid.");
        return;
      }
      router.replace("/dashboard");
    } catch {
      setError("Konfigurasi Supabase belum lengkap. Periksa file .env.local.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-sm rounded-2xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-xl sm:p-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-white">Selamat Datang</h1>
        <p className="mt-2 text-sm text-blue-100">Masuk untuk melanjutkan</p>
      </header>
      <form className="mt-9 space-y-7" onSubmit={submit} noValidate>
        <label className="group relative block border-b-2 border-white/35 pt-1 transition focus-within:border-blue-400">
          <User className="absolute left-0 top-2.5 text-blue-100 transition-all duration-300 group-focus-within:-top-4 group-focus-within:text-blue-300" size={17} />
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="peer w-full bg-transparent py-2 pl-7 text-sm text-white outline-none placeholder:text-transparent" placeholder="Alamat email" autoComplete="email" />
          <span className="pointer-events-none absolute left-7 top-2.5 text-sm text-blue-100 transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-300 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">Alamat Email</span>
        </label>
        <label className="group relative block border-b-2 border-white/35 pt-1 transition focus-within:border-blue-400">
          <Lock className="absolute left-0 top-2.5 text-blue-100 transition-all duration-300 group-focus-within:-top-4 group-focus-within:text-blue-300" size={17} />
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="peer w-full bg-transparent py-2 pl-7 text-sm text-white outline-none placeholder:text-transparent" placeholder="Password" autoComplete="current-password" />
          <span className="pointer-events-none absolute left-7 top-2.5 text-sm text-blue-100 transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-blue-300 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs">Password</span>
        </label>
        {/* <div className="flex justify-end"><button type="button" className="text-xs text-blue-100 transition hover:text-white">Lupa Password?</button></div> */}
        {error && <p className="text-center text-sm text-red-200" role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting} className="group flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Memproses..." : "Masuk"} <ArrowRight size={19} className="transition-transform group-hover:translate-x-1" /></button>
        <div className="flex items-center gap-3 text-[11px] font-medium tracking-wide text-blue-100"><span className="h-px flex-1 bg-white/25" />ATAU LANJUTKAN DENGAN<span className="h-px flex-1 bg-white/25" /></div>
        <button type="button" className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50"><img src="/google.svg" alt="" className="size-5" />Masuk dengan Google</button>
      </form>
      <p className="mt-7 text-center text-xs text-blue-100">Belum punya akun? <Link href="/daftar" className="font-semibold text-cyan-200 hover:text-white">Daftar</Link></p>
    </section>
  );
}