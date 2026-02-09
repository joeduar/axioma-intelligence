import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0E27] flex flex-col items-center justify-center p-4 md:p-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-2xl flex flex-col items-center space-y-8 md:space-y-12 relative z-10">
        
        {/* LOGO CON PULSO: Adaptado de 20 a 32 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#10B981]/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative w-20 h-20 md:w-32 md:h-32 flex items-center justify-center">
            <img 
              src="/favicon.png" 
              alt="Axioma Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-pulse"
            />
          </div>
        </div>

        {/* IDENTIDAD: Ajustes de escala para evitar cortes */}
        <div className="flex flex-col items-center px-2">
          <h1 className="text-white text-3xl md:text-5xl font-black tracking-[0.2em] md:tracking-[0.3em] uppercase mb-1 md:mb-2">
            AXIOMA
          </h1>
          <h2 className="text-[#10B981] text-sm sm:text-lg md:text-2xl font-black tracking-[0.15em] md:tracking-[0.25em] uppercase whitespace-normal sm:whitespace-nowrap">
            VENTURES INTELLIGENCE
          </h2>
          <p className="text-white/40 text-[8px] md:text-xs font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase mt-4">
            INTELIGENCIA DE NEGOCIOS AXIOMA
          </p>
        </div>

        {/* FOOTER: Manejo de texto largo en móviles */}
        <div className="flex flex-col items-center space-y-4 md:space-y-6 pt-6 md:pt-10 w-full px-4">
          <span className="text-[#10B981] text-[8px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase max-w-[280px] md:max-w-none">
            ESTAMOS DESARROLLANDO LAS HERRAMIENTAS DEL PRESENTE PARA EL NUEVO FUTURO
          </span>
          <p className="text-white/20 text-[7px] md:text-[9px] font-medium tracking-[0.1em] md:tracking-[0.2em] uppercase whitespace-normal md:whitespace-nowrap leading-relaxed">
            AXIOMA VENTURES INTELLIGENCE C.A <br className="md:hidden" />
            TODOS LOS DERECHOS RESERVADOS © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;