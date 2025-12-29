import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
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
      const totalWeight = packCards.reduce((sum: number, pc: any) => sum + (pc.weight || 1), 0);
      let random = Math.random() * totalWeight;
      let selectedCard: any = null;

      for (const packCard of packCards) {
        random -= packCard.weight || 1;
        if (random <= 0) {
          selectedCard = packCard.cards;
          break;
        }
      }

      if (!selectedCard) {
        selectedCard = packCards[0].cards;
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
