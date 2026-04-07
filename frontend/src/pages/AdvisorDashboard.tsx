import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, DollarSign, Star, Users, LogOut,
  Bell, Settings, ChevronRight, CheckCircle, Clock
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const AdvisorDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'inicio' | 'solicitudes' | 'sesiones' | 'perfil'>('inicio');
  const [advisorData, setAdvisorData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form perfil
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formRate, setFormRate] = useState('');
  const [formExperience, setFormExperience] = useState('');
  const [formLanguages, setFormLanguages] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAdvisorData();
      fetchSessions();
    }
  }, [user]);

  const fetchAdvisorData = async () => {
    const { data } = await supabase
      .from('advisors')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (data) {
      setAdvisorData(data);
      setFormTitle(data.title || '');
      setFormCategory(data.category || '');
      setFormBio(data.bio || '');
      setFormRate(data.rate?.toString() || '');
      setFormExperience(data.experience || '');
      setFormLanguages(data.languages || '');
    }
    setLoading(false);
  };

  const fetchSessions = async () => {
    const { data: advisorRow } = await supabase
      .from('advisors')
      .select('id')
      .eq('user_id', user?.id)
      .single();

    if (!advisorRow) return;

    const { data } = await supabase
      .from('sessions')
      .select(`
        *,
        profiles!sessions_client_id_fkey ( full_name, email ),
        services ( name, price, duration )
      `)
      .eq('advisor_id', advisorRow.id)
      .order('created_at', { ascending: false });

    setSessions(data || []);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveSuccess(false);

    const profileData = {
      user_id: user?.id,
      title: formTitle,
      category: formCategory,
      bio: formBio,
      rate: parseInt(formRate) || 0,
      experience: formExperience,
      languages: formLanguages,
    };

    if (advisorData) {
      await supabase
        .from('advisors')
        .update(profileData)
        .eq('user_id', user?.id);
    } else {
      await supabase
        .from('advisors')
        .insert(profileData);
    }

    await fetchAdvisorData();
    setSavingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAcceptSession = async (sessionId: string) => {
    await supabase
      .from('sessions')
      .update({ status: 'confirmada' })
      .eq('id', sessionId);
    fetchSessions();
  };

  const handleRejectSession = async (sessionId: string) => {
    await supabase
      .from('sessions')
      .update({ status: 'cancelada' })
      .eq('id', sessionId);
    fetchSessions();
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const pendingSessions = sessions.filter(s => s.status === 'pendiente');
  const upcomingSessions = sessions.filter(s => s.status === 'confirmada');
  const pastSessions = sessions.filter(s => s.status === 'completada');
  const totalEarnings = pastSessions.reduce((sum, s) => sum + (s.price || 0), 0);

  const firstName = profile?.full_name?.split(' ')[0] || 'Asesor';

  const CATEGORIES = [
    'Finanzas', 'Negocios', 'Datos & IA', 'Legal',
    'Marketing', 'Tecnologia', 'Recursos Humanos', 'Startups'
  ];

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">

      {/* NAVBAR */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/favicon.png"
              alt="Axioma"
              className="w-8 h-8 object-contain"
              style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }}
            />
            <div>
              <p className="text-white font-black tracking-tighter uppercase text-base leading-none">AXIOMA</p>
              <p className="text-[#10B981] text-[7px] font-bold tracking-[0.4em] uppercase">VENTURES INTELLIGENCE</p>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
              <Bell size={18} />
              {pendingSessions.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#10B981] rounded-full text-[8px] font-black text-[#0A0E27] flex items-center justify-center">
                  {pendingSessions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('perfil')}
              className="p-2 text-slate-500 hover:text-white transition-colors"
            >
              <Settings size={18} />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                <span className="text-[#10B981] text-[10px] font-black">
                  {firstName[0]}
                </span>
              </div>
              <span className="text-white text-xs font-bold">{firstName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              <LogOut size={15} /> Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* TABS */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit mb-8 border border-white/5 flex-wrap">
          {[
            { id: 'inicio', label: 'Inicio' },
            { id: 'solicitudes', label: `Solicitudes${pendingSessions.length > 0 ? ` (${pendingSessions.length})` : ''}` },
            { id: 'sesiones', label: 'Sesiones' },
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

        {/* TAB: INICIO */}
        {activeTab === 'inicio' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-light text-white uppercase tracking-tight">
                Panel de asesor — {firstName}
              </h1>
              <p className="text-slate-500 text-sm font-light mt-1">
                {pendingSessions.length > 0
                  ? `Tienes ${pendingSessions.length} solicitud${pendingSessions.length > 1 ? 'es' : ''} pendiente${pendingSessions.length > 1 ? 's' : ''}`
                  : 'No tienes solicitudes pendientes'
                }
              </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Ingresos totales', value: `$${totalEarnings}`, icon: DollarSign },
                { label: 'Completadas', value: String(pastSessions.length), icon: CheckCircle },
                { label: 'Pendientes', value: String(pendingSessions.length), icon: Clock },
                { label: 'Proximas', value: String(upcomingSessions.length), icon: Calendar },
              ].map((stat, i) => (
                <GlassCard key={i} className="p-5 border-white/5">
                  <stat.icon size={16} className="text-[#10B981] mb-3" />
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">{stat.label}</p>
                </GlassCard>
              ))}
            </div>

            {/* PERFIL INCOMPLETO */}
            {!advisorData && !loading && (
              <GlassCard className="p-6 border-amber-400/20">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                      Perfil incompleto
                    </p>
                    <p className="text-slate-400 text-xs font-light">
                      Completa tu perfil para aparecer en el catalogo de asesores
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('perfil')}
                    className="bg-amber-400 text-[#0A0E27] font-black px-5 py-2.5 rounded-full text-[10px] uppercase tracking-wider hover:bg-amber-300 transition-all"
                  >
                    Completar perfil
                  </button>
                </div>
              </GlassCard>
            )}

            {/* SOLICITUDES PENDIENTES */}
            {pendingSessions.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400 mb-4">
                  Solicitudes pendientes
                </h2>
                <div className="space-y-3">
                  {pendingSessions.map((session) => (
                    <GlassCard key={session.id} className="p-5 border-amber-400/10">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 font-black text-sm flex-shrink-0">
                            {session.profiles?.full_name?.[0] || 'C'}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">
                              {session.profiles?.full_name || 'Cliente'}
                            </p>
                            <p className="text-slate-500 text-[10px]">{session.services?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold text-sm">${session.price}</span>
                          <button
                            onClick={() => handleAcceptSession(session.id)}
                            className="bg-[#10B981] text-[#0A0E27] font-black px-4 py-2 rounded-lg text-[9px] uppercase tracking-wider hover:bg-[#0ea371] transition-all"
                          >
                            Aceptar
                          </button>
                          <button
                            onClick={() => handleRejectSession(session.id)}
                            className="bg-white/5 border border-white/10 text-slate-400 font-bold px-4 py-2 rounded-lg text-[9px] uppercase tracking-wider hover:bg-white/10 transition-all"
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* PROXIMAS SESIONES */}
            {upcomingSessions.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#10B981] mb-4">
                  Proximas sesiones confirmadas
                </h2>
                <div className="space-y-3">
                  {upcomingSessions.map((session) => (
                    <GlassCard key={session.id} className="p-5 border-white/5">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] font-black text-sm flex-shrink-0">
                            {session.profiles?.full_name?.[0] || 'C'}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">
                              {session.profiles?.full_name || 'Cliente'}
                            </p>
                            <p className="text-slate-500 text-[10px]">{session.services?.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-white font-bold text-sm">${session.price}</span>
                          <button className="bg-[#10B981] text-[#0A0E27] font-black px-4 py-2 rounded-lg text-[9px] uppercase tracking-wider hover:bg-[#0ea371] transition-all">
                            Iniciar sesion
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {sessions.length === 0 && !loading && (
              <GlassCard className="p-10 border-white/5 text-center">
                <Users size={32} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-sm font-light">
                  Aun no tienes sesiones. Completa tu perfil para empezar a recibir clientes.
                </p>
              </GlassCard>
            )}

          </div>
        )}

        {/* TAB: SOLICITUDES */}
        {activeTab === 'solicitudes' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-light text-white uppercase tracking-tight">
              Solicitudes de sesion
            </h1>
            {pendingSessions.length > 0 ? (
              <div className="space-y-3">
                {pendingSessions.map((session) => (
                  <GlassCard key={session.id} className="p-6 border-white/5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white font-black text-sm">
                          {session.profiles?.full_name?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="text-white font-bold">
                            {session.profiles?.full_name || 'Cliente'}
                          </p>
                          <p className="text-[#10B981] text-[10px] font-bold">{session.services?.name}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">
                            {session.profiles?.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-lg">${session.price}</span>
                        <button
                          onClick={() => handleAcceptSession(session.id)}
                          className="bg-[#10B981] text-[#0A0E27] font-black px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:bg-[#0ea371] transition-all"
                        >
                          Aceptar
                        </button>
                        <button
                          onClick={() => handleRejectSession(session.id)}
                          className="bg-white/5 border border-white/10 text-slate-400 font-bold px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all"
                        >
                          Rechazar
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 border-white/5 text-center">
                <Clock size={32} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-sm font-light">No tienes solicitudes pendientes</p>
              </GlassCard>
            )}
          </div>
        )}

        {/* TAB: SESIONES */}
        {activeTab === 'sesiones' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-light text-white uppercase tracking-tight">
              Historial de sesiones
            </h1>

            {sessions.length > 0 ? (
              <>
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <GlassCard key={session.id} className="p-5 border-white/5">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-black text-sm">
                            {session.profiles?.full_name?.[0] || 'C'}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">
                              {session.profiles?.full_name || 'Cliente'}
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

                <GlassCard className="p-5 border-[#10B981]/10">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">
                      Total generado
                    </span>
                    <span className="text-[#10B981] font-black text-xl">${totalEarnings}</span>
                  </div>
                </GlassCard>
              </>
            ) : (
              <GlassCard className="p-12 border-white/5 text-center">
                <Calendar size={32} className="text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 text-sm font-light">
                  Aun no tienes sesiones registradas
                </p>
              </GlassCard>
            )}
          </div>
        )}

        {/* TAB: PERFIL */}
        {activeTab === 'perfil' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-light text-white uppercase tracking-tight">
                Mi perfil publico
              </h1>
              <p className="text-slate-500 text-sm font-light mt-1">
                Esta informacion aparecera en el catalogo de asesores
              </p>
            </div>

            <GlassCard className="p-8 border-white/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981] font-black text-2xl">
                  {firstName[0]}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{profile?.full_name}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{profile?.email}</p>
                  {advisorData?.verified && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#10B981] mt-1">
                      <CheckCircle size={11} /> Verificado
                    </span>
                  )}
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">
                      Titulo profesional
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ej: CFO Independiente"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">
                      Especialidad
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#10B981]/40 focus:outline-none transition-colors"
                    >
                      <option value="" className="bg-[#0A0E27]">Selecciona una especialidad</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat} className="bg-[#0A0E27]">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">
                      Tarifa por hora (USD)
                    </label>
                    <input
                      type="number"
                      value={formRate}
                      onChange={(e) => setFormRate(e.target.value)}
                      placeholder="Ej: 80"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">
                      Anos de experiencia
                    </label>
                    <input
                      type="text"
                      value={formExperience}
                      onChange={(e) => setFormExperience(e.target.value)}
                      placeholder="Ej: 10 anos de experiencia"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">
                      Idiomas
                    </label>
                    <input
                      type="text"
                      value={formLanguages}
                      onChange={(e) => setFormLanguages(e.target.value)}
                      placeholder="Ej: Espanol, Ingles"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">
                    Biografia profesional
                  </label>
                  <textarea
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    placeholder="Describe tu experiencia, especialidades y lo que ofreces a tus clientes..."
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="bg-[#10B981] text-[#0A0E27] font-black py-3 px-8 rounded-xl uppercase tracking-[0.15em] text-[10px] hover:bg-[#0ea371] transition-all disabled:opacity-50"
                  >
                    {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                  {saveSuccess && (
                    <span className="flex items-center gap-1.5 text-[#10B981] text-[11px] font-bold uppercase tracking-wider">
                      <CheckCircle size={14} /> Guardado correctamente
                    </span>
                  )}
                </div>
              </form>
            </GlassCard>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdvisorDashboard;