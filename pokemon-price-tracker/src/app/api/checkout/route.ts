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

export async function POST(request: NextRequest) {
  try {
    const { packId } = await request.json();

    // Get user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    console.log('Checkout request - User:', user?.id, 'Auth error:', authError?.message);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', details: authError?.message || 'No user session' },
        { status: 401 }
      );
    }

    // Get pack details from Supabase
    const { data: pack, error: packError } = await supabase
      .from('packs')
      .select('*')
      .eq('id', packId)
      .single();

    if (packError || !pack) {
      return NextResponse.json(
        { error: 'Pack not found' },
        { status: 404 }
      );
    }

    // Create Stripe checkout session
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pack.name,
              description: pack.description || `Open a ${pack.tier} tier pack`,
              images: pack.image_url ? [pack.image_url] : [],
            },
            unit_amount: Math.round(pack.price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/collection?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?canceled=true`,
      metadata: {
        userId: user.id,
        packId: pack.id,
        userEmail: user.email || '',
      },
      customer_email: user.email || undefined,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: errorMessage },
      { status: 500 }
    );
  }
}
