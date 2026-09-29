import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Room } from "@/lib/types/database";

export async function fetchRoomsFromDatabase(onlyActive: boolean = true): Promise<Room[]> {
  try {
    const supabase = createSupabaseBrowserClient();
    let query = supabase
      .from("rooms")
      .select(`
        id, name, category, capacity, price_per_hour, description, image_url, is_active, created_at, updated_at,
        room_facilities (
          facilities ( id, name )
        )
      `)
      .order("created_at", { ascending: true });

    if (onlyActive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    const mapped: Room[] = data.map((r: any) => ({
      id: String(r.id),
      name: r.name,
      category: r.category,
      capacity: r.capacity,
      price_per_hour: Number(r.price_per_hour),
      description: r.description,
      image_url: r.image_url,
      is_active: r.is_active,
      created_at: r.created_at,
      updated_at: r.updated_at,
      facilities: (r.room_facilities || []).map((rf: any) => rf.facilities).filter(Boolean),
    }));

    return mapped.sort((a, b) => {
      const numA = parseInt(a.id, 10);
      const numB = parseInt(b.id, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.id.localeCompare(b.id);
    });
  } catch {
    return [];
  }
}

export async function fetchRoomByIdFromDatabase(id: string): Promise<Room | null> {
  try {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("rooms")
      .select(`
        id, name, category, capacity, price_per_hour, description, image_url, is_active, created_at, updated_at,
        room_facilities (
          facilities ( id, name )
        )
      `)
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: String(data.id),
      name: data.name,
      category: data.category,
      capacity: data.capacity,
      price_per_hour: Number(data.price_per_hour),
      description: data.description,
      image_url: data.image_url,
      is_active: data.is_active,
      created_at: data.created_at,
      updated_at: data.updated_at,
      facilities: (data.room_facilities || []).map((rf: any) => rf.facilities).filter(Boolean),
    };
  } catch {
    return null;
  }
}
