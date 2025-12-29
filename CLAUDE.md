# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Slab Safari** is a digital pack opening marketplace for graded Pokémon cards. Users purchase mystery packs with transparent odds, win cards via weighted random selection, and can either redeem physical cards or resell for Gems (in-app currency).

This is a monorepo containing two Next.js applications:
- `pokemon-price-tracker/` - Main Slab Safari marketplace (production-ready)
- `pokemon-mystery-pack/` - Secondary/experimental Next.js app (minimal setup)

## Development Commands

```bash
# Primary app (pokemon-price-tracker)
cd pokemon-price-tracker
bun install              # Install dependencies
bun run dev              # Development server with Turbopack (0.0.0.0:3000)
bun run build            # Production build
bun run start            # Start production server
bun run lint             # TypeScript type-check + ESLint
bun run format           # Biome formatting

# Stripe webhook testing (local development)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router + Turbopack
- **Runtime/Package Manager**: Bun
- **Database/Auth**: Supabase (PostgreSQL + RLS + Realtime)
- **Payments**: Stripe (checkout sessions + webhooks)
- **Styling**: Tailwind CSS + shadcn/ui
- **Linting**: Biome + ESLint

### Key Directories (pokemon-price-tracker)
```
src/
├── app/
│   ├── api/checkout/           # Stripe checkout session creation
│   ├── api/webhooks/stripe/    # Stripe webhook handler (pack opening logic)
│   ├── auth/callback/          # OAuth callback handler
│   ├── collection/             # User collection page
│   └── inventory/              # User inventory management
├── components/
│   ├── packs/                  # PackCard, PackDetailModal, PackOpeningModal
│   ├── activity/               # LiveFeed (Supabase realtime)
│   ├── auth/                   # AuthModal
│   ├── branding/               # SlabSafariLogo
│   └── ui/                     # shadcn components
├── hooks/
│   ├── useAuth.ts              # Authentication state management
│   └── useGems.ts              # Gems currency management
└── lib/
    ├── supabase/client.ts      # Browser Supabase client
    ├── supabase/server.ts      # Server Supabase client
    ├── stripe/client.ts        # Stripe client utilities
    └── types/database.types.ts # TypeScript database types
```

### Database Schema

Core tables with Row Level Security (RLS):
- **profiles** - User accounts with `gem_balance`
- **cards** - Pokémon card catalog (name, set, rarity, market_price)
- **packs** - Mystery pack definitions (tier, price, floor/expected/ceiling values)
- **pack_cards** - Card odds per pack with weights for random selection
- **pack_opens** - User pull history with redemption status
- **gem_transactions** - Gems currency transaction log
- **orders** - Stripe payment tracking
- **watchlist/portfolio/price_alerts** - User collection features

Schema files: `supabase/schema.sql` (root) and `pokemon-price-tracker/supabase/*.sql`

### Pack Opening Flow

1. User clicks "BUY & OPEN" on pack
2. `/api/checkout` creates Stripe checkout session with `userId`/`packId` metadata
3. User completes Stripe payment
4. Stripe webhook (`/api/webhooks/stripe`) receives `checkout.session.completed`
5. Server performs weighted random card selection from `pack_cards`
6. Card saved to `pack_opens`, user redirected to collection
7. Live activity feed updates via Supabase realtime subscriptions

### Gems System

In-app currency for reinvestment loop:
- Users can **resell** pulled cards for 70% of market value in Gems
- Gems can be used to purchase more packs
- Transaction types: `earned_resell`, `spent_pack`, `purchased`, `refund`
- Redemption statuses: `in_inventory`, `pending_redemption`, `shipped`, `resold`

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Database Setup

1. Run `supabase/schema.sql` in Supabase SQL Editor (creates tables + RLS + triggers)
2. Run any additional schema files in `pokemon-price-tracker/supabase/`
3. Seed data with provided seed files

## Stripe Testing

Test cards:
- **Success**: `4242 4242 4242 4242`
- **3D Secure**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 0002`

## Design Theme

Slab Safari branding colors:
- Gold: `#D4AF37`
- Jungle Green: `#1B3A2F`
- Tan: `#D7C7A3`

Pack tiers: Legendary ($500+), Gold ($100), Bronze ($25), Misc

## Supabase Client Pattern

Browser (client components):
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

Server (API routes, server components):
```typescript
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
```

## Documentation

Detailed setup guides in `pokemon-price-tracker/.same/`:
- `DATABASE_SETUP.md` - Database seeding
- `STRIPE_SETUP.md` - Stripe integration
- `DEPLOYMENT.md` - Vercel deployment
- `GEMS_SYSTEM.md` - Gems currency system
