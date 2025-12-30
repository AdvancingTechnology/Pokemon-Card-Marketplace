-- ============================================================================
-- SLAB SAFARI - COMPLETE DATABASE SETUP
-- Run this entire script in the Supabase SQL Editor
-- Go to: https://supabase.com/dashboard/project/mwscncedcuzakbqdetem/sql/new
-- ============================================================================

-- Step 1: Add INSERT/UPDATE policies for cards and packs (admin seeding)
-- These allow anyone to insert for now (you can restrict later)

DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow card inserts" ON public.cards;
  DROP POLICY IF EXISTS "Allow pack inserts" ON public.packs;
  DROP POLICY IF EXISTS "Allow pack_cards inserts" ON public.pack_cards;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Create INSERT policies (temporarily allow all for seeding)
CREATE POLICY "Allow card inserts" ON public.cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow pack inserts" ON public.packs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow pack_cards inserts" ON public.pack_cards FOR INSERT WITH CHECK (true);

-- ============================================================================
-- CARDS: 68 Real Pokemon Cards Across All Rarities
-- ============================================================================

-- COMMON CARDS ($1-$10)
INSERT INTO cards (name, set_name, rarity, market_price, image_url) VALUES
('Pikachu', 'Base Set', 'common', 8.50, 'https://images.pokemontcg.io/base1/58.png'),
('Charmander', 'Base Set', 'common', 7.00, 'https://images.pokemontcg.io/base1/46.png'),
('Squirtle', 'Base Set', 'common', 6.50, 'https://images.pokemontcg.io/base1/63.png'),
('Bulbasaur', 'Base Set', 'common', 6.00, 'https://images.pokemontcg.io/base1/44.png'),
('Rattata', 'Base Set', 'common', 1.50, 'https://images.pokemontcg.io/base1/61.png'),
('Pidgey', 'Base Set', 'common', 1.25, 'https://images.pokemontcg.io/base1/57.png'),
('Weedle', 'Base Set', 'common', 1.00, 'https://images.pokemontcg.io/base1/69.png'),
('Caterpie', 'Base Set', 'common', 1.00, 'https://images.pokemontcg.io/base1/45.png'),
('Eevee', 'Evolving Skies', 'common', 2.50, 'https://images.pokemontcg.io/swsh7/101.png'),
('Pikachu', 'Crown Zenith', 'common', 3.00, 'https://images.pokemontcg.io/swsh12pt5/SWSH204.png'),
('Sobble', 'Sword & Shield', 'common', 1.50, 'https://images.pokemontcg.io/swsh1/54.png'),
('Scorbunny', 'Sword & Shield', 'common', 1.50, 'https://images.pokemontcg.io/swsh1/30.png'),
('Grookey', 'Sword & Shield', 'common', 1.50, 'https://images.pokemontcg.io/swsh1/11.png'),
('Wooloo', 'Sword & Shield', 'common', 1.25, 'https://images.pokemontcg.io/swsh1/153.png'),
('Yamper', 'Sword & Shield', 'common', 1.75, 'https://images.pokemontcg.io/swsh1/73.png')
ON CONFLICT DO NOTHING;

