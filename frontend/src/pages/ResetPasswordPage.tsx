import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Supabase envía el token en el hash de la URL: #access_token=...&type=recovery
  useEffect(() => {
    const hash = window.location.hash;

    // Detectar error en la URL (link expirado)
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const desc = params.get('error_description') || 'El enlace no es válido o expiró.';
      setError(decodeURIComponent(desc.replace(/\+/g, ' ')));
      return;
    }

    // Supabase v2: escucha el evento PASSWORD_RECOVERY automáticamente
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setSessionReady(true);
      }
    });

    // También intentar leer el token del hash manualmente
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token') || '';
      if (accessToken) {
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          .then(({ error: e }) => {
            if (!e) setSessionReady(true);
            else setError('El enlace expiró. Solicita uno nuevo.');
          });
      }
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || 'Error al actualizar la contraseña.');
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();

  const strengthLabel = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'][strength];
  const strengthColor = ['', 'bg-red-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'][strength];

  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(16,185,129,0.07), transparent 60%)' }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-10">
          <img src="/favicon.png" alt="Axioma" className="w-12 h-12 object-contain"
            style={{ filter: 'drop-shadow(0 0 14px rgba(16,185,129,0.4))' }} />
          <div className="text-center">
            <p className="text-white font-black tracking-[0.2em] uppercase text-lg leading-none">AXIOMA</p>
            <p className="text-[#10B981] text-[8px] font-bold tracking-[0.4em] uppercase mt-0.5">
              VENTURES INTELLIGENCE
            </p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8">

          {/* ── SUCCESS ── */}
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <h1 className="text-white text-xl font-bold">¡Contraseña actualizada!</h1>
              <p className="text-white/40 text-sm leading-relaxed">
                Tu contraseña fue cambiada correctamente. Redirigiendo al login...
              </p>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full animate-pulse" style={{ width: '100%' }} />
              </div>
            </div>

          ) : error && !sessionReady ? (
            /* ── ERROR: link expirado ── */
            <div className="text-center space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <AlertCircle size={28} className="text-red-400" />
              </div>
              <div>
                <h1 className="text-white text-xl font-bold mb-2">Enlace inválido</h1>
                <p className="text-white/40 text-sm leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-[#10B981] text-[#0A0E27] font-bold py-3.5 rounded-xl text-sm hover:bg-[#0ea371] transition-all"
              >
                Solicitar nuevo enlace
              </button>
            </div>

          ) : (
            /* ── FORM ── */
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mb-4">
                  <Lock size={22} className="text-[#10B981]" />
                </div>
                <h1 className="text-white text-xl font-bold">Nueva contraseña</h1>
                <p className="text-white/40 text-sm mt-1.5">
                  Elige una contraseña segura para tu cuenta.
                </p>
              </div>

              {!sessionReady && (
                <div className="flex items-center gap-3 mb-5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <Loader2 size={15} className="text-amber-400 animate-spin shrink-0" />
                  <p className="text-xs text-amber-400">Verificando enlace...</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      disabled={!sessionReady}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#10B981] transition-colors disabled:opacity-40"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`flex-1 h-1 rounded-full transition-all ${i <= strength ? strengthColor : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <p className={`text-[10px] font-medium ${['', 'text-red-400', 'text-amber-400', 'text-blue-400', 'text-emerald-400'][strength]}`}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5">Confirmar contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repite la contraseña"
                      disabled={!sessionReady}
                      className={`w-full bg-white/5 border rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-white/20 focus:outline-none transition-colors disabled:opacity-40 ${
                        confirm && password !== confirm
                          ? 'border-red-500/50 focus:border-red-500'
                          : confirm && password === confirm
                            ? 'border-emerald-500/50 focus:border-emerald-500'
                            : 'border-white/10 focus:border-[#10B981]'
                      }`}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    {confirm && password === confirm && (
                      <CheckCircle size={14} className="absolute right-9 top-1/2 -translate-y-1/2 text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* Error */}
                {error && sessionReady && (
                  <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !sessionReady || !password || !confirm}
                  className="w-full bg-[#10B981] text-[#0A0E27] font-bold py-3.5 rounded-xl text-sm hover:bg-[#0ea371] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Guardando...</> : 'Cambiar contraseña'}
                </button>

                <button type="button" onClick={() => navigate('/login')}
                  className="w-full flex items-center justify-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors py-2">
                  <ArrowLeft size={13} /> Volver al login
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-white/15 text-xs text-center mt-8">© 2026 Axioma Ventures Intelligence C.A.</p>
      </div>
    </div>
  );
}
