export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          name: string
          set_name: string
          card_number: string | null
          rarity: string | null
          image_url: string | null
          market_price: number | null
          lowest_price: number | null
          price_change_percent: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          set_name: string
          card_number?: string | null
          rarity?: string | null
          image_url?: string | null
          market_price?: number | null
          lowest_price?: number | null
          price_change_percent?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          set_name?: string
          card_number?: string | null
          rarity?: string | null
          image_url?: string | null
          market_price?: number | null
          lowest_price?: number | null
          price_change_percent?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      watchlist: {
        Row: {
          id: string
          user_id: string
          card_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          created_at?: string
        }
      }
      portfolio: {
        Row: {
          id: string
          user_id: string
          card_id: string
          quantity: number
          purchase_price: number
          purchase_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          quantity?: number
          purchase_price: number
          purchase_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          quantity?: number
          purchase_price?: number
          purchase_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      price_alerts: {
        Row: {
          id: string
          user_id: string
          card_id: string
          condition: 'above' | 'below'
          target_price: number
          email: string
          enabled: boolean
          triggered: boolean
          triggered_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          card_id: string
          condition: 'above' | 'below'
          target_price: number
          email: string
          enabled?: boolean
          triggered?: boolean
          triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          card_id?: string
          condition?: 'above' | 'below'
          target_price?: number
          email?: string
          enabled?: boolean
          triggered?: boolean
          triggered_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      price_history: {
        Row: {
          id: string
          card_id: string
          price: number
          marketplace: string | null
          recorded_at: string
        }
        Insert: {
          id?: string
          card_id: string
          price: number
          marketplace?: string | null
          recorded_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          price?: number
          marketplace?: string | null
          recorded_at?: string
        }
      }
      marketplaces: {
        Row: {
          id: string
          card_id: string
          marketplace_name: string
          price: number
          shipping_cost: string | null
          url: string | null
          in_stock: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          card_id: string
          marketplace_name: string
          price: number
          shipping_cost?: string | null
          url?: string | null
          in_stock?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          marketplace_name?: string
          price?: number
          shipping_cost?: string | null
          url?: string | null
          in_stock?: boolean
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface Profile {
  id: string;
  updated_at?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  website?: string | null;
  email?: string;
  gem_balance: number;
}

export interface Card {
  id: string;
  name: string;
  set_name: string;
  rarity: string | null;
  image_url: string | null;
  market_price: number | null;
}

export interface Pack {
  id: string;
  name: string;
  description: string | null;
  tier: 'legendary' | 'gold' | 'bronze' | 'misc';
  price: number;
  floor_value: number;
  ceiling_value: number;
  expected_value: number;
  total_cards: number;
  total_opened: number;
  is_featured: boolean;
  is_hot: boolean;
  image_url: string | null;
}

export interface PackCard {
  id: string;
  pack_id: string;
  card_id: string;
  odds_percentage: number;
  weight: number;
}

export interface PackOpen {
  id: string;
  user_id: string;
  pack_id: string;
  card_id: string;
  opened_at: string;
  redemption_status: 'in_inventory' | 'pending_redemption' | 'shipped' | 'resold';
  resell_gems_earned: number | null;
}

export interface GemTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'earned_resell' | 'spent_pack' | 'purchased' | 'refund';
  card_id?: string | null;
  pack_id?: string | null;
  description: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  pack_id: string;
  stripe_session_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}