-- UNCOMMON CARDS ($10-$50)
INSERT INTO cards (name, set_name, rarity, market_price, image_url) VALUES
('Raichu', 'Base Set', 'uncommon', 25.00, 'https://images.pokemontcg.io/base1/14.png'),
('Charmeleon', 'Base Set', 'uncommon', 18.00, 'https://images.pokemontcg.io/base1/24.png'),
('Wartortle', 'Base Set', 'uncommon', 15.00, 'https://images.pokemontcg.io/base1/42.png'),
('Ivysaur', 'Base Set', 'uncommon', 14.00, 'https://images.pokemontcg.io/base1/30.png'),
('Pidgeotto', 'Base Set', 'uncommon', 10.00, 'https://images.pokemontcg.io/base1/22.png'),
('Haunter', 'Base Set', 'uncommon', 12.00, 'https://images.pokemontcg.io/base1/29.png'),
('Kadabra', 'Base Set', 'uncommon', 11.00, 'https://images.pokemontcg.io/base1/32.png'),
('Machoke', 'Base Set', 'uncommon', 10.50, 'https://images.pokemontcg.io/base1/34.png'),
('Dragonair', 'Evolving Skies', 'uncommon', 22.00, 'https://images.pokemontcg.io/swsh7/117.png'),
('Jolteon', 'Evolving Skies', 'uncommon', 35.00, 'https://images.pokemontcg.io/swsh7/136.png'),
('Vaporeon', 'Evolving Skies', 'uncommon', 32.00, 'https://images.pokemontcg.io/swsh7/30.png'),
('Flareon', 'Evolving Skies', 'uncommon', 30.00, 'https://images.pokemontcg.io/swsh7/26.png'),
('Lucario', 'Brilliant Stars', 'uncommon', 28.00, 'https://images.pokemontcg.io/swsh9/79.png'),
('Garchomp', 'Astral Radiance', 'uncommon', 25.00, 'https://images.pokemontcg.io/swsh10/117.png'),
('Gengar', 'Lost Origin', 'uncommon', 45.00, 'https://images.pokemontcg.io/swsh11/66.png')
ON CONFLICT DO NOTHING;

-- RARE CARDS ($50-$200) - Holos
INSERT INTO cards (name, set_name, rarity, market_price, image_url) VALUES
('Charizard', 'Base Set', 'rare', 180.00, 'https://images.pokemontcg.io/base1/4.png'),
('Blastoise', 'Base Set', 'rare', 120.00, 'https://images.pokemontcg.io/base1/2.png'),
('Venusaur', 'Base Set', 'rare', 95.00, 'https://images.pokemontcg.io/base1/15.png'),
('Alakazam', 'Base Set', 'rare', 75.00, 'https://images.pokemontcg.io/base1/1.png'),
('Gyarados', 'Base Set', 'rare', 85.00, 'https://images.pokemontcg.io/base1/6.png'),
('Mewtwo', 'Base Set', 'rare', 90.00, 'https://images.pokemontcg.io/base1/10.png'),
('Zapdos', 'Base Set', 'rare', 70.00, 'https://images.pokemontcg.io/base1/16.png'),
('Moltres', 'Fossil', 'rare', 65.00, 'https://images.pokemontcg.io/base2/12.png'),
('Articuno', 'Fossil', 'rare', 68.00, 'https://images.pokemontcg.io/base2/2.png'),
('Dragonite', 'Fossil', 'rare', 150.00, 'https://images.pokemontcg.io/base2/4.png'),
('Pikachu V', 'Vivid Voltage', 'rare', 55.00, 'https://images.pokemontcg.io/swsh4/43.png'),
('Charizard V', 'Darkness Ablaze', 'rare', 85.00, 'https://images.pokemontcg.io/swsh3/19.png'),
('Rayquaza V', 'Evolving Skies', 'rare', 75.00, 'https://images.pokemontcg.io/swsh7/110.png'),
('Umbreon V', 'Evolving Skies', 'rare', 95.00, 'https://images.pokemontcg.io/swsh7/94.png'),
('Mew V', 'Fusion Strike', 'rare', 60.00, 'https://images.pokemontcg.io/swsh8/113.png'),
('Arceus V', 'Brilliant Stars', 'rare', 70.00, 'https://images.pokemontcg.io/swsh9/122.png')
ON CONFLICT DO NOTHING;

