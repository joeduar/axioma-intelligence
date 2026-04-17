import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail, Lock, User, Briefcase, Loader2, Eye, EyeOff,
  ArrowRight, ArrowLeft, CheckCircle, Clock, Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// ─── MINI PANTALLA DE CARGA (login / registro) ────────────
const SigningInOverlay = ({ message = 'Iniciando sesión' }: { message?: string }) => (
  <div
    className="fixed inset-0 z-[200] bg-[#0A0E27] flex flex-col items-center justify-center"
    style={{ animation: 'overlayFadeIn 0.3s ease forwards' }}
  >
    <div className="absolute inset-0 pointer-events-none"
      style={{ background: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.06), transparent 65%)' }} />

    <div className="flex flex-col items-center gap-7 relative z-10">
      <div className="relative">
        <div className="absolute inset-0 rounded-full"
          style={{ background: 'rgba(16,185,129,0.18)', filter: 'blur(22px)' }} />
        <img
          src="/favicon.png" alt="Axioma" className="w-14 h-14 object-contain relative z-10"
          style={{ filter: 'drop-shadow(0 0 18px rgba(16,185,129,0.45))' }}
        />
      </div>
      <div className="text-center">
        <p className="text-white font-black tracking-[0.25em] uppercase text-lg leading-none">AXIOMA</p>
        <p className="text-[#10B981] text-[8px] font-bold tracking-[0.45em] uppercase mt-1">
          VENTURES INTELLIGENCE
        </p>
      </div>
      <div className="w-44 h-px bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#10B981] rounded-full"
          style={{ animation: 'overlayProgress 1.8s ease-in-out forwards' }}
        />
      </div>
      <p className="text-white/25 text-[9px] font-bold tracking-[0.35em] uppercase">{message}</p>
    </div>

    <style>{`
      @keyframes overlayFadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes overlayProgress { from { width: 0%; } to { width: 100%; } }
    `}</style>
  </div>
);

