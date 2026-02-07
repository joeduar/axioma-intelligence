import React from 'react';
import { Zap, Droplets, Activity, ArrowUpRight } from 'lucide-react';
import GlassCard from './GlassCard';

const SectorFocus: React.FC = () => {
  const energyServices = [
    { 
      name: "Upstream Optimization", 
      icon: <Droplets className="w-5 h-5" />, 
      desc: "Implementación de redes neuronales para el análisis sísmico y modelado de reservorios, maximizando la recuperación de activos en yacimientos complejos."
    },
    { 
      name: "Smart Grid Systems", 
      icon: <Zap className="w-5 h-5" />, 
      desc: "Algoritmos de balanceo de carga y predicción de demanda en tiempo real para infraestructuras eléctricas de alta criticidad."
    },
    { 
      name: "Predictive Integrity", 
      icon: <Activity className="w-5 h-5" />, 
      desc: "Sistemas de visión artificial procesados con IA para detectar fatiga estructural y riesgos operativos antes de que se conviertan en fallas críticas."
    }
  ];

  return (
    <section id="sectores" className="py-24 px-6 max-w-7xl mx-auto">
      {/* Cabecera Limpia */}
      <div className="mb-20">
        <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight uppercase leading-tight">
          Inteligencia Operativa para el <br/>
          <span className="text-[#10B981] font-semibold italic">Sector Energético & Oil</span>
        </h2>
        <div className="h-[1px] w-24 bg-[#10B981] mt-6 opacity-50"></div>
      </div>

      {/* Grid con Animaciones Suaves */}
      <div className="grid lg:grid-cols-3 gap-8">
        {energyServices.map((service, i) => (
          <GlassCard 
            key={i} 
            className="group p-10 relative overflow-hidden transition-all duration-700 hover:bg-white/[0.03] border-white/5"
          >
            {/* Efecto de luz superior muy sutil */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#10B981]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

            <div className="flex justify-between items-start mb-10">
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/5 flex items-center justify-center text-[#10B981] border border-[#10B981]/10 transition-all duration-500 group-hover:scale-110">
                {service.icon}
              </div>
              <ArrowUpRight className="text-white/10 group-hover:text-[#10B981] transition-colors duration-500" size={18} />
            </div>

            <h3 className="text-base font-semibold text-white mb-4 uppercase tracking-[0.15em] transition-colors duration-500 group-hover:text-[#10B981]">
              {service.name}
            </h3>

            <p className="text-white/40 text-[13px] leading-relaxed font-light transition-colors duration-500 group-hover:text-white/60">
              {service.desc}
            </p>

            {/* Decoración final minimalista */}
            <div className="mt-8 flex items-center gap-2">
              <div className="h-[1px] w-4 bg-[#10B981]/30"></div>
              <div className="w-1 h-1 rounded-full bg-[#10B981]/30"></div>
            </div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
};

export default SectorFocus;