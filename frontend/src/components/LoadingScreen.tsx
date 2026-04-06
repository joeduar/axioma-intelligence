import React, { useEffect } from 'react';

interface LoadingProps {
  onAccess: () => void;
}

const LoadingScreen: React.FC<LoadingProps> = ({ onAccess }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAccess();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onAccess]);

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0E27] flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(16,185,129,0.05), transparent 65%)' }}
      />

      <div className="flex flex-col items-center gap-8 relative z-10">

        <div className="relative">
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(16,185,129,0.15)', filter: 'blur(24px)' }}
          />
          <img
            src="/favicon.png"
            alt="Axioma"
            className="w-16 h-16 object-contain relative z-10"
            style={{ filter: 'drop-shadow(0 0 20px rgba(16,185,129,0.4))' }}
          />
        </div>

        <div className="text-center">
          <h1 className="text-white text-2xl font-black tracking-[0.25em] uppercase">
            AXIOMA
          </h1>
          <p className="text-[#10B981] text-[9px] font-bold tracking-[0.45em] uppercase mt-1">
            VENTURES INTELLIGENCE
          </p>
        </div>

        <div className="w-48 h-px bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#10B981] rounded-full"
            style={{ animation: 'loadprogress 2.6s ease-in-out forwards' }}
          />
        </div>

        <p className="text-white/20 text-[9px] font-bold tracking-[0.3em] uppercase">
          Cargando plataforma
        </p>
      </div>

      <style>{`
        @keyframes loadprogress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;