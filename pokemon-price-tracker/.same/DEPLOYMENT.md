# 🚀 Deployment Guide - Vercel

## Prerequisites

✅ GitHub account
✅ Vercel account (sign up at https://vercel.com)
✅ Supabase project configured
✅ Stripe account set up (optional for MVP)

---

## Step 1: Push to GitHub

### Create Repository

1. Go to https://github.com/new
2. Name your repo: `slab-safari`
3. Set to **Private** (recommended)
4. Click **"Create repository"**

### Push Your Code

```bash
cd pokemon-price-tracker

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Slab Safari pack marketplace"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/slab-safari.git

# Push
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### Connect Repository

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `slab-safari` repository
5. Click **"Import"**

### Configure Project

**Framework Preset**: Next.js (auto-detected)
**Root Directory**: `./` (default)
**Build Command**: `bun run build` (auto-detected)
**Output Directory**: `.next` (auto-detected)

### Add Environment Variables

Click **"Environment Variables"** and add:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# App URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Stripe (optional - add later)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Important**: Copy these from your `.env.local` file!

### Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Click on the deployment URL when ready

---

## Step 3: Update Supabase Settings

### Add Production URL

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Update **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**:
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app/auth/callback
   ```

### Update Google OAuth (if using)

1. Go to Google Cloud Console
2. Update **Authorized redirect URIs**:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```

---

## Step 4: Set Up Stripe Webhook (Production)

### Create Production Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. Enter URL:
   ```
   https://your-app.vercel.app/api/webhooks/stripe
   ```
4. Select events:
   - ✅ `checkout.session.completed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)

### Add to Vercel

1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add new variable:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_your_production_secret
   ```
3. Click **"Save"**
4. **Redeploy** the project

---

## Step 5: Test Production Deployment

### Verify Everything Works

1. ✅ Visit your Vercel URL
2. ✅ Sign up/Sign in works
3. ✅ Packs load correctly
4. ✅ Pack detail modal opens
5. ✅ Stripe checkout works (if configured)
6. ✅ Collection page displays cards
7. ✅ Live feed updates in real-time

### Test Checklist

- [ ] Homepage loads without errors
- [ ] Authentication (email/password)
- [ ] Google OAuth (if configured)
- [ ] Browse packs
- [ ] View pack details & odds
- [ ] Stripe checkout (test mode)
- [ ] Pack opens after payment
- [ ] Collection page shows pulled cards
- [ ] Live feed displays recent pulls

---

## Step 6: Custom Domain (Optional)

### Add Custom Domain

1. In Vercel project → **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `slabsafari.com`
4. Follow DNS configuration instructions

### Update Environment Variables

Update `NEXT_PUBLIC_APP_URL` to your custom domain:

```env
NEXT_PUBLIC_APP_URL=https://slabsafari.com
```

### Update Supabase & Stripe

1. **Supabase**: Add custom domain to redirect URLs
2. **Stripe**: Update webhook URL to custom domain

---

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to `main`:

```bash
git add .
git commit -m "Add new feature"
git push
```

Vercel will:
1. Detect the push
2. Build your project
3. Deploy to production
4. Send you a notification

### Preview Deployments

Every pull request gets a preview URL:
- Test changes before merging
- Share with team for review
- Automatic cleanup after merge

---

## Monitoring & Analytics

### Vercel Analytics

1. Go to Vercel project → **Analytics**
2. View:
   - Page views
   - Top pages
   - User locations
   - Performance metrics

### Runtime Logs

1. Go to **Deployments** → Click deployment
2. View **Functions** tab
3. See API route logs and errors

### Supabase Logs

1. Go to Supabase Dashboard → **Logs**
2. View:
   - Database queries
   - API requests
   - Auth events

---

## Troubleshooting

### Build Fails

**Error**: `Module not found`
- ✅ Run `bun install` locally
- ✅ Commit `bun.lockb`
- ✅ Push and redeploy

**Error**: `Type errors`
- ✅ Run `bun run lint` locally
- ✅ Fix TypeScript errors
- ✅ Push and redeploy

### Environment Variables Not Working

- ✅ Check variable names match exactly
- ✅ Redeploy after adding variables
- ✅ Check for typos in values

### Supabase Connection Failed

- ✅ Verify URL and anon key are correct
- ✅ Check Supabase project is not paused
- ✅ Verify redirect URLs include production domain

### Stripe Webhook Not Firing

- ✅ Verify webhook URL is correct
- ✅ Check webhook signing secret
- ✅ View webhook attempts in Stripe Dashboard
- ✅ Check Vercel function logs

---

## Performance Optimization

### Enable Edge Functions

For faster API routes:

```typescript
// src/app/api/checkout/route.ts
export const runtime = 'edge';
```

### Image Optimization

Use Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src={card.image_url}
  alt={card.name}
  width={300}
  height={420}
/>
```

### Caching

Add caching headers to API routes:

```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
  }
});
```

---

## Security Checklist

Before going live:

- [ ] All environment variables are secure
- [ ] `.env.local` is in `.gitignore`
- [ ] Supabase RLS policies are enabled
- [ ] Stripe webhook signatures are verified
- [ ] Google OAuth credentials are correct
- [ ] CORS is configured properly
- [ ] Rate limiting is enabled (future)

---

## Next Steps

1. ✅ **Seed database** with real pack data
2. ✅ **Test payments** with Stripe test cards
3. ✅ **Invite beta users** to test
4. ✅ **Monitor errors** in Vercel logs
5. ✅ **Collect feedback** and iterate
6. ✅ **Switch to live mode** when ready

---

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production](https://supabase.com/docs/guides/platform/going-into-prod)
- [Stripe Production Checklist](https://stripe.com/docs/keys#test-live-modes)

---

Your Slab Safari marketplace is now live! 🎉

Need help? Check Vercel logs or contact support@same.new
