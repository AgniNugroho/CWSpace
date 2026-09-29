import Link from "next/link";
import { Building2, Mail, Phone, MapPin, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-slate-950/90 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 text-white shadow-md">
                <Building2 size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                CW<span className="text-cyan-400">Space</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Prototipe sistem pengelolaan coworking space terpadu untuk reservasi ruangan bebas bentrok, membership, dan pembayaran dengan rekomendasi cerdas.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Layanan</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-cyan-300 transition">Katalog Ruangan</Link>
              </li>
              <li>
                <Link href="/rekomendasi" className="hover:text-cyan-300 transition flex items-center gap-1">
                  <Sparkles size={12} className="text-cyan-400" />
                  <span>Rekomendasi SAW</span>
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-cyan-300 transition">Paket Membership</Link>
              </li>
              <li>
                <Link href="/waiting-list" className="hover:text-cyan-300 transition">Waiting List Antrean</Link>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Jam Operasional</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li>Senin – Jumat: 08.00 – 22.00 WIB</li>
              <li>Sabtu – Minggu: 09.00 – 20.00 WIB</li>
              <li className="pt-2 text-cyan-300/80 font-medium">Buka setiap hari untuk member aktif</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Kontak & Lokasi</h4>
            <ul className="mt-4 space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-cyan-400 shrink-0" />
                <span>Jl. Telekomunikasi No. 1, Bandung</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-cyan-400 shrink-0" />
                <span>support@cwspace.id</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-cyan-400 shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CWSpace Prototype. Tugas Akhir / Skripsi Pengembangan Prototipe Coworking Space.</p>
        </div>
      </div>
    </footer>
  );
}
