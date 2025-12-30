import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSeedPair } from '@/lib/provably-fair';

interface RotateResponse {
  old_server_seed: string;
  new_server_seed_hash: string;
  new_client_seed: string;
  new_nonce: number;
}

/**
 * POST /api/provably-fair/rotate
 * Rotate seeds - reveals old server seed and creates new pair
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<RotateResponse | { error: string }>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get optional new client seed from body
    let newClientSeed = 'default';
    try {
      const body = await request.json();
      if (body.client_seed && typeof body.client_seed === 'string') {
        newClientSeed = body.client_seed.substring(0, 64);
      }
    } catch {
      // No body or invalid JSON, use default
    }

    // Get current active seed
    const { data: currentSeed, error: fetchError } = await supabase
      .from('provably_fair_seeds')
      .select('id, server_seed')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (fetchError || !currentSeed) {
      return NextResponse.json({ error: 'No active seed found' }, { status: 404 });
    }

    // Deactivate current seed and reveal it
    await supabase
      .from('provably_fair_seeds')
      .update({
        is_active: false,
        is_revealed: true,
        revealed_at: new Date().toISOString(),
      })
      .eq('id', currentSeed.id);

    // Create new seed pair
    const newSeed = createSeedPair(newClientSeed);

    const { error: insertError } = await supabase
      .from('provably_fair_seeds')
      .insert({
        user_id: user.id,
        server_seed: newSeed.serverSeed,
        server_seed_hash: newSeed.serverSeedHash,
        client_seed: newSeed.clientSeed,
        nonce: 0,
        is_active: true,
      });

    if (insertError) {
      console.error('Error creating new seed:', insertError);
      return NextResponse.json({ error: 'Failed to create new seed' }, { status: 500 });
    }

    return NextResponse.json({
      old_server_seed: currentSeed.server_seed,
      new_server_seed_hash: newSeed.serverSeedHash,
      new_client_seed: newSeed.clientSeed,
      new_nonce: 0,
    });
  } catch (error) {
    console.error('Error in POST /api/provably-fair/rotate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
