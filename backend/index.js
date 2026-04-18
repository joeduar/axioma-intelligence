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
app.use(cors());
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
    const token = authHeader.slice(7);
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (user) {
      const { data: prof } = await supabaseAdmin.from('profiles').select('is_admin').eq('id', user.id).single();
      isAdminVerified = prof?.is_admin === true;
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
      user_metadata: { full_name: fullName, role: 'staff' },
    });

    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authData.user.id;

    // 2. Upsert profile (trigger may already create it, this ensures correctness)
    await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: fullName,
      email: email,
      role: 'cliente', // base role — actual access controlled by team_members
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

// ── Start server ────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('=========================================');
  console.log('  AXIOMA VENTURES — BACKEND OPERATIVO');
  console.log(`  Puerto: ${PORT}`);
  console.log(`  Supabase: ${supabaseAdmin ? 'Conectado' : 'NO CONFIGURADO (falta .env)'}`);
  console.log('=========================================');
});
