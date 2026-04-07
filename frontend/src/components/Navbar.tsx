import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Asesores', path: '/asesores' },
    { label: 'Como funciona', path: '/como-funciona' },
    { label: 'Nosotros', path: '/nosotros' },
  ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getDashboardPath = () => {
    return profile?.role === 'asesor' ? '/dashboard/asesor' : '/dashboard/cliente';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? 'py-3 bg-[#0A0E27]/95 backdrop-blur-xl border-b border-[#10B981]/10'
        : 'py-5 bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/favicon.png"
            alt="Axioma Logo"
            className="w-10 h-10 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }}
          />
          <div className="flex flex-col justify-center">
            <span className="text-2xl font-black tracking-tighter text-white leading-none uppercase">
              AXIOMA
            </span>
            <span className="text-[8px] font-bold tracking-[0.4em] text-[#10B981] uppercase mt-0.5">
              VENTURES INTELLIGENCE
            </span>
          </div>
        </Link>

        {/* NAVEGACION DESKTOP */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-colors ${isActive(link.path) ? 'text-[#10B981]' : 'text-gray-400 hover:text-white'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* BOTONES DERECHA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#10B981]/30 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[#10B981]/20 flex items-center justify-center">
                  <User size={12} className="text-[#10B981]" />
                </div>
                <span className="text-white text-[11px] font-bold">
                  {profile?.full_name?.split(' ')[0] || 'Mi cuenta'}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#0A0E27] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50">
                  <Link
                    to={getDashboardPath()}
                    className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-wider"
                  >
                    <LayoutDashboard size={14} className="text-[#10B981]" />
                    Mi dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-red-400 hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-wider border-t border-white/5"
                  >
                    <LogOut size={14} />
                    Cerrar sesion
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-white transition-colors px-4 py-2"
              >
                Ingresar
              </Link>
              <Link
                to="/registro"
                className="text-[11px] font-bold tracking-[0.2em] uppercase bg-[#10B981] text-[#0A0E27] px-5 py-2.5 rounded-full hover:bg-[#0ea371] transition-all"
              >
                Soy asesor
              </Link>
            </>
          )}
        </div>

        {/* MENU MOVIL */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MENU MOVIL DESPLEGABLE */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#0A0E27]/98 backdrop-blur-xl border-b border-[#10B981]/10 p-6 flex flex-col gap-5 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`text-sm font-bold tracking-widest uppercase transition-colors ${isActive(link.path) ? 'text-[#10B981]' : 'text-gray-400'
                }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/5 pt-5 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  to={getDashboardPath()}
                  className="text-sm font-bold tracking-widest uppercase text-white text-center py-2"
                >
                  Mi dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-bold tracking-widest uppercase text-red-400 text-center py-2"
                >
                  Cerrar sesion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold tracking-widest uppercase text-gray-400 text-center py-2"
                >
                  Ingresar
                </Link>
                <Link
                  to="/registro"
                  className="text-sm font-bold tracking-widest uppercase bg-[#10B981] text-[#0A0E27] text-center py-3 rounded-full"
                >
                  Soy asesor
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;