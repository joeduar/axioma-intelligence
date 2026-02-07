import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => {
  return (
    <div 
      className={`
        relative overflow-hidden
        backdrop-blur-2xl bg-[#0A0E27]/40 
        border border-white/10 
        rounded-2xl 
        shadow-[0_20px_50px_rgba(0,0,0,0.5)] 
        group transition-all duration-700
        ${className}
      `}
    >
      {/* Efecto de Brillo de Barrido (Light Sweep) - Refinado */}
      <div className="absolute inset-0 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent z-10" />
      
      {/* Resplandor interno en el borde superior con el verde esmeralda de la firma */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#10B981]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Contenido con prioridad visual */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};

export default GlassCard;