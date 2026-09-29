"use client";

import { useEffect, useState } from "react";
import { DoorOpen, Plus, Trash2, CheckCircle2, XCircle, X } from "lucide-react";
import { Room, RoomCategory } from "@/lib/types/database";
import { fetchRoomsFromDatabase } from "@/lib/rooms/service";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<RoomCategory>("meeting_room");
  const [capacity, setCapacity] = useState<number>(8);
  const [pricePerHour, setPricePerHour] = useState<number>(120000);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadRooms() {
      try {
        const dbRooms = await fetchRoomsFromDatabase(false);
        setRooms(dbRooms);
      } catch {
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    }

    void loadRooms();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.from("rooms").update({ is_active: !currentStatus }).eq("id", id);
      setRooms(rooms.map((r) => (r.id === id ? { ...r, is_active: !currentStatus } : r)));
    } catch {
      setRooms(rooms.map((r) => (r.id === id ? { ...r, is_active: !currentStatus } : r)));
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("rooms")
        .insert({
          name,
          category,
          capacity,
          price_per_hour: pricePerHour,
          description,
          image_url: imageUrl,
          is_active: true,
        })
        .select()
        .single();

      if (!error && data) {
        setRooms([...rooms, { ...data, price_per_hour: Number(data.price_per_hour), facilities: [] }]);
      } else {
        // Fallback
        const newDemoRoom: Room = {
          id: `room-${Date.now()}`,
          name,
          category,
          capacity,
          price_per_hour: pricePerHour,
          description,
          image_url: imageUrl,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          facilities: [{ id: "f1", name: "High-Speed Wi-Fi 100Mbps" }],
        };
        setRooms([...rooms, newDemoRoom]);
      }

      setIsModalOpen(false);
      setName("");
      setDescription("");
    } catch {
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DoorOpen className="text-amber-400" size={24} />
            <span>Manajemen Data Ruangan</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Tambah, perbarui ketersediaan aktif, dan kelola kapasitas ruangan coworking space.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Ruangan Baru</span>
        </button>
      </div>

      {/* Rooms Table */}
      <div className="rounded-3xl border border-white/20 bg-white/10 overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-white/10 text-[11px] uppercase tracking-wider text-slate-400 bg-white/5">
              <tr>
                <th className="py-3.5 px-4">Ruangan</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Kapasitas</th>
                <th className="py-3.5 px-4">Tarif / Jam</th>
                <th className="py-3.5 px-4">Status Aktif</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-white/5 transition">
                  <td className="py-4 px-4 font-bold text-white flex items-center gap-3">
                    <img
                      src={room.image_url || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80"}
                      alt=""
                      className="size-12 rounded-xl object-cover border border-white/15"
                    />
                    <div>
                      <span>{room.name}</span>
                      <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{room.description}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="rounded-lg bg-blue-500/20 px-2 py-0.5 text-[10px] font-semibold text-blue-200">
                      {room.category.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-white">
                    {room.capacity} Orang
                  </td>
                  <td className="py-4 px-4 font-bold text-cyan-300">
                    {formatPrice(room.price_per_hour)}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(room.id, room.is_active)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold transition ${
                        room.is_active
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30"
                      }`}
                    >
                      {room.is_active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      <span>{room.is_active ? "Aktif" : "Non-Aktif"}</span>
                    </button>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => setRooms(rooms.filter((r) => r.id !== room.id))}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 transition"
                      title="Hapus Ruangan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-slate-900/95 p-6 sm:p-8 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-white">Tambah Data Ruangan Baru</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRoom} className="mt-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Nama Ruangan</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Meeting Room Gamma"
                  required
                  className="w-full rounded-xl border border-white/20 bg-slate-950 p-2.5 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-white/20 bg-slate-950 p-2.5 text-white outline-none focus:border-cyan-400"
                  >
                    <option value="meeting_room">Meeting Room</option>
                    <option value="private_office">Private Office</option>
                    <option value="event_space">Event Space</option>
                    <option value="hot_desk">Hot Desk</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-200">Kapasitas (Orang)</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-white/20 bg-slate-950 p-2.5 text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Tarif Sewa per Jam (IDR)</label>
                <input
                  type="number"
                  step={10000}
                  min={10000}
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-white/20 bg-slate-950 p-2.5 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">Deskripsi Fasilitas & Keunggulan</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan fasilitas dan peruntukan ruangan..."
                  rows={2}
                  className="w-full rounded-xl border border-white/20 bg-slate-950 p-2.5 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-200">URL Gambar (Unsplash/Direct link)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-slate-950 p-2.5 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 font-semibold text-slate-300 hover:bg-white/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-md transition"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Ruangan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
