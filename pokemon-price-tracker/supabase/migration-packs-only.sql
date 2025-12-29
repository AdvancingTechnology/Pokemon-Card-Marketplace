-- ============================================
-- SAFE MIGRATION: Packs System Only
-- Run this if you already have profiles, cards, etc.
-- ============================================

-- Create packs table (if not exists)
CREATE TABLE IF NOT EXISTS public.packs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT CHECK (tier IN ('legendary', 'diamond', 'emerald', 'ruby', 'gold', 'silver', 'misc', 'special')),
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  floor_value DECIMAL(10, 2),
  ceiling_value DECIMAL(10, 2),
  expected_value DECIMAL(10, 2),
  total_cards INTEGER DEFAULT 1,
  is_featured BOOLEAN DEFAULT false,
  is_hot BOOLEAN DEFAULT false,
  total_opened INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create pack_cards table (if not exists)
CREATE TABLE IF NOT EXISTS public.pack_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  odds_percentage DECIMAL(5, 3) NOT NULL,
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(pack_id, card_id)
);

-- Create pack_opens table (if not exists)
CREATE TABLE IF NOT EXISTS public.pack_opens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create orders table (if not exists)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'paid', 'completed', 'refunded')) DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS (safe to re-run)
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_opens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Packs are viewable by everyone" ON public.packs;
DROP POLICY IF EXISTS "Pack cards are viewable by everyone" ON public.pack_cards;
DROP POLICY IF EXISTS "Pack opens viewable by everyone (for activity)" ON public.pack_opens;
DROP POLICY IF EXISTS "Users can insert own pack opens" ON public.pack_opens;
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

-- Re-create policies
CREATE POLICY "Packs are viewable by everyone"
  ON public.packs FOR SELECT
  USING (true);

CREATE POLICY "Pack cards are viewable by everyone"
  ON public.pack_cards FOR SELECT
  USING (true);

CREATE POLICY "Pack opens viewable by everyone (for activity)"
  ON public.pack_opens FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own pack opens"
  ON public.pack_opens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes (if not exists)
DROP INDEX IF EXISTS idx_packs_tier;
DROP INDEX IF EXISTS idx_packs_featured;
DROP INDEX IF EXISTS idx_packs_hot;
DROP INDEX IF EXISTS idx_pack_cards_pack_id;
DROP INDEX IF EXISTS idx_pack_cards_card_id;
DROP INDEX IF EXISTS idx_pack_opens_user_id;
DROP INDEX IF EXISTS idx_pack_opens_pack_id;
DROP INDEX IF EXISTS idx_pack_opens_opened_at;
DROP INDEX IF EXISTS idx_orders_user_id;
DROP INDEX IF EXISTS idx_orders_status;

CREATE INDEX idx_packs_tier ON public.packs(tier);
CREATE INDEX idx_packs_featured ON public.packs(is_featured) WHERE is_featured = true;
CREATE INDEX idx_packs_hot ON public.packs(is_hot) WHERE is_hot = true;
CREATE INDEX idx_pack_cards_pack_id ON public.pack_cards(pack_id);
CREATE INDEX idx_pack_cards_card_id ON public.pack_cards(card_id);
CREATE INDEX idx_pack_opens_user_id ON public.pack_opens(user_id);
CREATE INDEX idx_pack_opens_pack_id ON public.pack_opens(pack_id);
CREATE INDEX idx_pack_opens_opened_at ON public.pack_opens(opened_at DESC);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);

-- Drop existing function/trigger if exists
DROP TRIGGER IF EXISTS on_pack_opened ON public.pack_opens;
DROP FUNCTION IF EXISTS increment_pack_opens();

-- Create function to increment pack opens
CREATE OR REPLACE FUNCTION increment_pack_opens()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.packs
  SET total_opened = total_opened + 1
  WHERE id = NEW.pack_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER on_pack_opened
  AFTER INSERT ON public.pack_opens
  FOR EACH ROW EXECUTE FUNCTION increment_pack_opens();

-- Drop existing triggers for updated_at if they exist
DROP TRIGGER IF EXISTS update_packs_updated_at ON public.packs;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;

-- Re-create updated_at triggers
CREATE TRIGGER update_packs_updated_at BEFORE UPDATE ON public.packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Packs tables created successfully! Now run packs-seed.sql to populate data.';
END $$;
