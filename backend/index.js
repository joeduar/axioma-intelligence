require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Supabase Admin Client (service role — bypasses RLS) ─────────
const supabaseAdmin = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// ── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Permission presets (mirrors frontend ROLE_PRESETS) ───────────
const ROLE_PRESETS = {
  admin:      { ver_usuarios: true,  editar_usuarios: true,  ver_verificaciones: true,  aprobar_verificaciones: true,  ver_pagos: true,  gestionar_pagos: true,  ver_sesiones: true,  gestionar_sesiones: true,  ver_reportes: true,  configurar_plataforma: true,  gestionar_equipo: true,  ver_soporte: true,  responder_soporte: true  },
  supervisor: { ver_usuarios: true,  editar_usuarios: false, ver_verificaciones: true,  aprobar_verificaciones: true,  ver_pagos: true,  gestionar_pagos: false, ver_sesiones: true,  gestionar_sesiones: false, ver_reportes: true,  configurar_plataforma: false, gestionar_equipo: false, ver_soporte: true,  responder_soporte: true  },
  operador:   { ver_usuarios: true,  editar_usuarios: true,  ver_verificaciones: false, aprobar_verificaciones: false, ver_pagos: false, gestionar_pagos: false, ver_sesiones: true,  gestionar_sesiones: true,  ver_reportes: false, configurar_plataforma: false, gestionar_equipo: false, ver_soporte: true,  responder_soporte: false },
  soporte:    { ver_usuarios: true,  editar_usuarios: false, ver_verificaciones: false, aprobar_verificaciones: false, ver_pagos: false, gestionar_pagos: false, ver_sesiones: false, gestionar_sesiones: false, ver_reportes: false, configurar_plataforma: false, gestionar_equipo: false, ver_soporte: true,  responder_soporte: true  },
  empleado:   { ver_usuarios: false, editar_usuarios: false, ver_verificaciones: false, aprobar_verificaciones: false, ver_pagos: false, gestionar_pagos: false, ver_sesiones: true,  gestionar_sesiones: false, ver_reportes: false, configurar_plataforma: false, gestionar_equipo: false, ver_soporte: false, responder_soporte: false },
};

// ── Health / market data ────────────────────────────────────────
app.get('/api/v1/market-data', (_req, res) => {
  res.json({
    precision: '99.4%',
    agents: '150+',
    optimization: '32%',
    latency: '12ms',
    firm: 'Axioma Ventures Intelligence',
  });
});

// ── Auth stubs (kept for compatibility) ─────────────────────────
app.post('/api/auth/login', (_req, res) => res.json({ success: true }));
app.post('/api/auth/register', (_req, res) => res.status(201).json({ success: true }));

// ── CREATE TEAM MEMBER ───────────────────────────────────────────
// POST /api/admin/create-team-member
// Body: { email, password, fullName, teamRole, accessCode }
// Protected by ADMIN_ACCESS_CODE env var
app.post('/api/admin/create-team-member', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Backend no configurado. Revisa SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env' });
  }

  const { email, password, fullName, teamRole, accessCode } = req.body;

  // Auth option 1: admin JWT in Authorization header (from AdminDashboard — no access code needed)
  let isAdminVerified = false;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ') && supabaseAdmin) {
    try {
      const token = authHeader.slice(7);
      const { data: userData, error: jwtError } = await supabaseAdmin.auth.getUser(token);
      if (jwtError) {
        console.warn('[JWT] Error verificando token:', jwtError.message);
      } else if (userData?.user?.id) {
        const userId = userData.user.id;
        // Check is_admin on profiles OR active team_members record
        const [{ data: prof }, { data: tm }] = await Promise.all([
          supabaseAdmin.from('profiles').select('is_admin').eq('id', userId).single(),
          supabaseAdmin.from('team_members').select('id').eq('user_id', userId).eq('is_active', true).maybeSingle(),
        ]);
        isAdminVerified = prof?.is_admin === true || !!tm?.id;
        console.log('[JWT] is_admin:', prof?.is_admin, '| team_member:', !!tm?.id, '| verified:', isAdminVerified);
      }
    } catch (e) {
      console.error('[JWT] Excepción al verificar token:', e.message);
    }
  }

  // Auth option 2: access code (from StaffPortal — public page)
  const expectedCode = process.env.ADMIN_ACCESS_CODE;
  if (!isAdminVerified && (!expectedCode || accessCode !== expectedCode)) {
    return res.status(403).json({ error: 'Código de acceso inválido o sesión no autorizada.' });
  }

  // Validate required fields
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Faltan campos requeridos (email, contraseña, nombre).' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  const role = teamRole || 'empleado';
  const permissions = ROLE_PRESETS[role] || ROLE_PRESETS['empleado'];

  try {
    // 1. Create the auth user (email auto-confirmed, no email sent)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      // role: 'cliente' para que el trigger de profiles no falle (la membresía real está en team_members)
      user_metadata: { full_name: fullName, role: 'cliente' },
    });

    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authData.user.id;

    // 2. Upsert profile — mark as staff so they don't appear in client/advisor lists
    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      email: email,
      role: 'cliente',   // satisfies CHECK constraint; real access via team_members
      is_staff: true,    // excludes from public user listings
    }, { onConflict: 'id' });

    // 3. Add to team_members
    const { error: teamError } = await supabaseAdmin.from('team_members').insert({
      user_id: userId,
      team_role: role,
      permissions,
    });

    if (teamError) {
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(400).json({ error: `Error al crear miembro del equipo: ${teamError.message}` });
    }

    res.json({ success: true, message: `Cuenta de ${fullName} creada exitosamente. Ya puede ingresar con su correo y contraseña.` });

  } catch (err) {
    res.status(500).json({ error: err.message || 'Error interno del servidor.' });
  }
});

