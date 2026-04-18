# Axioma Ventures Intelligence — Project Context

> Documento de respaldo para no perder contexto entre sesiones de desarrollo.
> Última actualización: 2026-04-17

---

## ¿Qué es este proyecto?

Marketplace que conecta asesores especializados con clientes. Los clientes contratan sesiones de asesoría; los asesores cobran por sesión. La plataforma toma una comisión.

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS + Framer Motion |
| Iconos | Lucide React (exclusivo) |
| Router | React Router v7 |
| Base de datos | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Pagos | Stripe |
| Gráficas | Recharts |
| Backend | Express.js (Node.js) en `backend/` |

---

## Estructura de carpetas relevante

```
axioma-intelligence-project/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── AuthPage.tsx          — Login/registro público
│   │   │   ├── StaffPortal.tsx       — Login/registro interno (/staff)
│   │   │   ├── ClientDashboard.tsx   — Dashboard cliente
│   │   │   ├── AdvisorDashboard.tsx  — Dashboard asesor
│   │   │   ├── AdminDashboard.tsx    — Dashboard admin/equipo
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── AdvisorProfileFull.tsx     — Perfil completo del asesor
│   │   │   ├── AdvisorVerificationModule.tsx — KYC/verificación asesor
│   │   │   ├── AdvisorPayoutSetup.tsx     — Datos de cobro del asesor
│   │   │   ├── ClientProfileExpanded.tsx  — Perfil completo del cliente
│   │   │   ├── SupportWidget.tsx          — Tickets de soporte (usuario)
│   │   │   ├── AvatarUpload.tsx           — Upload de foto de perfil
│   │   │   └── ProtectedRoute.tsx         — Guarda de rutas
│   │   ├── context/
│   │   │   ├── AuthContext.tsx      — user, session, profile, teamMember, loading
│   │   │   └── DarkModeContext.tsx
│   │   └── lib/supabase.ts
│   └── .env.local
├── backend/
│   ├── index.js           — Express server con endpoint create-team-member
│   ├── package.json
│   ├── .env               — SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_ACCESS_CODE
│   └── .env.example
└── supabase/migrations/
    ├── 001_initial.sql
    └── 002_fixes.sql      — Idempotente. Correr en Supabase SQL Editor.
```

---

## Rutas de la aplicación

| Ruta | Componente | Acceso |
|------|------------|--------|
| `/` | HomePage | Público |
| `/asesores` | AdvisorsPage | Público |
| `/asesores/:id` | AdvisorProfilePage | Público |
| `/como-funciona` | HowItWorksPage | Público |
| `/nosotros` | AboutPage | Público |
| `/login` | AuthPage | Público |
| `/registro` | AuthPage | Público |
| `/staff` | StaffPortal | Público (protegido por código de acceso para crear cuentas) |
| `/dashboard/cliente` | ClientDashboard | `role = 'cliente'` |
| `/dashboard/asesor` | AdvisorDashboard | `role = 'asesor'` |
| `/dashboard/admin` | AdminDashboard | `is_admin = true` ó `team_members.is_active = true` |
| `/planes` | PlansPage | Público |
| `/checkout/:planType/:advisorId/:sessionId` | CheckoutPage | - |
| `/pago/exito` | PaymentSuccessPage | - |
| `/pago/cancelado` | PaymentCancelledPage | - |
| `/sesion/:sessionId` | SessionActivePage | `role = 'cliente'` |
| `/reset-password` | ResetPasswordPage | Público |

---

## Base de datos — Tablas principales

### `profiles`
Todos los usuarios. Creada por trigger al registrarse.
```
id (uuid, FK auth.users)
full_name, email, avatar_url, phone, country, city
role: 'cliente' | 'asesor'
is_admin: boolean
date_of_birth, company_name, linkedin_url, website_url
timezone, language_pref
created_at, updated_at
```

