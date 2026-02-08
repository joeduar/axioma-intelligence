import React, { useState, useEffect } from 'react';

const LoadingScreen: React.FC = () => {
  // CONFIGURA TU FECHA AQUÍ (Año, Mes (0-11), Día, Hora, Minuto)
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
    <div className="fixed inset-0 z-[100] bg-[#0A0E27] flex flex-col items-center justify-center p-6 text-center">
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

        {/* NOMBRE DE LA MARCA - TIPOGRAFÍA ORIGINAL RECUPERADA */}
        <div className="space-y-4">
          <h1 className="text-white text-3xl md:text-4xl font-black tracking-[0.2em] uppercase leading-tight">
            Axioma <br />
            <span className="text-[#10B981]"> Ventures Intelligence</span>
          </h1>
          <p className="text-white/40 text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase">
            Inteligencia de Negocios AXIOMA
          </p>
        </div>

        {/* Contador de Lanzamiento Minimalista */}
        <div className="grid grid-cols-4 gap-6 md:gap-10 w-full pt-10 border-t border-white/5">
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
              <span className="text-[8px] font-bold tracking-[0.3em] text-[#10B981]/60 uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer de Mantenimiento Centrado */}
        <div className="flex flex-col items-center space-y-3 pt-6">
          <span className="text-[#10B981] text-[10px] font-bold tracking-[0.3em] uppercase animate-pulse w-full text-center">
            LA IA ES EL FUTURO DEL MUNDO
          </span>
          <span className="text-white/20 text-[9px] font-medium tracking-[0.5em] uppercase w-full text-center">
            Axioma Ventures Intelligence C.A - TODOS LOS DERECHOS RESERVADOS © 2026
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;