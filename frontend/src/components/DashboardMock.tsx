import React from 'react';
import { BrainCircuit, Activity, ChevronRight, Shield, Cpu, Target } from 'lucide-react';
import GlassCard from './GlassCard';

interface DashboardMockProps {
  onLoginClick: () => void;
}

const DashboardMock: React.FC<DashboardMockProps> = ({ onLoginClick }) => {
  return (
    <div className="relative min-h-screen bg-[#0A0E27] overflow-hidden text-white font-sans">
      {/* Fondo ambiental sutil */}
      <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#10B981]/10 rounded-full blur-[120px]" />
      
      {/* Navegación Profesional */}
      <nav className="relative z-10 flex justify-between items-center p-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#10B981]/10 rounded-lg border border-[#10B981]/20">
            <BrainCircuit className="text-[#10B981]" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="font-black tracking-tighter text-lg leading-none uppercase">
              AXIOMA VENTURES
            </span>
            <span className="text-[#10B981] font-bold tracking-[0.4em] text-[8px] uppercase mt-1">
              INTELLIGENCE
            </span>
          </div>
        </div>
        <button 
          onClick={onLoginClick}
          className="bg-white/5 hover:bg-[#10B981] text-white hover:text-[#0A0E27] px-6 py-2 rounded-full border border-white/10 transition-all text-[9px] font-black uppercase tracking-widest"
        >
          ACCESO PORTAL
        </button>
      </nav>

      {/* Hero Section - Basado en tu información oficial */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white text-[9px] font-bold uppercase tracking-[0.25em] mb-10 backdrop-blur-md">
          <Shield size={12} className="text-[#10B981]" /> 
          INTELIGENCIA ARTIFICIAL DISEÑADA PARA CRECER CONTIGO
        </div>
        
        {/* Título en Fuente Sólida y Proporcional */}
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 uppercase leading-tight max-w-4xl mx-auto">
          PRECISIÓN ALGORÍTMICA <br />
          <span className="text-[#10B981]">E INNOVACIÓN TECNOLÓGICA</span>
        </h1>
        
        <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto mb-12 font-medium leading-relaxed tracking-wide">
          Enfocados en transformar datos en decisiones estratégicas de alto impacto mediante procesos de vanguardia y análisis masivo.
        </p>

        <button 
          onClick={onLoginClick} 
          className="bg-[#10B981] text-[#0A0E27] px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 mx-auto hover:bg-[#0ea371] transition-all"
        >
          SOLICITAR CONSULTORÍA <ChevronRight size={16} />
        </button>
      </div>

      {/* Grid de Servicios - Limpio y Ordenado */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 pb-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            title: "IA & AUTOMATIZACIÓN",
            desc: "Creación de modelos predictivos y sistemas inteligentes que optimizan procesos clave.",
            icon: Cpu
          },
          {
            title: "CONSULTORÍA ESTRATÉGICA",
            desc: "Diseño de estrategias de IA alineadas con objetivos de crecimiento y escalabilidad empresarial.",
            icon: Target
          },
          {
            title: "BIG DATA ANALYTICS",
            desc: "Procesamiento y análisis avanzado de grandes volúmenes de datos para generar insights accionables.",
            icon: Activity
          }
        ].map((service, i) => (
          <GlassCard key={i} className="p-10 border-white/5 bg-white/[0.01] hover:border-[#10B981]/30 transition-all duration-500 group text-left">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-6">
              <service.icon className="text-[#10B981]" size={24} />
            </div>
            <h3 className="text-white font-black uppercase tracking-widest text-[11px] mb-4">{service.title}</h3>
            <p className="text-white/60 text-[13px] leading-relaxed font-medium group-hover:text-white/90 transition-colors">
              {service.desc}
            </p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

export default DashboardMock;