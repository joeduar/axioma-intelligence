-- ─────────────────────────────────────────────────────────────────────────────
-- 004_staff_flag.sql
-- Adds is_staff column to profiles so team member accounts are cleanly
-- separated from regular client/advisor accounts.
-- Run in Supabase Dashboard > SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add is_staff column (safe to re-run)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_staff BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Mark any existing team member profiles as staff
UPDATE profiles p
SET is_staff = TRUE
WHERE EXISTS (
  SELECT 1 FROM team_members tm WHERE tm.user_id = p.id
)
AND is_staff = FALSE;

-- 3. Add index for fast filtering in users list
CREATE INDEX IF NOT EXISTS idx_profiles_is_staff ON profiles (is_staff);
