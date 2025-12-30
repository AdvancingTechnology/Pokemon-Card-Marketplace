import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

// Lazy initialization to prevent build errors when env vars are missing
let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-11-17.clover',
    });
  }
  return stripe;
}

function getWebhookSecret(): string {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return process.env.STRIPE_WEBHOOK_SECRET;
}

/**
 * Handle gem purchase completion
 */
async function handleGemPurchase(session: Stripe.Checkout.Session) {
  const { user_id, package_id, gems_amount, package_name } = session.metadata || {};

  if (!user_id || !package_id || !gems_amount) {
    console.error('Missing gem purchase metadata:', session.metadata);
    return { error: 'Missing gem purchase metadata', status: 400 };
  }

  const gemsToCredit = parseInt(gems_amount, 10);
  if (isNaN(gemsToCredit) || gemsToCredit <= 0) {
    console.error('Invalid gems amount:', gems_amount);
    return { error: 'Invalid gems amount', status: 400 };
  }

  const supabase = await createClient();

  // Check if already processed (idempotency)
  const { data: existingTx } = await supabase
    .from('gem_transactions')
    .select('id')
    .eq('idempotency_key', `stripe_${session.id}`)
    .single();

  if (existingTx) {
    console.log('Gem purchase already processed:', session.id);
    return { success: true, message: 'Already processed' };
  }

  // Get or create user's gem balance
  const { data: existingBalance } = await supabase
    .from('gem_balances')
    .select('*')
    .eq('user_id', user_id)
    .single();

  const currentBalance = existingBalance?.available_balance ?? 0;
  const newBalance = currentBalance + gemsToCredit;

  if (existingBalance) {
    // Update existing balance
    const { error: updateError } = await supabase
      .from('gem_balances')
      .update({
        available_balance: newBalance,
        lifetime_purchased: (existingBalance.lifetime_purchased || 0) + gemsToCredit,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Failed to update gem balance:', updateError);
      return { error: 'Failed to credit gems', status: 500 };
    }
  } else {
    // Create new balance record
    const { error: insertError } = await supabase
      .from('gem_balances')
      .insert({
        user_id,
        available_balance: gemsToCredit,
        pending_balance: 0,
        promotional_balance: 0,
        lifetime_purchased: gemsToCredit,
        lifetime_spent: 0,
        lifetime_bonus_received: 0,
      });

    if (insertError) {
      console.error('Failed to create gem balance:', insertError);
      return { error: 'Failed to credit gems', status: 500 };
    }
  }

  // Record the transaction
  const { error: txError } = await supabase
    .from('gem_transactions')
    .insert({
      user_id,
      idempotency_key: `stripe_${session.id}`,
      transaction_type: 'purchase',
      amount: gemsToCredit,
      balance_before: currentBalance,
      balance_after: newBalance,
      reference_type: 'gem_package',
      reference_id: package_id,
      description: `Purchased ${package_name || 'Gem Package'} - ${gemsToCredit.toLocaleString()} gems`,
      metadata: {
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
        package_id,
        amount_paid_cents: session.amount_total,
      },
    });

  if (txError) {
    console.error('Failed to record gem transaction:', txError);
    // Don't fail - gems were already credited
  }

  console.log(`Gems credited: ${gemsToCredit} gems to user ${user_id}`);
  return { success: true, gems: gemsToCredit };
}

/**
 * Handle pack purchase completion
 */
async function handlePackPurchase(session: Stripe.Checkout.Session) {
  const { userId, packId } = session.metadata || {};

  if (!userId || !packId) {
    console.error('Missing pack purchase metadata:', session.metadata);
    return { error: 'Missing pack purchase metadata', status: 400 };
  }

  const supabase = await createClient();

  // Get pack cards with odds
  const { data: packCards, error: packCardsError } = await supabase
    .from('pack_cards')
    .select(`
      weight,
      cards (id, name, market_price)
    `)
    .eq('pack_id', packId);

  if (packCardsError || !packCards || packCards.length === 0) {
    console.error('Failed to fetch pack cards:', packCardsError);
    return { error: 'Pack not found', status: 404 };
  }

  // Weighted random selection
  const totalWeight = packCards.reduce((sum, pc) => sum + ((pc.weight as number) || 1), 0);
  let random = Math.random() * totalWeight;
  let selectedCard: { id: string; name: string; market_price: number | null } | null = null;

  for (const packCard of packCards) {
    random -= (packCard.weight as number) || 1;
    if (random <= 0) {
      const card = packCard.cards as unknown as { id: string; name: string; market_price: number | null };
      selectedCard = card;
      break;
    }
  }

  if (!selectedCard) {
    const card = packCards[0].cards as unknown as { id: string; name: string; market_price: number | null };
    selectedCard = card;
  }

  // Create order record
  const { error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      pack_id: packId,
      quantity: 1,
      total_amount: session.amount_total ? session.amount_total / 100 : 0,
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent as string,
    });

  if (orderError) {
    console.error('Failed to create order:', orderError);
  }

  // Automatically open the pack
  const { error: packOpenError } = await supabase
    .from('pack_opens')
    .insert({
      user_id: userId,
      pack_id: packId,
      card_id: selectedCard.id,
    });

  if (packOpenError) {
    console.error('Failed to save pack open:', packOpenError);
    return { error: 'Failed to open pack', status: 500 };
  }

  console.log(`Pack opened for user ${userId}: ${selectedCard.name}`);
  return { success: true, card: selectedCard.name };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, getWebhookSecret());
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle successful payment
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const purchaseType = session.metadata?.type;

    try {
      let result;

      if (purchaseType === 'gem_purchase') {
        // Handle gem package purchase
        result = await handleGemPurchase(session);
      } else if (session.metadata?.userId && session.metadata?.packId) {
        // Handle pack purchase (legacy format)
        result = await handlePackPurchase(session);
      } else {
        console.error('Unknown purchase type:', session.metadata);
        return NextResponse.json({ error: 'Unknown purchase type' }, { status: 400 });
      }

      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status || 500 });
      }

      return NextResponse.json(result);

    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
