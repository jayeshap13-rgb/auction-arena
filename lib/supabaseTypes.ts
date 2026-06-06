export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "admin" | "owner" | "viewer";
export type LeagueMode = "admin" | "owner";
export type LeagueStatus = "Draft" | "Open" | "Live" | "Paused" | "Completed";
export type LotStatus = "Queued" | "Under Auction" | "Sold" | "Unsold";
export type ApprovalStatus = "Pending" | "Approved" | "Rejected";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; role: UserRole; name: string; email: string; status: "Active" | "Disabled"; created_at: string };
        Insert: { id: string; role?: UserRole; name: string; email: string; status?: "Active" | "Disabled"; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      leagues: {
        Row: {
          id: string;
          created_by: string;
          name: string;
          sport: string;
          management_mode: LeagueMode;
          visibility: "public" | "private";
          status: LeagueStatus;
          purse: number;
          bid_increment: number;
          max_teams: number;
          max_players_per_team: number;
          current_player_id: string | null;
          timer_seconds: number;
          sponsor: string | null;
          round: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["leagues"]["Row"]> & { created_by: string; name: string; sport: string; management_mode: LeagueMode };
        Update: Partial<Database["public"]["Tables"]["leagues"]["Row"]>;
      };
      teams: {
        Row: { id: string; league_id: string; name: string; owner_name: string; owner_user_id: string | null; logo_url: string | null; color: string; purse: number; spent: number; squad: number; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["teams"]["Row"]> & { league_id: string; name: string; owner_name: string };
        Update: Partial<Database["public"]["Tables"]["teams"]["Row"]>;
      };
      players: {
        Row: { id: string; league_id: string; name: string; role: string; category: string; base_price: number; rating: string | null; stats: string | null; photo_url: string | null; status: LotStatus; sold_to_team_id: string | null; sold_price: number | null; approval_status: ApprovalStatus; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["players"]["Row"]> & { league_id: string; name: string; role: string; category: string; base_price: number };
        Update: Partial<Database["public"]["Tables"]["players"]["Row"]>;
      };
      bids: {
        Row: { id: string; league_id: string; player_id: string; team_id: string; amount: number; placed_by: string; created_at: string; undone_at: string | null };
        Insert: Partial<Database["public"]["Tables"]["bids"]["Row"]> & { league_id: string; player_id: string; team_id: string; amount: number; placed_by: string };
        Update: Partial<Database["public"]["Tables"]["bids"]["Row"]>;
      };
      owner_requests: {
        Row: { id: string; league_id: string; team_id: string; owner_user_id: string; status: ApprovalStatus; payment_status: PaymentStatus; payment_id: string | null; created_at: string; updated_at: string };
        Insert: Partial<Database["public"]["Tables"]["owner_requests"]["Row"]> & { league_id: string; team_id: string; owner_user_id: string };
        Update: Partial<Database["public"]["Tables"]["owner_requests"]["Row"]>;
      };
      payments: {
        Row: { id: string; league_id: string; owner_request_id: string | null; amount: number; currency: "INR"; purpose: "admin_extra_team" | "owner_login"; provider: "razorpay" | "manual"; provider_payment_id: string | null; status: PaymentStatus; metadata: Json; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["payments"]["Row"]> & { league_id: string; amount: number; purpose: "admin_extra_team" | "owner_login" };
        Update: Partial<Database["public"]["Tables"]["payments"]["Row"]>;
      };
      audit_logs: {
        Row: { id: string; league_id: string; actor_id: string | null; action: string; entity_type: string; entity_id: string | null; metadata: Json; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & { league_id: string; action: string; entity_type: string };
        Update: never;
      };
    };
  };
};
