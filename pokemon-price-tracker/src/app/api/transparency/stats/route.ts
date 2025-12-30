import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface TransparencyStats {
  total_packs_opened: number;
  total_gems_distributed: number;
  total_cards_shipped: number;
  active_users_24h: number;
  biggest_win_today: {
    card_name: string;
    value: number;
    rarity: string;
  } | null;
  payout_percentage: number;
  last_updated: string;
}

/**
 * GET /api/transparency/stats
 * Platform-wide statistics for transparency page
 */
export async function GET(): Promise<NextResponse<TransparencyStats>> {
  try {
    const supabase = await createClient();

    // Get pack opening statistics
    const { data: packStats } = await supabase
      .from('pack_opens')
      .select('id', { count: 'exact' });

    // Get total gems distributed
    const { data: gemStats } = await supabase
      .from('gem_transactions')
      .select('amount')
      .eq('transaction_type', 'card_forfeit');

    const totalGemsDistributed = gemStats?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    // Get cards shipped
    const { data: shippedCards } = await supabase
      .from('pack_opens')
      .select('id', { count: 'exact' })
      .eq('redemption_status', 'shipped');

    const stats: TransparencyStats = {
      total_packs_opened: packStats?.length || 0,
      total_gems_distributed: totalGemsDistributed,
      total_cards_shipped: shippedCards?.length || 0,
      active_users_24h: 0, // Would need session tracking
      biggest_win_today: null, // TODO: Implement biggest win query when cards table exists
      payout_percentage: 85, // From spec: Expected value is 85% of pack price
      last_updated: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching transparency stats:', error);
    return NextResponse.json({
      total_packs_opened: 0,
      total_gems_distributed: 0,
      total_cards_shipped: 0,
      active_users_24h: 0,
      biggest_win_today: null,
      payout_percentage: 85,
      last_updated: new Date().toISOString(),
    });
  }
}
