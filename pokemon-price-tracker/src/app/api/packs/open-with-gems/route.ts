import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import type { OpenPackWithGemsRequest, ApiError } from '@/types/gems.types';

interface OpenPackResponse {
  success: boolean;
  pack_open_id: string;
  card: {
    id: string;
    name: string;
    set_name: string;
    rarity: string | null;
    image_url: string | null;
    market_price: number | null;
  };
  gems_spent: number;
  new_balance: number;
  provably_fair?: {
    server_seed_hash: string;
    client_seed: string;
    nonce: number;
    result_index: number;
  };
}

/**
 * Provably fair random selection using SHA-256
 */
function provablyFairSelection(
  serverSeed: string,
  clientSeed: string,
  nonce: number,
  totalWeight: number
): { randomValue: number; resultIndex: number } {
  const combined = `${serverSeed}:${clientSeed}:${nonce}`;
  const hash = crypto.createHash('sha256').update(combined).digest('hex');

  // Use first 8 characters (32 bits) for random value
  const randomInt = parseInt(hash.substring(0, 8), 16);
  const randomValue = (randomInt / 0xffffffff) * totalWeight;

  return { randomValue, resultIndex: randomInt };
}

/**
 * POST /api/packs/open-with-gems
 * Open a mystery pack using gems
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<OpenPackResponse | ApiError>> {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    // Parse request
    let body: OpenPackWithGemsRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const { pack_id, idempotency_key } = body;

    if (!pack_id) {
      return NextResponse.json(
        { error: 'pack_id is required', code: 'MISSING_FIELD' },
        { status: 400 }
      );
    }

    if (!idempotency_key) {
      return NextResponse.json(
        { error: 'idempotency_key is required', code: 'MISSING_FIELD' },
        { status: 400 }
      );
    }

    // Check for duplicate request
    const { data: existingTx } = await supabase
      .from('gem_transactions')
      .select('id, reference_id')
      .eq('idempotency_key', idempotency_key)
      .single();

    if (existingTx) {
      // Return the existing pack open result
      const { data: existingOpen } = await supabase
        .from('pack_opens')
        .select(`
          id,
          cards (id, name, set_name, rarity, image_url, market_price)
        `)
        .eq('id', existingTx.reference_id)
        .single();

      if (existingOpen) {
        const card = existingOpen.cards as unknown as OpenPackResponse['card'];
        return NextResponse.json({
          success: true,
          pack_open_id: existingOpen.id,
          card,
          gems_spent: 0, // Already charged
          new_balance: 0, // Would need to fetch
          provably_fair: undefined,
        });
      }
    }

    // Get pack details
    const { data: pack, error: packError } = await supabase
      .from('packs')
      .select('id, name, tier, price, gem_cost')
      .eq('id', pack_id)
      .single();

    if (packError || !pack) {
      return NextResponse.json(
        { error: 'Pack not found', code: 'PACK_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Determine gem cost (use explicit gem_cost or calculate from tier)
    const PACK_COSTS: Record<string, number> = {
      bronze: 2500,    // $25 worth
      gold: 10000,     // $100 worth
      legendary: 50000 // $500 worth
    };

    const gemCost = pack.gem_cost || PACK_COSTS[pack.tier] || Math.round(pack.price * 100);

    // Get user's gem balance
    const { data: balance, error: balanceError } = await supabase
      .from('gem_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (balanceError || !balance) {
      return NextResponse.json(
        { error: 'No gem balance found. Purchase gems first.', code: 'NO_BALANCE' },
        { status: 400 }
      );
    }

    const availableGems = balance.available_balance + balance.promotional_balance;
    if (availableGems < gemCost) {
      return NextResponse.json(
        {
          error: `Insufficient gems. Need ${gemCost}, have ${availableGems}`,
          code: 'INSUFFICIENT_GEMS'
        },
        { status: 400 }
      );
    }

    // Get pack cards with weights
    const { data: packCards, error: packCardsError } = await supabase
      .from('pack_cards')
      .select(`
        id,
        weight,
        cards (id, name, set_name, rarity, image_url, market_price)
      `)
      .eq('pack_id', pack_id);

    if (packCardsError || !packCards || packCards.length === 0) {
      return NextResponse.json(
        { error: 'Pack has no cards configured', code: 'NO_CARDS' },
        { status: 400 }
      );
    }

    // Get or create provably fair seed
    let { data: seedData } = await supabase
      .from('provably_fair_seeds')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!seedData) {
      // Create new seed
      const serverSeed = crypto.randomBytes(32).toString('hex');
      const serverSeedHash = crypto.createHash('sha256').update(serverSeed).digest('hex');

      const { data: newSeed, error: seedError } = await supabase
        .from('provably_fair_seeds')
        .insert({
          user_id: user.id,
          server_seed: serverSeed,
          server_seed_hash: serverSeedHash,
          client_seed: 'default',
          nonce: 0,
          is_active: true,
        })
        .select()
        .single();

      if (seedError || !newSeed) {
        return NextResponse.json(
          { error: 'Failed to create provably fair seed', code: 'SEED_ERROR' },
          { status: 500 }
        );
      }
      seedData = newSeed;
    }

    // Perform provably fair selection
    const totalWeight = packCards.reduce((sum, pc) => sum + ((pc.weight as number) || 1), 0);
    const { randomValue, resultIndex } = provablyFairSelection(
      seedData.server_seed,
      seedData.client_seed,
      seedData.nonce,
      totalWeight
    );

    // Select card based on random value
    let accumulated = 0;
    let selectedCard: OpenPackResponse['card'] | null = null;

    for (const packCard of packCards) {
      accumulated += (packCard.weight as number) || 1;
      if (randomValue < accumulated) {
        selectedCard = packCard.cards as unknown as OpenPackResponse['card'];
        break;
      }
    }

    if (!selectedCard) {
      selectedCard = packCards[0].cards as unknown as OpenPackResponse['card'];
    }

    // Deduct gems (prioritize promotional balance first)
    let promoToDeduct = 0;
    let availableToDeduct = gemCost;

    if (balance.promotional_balance > 0) {
      promoToDeduct = Math.min(balance.promotional_balance, gemCost);
      availableToDeduct = gemCost - promoToDeduct;
    }

    const newPromoBalance = balance.promotional_balance - promoToDeduct;
    const newAvailableBalance = balance.available_balance - availableToDeduct;
    const balanceBefore = balance.available_balance + balance.promotional_balance;
    const balanceAfter = newAvailableBalance + newPromoBalance;

    // Update gem balance
    const { error: updateError } = await supabase
      .from('gem_balances')
      .update({
        available_balance: newAvailableBalance,
        promotional_balance: newPromoBalance,
        lifetime_spent: balance.lifetime_spent + gemCost,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to deduct gems', code: 'BALANCE_UPDATE_ERROR' },
        { status: 500 }
      );
    }

    // Create pack open record
    const { data: packOpen, error: packOpenError } = await supabase
      .from('pack_opens')
      .insert({
        user_id: user.id,
        pack_id: pack_id,
        card_id: selectedCard.id,
        redemption_status: 'in_inventory',
        server_seed_hash: seedData.server_seed_hash,
        client_seed: seedData.client_seed,
        nonce: seedData.nonce,
      })
      .select('id')
      .single();

    if (packOpenError || !packOpen) {
      // Refund gems on failure
      await supabase
        .from('gem_balances')
        .update({
          available_balance: balance.available_balance,
          promotional_balance: balance.promotional_balance,
          lifetime_spent: balance.lifetime_spent,
        })
        .eq('user_id', user.id);

      return NextResponse.json(
        { error: 'Failed to open pack', code: 'PACK_OPEN_ERROR' },
        { status: 500 }
      );
    }

    // Record gem transaction
    await supabase
      .from('gem_transactions')
      .insert({
        user_id: user.id,
        idempotency_key: idempotency_key,
        transaction_type: 'pack_open',
        amount: -gemCost,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        reference_type: 'pack_open',
        reference_id: packOpen.id,
        description: `Opened ${pack.name} pack`,
        metadata: {
          pack_id,
          pack_name: pack.name,
          card_id: selectedCard.id,
          card_name: selectedCard.name,
        },
      });

    // Increment nonce for next pull
    await supabase
      .from('provably_fair_seeds')
      .update({ nonce: seedData.nonce + 1 })
      .eq('id', seedData.id);

    // Update pack stats (ignore errors if function doesn't exist)
    try {
      await supabase.rpc('increment_pack_opens', { p_pack_id: pack_id });
    } catch {
      // Ignore if function doesn't exist
    }

    return NextResponse.json({
      success: true,
      pack_open_id: packOpen.id,
      card: selectedCard,
      gems_spent: gemCost,
      new_balance: balanceAfter,
      provably_fair: {
        server_seed_hash: seedData.server_seed_hash,
        client_seed: seedData.client_seed,
        nonce: seedData.nonce,
        result_index: resultIndex,
      },
    });

  } catch (error) {
    console.error('Unexpected error in POST /api/packs/open-with-gems:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
