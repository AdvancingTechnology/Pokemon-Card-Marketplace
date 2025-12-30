import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { GemPackage, ApiError } from '@/types/gems.types';

/**
 * GET /api/gems/packages
 * Get available gem packages for purchase
 */
export async function GET(): Promise<NextResponse<{ packages: GemPackage[] } | ApiError>> {
  try {
    const supabase = await createClient();

    const { data: packages, error } = await supabase
      .from('gem_packages')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching gem packages:', error);
      return NextResponse.json(
        { error: 'Failed to fetch packages', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({ packages: packages ?? [] });
  } catch (error) {
    console.error('Unexpected error in GET /api/gems/packages:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
