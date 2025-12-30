-- =============================================================================
-- SLAB SAFARI GEMS SYSTEM - Core Database Schema
-- Migration: 001_gems_system.sql
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABLE: gem_balances
-- =============================================================================

CREATE TABLE IF NOT EXISTS gem_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    available_balance BIGINT NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
    pending_balance BIGINT NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
    promotional_balance BIGINT NOT NULL DEFAULT 0 CHECK (promotional_balance >= 0),
    lifetime_purchased BIGINT NOT NULL DEFAULT 0,
    lifetime_spent BIGINT NOT NULL DEFAULT 0,
    lifetime_bonus_received BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_user_balance UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_gem_balances_user_id ON gem_balances(user_id);

-- =============================================================================
-- TABLE: gem_transactions
-- =============================================================================

CREATE TABLE IF NOT EXISTS gem_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    idempotency_key VARCHAR(255) UNIQUE,
    transaction_type VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(255),
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_reversed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_gem_transactions_user_id ON gem_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gem_transactions_user_created ON gem_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gem_transactions_idempotency ON gem_transactions(idempotency_key) WHERE idempotency_key IS NOT NULL;

-- =============================================================================
-- TABLE: gem_packages
-- =============================================================================

CREATE TABLE IF NOT EXISTS gem_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    price_cents INTEGER NOT NULL CHECK (price_cents > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    base_gems INTEGER NOT NULL CHECK (base_gems > 0),
    bonus_gems INTEGER NOT NULL DEFAULT 0 CHECK (bonus_gems >= 0),
    badge_text VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    stripe_price_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gem_packages_status ON gem_packages(status) WHERE status = 'active';

-- =============================================================================
-- TABLE: provably_fair_seeds
-- =============================================================================

CREATE TABLE IF NOT EXISTS provably_fair_seeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    server_seed TEXT NOT NULL,
    server_seed_hash TEXT NOT NULL,
    client_seed TEXT NOT NULL DEFAULT 'default',
    nonce BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_revealed BOOLEAN NOT NULL DEFAULT FALSE,
    revealed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_provably_fair_active_seed ON provably_fair_seeds(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_provably_fair_user_id ON provably_fair_seeds(user_id);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gem_balances_updated_at ON gem_balances;
CREATE TRIGGER trigger_gem_balances_updated_at
    BEFORE UPDATE ON gem_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_gem_packages_updated_at ON gem_packages;
CREATE TRIGGER trigger_gem_packages_updated_at
    BEFORE UPDATE ON gem_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_provably_fair_seeds_updated_at ON provably_fair_seeds;
CREATE TRIGGER trigger_provably_fair_seeds_updated_at
    BEFORE UPDATE ON provably_fair_seeds
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE gem_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE gem_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gem_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE provably_fair_seeds ENABLE ROW LEVEL SECURITY;

-- gem_balances policies
CREATE POLICY gem_balances_select_own ON gem_balances
    FOR SELECT USING (auth.uid() = user_id);

-- gem_transactions policies
CREATE POLICY gem_transactions_select_own ON gem_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- gem_packages policies (anyone can view active packages)
CREATE POLICY gem_packages_select_active ON gem_packages
    FOR SELECT USING (status = 'active');

-- provably_fair_seeds policies
CREATE POLICY provably_fair_seeds_select_own ON provably_fair_seeds
    FOR SELECT USING (auth.uid() = user_id);

-- =============================================================================
-- SEED DATA: Default Gem Packages
-- =============================================================================

INSERT INTO gem_packages (name, description, display_order, price_cents, base_gems, bonus_gems, badge_text, status)
VALUES
    ('Starter Pack', 'Perfect for trying out Slab Safari', 1, 500, 500, 0, NULL, 'active'),
    ('Explorer Pack', 'Great value for regular pack openers', 2, 1000, 1000, 100, NULL, 'active'),
    ('Trainer Pack', 'For serious collectors. 20% bonus!', 3, 2500, 2500, 500, 'POPULAR', 'active'),
    ('Champion Pack', 'Premium bundle with 30% bonus', 4, 5000, 5000, 1500, 'BEST VALUE', 'active'),
    ('Master Pack', 'Ultimate bundle with 40% bonus!', 5, 10000, 10000, 4000, 'MASTER', 'active')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- Helper Functions
-- =============================================================================

CREATE OR REPLACE FUNCTION generate_server_seed_hash(seed TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(seed, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;
