-- Packs & Mystery Boxes Schema

-- Create packs table
CREATE TABLE IF NOT EXISTS public.packs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT CHECK (tier IN ('legendary', 'diamond', 'emerald', 'ruby', 'gold', 'silver', 'misc', 'special')),
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  floor_value DECIMAL(10, 2), -- Minimum card value in pack
  ceiling_value DECIMAL(10, 2), -- Maximum card value in pack
  expected_value DECIMAL(10, 2), -- Average/Expected value
  total_cards INTEGER DEFAULT 1, -- How many cards per pack
  is_featured BOOLEAN DEFAULT false,
  is_hot BOOLEAN DEFAULT false, -- For hot/limited packs
  total_opened INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create pack_cards table (many-to-many relationship with odds)
CREATE TABLE IF NOT EXISTS public.pack_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  odds_percentage DECIMAL(5, 3) NOT NULL, -- e.g., 0.096 for 0.096%
  weight INTEGER DEFAULT 1, -- For weighted random selection
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(pack_id, card_id)
);

-- Create pack_opens table (track when users open packs)
CREATE TABLE IF NOT EXISTS public.pack_opens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pack_id UUID REFERENCES public.packs(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create orders table (for pack purchases)
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

-- Enable Row Level Security
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pack_opens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Packs policies (public read)
CREATE POLICY "Packs are viewable by everyone"
  ON public.packs FOR SELECT
  USING (true);

-- Pack cards policies (public read)
CREATE POLICY "Pack cards are viewable by everyone"
  ON public.pack_cards FOR SELECT
  USING (true);

-- Pack opens policies (public read for activity feed, own data for user)
CREATE POLICY "Pack opens viewable by everyone (for activity)"
  ON public.pack_opens FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own pack opens"
  ON public.pack_opens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
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

-- Function to increment pack open count
CREATE OR REPLACE FUNCTION increment_pack_opens()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.packs
  SET total_opened = total_opened + 1
  WHERE id = NEW.pack_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment pack opens
CREATE TRIGGER on_pack_opened
  AFTER INSERT ON public.pack_opens
  FOR EACH ROW EXECUTE FUNCTION increment_pack_opens();

-- Add updated_at triggers
CREATE TRIGGER update_packs_updated_at BEFORE UPDATE ON public.packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
