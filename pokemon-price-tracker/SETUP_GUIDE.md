# 🎯 Complete Setup Guide for PokéTracker

This guide will walk you through setting up the entire stack from scratch.

## 📋 Table of Contents

1. [Supabase Setup](#1-supabase-setup)
2. [Local Development Setup](#2-local-development-setup)
3. [Authentication Configuration](#3-authentication-configuration)
4. [Database Schema & Seeding](#4-database-schema--seeding)
5. [Testing Authentication](#5-testing-authentication)
6. [Stripe Integration (Future)](#6-stripe-integration-future)
7. [Deployment](#7-deployment)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"New Project"**
3. Fill in:
   - **Project Name**: `pokemon-tracker`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"** (takes ~2 minutes)

### Get Your API Keys

1. Once created, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long JWT token)
3. Save these for later!

---

## 2. Local Development Setup

### Install Dependencies

```bash
# Clone the repo
git clone <your-repo>
cd pokemon-price-tracker

# Install packages with Bun
bun install
```

### Configure Environment Variables

1. Copy the example file:
```bash
cp .env.example .env.local
```

2. Edit `.env.local` and update:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Important**: Never commit `.env.local` to git!

---

## 3. Authentication Configuration

### Configure Email Provider

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Click on **Email** provider
3. Enable **"Confirm email"** (recommended for production)
4. For development, you can disable email confirmation

### Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/**
   http://localhost:3000/auth/callback
   ```

### Enable Google OAuth (Optional)

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. You'll need:
   - Google OAuth Client ID
   - Google OAuth Client Secret

**To get Google OAuth credentials:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth Client ID"**
5. Application type: **Web application**
6. Add Authorized redirect URIs:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** and **Client Secret**
8. Paste into Supabase Google provider settings

---

## 4. Database Schema & Seeding

### Run the Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire content of `supabase/schema.sql`
4. Paste into the editor
5. Click **"Run"** (bottom right)
6. You should see "Success. No rows returned"

**This creates:**
- All tables (profiles, cards, watchlist, portfolio, price_alerts, etc.)
- Row Level Security policies
- Indexes for performance
- Triggers for auto-updating timestamps

### Seed Sample Data (Optional)

1. Still in **SQL Editor**, create another new query
2. Copy content from `supabase/seed.sql`
3. Paste and **Run**
4. This populates sample Pokémon cards and marketplace data

### Verify Tables

1. Go to **Table Editor**
2. You should see:
   - `profiles`
   - `cards`
   - `watchlist`
   - `portfolio`
   - `price_alerts`
   - `price_history`
   - `marketplaces`

---

## 5. Testing Authentication

### Start Development Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Test Sign Up

1. Click **"Sign In"** button
2. Click **"Sign up"** tab
3. Enter:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. Click **"Sign Up"**

**If email confirmation is enabled:**
- Check your email for confirmation link
- Click the link to verify

**If disabled:**
- You'll be signed in immediately

### Test Sign In

1. Click **"Sign In"**
2. Enter credentials from sign up
3. You should be logged in!

### Verify Database

1. Go to Supabase **Table Editor** → **profiles**
2. You should see your new user profile
3. The `id` should match the user ID from `auth.users`

### Test Watchlist Feature

1. While logged in, click the eye icon on any card
2. Go to Supabase **Table Editor** → **watchlist**
3. You should see a new row with your user_id and card_id

### Test Sign Out

1. Click **"Sign Out"**
2. Try to add to watchlist again
3. You should see the login modal

---

## 6. Stripe Integration (Future)

When you're ready to add payments:

### 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Create account (or sign in)
3. Go to **Developers** → **API keys**

### 2. Get Test Keys

- **Publishable key**: `pk_test_...`
- **Secret key**: `sk_test_...`

### 3. Add to Environment

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

### 4. Install Stripe

```bash
bun add stripe @stripe/stripe-js
```

### 5. Create API Routes

Create `/api/create-checkout-session` for handling payments.

*Detailed Stripe integration guide coming soon!*

---

## 7. Deployment

### Deploy to Vercel

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [https://vercel.com](https://vercel.com)
3. Click **"Import Project"**
4. Select your GitHub repo
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel URL)

6. Click **"Deploy"**

### Update Supabase Settings

1. After deployment, copy your Vercel URL: `https://your-app.vercel.app`
2. Go to Supabase **Authentication** → **URL Configuration**
3. Update **Site URL**: `https://your-app.vercel.app`
4. Add to **Redirect URLs**:
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app/auth/callback
   ```

5. Update Google OAuth redirect (if using):
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

### Test Production

1. Visit your Vercel URL
2. Test sign up/sign in
3. Test watchlist features
4. Verify data appears in Supabase

---

## 8. Troubleshooting

### "Invalid JWT" Error

**Cause**: Wrong API keys or URL

**Solution**:
1. Double-check `.env.local` values
2. Make sure you copied **anon** key, not **service_role** key
3. Restart dev server: `bun run dev`

### Email Confirmation Not Working

**Cause**: Email provider not configured

**Solutions**:
1. Disable email confirmation in **Authentication** → **Providers** → **Email**
2. Or set up SMTP in **Authentication** → **Email Templates**

### "Failed to fetch" Errors

**Cause**: CORS or wrong URL

**Solutions**:
1. Check Supabase URL in `.env.local`
2. Verify **Site URL** in Supabase settings matches your app URL
3. Check browser console for exact error

### Database Connection Error

**Cause**: Schema not applied

**Solutions**:
1. Re-run `supabase/schema.sql` in SQL Editor
2. Check for SQL errors in the output
3. Make sure all tables were created in **Table Editor**

### Row Level Security Errors

**Cause**: RLS policies blocking access

**Solutions**:
1. Make sure you're authenticated
2. Check if policies are enabled on tables
3. Verify user ID matches in database

### Google OAuth Not Working

**Cause**: Wrong redirect URI

**Solutions**:
1. Verify redirect URI in Google Console matches Supabase callback URL
2. Make sure Google provider is enabled in Supabase
3. Check credentials are correct

---

## 📚 Additional Resources

### Supabase Documentation
- [Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Database](https://supabase.com/docs/guides/database)

### Next.js Documentation
- [App Router](https://nextjs.org/docs/app)
- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

### Helpful Commands

```bash
# Start development server
bun run dev

# Run linter
bun run lint

# Build for production
bun run build

# Start production server
bun run start
```

---

## 🎉 Success!

You should now have:
- ✅ Supabase project configured
- ✅ Database schema applied
- ✅ Authentication working
- ✅ Local development running
- ✅ (Optional) Deployed to Vercel

**Next Steps:**
1. Customize the UI to your liking
2. Add more card data
3. Integrate real marketplace APIs
4. Set up Stripe for payments
5. Add email notifications

Need help? Open an issue on GitHub!
