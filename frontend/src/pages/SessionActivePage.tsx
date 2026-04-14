import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Star, Clock, Shield, MessageCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

type Phase = 'loading' | 'active' | 'confirm1' | 'confirm2' | 'review' | 'complete' | 'error';

const SessionActivePage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [session, setSession] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Review state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // ── Restorestart time from localStorage ──────────────────
  useEffect(() => {
    if (!sessionId) return;
    const stored = localStorage.getItem(`session_start_${sessionId}`);
    if (stored) {
      setStartTime(parseInt(stored));
    } else {
      const now = Date.now();
      localStorage.setItem(`session_start_${sessionId}`, String(now));
      setStartTime(now);
    }
  }, [sessionId]);

  // ── Timer ────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'active') return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, startTime]);

  // ── Prevent accidental navigation ────────────────────────
  useEffect(() => {
    if (!['active', 'confirm1', 'confirm2'].includes(phase)) return;
    const handle = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '¿Estás seguro? La sesión de asesoría está en progreso.';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handle);
    return () => window.removeEventListener('beforeunload', handle);
  }, [phase]);

  // ── Fetch session ────────────────────────────────────────
  useEffect(() => {
    if (sessionId && user) fetchSession();
  }, [sessionId, user]);

  const fetchSession = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*, advisors(id, user_id, title, category, profiles(full_name, avatar_url))')
      .eq('id', sessionId)
      .eq('client_id', user!.id)
      .single();

    if (error || !data) { setPhase('error'); return; }

    if (data.status === 'completada') {
      // Ya completada: ir al dashboard
      navigate('/dashboard/cliente');
      return;
    }

    setSession(data);
    setPhase('active');
  };

  const fmt = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const finishSession = async (skipReview = false) => {
    if (!session) return;
    setSubmittingReview(true);

    // Marcar como completada
    await supabase.from('sessions').update({ status: 'completada' }).eq('id', session.id);

    // Insertar reseña si hay rating
    if (!skipReview && rating > 0) {
      try {
        await supabase.from('reviews').insert({
          session_id: session.id,
          client_id: user!.id,
          advisor_id: session.advisor_id,
          rating,
          comment: comment.trim() || null,
        });
        // Actualizar rating del asesor (promedio simple)
        const { data: allReviews } = await supabase
          .from('reviews').select('rating').eq('advisor_id', session.advisor_id);
        if (allReviews && allReviews.length > 0) {
          const avg = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;
          await supabase.from('advisors').update({
            rating: Math.round(avg * 10) / 10,
            total_reviews: allReviews.length,
          }).eq('id', session.advisor_id);
        }
      } catch (_) {}
    }

    // Notificar al asesor
    try {
      await supabase.from('notifications').insert({
        user_id: session.advisors?.user_id,
        title: '¡Sesión completada!',
        message: `${profile?.full_name || 'Tu cliente'} marcó la sesión como completada${rating > 0 ? ` y dejó ${rating}★` : ''}.`,
        type: 'session_completed',
        read: false,
      });
    } catch (_) {}

    // Limpiar localStorage
    localStorage.removeItem(`session_start_${sessionId}`);
    setSubmittingReview(false);
    setPhase('complete');
  };

  // ── HELPERS ──────────────────────────────────────────────
  const advisorName = session?.advisors?.profiles?.full_name || 'Asesor';
  const advisorTitle = session?.advisors?.title || session?.advisors?.category || '';
  const advisorAvatar = session?.advisors?.profiles?.avatar_url;

  // ─────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/favicon.png" alt="Axioma" className="w-10 h-10 object-contain animate-pulse"
            style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.4))' }} />
          <div className="w-32 h-px bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-[#10B981] rounded-full"
              style={{ animation: 'loadprogress 1.5s ease-in-out infinite' }} />
          </div>
        </div>
        <style>{`@keyframes loadprogress { 0%{width:0%} 50%{width:100%} 100%{width:0%} }`}</style>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // ERROR
  // ─────────────────────────────────────────────────────────
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center text-center px-6">
        <div>
          <X size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-white font-bold mb-2">Sesión no encontrada</p>
          <p className="text-white/40 text-sm mb-6">No tienes acceso a esta sesión o no existe.</p>
          <button onClick={() => navigate('/dashboard/cliente')}
            className="text-[#10B981] text-sm hover:underline">
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // PHASE: ACTIVE — Sesión en curso
  // ─────────────────────────────────────────────────────────
  if (phase === 'active') {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex flex-col select-none">

        {/* TOP BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src="/favicon.png" alt="" className="w-7 h-7 object-contain"
              style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' }} />
            <div>
              <p className="text-white font-black text-sm tracking-tight leading-none">AXIOMA</p>
              <p className="text-[#10B981] text-[8px] font-bold tracking-[0.35em] uppercase mt-0.5">SESIÓN EN CURSO</p>
            </div>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-white font-mono text-sm font-bold tracking-wider">{fmt(elapsed)}</span>
          </div>
        </div>

        {/* MAIN */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-md space-y-5">

            {/* Advisor card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center font-bold text-[#10B981] text-xl overflow-hidden flex-shrink-0">
                  {advisorAvatar
                    ? <img src={advisorAvatar} alt="" className="w-full h-full object-cover" />
                    : advisorName[0]
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold truncate">{advisorName}</p>
                  <p className="text-white/40 text-xs truncate">{advisorTitle}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                    <span className="text-[#10B981] text-[10px] font-semibold">Sesión activa</span>
                  </div>
                </div>
              </div>

              {session?.topic && (
                <div className="border-t border-white/10 pt-4 mt-2">
                  <p className="text-white/25 text-[10px] uppercase tracking-wider mb-1">Tema de la sesión</p>
                  <p className="text-white/80 text-sm leading-relaxed">{session.topic}</p>
                </div>
              )}

              {session?.scheduled_at && (
                <div className="flex items-center gap-2 mt-3">
                  <Clock size={12} className="text-white/25 flex-shrink-0" />
                  <p className="text-white/35 text-xs">
                    {new Date(session.scheduled_at).toLocaleDateString('es-ES', {
                      weekday: 'long', day: 'numeric', month: 'long',
                    })} · {new Date(session.scheduled_at).toLocaleTimeString('es-ES', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="bg-[#10B981]/5 border border-[#10B981]/15 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Shield size={15} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                <p className="text-white/45 text-xs leading-relaxed">
                  Tu sesión está en progreso. Coordina el contacto con tu asesor por el canal acordado.
                  Al terminar, presiona "Finalizar asesoría" para cerrar la sesión y dejar tu valoración.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/cliente')}
                className="w-full flex items-center justify-center gap-2 border border-white/10 text-white/50 font-semibold py-3 rounded-xl text-sm hover:border-white/25 hover:text-white/70 transition-all"
              >
                <MessageCircle size={14} /> Ir al chat con el asesor
              </button>
              <button
                onClick={() => setPhase('confirm1')}
                className="w-full bg-[#10B981] text-[#0A0E27] font-black py-4 rounded-xl text-sm hover:bg-[#0ea371] transition-all"
              >
                Finalizar asesoría
              </button>
            </div>

            <p className="text-center text-white/15 text-[10px] px-4">
              Sesión protegida. No cierres ni recargues esta página mientras la asesoría está en curso.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // PHASE: CONFIRM 1 — ¿Completada satisfactoriamente?
  // ─────────────────────────────────────────────────────────
  if (phase === 'confirm1') {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">

          <div className="w-16 h-16 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={28} className="text-[#10B981]" />
          </div>

          <h2 className="text-white text-2xl font-black mb-3">¿Asesoría completada satisfactoriamente?</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10">
            Confirma que la asesoría con{' '}
            <span className="text-white/70 font-semibold">{advisorName}</span>{' '}
            fue completada de forma exitosa antes de continuar.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setPhase('confirm2')}
              className="w-full bg-[#10B981] text-[#0A0E27] font-black py-4 rounded-xl text-sm hover:bg-[#0ea371] transition-all"
            >
              Sí, fue completada exitosamente
            </button>
            <button
              onClick={() => setPhase('active')}
              className="w-full border border-white/10 text-white/50 font-semibold py-3 rounded-xl text-sm hover:border-white/25 hover:text-white/70 transition-all"
            >
              Aún no — volver a la sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // PHASE: CONFIRM 2 — Confirmación final
  // ─────────────────────────────────────────────────────────
  if (phase === 'confirm2') {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">

          <p className="text-white/25 text-[10px] uppercase tracking-[0.3em] mb-8">Confirmación final</p>
          <h2 className="text-white text-2xl font-black mb-3">¿Estás seguro?</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            Al confirmar, la sesión quedará registrada como completada y podrás dejar tu valoración sobre la asesoría recibida.
          </p>

          {/* Resumen de sesión */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 text-left">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] font-bold text-lg overflow-hidden flex-shrink-0">
                {advisorAvatar
                  ? <img src={advisorAvatar} alt="" className="w-full h-full object-cover" />
                  : advisorName[0]
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold truncate">{advisorName}</p>
                {session?.topic && <p className="text-white/40 text-xs mt-0.5 truncate">{session.topic}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[#10B981] font-mono font-bold text-sm">{fmt(elapsed)}</p>
                <p className="text-white/25 text-[10px]">duración</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setPhase('review')}
              className="w-full bg-[#10B981] text-[#0A0E27] font-black py-4 rounded-xl text-sm hover:bg-[#0ea371] transition-all"
            >
              Confirmar y dejar valoración
            </button>
            <button
              onClick={() => setPhase('confirm1')}
              className="w-full border border-white/10 text-white/50 font-semibold py-3 rounded-xl text-sm hover:border-white/25 hover:text-white/70 transition-all"
            >
              Volver atrás
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // PHASE: REVIEW — Valoración
  // ─────────────────────────────────────────────────────────
  if (phase === 'review') {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">

          {/* Asesor */}
          <div className="text-center mb-8">
            <div className="w-18 h-18 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5 overflow-hidden"
              style={{ width: '72px', height: '72px' }}>
              {advisorAvatar
                ? <img src={advisorAvatar} alt="" className="w-full h-full object-cover" />
                : <span className="text-white font-bold text-2xl">{advisorName[0]}</span>
              }
            </div>
            <h2 className="text-white text-xl font-black mb-2">¿Cómo fue tu experiencia?</h2>
            <p className="text-white/35 text-sm">Con <span className="text-white/60">{advisorName}</span></p>
            <p className="text-white/25 text-xs mt-1">Tu reseña ayuda a otros clientes a elegir a su asesor ideal</p>
          </div>

          {/* Estrellas */}
          <div className="flex justify-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110 active:scale-95"
              >
                <Star
                  size={40}
                  className={`transition-colors duration-100 ${
                    star <= (hoverRating || rating)
                      ? 'text-[#10B981] fill-[#10B981]'
                      : 'text-white/15'
                  }`}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <p className="text-center text-white/40 text-sm mb-5">
              {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', '¡Excelente!'][rating]}
            </p>
          )}

          {/* Comentario */}
          <div className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Comparte tu experiencia con este asesor (opcional)..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-white/20 focus:border-[#10B981]/40 focus:ring-1 focus:ring-[#10B981]/20 outline-none resize-none transition-all"
            />
          </div>

          <div className="space-y-3">
            <button
              onClick={() => finishSession(false)}
              disabled={submittingReview || rating === 0}
              className="w-full bg-[#10B981] text-[#0A0E27] font-black py-4 rounded-xl text-sm hover:bg-[#0ea371] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submittingReview
                ? <><div className="w-4 h-4 border-2 border-[#0A0E27]/30 border-t-[#0A0E27] rounded-full animate-spin" />Guardando...</>
                : <><Star size={15} /> Enviar valoración y finalizar</>
              }
            </button>
            <button
              onClick={() => finishSession(true)}
              disabled={submittingReview}
              className="w-full text-white/25 text-xs font-medium py-2 hover:text-white/45 transition-all disabled:opacity-40"
            >
              Omitir valoración y finalizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // PHASE: COMPLETE — Asesoría registrada
  // ─────────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">

          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full bg-[#10B981]/15 animate-ping" />
            <div className="relative w-full h-full rounded-full bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center">
              <CheckCircle size={36} className="text-[#10B981]" />
            </div>
          </div>

          <h2 className="text-white text-2xl font-black mb-3">¡Asesoría completada!</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-10">
            Tu sesión con{' '}
            <span className="text-white/70 font-semibold">{advisorName}</span>{' '}
            ha sido registrada exitosamente. Tu dashboard ha sido actualizado con las nuevas métricas.
          </p>

          {/* Resumen */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-[#10B981] font-mono font-black text-lg leading-none mb-1">{fmt(elapsed)}</p>
                <p className="text-white/25 text-[10px]">Duración</p>
              </div>
              <div className="text-center border-x border-white/10">
                <div className="flex items-center justify-center gap-0.5 mb-1">
                  {rating > 0
                    ? Array.from({ length: rating }).map((_, i) => (
                        <Star key={i} size={12} className="text-[#10B981] fill-[#10B981]" />
                      ))
                    : <span className="text-white/25 text-sm">—</span>
                  }
                </div>
                <p className="text-white/25 text-[10px]">Valoración</p>
              </div>
              <div className="text-center">
                <p className="text-[#10B981] font-black text-lg leading-none mb-1">✓</p>
                <p className="text-white/25 text-[10px]">Completada</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard/cliente')}
            className="w-full bg-white text-[#0A0E27] font-black py-4 rounded-xl text-sm hover:bg-white/90 transition-all"
          >
            Ir al dashboard principal
          </button>

          <p className="text-white/10 text-[10px] mt-8">© 2026 Axioma Ventures Intelligence C.A.</p>
        </div>
      </div>
    );
  }

  return null;
};

export default SessionActivePage;
