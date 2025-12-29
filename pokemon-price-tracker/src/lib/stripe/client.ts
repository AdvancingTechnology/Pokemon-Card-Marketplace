import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export async function initiateCheckout(packId: string) {
  try {
    // Call our API to create a checkout session
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ packId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();

    // Redirect to Stripe Checkout
    if (url) {
      window.location.href = url;
    } else {
      throw new Error('No checkout URL returned');
    }
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}

export { stripePromise };
