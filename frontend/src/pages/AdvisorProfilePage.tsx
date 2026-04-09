import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Shield, ArrowLeft, Calendar, CheckCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img src="/favicon.png" alt="Axioma" className="w-10 h-10 object-contain animate-pulse" />
          <p className="text-gray-400 text-[10px] uppercase tracking-widest">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!advisor) {
    return (
      <div className="min-h-screen bg-white pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 uppercase tracking-widest text-sm mb-4">Asesor no encontrado</p>
          <Link to="/asesores" className="text-[#10B981] text-sm font-semibold hover:underline">
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const name = advisor.profiles?.full_name || advisor.title || 'Asesor';
  const avatarUrl = advisor.profiles?.avatar_url || advisor.avatar_url;
  const color = COLORS[advisor.category] || '#0F4C35';
  const initials = getInitials(name);
  const hasRating = (advisor.total_reviews || 0) > 0;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">

        {/* Back */}
        <Link
          to="/asesores"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#0A0E27] text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Volver al catálogo
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ─── LEFT COLUMN ─── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Hero card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <div className="flex items-start gap-6">

                {/* Avatar */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0 overflow-hidden shadow-md"
                  style={{ backgroundColor: color }}
                >
                  {avatarUrl
                    ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                    : initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-[#0A0E27] mb-0.5">{name}</h1>
                      <p className="text-[#10B981] text-sm font-medium">{advisor.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{advisor.category}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${
                      advisor.available
                        ? 'bg-[#10B981]/10 text-[#10B981]'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${advisor.available ? 'bg-[#10B981]' : 'bg-gray-300'}`} />
                      {advisor.available ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    {hasRating && (
                      <div className="flex items-center gap-1.5">
                        <Star size={13} className="text-[#10B981] fill-[#10B981]" />
                        <span className="text-[#0A0E27] font-bold text-sm">{advisor.rating?.toFixed(1)}</span>
                        <span className="text-gray-400 text-xs">({advisor.total_reviews} reseñas)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Clock size={13} />
                      <span className="text-xs">{advisor.total_sessions || 0}+ sesiones</span>
                    </div>
                    {advisor.verified && (
                      <div className="flex items-center gap-1.5">
                        <Shield size={13} className="text-[#10B981]" />
                        <span className="text-xs text-[#10B981] font-medium">Verificado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            {advisor.bio && (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-500 mb-4">Acerca del asesor</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{advisor.bio}</p>
                <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
                  {[
                    { label: 'Experiencia', value: advisor.experience },
                    { label: 'Sesiones completadas', value: advisor.total_sessions ? `${advisor.total_sessions}+` : null },
                    { label: 'Idiomas', value: advisor.languages },
                  ].filter(item => item.value).map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                      <p className="text-[#0A0E27] text-sm font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialties */}
            {advisor.tags && advisor.tags.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-500 mb-5">Especialidades</h2>
                <div className="flex flex-wrap gap-2">
                  {advisor.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[11px] font-semibold px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg border border-gray-100"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-500 mb-6">Reseñas de clientes</h2>
              {reviews.length > 0 ? (
                <div className="space-y-5">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[11px] font-bold text-[#0A0E27] overflow-hidden">
                            {review.profiles?.avatar_url
                              ? <img src={review.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                              : (review.profiles?.full_name?.[0] || 'C')}
                          </div>
                          <span className="text-[#0A0E27] text-sm font-semibold">{review.profiles?.full_name || 'Cliente'}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: review.rating }).map((_, s) => (
                            <Star key={s} size={11} className="text-[#10B981] fill-[#10B981]" />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-500 text-sm leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">
                  Aún no hay reseñas. Sé el primero en trabajar con este asesor.
                </p>
              )}
            </div>

          </div>

          {/* ─── RIGHT COLUMN (sticky) ─── */}
          <div className="space-y-4 lg:sticky lg:top-28 lg:self-start">

            {/* Booking card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="text-[#0A0E27] font-bold text-base mb-1">Reservar sesión</h2>
              <p className="text-gray-400 text-xs mb-5 leading-relaxed">
                Elige el plan que mejor se adapte a tus necesidades.
              </p>

              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-gray-50">
                  <div>
                    <p className="text-[#0A0E27] text-xs font-bold">Sesión Inicial</p>
                    <p className="text-gray-400 text-[10px]">30 min</p>
                  </div>
                  <span className="text-[#0A0E27] font-black text-base">$19</span>
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#10B981]/20 bg-[#10B981]/5">
                  <div>
                    <p className="text-[#0A0E27] text-xs font-bold">Plan Completo</p>
                    <p className="text-gray-400 text-[10px]">4 × 60 min</p>
                  </div>
                  <span className="text-[#10B981] font-black text-base">$149</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!advisor.available}
                className="w-full bg-[#10B981] text-white font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-[#0ea371] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Calendar size={15} />
                {user ? 'Ver planes y reservar' : 'Inicia sesión para reservar'}
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-4">
                <CheckCircle size={12} className="text-gray-300" />
                <p className="text-gray-300 text-[10px]">Pago seguro procesado por Stripe</p>
              </div>
            </div>

            {/* Trust card */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                  <Shield size={15} className="text-[#10B981]" />
                </div>
                <div>
                  <p className="text-[#0A0E27] text-sm font-bold mb-1">Plataforma verificada</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Todos los asesores pasan por un proceso de verificación antes de aparecer en la plataforma.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorProfilePage;
