-- Seed cards data
INSERT INTO public.cards (name, set_name, card_number, rarity, image_url, market_price, lowest_price, price_change_percent) VALUES
('Charizard ex', 'Obsidian Flames', '054/197', 'Double Rare', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png', 245.99, 229.99, 5.2),
('Pikachu VMAX', 'Vivid Voltage', '188/185', 'Secret Rare', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png', 189.99, 175.00, -2.1),
('Lugia VSTAR', 'Silver Tempest', '211/195', 'Secret Rare', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png', 156.75, 149.99, 8.9),
('Umbreon VMAX', 'Evolving Skies', '215/203', 'Secret Rare', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/197.png', 425.00, 399.99, 12.5),
('Mew VMAX', 'Fusion Strike', '269/264', 'Secret Rare', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png', 98.50, 89.99, 3.2),
('Rayquaza VMAX', 'Evolving Skies', '218/203', 'Secret Rare', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png', 312.00, 295.00, -3.5),
('Arceus VSTAR', 'Brilliant Stars', '184/172', 'Secret Rare', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/493.png', 67.99, 61.50, 7.8),
('Giratina VSTAR', 'Lost Origin', '211/196', 'Secret Rare', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/487.png', 145.00, 135.00, 10.2),
('Garchomp V', 'Astral Radiance', '117/189', 'Rare Holo V', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/445.png', 32.99, 29.99, -8.4),
('Mewtwo VSTAR', 'Pokemon GO', '086/078', 'Secret Rare', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png', 89.99, 64.99, 5.5);

-- Seed marketplace data for first card (Charizard ex)
INSERT INTO public.marketplaces (card_id, marketplace_name, price, shipping_cost, in_stock)
SELECT id, 'TCGPlayer', 229.99, 'Free', true FROM public.cards WHERE name = 'Charizard ex';

INSERT INTO public.marketplaces (card_id, marketplace_name, price, shipping_cost, in_stock)
SELECT id, 'eBay', 235.00, '$3.99', true FROM public.cards WHERE name = 'Charizard ex';

INSERT INTO public.marketplaces (card_id, marketplace_name, price, shipping_cost, in_stock)
SELECT id, 'CardMarket', 242.50, '$5.00', true FROM public.cards WHERE name = 'Charizard ex';

-- Seed marketplace data for Pikachu VMAX
INSERT INTO public.marketplaces (card_id, marketplace_name, price, shipping_cost, in_stock)
SELECT id, 'TCGPlayer', 175.00, '$2.99', true FROM public.cards WHERE name = 'Pikachu VMAX';

INSERT INTO public.marketplaces (card_id, marketplace_name, price, shipping_cost, in_stock)
SELECT id, 'Troll and Toad', 182.99, 'Free', true FROM public.cards WHERE name = 'Pikachu VMAX';

INSERT INTO public.marketplaces (card_id, marketplace_name, price, shipping_cost, in_stock)
SELECT id, 'eBay', 189.99, '$4.99', true FROM public.cards WHERE name = 'Pikachu VMAX';

-- Generate price history for the last 30 days for Charizard ex
INSERT INTO public.price_history (card_id, price, marketplace, recorded_at)
SELECT
  id,
  245.99 * (1 + (RANDOM() - 0.5) * 0.1),
  'TCGPlayer',
  NOW() - (n || ' days')::INTERVAL
FROM public.cards, generate_series(0, 29) as n
WHERE name = 'Charizard ex';
