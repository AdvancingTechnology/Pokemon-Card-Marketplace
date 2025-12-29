# 🚀 Slab Safari Quickstart Guide

This guide will help you get the Pokemon Mystery Pack marketplace (Slab Safari) up and running on your local machine.

## Prerequisites

- Node.js 18+ or Bun 1.0+
- Supabase account (free tier works)
- Stripe account for payment processing (optional for basic testing)

## Step 1: Project Setup

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd pokemon-price-tracker
   ```

2. **Install dependencies**
   ```bash
   # Using bun (recommended)
   bun install

   # Using npm
   npm install
   ```

## Step 2: Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (optional for basic testing)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

## Step 3: Database Setup

1. **Create a Supabase project** at https://supabase.com
2. **Run the database migrations** in this order:
   - Run `supabase/schema.sql` (Core schema)
   - Run `supabase/seed.sql` (Initial data)
   - Run `supabase/migration-packs-only.sql` (Pack system)
   - Run `supabase/packs-seed.sql` (Sample packs)
   - Run `supabase/gems-migration.sql` (Gems system)

You can run these SQL files from the Supabase dashboard under SQL Editor.

## Step 4: Start Development Server

```bash
# Using bun
bun run dev

# Using npm
npm run dev
```

The application should now be running on [http://localhost:3000](http://localhost:3000).

## Key Features to Test

1. **Authentication**
   - Sign up or sign in to create a user account

2. **Pack Marketplace**
   - Browse packs on the homepage
   - View pack details and odds

3. **Pack Opening**
   - Purchase a pack with test card: `4242 4242 4242 4242` (any future date and CVC)
   - Experience the pack opening animation
   - Choose to redeem or resell the card

4. **Digital Inventory**
   - Visit your inventory to see pulled cards
   - View redemption statuses of cards

## Troubleshooting

- **Blank screen / Component errors**: Check that all dependencies are installed. Run `bun install @radix-ui/react-popover @radix-ui/react-toast class-variance-authority` if needed.

- **Authentication issues**: Verify your Supabase URL and anon key are correct.

- **Database errors**: Ensure the SQL migrations were run in the correct order.

- **Stripe errors**: For basic testing, you can skip the Stripe integration.

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and API clients
- `/supabase` - Database migrations and seed files
- `/.same` - Documentation and notes

## Need Help?

Check the `.same` directory for comprehensive documentation:
- `GEMS_SYSTEM.md` - Details on the digital currency system
- `DATABASE_SETUP.md` - Database schema information
- `NEXT_STEPS.md` - Upcoming features to implement

Enjoy building and extending Slab Safari! 🏆
