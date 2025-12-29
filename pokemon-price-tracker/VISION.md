# 🎴 PokéTracker Vision: Pack Opening Marketplace

## 🎯 Core Concept

Transform from a simple price tracker into a **full-featured pack opening/mystery box marketplace** where users can:
- Buy and open digital packs
- Win real Pokémon cards
- See transparent odds and Expected Value (EV)
- Watch live pulls from other users (FOMO!)
- Trade and sell pulled cards

## 🏗️ Architecture & Stack

### Current Stack (Fully Integrated)
- ✅ Next.js 15 + TypeScript + Tailwind
- ✅ Supabase (PostgreSQL + Auth + RLS)
- ✅ Stripe (ready for integration)
- ✅ shadcn/ui components
- ✅ Real-time subscriptions ready

### Database Schema
```
Existing:
├── profiles (users)
├── cards (Pokémon card catalog)
├── watchlist
├── portfolio
├── price_alerts
└── marketplaces

New (Pack System):
├── packs (mystery boxes/packs)
├── pack_cards (odds for each card)
├── pack_opens (user activity/pulls)
└── orders (Stripe payment tracking)
```

## 🎨 Design Features (from References)

### 1. Courtyard.io Features
- **Dark theme** (matches card collecting vibe)
- **Light/Dark toggle** in nav
- **Live activity feed**: "Just Pulled" section
- **Hero banner**: Promote hot packs ($10 LIVE!)
- **Clean card layout**: Packs displayed as product cards

### 2. ArenaClub Features
- **Tiered system**:
  - Legendary ($2,500) - Ultra rare pulls
  - Diamond ($1,000) - High value
  - Emerald ($500) - Mid-tier premium
  - Ruby ($250) - Entry premium
  - Gold ($100) - Mid-range
  - Silver ($50) - Starter premium
  - Misc ($25) - Budget friendly
- **3D pack renders**: Use pack images with hover effects
- **"Multi-Grail" badges**: Show if pack has multiple chase cards

### 3. PurpleMana Features (CRITICAL - Transparency)
- **Odds display**: Show exact % for every card
- **Floor/EV/Ceiling**:
  ```
  Floor: $1.95 (worst pull)
  EV: $8.06 (average expected value)
  Ceiling: $424.99 (best pull)
  ```
- **Full card breakdown**: List all 30 cards with odds
- **Recent pulls section**: Show who pulled what
- **Condition labels**: NM, LP, etc.

### 4. Boxed.gg Features
- **Search functionality** with category filters
- **Box Battles**: PvP pack opening (future feature)
- **Gem/currency system**: Can use gems or cash
- **Live chat**: Real-time community

## 📊 Key Pages to Build

### 1. Homepage (`/`)
```
├── Hero Section (Hot Packs)
│   ├── Large banner promoting current hot pack
│   └── "Rip Now" CTA button
├── Live Activity Feed
│   ├── Real-time pulls from other users
│   ├── Card images + user avatars
│   └── Time stamps ("3 seconds ago")
├── Pack Tiers
│   ├── Legendary
│   ├── Diamond
│   ├── Emerald
│   ├── Ruby
│   ├── Gold
│   ├── Silver
│   └── Misc
└── Featured Packs
    ├── Best sellers
    ├── New arrivals
    └── Limited editions
```

### 2. Pack Detail Page (`/packs/[id]`)
```
├── Pack Info
│   ├── Name, price, image
│   └── Floor/EV/Ceiling prominently displayed
├── Transparency Section
│   ├── "What's Inside?" heading
│   ├── Full list of all possible cards
│   ├── Odds % for each card
│   └── Market value for each card
├── Purchase Section
│   ├── Quantity selector
│   ├── Total price
│   └── "Buy Pack" button (Stripe)
└── Recent Pulls
    ├── Live feed of this pack
    └── User avatars + pulled cards
```

### 3. My Collection (`/collection`)
```
├── Pulled Cards
│   ├── All cards user has pulled
│   ├── Ability to "redeem" (ship physical card)
│   └── Or sell on marketplace
├── Pack History
│   ├── All packs opened
│   ├── EV comparison (spent vs received)
│   └── Best/worst pulls
└── Stats
    ├── Total packs opened
    ├── Total value pulled
    └── Profit/loss
```

## 💰 Monetization Strategy

