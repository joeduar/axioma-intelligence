import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Importante para la navegación sin recarga
import { Menu, X, Brain } from 'lucide-react';

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
        isScrolled ? 'py-4 bg-[#020617]/80 backdrop-blur-xl border-b border-[#10B981]/10' : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <Brain className="w-10 h-10 text-[#10B981] transition-transform duration-500 group-hover:rotate-[360deg]" />
            <div className="absolute -inset-1 bg-[#10B981]/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tighter text-white block leading-none">
              AXIOMA VENTURES
            </span>
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase">
              Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop Navigation - Sin el botón de Portal */}
        <div className="hidden md:flex items-center gap-10">
          <Link 
            to="/soluciones" 
            className="text-xs font-bold tracking-[0.2em] text-gray-400 hover:text-[#10B981] transition-colors uppercase"
          >
            Soluciones
          </Link>
          <Link 
            to="/sectores" 
            className="text-xs font-bold tracking-[0.2em] text-gray-400 hover:text-[#10B981] transition-colors uppercase"
          >
            Sectores
          </Link>
          <Link 
            to="/contacto" 
            className="text-xs font-bold tracking-[0.2em] text-gray-400 hover:text-[#10B981] transition-colors uppercase"
          >
            Contacto
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#020617] border-b border-[#10B981]/10 p-6 flex flex-col gap-6 md:hidden animate-in fade-in slide-in-from-top-4">
          <Link 
            to="/soluciones" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold tracking-widest text-gray-400 hover:text-[#10B981]"
          >
            SOLUCIONES
          </Link>
          <Link 
            to="/sectores" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold tracking-widest text-gray-400 hover:text-[#10B981]"
          >
            SECTORES
          </Link>
          <Link 
            to="/contacto" 
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-bold tracking-widest text-gray-400 hover:text-[#10B981]"
          >
            CONTACTO
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;