-- ============================================================
-- AXIOMA VENTURES INTELLIGENCE — Platform Expansion Migration
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================



-- ─────────────────────────────────────────────────────────────
-- 1. EXTEND profiles TABLE
-- ─────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS date_of_birth     DATE,
  ADD COLUMN IF NOT EXISTS city              TEXT,
  ADD COLUMN IF NOT EXISTS address           TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url      TEXT,
  ADD COLUMN IF NOT EXISTS bio               TEXT,
  ADD COLUMN IF NOT EXISTS timezone          TEXT DEFAULT 'America/Caracas',
  ADD COLUMN IF NOT EXISTS language_pref     TEXT DEFAULT 'es',
  ADD COLUMN IF NOT EXISTS is_admin          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS occupation        TEXT,
  ADD COLUMN IF NOT EXISTS company           TEXT,
  ADD COLUMN IF NOT EXISTS website_url       TEXT;

-- ─────────────────────────────────────────────────────────────
-- 2. EXTEND advisors TABLE
-- ─────────────────────────────────────────────────────────────
ALTER TABLE advisors
  ADD COLUMN IF NOT EXISTS education_level       TEXT,         -- bachelor/master/phd/other
  ADD COLUMN IF NOT EXISTS university            TEXT,
  ADD COLUMN IF NOT EXISTS graduation_year       INT,
  ADD COLUMN IF NOT EXISTS certifications        JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS specializations       TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hourly_rate           NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_sessions        INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_earnings        NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS license_number        TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url         TEXT,
  ADD COLUMN IF NOT EXISTS availability_schedule JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS verification_status   TEXT DEFAULT 'none',  -- none/pending/approved/rejected
  ADD COLUMN IF NOT EXISTS verification_submitted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason      TEXT,
  ADD COLUMN IF NOT EXISTS commission_rate       NUMERIC(5,2) DEFAULT 20.00,
  ADD COLUMN IF NOT EXISTS payout_configured     BOOLEAN DEFAULT FALSE;

