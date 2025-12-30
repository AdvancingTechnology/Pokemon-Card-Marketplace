import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { GemTransactionHistoryResponse, ApiError } from '@/types/gems.types';

/**
 * GET /api/gems/transactions
 * Get user's gem transaction history
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<GemTransactionHistoryResponse | ApiError>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);
    const type = searchParams.get('type');

    let query = supabase
      .from('gem_transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) {
      query = query.eq('transaction_type', type);
    }

    const { data: transactions, error, count } = await query;

    if (error) {
      console.error('Error fetching gem transactions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transactions', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transactions: transactions ?? [],
      total_count: count ?? 0,
      has_more: offset + limit < (count ?? 0),
    });
  } catch (error) {
    console.error('Unexpected error in GET /api/gems/transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
