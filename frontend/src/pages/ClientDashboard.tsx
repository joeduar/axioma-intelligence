import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Star, Search, LogOut, User, Bell, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const UPCOMING_SESSIONS = [
  {
    id: '1',
    advisor: 'Carlos Mendoza',
    initials: 'CM',
    color: '#0F4C35',
    title: 'CFO Independiente',
    service: 'Sesion estrategica 1h',
    date: 'Lunes 10 Abril, 2026',
    time: '3:00 PM',
    price: 80,
    status: 'confirmada',
  },
  {
    id: '2',
    advisor: 'Luis Rojas',
    initials: 'LR',
    color: '#4A148C',
    title: 'Data Scientist Senior',
    service: 'Sesion de datos',
    date: 'Miercoles 12 Abril, 2026',
    time: '11:00 AM',
    price: 120,
    status: 'pendiente',
  },
];

const PAST_SESSIONS = [
  {
    id: '3',
    advisor: 'Andrea Torres',
    initials: 'AT',
    color: '#1A237E',
    title: 'Estratega de Negocios',
    service: 'Sesion de estrategia',
    date: '28 Marzo, 2026',
    price: 95,
    rated: false,
  },
  {
    id: '4',
    advisor: 'Maria Gonzalez',
    initials: 'MG',
    color: '#B71C1C',
    title: 'Abogada Corporativa',
    service: 'Consulta legal',
    date: '15 Marzo, 2026',
    price: 110,
    rated: true,
  },
];

const ClientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'inicio' | 'sesiones' | 'explorar'>('inicio');

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">

      {/* NAVBAR DASHBOARD */}
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
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#10B981] rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <div className="w-6 h-6 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                <User size={12} className="text-[#10B981]" />
              </div>
              <span className="text-white text-xs font-bold">Mi cuenta</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-white text-[10px] font-bold uppercase tracking-wider transition-colors"
            >
              <LogOut size={15} />
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* TABS */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit mb-8 border border-white/5">
          {[
            { id: 'inicio', label: 'Inicio' },
            { id: 'sesiones', label: 'Mis sesiones' },
            { id: 'explorar', label: 'Explorar asesores' },
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

            {/* BIENVENIDA */}
            <div className="mb-2">
              <h1 className="text-2xl font-light text-white uppercase tracking-tight">
                Bienvenido de vuelta
              </h1>
              <p className="text-slate-500 text-sm font-light mt-1">
                Tienes {UPCOMING_SESSIONS.length} sesiones proximas
              </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Sesiones totales', value: '6', icon: Calendar },
                { label: 'Horas de asesoria', value: '8h', icon: Clock },
                { label: 'Asesores consultados', value: '4', icon: User },
                { label: 'Calificacion promedio', value: '4.9', icon: Star },
              ].map((stat, i) => (
                <GlassCard key={i} className="p-5 border-white/5">
                  <stat.icon size={16} className="text-[#10B981] mb-3" />
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">{stat.label}</p>
                </GlassCard>
              ))}
            </div>

            {/* PROXIMAS SESIONES */}
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#10B981] mb-4">
                Proximas sesiones
              </h2>
              <div className="space-y-3">
                {UPCOMING_SESSIONS.map((session) => (
                  <GlassCard key={session.id} className="p-5 border-white/5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                          style={{ backgroundColor: session.color }}
                        >
                          {session.initials}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{session.advisor}</p>
                          <p className="text-slate-500 text-[10px]">{session.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-white text-xs font-bold">{session.date}</p>
                          <p className="text-slate-500 text-[10px]">{session.time}</p>
                        </div>
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
            </div>

            {/* CTA EXPLORAR */}
            <GlassCard className="p-6 border-[#10B981]/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-white font-bold text-sm mb-1">Encuentra tu proximo asesor</p>
                  <p className="text-slate-500 text-xs font-light">
                    Mas de 200 expertos verificados disponibles
                  </p>
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

        {/* TAB: SESIONES */}
        {activeTab === 'sesiones' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-light text-white uppercase tracking-tight">
              Mis sesiones
            </h1>

            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#10B981] mb-4">
                Proximas
              </h2>
              <div className="space-y-3">
                {UPCOMING_SESSIONS.map((session) => (
                  <GlassCard key={session.id} className="p-5 border-white/5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                          style={{ backgroundColor: session.color }}
                        >
                          {session.initials}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{session.advisor}</p>
                          <p className="text-[#10B981] text-[10px]">{session.title}</p>
                          <p className="text-slate-500 text-[10px]">{session.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white text-xs font-bold">{session.date}</p>
                          <p className="text-slate-500 text-[10px]">{session.time}</p>
                        </div>
                        <button className="bg-[#10B981] text-[#0A0E27] font-black px-4 py-2 rounded-lg text-[9px] uppercase tracking-wider hover:bg-[#0ea371] transition-all">
                          Unirse
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">
                Historial
              </h2>
              <div className="space-y-3">
                {PAST_SESSIONS.map((session) => (
                  <GlassCard key={session.id} className="p-5 border-white/5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                          style={{ backgroundColor: session.color }}
                        >
                          {session.initials}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{session.advisor}</p>
                          <p className="text-slate-500 text-[10px]">{session.service}</p>
                          <p className="text-slate-600 text-[9px]">{session.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-bold text-sm">${session.price}</span>
                        {session.rated ? (
                          <span className="flex items-center gap-1 text-[#10B981] text-[9px] font-bold uppercase tracking-wider">
                            <CheckCircle size={12} /> Calificada
                          </span>
                        ) : (
                          <button className="flex items-center gap-1 text-amber-400 text-[9px] font-bold uppercase tracking-wider border border-amber-400/20 px-3 py-1.5 rounded-lg hover:bg-amber-400/10 transition-all">
                            <Star size={11} /> Calificar
                          </button>
                        )}
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: EXPLORAR */}
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

      </div>
    </div>
  );
};

export default ClientDashboard;