import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSeedPair } from '@/lib/provably-fair';

interface SeedResponse {
  server_seed_hash: string;
  client_seed: string;
  nonce: number;
}

/**
 * GET /api/provably-fair
 * Get current seed hash for user
 */
export async function GET(): Promise<NextResponse<SeedResponse | { error: string }>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get active seed for user
    let { data: seed } = await supabase
      .from('provably_fair_seeds')
      .select('server_seed_hash, client_seed, nonce')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    // Create new seed pair if none exists
    if (!seed) {
      const newSeed = createSeedPair();

      const { data: created, error: createError } = await supabase
        .from('provably_fair_seeds')
        .insert({
          user_id: user.id,
          server_seed: newSeed.serverSeed,
          server_seed_hash: newSeed.serverSeedHash,
          client_seed: newSeed.clientSeed,
          nonce: 0,
          is_active: true,
        })
        .select('server_seed_hash, client_seed, nonce')
        .single();

      if (createError) {
        console.error('Error creating seed:', createError);
        return NextResponse.json({ error: 'Failed to create seed' }, { status: 500 });
      }

      seed = created;
    }

    return NextResponse.json({
      server_seed_hash: seed.server_seed_hash,
      client_seed: seed.client_seed,
      nonce: seed.nonce,
    });
  } catch (error) {
    console.error('Error in GET /api/provably-fair:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/provably-fair
 * Update client seed
 */
export async function PATCH(
  request: NextRequest
): Promise<NextResponse<SeedResponse | { error: string }>> {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { client_seed } = body;

    if (!client_seed || typeof client_seed !== 'string' || client_seed.length > 64) {
      return NextResponse.json(
        { error: 'Invalid client_seed. Must be a string up to 64 characters.' },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from('provably_fair_seeds')
      .update({ client_seed })
      .eq('user_id', user.id)
      .eq('is_active', true)
      .select('server_seed_hash, client_seed, nonce')
      .single();

    if (updateError || !updated) {
      return NextResponse.json({ error: 'Failed to update client seed' }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error in PATCH /api/provably-fair:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