-- ULTRA RARE CARDS ($200-$500) - VMAX, Full Arts
INSERT INTO cards (name, set_name, rarity, market_price, image_url) VALUES
('Charizard VMAX', 'Darkness Ablaze', 'ultra rare', 280.00, 'https://images.pokemontcg.io/swsh3/20.png'),
('Pikachu VMAX', 'Vivid Voltage', 'ultra rare', 320.00, 'https://images.pokemontcg.io/swsh4/44.png'),
('Rayquaza VMAX', 'Evolving Skies', 'ultra rare', 250.00, 'https://images.pokemontcg.io/swsh7/111.png'),
('Umbreon VMAX', 'Evolving Skies', 'ultra rare', 450.00, 'https://images.pokemontcg.io/swsh7/95.png'),
('Mew VMAX', 'Fusion Strike', 'ultra rare', 220.00, 'https://images.pokemontcg.io/swsh8/114.png'),
('Gengar VMAX', 'Fusion Strike', 'ultra rare', 195.00, 'https://images.pokemontcg.io/swsh8/157.png'),
('Espeon VMAX', 'Evolving Skies', 'ultra rare', 380.00, 'https://images.pokemontcg.io/swsh7/65.png'),
('Dragonite V Alt Art', 'Evolving Skies', 'ultra rare', 285.00, 'https://images.pokemontcg.io/swsh7/192.png'),
('Sylveon VMAX', 'Evolving Skies', 'ultra rare', 350.00, 'https://images.pokemontcg.io/swsh7/75.png'),
('Glaceon VMAX', 'Evolving Skies', 'ultra rare', 290.00, 'https://images.pokemontcg.io/swsh7/41.png'),
('Arceus VSTAR', 'Brilliant Stars', 'ultra rare', 210.00, 'https://images.pokemontcg.io/swsh9/123.png'),
('Charizard VSTAR', 'Brilliant Stars', 'ultra rare', 480.00, 'https://images.pokemontcg.io/swsh9/18.png')
ON CONFLICT DO NOTHING;

-- SECRET RARE CARDS ($500-$5000+) - Gold Stars, 1st Editions, Rainbow, Alt Arts
INSERT INTO cards (name, set_name, rarity, market_price, image_url) VALUES
('Charizard 1st Edition', 'Base Set', 'secret rare', 4500.00, 'https://images.pokemontcg.io/base1/4.png'),
('Charizard Gold Star', 'Dragon Frontiers', 'secret rare', 3800.00, 'https://images.pokemontcg.io/ex14/100.png'),
('Pikachu Illustrator', 'Promo', 'secret rare', 5000.00, 'https://images.pokemontcg.io/basep/4.png'),
('Umbreon VMAX Alt Art', 'Evolving Skies', 'secret rare', 850.00, 'https://images.pokemontcg.io/swsh7/215.png'),
('Rayquaza VMAX Alt Art', 'Evolving Skies', 'secret rare', 520.00, 'https://images.pokemontcg.io/swsh7/218.png'),
('Moonbreon', 'Evolving Skies', 'secret rare', 680.00, 'https://images.pokemontcg.io/swsh7/244.png'),
('Charizard Rainbow Rare', 'Champions Path', 'secret rare', 550.00, 'https://images.pokemontcg.io/swsh35/74.png'),
('Lugia V Alt Art', 'Silver Tempest', 'secret rare', 580.00, 'https://images.pokemontcg.io/swsh12/186.png'),
('Giratina V Alt Art', 'Lost Origin', 'secret rare', 620.00, 'https://images.pokemontcg.io/swsh11/186.png'),
('Mew Gold', 'Celebrations', 'secret rare', 720.00, 'https://images.pokemontcg.io/cel25/25.png'),
('Charizard UPC Promo', 'Ultra Premium Collection', 'secret rare', 950.00, 'https://images.pokemontcg.io/swsh12pt5gg/GG70.png'),
('Shiny Charizard VMAX', 'Shining Fates', 'secret rare', 750.00, 'https://images.pokemontcg.io/swsh45sv/SV107.png'),
('Blastoise 1st Edition', 'Base Set', 'secret rare', 2800.00, 'https://images.pokemontcg.io/base1/2.png'),
('Venusaur 1st Edition', 'Base Set', 'secret rare', 1800.00, 'https://images.pokemontcg.io/base1/15.png')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PACKS: 4 Tier System
-- ============================================================================

