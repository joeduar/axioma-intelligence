import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Star, Search, ChevronRight, CheckCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import DashboardHeader from '../components/DashboardHeader';
import DashboardFooter from '../components/DashboardFooter';
import AvatarUpload from '../components/AvatarUpload';

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'inicio' | 'sesiones' | 'explorar' | 'perfil'>('inicio');
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    const { data } = await supabase
      .from('sessions')
      .select(`
        *,
        advisors (
          *,
          profiles ( full_name )
        ),
        services ( name, price, duration )
      `)
      .eq('client_id', user?.id)
      .order('created_at', { ascending: false });

    setSessions(data || []);
    setLoadingSessions(false);
  };

  const upcomingSessions = sessions.filter(s =>
    s.status === 'confirmada' || s.status === 'pendiente'
  );
  const pastSessions = sessions.filter(s => s.status === 'completada');
  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white flex flex-col">

      <DashboardHeader
        role="cliente"
        onSettingsClick={() => setActiveTab('perfil')}
      />

      <div className="max-w-6xl mx-auto px-6 py-8 w-full flex-grow">

        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit mb-8 border border-white/5">
          {[
            { id: 'inicio', label: 'Inicio' },
            { id: 'sesiones', label: 'Mis sesiones' },
            { id: 'explorar', label: 'Explorar asesores' },
            { id: 'perfil', label: 'Mi perfil' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                ? 'bg-[#10B981] text-[#0A0E27]'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'inicio' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-light text-white uppercase tracking-tight">
                Bienvenido, {firstName}
              </h1>
              <p className="text-slate-500 text-sm font-light mt-1">
                {upcomingSessions.length > 0
                  ? `Tienes ${upcomingSessions.length} sesion${upcomingSessions.length > 1 ? 'es' : ''} proxima${upcomingSessions.length > 1 ? 's' : ''}`
                  : 'No tienes sesiones proximas'
                }
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Sesiones totales', value: String(sessions.length), icon: Calendar },
                { label: 'Completadas', value: String(pastSessions.length), icon: CheckCircle },
                { label: 'Pendientes', value: String(upcomingSessions.length), icon: Clock },
                { label: 'Asesores', value: String(new Set(sessions.map(s => s.advisor_id)).size), icon: Star },
              ].map((stat, i) => (
                <GlassCard key={i} className="p-5 border-white/5">
                  <stat.icon size={16} className="text-[#10B981] mb-3" />
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">{stat.label}</p>
                </GlassCard>
              ))}
            </div>

            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#10B981] mb-4">
                Proximas sesiones
              </h2>
              {loadingSessions ? (
                <GlassCard className="p-8 border-white/5 text-center">
                  <p className="text-slate-500 text-sm animate-pulse">Cargando sesiones...</p>
                </GlassCard>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <GlassCard key={session.id} className="p-5 border-white/5">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] font-black text-sm flex-shrink-0">
                            {session.advisors?.profiles?.full_name?.[0] || 'A'}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">
                              {session.advisors?.profiles?.full_name || 'Asesor'}
                            </p>
                            <p className="text-slate-500 text-[10px]">{session.services?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${session.status === 'confirmada'
                            ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                            {session.status}
                          </span>
                          <span className="text-white font-bold text-sm">${session.price}</span>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <GlassCard className="p-8 border-white/5 text-center">
                  <Calendar size={28} className="text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-light mb-4">No tienes sesiones proximas</p>
                  <Link
                    to="/asesores"
                    className="inline-flex items-center gap-2 bg-[#10B981] text-[#0A0E27] font-black px-5 py-2.5 rounded-full text-[10px] uppercase tracking-wider hover:bg-[#0ea371] transition-all"
                  >
                    Reservar primera sesion
                  </Link>
                </GlassCard>
              )}
            </div>

            <GlassCard className="p-6 border-[#10B981]/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-white font-bold text-sm mb-1">Encuentra tu proximo asesor</p>
                  <p className="text-slate-500 text-xs font-light">Mas de 200 expertos verificados disponibles</p>
                </div>
                <Link
                  to="/asesores"
                  className="flex items-center gap-2 bg-[#10B981] text-[#0A0E27] font-black px-5 py-2.5 rounded-full text-[10px] uppercase tracking-wider hover:bg-[#0ea371] transition-all"
                >
                  Explorar asesores <ChevronRight size={13} />
                </Link>
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'sesiones' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-light text-white uppercase tracking-tight">
              Mis sesiones
            </h1>
            {loadingSessions ? (
              <GlassCard className="p-8 border-white/5 text-center">
                <p className="text-slate-500 text-sm animate-pulse">Cargando sesiones...</p>
              </GlassCard>
            ) : sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <GlassCard key={session.id} className="p-5 border-white/5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                          {session.advisors?.profiles?.full_name?.[0] || 'A'}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">
                            {session.advisors?.profiles?.full_name || 'Asesor'}
                          </p>
                          <p className="text-slate-500 text-[10px]">{session.services?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${session.status === 'completada'
                          ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                          : session.status === 'confirmada'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : session.status === 'pendiente'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                          {session.status}
                        </span>
                        <span className="text-white font-bold text-sm">${session.price}</span>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 border-white/5 text-center">
                <Calendar size={32} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-sm font-light mb-5">
                  Aun no tienes sesiones registradas
                </p>
                <Link
                  to="/asesores"
                  className="inline-flex items-center gap-2 bg-[#10B981] text-[#0A0E27] font-black px-6 py-3 rounded-full text-[10px] uppercase tracking-wider hover:bg-[#0ea371] transition-all"
                >
                  Explorar asesores <ChevronRight size={13} />
                </Link>
              </GlassCard>
            )}
          </div>
        )}

        {activeTab === 'explorar' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-light text-white uppercase tracking-tight">
              Explorar asesores
            </h1>
            <GlassCard className="p-8 border-white/5 text-center">
              <Search size={32} className="text-[#10B981] mx-auto mb-4 opacity-50" />
              <p className="text-slate-400 text-sm mb-5 font-light">
                Encuentra el asesor perfecto para tu necesidad
              </p>
              <Link
                to="/asesores"
                className="inline-flex items-center gap-2 bg-[#10B981] text-[#0A0E27] font-black px-6 py-3 rounded-full text-[10px] uppercase tracking-wider hover:bg-[#0ea371] transition-all"
              >
                Ir al catalogo completo <ChevronRight size={13} />
              </Link>
            </GlassCard>
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-light text-white uppercase tracking-tight">
                Mi perfil
              </h1>
              <p className="text-slate-500 text-sm font-light mt-1">
                Gestiona tu informacion personal
              </p>
            </div>

            <GlassCard className="p-8 border-white/5">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <AvatarUpload
                  currentUrl={profile?.avatar_url}
                  onUploadComplete={(url) => {}}
                  size="lg"
                />
                <div className="text-center md:text-left">
                  <p className="text-white font-bold text-lg">{profile?.full_name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{profile?.email}</p>
                  <span className="inline-block mt-2 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    Cliente
                  </span>
                  <p className="text-slate-600 text-[10px] mt-2 font-light">
                    Tu foto es visible para los asesores con quienes tengas sesiones
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

      </div>

      <DashboardFooter />

    </div>
  );
};

export default ClientDashboard;