### `advisors`
Datos profesionales del asesor.
```
id (uuid, FK profiles.id)
bio, professional_title, category, experience_years
hourly_rate, rating, review_count
verified, verification_status
available, education_level, university
```

### `advisor_verification`
Solicitudes de verificación de identidad (KYC).
```
id, user_id (FK profiles.id), advisor_id (FK advisors.id, UNIQUE)
full_legal_name, professional_title, education_level, university
linkedin_url, license_number, license_number, notes
id_document_url, selfie_url, degree_url, license_url
certificate_urls (JSONB array)
status: 'pending' | 'approved' | 'rejected'
submitted_at, reviewed_at, reviewed_by
```
> IMPORTANTE: Tiene dos FK a `profiles` (user_id y reviewed_by). Al hacer JOIN usar:
> `.select('*, profiles!advisor_verification_user_id_fkey(full_name, email, avatar_url)')`

### `team_members`
Personal interno con acceso al admin dashboard.
```
id, user_id (FK profiles.id)
team_role: 'admin' | 'supervisor' | 'operador' | 'soporte' | 'empleado'
permissions: JSONB (ver_usuarios, editar_usuarios, ver_verificaciones, aprobar_verificaciones,
             ver_pagos, gestionar_pagos, ver_sesiones, gestionar_sesiones, ver_reportes,
             configurar_plataforma, gestionar_equipo, ver_soporte, responder_soporte)
is_active: boolean
invited_by, notes, created_at, updated_at
```

### `support_tickets`
```
id, user_id
subject, category, priority, status
assigned_to, created_at, updated_at, closed_at
```

### `support_messages`
```
id, ticket_id, sender_id, is_staff, body, attachments
created_at
```

### `conversations`, `messages`
Chat en tiempo real entre cliente y asesor vía Supabase Realtime.

---

## Supabase Storage

| Bucket | Visibilidad | Contenido |
|--------|-------------|-----------|
| `verification-docs` | Privado | Documentos KYC (ID, selfie, título) |
| `certifications` | Privado | Certificados adicionales |
| `avatars` | Público | Fotos de perfil |

> Para ver documentos privados desde el admin: usar `createSignedUrl(path, 3600)`.
> El componente `DocLink` en AdminDashboard lo hace automáticamente.

---

## Migraciones SQL — Estado actual

### `002_fixes.sql` (correr en Supabase SQL Editor)
- UNIQUE constraint en `advisor_verification.advisor_id`
- Buckets de storage + RLS policies
- Función `is_admin_user()` SECURITY DEFINER (evita recursión en RLS)
- Policy `admin_read_all_profiles` en tabla `profiles`
- Tablas `team_members`, `support_tickets`, `support_messages`
- RLS para todas las tablas nuevas

**Estado**: Migración corregida y lista para ejecutar. Todos los statements son idempotentes (usan `IF NOT EXISTS`, `DROP IF EXISTS`, etc.)

---

## Backend API — Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/market-data` | Estadísticas institucionales |
| POST | `/api/auth/login` | Stub (auth real está en Supabase) |
| POST | `/api/auth/register` | Stub |
| POST | `/api/admin/create-team-member` | Crea cuenta de empleado con rol (requiere `ADMIN_ACCESS_CODE`) |

### `POST /api/admin/create-team-member`
Body: `{ email, password, fullName, teamRole, accessCode }`
- Valida el `accessCode` contra `process.env.ADMIN_ACCESS_CODE`
- Usa `supabaseAdmin.auth.admin.createUser()` para crear el usuario sin enviar email de confirmación
- Inserta en `team_members` con permisos según el `teamRole`
- Si falla el insert en `team_members`, hace rollback borrando el auth user

---

## Contexto del AdminDashboard

