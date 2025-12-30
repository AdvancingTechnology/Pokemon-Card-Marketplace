import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export interface GemTransaction {
  id: string;
  amount: number;
  type: 'earned_resell' | 'spent_pack' | 'purchased' | 'refund' | 'pack_open' | 'purchase';
  description: string;
  created_at: string;
  card_id?: string;
  pack_id?: string;
}

export interface GemBalance {
  available: number;
  pending: number;
  promotional: number;
  total: number;
}

export interface PackOpenResult {
  success: boolean;
  pack_open_id?: string;
  card?: {
    id: string;
    name: string;
    set_name: string;
    rarity: string | null;
    image_url: string | null;
    market_price: number | null;
  };
  gems_spent?: number;
  new_balance?: number;
  provably_fair?: {
    server_seed_hash: string;
    client_seed: string;
    nonce: number;
    result_index: number;
  };
  error?: string;
}

export function useGems() {
  const { user, isAuthenticated } = useAuth();
  const [gemBalance, setGemBalance] = useState<number>(0);
  const [balanceDetails, setBalanceDetails] = useState<GemBalance | null>(null);
  const [transactions, setTransactions] = useState<GemTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch gem balance from API
  const fetchGems = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get balance from API
      const balanceRes = await fetch('/api/gems');
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalanceDetails(balanceData);
        setGemBalance(balanceData.total || 0);
      }

      // Get recent transactions
      const { data: txData, error: txError } = await supabase
        .from('gem_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txError) {
        throw txError;
      }

      setTransactions(txData as GemTransaction[]);
    } catch (err: unknown) {
      console.error('Error fetching gem data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, supabase]);

  // Add gems transaction
  const addTransaction = async (
    amount: number,
    type: GemTransaction['type'],
    description: string,
    metadata?: { card_id?: string; pack_id?: string }
  ) => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase
        .from('gem_transactions')
        .insert({
          user_id: user.id,
          amount,
          type,
          description,
          card_id: metadata?.card_id,
          pack_id: metadata?.pack_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setGemBalance((prev) => prev + amount);
      setTransactions((prev) => [data as GemTransaction, ...prev]);

      return { success: true, data };
    } catch (err: unknown) {
      console.error('Error adding transaction:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  // Set up listener for real-time balance updates
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    fetchGems();

    // Subscribe to real-time updates on gem_transactions
    const channel = supabase
      .channel('gems_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'gem_transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          fetchGems(); // Refresh the balance and transactions
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user, fetchGems, supabase]);

  // Open pack with gems
  const openPackWithGems = async (packId: string): Promise<PackOpenResult> => {
    if (!isAuthenticated || !user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Generate idempotency key
      const idempotencyKey = `pack_open_${user.id}_${packId}_${Date.now()}`;

      const res = await fetch('/api/packs/open-with-gems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pack_id: packId,
          idempotency_key: idempotencyKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to open pack' };
      }

      // Update local balance
      if (data.new_balance !== undefined) {
        setGemBalance(data.new_balance);
      }

      // Refresh gems data
      await fetchGems();

      return {
        success: true,
        pack_open_id: data.pack_open_id,
        card: data.card,
        gems_spent: data.gems_spent,
        new_balance: data.new_balance,
        provably_fair: data.provably_fair,
      };
    } catch (err: unknown) {
      console.error('Error opening pack with gems:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  };

  return {
    gemBalance,
    balanceDetails,
    transactions,
    loading,
    error,
    fetchGems,
    addTransaction,
    openPackWithGems,
  };
}
