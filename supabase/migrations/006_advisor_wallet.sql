-- ─────────────────────────────────────────────────────────────────────────────
-- 006_advisor_wallet.sql
-- Wallet system for advisor earnings + payment cycles
-- Run in Supabase Dashboard > SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. ADVISOR_WALLET TABLE ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS advisor_wallet (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id      UUID NOT NULL UNIQUE REFERENCES advisors(id) ON DELETE CASCADE,
  total_earned    NUMERIC(12,2) NOT NULL DEFAULT 0,  -- lifetime earnings (85%)
  total_paid      NUMERIC(12,2) NOT NULL DEFAULT 0,  -- lifetime paid out
  balance_pending NUMERIC(12,2) NOT NULL DEFAULT 0,  -- awaiting payment
  payment_method  TEXT,                               -- bank_transfer/zelle/paypal
  payment_details JSONB DEFAULT '{}'::jsonb,          -- method-specific info
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. ADVISOR_PAYMENTS TABLE ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS advisor_payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id        UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
  amount            NUMERIC(12,2) NOT NULL,
  sessions_included JSONB DEFAULT '[]'::jsonb,   -- [{session_id, price, earnings}]
  payment_method    TEXT,
  reference         TEXT,
  status            TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (status IN ('pendiente', 'procesado', 'fallido')),
  cycle_start       DATE,
  cycle_end         DATE,
  processed_at      TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. TRIGGER: accumulate earnings when session completes ───────────────────
CREATE OR REPLACE FUNCTION fn_update_wallet_on_session_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_earnings NUMERIC;
BEGIN
  -- Only when status transitions INTO 'completada'
  IF NEW.status = 'completada' AND (OLD.status IS DISTINCT FROM 'completada') THEN
    v_earnings := COALESCE(NEW.price, 0) * 0.85;

    IF v_earnings > 0 AND NEW.advisor_id IS NOT NULL THEN
      INSERT INTO advisor_wallet (advisor_id, total_earned, balance_pending)
      VALUES (NEW.advisor_id, v_earnings, v_earnings)
      ON CONFLICT (advisor_id) DO UPDATE
        SET total_earned    = advisor_wallet.total_earned + v_earnings,
            balance_pending = advisor_wallet.balance_pending + v_earnings,
            updated_at      = NOW();
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wallet_on_session_complete ON sessions;
CREATE TRIGGER trg_wallet_on_session_complete
  AFTER INSERT OR UPDATE OF status ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION fn_update_wallet_on_session_complete();

-- ── 4. RLS ───────────────────────────────────────────────────────────────────
ALTER TABLE advisor_wallet ENABLE ROW LEVEL SECURITY;

-- Advisors read their own wallet
DROP POLICY IF EXISTS "advisor_own_wallet" ON advisor_wallet;
CREATE POLICY "advisor_own_wallet" ON advisor_wallet
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM advisors WHERE id = advisor_wallet.advisor_id AND user_id = auth.uid())
  );

-- Admin/staff can read all wallets
DROP POLICY IF EXISTS "staff_read_wallets" ON advisor_wallet;
CREATE POLICY "staff_read_wallets" ON advisor_wallet
  FOR SELECT USING (is_admin_or_staff());

-- Only admins can update wallets (mark paid)
DROP POLICY IF EXISTS "admin_manage_wallets" ON advisor_wallet;
CREATE POLICY "admin_manage_wallets" ON advisor_wallet
  FOR ALL USING (is_admin_or_staff());

ALTER TABLE advisor_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "advisor_own_payments" ON advisor_payments;
CREATE POLICY "advisor_own_payments" ON advisor_payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM advisors WHERE id = advisor_payments.advisor_id AND user_id = auth.uid())
  );

DROP POLICY IF EXISTS "staff_manage_payments" ON advisor_payments;
CREATE POLICY "staff_manage_payments" ON advisor_payments
  FOR ALL USING (is_admin_or_staff());

-- ── 5. BACKFILL: build wallets from existing completed sessions ───────────────
INSERT INTO advisor_wallet (advisor_id, total_earned, balance_pending)
SELECT
  advisor_id,
  SUM(COALESCE(price, 0) * 0.85),
  SUM(COALESCE(price, 0) * 0.85)
FROM sessions
WHERE status = 'completada'
  AND advisor_id IS NOT NULL
GROUP BY advisor_id
ON CONFLICT (advisor_id) DO UPDATE
  SET total_earned    = EXCLUDED.total_earned,
      balance_pending = EXCLUDED.balance_pending,
      updated_at      = NOW();

-- ── 6. INDEX for fast pending balance queries ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_advisor_wallet_pending ON advisor_wallet (balance_pending) WHERE balance_pending > 0;
CREATE INDEX IF NOT EXISTS idx_advisor_payments_advisor ON advisor_payments (advisor_id, created_at DESC);
