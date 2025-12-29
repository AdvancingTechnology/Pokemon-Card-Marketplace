# 💳 Stripe Integration Setup Guide

## Overview

Slab Safari uses Stripe for secure payment processing. When a user purchases a pack:
1. They click "BUY & OPEN" on a pack
2. Redirected to Stripe Checkout
3. After payment, Stripe webhook automatically opens the pack
4. Card is revealed and added to their collection

---

## Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click **"Start now"** or **"Sign in"**
3. Complete account setup
4. Verify your email

---

## Step 2: Get API Keys

### Test Mode Keys (for development)

1. In Stripe Dashboard, ensure **Test mode** is ON (toggle at top)
2. Go to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key**: `pk_test_...`
   - **Secret key**: `sk_test_...` (click "Reveal" button)

### Add to Environment Variables

Update `.env.local`:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

**Important**: Never commit `.env.local` to git!

---

## Step 3: Set Up Webhooks (Critical!)

Webhooks allow Stripe to notify your app when payments succeed.

### Local Development (using Stripe CLI)

1. **Install Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Linux
   curl -s https://packages.stripe.com/api/v1/webhooks/handler/download | bash

   # Windows
   scoop install stripe
   ```

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to localhost**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. **Copy the webhook signing secret** (starts with `whsec_`):
   ```
   > Ready! Your webhook signing secret is whsec_xxxxx
   ```

5. **Add to `.env.local`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_your_secret_here
   ```

6. **Keep the CLI running** while developing!

### Production Webhooks (for deployed app)

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter your production URL:
   ```
   https://your-app.vercel.app/api/webhooks/stripe
   ```
4. Select events to listen for:
   - ✅ `checkout.session.completed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add to Vercel environment variables (see Deployment section)

---

## Step 4: Test the Flow

### Test with Stripe Test Cards

Stripe provides test card numbers that simulate different scenarios:

**Successful Payment**:
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

**Requires Authentication** (3D Secure):
```
Card: 4000 0025 0000 3155
```

**Declined**:
```
Card: 4000 0000 0000 0002
```

### Testing Steps

1. **Start your app**: `bun run dev`
2. **Start Stripe CLI** (in another terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. **Sign in** to your app
4. **Click** any pack card
5. **Click** "BUY & OPEN"
6. **Use** test card: `4242 4242 4242 4242`
7. **Complete** checkout
8. **Check** your collection page - the card should appear!

---

## Step 5: Monitor Payments

### Stripe Dashboard

- **Payments**: View all transactions
- **Events**: See webhook deliveries
- **Logs**: Debug webhook issues

### Common Issues

**Webhook not firing?**
- ✅ Is Stripe CLI running?
- ✅ Is `STRIPE_WEBHOOK_SECRET` set correctly?
- ✅ Check Stripe Dashboard → **Developers** → **Events**

**Payment succeeds but pack doesn't open?**
- ✅ Check webhook endpoint logs in Stripe Dashboard
- ✅ Verify database has pack cards with odds
- ✅ Check browser console for errors

**"Invalid API key"?**
- ✅ Verify `.env.local` has correct keys
- ✅ Restart dev server after updating env vars
- ✅ Ensure you're using **test** keys in dev mode

---

## Step 6: Production Setup

### Before Deploying

1. ✅ Test payments work locally
2. ✅ Verify webhooks fire correctly
3. ✅ Check all environment variables are set

### Vercel Deployment

1. **Deploy** to Vercel (see `DEPLOYMENT.md`)
2. **Add environment variables** in Vercel:
   - Go to your project → **Settings** → **Environment Variables**
   - Add:
     ```
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_WEBHOOK_SECRET=whsec_... (from production webhook)
     ```
3. **Redeploy** to apply env vars

### Switch to Live Mode

When ready for real payments:

1. In Stripe Dashboard, toggle to **Live mode**
2. Go to **Developers** → **API keys**
3. Copy **Live** keys (start with `pk_live_` and `sk_live_`)
4. Update environment variables with live keys
5. Update webhook endpoint to use live mode
6. **Test thoroughly before going live!**

---

## Pricing Considerations

### Stripe Fees

- **2.9% + $0.30** per successful card charge
- **No monthly fees** (pay as you go)
- International cards may have additional fees

### Example Calculation

For a $25 Bronze Safari pack:
- **Gross**: $25.00
- **Stripe Fee**: $0.30 + ($25.00 × 0.029) = $1.03
- **Net**: $23.97

---

## Security Best Practices

✅ **Never** expose `STRIPE_SECRET_KEY` in client-side code
✅ **Always** verify webhooks using the signing secret
✅ **Use** HTTPS in production
✅ **Validate** user authentication before checkout
✅ **Log** all transactions for auditing

---

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Checkout Guide](https://stripe.com/docs/payments/checkout)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)
- [Test Card Numbers](https://stripe.com/docs/testing)

---

## Support

Having issues? Check:
1. Stripe Dashboard → **Developers** → **Logs**
2. Browser console for errors
3. Vercel deployment logs
4. Supabase database logs

Still stuck? Contact Stripe support or open an issue!
