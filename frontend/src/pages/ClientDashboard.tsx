import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Star, Search, ChevronRight, CheckCircle,
  MessageCircle, Send, MoreHorizontal, Bell, Settings,
  TrendingUp, Users, DollarSign, Activity, ArrowUpRight,
  Paperclip, Smile, X, Plus, PanelRightClose, PanelRightOpen,
  LayoutDashboard, User, LogOut, ChevronLeft, Shield,
  XCircle, ExternalLink, AlertCircle, ChevronDown
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import AvatarUpload from '../components/AvatarUpload';
import LogoutScreen from '../components/LogoutScreen';

const sessionChartData = [
  { mes: 'Ene', sesiones: 0, completadas: 0 },
  { mes: 'Feb', sesiones: 1, completadas: 1 },
  { mes: 'Mar', sesiones: 2, completadas: 1 },
  { mes: 'Abr', sesiones: 1, completadas: 1 },
  { mes: 'May', sesiones: 3, completadas: 2 },
  { mes: 'Jun', sesiones: 2, completadas: 2 },
  { mes: 'Jul', sesiones: 4, completadas: 3 },
];

const progressData = [
  { label: 'Sesiones completadas', value: 75, color: '#10B981' },
  { label: 'Objetivos alcanzados', value: 60, color: '#0A0E27' },
  { label: 'Satisfacción general', value: 90, color: '#10B981' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0E27] text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 text-xs">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

// ── SESSION OPTIONS MENU ──────────────────────────────────
const SessionMenu = ({ session, onCancel }: { session: any; onCancel: () => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all">
        <MoreHorizontal size={14} className="text-gray-400" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            {session.status === 'confirmada' && (
              <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                <ExternalLink size={14} className="text-[#10B981]" /> Join session
              </button>
            )}
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
              <AlertCircle size={14} className="text-blue-500" /> View details
            </button>
            {(session.status === 'pendiente' || session.status === 'confirmada') && (
              <button
                onClick={() => { onCancel(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <XCircle size={14} /> Cancel session
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ── PROFILE MENU (3 puntos panel derecho) ─────────────────
const ProfileMenu = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  const options = [
    { label: 'Edit profile', icon: User, tab: 'perfil' },
    { label: 'My sessions', icon: Calendar, tab: 'sesiones' },
    { label: 'Progress tracking', icon: Activity, tab: 'progreso' },
    { label: 'Explore advisors', icon: Search, tab: 'explorar' },
    { label: 'Notifications', icon: Bell, tab: null },
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all">
        <MoreHorizontal size={14} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            {options.map((opt) => (
              <button key={opt.label}
                onClick={() => { if (opt.tab) onNavigate(opt.tab); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                <opt.icon size={14} className="text-[#10B981]" /> {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── CHAT EN TIEMPO REAL ───────────────────────────────────
const ChatPanel = ({ user, profile, onNavigate }: { user: any; profile: any; onNavigate?: (tab: string) => void }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    checkPlan();
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeConv) return;
    fetchMessages(activeConv.id);
    // Cleanup previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    // New realtime channel
    const channel = supabase
      .channel(`chat-${activeConv.id}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${activeConv.id}`,
      }, (payload) => {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .subscribe();
    channelRef.current = channel;
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [activeConv?.id]);

  const checkPlan = async () => {
    const { data } = await supabase.from('subscriptions').select('id')
      .eq('client_id', user.id).eq('status', 'activa').limit(1);
    setHasActivePlan((data || []).length > 0);
  };

  const fetchConversations = async () => {
    const { data } = await supabase.from('conversations')
      .select('*, advisors(id, title, category, profiles(full_name, avatar_url))')
      .eq('client_id', user.id)
      .order('last_message_at', { ascending: false });
    setConversations(data || []);
    if (data && data.length > 0) setActiveConv(data[0]);
  };

  const fetchMessages = async (convId: string) => {
    const { data } = await supabase.from('messages')
      .select('*, profiles!messages_sender_id_fkey(full_name, avatar_url)')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    await supabase.from('messages').update({ read: true })
      .eq('conversation_id', convId).neq('sender_id', user.id);
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeConv || sending) return;
    setSending(true);
    const content = newMsg.trim();
    setNewMsg('');
    const { data: newMsgData } = await supabase.from('messages')
      .insert({ conversation_id: activeConv.id, sender_id: user.id, content })
      .select('*, profiles!messages_sender_id_fkey(full_name, avatar_url)')
      .single();
    if (newMsgData) {
      setMessages(prev => {
        if (prev.find(m => m.id === newMsgData.id)) return prev;
        return [...prev, newMsgData];
      });
    }
    await supabase.from('conversations')
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq('id', activeConv.id);
    setSending(false);
  };

  if (!hasActivePlan) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
          <MessageCircle size={24} className="text-gray-400" />
        </div>
        <p className="font-semibold text-gray-700 mb-2">Chat bloqueado</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-5">Activa un plan para chatear con tu asesor</p>
        <Link to="/asesores" className="px-5 py-2.5 bg-[#10B981] text-white text-xs font-bold rounded-full hover:bg-[#0ea371] transition-all">
          Ver planes
        </Link>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <MessageCircle size={28} className="text-gray-300 mb-3" />
        <p className="text-gray-400 text-sm">No tienes conversaciones activas</p>
      </div>
    );
  }

  const advisorName = activeConv?.advisors?.profiles?.full_name || 'Asesor';
  const advisorAvatar = activeConv?.advisors?.profiles?.avatar_url;
  const advisorTitle = activeConv?.advisors?.title || activeConv?.advisors?.category || '';

  return (
    <div className="flex flex-col h-full">
      {/* Selector de conversación si hay más de una */}
      {conversations.length > 1 && (
        <div className="px-4 py-2 border-b border-gray-100 overflow-x-auto">
          <div className="flex gap-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all ${
                  activeConv?.id === conv.id
                    ? 'bg-[#0A0E27] text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-[#0F4C35] flex items-center justify-center text-white text-[9px] font-black overflow-hidden flex-shrink-0">
                  {conv.advisors?.profiles?.avatar_url
                    ? <img src={conv.advisors.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (conv.advisors?.profiles?.full_name?.[0] || 'A')}
                </div>
                {conv.advisors?.profiles?.full_name || 'Asesor'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header del chat */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0F4C35] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            {advisorAvatar ? <img src={advisorAvatar} alt="" className="w-full h-full object-cover" /> : advisorName[0]}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{advisorName}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <p className="text-xs text-gray-400">{advisorTitle || 'En línea'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Inicia la conversación con {advisorName}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2 items-end`}>
                {!isOwn && (
                  <div className="w-7 h-7 rounded-full bg-[#0F4C35] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
                    {advisorAvatar ? <img src={advisorAvatar} alt="" className="w-full h-full object-cover" /> : advisorName[0]}
                  </div>
                )}
                <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!isOwn && <p className="text-[10px] text-gray-400 ml-1">{advisorName}</p>}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn ? 'bg-[#0A0E27] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                  <p className={`text-[10px] ${isOwn ? 'text-right' : ''} text-gray-400`}>
                    {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {isOwn && (
                  <div className="w-7 h-7 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] font-bold text-xs flex-shrink-0 overflow-hidden">
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile?.full_name?.[0] || 'C'}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5">
          <button className="text-gray-400 hover:text-gray-600 transition-colors"><Paperclip size={15} /></button>
          <input
            type="text" value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={`Message ${advisorName}...`}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          />
          <button className="text-gray-400 hover:text-gray-600 transition-colors"><Smile size={15} /></button>
          <button onClick={sendMessage} disabled={!newMsg.trim() || sending}
            className="w-8 h-8 bg-[#10B981] rounded-xl flex items-center justify-center hover:bg-[#0ea371] transition-all disabled:opacity-40 flex-shrink-0">
            <Send size={13} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── NAV ITEMS ─────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'inicio', label: 'Home', icon: LayoutDashboard },
  { id: 'sesiones', label: 'Sessions', icon: Calendar },
  { id: 'progreso', label: 'Progress', icon: Activity },
  { id: 'explorar', label: 'Explore', icon: Search },
  { id: 'mensajes', label: 'Messages', icon: MessageCircle },
  { id: 'perfil', label: 'Profile', icon: User },
];

// ── MAIN ──────────────────────────────────────────────────
const ClientDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inicio');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    const [sessionsRes, subsRes, notifsRes] = await Promise.all([
      supabase.from('sessions')
        .select('*, advisors(id, title, category, profiles(full_name, avatar_url)), services(name, price, duration)')
        .eq('client_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('subscriptions')
        .select('*, advisors(title, category, profiles(full_name, avatar_url))')
        .eq('client_id', user?.id).order('created_at', { ascending: false }),
      supabase.from('notifications').select('*').eq('user_id', user?.id)
        .order('created_at', { ascending: false }).limit(10),
    ]);
    setSessions(sessionsRes.data || []);
    setSubscriptions(subsRes.data || []);
    setNotifications(notifsRes.data || []);
    setLoading(false);
  };

  const handleCancelSession = async (sessionId: string) => {
    await supabase.from('sessions').update({ status: 'cancelada' }).eq('id', sessionId);
    fetchAll();
  };

  const handleLogout = async () => { setLoggingOut(true); await signOut(); };

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';
  const pendingSessions = sessions.filter(s => s.status === 'pendiente');
  const completedSessions = sessions.filter(s => s.status === 'completada');
  const confirmedSessions = sessions.filter(s => s.status === 'confirmada');
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const activeSub = subscriptions.find(s => s.status === 'activa');

  const stats = [
    { label: 'Total sessions', value: sessions.length, icon: Calendar, change: sessions.length > 0 ? `+${sessions.length}` : '0', up: sessions.length > 0 },
    { label: 'Completed', value: completedSessions.length, icon: CheckCircle, change: completedSessions.length > 0 ? `+${completedSessions.length}` : '0', up: completedSessions.length > 0 },
    { label: 'Pending', value: pendingSessions.length, icon: Clock, change: pendingSessions.length > 0 ? 'Review' : 'None', up: null },
    { label: 'Active plan', value: activeSub ? '✓' : '–', icon: Shield, change: activeSub ? 'Active' : 'None', up: !!activeSub },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completada': return 'bg-[#10B981]/10 text-[#10B981]';
      case 'confirmada': return 'bg-blue-50 text-blue-500';
      case 'pendiente': return 'bg-amber-50 text-amber-500';
      case 'cancelada': return 'bg-red-50 text-red-400';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completada': return <CheckCircle size={14} className="text-[#10B981]" />;
      case 'confirmada': return <Clock size={14} className="text-blue-500" />;
      default: return <Clock size={14} className="text-amber-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f1f3f5] text-gray-800 overflow-hidden">
      {loggingOut && <LogoutScreen onComplete={() => navigate('/')} />}

      {/* ── SIDEBAR ── */}
      <aside className={`flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0 shadow-sm ${sidebarCollapsed ? 'w-16' : 'w-56'}`}>
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <Link to="/"><img src="/favicon.png" alt="Axioma" className="w-8 h-8 object-contain flex-shrink-0" style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.3))' }} /></Link>
          {!sidebarCollapsed && (
            <Link to="/" className="flex flex-col">
              <span className="font-black tracking-tighter uppercase text-sm leading-none text-[#0A0E27]">AXIOMA</span>
              <span className="text-[#10B981] text-[6px] font-bold tracking-[0.3em] uppercase mt-0.5">VENTURES</span>
            </Link>
          )}
        </div>

        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                  isActive ? 'bg-[#0A0E27] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <item.icon size={17} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-xs font-semibold">{item.label}</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#0A0E27] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-medium">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-2 pb-2 space-y-0.5 border-t border-gray-100 pt-2">
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-50 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <LogOut size={17} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-xs font-semibold">Sign out</span>}
          </button>
        </div>

        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="flex items-center justify-center py-3 border-t border-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
          {sidebarCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOPBAR */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <p className="font-bold text-gray-700 text-sm">
            {activeTab === 'inicio' ? 'Dashboard' : activeTab === 'progreso' ? 'Progress' : activeTab === 'sesiones' ? 'Sessions' : activeTab === 'explorar' ? 'Explore' : activeTab === 'mensajes' ? 'Messages' : 'Profile'}
          </p>
          <div className="flex items-center gap-2">
            {/* Toggle panel derecho */}
            <button onClick={() => setRightPanelVisible(!rightPanelVisible)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all" title={rightPanelVisible ? 'Hide panel' : 'Show panel'}>
              {rightPanelVisible ? <PanelRightClose size={17} className="text-gray-500" /> : <PanelRightOpen size={17} className="text-gray-500" />}
            </button>

            {/* Notificaciones */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-gray-100 rounded-xl transition-all">
                <Bell size={17} className="text-gray-500" />
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#10B981] rounded-full text-[8px] font-black text-white flex items-center justify-center">{unreadNotifs}</span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="font-bold text-gray-800 text-sm">Notifications</p>
                    <button onClick={() => setShowNotifications(false)}><X size={14} className="text-gray-400" /></button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((n) => (
                      <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-[#10B981]/5' : ''}`}>
                        <div className="flex gap-2.5">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-[#10B981]' : 'bg-gray-200'}`} />
                          <div>
                            <p className="text-gray-700 text-xs leading-relaxed">{n.message}</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">{new Date(n.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="px-4 py-8 text-center"><p className="text-gray-400 text-sm">No notifications</p></div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{firstName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Client</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => setActiveTab('perfil')}>
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[#10B981] text-xs font-black">{firstName[0]}</span>}
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* SCROLL AREA */}
          <div className="flex-1 overflow-y-auto">

            {/* ── HOME ── */}
            {activeTab === 'inicio' && (
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Hello, {firstName}! 👋</h1>
                    <p className="text-gray-500 text-sm mt-1">
                      {confirmedSessions.length > 0
                        ? `You have ${confirmedSessions.length} upcoming session${confirmedSessions.length > 1 ? 's' : ''}`
                        : 'Welcome to your advisory dashboard'}
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm">{today}</p>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                          <stat.icon size={17} className="text-[#10B981]" />
                        </div>
                        {stat.up !== null && (
                          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${stat.up ? 'text-[#10B981]' : 'text-gray-400'}`}>
                            {stat.up && <ArrowUpRight size={12} />}
                            {stat.change}
                          </div>
                        )}
                      </div>
                      <p className="text-2xl font-black text-gray-800 mb-1">{stat.value}</p>
                      <p className="text-gray-400 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* CHART */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-bold text-gray-800">Session activity</h2>
                      <p className="text-gray-400 text-xs mt-0.5">Your sessions over the last 7 months</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />Scheduled</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#0A0E27]" />Completed</div>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={170}>
                    <AreaChart data={sessionChartData}>
                      <defs>
                        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0A0E27" stopOpacity={0.1}/><stop offset="95%" stopColor="#0A0E27" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="sesiones" name="Scheduled" stroke="#10B981" strokeWidth={2} fill="url(#g1)" dot={{ fill: '#10B981', r: 3 }} />
                      <Area type="monotone" dataKey="completadas" name="Completed" stroke="#0A0E27" strokeWidth={2} fill="url(#g2)" dot={{ fill: '#0A0E27', r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* PLANES ACTIVOS */}
                {subscriptions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4">Active plans</h2>
                    <div className="space-y-3">
                      {subscriptions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between p-4 bg-[#f1f3f5] rounded-xl border border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] font-black text-sm overflow-hidden">
                              {sub.advisors?.profiles?.avatar_url
                                ? <img src={sub.advisors.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                : sub.advisors?.profiles?.full_name?.[0] || 'A'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">
                                {sub.plan_type === 'plan_completo' ? 'Plan Completo' : 'Sesión Inicial'}
                              </p>
                              <p className="text-gray-500 text-xs">
                                Asesor: <span className="font-semibold text-gray-700">{sub.advisors?.profiles?.full_name || 'N/A'}</span>
                                {sub.advisors?.category && ` · ${sub.advisors.category}`}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            sub.status === 'activa' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-gray-100 text-gray-400'
                          }`}>{sub.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* SESIONES */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-gray-800">Current sessions</h2>
                    <span className="text-xs text-gray-400 font-medium">
                      Done {sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0}%
                    </span>
                  </div>
                  {sessions.length > 0 ? (
                    <div className="space-y-2">
                      {sessions.slice(0, 6).map((session) => (
                        <div key={session.id} className="flex items-center gap-4 p-3 hover:bg-[#f1f3f5] rounded-xl transition-all">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                            session.status === 'completada' ? 'bg-[#10B981]/10' : session.status === 'confirmada' ? 'bg-blue-50' : 'bg-amber-50'
                          }`}>
                            {session.advisors?.profiles?.avatar_url
                              ? <img src={session.advisors.profiles.avatar_url} alt="" className="w-full h-full object-cover rounded-xl" />
                              : getStatusIcon(session.status)
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">
                              {session.advisors?.profiles?.full_name || 'Asesor'}
                            </p>
                            <p className="text-gray-400 text-xs">{session.advisors?.title || session.advisors?.category || 'Asesoría'}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${getStatusStyle(session.status)}`}>
                            {session.status}
                          </span>
                          <SessionMenu session={session} onCancel={() => handleCancelSession(session.id)} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar size={28} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm mb-4">No sessions yet</p>
                      <Link to="/asesores" className="inline-flex items-center gap-2 bg-[#0A0E27] text-white font-bold px-5 py-2.5 rounded-full text-xs hover:bg-[#0A0E27]/90 transition-all">
                        Book first session <ChevronRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SESSIONS TAB ── */}
            {activeTab === 'sesiones' && (
              <div className="p-6 space-y-5">
                <h1 className="text-2xl font-bold text-gray-800">My sessions</h1>
                {sessions.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    {sessions.map((session, i) => (
                      <div key={session.id} className={`flex items-center gap-4 p-5 hover:bg-[#f1f3f5] transition-all ${i < sessions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {session.advisors?.profiles?.avatar_url
                            ? <img src={session.advisors.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                            : <span className="text-gray-500 font-bold text-sm">{session.advisors?.profiles?.full_name?.[0] || 'A'}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm">{session.advisors?.profiles?.full_name || 'Asesor'}</p>
                          <p className="text-gray-400 text-xs">{session.advisors?.title || session.advisors?.category || 'Asesoría'}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${getStatusStyle(session.status)}`}>
                          {session.status}
                        </span>
                        <SessionMenu session={session} onCancel={() => handleCancelSession(session.id)} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                    <Calendar size={32} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 mb-5">No sessions registered yet</p>
                    <Link to="/asesores" className="inline-flex items-center gap-2 bg-[#0A0E27] text-white font-bold px-6 py-3 rounded-full text-xs">
                      Explore advisors <ChevronRight size={13} />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── PROGRESS TAB ── */}
            {activeTab === 'progreso' && (
              <div className="p-6 space-y-5">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Progress tracking</h1>
                  <p className="text-gray-400 text-sm mt-1">Track your growth with your advisor</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {progressData.map((item) => (
                    <div key={item.label} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-semibold text-gray-700 text-sm">{item.label}</p>
                        <p className="font-black text-2xl text-gray-800">{item.value}%</p>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-bold text-gray-800 mb-6">Session performance</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={sessionChartData} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="sesiones" name="Scheduled" fill="#10B981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="completadas" name="Completed" fill="#0A0E27" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-bold text-gray-800 mb-5">Milestones</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'First session completed', done: completedSessions.length >= 1, desc: 'You completed your first advisory session' },
                      { label: 'Active plan acquired', done: subscriptions.length > 0, desc: 'You purchased a subscription plan' },
                      { label: '3 sessions milestone', done: completedSessions.length >= 3, desc: 'Complete 3 advisory sessions' },
                      { label: 'Full plan upgrade', done: subscriptions.some(s => s.plan_type === 'plan_completo'), desc: 'Upgrade to the complete advisory plan' },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#f1f3f5] border border-gray-200">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${m.done ? 'bg-[#10B981]/10 border-2 border-[#10B981]' : 'bg-gray-200 border-2 border-gray-300'}`}>
                          {m.done ? <CheckCircle size={16} className="text-[#10B981]" /> : <div className="w-2 h-2 rounded-full bg-gray-400" />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${m.done ? 'text-gray-800' : 'text-gray-400'}`}>{m.label}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{m.desc}</p>
                        </div>
                        {m.done && <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full">Done</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── EXPLORE TAB ── */}
            {activeTab === 'explorar' && (
              <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Explore advisors</h1>
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                  <Search size={32} className="text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 mb-5">Find the perfect advisor for your needs</p>
                  <Link to="/asesores" className="inline-flex items-center gap-2 bg-[#10B981] text-white font-bold px-6 py-3 rounded-full text-xs hover:bg-[#0ea371] transition-all">
                    Go to full catalog <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            )}

            {/* ── MESSAGES TAB ── */}
            {activeTab === 'mensajes' && (
              <div className="p-6 h-full flex flex-col">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Messages</h1>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex-1" style={{ minHeight: '500px' }}>
                  <ChatPanel user={user} profile={profile} onNavigate={setActiveTab} />
                </div>
              </div>
            )}

            {/* ── PROFILE TAB ── */}
            {activeTab === 'perfil' && (
              <div className="p-6 space-y-5">
                <h1 className="text-2xl font-bold text-gray-800">My profile</h1>
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                    <AvatarUpload currentUrl={profile?.avatar_url} onUploadComplete={() => {}} size="lg" />
                    <div>
                      <p className="font-bold text-gray-800 text-xl">{profile?.full_name}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{profile?.email}</p>
                      <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">Client</span>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 border-t border-gray-100 pt-6">
                    {[
                      { label: 'Full name', value: profile?.full_name },
                      { label: 'Email', value: profile?.email },
                    ].map((f) => (
                      <div key={f.label}>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">{f.label}</label>
                        <input defaultValue={f.value || ''}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none bg-gray-50 transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT PANEL ── */}
          {rightPanelVisible && (
            <div className="hidden xl:flex w-72 flex-col bg-white border-l border-gray-200 flex-shrink-0 shadow-sm">
              {/* Profile header */}
              <div className="px-5 py-5 border-b border-gray-100">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-2 overflow-hidden border-2 border-[#10B981]/20">
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[#10B981] text-xl font-black">{firstName[0]}</span>}
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{profile?.full_name}</p>
                  <p className="text-gray-400 text-xs">@{profile?.email?.split('@')[0]}</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button onClick={() => setActiveTab('mensajes')} title="Messages"
                      className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-[#10B981]/10 hover:border-[#10B981]/30 transition-all">
                      <MessageCircle size={14} className="text-gray-500" />
                    </button>
                    <button onClick={() => setActiveTab('perfil')} title="Settings"
                      className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-[#10B981]/10 hover:border-[#10B981]/30 transition-all">
                      <Settings size={14} className="text-gray-500" />
                    </button>
                    <ProfileMenu onNavigate={setActiveTab} />
                  </div>
                </div>
              </div>

              {/* Chat */}
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Live chat</p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatPanel user={user} profile={profile} onNavigate={setActiveTab} />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}
    </div>
  );
};

export default ClientDashboard;
