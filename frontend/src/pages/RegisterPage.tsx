import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Loader2, ArrowLeft, Briefcase } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [role, setRole] = useState<'cliente' | 'asesor'>('cliente');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }

    const { error } = await signUp(email, password, name, role);

    if (error) {
      setError(error.message || 'Error al crear la cuenta. Intenta de nuevo.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <GlassCard className="p-10 border-[#10B981]/20 text-center">
            <div className="w-16 h-16 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-6">
              <User size={28} className="text-[#10B981]" />
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-3">
              Cuenta creada
            </h2>
            <p className="text-slate-400 text-sm font-light leading-relaxed mb-6">
              Te enviamos un email de confirmacion a{' '}
              <span className="text-white font-medium">{email}</span>.
              Revisa tu bandeja de entrada y confirma tu cuenta para continuar.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#10B981] text-[#0A0E27] font-black px-8 py-3 rounded-full text-[10px] uppercase tracking-wider hover:bg-[#0ea371] transition-all"
            >
              Ir al Login
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(16,185,129,0.06), transparent 60%)' }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex flex-col items-center gap-2">
            <img
              src="/favicon.png"
              alt="Axioma"
              className="w-12 h-12 object-contain"
              style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.4))' }}
            />
            <div>
              <p className="text-white font-black tracking-[0.2em] uppercase text-lg leading-none">AXIOMA</p>
              <p className="text-[#10B981] text-[8px] font-bold tracking-[0.4em] uppercase mt-0.5">
                VENTURES INTELLIGENCE
              </p>
            </div>
          </Link>
        </div>

        <GlassCard className="p-8 border-white/10">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-white uppercase tracking-wider mb-1">
              Crear cuenta
            </h1>
            <p className="text-slate-500 text-xs font-light">
              Elige como quieres usar la plataforma
            </p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => setRole('cliente')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${role === 'cliente' ? 'bg-[#10B981] text-[#0A0E27]' : 'text-slate-400 hover:text-white'
                }`}
            >
              <User size={13} /> Panel cliente
            </button>
            <button
              type="button"
              onClick={() => setRole('asesor')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${role === 'asesor' ? 'bg-[#10B981] text-[#0A0E27]' : 'text-slate-400 hover:text-white'
                }`}
            >
              <Briefcase size={13} /> Panel asesor
            </button>
          </div>

          <div className="mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
            <p className="text-slate-400 text-[10px] leading-relaxed">
              {role === 'cliente'
                ? 'Como cliente podras buscar asesores, reservar sesiones y gestionar tus consultorias desde tu panel personal.'
                : 'Como asesor podras crear tu perfil profesional, definir tus servicios y recibir clientes a traves de la plataforma.'
              }
            </p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-[11px] font-bold uppercase tracking-wider">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimo 8 caracteres"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10B981] text-[#0A0E27] font-black py-4 rounded-xl uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 hover:bg-[#0ea371] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? <Loader2 size={16} className="animate-spin" />
                : `Crear cuenta ${role === 'asesor' ? 'de asesor' : 'de cliente'}`
              }
            </button>

            <p className="text-slate-600 text-[9px] text-center leading-relaxed">
              Al registrarte aceptas nuestros Terminos de servicio y Politica de privacidad
            </p>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs">
              Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#10B981] font-bold hover:opacity-80 transition-opacity">
                Inicia sesion aqui
              </Link>
            </p>
          </div>

          <div className="mt-4 pt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-400 text-[9px] font-bold uppercase tracking-wider transition-colors"
            >
              <ArrowLeft size={11} /> Volver al inicio
            </Link>
          </div>
        </GlassCard>

        <p className="text-center text-slate-600 text-[9px] uppercase tracking-widest mt-6">
          Axioma Ventures Intelligence C.A. 2026
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;