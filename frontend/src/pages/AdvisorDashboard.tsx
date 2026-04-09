import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, CheckCircle, DollarSign, Users,
  MessageCircle, Send, MoreHorizontal, Bell, Settings,
  ArrowUpRight, Activity, Paperclip, Smile, X,
  ChevronRight, ChevronLeft, LayoutDashboard, User,
  LogOut, Shield, Star, PanelRightClose, PanelRightOpen,
  ExternalLink, AlertCircle, XCircle, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import AvatarUpload from '../components/AvatarUpload';
import LogoutScreen from '../components/LogoutScreen';

const earningsData = [
  { mes: 'Ene', ingresos: 0 },
  { mes: 'Feb', ingresos: 149 },
  { mes: 'Mar', ingresos: 298 },
  { mes: 'Abr', ingresos: 149 },
  { mes: 'May', ingresos: 447 },
  { mes: 'Jun', ingresos: 298 },
  { mes: 'Jul', ingresos: 596 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0E27] text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 text-xs">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.name === 'Revenue' ? `$${p.value}` : p.value}</p>
        ))}
      </div>
    );
  }
  return null;
};

// ── PROFILE MENU ASESOR ───────────────────────────────────
const AdvisorProfileMenu = ({ onNavigate }: { onNavigate: (tab: string) => void }) => {
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
    { label: 'Revenue report', icon: DollarSign, tab: 'ingresos' },
    { label: 'Pending requests', icon: Bell, tab: 'solicitudes' },
    { label: 'Messages', icon: MessageCircle, tab: 'mensajes' },
  ];
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all">
        <MoreHorizontal size={14} className="text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            {options.map((opt) => (
              <button key={opt.label}
                onClick={() => { onNavigate(opt.tab); setOpen(false); }}
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

