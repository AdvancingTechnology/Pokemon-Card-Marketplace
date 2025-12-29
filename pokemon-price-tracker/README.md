# 🎩 Slab Safari - The Hunt for Gem Mint Pulls

A modern, full-stack pack opening marketplace for graded Pokémon cards. Hunt for PSA 10s, chase legendary pulls, and build your collection with transparent odds and real-time activity.

**Tagline:** *The hunt for gem mint pulls.*

![Slab Safari Screenshot](https://via.placeholder.com/1200x600/1B3A2F/D4AF37?text=Slab+Safari)

---

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and Stripe keys

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ✨ Features

### Core Marketplace
- 🎴 **Pack Opening** - Buy and open mystery packs with real-time card reveals
- 📊 **Transparent Odds** - Full breakdown of card probabilities (PurpleMana-style)
- 💰 **EV Display** - Floor/Expected Value/Ceiling clearly shown
- 🏪 **Tiered Packs** - Bronze ($25), Gold ($100), and Legendary ($500) tiers
- 🎯 **Live Activity Feed** - See what others are pulling in real-time

### User Features
- ✅ **Authentication** - Secure login with Supabase (Email/Password + Google OAuth)
- 💼 **Collection Page** - View all cards you've pulled with stats and values
- 💳 **Stripe Payments** - Secure payment processing for pack purchases
- 🔔 **Auto Pack Opening** - Packs automatically open after successful payment
- 📈 **Real-time Updates** - Live feed powered by Supabase subscriptions

### Design & Branding
- 🎨 **Slab Safari Theme** - Gold (#D4AF37), Jungle Green (#1B3A2F), Tan (#D7C7A3)
- 🎩 **Safari Hat Logo** - Custom branding throughout
- 🌟 **Smooth Animations** - Pack reveal with particle effects and confetti
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router + Turbopack
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom Safari theme
- **shadcn/ui** - Customized components
- **date-fns** - Date formatting

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database with Row Level Security
  - Real-time subscriptions for live feed
  - Authentication (Email/Password + OAuth)
- **Stripe** - Payment processing
- **Vercel** - Deployment and hosting

### Development Tools
- **Bun** - Fast package manager
- **Biome** - Linter and formatter
- **ESLint** - Code quality

---

## 📁 Project Structure

```
pokemon-price-tracker/
 src/
   ├── app/                      # Next.js App Router
   │   ├── collection/           # User collection page
   │   ├── api/                  # API routes
   │   │   ├── checkout/         # Stripe checkout
   │   │   └── webhooks/stripe/  # Stripe webhooks
   │   └── page.tsx              # Homepage
   ├── components/
   │   ├── branding/             # Slab Safari logo
   │   ├── packs/                # Pack cards, modals, opening
   │   ├── activity/             # Live feed
   │   └── ui/                   # shadcn/ui components
   ├── lib/
   │   ├── supabase/             # Supabase clients
   │   ├── stripe/               # Stripe utilities
   │   └── types/                # TypeScript types
   └── hooks/                    # Custom React hooks
 supabase/
   ├── schema.sql                # Core database schema
   ├── packs-schema.sql          # Pack system schema
   ├── seed.sql                  # Sample card data
   └── packs-seed.sql            # Sample pack data
 .same/                        # Documentation
    ├── DATABASE_SETUP.md         # Database seeding guide
    ├── STRIPE_SETUP.md           # Stripe integration guide
    └── DEPLOYMENT.md             # Vercel deployment guide
```

---

## 🗄️ Database Schema

### Core Tables
- `profiles` - User accounts and stats
- `cards` - Pokémon card catalog
- `packs` - Mystery pack definitions
- `pack_cards` - Card odds for each pack (with weights)
- `pack_opens` - User pull history (for live feed)
- `orders` - Purchase tracking with Stripe
- `price_history` - Historical price data
- `marketplaces` - Marketplace listings

All tables use **Row Level Security (RLS)** for data protection.

See `supabase/schema.sql` and `supabase/packs-schema.sql` for details.

---

## 🚦 Setup Guide

### 1. Database Setup

See [`.same/DATABASE_SETUP.md`](.same/DATABASE_SETUP.md) for detailed instructions.

Quick steps:
1. Run `supabase/schema.sql` in Supabase SQL Editor
2. Run `supabase/packs-schema.sql`
3. Run `supabase/seed.sql` (card data)
4. Run `supabase/packs-seed.sql` (pack data)

### 2. Stripe Setup

See [`.same/STRIPE_SETUP.md`](.same/STRIPE_SETUP.md) for detailed instructions.

Quick steps:
1. Create Stripe account
2. Get API keys (test mode)
3. Install Stripe CLI
4. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
5. Add webhook secret to `.env.local`

### 3. Deployment

See [`.same/DEPLOYMENT.md`](.same/DEPLOYMENT.md) for detailed instructions.

Quick steps:
1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy!
5. Configure production webhooks

---

## 🎮 How to Use

### For Users

1. **Browse Packs** - View all available packs with transparent odds
2. **View Details** - Click any pack to see full card list and pull rates
3. **Purchase Pack** - Click "BUY & OPEN" to proceed to Stripe checkout
4. **Automatic Opening** - Pack opens automatically after payment
5. **View Collection** - Go to "My Collection" to see all your cards

### For Developers

**Test pack opening without payment:**
- Comment out Stripe checkout in `PackDetailModal.tsx`
- Use the original `PackOpeningModal` flow
- Requires authentication

**Test with Stripe:**
- Use test card: `4242 4242 4242 4242`
- Any future expiry, any CVC
- Pack opens automatically via webhook

---

## 💡 Key Features Explained

### Transparent Odds (PurpleMana-Style)

Every pack shows:
- **Floor Value**: Worst case scenario (cheapest card)
- **Expected Value**: Average card value
- **Ceiling Value**: Best case scenario (most expensive card)
- **EV Ratio**: Expected value vs pack price (85%+ is good!)
- **Individual Odds**: Exact % chance for each card

### Pack Opening Flow

1. User clicks "BUY & OPEN" on pack
2. Redirected to Stripe Checkout
3. After payment, Stripe sends webhook to `/api/webhooks/stripe`
4. Server performs weighted random selection based on pack odds
5. Card saved to `pack_opens` table
6. User redirected to collection page
7. Live feed updates in real-time for all users

### Live Activity Feed

- Real-time updates via Supabase subscriptions
- Shows recent pulls across all users
- Card name, image, price, pack name, and time
- Creates FOMO and social proof

---

## 🔒 Security

- ✅ Row Level Security (RLS) on all Supabase tables
- ✅ JWT authentication with HTTP-only cookies
- ✅ Stripe webhook signature verification
- ✅ Server-side payment processing
- ✅ Environment variables for sensitive data
- ✅ CSRF protection via Next.js

---

## 📊 Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Pack marketplace with tiered packs
- [x] Pack detail modal with odds
- [x] Pack opening animation
- [x] User authentication
- [x] Collection page
- [x] Stripe payments
- [x] Live activity feed

### Phase 2: Enhanced Features
- [ ] Pack battles (PvP opening)
- [ ] Leaderboards (best pulls, highest value)
- [ ] Trading system
- [ ] Wishlist and alerts
- [ ] Referral program

### Phase 3: Growth
- [ ] Mobile app (PWA)
- [ ] Email notifications
- [ ] Advanced analytics
- [ ] Affiliate system
- [ ] Custom pack creator

---

## 🧪 Testing

### Test Cards (Stripe)

**Success**: `4242 4242 4242 4242`  
**3D Secure**: `4000 0025 0000 3155`  
**Declined**: `4000 0000 0000 0002`

### Database

Check pack odds:
```sql
SELECT p.name, c.name, pc.odds_percentage, pc.weight
FROM pack_cards pc
JOIN packs p ON pc.pack_id = p.id
JOIN cards c ON pc.card_id = c.id
WHERE p.name = 'Legendary Safari';
```

---

## 🤝 Contributing

Pull requests welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your fork
5. Open a pull request

---

## 📄 License

MIT License - Feel free to use this project for your own purposes.

---

## 🆘 Support

- **Documentation**: Check `.same/` folder for guides
- **Issues**: Open a GitHub issue
- **Questions**: Contact support@same.new

---

## 💖 Credits

Inspired by:
- **Courtyard.io** - Live activity feed
- **ArenaClub.com** - Tiered pack system
- **PurpleMana.com** - Transparent odds
- **Boxed.gg** - Search functionality

Built with:
- Next.js, TypeScript, Tailwind CSS
- Supabase, Stripe, Vercel
- shadcn/ui, Lucide Icons, date-fns

---

**Built with 🎩 by the Slab Safari team**

*Not affiliated with PSA, BGS, or Pokémon Company International.*