### Pestañas disponibles
1. **Inicio** — KPIs, gráficas de ingresos
2. **Usuarios** — Tabla de todos los perfiles; click en fila abre modal con datos + datos de pago (protegido con click de confirmación)
3. **Verificaciones** — Solicitudes KYC de asesores; botones Aprobar/Rechazar; `DocLink` para ver documentos con URL firmada
4. **Pagos** — Transacciones
5. **Sesiones** — Historial de sesiones
6. **Reportes** — Gráficas adicionales
7. **Equipo** — Miembros del equipo (`team_members`); invitar por email (usuario ya registrado) o crear desde `/staff`; toggle activo/inactivo; cambio de rol
8. **Soporte** — Tickets de soporte; panel de conversación
9. **Configuración** — Ajustes de la plataforma

### Sidebar
Sticky (`h-screen sticky top-0 overflow-y-auto`) para que no se mueva al hacer scroll.

### Tab loading
`tabLoading` state + `switchTab()` función con delay 280ms + overlay spinner al cambiar pestañas.

---

## Flujos importantes

### Registro de asesor (verificación)
1. Asesor llena `AdvisorVerificationModule` con datos + documentos
2. Documentos suben a bucket privado `verification-docs`
3. Se hace upsert en `advisor_verification` con `onConflict: 'advisor_id'`
4. Admin ve la solicitud en pestaña "Verificaciones"
5. Admin abre documentos via `DocLink` → genera URL firmada de 1 hora
6. Admin aprueba o rechaza → actualiza `advisor_verification.status` y `advisors.verified`

### Flujo del Staff Portal (`/staff`)
1. Staff/admin va a `/staff` (URL separada, no enlazada desde el frontend público)
2. **Login**: ingresa email/contraseña → si `is_admin` o `team_members.is_active` → redirige a `/dashboard/admin`
3. **Crear empleado**: requiere código de acceso empresarial → llama a `POST /api/admin/create-team-member` → cuenta creada sin email de confirmación, ya puede ingresar inmediatamente

### Invite de miembro (desde AdminDashboard > Equipo)
1. Admin escribe el email de alguien que ya está registrado
2. Se busca en `profiles.email` (requiere RLS `admin_read_all_profiles` activa)
3. Se inserta en `team_members` con rol y permisos preset
4. Realtime actualiza la lista sin recargar

---

## Cosas que DEBEN hacerse antes de usar en producción

1. **Correr `002_fixes.sql`** en Supabase SQL Editor (solo una vez; es idempotente)
2. **Crear `backend/.env`** copiando `backend/.env.example` y llenando:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (en Supabase Dashboard > Settings > API > Service Role)
   - `ADMIN_ACCESS_CODE` (código secreto para crear cuentas de empleados)
3. **Correr el backend**: `cd backend && node index.js`
4. Verificar que `verification-docs` y `certifications` existen en Supabase Storage

---

## Paleta de colores (dark theme)

```
Navy:    #0A0E27  (fondo principal)
Blue:    #051A3F  (fondo secundario)
Emerald: #10B981  (acento principal)
White:   rgba(255,255,255,0.X) para opacidades
```

---

## Notas de desarrollo

- **No usar `ADD CONSTRAINT IF NOT EXISTS`** — PostgreSQL no lo soporta. Usar `DO $$ BEGIN IF NOT EXISTS ... THEN ALTER TABLE ... ADD CONSTRAINT ...; END IF; END $$;`
- **No usar `CREATE POLICY IF NOT EXISTS`** — No existe. Usar `DROP POLICY IF EXISTS` + `CREATE POLICY`
- **Buckets privados**: Los `getPublicUrl()` no funcionan. Usar `createSignedUrl()` para visualización admin
- **RLS en profiles**: La función `is_admin_user()` con SECURITY DEFINER evita recursión infinita al leer `profiles.is_admin` dentro de una policy de `profiles`
- **FK ambigua en advisor_verification**: La tabla tiene FK a profiles en `user_id` y `reviewed_by`. Siempre usar la sintaxis de hint explícito en los selects
