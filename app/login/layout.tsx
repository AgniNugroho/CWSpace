import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk | CWSpace",
  description: "Masuk ke akun CWSpace Anda.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}