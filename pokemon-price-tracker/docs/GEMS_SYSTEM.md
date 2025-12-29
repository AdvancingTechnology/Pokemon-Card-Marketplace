# 💎 Gems System Documentation

## Overview

The Gems system is a digital currency used in Slab Safari that enables users to buy packs and resell cards. It creates a reinvestment loop that encourages users to continue interacting with the platform.

## Key Concepts

### 1. Digital-to-Physical Loop

Slab Safari operates on a "digital-to-physical" loop:

1. User opens a digital pack and receives a graded card
2. User has two options:
   - **Redeem**: Request physical shipping of the actual graded card
   - **Resell**: Convert the card back to Gems (70% of market value)
3. Resold Gems can be used to open more packs, creating a reinvestment loop

### 2. Transaction Types

The system supports four types of Gem transactions:

| Type | Description |
|------|-------------|
| `earned_resell` | Gems earned from reselling a card |
| `spent_pack` | Gems spent to open a pack |
| `purchased` | Gems purchased with real money |
| `refund` | Refunded Gems (admin action) |

### 3. Redemption Statuses

Each card in a user's inventory can have one of four statuses:

| Status | Description |
|------|-------------|
| `in_inventory` | Card is in digital inventory (default) |
| `pending_redemption` | User requested physical card, awaiting shipment |
| `shipped` | Physical card has been shipped |
| `resold` | Card was resold for Gems |

## Database Schema

The Gems system is built on these database tables:

1. **profiles**
   - Added `gem_balance` column (DECIMAL)

2. **gem_transactions**
   - `id`: UUID (Primary Key)
   - `user_id`: UUID (References profiles)
   - `amount`: DECIMAL
   - `type`: TEXT (earned_resell, spent_pack, purchased, refund)
   - `card_id`: UUID (Optional)
   - `pack_id`: UUID (Optional)
   - `description`: TEXT
   - `created_at`: TIMESTAMP

3. **pack_opens**
   - Added `redemption_status`: TEXT
   - Added `resell_gems_earned`: DECIMAL

## Frontend Components

1. **GemBalance Component**
   - Displays current Gem balance in navigation
   - Shows transaction history in a popover

2. **PackOpeningModal**
   - Added redemption/resell decision flow after card reveal
   - Shows card value and equivalent Gem value (70%)

3. **Inventory Page**
   - Enhanced to show redemption status of each card
   - Displays Gem value earned for resold cards

## Implementation Details

### Automatic Balance Updates

When a transaction is recorded, a database trigger automatically updates the user's balance:

```sql
CREATE OR REPLACE FUNCTION update_gem_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's gem balance
  UPDATE public.profiles
  SET gem_balance = gem_balance + NEW.amount
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Security

- Row Level Security ensures users can only view/modify their own Gem transactions
- Database constraints prevent invalid transaction types
- All transactions are recorded for audit purposes

## Adding Gems to User Account

To add Gems to a user's account (for example, when they resell a card):

```typescript
// Using the useGems hook
const { addTransaction } = useGems();

await addTransaction(
  amount,           // number - amount of gems (positive)
  'earned_resell',  // transaction type
  'Description',    // description of transaction
  { card_id, pack_id } // optional metadata
);
```

## Future Enhancements

1. **Gems Purchase**
   - Allow users to purchase Gems with real money
   - Implement tiered bundles with bonuses

2. **Subscription Tiers**
   - Premium users get higher resell values (e.g., 80% instead of 70%)
   - Monthly Gem allowance for subscribers

3. **Gems Rewards**
   - Referral bonuses paid in Gems
   - Daily login rewards
   - Achievement-based rewards

---

*For technical questions about the Gems system, please contact the development team.*
