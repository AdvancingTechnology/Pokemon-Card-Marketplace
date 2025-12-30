-- =============================================================================
-- SLAB SAFARI - Pack Gem Support Migration
-- Migration: 002_pack_gem_support.sql
-- =============================================================================

-- Add gem_cost column to packs table
ALTER TABLE packs ADD COLUMN IF NOT EXISTS gem_cost INTEGER;

-- Add provably fair fields to pack_opens
ALTER TABLE pack_opens ADD COLUMN IF NOT EXISTS server_seed_hash TEXT;
ALTER TABLE pack_opens ADD COLUMN IF NOT EXISTS client_seed TEXT;
ALTER TABLE pack_opens ADD COLUMN IF NOT EXISTS nonce BIGINT;

-- Create index for provably fair verification
CREATE INDEX IF NOT EXISTS idx_pack_opens_provably_fair
  ON pack_opens(server_seed_hash)
  WHERE server_seed_hash IS NOT NULL;

-- Function to increment pack opens count
CREATE OR REPLACE FUNCTION increment_pack_opens(p_pack_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE packs
    SET total_opened = COALESCE(total_opened, 0) + 1
    WHERE id = p_pack_id;
END;
$$ LANGUAGE plpgsql;

-- Update packs with gem costs based on tier (if not already set)
UPDATE packs SET gem_cost = 2500 WHERE tier = 'bronze' AND gem_cost IS NULL;
UPDATE packs SET gem_cost = 10000 WHERE tier = 'gold' AND gem_cost IS NULL;
UPDATE packs SET gem_cost = 50000 WHERE tier = 'legendary' AND gem_cost IS NULL;
