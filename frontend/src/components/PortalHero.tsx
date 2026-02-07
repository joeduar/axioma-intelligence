import React from 'react';
import { BrainCircuit, ArrowRight, BarChart3, PieChart, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const PortalHero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-32 px-6 overflow-hidden bg-[#0A0E27]">
      {/* Iluminación de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_70%_30%,_rgba(16,185,129,0.08),transparent_50%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Lado Izquierdo: Narrativa Estratégica */}
          <div className="space-y-10">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#10B981]/5 border border-[#10B981]/10">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></div>
              <span className="text-[#10B981] text-[10px] font-bold uppercase tracking-[0.3em]">
                Soberanía Tecnológica
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05]">
              Inteligencia Artificial <br />
              <span className="text-[#10B981]">Diseñada para crecer contigo</span>
            </h1>

            <p className="text-white text-lg leading-relaxed font-light max-w-xl opacity-80">
              Convertimos datos complejos en decisiones precisas que impulsan eficiencia, rentabilidad y visión a largo plazo.
            </p>

            <div className="flex flex-wrap gap-4">
  {/* BOTÓN CONECTADO A SOLUCIONES */}
  <Link 
    to="/soluciones" 
    className="px-8 py-4 bg-[#10B981] text-[#020617] font-bold rounded-xl flex items-center gap-2 hover:bg-[#0da673] transition-all group uppercase tracking-widest text-sm"
  >
    Explorar Soluciones
    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
  </Link>
              <button className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
                Nuestra Tecnología
              </button>
            </div>
          </div>

          {/* Lado Derecho: Dashboard BI con IA Estilo Mac */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-[#10B981]/10 blur-3xl rounded-full opacity-20"></div>
            
            <div className="relative bg-[#0D122B] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              {/* Ventana Estilo Mac Limpia */}
              <div className="bg-white/5 border-b border-white/5 p-4 flex items-center">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80"></div>
                  <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27C93F]/80"></div>
                </div>
              </div>

              {/* Contenido Dashboard BI */}
              <div className="p-6 space-y-6">
                {/* KPIs Superiores */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Revenue Forecast", val: "+12.4%", icon: <TrendingUp size={12}/> },
                    { label: "AI Confidence", val: "94.2%", icon: <Zap size={12}/> },
                    { label: "Market Share", val: "22.8%", icon: <BarChart3 size={12}/> }
                  ].map((kpi, i) => (
                    <div key={i} className="bg-white/[0.03] border border-white/5 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-[#10B981] mb-1">
                        {kpi.icon}
                        <span className="text-[8px] font-bold uppercase tracking-wider opacity-60">{kpi.label}</span>
                      </div>
                      <div className="text-lg font-bold text-white">{kpi.val}</div>
                    </div>
                  ))}
                </div>

                {/* Gráfica Principal de Predicción */}
                <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest opacity-40 text-white">Análisis Predictivo de Demanda</span>
                    <PieChart size={14} className="text-[#10B981]/50" />
                  </div>
                  <div className="h-32 flex items-end gap-2">
                    {[30, 45, 35, 60, 80, 55, 90, 75, 40, 65, 85, 95].map((h, i) => (
                      <div key={i} className="flex-1 relative group">
                        <div 
                          className="w-full bg-[#10B981]/20 rounded-t-sm transition-all duration-700 group-hover:bg-[#10B981]/50" 
                          style={{ height: `${h}%` }}
                        ></div>
                        {/* Línea de tendencia IA sutil */}
                        <div className="absolute bottom-full mb-1 left-1/2 w-1 h-1 bg-[#10B981] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer del Dashboard */}
                <div className="flex justify-between items-center text-[9px] text-white/30 font-bold uppercase tracking-tighter">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                    <span>AI Engine Processing Live Data</span>
                  </div>
                  <span>Last Update: 2s ago</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default PortalHero;