INSERT INTO packs (name, description, gem_cost, image_url) VALUES
('Bronze Pack', 'Entry-level pack with common and uncommon cards. Great for beginners building their collection!', 500, '/images/packs/bronze-pack.png'),
('Silver Pack', 'Mid-tier pack with better odds for rare cards. Solid value for growing collectors.', 1500, '/images/packs/silver-pack.png'),
('Gold Pack', 'Premium pack with excellent rare and ultra rare odds. For serious collectors.', 5000, '/images/packs/gold-pack.png'),
('Legendary Pack', 'The ultimate pack! Best odds for secret rares and chase cards. High risk, high reward!', 15000, '/images/packs/legendary-pack.png')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PACK_CARDS: Weighted Card Pools for Each Pack
-- ============================================================================

-- Bronze Pack: Commons 60, Uncommons 35, Cheap Rares 5
INSERT INTO pack_cards (pack_id, card_id, weight)
SELECT p.id, c.id,
  CASE
    WHEN c.rarity = 'common' THEN 60
    WHEN c.rarity = 'uncommon' THEN 35
    WHEN c.rarity = 'rare' AND c.market_price <= 100 THEN 5
    ELSE 0
  END
FROM packs p, cards c
WHERE p.name = 'Bronze Pack'
  AND (c.rarity IN ('common', 'uncommon') OR (c.rarity = 'rare' AND c.market_price <= 100))
ON CONFLICT DO NOTHING;

-- Silver Pack: Commons 30, Uncommons 45, Rares 20, Cheap Ultra Rares 5
INSERT INTO pack_cards (pack_id, card_id, weight)
SELECT p.id, c.id,
  CASE
    WHEN c.rarity = 'common' THEN 30
    WHEN c.rarity = 'uncommon' THEN 45
    WHEN c.rarity = 'rare' THEN 20
    WHEN c.rarity = 'ultra rare' AND c.market_price <= 300 THEN 5
    ELSE 0
  END
FROM packs p, cards c
WHERE p.name = 'Silver Pack'
  AND (c.rarity IN ('common', 'uncommon', 'rare') OR (c.rarity = 'ultra rare' AND c.market_price <= 300))
ON CONFLICT DO NOTHING;

-- Gold Pack: Uncommons 20, Rares 40, Ultra Rares 30, Cheap Secret Rares 10
INSERT INTO pack_cards (pack_id, card_id, weight)
SELECT p.id, c.id,
  CASE
    WHEN c.rarity = 'uncommon' THEN 20
    WHEN c.rarity = 'rare' THEN 40
    WHEN c.rarity = 'ultra rare' THEN 30
    WHEN c.rarity = 'secret rare' AND c.market_price <= 800 THEN 10
    ELSE 0
  END
FROM packs p, cards c
WHERE p.name = 'Gold Pack'
  AND (c.rarity IN ('uncommon', 'rare', 'ultra rare') OR (c.rarity = 'secret rare' AND c.market_price <= 800))
ON CONFLICT DO NOTHING;

-- Legendary Pack: Expensive Rares 15, Ultra Rares 40, Secret Rares 45
INSERT INTO pack_cards (pack_id, card_id, weight)
SELECT p.id, c.id,
  CASE
    WHEN c.rarity = 'rare' AND c.market_price >= 70 THEN 15
    WHEN c.rarity = 'ultra rare' THEN 40
    WHEN c.rarity = 'secret rare' THEN 45
    ELSE 0
  END
FROM packs p, cards c
WHERE p.name = 'Legendary Pack'
  AND ((c.rarity = 'rare' AND c.market_price >= 70) OR c.rarity IN ('ultra rare', 'secret rare'))
ON CONFLICT DO NOTHING;

-- Clean up zero-weight entries
DELETE FROM pack_cards WHERE weight = 0;

-- ============================================================================
-- VERIFY SEEDING
-- ============================================================================

SELECT
  'Cards: ' || COUNT(*) as cards_count
FROM cards
UNION ALL
SELECT
  'Packs: ' || COUNT(*)
FROM packs
UNION ALL
SELECT
  'Pack Cards: ' || COUNT(*)
FROM pack_cards;
