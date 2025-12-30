/**
 * Gems System Types for Slab Safari
 */

export interface GemPackage {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  price_cents: number;
  currency: string;
  base_gems: number;
  bonus_gems: number;
  badge_text: string | null;
  status: string;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GemBalance {
  id: string;
  user_id: string;
  available_balance: number;
  pending_balance: number;
  promotional_balance: number;
  lifetime_purchased: number;
  lifetime_spent: number;
  lifetime_bonus_received: number;
  created_at: string;
  updated_at: string;
}

export interface GemTransaction {
  id: string;
  user_id: string;
  idempotency_key: string | null;
  transaction_type: GemTransactionType;
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  is_reversed: boolean;
}

export type GemTransactionType =
  | 'purchase'
  | 'bonus'
  | 'promotional'
  | 'pack_open'
  | 'refund'
  | 'admin_credit'
  | 'admin_debit'
  | 'card_forfeit'
  | 'card_resell';

export interface GemCheckoutRequest {
  package_id: string;
  success_url?: string;
  cancel_url?: string;
}

export interface GemCheckoutResponse {
  checkout_url: string;
  session_id: string;
}

export interface OpenPackWithGemsRequest {
  pack_id: string;
  idempotency_key: string;
}

export interface GemBalanceResponse {
  available: number;
  pending: number;
  promotional: number;
  total: number;
}

export interface GemTransactionHistoryResponse {
  transactions: GemTransaction[];
  total_count: number;
  has_more: boolean;
}

export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

// Pack costs in gems
export const PACK_COSTS: Record<string, number> = {
  bronze: 2500,    // $25 worth
  gold: 10000,     // $100 worth
  legendary: 50000 // $500 worth
};
