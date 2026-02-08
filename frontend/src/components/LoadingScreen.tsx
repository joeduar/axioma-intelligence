import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
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
    <div className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Fondo con brillo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05),transparent_70%)]" />

      {/* Logo AXIOMA Central */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center mb-16 relative z-10"
      >
        <img src="/favicon.png" alt="Axioma" className="w-16 h-16 mb-6 opacity-80" />
        <h1 className="text-3xl font-light text-white uppercase tracking-[0.6em]">
          AXIOMA
        </h1>
        <span className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mt-2">
          Ventures Intelligence
        </span>
      </motion.div>

      {/* Contador de Lanzamiento */}
      <div className="grid grid-cols-4 gap-8 md:gap-16 relative z-10">
        {[
          { label: 'Días', value: timeLeft.days },
          { label: 'Horas', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Segs', value: timeLeft.seconds }
        ].map((item, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-4xl md:text-5xl font-extralight text-white tracking-tighter mb-2">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-bold tracking-[0.3em] text-[#10B981]/60 uppercase">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Texto de Estado */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-20 text-center relative z-10"
      >
        <p className="text-slate-500 text-[10px] font-medium uppercase tracking-[0.4em] mb-4">
          Sistema en fase de despliegue final
        </p>
        <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-[#10B981]/30 to-transparent mx-auto" />
      </motion.div>
    </div>
  );
};

export default LoadingScreen;