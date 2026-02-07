import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-4 bg-[#020617]/90 backdrop-blur-xl border-b border-[#10B981]/10' : 'py-6 bg-transparent'
      }`}
    >
      {/* Añadimos este div que faltaba para centrar todo */}
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO ORIGINAL RESTAURADO */}
        <Link to="/" className="flex items-center gap-3 group">
          <img 
            src="/logo.png" 
            alt="Axioma Ventures Logo" 
            className="w-10 h-10 object-contain" 
          />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-white leading-none uppercase">
              AXIOMA VENTURES
            </span>
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase">
              INTELLIGENCE
            </span>
          </div>
        </Link>

        {/* NAVEGACIÓN DESKTOP - SIN BOTÓN PORTAL */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/soluciones" className="text-xs font-bold tracking-[0.2em] text-gray-400 hover:text-[#10B981] transition-colors uppercase">
            Soluciones
          </Link>
          <Link to="/sectores" className="text-xs font-bold tracking-[0.2em] text-gray-400 hover:text-[#10B981] transition-colors uppercase">
            Sectores
          </Link>
          <Link to="/contacto" className="text-xs font-bold tracking-[0.2em] text-gray-400 hover:text-[#10B981] transition-colors uppercase">
            Contacto
          </Link>
        </div>

        {/* MENÚ MÓVIL (BOTÓN) */}
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div> {/* Este es el cierre del div que faltaba */}

      {/* MENÚ MÓVIL (DESPLEGABLE) */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#020617] border-b border-[#10B981]/10 p-6 flex flex-col gap-6 md:hidden">
          <Link to="/soluciones" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-widest text-gray-400">SOLUCIONES</Link>
          <Link to="/sectores" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-widest text-gray-400">SECTORES</Link>
          <Link to="/contacto" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-widest text-gray-400">CONTACTO</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;