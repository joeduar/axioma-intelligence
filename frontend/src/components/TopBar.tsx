import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Props {
  role: 'cliente' | 'asesor';
  pendingCount?: number;
  title?: string;
}

const TopBar: React.FC<Props> = ({ role, pendingCount = 0, title }) => {
  const { profile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';
  const unreadCount = notifications.filter(n => !n.read).length + pendingCount;

  useEffect(() => {
    if (profile) fetchNotifications();
  }, [profile]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile?.id)
      .order('created_at', { ascending: false })
      .limit(10);
    setNotifications(data || []);
  };

  const markAllRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', profile?.id)
      .eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-14 border-b border-white/5 bg-[#0A0E27] flex items-center justify-between px-6 flex-shrink-0">

      {/* TITULO DE SECCION */}
      <div>
        {title && (
          <p className="text-white font-bold text-sm uppercase tracking-wider">{title}</p>
        )}
      </div>

      {/* ACCIONES DERECHA */}
      <div className="flex items-center gap-3">

        {/* NOTIFICACIONES */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#10B981] rounded-full text-[8px] font-black text-[#0A0E27] flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#0D1230] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <p className="text-white text-xs font-bold uppercase tracking-wider">Notificaciones</p>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[#10B981] text-[9px] font-bold uppercase tracking-wider hover:opacity-80">
                      Marcar leidas
                    </button>
                  )}
                  <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {pendingCount > 0 && role === 'asesor' && (
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

                {notifications.length > 0 ? notifications.map((notif) => (
                  <div key={notif.id} className={`px-4 py-3 border-b border-white/5 last:border-0 ${!notif.read ? 'bg-white/[0.02]' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${!notif.read ? 'bg-[#10B981]' : 'bg-white/10'}`} />
                      <div>
                        <p className="text-slate-300 text-xs leading-relaxed">{notif.message}</p>
                        <p className="text-slate-600 text-[10px] mt-0.5">
                          {new Date(notif.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="px-4 py-8 text-center">
                    <CheckCircle size={24} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-xs">No tienes notificaciones</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* PERFIL */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <div className="w-6 h-6 rounded-lg bg-[#10B981]/20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={firstName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#10B981] text-[10px] font-black">{firstName[0].toUpperCase()}</span>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-white text-[11px] font-bold leading-none">{firstName}</p>
            <p className="text-slate-500 text-[9px] uppercase tracking-wider mt-0.5">{role}</p>
          </div>
        </div>

      </div>
    </header>
  );
};

export default TopBar;