// ─── LOGIN ────────────────────────────────────────────────
const LoginForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [view, setView] = useState<'login' | 'forgot' | 'forgot-sent'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signIn(email, password);
    if (error) {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
      setLoading(false);
      return;
    }
    // Mostrar overlay de "Iniciando sesión" antes de navegar
    setSigningIn(true);
    const { data } = await supabase.from('profiles').select('role').eq('email', email).single();
    setTimeout(() => {
      navigate(data?.role === 'asesor' ? '/dashboard/asesor' : '/dashboard/cliente');
    }, 1600);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError('No se pudo enviar el correo. Verifica el email e intenta de nuevo.');
      setLoading(false);
      return;
    }
    setView('forgot-sent');
    setLoading(false);
  };

  const centerContent = () => {
    if (view === 'forgot-sent') {
      return (
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} className="text-[#10B981]" />
          </div>
          <h2 className="text-xl font-bold text-[#0A0E27] mb-2">Correo enviado</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            Enviamos un enlace de recuperación a{' '}
            <span className="font-medium text-gray-800">{email}</span>.
            Revisa tu bandeja de entrada.
          </p>
          <button
            onClick={() => { setView('login'); setEmail(''); }}
            className="flex items-center gap-2 text-sm text-[#10B981] font-semibold hover:underline mx-auto"
          >
            <ArrowLeft size={14} /> Volver al inicio de sesión
          </button>
        </div>
      );
    }

    if (view === 'forgot') {
      return (
        <>
          <button
            onClick={() => { setView('login'); setError(''); }}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-8 transition-colors"
          >
            <ArrowLeft size={14} /> Volver
          </button>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#0A0E27] mb-1">Recuperar contraseña</h1>
            <p className="text-gray-400 text-sm">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleForgot} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-[#0A0E27] text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#0A0E27]/90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Enviar enlace <ArrowRight size={15} /></>}
            </button>
          </form>
        </>
      );
    }

    return (
      <>
        <div className="flex gap-6 mb-8 border-b border-gray-100 w-full">
          <button className="pb-3 text-sm font-bold text-[#0A0E27] relative">
            Iniciar sesión
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
          </button>
          <button
            onClick={onSwitch}
            className="pb-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Crear cuenta
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#0A0E27] mb-1">Bienvenido de vuelta</h1>
          <p className="text-gray-400 text-sm">Ingresa tus credenciales para continuar</p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => { setView('forgot'); setError(''); }}
                className="text-xs text-[#10B981] font-medium hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'} required value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50"
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#0A0E27] text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#0A0E27]/90 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <>Iniciar sesión <ArrowRight size={15} /></>}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          ¿No tienes cuenta?{' '}
          <button onClick={onSwitch} className="text-[#10B981] font-semibold hover:underline">
            Regístrate aquí
          </button>
        </p>
      </>
    );
  };

  return (
    <>
      {signingIn && <SigningInOverlay message="Iniciando sesión" />}
      <div className="min-h-screen bg-white flex">
        {/* PANEL IZQUIERDO */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between px-8 py-10 lg:px-16">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <img
              src="/favicon.png" alt="Axioma" className="w-9 h-9 object-contain"
              style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.3))' }}
            />
            <div>
              <p className="font-black tracking-tighter uppercase text-base leading-none text-[#0A0E27]">AXIOMA</p>
              <p className="text-[#10B981] text-[7px] font-bold tracking-[0.4em] uppercase mt-0.5">VENTURES INTELLIGENCE</p>
            </div>
          </Link>

          <div className="max-w-sm w-full mx-auto">
            {centerContent()}
          </div>

          <p className="text-gray-300 text-xs text-center">© 2026 Axioma Ventures Intelligence C.A.</p>
        </div>

        {/* PANEL DERECHO */}
        <div className="hidden lg:flex w-1/2 bg-[#0A0E27] flex-col items-center justify-center p-16 relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 30% 50%, rgba(16,185,129,0.12), transparent 60%)' }}
          />
          <div className="relative z-10 max-w-sm text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-8">
              <img
                src="/favicon.png" alt="Axioma" className="w-10 h-10 object-contain"
                style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.5))' }}
              />
            </div>
            <h2 className="text-3xl font-light text-white leading-tight mb-4">
              Conecta con los{' '}
              <span className="text-[#10B981] font-normal">mejores asesores</span>
            </h2>
            <p className="text-white/40 text-sm leading-relaxed mb-10">
              Accede a tu dashboard y gestiona tus sesiones con profesionales verificados.
            </p>
            <div className="space-y-3 text-left">
              {[
                'Accede a tu dashboard personalizado',
                'Chatea directamente con tus asesores',
                'Gestiona tus sesiones y pagos',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={11} className="text-[#10B981]" />
                  </div>
                  <span className="text-white/60 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── PANTALLA DE ONBOARDING PARA ASESORES ────────────────
const AdvisorOnboarding = ({ email, onGoLogin }: { email: string; onGoLogin: () => void }) => {
  const STEPS = [
    {
      icon: <Mail size={18} className="text-[#10B981]" />,
      title: 'Confirma tu email',
      desc: `Revisa la bandeja de ${email} y haz clic en el enlace de activación.`,
      status: 'pending' as const,
      tag: 'Requerido ahora',
    },
    {
      icon: <User size={18} className="text-blue-400" />,
      title: 'Completa tu perfil',
      desc: 'Agrega foto, título profesional, especialidad, tarifas y una biografía detallada.',
      status: 'next' as const,
      tag: 'Siguiente paso',
    },
    {
      icon: <Shield size={18} className="text-amber-400" />,
      title: 'Verificación por Axioma',
      desc: 'Nuestro equipo revisará tu perfil y lo aprobará en 24–48 horas hábiles.',
      status: 'locked' as const,
      tag: 'Pendiente de revisión',
    },
    {
      icon: <CheckCircle size={18} className="text-purple-400" />,
      title: '¡Listo para recibir clientes!',
      desc: 'Tu perfil aparecerá en el catálogo público y comenzarás a recibir solicitudes.',
      status: 'locked' as const,
      tag: 'Después de la verificación',
    },
  ];

  const tagColors: Record<string, string> = {
    'Requerido ahora': 'bg-[#10B981]/10 text-[#10B981]',
    'Siguiente paso': 'bg-blue-50 text-blue-500',
    'Pendiente de revisión': 'bg-amber-50 text-amber-500',
    'Después de la verificación': 'bg-purple-50 text-purple-500',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">

        {/* HEADER */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-5">
            <img
              src="/favicon.png" alt="Axioma" className="w-10 h-10 object-contain"
              style={{ filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.4))' }}
            />
          </div>
          <h1 className="text-2xl font-bold text-[#0A0E27] mb-2">¡Cuenta de asesor creada!</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Sigue estos pasos para activar tu perfil y comenzar a recibir clientes en Axioma.
          </p>
        </div>

        {/* PASOS */}
        <div className="space-y-3 mb-8">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`bg-white rounded-2xl border p-5 flex items-start gap-4 transition-all ${
                step.status === 'pending'
                  ? 'border-[#10B981]/30 shadow-sm shadow-[#10B981]/5'
                  : 'border-gray-100'
              }`}
            >
              {/* Número + icono */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                step.status === 'pending' ? 'bg-[#10B981]/10' :
                step.status === 'next' ? 'bg-blue-50' : 'bg-gray-50'
              }`}>
                {step.status === 'locked'
                  ? <Clock size={18} className="text-gray-300" />
                  : step.icon
                }
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={`font-semibold text-sm ${step.status === 'locked' ? 'text-gray-300' : 'text-[#0A0E27]'}`}>
                    {step.title}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tagColors[step.tag]}`}>
                    {step.tag}
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${step.status === 'locked' ? 'text-gray-300' : 'text-gray-400'}`}>
                  {step.desc}
                </p>
              </div>

              {/* Indicador activo */}
              {step.status === 'pending' && (
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse mt-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* ACCION */}
        <button
          onClick={onGoLogin}
          className="w-full bg-[#0A0E27] text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#0A0E27]/90 transition-all"
        >
          Ir al inicio de sesión <ArrowRight size={15} />
        </button>

        <p className="text-center text-gray-400 text-xs mt-5 leading-relaxed">
          Una vez que confirmes tu email podrás acceder a tu dashboard y completar tu perfil.
        </p>
      </div>
    </div>
  );
};

// ─── REGISTRO ─────────────────────────────────────────────
const RegisterForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const { signUp } = useAuth();
  const [role, setRole] = useState<'cliente' | 'asesor'>('cliente');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successEmail, setSuccessEmail] = useState('');
  const [advisorSuccess, setAdvisorSuccess] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, name, role);
    if (error) {
      setError(error.message || 'Error al crear la cuenta. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    // Notificación por email (silenciosa)
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ type: 'registro', to: email, name, role }),
    }).catch(() => {});

    if (role === 'asesor') {
      setAdvisorSuccess(true);
    } else {
      setSuccessEmail(email);
    }
    setLoading(false);
  };

  // Pantalla de onboarding para asesores
  if (advisorSuccess) {
    return <AdvisorOnboarding email={email} onGoLogin={onSwitch} />;
  }

  // Pantalla de éxito para clientes
  if (successEmail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-[#10B981]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Enviamos un correo de confirmación a{' '}
            <span className="font-medium text-gray-800">{successEmail}</span>.
            Revisa tu bandeja de entrada y activa tu cuenta para continuar.
          </p>
          <button
            onClick={onSwitch}
            className="bg-[#0A0E27] text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-[#0A0E27]/90 transition-all"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md flex flex-col items-center">

        <Link to="/" className="flex items-center gap-2.5 mb-10">
          <img
            src="/favicon.png" alt="Axioma" className="w-9 h-9 object-contain"
            style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.3))' }}
          />
          <div>
            <p className="font-black tracking-tighter uppercase text-base leading-none text-[#0A0E27]">AXIOMA</p>
            <p className="text-[#10B981] text-[7px] font-bold tracking-[0.4em] uppercase mt-0.5">VENTURES INTELLIGENCE</p>
          </div>
        </Link>

        {/* TABS */}
        <div className="flex gap-6 mb-8 border-b border-gray-100 w-full">
          <button
            onClick={onSwitch}
            className="pb-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Iniciar sesión
          </button>
          <button className="pb-3 text-sm font-bold text-[#0A0E27] relative">
            Crear cuenta
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
          </button>
        </div>

        <div className="mb-6 w-full">
          <h1 className="text-2xl font-bold text-[#0A0E27] mb-1">Crea tu cuenta</h1>
          <p className="text-gray-400 text-sm">Únete a Axioma y conecta con los mejores asesores</p>
        </div>

        {/* SELECTOR DE ROL */}
        <div className="flex gap-3 mb-6 w-full">
          <button
            type="button" onClick={() => setRole('cliente')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
              role === 'cliente'
                ? 'border-[#10B981] bg-[#10B981]/5 text-[#10B981]'
                : 'border-gray-200 text-gray-400 hover:border-gray-300'
            }`}
          >
            <User size={15} /> Cliente
          </button>
          <button
            type="button" onClick={() => setRole('asesor')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${
              role === 'asesor'
                ? 'border-[#10B981] bg-[#10B981]/5 text-[#10B981]'
                : 'border-gray-200 text-gray-400 hover:border-gray-300'
            }`}
          >
            <Briefcase size={15} /> Asesor
          </button>
        </div>

        {/* INFO DE ROL */}
        <div className="mb-5 w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
          <p className="text-gray-400 text-xs leading-relaxed">
            {role === 'cliente'
              ? 'Como cliente podrás buscar asesores, reservar sesiones y gestionar tus consultorías desde tu panel personal.'
              : 'Como asesor crearás tu cuenta y completarás tu perfil profesional en el siguiente paso para empezar a recibir clientes.'
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 w-full">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 w-full">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Nombre completo
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'} required value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="Mín. 8 caracteres"
                className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm text-gray-900 placeholder-gray-300 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all bg-gray-50"
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-xs leading-relaxed">
            Al registrarte aceptas nuestros{' '}
            <a href="#" className="text-[#10B981] hover:underline">Términos de servicio</a>
            {' '}y la{' '}
            <a href="#" className="text-[#10B981] hover:underline">Política de privacidad</a>
          </p>

          <button
            type="submit" disabled={loading}
            className="w-full bg-[#0A0E27] text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#0A0E27]/90 transition-all disabled:opacity-50"
          >
            {loading
              ? <Loader2 size={16} className="animate-spin" />
              : <>Crear cuenta {role === 'asesor' ? 'de asesor' : 'de cliente'} <ArrowRight size={15} /></>
            }
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          ¿Ya tienes cuenta?{' '}
          <button onClick={onSwitch} className="text-[#10B981] font-semibold hover:underline">
            Inicia sesión aquí
          </button>
        </p>

        <p className="text-center text-gray-300 text-xs mt-8">© 2026 Axioma Ventures Intelligence C.A.</p>
      </div>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────
const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode =
    searchParams.get('mode') === 'register' || window.location.pathname === '/registro'
      ? 'register'
      : 'login';
  const [mode, setMode] = useState<'login' | 'register'>(initialMode as any);
  const [animating, setAnimating] = useState(false);

  // Animación de entrada al montar la página
  const [mounted, setMounted] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  const switchMode = (newMode: 'login' | 'register') => {
    if (animating || newMode === mode) return;
    setAnimating(true);
    setTransitioning(true);
    setTimeout(() => {
      setMode(newMode);
      setTransitioning(false);
      setTimeout(() => setAnimating(false), 400);
    }, 280);
  };

  return (
    <div
      style={{
        opacity: mounted && !transitioning ? 1 : 0,
        transform: mounted && !transitioning ? 'translateY(0)' : 'translateY(14px)',
        transition: mounted
          ? 'opacity 0.45s ease, transform 0.45s ease'
          : 'none',
      }}
    >
      {mode === 'login'
        ? <LoginForm onSwitch={() => switchMode('register')} />
        : <RegisterForm onSwitch={() => switchMode('login')} />
      }
    </div>
  );
};

export default AuthPage;
