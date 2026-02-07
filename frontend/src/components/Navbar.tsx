import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4 ${
      isScrolled ? 'bg-[#0A0E27]/90 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        
       {/* Logo con Imagen Real y Texto en dos líneas */}
<div className="flex items-center gap-4 group cursor-pointer">
  {/* Contenedor del Logo - Un poco más grande */}
  <div className="flex items-center justify-center shrink-0">
    <img 
      src="/favicon.png" 
      alt="Axioma Logo" 
      className="w-10 h-10 md:w-12 md:h-12 object-contain transition-transform group-hover:scale-105"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  </div>

  {/* Contenedor del Texto - Apilado verticalmente */}
  <div className="flex flex-col justify-center leading-none">
    <span className="text-white font-black tracking-tighter text-lg md:text-xl uppercase">
      Axioma Ventures
    </span>
    <span className="text-[#10B981] font-bold tracking-[0.15em] text-[10px] md:text-[11px] uppercase mt-0.5">
      Intelligence
    </span>
  </div>
</div>

        {/* Navegación Desktop */}
        <div className="hidden md:flex items-center gap-10">
          {[
            { name: 'Soluciones', href: '#soluciones' },
            { name: 'Sectores', href: '#sectores' },
            { name: 'Contacto', href: '#contacto' }
          ].map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-white/50 hover:text-[#10B981] text-[10px] font-medium uppercase tracking-[0.3em] transition-all"
            >
              {link.name}
            </a>
          ))}
          
          <button 
            onClick={onLoginClick}
            className="px-5 py-2 rounded-lg border border-[#10B981]/30 bg-[#10B981]/5 text-[#10B981] text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-[#10B981] hover:text-[#0A0E27] transition-all"
          >
            Portal Acceso
          </button>
        </div>

        {/* Botón Móvil */}
        <button className="md:hidden text-white/70" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menú Móvil */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-[#0A0E27]/95 backdrop-blur-xl border-b border-white/5 p-8 flex flex-col gap-6 md:hidden animate-in fade-in slide-in-from-top-4">
          {['Soluciones', 'Sectores', 'Contacto'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-white/60 font-medium uppercase tracking-[0.3em] text-[10px] hover:text-[#10B981] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </a>
          ))}
          <button 
            onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}
            className="w-full py-3.5 rounded-xl bg-[#10B981] text-[#0A0E27] font-bold text-[10px] uppercase tracking-widest"
          >
            Portal Acceso
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;