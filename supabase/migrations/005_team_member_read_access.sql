-- ─────────────────────────────────────────────────────────────────────────────
-- 005_team_member_read_access.sql
-- Grants active team members read access to all admin dashboard data.
-- They can SEE everything an admin sees; write access is controlled per table.
-- Run in Supabase Dashboard > SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. HELPER FUNCTION ───────────────────────────────────────────────────────
-- Returns true if the current user is a super admin OR an active team member.
-- Used in all policies below to avoid repeating the same subquery.
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
-- Drop the old admin-only policy and replace it with one that includes staff.
DROP POLICY IF EXISTS "admin_read_all_profiles" ON profiles;
CREATE POLICY "admin_read_all_profiles" ON profiles
  FOR SELECT USING (
    id = auth.uid()       -- users can always read their own profile
    OR is_admin_or_staff()
  );

-- ── 3. ADVISOR_VERIFICATION ──────────────────────────────────────────────────
ALTER TABLE advisor_verification ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_read_all_verifications" ON advisor_verification;
CREATE POLICY "staff_read_all_verifications" ON advisor_verification
  FOR SELECT USING (
    user_id = auth.uid()
    OR advisor_id = auth.uid()
    OR is_admin_or_staff()
  );

-- ── 4. SESSIONS ──────────────────────────────────────────────────────────────
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_read_all_sessions" ON sessions;
CREATE POLICY "staff_read_all_sessions" ON sessions
  FOR SELECT USING (
    client_id = auth.uid()
    OR advisor_id = auth.uid()
    OR is_admin_or_staff()
  );

-- ── 5. PAYMENTS ──────────────────────────────────────────────────────────────
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_read_all_payments" ON payments;
CREATE POLICY "staff_read_all_payments" ON payments
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_admin_or_staff()
  );

-- ── 6. PAYOUTS ───────────────────────────────────────────────────────────────
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_read_all_payouts" ON payouts;
CREATE POLICY "staff_read_all_payouts" ON payouts
  FOR SELECT USING (
    user_id = auth.uid()
    OR is_admin_or_staff()
  );

-- ── 7. ADVISORS ──────────────────────────────────────────────────────────────
-- Advisors table is usually public-read; make sure staff can also read all.
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_advisors" ON advisors;
DROP POLICY IF EXISTS "staff_read_all_advisors" ON advisors;
CREATE POLICY "public_read_advisors" ON advisors
  FOR SELECT USING (TRUE);  -- advisor cards are public; staff reads everything anyway

-- ── 8. PLATFORM_SETTINGS ─────────────────────────────────────────────────────
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "staff_read_settings" ON platform_settings;
CREATE POLICY "staff_read_settings" ON platform_settings
  FOR SELECT USING (is_admin_or_staff());

DROP POLICY IF EXISTS "admin_write_settings" ON platform_settings;
CREATE POLICY "admin_write_settings" ON platform_settings
  FOR ALL USING (is_admin_user());

-- ── 9. NOTIFICATIONS ─────────────────────────────────────────────────────────
-- Notifications are user-specific; no change needed for staff.
-- Staff sends notifications via the admin action handlers already.

-- ─────────────────────────────────────────────────────────────────────────────
-- DONE
-- After running this, any active team member (supervisor, operador, etc.)
-- will be able to see all dashboard data via the Supabase anon client.
-- Write permissions remain controlled by separate policies.
-- ─────────────────────────────────────────────────────────────────────────────
