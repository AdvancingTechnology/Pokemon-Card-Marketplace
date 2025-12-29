import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

export interface GemTransaction {
  id: string;
  amount: number;
  type: 'earned_resell' | 'spent_pack' | 'purchased' | 'refund';
  description: string;
  created_at: string;
  card_id?: string;
  pack_id?: string;
}

export function useGems() {
  const { user, isAuthenticated } = useAuth();
  const [gemBalance, setGemBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<GemTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch gem balance and recent transactions
  const fetchGems = async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user profile with gem balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('gem_balance')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
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

      setGemBalance(profile?.gem_balance || 0);
      setTransactions(txData as GemTransaction[]);
    } catch (err: unknown) {
      console.error('Error fetching gem data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  return {
    gemBalance,
    transactions,
    loading,
    error,
    fetchGems,
    addTransaction,
  };
}
