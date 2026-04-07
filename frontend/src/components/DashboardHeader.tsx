import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, Settings, LogOut, LayoutDashboard,
  ChevronDown, X, CheckCircle, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Props {
  onSettingsClick?: () => void;
  role: 'cliente' | 'asesor';
  pendingCount?: number;
}

const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'session',
    text: 'Bienvenido a Axioma Ventures Intelligence',
    time: 'Hoy',
    read: false,
  },
  {
    id: '2',
    type: 'system',
    text: 'Completa tu perfil para empezar a recibir clientes',
    time: 'Hoy',
    read: false,
  },
];

const DashboardHeader: React.FC<Props> = ({ onSettingsClick, role, pendingCount = 0 }) => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';
  const unreadCount = notifications.filter(n => !n.read).length + pendingCount;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="border-b border-white/5 px-6 py-4 bg-[#0A0E27]">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/favicon.png"
            alt="Axioma"
            className="w-8 h-8 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.3))' }}
          />
          <div>
            <p className="text-white font-black tracking-tighter uppercase text-base leading-none">
              AXIOMA
            </p>
            <p className="text-[#10B981] text-[7px] font-bold tracking-[0.4em] uppercase">
              VENTURES INTELLIGENCE
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">

          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#10B981] rounded-full text-[8px] font-black text-[#0A0E27] flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#0D1230] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <p className="text-white text-xs font-bold uppercase tracking-wider">
                    Notificaciones
                  </p>
                  <div className="flex items-center gap-3">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[#10B981] text-[9px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
                      >
                        Marcar leidas
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {pendingCount > 0 && (
                    <div className="px-4 py-3 border-b border-white/5 bg-amber-400/5">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                        <div>
                          <p className="text-white text-xs font-medium">
                            Tienes {pendingCount} solicitud{pendingCount > 1 ? 'es' : ''} pendiente{pendingCount > 1 ? 's' : ''}
                          </p>
                          <p className="text-slate-500 text-[10px] mt-0.5">Ahora</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-white/5 last:border-0 ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${!notif.read ? 'bg-[#10B981]' : 'bg-white/10'}`} />
                        <div>
                          <p className="text-slate-300 text-xs leading-relaxed">{notif.text}</p>
                          <p className="text-slate-600 text-[10px] mt-0.5">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && pendingCount === 0 && (
                    <div className="px-4 py-8 text-center">
                      <CheckCircle size={24} className="text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500 text-xs">No tienes notificaciones</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {role === 'asesor' && (
            <button
              onClick={onSettingsClick}
              className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              title="Configuracion de perfil"
            >
              <Settings size={18} />
            </button>
          )}

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#10B981]/30 transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-[#10B981]/20 flex items-center justify-center">
                <span className="text-[#10B981] text-[11px] font-black">
                  {firstName[0].toUpperCase()}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-white text-[11px] font-bold leading-none">{firstName}</p>
                <p className="text-slate-500 text-[9px] uppercase tracking-wider mt-0.5">
                  {role}
                </p>
              </div>
              <ChevronDown
                size={13}
                className={`text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#0D1230] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-white text-xs font-bold">{profile?.full_name}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5 truncate">{profile?.email}</p>
                  <span className="inline-block mt-1.5 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    {role}
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    to="/"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-wider"
                  >
                    <LayoutDashboard size={14} className="text-[#10B981]" />
                    Ir al inicio
                  </Link>

                  {role === 'cliente' && (
                    <button
                      onClick={() => {
                        onSettingsClick?.();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-wider"
                    >
                      <User size={14} className="text-[#10B981]" />
                      Mi perfil
                    </button>
                  )}

                  {role === 'asesor' && (
                    <button
                      onClick={() => {
                        onSettingsClick?.();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-wider"
                    >
                      <Settings size={14} className="text-[#10B981]" />
                      Editar perfil
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:text-red-400 hover:bg-white/5 transition-all text-[11px] font-bold uppercase tracking-wider border-t border-white/5 mt-1"
                  >
                    <LogOut size={14} />
                    Cerrar sesion
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
