import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Star, Users, LogOut, Bell, Settings, ChevronRight, CheckCircle, Clock } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const PENDING_REQUESTS = [
  {
    id: '1',
    client: 'Juan Perez',
    initials: 'JP',
    service: 'Sesion estrategica 1h',
    date: 'Lunes 10 Abril, 2026',
    time: '3:00 PM',
    price: 80,
  },
  {
    id: '2',
    client: 'Maria Lopez',
    initials: 'ML',
    service: 'Revision de modelo financiero',
    date: 'Martes 11 Abril, 2026',
    time: '10:00 AM',
    price: 150,
  },
];

const UPCOMING_SESSIONS = [
  {
    id: '3',
    client: 'Roberto Castro',
    initials: 'RC',
    service: 'Sesion estrategica 1h',
    date: 'Miercoles 12 Abril, 2026',
    time: '2:00 PM',
    price: 80,
    status: 'confirmada',
  },
];

const PAST_SESSIONS = [
  {
    id: '4',
    client: 'Sofia Mendez',
    initials: 'SM',
    service: 'Sesion estrategica 1h',
    date: '28 Marzo, 2026',
    price: 80,
    rating: 5,
  },
  {
    id: '5',
    client: 'Diego Vargas',
    initials: 'DV',
    service: 'Revision de modelo financiero',
    date: '20 Marzo, 2026',
    price: 150,
    rating: 4,
  },
  {
    id: '6',
    client: 'Ana Torres',
    initials: 'AT',
    service: 'Paquete mensual',
    date: '10 Marzo, 2026',
    price: 500,
    rating: 5,
  },
];

const AdvisorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'inicio' | 'solicitudes' | 'sesiones' | 'perfil'>('inicio');

  const totalEarnings = PAST_SESSIONS.reduce((sum, s) => sum + s.price, 0);
  const avgRating = (PAST_SESSIONS.reduce((sum, s) => sum + s.rating, 0) / PAST_SESSIONS.length).toFixed(1);

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
              {PENDING_REQUESTS.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#10B981] rounded-full text-[8px] font-black text-[#0A0E27] flex items-center justify-center">
                  {PENDING_REQUESTS.length}
                </span>
              )}
            </button>
            <button className="p-2 text-slate-500 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
            <button
              onClick={() => navigate('/')}
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
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit mb-8 border border-white/5 flex-wrap">
          {[
            { id: 'inicio', label: 'Inicio' },
            { id: 'solicitudes', label: `Solicitudes ${PENDING_REQUESTS.length > 0 ? `(${PENDING_REQUESTS.length})` : ''}` },
            { id: 'sesiones', label: 'Mis sesiones' },
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
                Panel de asesor
              </h1>
              <p className="text-slate-500 text-sm font-light mt-1">
                Tienes {PENDING_REQUESTS.length} solicitudes pendientes de confirmar
              </p>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Ingresos del mes', value: `$${totalEarnings}`, icon: DollarSign },
                { label: 'Sesiones completadas', value: String(PAST_SESSIONS.length), icon: CheckCircle },
                { label: 'Clientes atendidos', value: String(PAST_SESSIONS.length), icon: Users },
                { label: 'Calificacion promedio', value: avgRating, icon: Star },
              ].map((stat, i) => (
                <GlassCard key={i} className="p-5 border-white/5">
                  <stat.icon size={16} className="text-[#10B981] mb-3" />
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">{stat.label}</p>
                </GlassCard>
              ))}
            </div>

            {/* SOLICITUDES PENDIENTES */}
            {PENDING_REQUESTS.length > 0 && (
              <div>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400 mb-4">
                  Solicitudes pendientes
                </h2>
                <div className="space-y-3">
                  {PENDING_REQUESTS.map((req) => (
                    <GlassCard key={req.id} className="p-5 border-amber-400/10">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 font-black text-sm flex-shrink-0">
                            {req.initials}
                          </div>
                          <div>
                            <p className="text-white font-bold text-sm">{req.client}</p>
                            <p className="text-slate-500 text-[10px]">{req.service}</p>
                            <p className="text-slate-600 text-[9px]">{req.date} — {req.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold text-sm">${req.price}</span>
                          <button className="bg-[#10B981] text-[#0A0E27] font-black px-4 py-2 rounded-lg text-[9px] uppercase tracking-wider hover:bg-[#0ea371] transition-all">
                            Aceptar
                          </button>
                          <button className="bg-white/5 border border-white/10 text-slate-400 font-bold px-4 py-2 rounded-lg text-[9px] uppercase tracking-wider hover:bg-white/10 transition-all">
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
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#10B981] mb-4">
                Proximas sesiones
              </h2>
              <div className="space-y-3">
                {UPCOMING_SESSIONS.map((session) => (
                  <GlassCard key={session.id} className="p-5 border-white/5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] font-black text-sm flex-shrink-0">
                          {session.initials}
                        </div>
                        <div>
                          <p className="text-white font-bold text-sm">{session.client}</p>
                          <p className="text-slate-500 text-[10px]">{session.service}</p>
                          <p className="text-slate-600 text-[9px]">{session.date} — {session.time}</p>
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

          </div>
        )}

        {/* TAB: SOLICITUDES */}
        {activeTab === 'solicitudes' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-light text-white uppercase tracking-tight">
              Solicitudes de sesion
            </h1>
            {PENDING_REQUESTS.length > 0 ? (
              <div className="space-y-3">
                {PENDING_REQUESTS.map((req) => (
                  <GlassCard key={req.id} className="p-6 border-white/5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white font-black text-sm">
                          {req.initials}
                        </div>
                        <div>
                          <p className="text-white font-bold">{req.client}</p>
                          <p className="text-[#10B981] text-[10px] font-bold">{req.service}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-slate-500">
                            <Clock size={11} />
                            <span className="text-[10px]">{req.date} — {req.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-lg">${req.price}</span>
                        <button className="bg-[#10B981] text-[#0A0E27] font-black px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:bg-[#0ea371] transition-all">
                          Aceptar
                        </button>
                        <button className="bg-white/5 border border-white/10 text-slate-400 font-bold px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wider hover:bg-white/10 transition-all">
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
            <div className="space-y-3">
              {PAST_SESSIONS.map((session) => (
                <GlassCard key={session.id} className="p-5 border-white/5">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white font-black text-sm">
                        {session.initials}
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">{session.client}</p>
                        <p className="text-slate-500 text-[10px]">{session.service}</p>
                        <p className="text-slate-600 text-[9px]">{session.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: session.rating }).map((_, i) => (
                          <Star key={i} size={11} className="text-[#10B981] fill-[#10B981]" />
                        ))}
                      </div>
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
          </div>
        )}

        {/* TAB: PERFIL */}
        {activeTab === 'perfil' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-light text-white uppercase tracking-tight">
              Mi perfil publico
            </h1>
            <GlassCard className="p-8 border-white/5">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-[#0F4C35] flex items-center justify-center text-white font-black text-xl">
                  TU
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Tu nombre</p>
                  <p className="text-[#10B981] text-sm">Tu especialidad</p>
                  <p className="text-slate-500 text-xs mt-1">Perfil pendiente de completar</p>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Nombre completo', placeholder: 'Tu nombre profesional' },
                  { label: 'Titulo profesional', placeholder: 'Ej: CFO Independiente' },
                  { label: 'Especialidad', placeholder: 'Ej: Finanzas' },
                  { label: 'Tarifa por hora (USD)', placeholder: 'Ej: 80' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 block mb-2">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors"
                    />
                  </div>
                ))}
                <button className="w-full bg-[#10B981] text-[#0A0E27] font-black py-4 rounded-xl uppercase tracking-[0.15em] text-[10px] hover:bg-[#0ea371] transition-all mt-2">
                  Guardar cambios
                </button>
              </div>
            </GlassCard>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdvisorDashboard;