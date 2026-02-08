import React from 'react';
import { BrainCircuit, ArrowRight, BarChart3, PieChart, TrendingUp, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion'; // ESTA ES LA IMPORTACIÓN QUE FALTABA

const PortalHero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-32 px-6 overflow-hidden bg-[#0A0E27]">
      {/* Iluminación de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_70%_30%,_rgba(16,185,129,0.08),transparent_50%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* LADO IZQUIERDO: CONTENIDO */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#10B981] uppercase">Soberanía Tecnológica</span>
            </div>
            
            {/* TAMAÑO DE FUENTE AJUSTADO: de 7xl a 5xl/6xl */}
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.1] mb-8 uppercase tracking-tighter">
              Donde la IA se convierte en ventaja <br />
              <span className="text-[#10B981]">Estratégica</span>
            </h1>
            
            <p className="text-slate-400 text-lg max-w-lg mb-10 leading-relaxed">
              Convertimos datos complejos en decisiones precisas que impulsan eficiencia, rentabilidad y visión a largo plazo.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link 
                to="/soluciones" 
                className="px-8 py-4 bg-[#10B981] text-[#020617] font-bold rounded-xl flex items-center gap-2 hover:bg-[#0da673] transition-all group uppercase tracking-widest text-sm"
              >
                Explorar Soluciones
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                to="/nosotros" 
                className="px-8 py-4 bg-[#0a192f]/50 border border-[#10B981]/20 text-white font-bold rounded-xl hover:bg-[#10B981]/10 hover:border-[#10B981]/60 transition-all uppercase tracking-widest text-sm text-center"
              >
                Acerca de Nosotros
              </Link>
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

                <div className="mt-8 p-6 bg-[#020617]/50 rounded-2xl border border-[#10B981]/5 h-64 relative overflow-hidden">
  <div className="flex justify-between items-center mb-6">
    <span className="text-[10px] font-bold tracking-[0.2em] text-[#10B981] uppercase">
      Análisis Predictivo de Demanda
    </span>
    <div className="flex gap-1">
      <div className="w-1 h-3 bg-[#10B981]/20 rounded-full" />
      <div className="w-1 h-5 bg-[#10B981] rounded-full animate-pulse" />
      <div className="w-1 h-4 bg-[#10B981]/40 rounded-full" />
    </div>
  </div>

  {/* SIMULACIÓN DE GRÁFICO POWER BI / IA */}
  <div className="flex items-end justify-between h-32 gap-2">
    {[40, 70, 45, 90, 65, 80, 95, 75, 60, 85].map((height, i) => (
      <motion.div
        key={i}
        initial={{ height: 0 }}
        animate={{ height: `${height}%` }}
        transition={{ duration: 1, delay: i * 0.1 }}
        className="flex-1 bg-gradient-to-t from-[#10B981]/10 to-[#10B981]/40 rounded-t-sm relative group"
      >
        {/* Tooltip simulado al pasar el mouse */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#10B981] text-[#020617] text-[8px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {height}%
        </div>
      </motion.div>
    ))}
  </div>

  {/* LÍNEA DE TENDENCIA (LÍNEA DE IA) */}
  <svg className="absolute inset-x-0 bottom-12 h-20 w-full" preserveAspectRatio="none">
    <motion.path
      d="M0,40 Q150,10 300,50 T600,20 T900,40"
      fill="none"
      stroke="#10B981"
      strokeWidth="2"
      strokeDasharray="1000"
      initial={{ strokeDashoffset: 1000 }}
      animate={{ strokeDashoffset: 0 }}
      transition={{ duration: 3, repeat: Infinity }}
      className="opacity-50"
    />
  </svg>
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