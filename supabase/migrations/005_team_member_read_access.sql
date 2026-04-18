-- ─────────────────────────────────────────────────────────────────────────────
-- 005_team_member_read_access.sql  (rewritten — safe version)
-- Grants active team members READ access to all admin dashboard data.
-- Does NOT touch existing user-specific or admin-write policies from 001/002.
-- Run in Supabase Dashboard > SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. HELPER FUNCTION ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION is_admin_or_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE((SELECT is_admin FROM profiles WHERE id = auth.uid() LIMIT 1), FALSE)
    OR
    EXISTS (SELECT 1 FROM team_members WHERE user_id = auth.uid() AND is_active = TRUE);
$$;

-- ── 2. PROFILES ──────────────────────────────────────────────────────────────
-- The old policy only allowed own profile OR is_admin. Recreate to include staff.
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
CREATE POLICY "admin_read_all_profiles" ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR is_admin_or_staff()
  );

-- ── 3. ADVISOR_VERIFICATION ──────────────────────────────────────────────────
-- Existing: "advisor_own_verification" (own) + "admin_all_verifications" (admin write)
-- New: staff can SELECT all
DROP POLICY IF EXISTS "staff_read_verifications" ON advisor_verification;
CREATE POLICY "staff_read_verifications" ON advisor_verification
  FOR SELECT USING (is_admin_or_staff());

-- ── 4. SESSIONS ──────────────────────────────────────────────────────────────
-- No column assumptions — just staff SELECT bypass
DROP POLICY IF EXISTS "staff_read_sessions" ON sessions;
CREATE POLICY "staff_read_sessions" ON sessions
  FOR SELECT USING (is_admin_or_staff());

-- ── 5. PAYMENTS ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "staff_read_payments" ON payments;
CREATE POLICY "staff_read_payments" ON payments
  FOR SELECT USING (is_admin_or_staff());

-- ── 6. PAYOUTS ───────────────────────────────────────────────────────────────
-- Existing: "advisor_view_own_payouts" + "admin_manage_payouts"
-- New: all staff can SELECT
DROP POLICY IF EXISTS "staff_read_payouts" ON payouts;
CREATE POLICY "staff_read_payouts" ON payouts
  FOR SELECT USING (is_admin_or_staff());

-- ── 7. PLATFORM_SETTINGS ─────────────────────────────────────────────────────
-- Existing: "admin_settings" FOR ALL (admin write stays)
-- New: staff can read; safe to have both policies — most permissive SELECT wins
DROP POLICY IF EXISTS "staff_read_settings" ON platform_settings;
CREATE POLICY "staff_read_settings" ON platform_settings
  FOR SELECT USING (is_admin_or_staff());

-- ── 8. ADVISORS ──────────────────────────────────────────────────────────────
-- Advisors are typically public-readable; this ensures staff can always read
DROP POLICY IF EXISTS "staff_read_advisors" ON advisors;
CREATE POLICY "staff_read_advisors" ON advisors
  FOR SELECT USING (TRUE);

-- ─────────────────────────────────────────────────────────────────────────────
-- DONE. Verify with:
--   SELECT policyname, tablename FROM pg_policies
--   WHERE policyname LIKE 'staff_%' OR policyname = 'admin_read_all_profiles';
-- ─────────────────────────────────────────────────────────────────────────────
