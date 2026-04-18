-- ============================================================
-- AXIOMA VENTURES INTELLIGENCE — Migration 002: Fixes & Team Roles
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. UNIQUE CONSTRAINT: advisor_verification.advisor_id
--    Needed so upsert({ onConflict: 'advisor_id' }) works
-- ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'advisor_verification'
      AND constraint_name = 'advisor_verification_advisor_id_key'
  ) THEN
    ALTER TABLE advisor_verification
      ADD CONSTRAINT advisor_verification_advisor_id_key UNIQUE (advisor_id);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 2. STORAGE BUCKETS: verification-docs & certifications
--    Run this section only if buckets don't exist yet
-- ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('verification-docs', 'verification-docs', false, 10485760, -- 10 MB
   ARRAY['image/jpeg','image/png','image/webp','application/pdf']),
  ('certifications', 'certifications', false, 10485760,
   ARRAY['image/jpeg','image/png','image/webp','application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: drop first (idempotent), then recreate
DROP POLICY IF EXISTS "advisors_upload_verification"       ON storage.objects;
DROP POLICY IF EXISTS "advisors_read_own_verification"     ON storage.objects;
DROP POLICY IF EXISTS "advisors_upload_certifications"     ON storage.objects;
DROP POLICY IF EXISTS "advisors_read_own_certifications"   ON storage.objects;

CREATE POLICY "advisors_upload_verification"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification-docs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "advisors_read_own_verification"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification-docs' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    )
  );

CREATE POLICY "advisors_upload_certifications"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'certifications' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "advisors_read_own_certifications"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'certifications' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 3. ADMIN RLS BYPASS: Allow admin to read ALL profiles
--    Uses a SECURITY DEFINER function to avoid infinite recursion
-- ─────────────────────────────────────────────────────────────

-- Helper function: check if current user is admin (avoids recursion in RLS)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid() LIMIT 1),
    FALSE
  );
$$;

-- Add admin policy on profiles (so admin can see all users in dashboard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'admin_read_all_profiles'
  ) THEN
    CREATE POLICY "admin_read_all_profiles" ON profiles
      FOR SELECT USING (
        id = auth.uid()        -- own profile
        OR is_admin_user()     -- or is admin
      );
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────
-- 4. TEAM MEMBERS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference (must be an existing auth user with a profile)
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Internal role / permission level
  -- admin: full access (mirrors is_admin flag)
  -- supervisor: can view all sections, approve verifications
  -- operador: can manage sessions and users
  -- soporte: can only access support tickets
  -- empleado: read-only access to dashboard
  team_role       TEXT NOT NULL DEFAULT 'empleado'
                  CHECK (team_role IN ('admin','supervisor','operador','soporte','empleado')),

  -- Granular permission flags (JSON)
  permissions     JSONB NOT NULL DEFAULT '{
    "ver_usuarios": false,
    "editar_usuarios": false,
    "ver_verificaciones": false,
    "aprobar_verificaciones": false,
    "ver_pagos": false,
    "gestionar_pagos": false,
    "ver_sesiones": false,
    "gestionar_sesiones": false,
    "ver_reportes": false,
    "configurar_plataforma": false,
    "gestionar_equipo": false,
    "ver_soporte": false,
    "responder_soporte": false
  }'::jsonb,

  -- Status
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  invited_by      UUID REFERENCES profiles(id),
  notes           TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 5. PERMISSION PRESETS — Insert default permission sets by role
--    (Reference: match these when creating team members via UI)
-- ─────────────────────────────────────────────────────────────
-- No table needed; permissions are stored per-member in JSONB.
-- The UI will offer "presets" based on team_role selection.

-- ─────────────────────────────────────────────────────────────
-- 6. SUPPORT TICKETS TABLE
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Ticket meta
  subject         TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'general'
                  CHECK (category IN ('general','pagos','sesiones','cuenta','verificacion','tecnico','otro')),
  priority        TEXT NOT NULL DEFAULT 'normal'
                  CHECK (priority IN ('baja','normal','alta','urgente')),
  status          TEXT NOT NULL DEFAULT 'abierto'
                  CHECK (status IN ('abierto','en_revision','respondido','cerrado')),

  -- Assignment
  assigned_to     UUID REFERENCES profiles(id),

  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  closed_at       TIMESTAMPTZ
);

-- ─────────────────────────────────────────────────────────────
-- 7. SUPPORT MESSAGES TABLE (conversation thread per ticket)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id),
  is_staff        BOOLEAN NOT NULL DEFAULT FALSE,  -- true = sent by team member
  body            TEXT NOT NULL,
  attachments     JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────
-- 8. RLS FOR NEW TABLES
-- ─────────────────────────────────────────────────────────────

-- team_members: only admins can manage
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_manage_team"           ON team_members;
CREATE POLICY "admin_manage_team" ON team_members
  FOR ALL USING (is_admin_user());

-- support_tickets: users can see/create their own; staff with ver_soporte permission can see all
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_own_tickets"            ON support_tickets;
DROP POLICY IF EXISTS "staff_see_all_tickets"       ON support_tickets;
DROP POLICY IF EXISTS "staff_update_tickets"        ON support_tickets;

CREATE POLICY "user_own_tickets" ON support_tickets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "staff_see_all_tickets" ON support_tickets
  FOR SELECT USING (
    is_admin_user()
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = TRUE
        AND (tm.permissions->>'ver_soporte')::boolean = TRUE
    )
  );

CREATE POLICY "staff_update_tickets" ON support_tickets
  FOR UPDATE USING (
    is_admin_user()
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = TRUE
        AND (tm.permissions->>'responder_soporte')::boolean = TRUE
    )
  );

-- support_messages: users see messages in their tickets; staff see all
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_ticket_messages"        ON support_messages;
DROP POLICY IF EXISTS "staff_all_messages"          ON support_messages;

CREATE POLICY "user_ticket_messages" ON support_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM support_tickets st
      WHERE st.id = ticket_id AND st.user_id = auth.uid()
    )
  );

CREATE POLICY "staff_all_messages" ON support_messages
  FOR ALL USING (
    is_admin_user()
    OR EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.user_id = auth.uid()
        AND tm.is_active = TRUE
        AND (tm.permissions->>'ver_soporte')::boolean = TRUE
    )
  );

-- ─────────────────────────────────────────────────────────────
-- 9. REALTIME: enable for support_messages
-- ─────────────────────────────────────────────────────────────
ALTER TABLE support_messages REPLICA IDENTITY FULL;
-- Then in Supabase Dashboard > Realtime, add support_messages to the publication.
-- Or run: ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;

-- ─────────────────────────────────────────────────────────────
-- DONE
-- Verify with:
--   SELECT constraint_name FROM information_schema.table_constraints
--   WHERE table_name = 'advisor_verification';
--   SELECT * FROM team_members LIMIT 0;
--   SELECT * FROM support_tickets LIMIT 0;
-- ─────────────────────────────────────────────────────────────
