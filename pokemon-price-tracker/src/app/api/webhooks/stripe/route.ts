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
      apiVersion: '2025-12-15.clover',
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
    const { userId, packId } = session.metadata || {};

    if (!userId || !packId) {
      console.error('Missing metadata in session');
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    try {
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
        return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
      }

      // Weighted random selection
      const totalWeight = packCards.reduce((sum, pc) => sum + ((pc.weight as number) || 1), 0);
      let random = Math.random() * totalWeight;
      let selectedCard: { id: string; name: string; market_price: number | null } | null = null;

      for (const packCard of packCards) {
        random -= (packCard.weight as number) || 1;
        if (random <= 0) {
          // Supabase returns cards as object when using .single() style joins
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
        return NextResponse.json({ error: 'Failed to open pack' }, { status: 500 });
      }

      console.log(`Pack opened for user ${userId}: ${selectedCard.name}`);
      return NextResponse.json({ success: true, card: selectedCard.name });

    } catch (error) {
      console.error('Error processing webhook:', error);
      return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
