import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Shield, ArrowLeft, Calendar, MessageCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const COLORS: Record<string, string> = {
  'Finanzas': '#0F4C35',
  'Negocios': '#1A237E',
  'Datos & IA': '#4A148C',
  'Legal': '#B71C1C',
  'Marketing': '#E65100',
  'Tecnologia': '#006064',
  'Recursos Humanos': '#1B5E20',
  'Startups': '#880E4F',
};

const getInitials = (name: string) => {
  if (!name) return 'AX';
  const parts = name.split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const AdvisorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [advisor, setAdvisor] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchAdvisor();
  }, [id]);

  const fetchAdvisor = async () => {
    setLoading(true);
    const { data: advisorData } = await supabase
      .from('advisors')
      .select('*, profiles ( full_name, avatar_url, email )')
      .eq('id', id)
      .single();

    if (advisorData) {
      setAdvisor(advisorData);
      const { data: servicesData } = await supabase
        .from('services').select('*').eq('advisor_id', id).order('price', { ascending: true });
      setServices(servicesData || []);

      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*, profiles!reviews_client_id_fkey ( full_name, avatar_url )')
        .eq('advisor_id', id).order('created_at', { ascending: false }).limit(5);
      setReviews(reviewsData || []);
    }
    setLoading(false);
  };

  const handleBooking = () => {
    if (!user) { navigate('/login'); return; }
    if (advisor) navigate(`/planes/${advisor.id}/none`);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/favicon.png" alt="Axioma" className="w-10 h-10 object-contain animate-pulse"
            style={{ filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.4))' }} />
          <p className="text-slate-500 text-[10px] uppercase tracking-widest animate-pulse">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!advisor) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 uppercase tracking-widest text-sm mb-4">Asesor no encontrado</p>
          <Link to="/asesores" className="text-[#10B981] text-[11px] font-bold uppercase tracking-wider">
            Volver al catalogo
          </Link>
        </div>
      </div>
    );
  }

  const name = advisor.profiles?.full_name || advisor.title || 'Asesor';
  const avatarUrl = advisor.profiles?.avatar_url || advisor.avatar_url;
  const color = COLORS[advisor.category] || '#0F4C35';
  const initials = getInitials(name);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        <Link to="/asesores" className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-[11px] font-bold uppercase tracking-wider mb-8 transition-colors">
          <ArrowLeft size={14} /> Volver al catalogo
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            <GlassCard className="p-8 border-white/5">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: color }}>
                  {avatarUrl ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">{name}</h1>
                      <p className="text-[#10B981] text-sm font-medium">{advisor.title}</p>
                      <p className="text-slate-500 text-xs mt-1">{advisor.category}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${advisor.available ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                      {advisor.available ? 'Disponible hoy' : 'No disponible'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="text-[#10B981] fill-[#10B981]" />
                      <span className="text-white font-bold text-sm">{advisor.rating?.toFixed(1) || '5.0'}</span>
                      <span className="text-slate-500 text-xs">({advisor.total_reviews || 0} resenas)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock size={13} />
                      <span className="text-xs">{advisor.total_sessions || 0}+ sesiones</span>
                    </div>
                    {advisor.verified && (
                      <div className="flex items-center gap-1.5">
                        <Shield size={13} className="text-[#10B981]" />
                        <span className="text-xs text-[#10B981]">Verificado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </GlassCard>

            {advisor.bio && (
              <GlassCard className="p-8 border-white/5">
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] mb-4">Acerca del asesor</h2>
                <p className="text-slate-300 text-sm leading-relaxed font-light">{advisor.bio}</p>
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                  {[
                    { label: 'Experiencia', value: advisor.experience },
                    { label: 'Sesiones', value: `${advisor.total_sessions || 0}+` },
                    { label: 'Idiomas', value: advisor.languages },
                  ].filter(item => item.value).map((item) => (
                    <div key={item.label}>
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">{item.label}</p>
                      <p className="text-white text-xs font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {advisor.tags && advisor.tags.length > 0 && (
              <GlassCard className="p-8 border-white/5">
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] mb-5">Especialidades</h2>
                <div className="flex flex-wrap gap-2">
                  {advisor.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-white/5 text-slate-300 rounded-lg border border-white/5">{tag}</span>
                  ))}
                </div>
              </GlassCard>
            )}

            {services.length > 0 && (
              <GlassCard className="p-8 border-white/5">
                <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] mb-5">
                  Planes disponibles
                </h2>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white text-sm font-bold mb-1">Sesión Inicial</p>
                        <p className="text-slate-500 text-[10px] leading-relaxed">
                          30 minutos con el asesor. Diagnóstico inicial y plan de acción básico.
                        </p>
                      </div>
                      <span className="text-blue-400 font-black text-lg flex-shrink-0">$19</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-[#10B981]/30 bg-[#10B981]/5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-white text-sm font-bold mb-1">Plan Completo</p>
                        <p className="text-slate-500 text-[10px] leading-relaxed">
                          4 sesiones de 60 min. Estrategia personalizada, chat directo por 30 días y seguimiento mensual.
                        </p>
                      </div>
                      <span className="text-[#10B981] font-black text-lg flex-shrink-0">$149</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-[9px] uppercase tracking-wider mt-4 text-center">
                  Todos los planes incluyen acceso completo a las herramientas de la plataforma
                </p>
              </GlassCard>
            )}

            <GlassCard className="p-8 border-white/5">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] mb-6">Resenas de clientes</h2>
              {reviews.length > 0 ? (
                <div className="space-y-5">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-5 border-b border-white/5 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                            {review.profiles?.avatar_url
                              ? <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                              : review.profiles?.full_name?.[0] || 'C'}
                          </div>
                          <span className="text-white text-xs font-bold">{review.profiles?.full_name || 'Cliente'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, s) => (
                            <Star key={s} size={10} className="text-[#10B981] fill-[#10B981]" />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-slate-400 text-xs leading-relaxed font-light">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm font-light text-center py-4">
                  Aun no hay resenas. Se el primero en calificar a este asesor.
                </p>
              )}
            </GlassCard>

          </div>

          <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <GlassCard className="p-6 border-[#10B981]/10">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] mb-2">Reservar sesion</h2>
              <p className="text-slate-500 text-[11px] mb-5 leading-relaxed">
                Elige entre una sesion inicial de prueba o el plan completo con acceso total.
              </p>
              <div className="space-y-3 mb-6">
                <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-white text-xs font-bold">Sesion Inicial</p>
                    <span className="text-white font-bold text-sm">$19</span>
                  </div>
                  <p className="text-slate-500 text-[10px]">30 min - Conoce al asesor</p>
                </div>
                <div className="p-4 rounded-xl border border-[#10B981]/30 bg-[#10B981]/5">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-white text-xs font-bold">Plan Completo</p>
                    <span className="text-white font-bold text-sm">$149</span>
                  </div>
                  <p className="text-slate-500 text-[10px]">4 sesiones de 60 min - Acceso total</p>
                </div>
              </div>
              <button onClick={handleBooking} disabled={!advisor.available}
                className="w-full bg-[#10B981] text-[#0A0E27] font-black py-4 rounded-xl uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 hover:bg-[#0ea371] transition-all mb-3 disabled:opacity-50 disabled:cursor-not-allowed">
                <Calendar size={14} />
                {user ? 'Ver planes y reservar' : 'Inicia sesion para reservar'}
              </button>
              <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                <MessageCircle size={14} />
                Enviar mensaje
              </button>
              <p className="text-center text-slate-600 text-[9px] uppercase tracking-wider mt-4">
                Pago seguro procesado por Stripe
              </p>
            </GlassCard>

            <GlassCard className="p-5 border-white/5">
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-bold mb-1">Plataforma verificada</p>
                  <p className="text-slate-500 text-[10px] leading-relaxed font-light">
                    Todos los asesores pasan por un proceso de verificacion antes de aparecer en la plataforma.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdvisorProfilePage;