# 🗄️ Database Setup Guide

## ⚠️ If You Get "relation already exists" Error

If you see `ERROR: 42P07: relation "profiles" already exists`, it means you already ran the core schema earlier. **This is normal!**

### Solution: Use the Safe Migration

Instead of `supabase/packs-schema.sql`, run this:

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"New Query"**
5. Copy the entire contents of **`supabase/migration-packs-only.sql`**
6. Paste into the SQL editor
7. Click **"Run"** (bottom right)

You should see: `Success. No rows returned.` ✅

This safely creates only the pack tables without touching existing tables.

---

## Step 1: Run the Packs Migration (First Time Only)

**If you've never run the packs schema before:**

1. Open Supabase SQL Editor
2. Copy contents of **`supabase/migration-packs-only.sql`**
3. Paste and click **"Run"**
4. Should see success message

This creates:
- ✅ `packs` table
- ✅ `pack_cards` table (odds)
- ✅ `pack_opens` table (pull history)
- ✅ `orders` table (Stripe purchases)

---

## Step 2: Seed Pack Data

Now populate with sample packs:

1. Still in **SQL Editor**, click **"New Query"**
2. Copy the entire contents of **`supabase/packs-seed.sql`**
3. Paste into the SQL editor
4. Click **"Run"** (bottom right)

You should see: `Success. 6 rows returned.`

This populates:
- ✅ 6 packs (2 Legendary, 2 Gold, 2 Bronze)
- ✅ Pack cards with weighted odds for each pack
- ✅ Relationships between packs and cards

---

---

## Step 3: Verify the Data

Run this query to check your packs:

```sql
SELECT id, name, tier, price, expected_value, total_opened
FROM packs
ORDER BY tier DESC, name;
```

You should see:
- Legendary Safari ($500)
- Graded Gem Hunt ($500)
- Gold Safari ($100)
- Modern Gold ($100)
- Bronze Safari ($25)
- Vintage Bronze ($25)

---

## Step 3: Check Pack Cards & Odds

Run this to verify pack odds:

```sql
SELECT
  p.name as pack_name,
  c.name as card_name,
  pc.odds_percentage,
  pc.weight
FROM pack_cards pc
JOIN packs p ON pc.pack_id = p.id
JOIN cards c ON pc.card_id = c.id
WHERE p.name = 'Legendary Safari'
ORDER BY pc.odds_percentage DESC;
```

---

## Step 4: Test Pack Opening

1. **Sign In** to your app
2. **Click** any pack card
3. **Click** "RIP NOW" in the pack detail modal
4. **Watch** the animation!
5. **Check** the live feed - your pull should appear

---

## Troubleshooting

### "No cards found" error
- Make sure `supabase/seed.sql` was also run (for cards table)
- Check that cards exist: `SELECT COUNT(*) FROM cards;`

### "Failed to open pack"
- Check pack_cards relationships exist
- Verify user is authenticated
- Check browser console for errors

### Pack opens but no animation
- Clear browser cache
- Check that JavaScript is enabled
- Try a different browser

---

## Next: Test the Flow

1. ✅ Database seeded
2. ✅ Sign in to the app
3. ✅ Browse packs
4. ✅ View pack details
5. ✅ Open a pack
6. ✅ See your pull in the live feed

Ready to build more features!
