import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, Search, User, Settings,
  LogOut, Bell, ChevronLeft, ChevronRight, Shield,
  MessageCircle, DollarSign, Users, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoutScreen from './LogoutScreen';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

interface Props {
  role: 'cliente' | 'asesor';
  pendingCount?: number;
  onNavigate?: (tab: string) => void;
  activeTab?: string;
}

const Sidebar: React.FC<Props> = ({ role, pendingCount = 0, onNavigate, activeTab }) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';

  const clientItems: NavItem[] = [
    { label: 'Inicio', path: 'inicio', icon: <LayoutDashboard size={18} /> },
    { label: 'Mis sesiones', path: 'sesiones', icon: <Calendar size={18} /> },
    { label: 'Explorar asesores', path: 'explorar', icon: <Search size={18} /> },
    { label: 'Mensajes', path: 'mensajes', icon: <MessageCircle size={18} /> },
    { label: 'Mi perfil', path: 'perfil', icon: <User size={18} /> },
  ];

  const advisorItems: NavItem[] = [
    { label: 'Inicio', path: 'inicio', icon: <LayoutDashboard size={18} /> },
    { label: 'Solicitudes', path: 'solicitudes', icon: <Bell size={18} />, badge: pendingCount > 0 ? pendingCount : undefined },
    { label: 'Sesiones', path: 'sesiones', icon: <Calendar size={18} /> },
    { label: 'Mensajes', path: 'mensajes', icon: <MessageCircle size={18} /> },
    { label: 'Ingresos', path: 'ingresos', icon: <DollarSign size={18} /> },
    { label: 'Mi perfil', path: 'perfil', icon: <User size={18} /> },
  ];

  const items = role === 'cliente' ? clientItems : advisorItems;

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
  };

  return (
    <>
      {loggingOut && <LogoutScreen onComplete={() => navigate('/')} />}

      <aside className={`
        flex flex-col h-screen bg-[#080C20] border-r border-white/5
        transition-all duration-300 ease-in-out flex-shrink-0
        ${collapsed ? 'w-16' : 'w-56'}
      `}>

        {/* LOGO */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
          <Link to={role === 'asesor' ? '/dashboard/asesor' : '/dashboard/cliente'}>
            <img
              src="/favicon.png"
              alt="Axioma"
              className="w-8 h-8 object-contain flex-shrink-0"
              style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }}
            />
          </Link>
          {!collapsed && (
            <Link to={role === 'asesor' ? '/dashboard/asesor' : '/dashboard/cliente'} className="flex flex-col">
              <span className="text-white font-black tracking-tighter uppercase text-sm leading-none">AXIOMA</span>
              <span className="text-[#10B981] text-[6px] font-bold tracking-[0.3em] uppercase mt-0.5">VENTURES</span>
            </Link>
          )}
        </div>

        {/* PERFIL MINI */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={firstName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#10B981] text-[11px] font-black">{firstName[0].toUpperCase()}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-[11px] font-bold truncate">{profile?.full_name}</p>
                <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                  {role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* NAV ITEMS */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = activeTab === item.path;
            return (
              <button
                key={item.path}
                onClick={() => onNavigate?.(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && (
                  <span className="text-[11px] font-bold uppercase tracking-wider truncate">
                    {item.label}
                  </span>
                )}
                {item.badge && item.badge > 0 && (
                  <span className={`
                    w-5 h-5 bg-amber-400 text-[#0A0E27] rounded-full text-[9px] font-black flex items-center justify-center flex-shrink-0
                    ${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'}
                  `}>
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#0D1230] border border-white/10 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* SEPARADOR */}
        <div className="px-2 pb-2 space-y-1 border-t border-white/5 pt-2">
          <Link
            to="/"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all group relative ${collapsed ? 'justify-center' : ''}`}
          >
            <Shield size={16} className="flex-shrink-0" />
            {!collapsed && <span className="text-[11px] font-bold uppercase tracking-wider">Ir al sitio</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#0D1230] border border-white/10 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Ir al sitio
              </div>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all group relative ${collapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && <span className="text-[11px] font-bold uppercase tracking-wider">Cerrar sesion</span>}
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-[#0D1230] border border-white/10 rounded-lg text-white text-[10px] font-bold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                Cerrar sesion
              </div>
            )}
          </button>
        </div>

        {/* COLLAPSE BUTTON */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center py-3 border-t border-white/5 text-slate-600 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

      </aside>
    </>
  );
};

export default Sidebar;
