import React, { useState, useEffect } from 'react';

const LoadingScreen: React.FC = () => {
  // CONFIGURA TU FECHA AQUÍ (Año, Mes (0-11), Día, Hora, Minuto)
  // Ejemplo: 15 de Febrero de 2026
  const targetDate = new Date(2026, 1, 15, 0, 0, 0).getTime(); 
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0E27] flex flex-col items-center justify-center p-6">
      {/* Iluminación de fondo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-md w-full flex flex-col items-center space-y-12 relative z-10">
        
        {/* Logo AXIOMA con Animación de Pulso Original */}
        <div className="relative group">
          <div className="absolute inset-0 bg-[#10B981]/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center transition-transform duration-700 hover:scale-110">
            <img 
              src="/favicon.png" 
              alt="Axioma Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-pulse"
            />
          </div>
        </div>

        {/* Texto de Identidad Estilo Luxury */}
        <div className="text-center space-y-4">
          <h1 className="text-white text-3xl md:text-4xl font-light tracking-[0.5em] uppercase leading-tight">
            AXIOMA
          </h1>
          <p className="text-[#10B981] text-[10px] font-bold tracking-[0.4em] uppercase">
            Ventures Intelligence
          </p>
        </div>

        {/* Contador de Lanzamiento Minimalista */}
        <div className="grid grid-cols-4 gap-6 md:gap-10 w-full pt-8 border-t border-white/5">
          {[
            { label: 'Días', value: timeLeft.days },
            { label: 'Hrs', value: timeLeft.hours },
            { label: 'Min', value: timeLeft.minutes },
            { label: 'Seg', value: timeLeft.seconds }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-extralight text-white tracking-tighter mb-1">
                {String(item.value).padStart(2, '0')}
              </span>
              <span className="text-[8px] font-bold tracking-[0.2em] text-[#10B981]/60 uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Mensaje de Estado Centrado */}
        <div className="flex flex-col items-center w-full text-center space-y-4 pt-6">
          <span className="text-white/40 text-[9px] font-medium tracking-[0.4em] uppercase">
            PRONTO CONOCERAS LAS MARAVILLAS DE LA INTELIGENCIA ARTIFICIAL
          </span>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#10B981]/30 to-transparent" />
          <span className="text-white/20 text-[8px] font-medium tracking-[0.5em] uppercase">
            © 2026 AXIOMA VENTURES INTELLIGENCE
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;