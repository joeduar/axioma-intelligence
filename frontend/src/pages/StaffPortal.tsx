import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Mail, Lock, User, AlertCircle, CheckCircle,
  Loader2, Eye, EyeOff, ChevronRight, ArrowLeft,
  UserPlus, Key, Briefcase
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const ROLES = [
  { value: 'admin',      label: 'Administrador',  desc: 'Acceso total a todos los módulos' },
  { value: 'supervisor', label: 'Supervisor',      desc: 'Ver y aprobar verificaciones y pagos' },
  { value: 'operador',   label: 'Operador',        desc: 'Gestionar sesiones y usuarios' },
  { value: 'soporte',    label: 'Soporte',         desc: 'Atender tickets de soporte' },
  { value: 'empleado',   label: 'Empleado',        desc: 'Acceso de lectura básico' },
];

export default function StaffPortal() {
  const [tab, setTab] = useState<'login' | 'create'>('login');
  const navigate = useNavigate();

  // ── Login state ──────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // ── Create account state ─────────────────────────────────────
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    teamRole: 'empleado',
    accessCode: '',
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [showCreatePwd, setShowCreatePwd] = useState(false);
  const [showAccessCode, setShowAccessCode] = useState(false);

  // Redirect if already logged in as admin/team
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      const [{ data: profile }, { data: tm }] = await Promise.all([
        supabase.from('profiles').select('is_admin').eq('id', session.user.id).single(),
        supabase.from('team_members').select('id').eq('user_id', session.user.id).eq('is_active', true).maybeSingle(),
      ]);
      if (profile?.is_admin || tm?.id) navigate('/dashboard/admin', { replace: true });
    });
  }, [navigate]);

  // ── Login handler ────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (error) {
      setLoginError('Credenciales incorrectas. Verifica tu correo y contraseña.');
      setLoginLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoginError('Error al verificar identidad.');
      setLoginLoading(false);
      return;
    }

    const [{ data: profile }, { data: teamMember }] = await Promise.all([
      supabase.from('profiles').select('is_admin').eq('id', user.id).single(),
      supabase.from('team_members').select('id, is_active').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
    ]);

    if (profile?.is_admin || teamMember?.is_active) {
      navigate('/dashboard/admin');
    } else {
      await supabase.auth.signOut();
      setLoginError('Tu cuenta no tiene acceso al panel de administración. Contacta al administrador.');
    }
    setLoginLoading(false);
  };

  // ── Create account handler ────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/create-team-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          fullName: form.fullName.trim(),
          teamRole: form.teamRole,
          accessCode: form.accessCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Error desconocido al crear la cuenta.');
      } else {
        setCreateSuccess(data.message);
        setForm({ fullName: '', email: '', password: '', teamRole: 'empleado', accessCode: '' });
      }
    } catch {
      setCreateError('No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo en el puerto 5000.');
    }
    setCreateLoading(false);
  };

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#10B981] transition-colors';
  const labelCls = 'block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1.5';

  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center px-4 py-12">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#10B981]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/20 mb-4">
            <Shield size={24} className="text-[#10B981]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Portal Interno</h1>
          <p className="text-white/40 text-sm mt-1">Axioma Ventures Intelligence</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-6">
          {[
            { id: 'login',  label: 'Iniciar sesión', icon: Lock },
            { id: 'create', label: 'Registrar usuario', icon: UserPlus },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setTab(id as any); setLoginError(''); setCreateError(''); setCreateSuccess(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                tab === id
                  ? 'bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20'
                  : 'text-white/40 hover:text-white/70'
              }`}>
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-7"
          >

            {/* ── LOGIN TAB ─────────────────────────────────── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className={labelCls}>Correo electrónico</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="email" required placeholder="tu@empresa.com"
                      value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                      className={`${inputCls} pl-10`} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Contraseña</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type={showLoginPwd ? 'text' : 'password'} required placeholder="••••••••"
                      value={loginPassword} onChange={e => setLoginPassword(e.target.value)}
                      className={`${inputCls} pl-10 pr-10`} />
                    <button type="button" onClick={() => setShowLoginPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showLoginPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-400">{loginError}</p>
                  </div>
                )}

                <button type="submit" disabled={loginLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#0ea572] transition-all disabled:opacity-60 shadow-lg shadow-[#10B981]/20">
                  {loginLoading ? <Loader2 size={16} className="animate-spin" /> : <ChevronRight size={16} />}
                  {loginLoading ? 'Verificando...' : 'Ingresar al panel'}
                </button>

                <p className="text-center text-xs text-white/25 pt-1">
                  Solo para personal autorizado de Axioma Ventures
                </p>
              </form>
            )}

            {/* ── CREATE ACCOUNT TAB ────────────────────────── */}
            {tab === 'create' && (
              <form onSubmit={handleCreate} className="space-y-4">

                {createSuccess ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle size={22} className="text-[#10B981]" />
                    </div>
                    <p className="text-white font-semibold text-sm mb-1">¡Cuenta creada!</p>
                    <p className="text-white/50 text-xs">{createSuccess}</p>
                    <button type="button" onClick={() => setCreateSuccess('')}
                      className="mt-4 text-xs text-[#10B981] hover:text-[#0ea572] transition-colors">
                      Crear otra cuenta →
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className={labelCls}>Nombre completo</label>
                        <div className="relative">
                          <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                          <input type="text" required placeholder="Juan Pérez"
                            value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                            className={`${inputCls} pl-10`} />
                        </div>
                      </div>

                      <div className="col-span-2">
                        <label className={labelCls}>Correo electrónico</label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                          <input type="email" required placeholder="empleado@empresa.com"
                            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                            className={`${inputCls} pl-10`} />
                        </div>
                      </div>

                      <div className="col-span-2">
                        <label className={labelCls}>Contraseña temporal</label>
                        <div className="relative">
                          <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                          <input type={showCreatePwd ? 'text' : 'password'} required placeholder="Mín. 8 caracteres"
                            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                            className={`${inputCls} pl-10 pr-10`} />
                          <button type="button" onClick={() => setShowCreatePwd(p => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                            {showCreatePwd ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Rol en el equipo</label>
                      <div className="relative">
                        <Briefcase size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <select value={form.teamRole} onChange={e => setForm(p => ({ ...p, teamRole: e.target.value }))}
                          className={`${inputCls} pl-10 appearance-none`}>
                          {ROLES.map(r => (
                            <option key={r.value} value={r.value} className="bg-[#0f1629]">
                              {r.label} — {r.desc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>Código de acceso empresarial</label>
                      <div className="relative">
                        <Key size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <input type={showAccessCode ? 'text' : 'password'} required placeholder="••••••••••••"
                          value={form.accessCode} onChange={e => setForm(p => ({ ...p, accessCode: e.target.value }))}
                          className={`${inputCls} pl-10 pr-10`} />
                        <button type="button" onClick={() => setShowAccessCode(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                          {showAccessCode ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <p className="text-xs text-white/25 mt-1.5">El código es provisto únicamente por el administrador principal.</p>
                    </div>

                    {createError && (
                      <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-400">{createError}</p>
                      </div>
                    )}

                    <button type="submit" disabled={createLoading}
                      className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[#0ea572] transition-all disabled:opacity-60 shadow-lg shadow-[#10B981]/20">
                      {createLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                      {createLoading ? 'Creando cuenta...' : 'Registrar usuario'}
                    </button>
                  </>
                )}
              </form>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Back link */}
        <div className="text-center mt-6">
          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-white/25 hover:text-white/50 transition-colors">
            <ArrowLeft size={12} />
            Volver al sitio
          </a>
        </div>

      </div>
    </div>
  );
}