### Revenue Streams
1. **Pack Sales**: Primary revenue (mark up on cards + entertainment value)
2. **Marketplace Fee**: 5-10% on secondary sales
3. **Premium Features**:
   - Subscription for better odds
   - "Guaranteed hit" packs
   - Early access to limited drops
4. **Redemption Fees**: Small fee to ship physical cards

### Pricing Psychology
- **EV Strategy**: Packs priced at 80-90% of EV to be profitable but attractive
- **Chase Cards**: 1-2 high value cards per pack tier create excitement
- **Floor Protection**: Ensure worst pull isn't terrible (min $1-2 card)

## 🔥 FOMO & Engagement Features

### 1. Live Activity Feed
```typescript
// Real-time with Supabase subscriptions
const { data, error } = supabase
  .from('pack_opens')
  .select(`
    *,
    profiles(full_name, avatar_url),
    cards(name, image_url, market_price),
    packs(name)
  `)
  .order('opened_at', { ascending: false })
  .limit(50);

// Subscribe to new pulls
supabase
  .channel('pack_opens')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'pack_opens' },
    (payload) => {
      // Add new pull to feed with animation
    }
  )
  .subscribe();
```

### 2. Pack Opening Animation
- Smooth card reveal animation
- Particle effects for rare pulls
- Sound effects (optional)
- Social sharing ("I just pulled X!")

### 3. Leaderboards
- Biggest pull of the day
- Most packs opened
- Luckiest user (highest EV ratio)

### 4. Limited Drops
- Time-limited packs (24 hours only)
- Quantity-limited (100 packs total)
- Countdown timers

## 🎨 UI Components Needed

### New Components to Build
```
src/components/
├── packs/
│   ├── PackCard.tsx (individual pack display)
│   ├── PackGrid.tsx (grid of packs by tier)
│   ├── PackDetail.tsx (full pack page)
│   ├── OddsBreakdown.tsx (PurpleMana-style odds table)
│   ├── PackOpening.tsx (animation + reveal)
│   └── EVDisplay.tsx (Floor/EV/Ceiling component)
├── activity/
│   ├── LiveFeed.tsx (real-time pull feed)
│   ├── PullCard.tsx (individual pull display)
│   └── ActivityTicker.tsx (scrolling ticker)
├── shop/
│   ├── CheckoutModal.tsx (Stripe checkout)
│   └── QuantitySelector.tsx
└── theme/
    └── ThemeToggle.tsx (Dark/Light mode)
```

## 🚀 Implementation Phases

### Phase 1: Core Pack System (Week 1)
- [x] Database schema created
- [ ] Pack listing page
- [ ] Pack detail page with odds
- [ ] Basic purchase flow (no Stripe yet)
- [ ] Simulated pack opening
- [ ] Live activity feed

### Phase 2: Payments & Real Cards (Week 2)
- [ ] Stripe integration
- [ ] Real card inventory system
- [ ] Redemption flow
- [ ] Order history
- [ ] Email confirmations

### Phase 3: Marketplace & Trading (Week 3)
- [ ] Secondary marketplace
- [ ] User-to-user trading
- [ ] Offers system
- [ ] Price history charts

### Phase 4: Social & Engagement (Week 4)
- [ ] Pack battles (PvP)
- [ ] Leaderboards
- [ ] Achievement system
- [ ] Referral program

## 📱 Mobile Experience
- Fully responsive design
- Touch-friendly pack opening
- Native app feel with PWA
- Push notifications for:
  - Pack drops
  - Price alerts
  - Trade offers

## 🔐 Trust & Safety
- **Provably Fair**: Show pack seed/algorithm
- **Clear Odds**: Always visible (regulatory compliance)
- **Refund Policy**: Clear terms
- **Age Verification**: 18+ for purchases
- **Responsible Gaming**: Daily limits, self-exclusion

## 📈 Success Metrics
- **DAU** (Daily Active Users)
- **Pack Open Rate**: Users who buy → open
- **Repeat Rate**: Users who buy multiple packs
- **Average Order Value**: Packs per transaction
- **EV Ratio**: User winnings vs spending
- **Redemption Rate**: % of cards shipped

## 🎯 Next Steps
1. ✅ Set up Supabase database
2. ✅ Create pack schema
3. **Build homepage with pack marketplace**
4. **Implement pack detail page**
5. **Add live activity feed**
6. **Integrate Stripe**
7. **Launch MVP with 10-20 packs**

---

**Built with transparency, powered by Supabase & Stripe** 🎴
