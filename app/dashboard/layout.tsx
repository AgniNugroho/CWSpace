import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | CWSpace",
  description: "Dashboard akun CWSpace Anda.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}