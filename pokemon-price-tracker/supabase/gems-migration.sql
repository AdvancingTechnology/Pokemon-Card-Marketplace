-- ============================================
-- GEMS SYSTEM MIGRATION
-- Adds digital currency for Pokemon Mystery Pack marketplace
-- ============================================

-- Add gem_balance to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS gem_balance DECIMAL(10, 2) DEFAULT 0 NOT NULL;

-- Create gem_transactions table
CREATE TABLE IF NOT EXISTS public.gem_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type TEXT CHECK (type IN ('earned_resell', 'spent_pack', 'purchased', 'refund')) NOT NULL,
  card_id UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  pack_id UUID REFERENCES public.packs(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add redemption_status to pack_opens
ALTER TABLE public.pack_opens
ADD COLUMN IF NOT EXISTS redemption_status TEXT CHECK (redemption_status IN ('in_inventory', 'pending_redemption', 'shipped', 'resold')) DEFAULT 'in_inventory';

-- Add resell_gems_earned to pack_opens
ALTER TABLE public.pack_opens
ADD COLUMN IF NOT EXISTS resell_gems_earned DECIMAL(10, 2);

-- Enable RLS on gem_transactions
ALTER TABLE public.gem_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for gem_transactions
DROP POLICY IF EXISTS "Users can view own gem transactions" ON public.gem_transactions;
CREATE POLICY "Users can view own gem transactions"
  ON public.gem_transactions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own gem transactions" ON public.gem_transactions;
CREATE POLICY "Users can insert own gem transactions"
  ON public.gem_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_gem_transactions_user_id ON public.gem_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gem_transactions_type ON public.gem_transactions(type);
CREATE INDEX IF NOT EXISTS idx_gem_transactions_created_at ON public.gem_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pack_opens_redemption_status ON public.pack_opens(redemption_status);

-- Function to update user gem balance
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

-- Trigger to auto-update gem balance on transaction
DROP TRIGGER IF EXISTS on_gem_transaction ON public.gem_transactions;
CREATE TRIGGER on_gem_transaction
  AFTER INSERT ON public.gem_transactions
  FOR EACH ROW EXECUTE FUNCTION update_gem_balance();

-- Success message
DO $$
BEGIN
  RAISE NOTICE '💎 Gems system migration complete! Users can now earn and spend Gems.';
END $$;
