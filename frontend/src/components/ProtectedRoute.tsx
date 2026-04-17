import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, RefreshCw, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// ─── PANTALLA DE CONFIRMACIÓN DE EMAIL (solo asesores) ────
const EmailConfirmGate = ({ email }: { email: string }) => {
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    await supabase.auth.resend({ type: 'signup', email });
    setResent(true);
    setResending(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 40%, rgba(16,185,129,0.06), transparent 60%)' }}
      />

      <div className="relative z-10 w-full max-w-sm text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-10">
          <img
            src="/favicon.png" alt="Axioma" className="w-12 h-12 object-contain"
            style={{ filter: 'drop-shadow(0 0 14px rgba(16,185,129,0.4))' }}
          />
          <div>
            <p className="text-white font-black tracking-[0.2em] uppercase text-lg leading-none">AXIOMA</p>
            <p className="text-[#10B981] text-[8px] font-bold tracking-[0.4em] uppercase mt-0.5">
              VENTURES INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Ícono */}
        <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-6">
          <Mail size={28} className="text-[#10B981]" />
        </div>

        <h1 className="text-white text-xl font-bold tracking-wide mb-3">
          Confirma tu correo electrónico
        </h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          Para acceder a tu dashboard de asesor debes confirmar tu cuenta.
          Enviamos un enlace de activación a{' '}
          <span className="text-white/70 font-medium">{email}</span>.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 bg-[#10B981] text-[#0A0E27] font-bold py-3.5 rounded-xl text-sm hover:bg-[#0ea371] transition-all"
          >
            <RefreshCw size={15} /> Ya confirmé mi correo
          </button>

          {resent ? (
            <div className="flex items-center justify-center gap-2 text-[#10B981] text-sm py-3">
              <CheckCircle size={14} /> Correo reenviado correctamente
            </div>
          ) : (
            <button
              onClick={handleResend} disabled={resending}
              className="w-full flex items-center justify-center gap-2 border border-white/15 text-white/60 font-medium py-3 rounded-xl text-sm hover:border-white/30 hover:text-white/80 transition-all disabled:opacity-50"
            >
              {resending
                ? <><Loader2 size={14} className="animate-spin" /> Reenviando...</>
                : 'Reenviar correo de confirmación'
              }
            </button>
          )}
        </div>

        <p className="text-white/15 text-xs mt-10">© 2026 Axioma Ventures Intelligence C.A.</p>
      </div>
    </div>
  );
};

// ─── PROTECTED ROUTE ──────────────────────────────────────
interface Props {
  children: React.ReactNode;
  role?: 'cliente' | 'asesor' | 'admin';
}

const ProtectedRoute: React.FC<Props> = ({ children, role }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/favicon.png" alt="Axioma"
            className="w-10 h-10 object-contain animate-pulse"
            style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.4))' }}
          />
          <div className="w-32 h-px bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full"
              style={{ animation: 'loadprogress 1.5s ease-in-out infinite' }}
            />
          </div>
        </div>
        <style>{`
          @keyframes loadprogress {
            0% { width: 0%; }
            50% { width: 100%; }
            100% { width: 0%; }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario existe pero el perfil aún no cargó, esperar
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/favicon.png" alt="Axioma" className="w-10 h-10 object-contain animate-pulse"
            style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.4))' }} />
        </div>
      </div>
    );
  }

  // Admin role: check is_admin flag
  if (role === 'admin') {
    if (!profile?.is_admin) {
      // Redirect to their dashboard if not admin
      if (profile?.role === 'asesor') return <Navigate to="/dashboard/asesor" replace />;
      return <Navigate to="/dashboard/cliente" replace />;
    }
    return <>{children}</>;
  }

  // Bloquear asesores que no han confirmado su email
  if (role === 'asesor' && !user.email_confirmed_at) {
    return <EmailConfirmGate email={user.email || ''} />;
  }

  if (role && profile?.role !== role) {
    // Admins can access any protected route
    if (profile?.is_admin) return <>{children}</>;
    if (profile?.role === 'asesor') {
      return <Navigate to="/dashboard/asesor" replace />;
    }
    return <Navigate to="/dashboard/cliente" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
