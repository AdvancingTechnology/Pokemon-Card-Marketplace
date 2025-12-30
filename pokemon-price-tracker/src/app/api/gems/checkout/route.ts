import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import type { GemCheckoutRequest, GemCheckoutResponse, ApiError } from '@/types/gems.types';

// Lazy initialization to prevent build errors without env vars
let stripeInstance: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}

/**
 * POST /api/gems/checkout
 * Create Stripe checkout session for gem purchase
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<GemCheckoutResponse | ApiError>> {
  try {
    const supabase = await createClient();
    const stripe = getStripe();

    if (!stripe) {
      return NextResponse.json(
        { error: 'Payment system unavailable', code: 'STRIPE_UNAVAILABLE' },
        { status: 503 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    let body: GemCheckoutRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const { package_id, success_url, cancel_url } = body;

    if (!package_id) {
      return NextResponse.json(
        { error: 'package_id is required', code: 'MISSING_FIELD' },
        { status: 400 }
      );
    }

    // Fetch the gem package
    const { data: gemPackage, error: packageError } = await supabase
      .from('gem_packages')
      .select('*')
      .eq('id', package_id)
      .eq('status', 'active')
      .single();

    if (packageError || !gemPackage) {
      return NextResponse.json(
        { error: 'Invalid or inactive package', code: 'PACKAGE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const totalGems = gemPackage.base_gems + gemPackage.bonus_gems;

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: gemPackage.name,
              description: `${totalGems.toLocaleString()} Gems${gemPackage.bonus_gems > 0 ? ` (includes ${gemPackage.bonus_gems.toLocaleString()} bonus!)` : ''}`,
            },
            unit_amount: gemPackage.price_cents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        package_id: gemPackage.id,
        gems_amount: String(totalGems),
        package_name: gemPackage.name,
        type: 'gem_purchase',
      },
      success_url: success_url || `${baseUrl}/gems/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${baseUrl}/gems`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session', code: 'STRIPE_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkout_url: session.url,
      session_id: session.id,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/gems/checkout:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
