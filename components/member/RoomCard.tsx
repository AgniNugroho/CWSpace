import Link from "next/link";
import { Users, ArrowRight, CheckCircle2, Calendar } from "lucide-react";
import { Room } from "@/lib/types/database";

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  const categoryLabels: Record<string, string> = {
    meeting_room: "Ruang Rapat",
    private_office: "Studio / Kantor Privat",
    event_space: "Aula Acara & Workshop",
    hot_desk: "Focus Desk / Pod",
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-400/50 hover:shadow-cyan-500/10">
      {/* Room Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <img
          src={room.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80"}
          alt={room.name}
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Category Pill */}
        <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 backdrop-blur-md">
          {categoryLabels[room.category] || room.category}
        </span>

        {/* Capacity Pill */}
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/20 bg-slate-950/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
          <Users size={12} className="text-cyan-300" />
          <span>{room.capacity} Orang</span>
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-white group-hover:text-cyan-200 transition line-clamp-1">
          {room.name}
        </h3>
        
        <p className="mt-2 text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {room.description || "Ruang coworking berfasilitas lengkap untuk kelancaran kegiatan Anda."}
        </p>

        {/* Facilities tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(room.facilities || []).slice(0, 3).map((f) => (
            <span
              key={f.id}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-900/30 px-2 py-0.5 text-[10px] font-medium text-blue-200 border border-blue-500/20"
            >
              <CheckCircle2 size={10} className="text-cyan-400" />
              <span>{f.name}</span>
            </span>
          ))}
          {(room.facilities?.length || 0) > 3 && (
            <span className="rounded-lg bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400">
              +{room.facilities!.length - 3} lainnya
            </span>
          )}
        </div>

        {/* Price & Action */}
        <div className="mt-auto pt-5 border-t border-white/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">Tarif Sewa</span>
            <p className="text-base font-extrabold text-cyan-300">
              {formatPrice(room.price_per_hour)}{" "}
              <span className="text-[11px] font-normal text-slate-400">/ jam</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/ruangan/${room.id}`}
              className="flex items-center justify-center size-9 rounded-xl border border-white/20 bg-white/5 text-slate-200 hover:bg-white/20 hover:text-white transition"
              title="Lihat Jadwal & Detail"
            >
              <Calendar size={16} />
            </Link>
            
            <Link
              href={`/reservasi/${room.id}`}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition"
            >
              <span>Pesan</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
