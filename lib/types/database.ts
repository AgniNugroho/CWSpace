// TypeScript definitions mapping directly to PostgreSQL ENUMs and tables in Supabase

export type UserRole = "member" | "admin" | "owner";

export type RoomCategory = "meeting_room" | "private_office" | "event_space" | "hot_desk";

export type ReservationStatus = 
  | "menunggu_pembayaran" 
  | "menunggu_verifikasi" 
  | "dikonfirmasi" 
  | "selesai" 
  | "dibatalkan";

export type PaymentMethod = "transfer_bank" | "qris" | "membership_quota";

export type PaymentStatus = "pending" | "verified" | "rejected";

export type PaymentType = "reservasi" | "membership";

export type UserMembershipStatus = "active" | "expired" | "exhausted";

export type WaitingListStatus = "waiting" | "notified" | "claimed" | "expired" | "cancelled";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Facility {
  id: string;
  name: string;
  created_at?: string;
}

export interface Room {
  id: string;
  name: string;
  category: RoomCategory;
  capacity: number;
  price_per_hour: number;
  description?: string | null;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  facilities?: Facility[];
}

export interface Membership {
  id: string;
  name: string;
  price: number;
  duration_days: number;
  meeting_room_hours: number;
  discount_percentage: number;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMembership {
  id: string;
  user_id: string;
  membership_id: string;
  start_date: string;
  end_date: string;
  total_hours: number;
  remaining_hours: number;
  status: UserMembershipStatus;
  created_at: string;
  membership?: Membership;
}

export interface Reservation {
  id: string;
  user_id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_price: number;
  payment_method: PaymentMethod;
  status: ReservationStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  room?: Room;
  profile?: Profile;
}

export interface Payment {
  id: string;
  user_id: string;
  reservation_id?: string | null;
  user_membership_id?: string | null;
  amount: number;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  proof_image_url?: string | null;
  status: PaymentStatus;
  verified_by?: string | null;
  verified_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  reservation?: Reservation;
  user_membership?: UserMembership;
  user_profile?: Profile;
}

export interface WaitingList {
  id: string;
  user_id: string;
  room_id: string;
  desired_start_time: string;
  desired_end_time: string;
  queue_number: number;
  status: WaitingListStatus;
  notified_at?: string | null;
  claim_deadline?: string | null;
  created_at: string;
  room?: Room;
  profile?: Profile;
}

// Interfaces for SAW Recommendation Engine
export interface UserPreferences {
  attendees: number;
  requiredFacilities: string[];
  maxBudgetPerHour: number;
  activityType: RoomCategory | "meeting" | "workshop" | "focus" | "podcast";
}

export interface SawScoreBreakdown {
  capacityScore: number;
  facilityScore: number;
  priceScore: number;
  categoryScore: number;
  totalScore: number;
  matchPercentage: number;
}

export interface SawResult {
  room: Room;
  scores: SawScoreBreakdown;
}
