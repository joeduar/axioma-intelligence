import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError('Credenciales incorrectas. Verifica tu email y contrasena.');
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('email', email)
        .single();

      if (data?.role === 'asesor') {
        navigate('/dashboard/asesor');
      } else {
        navigate('/dashboard/cliente');
      }

    } catch (err) {
      setError('Ocurrio un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center px-6 relative overflow-hidden">
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
              Bienvenido de vuelta
            </h1>
            <p className="text-slate-500 text-xs font-light">
              Ingresa a tu cuenta para continuar
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
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-[10px] text-slate-500 hover:text-[#10B981] transition-colors uppercase tracking-wider font-bold">
                Olvide mi contraseña
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10B981] text-[#0A0E27] font-black py-4 rounded-xl uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 hover:bg-[#0ea371] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Ingresar a mi cuenta'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-500 text-xs">
              No tienes cuenta?{' '}
              <Link to="/registro" className="text-[#10B981] font-bold hover:opacity-80 transition-opacity">
                Registrate aqui
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

export default LoginPage;