-- ─────────────────────────────────────────────────────────────
-- 3. CREATE advisor_verification TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS advisor_verification (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id          UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Identity
  full_legal_name     TEXT NOT NULL,
  id_document_type    TEXT NOT NULL,   -- cedula/passport/driver_license
  id_document_url     TEXT,            -- Supabase storage URL
  selfie_url          TEXT,            -- selfie with document

  -- Professional
  professional_title  TEXT NOT NULL,
  education_level     TEXT NOT NULL,
  university          TEXT,
  graduation_year     INT,
  degree_url          TEXT,            -- diploma scan
  license_number      TEXT,
  license_url         TEXT,            -- license scan
  certificate_urls    JSONB DEFAULT '[]'::jsonb,  -- [{name, url, issuer, year}]
  linkedin_url        TEXT,
  portfolio_url       TEXT,

  -- Additional info
  notes               TEXT,            -- advisor's own notes/justification

  -- Status
  status              TEXT DEFAULT 'pending', -- pending/approved/rejected/more_info
  submitted_at        TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at         TIMESTAMPTZ,
  reviewed_by         UUID REFERENCES profiles(id),
  rejection_reason    TEXT,
  admin_notes         TEXT,

  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 4. CREATE advisor_payout_info TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS advisor_payout_info (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id            UUID NOT NULL UNIQUE REFERENCES advisors(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  payout_method         TEXT NOT NULL DEFAULT 'bank_transfer', -- bank_transfer/paypal/stripe_connect/zelle

  -- Bank transfer
  bank_name             TEXT,
  bank_account_holder   TEXT,
  bank_routing_number   TEXT,
  bank_account_number   TEXT,          -- encrypted at app level before storing
  bank_account_last4    TEXT,
  bank_account_type     TEXT,          -- checking/savings
  bank_country          TEXT,
  bank_currency         TEXT DEFAULT 'USD',

  -- PayPal
  paypal_email          TEXT,

  -- Zelle
  zelle_email           TEXT,
  zelle_phone           TEXT,

  -- Stripe Connect
  stripe_account_id     TEXT,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,

  -- Meta
  verified              BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 5. CREATE payouts TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id        UUID NOT NULL REFERENCES advisors(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  gross_amount      NUMERIC(10,2) NOT NULL,   -- total earned in period
  commission_amount NUMERIC(10,2) NOT NULL,   -- platform 20%
  net_amount        NUMERIC(10,2) NOT NULL,   -- advisor receives 80%

  status            TEXT DEFAULT 'pending',   -- pending/processing/completed/failed/on_hold
  period_start      DATE NOT NULL,
  period_end        DATE NOT NULL,

  payment_method    TEXT,
  transaction_id    TEXT,
  processed_at      TIMESTAMPTZ,
  notes             TEXT,

  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 6. CREATE platform_settings TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS platform_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key           TEXT UNIQUE NOT NULL,
  value         TEXT NOT NULL,
  description   TEXT,
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_by    UUID REFERENCES profiles(id)
);

-- Default settings
INSERT INTO platform_settings (key, value, description) VALUES
  ('commission_rate',        '20',    'Porcentaje de comisión de la plataforma (%)'),
  ('min_payout_threshold',   '50',    'Monto mínimo para procesar payout (USD)'),
  ('payout_schedule',        'monthly', 'Frecuencia de pagos a asesores'),
  ('payout_day',             '5',     'Día del mes para procesar pagos'),
  ('sesion_inicial_price',   '19',    'Precio del plan Sesión Inicial (USD)'),
  ('plan_completo_price',    '149',   'Precio del plan Plan Completo (USD)'),
  ('sesion_inicial_sessions','1',     'Número de sesiones incluidas en Sesión Inicial'),
  ('plan_completo_sessions', '4',     'Número de sesiones incluidas en Plan Completo'),
  ('platform_name',          'Axioma Ventures Intelligence', 'Nombre de la plataforma'),
  ('support_email',          'soporte@axioma.com', 'Email de soporte')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 7. CREATE admin_activity_log TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID NOT NULL REFERENCES profiles(id),
  action      TEXT NOT NULL,
  target_type TEXT,       -- verification/user/payout/settings
  target_id   TEXT,
  details     JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 8. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────

-- advisor_verification: advisors can insert/view their own; admins can view all
ALTER TABLE advisor_verification ENABLE ROW LEVEL SECURITY;
CREATE POLICY "advisor_own_verification" ON advisor_verification
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "admin_all_verifications" ON advisor_verification
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- advisor_payout_info: advisors can manage their own; admins can view all
ALTER TABLE advisor_payout_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "advisor_own_payout" ON advisor_payout_info
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "admin_all_payouts" ON advisor_payout_info
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- payouts: advisors view their own; admins full access
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "advisor_view_own_payouts" ON payouts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_manage_payouts" ON payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- platform_settings: admins only
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_settings" ON platform_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- admin_activity_log: admins only
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_activity" ON admin_activity_log
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- ─────────────────────────────────────────────────────────────
-- 9. SUPABASE STORAGE BUCKETS (run separately if needed)
-- ─────────────────────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('verification-docs', 'verification-docs', false),
--   ('certifications',    'certifications',    false)
-- ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 10. HELPER FUNCTION: calculate advisor payout for a period
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_advisor_pending_payout(
  p_advisor_id UUID,
  p_period_start DATE DEFAULT date_trunc('month', NOW())::DATE,
  p_period_end   DATE DEFAULT (date_trunc('month', NOW()) + interval '1 month - 1 day')::DATE
)
RETURNS TABLE (
  gross_amount      NUMERIC,
  commission_amount NUMERIC,
  net_amount        NUMERIC,
  session_count     BIGINT
) LANGUAGE SQL AS $$
  SELECT
    COALESCE(SUM(p.amount), 0)                     AS gross_amount,
    COALESCE(SUM(p.amount * a.commission_rate/100), 0) AS commission_amount,
    COALESCE(SUM(p.amount * (1 - a.commission_rate/100)), 0) AS net_amount,
    COUNT(p.id)                                    AS session_count
  FROM payments p
  JOIN advisors a ON a.id = p.advisor_id
  WHERE p.advisor_id = p_advisor_id
    AND p.status = 'completado'
    AND p.created_at::DATE BETWEEN p_period_start AND p_period_end;
$$;

-- ─────────────────────────────────────────────────────────────
-- DONE — Run SELECT * FROM platform_settings to verify
-- ─────────────────────────────────────────────────────────────
