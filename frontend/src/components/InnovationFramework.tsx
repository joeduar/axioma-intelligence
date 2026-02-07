import React from 'react';
import { Cpu, BarChart3, Fingerprint, Zap } from 'lucide-react';
import GlassCard from './GlassCard';

const InnovationFramework: React.FC = () => {
  const capabilities = [
    {
      icon: <Fingerprint size={18} />,
      label: "VISIÓN",
      title: "Reconocimiento de Patrones",
      desc: "Identificamos anomalías y oportunidades en flujos de datos complejos mediante Computer Vision."
    },
    {
      icon: <BarChart3 size={18} />,
      label: "CLARIDAD",
      title: "Análisis de Inferencia",
      desc: "Simplificamos la toma de decisiones críticas con modelos de probabilidad de alta precisión."
    },
    {
      icon: <Cpu size={18} />,
      label: "ESTRATEGIA",
      title: "Optimización Algorítmica",
      desc: "Soluciones de IA a medida diseñadas para integrarse en la arquitectura de tu negocio."
    },
    {
      icon: <Zap size={18} />,
      label: "IMPACTO",
      title: "Escalabilidad Dinámica",
      desc: "Sistemas que aprenden y evolucionan con cada interacción, maximizando el ROI tecnológico."
    }
  ];

  return (
    <section id="innovacion" className="py-24 px-6 bg-[#0A0E27] relative">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-16 items-center">
        
        {/* Lado Izquierdo: Mensaje Principal Refinado */}
        <div className="lg:col-span-2 space-y-8">
          <div className="inline-flex items-center space-x-2 text-[#10B981] text-[10px] font-bold uppercase tracking-[0.4em]">
            <Zap size={12} fill="#10B981" />
            <span>Infraestructura Cognitiva</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-light text-white leading-tight tracking-tight uppercase">
            Potenciamos tu <br/>
            <span className="text-[#10B981] font-semibold">Capacidad de Anticipación</span>
          </h2>
          
          <p className="text-white/40 text-sm leading-relaxed font-light max-w-md">
            En un entorno saturado de ruido, la verdadera ventaja reside en la inteligencia procesable. Desarrollamos herramientas que ven lo que otros ignoran.
          </p>

          <div className="grid grid-cols-2 gap-y-10 gap-x-4 pt-4">
            {capabilities.map((item, i) => (
              <div key={i} className="space-y-3">
                <div className="text-[#10B981] opacity-80">{item.icon}</div>
                <p className="text-[9px] font-bold text-[#10B981] tracking-[0.2em] uppercase">{item.label}</p>
                <h4 className="text-white text-xs font-semibold uppercase tracking-wider">{item.title}</h4>
                <p className="text-white/30 text-[11px] leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lado Derecho: Visualización de Ecosistema */}
        <div className="lg:col-span-3">
          <GlassCard className="p-12 border-white/5 bg-white/[0.01] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <Cpu size={120} className="text-[#10B981]" strokeWidth={0.5} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <div className="w-16 h-16 rounded-3xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] border border-[#10B981]/20">
                <Cpu size={32} strokeWidth={1.5} />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-light text-white uppercase tracking-tight">
                  Ecosistema <span className="font-semibold">Inteligente Axioma</span>
                </h3>
                <p className="text-white/40 text-sm leading-relaxed font-light max-w-md">
                  Nuestros modelos no son estáticos; diseñamos redes neuronales que aprenden de la operación diaria para volverse más precisas con cada interacción de datos.
                </p>
              </div>

              <button className="px-6 py-3 rounded-xl border border-[#10B981]/30 text-[#10B981] text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#10B981] hover:text-[#0A0E27] transition-all duration-500">
                Optimización Activa
              </button>
            </div>
          </GlassCard>
        </div>

      </div>
    </section>
  );
};

export default InnovationFramework;