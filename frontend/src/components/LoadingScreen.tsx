import React, { useState } from 'react';

interface LoadingProps {
  onAccess: () => void;
}

const LoadingScreen: React.FC<LoadingProps> = ({ onAccess }) => {
  const [passcode, setPasscode] = useState('');
  const [showInput, setShowInput] = useState(false);

  const checkCode = () => {
    // Código especial: AXIOMA2026
    if (passcode === 'AXIOMA2026') {
      localStorage.setItem('auth_access', 'true');
      onAccess();
    } else {
      alert('Código incorrecto');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#0A0E27] flex flex-col items-center justify-center p-4 md:p-6 text-center overflow-hidden">
      {/* Fondo con resplandor sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />

      <div className="w-full max-w-2xl flex flex-col items-center space-y-8 md:space-y-12 relative z-10">
        
        {/* 1. LOGO CON PULSO */}
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

        {/* 2. IDENTIDAD DE MARCA RESPONSIVE */}
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

        {/* 3. INPUT DE ACCESO ESPECIAL (Solo aparece al activar el botón oculto) */}
        {showInput && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
            <input 
              type="password"
              placeholder="INGRESAR CLAVE"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && checkCode()}
              className="bg-white/5 border border-[#10B981]/30 rounded-full px-6 py-2 text-white text-[10px] tracking-[0.3em] outline-none focus:border-[#10B981] transition-all w-64"
            />
            <button 
              onClick={checkCode}
              className="text-[#10B981] text-[9px] font-bold tracking-[0.4em] uppercase hover:brightness-125 transition-all"
            >
              VERIFICAR →
            </button>
          </div>
        )}

        {/* 4. FOOTER RESPONSIVE */}
        <div className="flex flex-col items-center space-y-4 md:space-y-6 pt-6 md:pt-10 w-full px-4">
          <span className="text-[#10B981] text-[8px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase max-w-[280px] md:max-w-none animate-pulse">
            ESTAMOS DESARROLLANDO LAS HERRAMIENTAS DEL PRESENTE PARA EL NUEVO FUTURO
          </span>
          <p className="text-white/20 text-[7px] md:text-[9px] font-medium tracking-[0.1em] md:tracking-[0.2em] uppercase leading-relaxed">
            AXIOMA VENTURES INTELLIGENCE C.A <br className="md:hidden" />
            TODOS LOS DERECHOS RESERVADOS © 2026
          </p>
        </div>
      </div>

      {/* BOTÓN "INVISIBLE" EN LA ESQUINA PARA ACCESO ADMIN */}
      <button 
        onClick={() => setShowInput(!showInput)}
        className="absolute bottom-4 right-4 text-white/5 text-[8px] hover:text-white/20 transition-colors z-50 uppercase tracking-widest"
      >
        Admin Access
      </button>
    </div>
  );
};

export default LoadingScreen;