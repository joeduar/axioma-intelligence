import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, DollarSign, Users,
  ChevronRight, CheckCircle, Clock, MessageCircle
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import DashboardFooter from '../components/DashboardFooter';
import AvatarUpload from '../components/AvatarUpload';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import ChatModule from '../components/ChatModule';

const AdvisorDashboard = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'inicio' | 'solicitudes' | 'sesiones' | 'perfil' | 'mensajes' | 'ingresos'>('inicio');
  const [advisorData, setAdvisorData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      await supabase.from('advisors').update(profileData).eq('user_id', user?.id);
    } else {
      await supabase.from('advisors').insert(profileData);
    }

    await fetchAdvisorData();
    setSavingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAcceptSession = async (sessionId: string) => {
    await supabase.from('sessions').update({ status: 'confirmada' }).eq('id', sessionId);
    fetchSessions();
  };

  const handleRejectSession = async (sessionId: string) => {
    await supabase.from('sessions').update({ status: 'cancelada' }).eq('id', sessionId);
    fetchSessions();
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

  const getTabTitle = () => {
    if (activeTab === 'inicio') return 'Panel principal';
    if (activeTab === 'solicitudes') return 'Solicitudes';
    if (activeTab === 'sesiones') return 'Mis sesiones';
    if (activeTab === 'perfil') return 'Mi perfil';
    if (activeTab === 'ingresos') return 'Ingresos';
    return 'Mensajes';
  };

  return (
    <div className="flex h-screen bg-[#0A0E27] text-white overflow-hidden">

      <Sidebar
        role="asesor"
        activeTab={activeTab}
        pendingCount={pendingSessions.length}
        onNavigate={(tab) => setActiveTab(tab as any)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">

        <TopBar
          role="asesor"
          pendingCount={pendingSessions.length}
          title={getTabTitle()}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6">

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

              {!advisorData && !loading && (
                <GlassCard className="p-6 border-amber-400/20">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">Perfil incompleto</p>
                      <p className="text-slate-400 text-xs font-light">Completa tu perfil para aparecer en el catalogo de asesores</p>
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

              {pendingSessions.length > 0 && (
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400 mb-4">Solicitudes pendientes</h2>
                  <div className="space-y-3">
                    {pendingSessions.map((session) => (
                      <GlassCard key={session.id} className="p-5 border-amber-400/10">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 font-black text-sm flex-shrink-0">
                              {session.profiles?.full_name?.[0] || 'C'}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">{session.profiles?.full_name || 'Cliente'}</p>
                              <p className="text-slate-500 text-[10px]">{session.services?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-white font-bold text-sm">${session.price}</span>
                            <button onClick={() => handleAcceptSession(session.id)}
                              className="bg-[#10B981] text-[#0A0E27] font-black px-4 py-2 rounded-lg text-[9px] uppercase tracking-wider hover:bg-[#0ea371] transition-all">
                              Aceptar
                            </button>
                            <button onClick={() => handleRejectSession(session.id)}
                              className="bg-white/5 border border-white/10 text-slate-400 font-bold px-4 py-2 rounded-lg text-[9px] uppercase tracking-wider hover:bg-white/10 transition-all">
                              Rechazar
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              )}

              {upcomingSessions.length > 0 && (
                <div>
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#10B981] mb-4">Proximas sesiones confirmadas</h2>
                  <div className="space-y-3">
                    {upcomingSessions.map((session) => (
                      <GlassCard key={session.id} className="p-5 border-white/5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] font-black text-sm flex-shrink-0">
                              {session.profiles?.full_name?.[0] || 'C'}
                            </div>
                            <div>
                              <p className="text-white font-bold text-sm">{session.profiles?.full_name || 'Cliente'}</p>
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

          {activeTab === 'solicitudes' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-light text-white uppercase tracking-tight">Solicitudes de sesion</h1>
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
                            <p className="text-white font-bold">{session.profiles?.full_name || 'Cliente'}</p>
                            <p className="text-[#10B981] text-[10px] font-bold">{session.services?.name}</p>
                            <p className="text-slate-500 text-[10px] mt-0.5">{session.profiles?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold text-lg">${session.price}</span>
                          <button onClick={() => handleAcceptSession(session.id)}
                            className="bg-[#10B981] text-[#0A0E27] font-black px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:bg-[#0ea371] transition-all">
                            Aceptar
                          </button>
                          <button onClick={() => handleRejectSession(session.id)}
                            className="bg-white/5 border border-white/10 text-slate-400 font-bold px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all">
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

          {activeTab === 'sesiones' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-light text-white uppercase tracking-tight">Historial de sesiones</h1>
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
                              <p className="text-white font-bold text-sm">{session.profiles?.full_name || 'Cliente'}</p>
                              <p className="text-slate-500 text-[10px]">{session.services?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${session.status === 'completada' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                              : session.status === 'confirmada' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : session.status === 'pendiente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
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
                      <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Total generado</span>
                      <span className="text-[#10B981] font-black text-xl">${totalEarnings}</span>
                    </div>
                  </GlassCard>
                </>
              ) : (
                <GlassCard className="p-12 border-white/5 text-center">
                  <Calendar size={32} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm font-light">Aun no tienes sesiones registradas</p>
                </GlassCard>
              )}
            </div>
          )}

          {activeTab === 'mensajes' && (
            <div className="space-y-4">
              <h1 className="text-2xl font-light text-white uppercase tracking-tight">Mensajes</h1>
              <ChatModule role="asesor" />
            </div>
          )}

          {activeTab === 'ingresos' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-light text-white uppercase tracking-tight">Ingresos</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Total generado', value: `$${totalEarnings}`, sub: 'Historico completo' },
                  { label: 'Sesiones completadas', value: String(pastSessions.length), sub: 'Pagadas y cerradas' },
                  { label: 'Promedio por sesion', value: pastSessions.length > 0 ? `$${Math.round(totalEarnings / pastSessions.length)}` : '$0', sub: 'Por sesion completada' },
                ].map((stat, i) => (
                  <GlassCard key={i} className="p-6 border-white/5 text-center">
                    <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-[#10B981] text-[9px] font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-slate-600 text-[9px] mt-1">{stat.sub}</p>
                  </GlassCard>
                ))}
              </div>
              {pastSessions.length > 0 ? (
                <GlassCard className="p-6 border-white/5">
                  <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#10B981] mb-5">Detalle de ingresos</h2>
                  <div className="space-y-3">
                    {pastSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                        <div>
                          <p className="text-white text-sm font-bold">{session.profiles?.full_name || 'Cliente'}</p>
                          <p className="text-slate-500 text-[10px]">{session.services?.name}</p>
                        </div>
                        <span className="text-[#10B981] font-black">${session.price}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="p-12 border-white/5 text-center">
                  <DollarSign size={32} className="text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-500 text-sm font-light">Aun no tienes ingresos registrados</p>
                </GlassCard>
              )}
            </div>
          )}

          {activeTab === 'perfil' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-light text-white uppercase tracking-tight">Mi perfil publico</h1>
                <p className="text-slate-500 text-sm font-light mt-1">Esta informacion aparecera en el catalogo de asesores</p>
              </div>

              <GlassCard className="p-8 border-white/5">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                  <AvatarUpload
                    currentUrl={advisorData?.avatar_url || profile?.avatar_url}
                    onUploadComplete={(url) => setAdvisorData((prev: any) => ({ ...prev, avatar_url: url }))}
                    size="lg"
                  />
                  <div className="text-center md:text-left">
                    <p className="text-white font-bold text-lg">{profile?.full_name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{profile?.email}</p>
                    {advisorData?.verified && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-[#10B981] mt-1">
                        <CheckCircle size={11} /> Verificado
                      </span>
                    )}
                    <p className="text-slate-600 text-[10px] mt-2 font-light">
                      Tu foto aparecera en tu perfil publico del catalogo
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">Titulo profesional</label>
                      <input type="text" value={formTitle} onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="Ej: CFO Independiente"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">Especialidad</label>
                      <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#10B981]/40 focus:outline-none transition-colors">
                        <option value="" className="bg-[#0A0E27]">Selecciona una especialidad</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat} className="bg-[#0A0E27]">{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">Anos de experiencia</label>
                      <input type="text" value={formExperience} onChange={(e) => setFormExperience(e.target.value)}
                        placeholder="Ej: 10 anos de experiencia"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">Idiomas</label>
                      <input type="text" value={formLanguages} onChange={(e) => setFormLanguages(e.target.value)}
                        placeholder="Ej: Espanol, Ingles"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">Biografia profesional</label>
                    <textarea value={formBio} onChange={(e) => setFormBio(e.target.value)}
                      placeholder="Describe tu experiencia, especialidades y lo que ofreces a tus clientes..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors resize-none" />
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="submit" disabled={savingProfile}
                      className="bg-[#10B981] text-[#0A0E27] font-black py-3 px-8 rounded-xl uppercase tracking-[0.15em] text-[10px] hover:bg-[#0ea371] transition-all disabled:opacity-50">
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

        </main>

        <DashboardFooter />

      </div>
    </div>
  );
};

export default AdvisorDashboard;
