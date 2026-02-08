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
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        <Link to="/" className="flex items-center gap-3 group">
  <img 
    src="/favicon.png" 
    alt="Axioma Logo" 
    className="w-12 h-12 object-contain" 
    style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.3))' }}
  />
  <div className="flex flex-col justify-center">
    {/* PALABRA PREDOMINANTE */}
    <span className="text-3xl font-black tracking-tighter text-white leading-[0.8] uppercase">
      AXIOMA
    </span>
    {/* DESCRIPTOR SECUNDARIO */}
    <span className="text-[9px] font-bold tracking-[0.4em] text-[#10B981] uppercase mt-1">
      VENTURES INTELLIGENCE
    </span>
  </div>
</Link>

        {/* NAVEGACIÓN DESKTOP */}
        <div className="hidden md:flex items-center gap-10">
          <Link to="/soluciones" className="text-xs font-bold tracking-[0.2em] text-gray-400 hover:text-[#10B981] transition-colors uppercase">
            Soluciones
          </Link>
          <Link to="/sectores" className="text-xs font-bold tracking-[0.2em] text-gray-400 hover:text-[#10B981] transition-colors uppercase">
            Sectores
          </Link>
          <Link 
            to="/" 
            onClick={() => {
              setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }, 500); 
            }}
            className="text-xs font-bold tracking-[0.2em] text-gray-400 hover:text-[#10B981] transition-colors uppercase"
          >
            Contacto
          </Link>
        </div>

        {/* MENÚ MÓVIL */}
        <button className="md:hidden text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#020617] border-b border-[#10B981]/10 p-6 flex flex-col gap-6 md:hidden">
          <Link to="/soluciones" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-widest text-gray-400">SOLUCIONES</Link>
          <Link to="/sectores" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold tracking-widest text-gray-400">SECTORES</Link>
          <Link 
            to="/" 
            onClick={() => {
              setIsMobileMenuOpen(false);
              setTimeout(() => {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }, 500);
            }} 
            className="text-sm font-bold tracking-widest text-gray-400"
          >
            CONTACTO
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;