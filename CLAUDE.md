# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Axioma Ventures Intelligence** — a marketplace SPA connecting specialized advisors (asesores) with clients (clientes). Frontend-heavy architecture with Supabase as the primary backend.

## Commands

### Frontend (primary working directory: `frontend/`)

```bash
cd frontend
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build
```

### Backend (`backend/`)

```bash
cd backend
npm install        # Install dependencies (first time)
node index.js      # Start Express server on port 5000
```

No linting or test commands are configured.

## Architecture

### Tech Stack

- **React 18 + TypeScript** via **Vite**
- **React Router v7** for routing
- **Tailwind CSS + Framer Motion** for styling/animations
- **Supabase** for database, auth, and real-time (primary backend)
- **Stripe** for payment processing
- **Recharts** for dashboard charts
- **Express.js** backend with `@supabase/supabase-js` (service role key) for admin-only operations

### Auth & Routing

`AuthContext` (`src/context/AuthContext.tsx`) wraps the app and exposes `user`, `session`, `profile`, `teamMember`, and `loading`. It loads both the `profiles` record and any active `team_members` record for the current user on sign-in.

Routes are defined in `App.tsx` with three layout types:
- **PublicLayout** — Navbar + Footer (landing, advisors, how-it-works)
- **CleanLayout** — Full-screen (auth pages, checkout, payment results, staff portal)
- **Protected routes** — wrapped in `ProtectedRoute`, which checks `profile.role` for `cliente`/`asesor` and `profile.is_admin || teamMember.is_active` for `admin`

### User Roles

| Role | Access |
|------|--------|
| `cliente` | `/dashboard/cliente` |
| `asesor` | `/dashboard/asesor` |
| `is_admin = true` | `/dashboard/admin` |
| `team_members.is_active = true` | `/dashboard/admin` (permissions from JSONB) |

### Staff Portal

Separate login page at `/staff` (CleanLayout, no navbar/footer). Staff and admins log in here to be redirected directly to `/dashboard/admin`. Also has a "Registrar empleado" tab that calls the backend API to create a new team member account using the Supabase Admin API (requires service role key + access code).

### Supabase Integration

Client initialized once in `src/lib/supabase.ts` using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. All data fetching done directly from components via the Supabase JS SDK.

Key tables:
- `profiles` — all users (email, full_name, role, is_admin, avatar_url, phone, country, etc.)
- `advisors` — advisor-specific fields (bio, categories, rating, verified, etc.)
- `advisor_verification` — KYC/identity documents and status; has UNIQUE on `advisor_id`
- `team_members` — internal staff with `team_role` + JSONB `permissions`
- `support_tickets` + `support_messages` — internal support system
- `conversations`, `messages` — real-time chat
- `subscriptions`, `payments` — Stripe payment records

### Storage

Two private buckets: `verification-docs` and `certifications`. Files are uploaded with `getPublicUrl()` paths but since buckets are private, viewing in admin requires calling `createSignedUrl(path, 3600)` to get a 1-hour signed URL. The `DocLink` component in AdminDashboard does this automatically.

### Admin Dashboard — Verifications Query

Use explicit FK hint to avoid ambiguity (the table has two FK refs to `profiles`):
```ts
.select('*, profiles!advisor_verification_user_id_fkey(full_name, email, avatar_url)')
```

### Payment Flow

1. User selects a plan on `/planes` or `/planes/:advisorId/:sessionId`
2. Redirects to `/checkout/:planType/:advisorId/:sessionId` with Stripe Elements
3. Two plan types, price IDs in `.env.local`: `VITE_STRIPE_PRICE_INICIAL` (Sesión Inicial $19) and `VITE_STRIPE_PRICE_COMPLETO` (Plan Completo $149)
4. Resolves to `/pago/exito` or `/pago/cancelado`

### UI Conventions

- **Glassmorphism**: cards use `bg-white/10 backdrop-blur` pattern
- **Dark theme**: custom colors — Navy `#0A0E27`, Blue `#051A3F`, Emerald `#10B981`
- **Icons**: Lucide React exclusively
- **Animations**: Framer Motion for page transitions (fade + slide)
- **Tab loading**: `tabLoading` state + `switchTab()` function with 280ms delay + spinner overlay (used in AdvisorDashboard, ClientDashboard, AdminDashboard)

### Environment Variables

**Frontend** (`frontend/.env.local`):
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STRIPE_PRICE_INICIAL` / `VITE_STRIPE_PRICE_COMPLETO`
- `VITE_BACKEND_URL` (optional, defaults to `http://localhost:5000`)

**Backend** (`backend/.env` — copy from `backend/.env.example`):
- `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` — for admin API operations
- `ADMIN_ACCESS_CODE` — secret code protecting the create-team-member endpoint

### SQL Migrations

Located in `supabase/migrations/`. All migrations are idempotent (safe to re-run):
- `001_initial.sql` — initial schema
- `002_fixes.sql` — unique constraints, storage buckets+RLS, `is_admin_user()` SECURITY DEFINER function, `admin_read_all_profiles` policy, `team_members` table, `support_tickets`/`support_messages` tables with RLS

Run migrations manually in Supabase Dashboard > SQL Editor.

### Deployment

Frontend deployed to **Vercel**. `frontend/vercel.json` rewrites all routes to `index.html` for SPA routing.
