import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { GemBalanceResponse, ApiError } from '@/types/gems.types';

/**
 * GET /api/gems
 * Get user's gem balance
 */
export async function GET(): Promise<NextResponse<GemBalanceResponse | ApiError>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { data: balance, error } = await supabase
      .from('gem_balances')
      .select('available_balance, pending_balance, promotional_balance')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching gem balance:', error);
      return NextResponse.json(
        { error: 'Failed to fetch balance', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    const response: GemBalanceResponse = {
      available: balance?.available_balance ?? 0,
      pending: balance?.pending_balance ?? 0,
      promotional: balance?.promotional_balance ?? 0,
      total: (balance?.available_balance ?? 0) + (balance?.promotional_balance ?? 0),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error in GET /api/gems:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
