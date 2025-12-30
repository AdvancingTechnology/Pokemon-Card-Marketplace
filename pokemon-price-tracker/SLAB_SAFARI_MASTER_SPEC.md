# Slab Safari Master Specification
## Pokemon Card Mystery Pack Marketplace

**Version:** 1.0.0
**Date:** December 29, 2025
**Status:** Ready for Implementation
**Authors:** Expert Development Panel (Backend, Frontend, Legal, Architecture)

---

## Executive Summary

Slab Safari is a digital mystery pack opening marketplace for graded Pokemon cards. Users purchase mystery packs with transparent odds, receive randomly selected cards via provably fair RNG, and can either redeem physical cards OR convert to Gems (digital currency) for continued play.

### Key Business Model
- **Pack Purchase**: Users buy packs ($25-$500) with USD or Gems
- **Random Selection**: Provably fair weighted RNG determines card
- **Decision Point**: User chooses Physical Redemption OR Gems (100% market value)
- **Gems Economy**: Gems can be used to buy more packs OR purchased in $5 increments
- **Resale**: Cards in inventory can be resold for 70% market value in Gems

---

## Table of Contents

1. [Phase 1 Implementation Plan](#phase-1-implementation-plan)
2. [Database Schema](#database-schema)
3. [API Endpoints](#api-endpoints)
4. [Gems System](#gems-system)
5. [Transparency Page](#transparency-page)
6. [Legal Compliance](#legal-compliance)
7. [UI Components](#ui-components)
8. [Security Requirements](#security-requirements)

---

## Phase 1 Implementation Plan

### Timeline: 2 Weeks

#### Week 1
| Day | Task | Complexity |
|-----|------|------------|
| 1-2 | Gems packages table + API + Stripe integration | M |
| 3 | Gems purchase UI (page + modal) | M |
| 4-5 | Pack purchase with gems (API + UI toggle) | M |

#### Week 2
| Day | Task | Complexity |
|-----|------|------------|
| 1-2 | Transparency page structure + stats API | M |
| 3 | Odds table component + pack stats API | M |
| 4 | Payout chart + house edge calculator | S |
| 5 | Testing, polish, documentation | S |

### Priority Features (P0)
1. **Gems Purchase with Stripe** - Users can buy gems in $5 increments
2. **Pack Purchase with Gems** - Use gems instead of USD
3. **Transparency Page** - Full odds disclosure
4. **Provably Fair System** - Verifiable RNG

---

## Database Schema

### Core Tables

```sql
-- Gem Balances (User Wallets)
CREATE TABLE gem_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    available_balance BIGINT NOT NULL DEFAULT 0,
    pending_balance BIGINT NOT NULL DEFAULT 0,
    lifetime_earned BIGINT NOT NULL DEFAULT 0,
    lifetime_spent BIGINT NOT NULL DEFAULT 0,
    lifetime_purchased BIGINT NOT NULL DEFAULT 0,
    promotional_balance BIGINT NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_balance UNIQUE (user_id)
);

-- Gem Transactions (Immutable Audit Trail)
CREATE TABLE gem_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_ref VARCHAR(64) NOT NULL UNIQUE,
    idempotency_key VARCHAR(128) UNIQUE,
    user_id UUID NOT NULL,
    balance_id UUID NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    amount BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    source_type VARCHAR(50),
    source_id UUID,
    stripe_payment_intent_id VARCHAR(255),
    card_id UUID,
    card_market_value_cents INTEGER,
    gem_conversion_rate DECIMAL(5,4),
    server_seed_hash VARCHAR(64),
    is_immutable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gem Packages (Purchasable Bundles)
CREATE TABLE gem_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 500),
    gem_amount BIGINT NOT NULL,
    bonus_gems BIGINT NOT NULL DEFAULT 0,
    stripe_price_id VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default Packages
INSERT INTO gem_packages (sku, name, price_cents, gem_amount, bonus_gems, display_order) VALUES
    ('gems_500', 'Starter Pack', 500, 500, 0, 1),
    ('gems_1000', 'Explorer Pack', 1000, 1000, 50, 2),
    ('gems_2500', 'Trainer Pack', 2500, 2500, 200, 3),
    ('gems_5000', 'Champion Pack', 5000, 5000, 500, 4),
    ('gems_10000', 'Master Pack', 10000, 10000, 1500, 5);

-- Provably Fair Seeds
CREATE TABLE provably_fair_seeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    server_seed VARCHAR(64) NOT NULL,
    server_seed_hash VARCHAR(64) NOT NULL,
    client_seed VARCHAR(64) DEFAULT 'default_client_seed',
    current_nonce BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    revealed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pack Statistics View
CREATE VIEW pack_statistics AS
SELECT
    p.id as pack_id,
    p.name,
    p.tier,
    p.price,
    COUNT(po.id) as total_opens,
    COALESCE(AVG(c.market_price), 0) as actual_avg_value,
    CASE WHEN p.price > 0 THEN
        ROUND((COALESCE(AVG(c.market_price), 0) / p.price) * 100, 2)
    ELSE 0 END as payout_percentage
FROM packs p
LEFT JOIN pack_opens po ON p.id = po.pack_id
LEFT JOIN cards c ON po.card_id = c.id
GROUP BY p.id;
```

---

## API Endpoints

### Gems API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gems` | Get user's gem balance |
| GET | `/api/gems/packages` | List available packages |
| POST | `/api/gems/purchase` | Create Stripe checkout |
| GET | `/api/gems/transactions` | Transaction history |
| POST | `/api/packs/open-with-gems` | Open pack using gems |

### Transparency API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transparency/stats` | Platform statistics |
| GET | `/api/transparency/pack/[id]` | Pack-specific stats |
| GET | `/api/transparency/recent-payouts` | Recent big wins |

### Provably Fair API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/provably-fair` | Get current seed hash |
| POST | `/api/provably-fair/rotate` | Rotate seeds |
| PATCH | `/api/provably-fair` | Update client seed |
| GET | `/api/provably-fair/verify/[pullId]` | Verify a pull |

---

## Gems System

### Gem Flow Diagram

```
        ┌─────────────────┐
        │  STRIPE PURCHASE │ ($5 = 500 gems)
        │    ($5+ USD)     │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  GEM BALANCE    │◄────────────────────┐
        │  💎 5,000       │                     │
        └────────┬────────┘                     │
                 │                              │
                 ▼                              │
        ┌─────────────────┐              ┌──────┴──────┐
        │  BUY PACK       │              │ CARD FORFEIT │
        │  (-500 gems)    │              │ (+100% MV)   │
        └────────┬────────┘              └──────────────┘
                 │                              ▲
                 ▼                              │
        ┌─────────────────┐                     │
        │  PROVABLY FAIR  │                     │
        │  RNG SELECTION  │                     │
        └────────┬────────┘                     │
                 │                              │
        ┌────────┴────────┐                     │
        ▼                 ▼                     │
   ┌─────────┐      ┌─────────┐                │
   │ REDEEM  │      │ FORFEIT │────────────────┘
   │ PHYSICAL│      │ FOR GEMS│
   └─────────┘      └─────────┘
```

### Conversion Rates
- **Forfeit (new pull)**: 100% of market value in gems
- **Resale (inventory)**: 70% of market value in gems
- **Purchase**: $1 USD = 100 gems (+ bonus for larger packages)

### Bonus Tiers
| Package | Price | Base Gems | Bonus | Total |
|---------|-------|-----------|-------|-------|
| Starter | $5 | 500 | 0% | 500 |
| Explorer | $10 | 1,000 | 5% | 1,050 |
| Trainer | $25 | 2,500 | 8% | 2,700 |
| Champion | $50 | 5,000 | 10% | 5,500 |
| Master | $100 | 10,000 | 15% | 11,500 |

---

## Transparency Page

### Required Sections

1. **Pack Odds Display**
   - Full probability breakdown per rarity
   - Expected Value calculation
   - House edge percentage
   - Visual progress bars

2. **Live Statistics**
   - 24hr pulls count
   - Total gems distributed
   - Cards shipped today
   - Active players

3. **Historical Payouts**
   - Monthly payout chart
   - Total platform statistics
   - Actual vs Expected payout %

4. **Provably Fair Verifier**
   - Pull ID lookup
   - Server/client seed display
   - Hash verification
   - Technical documentation link

### Required Disclosures (Per Legal Spec)

```
┌─────────────────────────────────────────────────────────────────┐
│                    PACK ODDS DISCLOSURE                         │
│                    Safari Premium Pack ($100)                   │
├─────────────────────────────────────────────────────────────────┤
│  RARITY DISTRIBUTION:                                           │
│  ├── Common:         65.0%                                      │
│  ├── Uncommon:       24.0%                                      │
│  ├── Rare:            8.0%                                      │
│  ├── Ultra Rare:      2.5%                                      │
│  ├── Secret Rare:     0.45%                                     │
│  └── Chase:           0.05%                                     │
│                                                                 │
│  EXPECTED VALUE: $85.00 (85% of pack price)                    │
│  HOUSE EDGE: 15%                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Legal Compliance

### Critical Requirements

#### 1. Geographic Restrictions
**Must Block:**
- US: Washington, Hawaii, Utah
- International: Belgium, Netherlands

**Enhanced Requirements:**
- Australia: $1,000/month limit
- Germany: Age verification, monthly limit display
- UK: Reality checks every 60 minutes

#### 2. Age Verification
- Minimum age: 18+ (21+ in NV, NJ)
- Checkbox acknowledgment for Tier 1
- ID verification for Tier 2+ ($500+ or redemption)

#### 3. Mandatory Warnings

**Pre-Purchase (First Time):**
```
IMPORTANT DISCLOSURE

1. RANDOM OUTCOME: Pack contents are determined randomly.
2. EXPECTED VALUE: On average, pack contents are worth
   less than the purchase price.
3. NOT AN INVESTMENT: Card values fluctuate.
4. AGE REQUIREMENT: You must be 18+ (21+ in some states).
5. GAMBLING RISK: Call 1-800-522-4700 for help.

[ ] I have read and understand these disclosures
```

**Persistent Footer:**
```
Slab Safari is entertainment. Expected value is typically below
purchase price. Must be 18+. Gambling Problem? Call 1-800-522-4700
```

#### 4. Responsible Gambling Features
- Spending limits (daily/weekly/monthly)
- Session time limits
- Self-exclusion (24hr to permanent)
- Cooling-off period for limit increases (72hr)

#### 5. KYC/AML Tiers

| Tier | Trigger | Requirements | Limits |
|------|---------|--------------|--------|
| 1 | Account creation | Email, age checkbox | $500/tx, $2K/mo |
| 2 | Redemption or >$500 | ID verification | $5K/tx, $10K/mo |
| 3 | >$10K/mo | Source of funds | $50K/tx, $100K/mo |
| 4 | >$100K lifetime | Video verification | Custom |

---

## UI Components

### Design System

**Brand Colors:**
```typescript
gold: '#D4AF37'      // Primary accent
jungle: '#1B3A2F'    // Background
tan: '#D7C7A3'       // Text
gem: '#8B5CF6'       // Gem purple
```

**Rarity Colors:**
```typescript
common: '#9CA3AF'
uncommon: '#34D399'
rare: '#3B82F6'
ultraRare: '#8B5CF6'
secretRare: '#F59E0B'
chase: '#EF4444'
```

### Core Components

1. **GemBalance** - Header display with dropdown
2. **GemPurchaseModal** - Package selection + Stripe checkout
3. **GemTransactionHistory** - Filterable history sheet
4. **PackOddsDisplay** - Tabbed odds visualization
5. **LiveStatistics** - Real-time stats cards
6. **RecentPullsTicker** - Animated pull feed
7. **ProvablyFairVerifier** - Hash verification tool
8. **ResellForGemsButton** - Card-to-gems conversion
9. **GemsCheckout** - Dual payment method toggle

### Accessibility Requirements
- WCAG 2.1 AA compliance
- 4.5:1 color contrast minimum
- Full keyboard navigation
- Screen reader announcements
- Reduced motion support

---

## Security Requirements

### Provably Fair RNG

**Algorithm:**
```
1. Server generates server_seed (32 bytes random)
2. User sees SHA-256(server_seed) before play
3. Combined = server_seed + ":" + client_seed + ":" + nonce
4. Hash = SHA-256(combined)
5. Roll = parseInt(hash[0:8], 16) % 100000
6. Nonce increments for each roll
7. Server seed revealed after rotation
```

**Verification:**
Users can independently verify any pull by:
1. Checking server_seed hashes to commitment
2. Combining seeds + nonce
3. Verifying result matches recorded outcome

### Transaction Security

1. **Idempotency Keys** - Prevent duplicate charges
2. **Optimistic Locking** - Prevent race conditions
3. **Immutable Audit Trail** - All transactions logged
4. **Rate Limiting** - Upstash Redis integration

### Rate Limits

| Operation | Limit |
|-----------|-------|
| Gem purchases | 10/hour |
| Pack openings | 60/minute |
| Seed rotations | 5/hour |
| API general | 100/minute |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Rate Limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Implementation Checklist

### Phase 1 (Weeks 1-2)
- [ ] Create gem_packages table and seed data
- [ ] Create Stripe Products/Prices for packages
- [ ] Implement `/api/gems/checkout` endpoint
- [ ] Build GemPurchaseModal component
- [ ] Implement `/api/packs/open-with-gems` endpoint
- [ ] Add gems toggle to PackDetailModal
- [ ] Create transparency page layout
- [ ] Build PackOddsDisplay component
- [ ] Implement provably fair seed system
- [ ] Add persistent disclosure footer

### Phase 2 (Weeks 3-4)
- [ ] Admin dashboard (basic)
- [ ] Leaderboards
- [ ] Enhanced animations
- [ ] Collection showcase

### Phase 3 (Weeks 5-8)
- [ ] Social sharing
- [ ] Achievement system
- [ ] Card trading (future)

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Gambling law enforcement | HIGH | Critical | Legal counsel, geo-blocking |
| Class action (deceptive) | MEDIUM | High | Clear disclosures |
| Minor access | MEDIUM | High | KYC verification |
| Problem gambling | MEDIUM | Medium | Self-exclusion tools |
| Money laundering | LOW | High | AML monitoring |

---

## Conclusion

This specification provides a complete blueprint for building Slab Safari's transparency and gems features. The system prioritizes:

1. **User Trust** - Provably fair, transparent odds
2. **Legal Compliance** - Age verification, geo-blocking, disclosures
3. **Engagement Loop** - Gems create continued play incentive
4. **Technical Security** - Immutable audits, rate limiting, encryption

**Next Steps:**
1. Run database migrations
2. Create Stripe products
3. Implement gems purchase flow
4. Build transparency page
5. Deploy and test

---

*Generated by Expert Development Panel - December 29, 2025*
