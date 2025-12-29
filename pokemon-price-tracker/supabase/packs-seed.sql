-- Seed Slab Safari Packs

-- Insert Bronze Tier Pack
INSERT INTO public.packs (name, description, tier, price, floor_value, ceiling_value, expected_value, total_cards, is_featured, image_url) VALUES
('Bronze Safari', 'Start your hunt with graded commons and uncommons. Perfect for beginners looking to build their collection.', 'misc', 25.00, 5.00, 150.00, 22.00, 1, false, '/packs/bronze-safari.png'),

-- Insert Gold Tier Pack
('Gold Safari', 'Mid-tier chase cards with excellent odds of hitting modern staples and vintage holos.', 'gold', 100.00, 20.00, 500.00, 85.00, 1, true, '/packs/gold-safari.png'),

-- Insert Legendary Tier Pack
('Legendary Safari', 'Hunt for PSA 10 Gem Mints and BGS Black Labels. Only the rarest pulls make it here.', 'legendary', 500.00, 100.00, 5000.00, 425.00, 1, true, '/packs/legendary-safari.png'),

-- More pack variations
('Vintage Bronze', 'Classic WOTC era cards in graded condition. Guaranteed PSA 6 or better.', 'misc', 25.00, 8.00, 120.00, 21.00, 1, false, '/packs/vintage-bronze.png'),

('Modern Gold', 'Modern era chase cards from Sword & Shield through Scarlet & Violet. PSA 9+ guaranteed.', 'gold', 100.00, 25.00, 450.00, 90.00, 1, false, '/packs/modern-gold.png'),

('Graded Gem Hunt', 'Premium pack focused on PSA 10 candidates. Every card is a potential gem mint.', 'legendary', 500.00, 150.00, 4500.00, 450.00, 1, false, '/packs/gem-hunt.png');

-- Get card IDs for pack_cards relationship
DO $$
DECLARE
  charizard_id UUID;
  pikachu_id UUID;
  lugia_id UUID;
  umbreon_id UUID;
  mew_id UUID;
  rayquaza_id UUID;
  arceus_id UUID;
  giratina_id UUID;
  garchomp_id UUID;
  mewtwo_id UUID;
  bronze_pack_id UUID;
  gold_pack_id UUID;
  legendary_pack_id UUID;
BEGIN
  -- Get card IDs
  SELECT id INTO charizard_id FROM public.cards WHERE name = 'Charizard ex' LIMIT 1;
  SELECT id INTO pikachu_id FROM public.cards WHERE name = 'Pikachu VMAX' LIMIT 1;
  SELECT id INTO lugia_id FROM public.cards WHERE name = 'Lugia VSTAR' LIMIT 1;
  SELECT id INTO umbreon_id FROM public.cards WHERE name = 'Umbreon VMAX' LIMIT 1;
  SELECT id INTO mew_id FROM public.cards WHERE name = 'Mew VMAX' LIMIT 1;
  SELECT id INTO rayquaza_id FROM public.cards WHERE name = 'Rayquaza VMAX' LIMIT 1;
  SELECT id INTO arceus_id FROM public.cards WHERE name = 'Arceus VSTAR' LIMIT 1;
  SELECT id INTO giratina_id FROM public.cards WHERE name = 'Giratina VSTAR' LIMIT 1;
  SELECT id INTO garchomp_id FROM public.cards WHERE name = 'Garchomp V' LIMIT 1;
  SELECT id INTO mewtwo_id FROM public.cards WHERE name = 'Mewtwo VSTAR' LIMIT 1;

  -- Get pack IDs
  SELECT id INTO bronze_pack_id FROM public.packs WHERE name = 'Bronze Safari' LIMIT 1;
  SELECT id INTO gold_pack_id FROM public.packs WHERE name = 'Gold Safari' LIMIT 1;
  SELECT id INTO legendary_pack_id FROM public.packs WHERE name = 'Legendary Safari' LIMIT 1;

  -- Bronze Safari Pack Cards (easier pulls)
  INSERT INTO public.pack_cards (pack_id, card_id, odds_percentage, weight) VALUES
  (bronze_pack_id, garchomp_id, 15.000, 150),
  (bronze_pack_id, arceus_id, 12.000, 120),
  (bronze_pack_id, mew_id, 10.000, 100),
  (bronze_pack_id, giratina_id, 8.000, 80),
  (bronze_pack_id, lugia_id, 6.000, 60),
  (bronze_pack_id, pikachu_id, 3.000, 30),
  (bronze_pack_id, rayquaza_id, 2.000, 20),
  (bronze_pack_id, umbreon_id, 1.000, 10),
  (bronze_pack_id, charizard_id, 0.500, 5);

  -- Gold Safari Pack Cards (mid-tier)
  INSERT INTO public.pack_cards (pack_id, card_id, odds_percentage, weight) VALUES
  (gold_pack_id, mew_id, 18.000, 180),
  (gold_pack_id, arceus_id, 15.000, 150),
  (gold_pack_id, giratina_id, 12.000, 120),
  (gold_pack_id, lugia_id, 10.000, 100),
  (gold_pack_id, pikachu_id, 8.000, 80),
  (gold_pack_id, rayquaza_id, 5.000, 50),
  (gold_pack_id, umbreon_id, 3.000, 30),
  (gold_pack_id, charizard_id, 1.500, 15);

  -- Legendary Safari Pack Cards (best odds)
  INSERT INTO public.pack_cards (pack_id, card_id, odds_percentage, weight) VALUES
  (legendary_pack_id, giratina_id, 20.000, 200),
  (legendary_pack_id, lugia_id, 15.000, 150),
  (legendary_pack_id, pikachu_id, 12.000, 120),
  (legendary_pack_id, rayquaza_id, 10.000, 100),
  (legendary_pack_id, umbreon_id, 8.000, 80),
  (legendary_pack_id, charizard_id, 5.000, 50),
  (legendary_pack_id, mewtwo_id, 3.000, 30);

END $$;
