import React from 'react';
import { Brain, Database, ShieldCheck } from 'lucide-react';
import GlassCard from './GlassCard';

const PillarsSection: React.FC = () => {
  // Datos reales de una firma de consultoría e implementación de IA
  const pillars = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Modelado Predictivo",
      desc: "Desarrollamos redes neuronales personalizadas que transforman datos históricos en proyecciones estratégicas de alta fidelidad."
    },
    {
      icon: <Database className="w-5 h-5" />,
      title: "Ingeniería de Datos",
      desc: "Estructuramos pipelines de datos robustos, asegurando la integridad y disponibilidad de la información para modelos de IA."
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Seguridad & Ética",
      desc: "Implementamos protocolos de gobernanza de datos que garantizan la privacidad, seguridad y transparencia en cada inferencia."
    }
  ];

  return (
    <section id="pilares" className="py-24 px-6 bg-[#0A0E27] relative overflow-hidden">
      {/* Elemento decorativo de fondo sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-[#10B981]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[10px] font-bold uppercase tracking-[0.4em]">
            Foundational Assets
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight uppercase">
            Pilares de <span className="text-[#10B981]">IA Aplicada</span>
          </h2>
          <p className="text-white/40 text-base max-w-2xl mx-auto leading-relaxed font-light">
            Nuestra estructura operativa trasciende la analítica tradicional para crear sistemas de decisión automatizados y resilientes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {pillars.map((pillar, i) => (
            <GlassCard 
              key={i} 
              className="p-10 border-white/5 hover:border-[#10B981]/30 transition-all duration-500 group relative bg-white/[0.01]"
            >
              {/* Línea de acento superior sutil */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-[#10B981] group-hover:w-full transition-all duration-700"></div>
              
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/5 flex items-center justify-center text-[#10B981] mb-8 border border-[#10B981]/10 transform group-hover:bg-[#10B981]/10 transition-all duration-500">
                {pillar.icon}
              </div>
              
              <h3 className="text-base font-bold text-white mb-4 uppercase tracking-wider group-hover:text-[#10B981] transition-colors">
                {pillar.title}
              </h3>
              
              <p className="text-white/40 text-sm leading-relaxed font-light">
                {pillar.desc}
              </p>
              
              {/* Detalle visual de esquina */}
              <div className="absolute bottom-4 right-4 w-1 h-1 bg-white/10 group-hover:bg-[#10B981] transition-colors rounded-full"></div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;