// ── CHAT ASESOR ───────────────────────────────────────────
const AdvisorChatPanel = ({ user, profile, advisorId }: { user: any; profile: any; advisorId: string | null }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (advisorId) fetchConversations();
  }, [advisorId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!activeConv) return;
    fetchMessages(activeConv.id);
    if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; }
    const channel = supabase
      .channel(`advisor-chat-${activeConv.id}-${Date.now()}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${activeConv.id}`,
      }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          return [...prev, payload.new];
        });
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      })
      .subscribe();
    channelRef.current = channel;
    return () => { if (channelRef.current) { supabase.removeChannel(channelRef.current); channelRef.current = null; } };
  }, [activeConv?.id]);

  const fetchConversations = async () => {
    const { data } = await supabase.from('conversations')
      .select('*, profiles!conversations_client_id_fkey(full_name, avatar_url, email)')
      .eq('advisor_id', advisorId)
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
    await supabase.from('conversations').update({ last_message: content, last_message_at: new Date().toISOString() }).eq('id', activeConv.id);
    setSending(false);
  };

  if (!advisorId || conversations.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <MessageCircle size={28} className="text-gray-300 mb-3" />
        <p className="text-gray-400 text-sm">No active conversations</p>
        <p className="text-gray-300 text-xs mt-1">Conversations appear when clients book a plan</p>
      </div>
    );
  }

  const clientName = activeConv?.profiles?.full_name || 'Client';
  const clientAvatar = activeConv?.profiles?.avatar_url;

  return (
    <div className="flex flex-col h-full">
      {/* Selector si hay varias conversaciones */}
      {conversations.length > 1 && (
        <div className="px-4 py-2 border-b border-gray-100 overflow-x-auto flex-shrink-0">
          <div className="flex gap-2">
            {conversations.map((conv) => (
              <button key={conv.id} onClick={() => setActiveConv(conv)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium flex-shrink-0 transition-all ${
                  activeConv?.id === conv.id ? 'bg-[#0A0E27] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-[9px] font-black overflow-hidden flex-shrink-0">
                  {conv.profiles?.avatar_url ? <img src={conv.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : (conv.profiles?.full_name?.[0] || 'C')}
                </div>
                {conv.profiles?.full_name || 'Client'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0A0E27] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
            {clientAvatar ? <img src={clientAvatar} alt="" className="w-full h-full object-cover" /> : clientName[0]}
          </div>
          <div>
            <p className="font-bold text-gray-800 text-sm">{clientName}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <p className="text-xs text-gray-400">Client</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Start the conversation with {clientName}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} gap-2 items-end`}>
                {!isOwn && (
                  <div className="w-7 h-7 rounded-full bg-[#0A0E27] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 overflow-hidden">
                    {clientAvatar ? <img src={clientAvatar} alt="" className="w-full h-full object-cover" /> : clientName[0]}
                  </div>
                )}
                <div className={`max-w-[75%] flex flex-col gap-1 ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!isOwn && <p className="text-[10px] text-gray-400 ml-1">{clientName}</p>}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn ? 'bg-[#10B981] text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>{msg.content}</div>
                  <p className={`text-[10px] text-gray-400 ${isOwn ? 'text-right' : ''}`}>
                    {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {isOwn && (
                  <div className="w-7 h-7 rounded-full bg-[#10B981]/20 flex items-center justify-center text-[#10B981] font-bold text-xs flex-shrink-0 overflow-hidden">
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : profile?.full_name?.[0] || 'A'}
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
          <button className="text-gray-400 hover:text-gray-600"><Paperclip size={15} /></button>
          <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={`Message ${clientName}...`}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none" />
          <button className="text-gray-400 hover:text-gray-600"><Smile size={15} /></button>
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
  { id: 'solicitudes', label: 'Requests', icon: Bell },
  { id: 'sesiones', label: 'Sessions', icon: Calendar },
  { id: 'ingresos', label: 'Revenue', icon: DollarSign },
  { id: 'mensajes', label: 'Messages', icon: MessageCircle },
  { id: 'perfil', label: 'Profile', icon: User },
];

const CATEGORIES = ['Finanzas', 'Negocios', 'Datos & IA', 'Legal', 'Marketing', 'Tecnología', 'Recursos Humanos', 'Startups'];

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'completada': return 'bg-[#10B981]/10 text-[#10B981]';
    case 'confirmada': return 'bg-blue-50 text-blue-500';
    case 'pendiente': return 'bg-amber-50 text-amber-500';
    case 'cancelada': return 'bg-red-50 text-red-400';
    default: return 'bg-gray-100 text-gray-400';
  }
};

// ── MAIN ──────────────────────────────────────────────────
const AdvisorDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inicio');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [advisorData, setAdvisorData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formExperience, setFormExperience] = useState('');
  const [formLanguages, setFormLanguages] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  const fetchAll = async () => {
    const [advisorRes, notifsRes] = await Promise.all([
      supabase.from('advisors').select('*').eq('user_id', user?.id).single(),
      supabase.from('notifications').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(10),
    ]);
    if (advisorRes.data) {
      const adv = advisorRes.data;
      setAdvisorData(adv);
      setFormTitle(adv.title || '');
      setFormCategory(adv.category || '');
      setFormBio(adv.bio || '');
      setFormExperience(adv.experience || '');
      setFormLanguages(adv.languages || '');

      const sessionsRes = await supabase.from('sessions')
        .select('*, profiles!sessions_client_id_fkey(full_name, email, avatar_url), services(name, price, duration)')
        .eq('advisor_id', adv.id).order('created_at', { ascending: false });
      setSessions(sessionsRes.data || []);
    }
    setNotifications(notifsRes.data || []);
  };

  const handleLogout = async () => { setLoggingOut(true); await signOut(); };
  const handleAccept = async (id: string) => { await supabase.from('sessions').update({ status: 'confirmada' }).eq('id', id); fetchAll(); };
  const handleReject = async (id: string) => { await supabase.from('sessions').update({ status: 'cancelada' }).eq('id', id); fetchAll(); };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await supabase.from('advisors').update({ title: formTitle, category: formCategory, bio: formBio, experience: formExperience, languages: formLanguages }).eq('user_id', user?.id);
    setSavingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const pendingSessions = sessions.filter(s => s.status === 'pendiente');
  const confirmedSessions = sessions.filter(s => s.status === 'confirmada');
  const completedSessions = sessions.filter(s => s.status === 'completada');
  const totalEarnings = completedSessions.reduce((sum, s) => sum + (s.price || 0), 0);
  const firstName = profile?.full_name?.split(' ')[0] || 'Advisor';
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const stats = [
    { label: 'Total revenue', value: `$${totalEarnings}`, icon: DollarSign, change: '+12%', up: true },
    { label: 'Completed', value: completedSessions.length, icon: CheckCircle, change: completedSessions.length > 0 ? `+${completedSessions.length}` : '0', up: completedSessions.length > 0 },
    { label: 'Requests', value: pendingSessions.length, icon: Bell, change: pendingSessions.length > 0 ? `${pendingSessions.length} new` : 'None', up: pendingSessions.length > 0 },
    { label: 'Upcoming', value: confirmedSessions.length, icon: Calendar, change: '0', up: null },
  ];

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
            const badge = item.id === 'solicitudes' && pendingSessions.length > 0 ? pendingSessions.length : null;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                  isActive ? 'bg-[#0A0E27] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}>
                <item.icon size={17} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="text-xs font-semibold flex-1 text-left">{item.label}</span>}
                {badge && (
                  <span className={`w-5 h-5 rounded-full bg-amber-400 text-[#0A0E27] text-[9px] font-black flex items-center justify-center flex-shrink-0 ${sidebarCollapsed ? 'absolute -top-1 -right-1' : ''}`}>
                    {badge}
                  </span>
                )}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-[#0A0E27] text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 font-medium">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-2 pb-2 border-t border-gray-100 pt-2">
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
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <p className="font-bold text-gray-700 text-sm">
            {activeTab === 'inicio' ? 'Dashboard' : activeTab === 'solicitudes' ? 'Requests' : activeTab === 'ingresos' ? 'Revenue' : activeTab === 'sesiones' ? 'Sessions' : activeTab === 'mensajes' ? 'Messages' : 'Profile'}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setRightPanelVisible(!rightPanelVisible)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all" title={rightPanelVisible ? 'Hide panel' : 'Show panel'}>
              {rightPanelVisible ? <PanelRightClose size={17} className="text-gray-500" /> : <PanelRightOpen size={17} className="text-gray-500" />}
            </button>
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="relative p-2 hover:bg-gray-100 rounded-xl transition-all">
                <Bell size={17} className="text-gray-500" />
                {unreadNotifs > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-[#10B981] rounded-full text-[8px] font-black text-white flex items-center justify-center">{unreadNotifs}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="font-bold text-gray-800 text-sm">Notifications</p>
                    <button onClick={() => setShowNotifications(false)}><X size={14} className="text-gray-400" /></button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map((n) => (
                      <div key={n.id} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${!n.read ? 'bg-[#10B981]/5' : ''}`}>
                        <div className="flex gap-2.5">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-[#10B981]' : 'bg-gray-200'}`} />
                          <div>
                            <p className="text-gray-700 text-xs leading-relaxed">{n.message}</p>
                            <p className="text-gray-400 text-[10px] mt-0.5">{new Date(n.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{firstName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Advisor</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => setActiveTab('perfil')}>
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[#10B981] text-xs font-black">{firstName[0]}</span>}
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto">

            {/* ── HOME ── */}
            {activeTab === 'inicio' && (
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Hello, {firstName}! 👋</h1>
                    <p className="text-gray-500 text-sm mt-1">
                      {pendingSessions.length > 0 ? `You have ${pendingSessions.length} pending request${pendingSessions.length > 1 ? 's' : ''}` : 'Your advisory dashboard'}
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm">{today}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-all shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
                          <stat.icon size={17} className="text-[#10B981]" />
                        </div>
                        {stat.up !== null && (
                          <div className={`flex items-center gap-0.5 text-[10px] font-bold ${stat.up ? 'text-[#10B981]' : 'text-gray-400'}`}>
                            {stat.up && <ArrowUpRight size={12} />}{stat.change}
                          </div>
                        )}
                      </div>
                      <p className="text-2xl font-black text-gray-800 mb-1">{stat.value}</p>
                      <p className="text-gray-400 text-xs">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="font-bold text-gray-800">Revenue performance</h2>
                      <p className="text-gray-400 text-xs mt-0.5">Earnings over the last 7 months</p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={170}>
                    <AreaChart data={earningsData}>
                      <defs>
                        <linearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/><stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="ingresos" name="Revenue" stroke="#10B981" strokeWidth={2} fill="url(#gr)" dot={{ fill: '#10B981', r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {pendingSessions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-gray-800">Pending requests</h2>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">{pendingSessions.length} new</span>
                    </div>
                    <div className="space-y-3">
                      {pendingSessions.map((session) => (
                        <div key={session.id} className="flex items-center gap-4 p-4 bg-[#f1f3f5] rounded-xl border border-gray-200">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-black text-sm flex-shrink-0 overflow-hidden">
                            {session.profiles?.avatar_url ? <img src={session.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-amber-600">{session.profiles?.full_name?.[0] || 'C'}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm">{session.profiles?.full_name || 'Client'}</p>
                            <p className="text-gray-400 text-xs">{session.profiles?.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleAccept(session.id)} className="px-4 py-2 bg-[#10B981] text-white text-xs font-bold rounded-xl hover:bg-[#0ea371] transition-all">Accept</button>
                            <button onClick={() => handleReject(session.id)} className="px-4 py-2 bg-white border border-gray-200 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all">Decline</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-bold text-gray-800 mb-4">Recent sessions</h2>
                  {sessions.length > 0 ? (
                    <div className="space-y-2">
                      {sessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="flex items-center gap-4 p-3 hover:bg-[#f1f3f5] rounded-xl transition-all">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {session.profiles?.avatar_url ? <img src={session.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-gray-500 font-bold text-sm">{session.profiles?.full_name?.[0] || 'C'}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{session.profiles?.full_name || 'Client'}</p>
                            <p className="text-gray-400 text-xs">{session.services?.name || 'Advisory session'}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${getStatusStyle(session.status)}`}>{session.status}</span>
                          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-all flex-shrink-0">
                            <MoreHorizontal size={14} className="text-gray-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users size={28} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">No sessions yet. Complete your profile to attract clients.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── REQUESTS ── */}
            {activeTab === 'solicitudes' && (
              <div className="p-6 space-y-5">
                <h1 className="text-2xl font-bold text-gray-800">Session requests</h1>
                {pendingSessions.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    {pendingSessions.map((session, i) => (
                      <div key={session.id} className={`flex items-center gap-4 p-5 hover:bg-[#f1f3f5] transition-all ${i < pendingSessions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 flex-shrink-0 overflow-hidden">
                          {session.profiles?.avatar_url ? <img src={session.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : session.profiles?.full_name?.[0] || 'C'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">{session.profiles?.full_name || 'Client'}</p>
                          <p className="text-[#10B981] text-xs font-semibold">{session.services?.name}</p>
                          <p className="text-gray-400 text-xs">{session.profiles?.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleAccept(session.id)} className="px-5 py-2.5 bg-[#10B981] text-white text-xs font-bold rounded-xl hover:bg-[#0ea371] transition-all">Accept</button>
                          <button onClick={() => handleReject(session.id)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all">Decline</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                    <Clock size={32} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400">No pending requests</p>
                  </div>
                )}
              </div>
            )}

            {/* ── SESSIONS ── */}
            {activeTab === 'sesiones' && (
              <div className="p-6 space-y-5">
                <h1 className="text-2xl font-bold text-gray-800">Session history</h1>
                {sessions.length > 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    {sessions.map((session, i) => (
                      <div key={session.id} className={`flex items-center gap-4 p-5 hover:bg-[#f1f3f5] transition-all ${i < sessions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 flex-shrink-0 overflow-hidden">
                          {session.profiles?.avatar_url ? <img src={session.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : session.profiles?.full_name?.[0] || 'C'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800 text-sm">{session.profiles?.full_name || 'Client'}</p>
                          <p className="text-gray-400 text-xs">{session.services?.name || 'Advisory session'}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getStatusStyle(session.status)}`}>{session.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                    <Calendar size={32} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400">No sessions yet</p>
                  </div>
                )}
              </div>
            )}

            {/* ── REVENUE ── */}
            {activeTab === 'ingresos' && (
              <div className="p-6 space-y-5">
                <h1 className="text-2xl font-bold text-gray-800">Revenue</h1>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total generated', value: `$${totalEarnings}`, sub: 'All time' },
                    { label: 'Completed sessions', value: completedSessions.length, sub: 'Paid & closed' },
                    { label: 'Avg per session', value: completedSessions.length > 0 ? `$${Math.round(totalEarnings / completedSessions.length)}` : '$0', sub: 'Per session' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
                      <p className="text-3xl font-black text-gray-800 mb-1">{s.value}</p>
                      <p className="text-[#10B981] text-xs font-bold uppercase tracking-wider">{s.label}</p>
                      <p className="text-gray-400 text-xs mt-1">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-bold text-gray-800 mb-6">Monthly revenue</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={earningsData} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="ingresos" name="Revenue" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── MESSAGES ── */}
            {activeTab === 'mensajes' && (
              <div className="p-6 h-full flex flex-col">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Messages</h1>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex-1" style={{ minHeight: '500px' }}>
                  <AdvisorChatPanel user={user} profile={profile} advisorId={advisorData?.id || null} />
                </div>
              </div>
            )}

            {/* ── PROFILE ── */}
            {activeTab === 'perfil' && (
              <div className="p-6 space-y-5">
                <h1 className="text-2xl font-bold text-gray-800">My public profile</h1>
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                    <AvatarUpload currentUrl={advisorData?.avatar_url || profile?.avatar_url}
                      onUploadComplete={(url) => setAdvisorData((prev: any) => ({ ...prev, avatar_url: url }))} size="lg" />
                    <div>
                      <p className="font-bold text-gray-800 text-xl">{profile?.full_name}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{profile?.email}</p>
                      {advisorData?.verified && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] mt-2"><CheckCircle size={13} /> Verified advisor</span>
                      )}
                      {advisorData?.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star size={13} className="text-[#10B981] fill-[#10B981]" />
                          <span className="text-sm font-bold text-gray-700">{advisorData.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">({advisorData.total_reviews || 0} reviews)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: 'Professional title', value: formTitle, set: setFormTitle, placeholder: 'e.g. CFO Independiente' },
                        { label: 'Experience', value: formExperience, set: setFormExperience, placeholder: 'e.g. 10 years' },
                        { label: 'Languages', value: formLanguages, set: setFormLanguages, placeholder: 'Spanish, English' },
                      ].map((f) => (
                        <div key={f.label}>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">{f.label}</label>
                          <input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none bg-gray-50 transition-all" />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Specialty</label>
                        <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-[#10B981] outline-none bg-gray-50">
                          <option value="">Select specialty</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Professional bio</label>
                      <textarea value={formBio} onChange={(e) => setFormBio(e.target.value)} rows={4}
                        placeholder="Describe your experience and what you offer clients..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none bg-gray-50 resize-none" />
                    </div>
                    <div className="flex items-center gap-4">
                      <button type="submit" disabled={savingProfile}
                        className="bg-[#0A0E27] text-white font-bold py-3 px-8 rounded-xl text-sm hover:bg-[#0A0E27]/90 transition-all disabled:opacity-50">
                        {savingProfile ? 'Saving...' : 'Save changes'}
                      </button>
                      {saveSuccess && <span className="flex items-center gap-1.5 text-[#10B981] text-sm font-bold"><CheckCircle size={14} /> Saved!</span>}
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT PANEL ── */}
          {rightPanelVisible && (
            <div className="hidden xl:flex w-72 flex-col bg-white border-l border-gray-200 flex-shrink-0 shadow-sm">
              <div className="px-5 py-5 border-b border-gray-100">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-2 overflow-hidden border-2 border-[#10B981]/20">
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[#10B981] text-xl font-black">{firstName[0]}</span>}
                  </div>
                  <p className="font-bold text-gray-800 text-sm">{profile?.full_name}</p>
                  <p className="text-gray-400 text-xs">{advisorData?.title || 'Advisor'}</p>
                  {advisorData?.rating && (
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      <Star size={12} className="text-[#10B981] fill-[#10B981]" />
                      <span className="text-xs font-bold text-gray-700">{advisorData.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({advisorData.total_reviews || 0})</span>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <button onClick={() => setActiveTab('mensajes')} title="Messages"
                      className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-[#10B981]/10 hover:border-[#10B981]/30 transition-all">
                      <MessageCircle size={14} className="text-gray-500" />
                    </button>
                    <button onClick={() => setActiveTab('perfil')} title="Edit profile"
                      className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-[#10B981]/10 hover:border-[#10B981]/30 transition-all">
                      <Settings size={14} className="text-gray-500" />
                    </button>
                    <AdvisorProfileMenu onNavigate={setActiveTab} />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Client messages</p>
                </div>
                <div className="flex-1 overflow-hidden">
                  <AdvisorChatPanel user={user} profile={profile} advisorId={advisorData?.id || null} />
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

export default AdvisorDashboard;
