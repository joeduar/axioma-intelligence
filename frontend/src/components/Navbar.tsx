import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Bell, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';
  const isAdvisor = profile?.role === 'asesor';
  const isHome = location.pathname === '/';
  const isDark = !isHome; // Azul oscuro en todas las páginas excepto home

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { label: 'Advisors', path: '/asesores' },
    { label: 'How it works', path: '/como-funciona' },
    { label: 'About', path: '/nosotros' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Estilos dinámicos según página
  const navBg = isDark
    ? scrolled ? 'bg-[#0A0E27]/98 backdrop-blur-md shadow-lg shadow-[#0A0E27]/20' : 'bg-[#0A0E27]'
    : scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white';

  const logoText = isDark ? 'text-white' : 'text-[#0A0E27]';
  const linkColor = isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-[#0A0E27] hover:bg-gray-50';
  const linkActive = isDark ? 'text-white bg-white/10' : 'text-[#0A0E27] bg-gray-100';
  const mobileBtn = isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center h-16 gap-8">

            {/* LOGO — izquierda */}
            <Link
              to={user ? (isAdvisor ? '/dashboard/asesor' : '/dashboard/cliente') : '/'}
              className="flex items-center gap-2.5 flex-shrink-0"
            >
              <img src="/favicon.png" alt="Axioma" className="w-8 h-8 object-contain"
                style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.3))' }} />
              <div>
                <p className={`font-black tracking-tighter uppercase text-sm leading-none ${logoText}`}>AXIOMA</p>
                <p className="text-[#10B981] text-[6px] font-bold tracking-[0.35em] uppercase leading-none mt-0.5">VENTURES INTELLIGENCE</p>
              </div>
            </Link>

            {/* NAV LINKS — ligeramente descentrados a la izquierda para asimetría */}
            <div className="hidden md:flex items-center gap-1 flex-1 justify-center pl-16">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path) ? linkActive : linkColor
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* ACCIONES — pegados al extremo derecho */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              {user ? (
                <>
                  <Link
                    to={isAdvisor ? '/dashboard/asesor' : '/dashboard/cliente'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-[#0A0E27] hover:bg-gray-50'
                    }`}
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Link>

                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border transition-all ${
                        isDark
                          ? 'border-white/15 hover:border-white/30 bg-white/5'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-lg overflow-hidden bg-[#10B981]/20 flex items-center justify-center flex-shrink-0">
                        {profile?.avatar_url ? (
                          <img src={profile.avatar_url} alt={firstName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#10B981] text-[10px] font-black">{firstName[0].toUpperCase()}</span>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{firstName}</span>
                      <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''} ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-bold text-gray-800">{profile?.full_name}</p>
                          <p className="text-xs text-gray-400">{profile?.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link to={isAdvisor ? '/dashboard/asesor' : '/dashboard/cliente'}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
                            <LayoutDashboard size={14} className="text-[#10B981]" /> My dashboard
                          </Link>
                          <Link to={isAdvisor ? '/dashboard/asesor' : '/dashboard/cliente'}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
                            <User size={14} className="text-[#10B981]" /> My profile
                          </Link>
                          <button onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-50 transition-all">
                            <LogOut size={14} /> Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className={`text-sm font-medium transition-all ${
                      isDark ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-[#0A0E27]'
                    }`}>
                    Sign in
                  </Link>
                  <Link to="/registro"
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-[#10B981] text-white hover:bg-[#0ea371] transition-all shadow-sm shadow-[#10B981]/20 hover:shadow-md hover:shadow-[#10B981]/25">
                    Get started
                  </Link>
                </>
              )}
            </div>

            {/* MOBILE BUTTON */}
            <button onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg transition-all ml-auto ${mobileBtn}`}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className={`md:hidden border-t px-6 py-4 space-y-1 ${
            isDark ? 'bg-[#0A0E27] border-white/10' : 'bg-white border-gray-100'
          }`}>
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'
                }`}>
                {link.label}
              </Link>
            ))}
            <div className={`pt-2 border-t space-y-2 ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
              {user ? (
                <>
                  <Link to={isAdvisor ? '/dashboard/asesor' : '/dashboard/cliente'}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium ${isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-50'}`}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout}
                    className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={`block px-4 py-3 rounded-xl text-sm font-medium text-center border ${isDark ? 'border-white/20 text-white/70' : 'border-gray-200 text-gray-600'}`}>
                    Sign in
                  </Link>
                  <Link to="/registro" className="block px-4 py-3 rounded-xl text-sm font-semibold text-center bg-[#10B981] text-white">
                    Get started
                  </Link>
                  <Link to="/registro?role=asesor" className="block px-4 py-3 rounded-xl text-sm font-medium text-center text-[#10B981] border border-[#10B981]/30">
                    Be an advisor
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
    </>
  );
};

export default Navbar;
