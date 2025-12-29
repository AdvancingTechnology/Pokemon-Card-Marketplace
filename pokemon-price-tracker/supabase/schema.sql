-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  set_name TEXT NOT NULL,
  card_number TEXT,
  rarity TEXT,
  image_url TEXT,
  market_price DECIMAL(10, 2),
  lowest_price DECIMAL(10, 2),
  price_change_percent DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create watchlist table
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, card_id)
);

-- Create portfolio table
CREATE TABLE IF NOT EXISTS public.portfolio (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  purchase_price DECIMAL(10, 2) NOT NULL,
  purchase_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create price_alerts table
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below')),
  target_price DECIMAL(10, 2) NOT NULL,
  email TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create price_history table
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  marketplace TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create marketplaces table
CREATE TABLE IF NOT EXISTS public.marketplaces (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  card_id UUID REFERENCES public.cards(id) ON DELETE CASCADE NOT NULL,
  marketplace_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  shipping_cost TEXT,
  url TEXT,
  in_stock BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplaces ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Cards policies (public read, admin write)
CREATE POLICY "Cards are viewable by everyone"
  ON public.cards FOR SELECT
  USING (true);

-- Watchlist policies
CREATE POLICY "Users can view own watchlist"
  ON public.watchlist FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own watchlist"
  ON public.watchlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watchlist"
  ON public.watchlist FOR DELETE
  USING (auth.uid() = user_id);

-- Portfolio policies
CREATE POLICY "Users can view own portfolio"
  ON public.portfolio FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own portfolio"
  ON public.portfolio FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio"
  ON public.portfolio FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own portfolio"
  ON public.portfolio FOR DELETE
  USING (auth.uid() = user_id);

-- Price alerts policies
CREATE POLICY "Users can view own price alerts"
  ON public.price_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own price alerts"
  ON public.price_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own price alerts"
  ON public.price_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own price alerts"
  ON public.price_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Price history policies (public read)
CREATE POLICY "Price history is viewable by everyone"
  ON public.price_history FOR SELECT
  USING (true);

-- Marketplaces policies (public read)
CREATE POLICY "Marketplaces are viewable by everyone"
  ON public.marketplaces FOR SELECT
  USING (true);

-- Create indexes for performance
CREATE INDEX idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX idx_watchlist_card_id ON public.watchlist(card_id);
CREATE INDEX idx_portfolio_user_id ON public.portfolio(user_id);
CREATE INDEX idx_portfolio_card_id ON public.portfolio(card_id);
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_card_id ON public.price_alerts(card_id);
CREATE INDEX idx_price_history_card_id ON public.price_history(card_id);
CREATE INDEX idx_price_history_recorded_at ON public.price_history(recorded_at);
CREATE INDEX idx_marketplaces_card_id ON public.marketplaces(card_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cards_updated_at BEFORE UPDATE ON public.cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON public.portfolio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON public.price_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
