-- ─────────────────────────────────────────────────────────────────────────────
-- 003_team_member_access.sql
-- Permite que los miembros del equipo lean su propio registro en team_members
-- (necesario para AuthContext y redirección al login)
-- ─────────────────────────────────────────────────────────────────────────────

-- Cada usuario puede leer su propio registro en team_members
-- (el admin ya puede leerlos todos via admin_manage_team policy)
DROP POLICY IF EXISTS "users_read_own_membership" ON team_members;
CREATE POLICY "users_read_own_membership" ON team_members
  FOR SELECT
  USING (auth.uid() = user_id);

-- Asegura que el admin principal tenga is_admin = true en su perfil
-- (reemplaza el email si es necesario)
UPDATE profiles
SET is_admin = true
WHERE email = 'rolandoaf5@gmail.com'
  AND is_admin IS DISTINCT FROM true;