// ── LIST TEAM MEMBERS ────────────────────────────────────────────
// GET /api/admin/team-members
// Protected by admin JWT OR active team member JWT
app.get('/api/admin/team-members', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Backend no configurado.' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorización requerido.' });
  }

  try {
    const token = authHeader.slice(7);
    const { data: userData, error: jwtError } = await supabaseAdmin.auth.getUser(token);
    if (jwtError || !userData?.user?.id) {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    const callerId = userData.user.id;
    const [{ data: prof }, { data: tm }] = await Promise.all([
      supabaseAdmin.from('profiles').select('is_admin').eq('id', callerId).single(),
      supabaseAdmin.from('team_members').select('id, is_active').eq('user_id', callerId).eq('is_active', true).maybeSingle(),
    ]);
    if (!prof?.is_admin && !tm?.id) {
      return res.status(403).json({ error: 'No autorizado.' });
    }
  } catch (e) {
    return res.status(401).json({ error: 'Error verificando autorización.' });
  }

  try {
    // Join using column name hint (two FKs exist: user_id and invited_by → profiles)
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .select('id, user_id, team_role, permissions, is_active, notes, created_at, updated_at, invited_by, profiles!user_id(full_name, email, avatar_url, role)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[team-members] join error:', error.message);
      // Fallback: return team members without profile join
      const { data: fallback } = await supabaseAdmin
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });
      return res.json({ members: fallback || [], warning: 'profiles join failed: ' + error.message });
    }
    res.json({ members: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error interno.' });
  }
});

// ── ADD EXISTING USER TO TEAM ────────────────────────────────────
// POST /api/admin/add-existing-to-team
// Body: { email, teamRole, notes? }
// Protected by admin JWT in Authorization header
app.post('/api/admin/add-existing-to-team', async (req, res) => {
  if (!supabaseAdmin) {
    return res.status(503).json({ error: 'Backend no configurado.' });
  }

  // Verify admin JWT
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorización requerido.' });
  }

  let isAuthorized = false;
  let invitedByUserId = null;
  try {
    const token = authHeader.slice(7);
    const { data: userData, error: jwtError } = await supabaseAdmin.auth.getUser(token);
    if (jwtError || !userData?.user?.id) {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    const callerId = userData.user.id;
    const [{ data: prof }, { data: tm }] = await Promise.all([
      supabaseAdmin.from('profiles').select('is_admin').eq('id', callerId).single(),
      supabaseAdmin.from('team_members').select('id, permissions').eq('user_id', callerId).eq('is_active', true).maybeSingle(),
    ]);
    isAuthorized = prof?.is_admin === true || (!!tm?.id && tm?.permissions?.gestionar_equipo === true);
    invitedByUserId = callerId;
  } catch (e) {
    return res.status(401).json({ error: 'Error verificando autorización.' });
  }

  if (!isAuthorized) {
    return res.status(403).json({ error: 'No tienes permisos para gestionar el equipo.' });
  }

  const { email, teamRole, notes } = req.body;
  if (!email) return res.status(400).json({ error: 'Email requerido.' });

  const role = teamRole || 'empleado';
  const permissions = ROLE_PRESETS[role] || ROLE_PRESETS['empleado'];

  try {
    // 1. Find user by email in profiles (service role bypasses RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (profileError) {
      return res.status(400).json({ error: `Error buscando usuario: ${profileError.message}` });
    }
    if (!profile) {
      return res.status(404).json({ error: 'No se encontró ningún usuario con ese correo electrónico.' });
    }

    // 2. Check if already a team member
    const { data: existing } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('user_id', profile.id)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'Este usuario ya es parte del equipo.' });
    }

    // 3. Mark profile as staff so they don't appear in client/advisor lists
    await supabaseAdmin.from('profiles').update({ is_staff: true }).eq('id', profile.id);

    // 4. Insert into team_members
    const { error: insertError } = await supabaseAdmin.from('team_members').insert({
      user_id: profile.id,
      team_role: role,
      permissions,
      notes: notes || null,
      invited_by: invitedByUserId,
    });

    if (insertError) {
      // Rollback the is_staff flag
      await supabaseAdmin.from('profiles').update({ is_staff: false }).eq('id', profile.id);
      return res.status(400).json({ error: `Error al agregar al equipo: ${insertError.message}` });
    }

    res.json({
      success: true,
      message: `${profile.full_name || email} ha sido agregado al equipo como ${role}.`,
      userId: profile.id,
    });

  } catch (err) {
    res.status(500).json({ error: err.message || 'Error interno del servidor.' });
  }
});

// ── Start server ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('=========================================');
  console.log('  AXIOMA VENTURES — BACKEND OPERATIVO');
  console.log(`  Puerto: ${PORT}`);
  console.log(`  Supabase: ${supabaseAdmin ? 'Conectado' : 'NO CONFIGURADO (falta .env)'}`);
  console.log('=========================================');
});
