import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0E27] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full flex flex-col items-center space-y-12">
        
        {/* Logo Real con Animación de Pulso */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#10B981]/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center transition-transform duration-700 hover:scale-110">
            <img 
              src="/favicon.png" 
              alt="Axioma Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.4)]"
            />
          </div>
        </div>

        {/* Texto de Identidad */}
        <div className="text-center space-y-4">
          <h1 className="text-white text-3xl md:text-4xl font-black tracking-[0.2em] uppercase leading-tight">
            Axioma Ventures<br />
            <span className="text-[#10B981]">Intelligence</span>
          </h1>
          <p className="text-white/40 text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase">
            Inteligencia Artificial Aplicada
          </p>
        </div>

       {/* Barra de Progreso y Mensaje Centrados */}
        <div className="w-full max-w-sm flex flex-col items-center space-y-6">
          {/* Barra de progreso con ancho controlado para centrado perfecto */}
          <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-transparent via-[#10B981] to-transparent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Contenedor de texto con alineación central absoluta */}
          <div className="flex flex-col items-center w-full text-center space-y-3">
            <span className="text-[#10B981] text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse w-full">
              Desplegando arquitectura de inteligencia estratégica...
            </span>
            <span className="text-white/20 text-[9px] font-medium tracking-[0.5em] uppercase w-full">
              Axioma Ventures Intelligence C.A 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;