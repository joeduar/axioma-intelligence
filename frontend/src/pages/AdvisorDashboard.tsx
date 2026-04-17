import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, CheckCircle, DollarSign, Users,
  MessageCircle, Send, MoreHorizontal, Bell, Settings,
  ArrowUpRight, Activity, Paperclip, Smile, X,
  ChevronRight, ChevronLeft, ChevronDown, LayoutDashboard, User,
  LogOut, Shield, Star,
  ExternalLink, AlertCircle, XCircle, TrendingUp, Moon, Sun
} from 'lucide-react';
import { useDarkMode } from '../context/DarkModeContext';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import AvatarUpload from '../components/AvatarUpload';
import LogoutScreen from '../components/LogoutScreen';
import AdvisorVerificationModule from '../components/AdvisorVerificationModule';
import AdvisorPayoutSetup from '../components/AdvisorPayoutSetup';
import AdvisorProfileExpanded from '../components/AdvisorProfileExpanded';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const buildEarningsData = (payments: any[]) => {
  const now = new Date();
  const months: { mes: string; ingresos: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ mes: MONTH_NAMES[d.getMonth()], ingresos: 0 });
  }
  payments.forEach((p) => {
    const d = new Date(p.created_at);
    const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (diff >= 0 && diff <= 5) {
      months[5 - diff].ingresos += Number(p.amount) || 0;
    }
  });
  return months;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0A0E27] text-white px-4 py-3 rounded-xl shadow-xl border border-white/10 text-xs">
        <p className="font-bold mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.name === 'Ingresos' ? `$${p.value}` : p.value}</p>
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
    { label: 'Editar perfil', icon: User, tab: 'perfil' },
    { label: 'Mis sesiones', icon: Calendar, tab: 'sesiones' },
    { label: 'Reporte de ingresos', icon: DollarSign, tab: 'ingresos' },
    { label: 'Solicitudes pendientes', icon: Bell, tab: 'solicitudes' },
    { label: 'Mensajes', icon: MessageCircle, tab: 'mensajes' },
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
const AdvisorChatPanel = ({ user, profile, advisorId, forcedConv }: { user: any; profile: any; advisorId: string | null; forcedConv?: any }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (forcedConv) {
      setConversations([forcedConv]);
      setActiveConv(forcedConv);
      return;
    }
    if (advisorId) fetchConversations();
  }, [advisorId, forcedConv]);

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
        <p className="text-gray-400 text-sm">Sin conversaciones activas</p>
        <p className="text-gray-300 text-xs mt-1">Las conversaciones aparecen cuando los clientes contratan un plan</p>
      </div>
    );
  }

  const clientName = activeConv?.profiles?.full_name || 'Cliente';
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
                {conv.profiles?.full_name || 'Cliente'}
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
              <p className="text-xs text-gray-400">Cliente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Inicia la conversación con {clientName}</p>
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
            placeholder={`Escribe un mensaje a ${clientName}...`}
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

// ── MESSAGES TAB ASESOR ──────────────────────────────────
const AdvisorMessagesTab = ({ user, profile, advisorId }: { user: any; profile: any; advisorId: string | null }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (advisorId) fetchConversations();
  }, [advisorId]);

  const fetchConversations = async () => {
    setLoading(true);
    const { data } = await supabase.from('conversations')
      .select('*, profiles!conversations_client_id_fkey(full_name, avatar_url, email)')
      .eq('advisor_id', advisorId)
      .order('last_message_at', { ascending: false });
    setConversations(data || []);
    setLoading(false);
  };

  const openChat = (conv: any) => {
    setActiveConv(conv);
    setChatOpen(true);
  };

  if (chatOpen && activeConv) {
    const clientName = activeConv.profiles?.full_name || 'Cliente';
    const clientAvatar = activeConv.profiles?.avatar_url;
    return (
      <div className="p-6 flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setChatOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-500 hover:text-gray-800">
            <ChevronLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0A0E27] flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {clientAvatar
                ? <img src={clientAvatar} alt="" className="w-full h-full object-cover" />
                : clientName[0]}
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">{clientName}</p>
              <p className="text-gray-400 text-xs">{activeConv.profiles?.email}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex-1">
          <AdvisorChatPanel user={user} profile={profile} advisorId={advisorId} forcedConv={activeConv} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Mensajes</h1>
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <p className="text-gray-400 text-sm animate-pulse">Cargando conversaciones...</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
          <MessageCircle size={32} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">Sin conversaciones activas</p>
          <p className="text-gray-300 text-xs">Las conversaciones aparecen cuando un cliente contrata un plan</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {conversations.map((conv, i) => {
            const name = conv.profiles?.full_name || 'Cliente';
            const avatar = conv.profiles?.avatar_url;
            return (
              <div key={conv.id}
                className={`flex items-center gap-4 p-4 hover:bg-[#f1f3f5] transition-all cursor-pointer ${i < conversations.length - 1 ? 'border-b border-gray-100' : ''}`}
                onClick={() => openChat(conv)}>
                <div className="w-11 h-11 rounded-full bg-[#0A0E27] flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0">
                  {avatar ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm">{name}</p>
                  <p className="text-gray-400 text-xs truncate">{conv.profiles?.email || 'Cliente'}</p>
                  {conv.last_message && (
                    <p className="text-gray-400 text-xs truncate mt-0.5">{conv.last_message}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {conv.last_message_at && (
                    <span className="text-[10px] text-gray-400">
                      {new Date(conv.last_message_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); openChat(conv); }}
                    className="px-3 py-1.5 bg-[#0A0E27] text-white text-[10px] font-bold rounded-lg hover:bg-[#0A0E27]/90 transition-all flex items-center gap-1.5">
                    <MessageCircle size={11} /> Abrir chat
                  </button>
                  <ChevronRight size={15} className="text-gray-300" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── NAV ITEMS ─────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'inicio',        label: 'Inicio',         icon: LayoutDashboard },
  { id: 'solicitudes',   label: 'Solicitudes',    icon: Bell },
  { id: 'sesiones',      label: 'Sesiones',       icon: Calendar },
  { id: 'ingresos',      label: 'Ingresos',       icon: DollarSign },
  { id: 'mensajes',      label: 'Mensajes',       icon: MessageCircle },
  { id: 'perfil',        label: 'Perfil',         icon: User },
  { id: 'verificacion',  label: 'Verificación',   icon: Shield },
  { id: 'pagos',         label: 'Datos de Cobro', icon: ExternalLink },
];

const CATEGORIES = ['Finanzas', 'Negocios', 'Datos & IA', 'Legal', 'Marketing', 'Tecnología', 'Recursos Humanos', 'Startups'];

// ── PROFILE COMPLETION ────────────────────────────────────
const getAdvisorCompletion = (profile: any, advisorData: any) => {
  const items = [
    { label: 'Foto de perfil',        done: !!(profile?.avatar_url || advisorData?.avatar_url) },
    { label: 'Título profesional',    done: !!advisorData?.title },
    { label: 'Especialidad',          done: !!advisorData?.category },
    { label: 'Biografía profesional', done: !!advisorData?.bio },
    { label: 'Años de experiencia',   done: !!advisorData?.experience },
    { label: 'Teléfono de contacto',  done: !!profile?.phone },
  ];
  const done = items.filter(i => i.done).length;
  const pct  = Math.round((done / items.length) * 100);
  return { items, done, total: items.length, pct };
};

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
  const { isDark, toggle: toggleDark } = useDarkMode();
  const [showChat, setShowChat] = useState(false);
  const [advisorData, setAdvisorData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [earningsData, setEarningsData] = useState<{ mes: string; ingresos: number }[]>(buildEarningsData([]));
  const [loggingOut, setLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sessionFilter, setSessionFilter] = useState('todas');
  const [requestFilter, setRequestFilter] = useState('pendiente');
  const [acceptModal, setAcceptModal] = useState<any>(null);
  const [rejectModal, setRejectModal] = useState<any>(null);
  const [rejectPreset, setRejectPreset] = useState('');
  const [rejectMessage, setRejectMessage] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [savingAvail, setSavingAvail] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);

  const [formFullName, setFormFullName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formExperience, setFormExperience] = useState('');
  const [formLanguages, setFormLanguages] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [togglingAvail, setTogglingAvail] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (user) fetchAll();
  }, [user]);

  // Realtime: new session requests appear instantly
  useEffect(() => {
    if (!advisorData?.id) return;
    const channel = supabase
      .channel(`advisor-sessions-${advisorData.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'sessions',
        filter: `advisor_id=eq.${advisorData.id}`,
      }, () => { fetchAll(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [advisorData?.id]);

  const fetchAll = async () => {
    const [advisorRes, notifsRes] = await Promise.all([
      supabase.from('advisors').select('*').eq('user_id', user?.id).single(),
      supabase.from('notifications').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(10),
    ]);
    if (advisorRes.data) {
      const adv = advisorRes.data;
      setAdvisorData(adv);
      if (adv.availability_schedule) {
        try { setAvailability(JSON.parse(adv.availability_schedule)); } catch {}
      }
      setFormFullName(profile?.full_name || '');
      setFormTitle(adv.title || '');
      setFormCategory(adv.category || '');
      setFormBio(adv.bio || '');
      setFormExperience(adv.experience || '');
      setFormLanguages(adv.languages || '');

      const [sessionsRes, paymentsRes] = await Promise.all([
        supabase.from('sessions')
          .select('*, profiles!sessions_client_id_fkey(full_name, email, avatar_url), services(name, price, duration)')
          .eq('advisor_id', adv.id).order('created_at', { ascending: false }),
        supabase.from('payments')
          .select('amount, created_at')
          .eq('advisor_id', adv.id)
          .eq('status', 'completado'),
      ]);
      setSessions(sessionsRes.data || []);
      setEarningsData(buildEarningsData(paymentsRes.data || []));
    }
    setNotifications(notifsRes.data || []);
  };

  const handleLogout = async () => { setLoggingOut(true); await signOut(); };

  const handleSetReview = async (session: any) => {
    await supabase.from('sessions').update({ status: 'en_revision' }).eq('id', session.id);
    fetchAll();
  };

  const handleAccept = (session: any) => setAcceptModal(session);

  const confirmAccept = async () => {
    if (!acceptModal) return;
    setProcessingAction(true);
    await supabase.from('sessions').update({ status: 'confirmada' }).eq('id', acceptModal.id);
    try { await supabase.from('notifications').insert({
      user_id: acceptModal.client_id,
      title: '¡Sesión confirmada!',
      message: `${profile?.full_name || 'Tu asesor'} aceptó tu solicitud de sesión. ¡Prepárate para tu asesoría!`,
      type: 'session_confirmed', read: false,
    }); } catch (_) {}
    setProcessingAction(false);
    setAcceptModal(null);
    fetchAll();
  };

  const handleReject = (session: any) => {
    setRejectModal(session);
    setRejectMessage('');
    setRejectPreset('');
  };

  const confirmReject = async () => {
    if (!rejectModal || !rejectMessage.trim()) return;
    setProcessingAction(true);
    await supabase.from('sessions').update({ status: 'rechazada', rejection_reason: rejectMessage }).eq('id', rejectModal.id);
    try { await supabase.from('notifications').insert({
      user_id: rejectModal.client_id,
      title: 'Solicitud de sesión no aceptada',
      message: `Tu asesor respondió: "${rejectMessage}"`,
      type: 'session_rejected', read: false,
    }); } catch (_) {}
    setProcessingAction(false);
    setRejectModal(null);
    setRejectMessage('');
    setRejectPreset('');
    fetchAll();
  };

  const handleSaveAvailability = async (newAvail: Record<string, boolean>) => {
    setSavingAvail(true);
    setAvailability(newAvail);
    try { await supabase.from('advisors')
      .update({ availability_schedule: JSON.stringify(newAvail) })
      .eq('user_id', user?.id); } catch (_) {}
    setSavingAvail(false);
  };

  const toggleAvail = (key: string) => {
    const updated = { ...availability, [key]: !availability[key] };
    handleSaveAvailability(updated);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await Promise.all([
      supabase.from('advisors').update({ title: formTitle, category: formCategory, bio: formBio, experience: formExperience, languages: formLanguages }).eq('user_id', user?.id),
      supabase.from('profiles').update({ full_name: formFullName }).eq('id', user?.id),
    ]);
    setSavingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    fetchAll();
  };

  const handleToggleAvailability = async () => {
    if (!advisorData) return;
    setTogglingAvail(true);
    const newVal = !advisorData.available;
    await supabase.from('advisors').update({ available: newVal }).eq('id', advisorData.id);
    setAdvisorData((prev: any) => ({ ...prev, available: newVal }));
    setTogglingAvail(false);
  };

  const pendingSessions = sessions.filter(s => s.status === 'pendiente');
  const confirmedSessions = sessions.filter(s => s.status === 'confirmada');
  const completedSessions = sessions.filter(s => s.status === 'completada');
  const totalEarnings = completedSessions.reduce((sum, s) => sum + (s.price || 0), 0);
  const firstName = profile?.full_name?.split(' ')[0] || 'Asesor';
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const stats = [
    { label: 'Ingresos totales', value: `$${totalEarnings}`, icon: DollarSign, change: '+12%', up: true },
    { label: 'Completadas', value: completedSessions.length, icon: CheckCircle, change: completedSessions.length > 0 ? `+${completedSessions.length}` : '0', up: completedSessions.length > 0 },
    { label: 'Solicitudes', value: pendingSessions.length, icon: Bell, change: pendingSessions.length > 0 ? `${pendingSessions.length} nuevas` : 'Ninguna', up: pendingSessions.length > 0 },
    { label: 'Próximas', value: confirmedSessions.length, icon: Calendar, change: '0', up: null },
  ];

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'dark bg-[#0d1133] text-[#e2e6f3]' : 'bg-[#f1f3f5] text-gray-800'}`}>
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

        <div className="px-2 pb-2 border-t border-gray-100 pt-2 space-y-0.5">
          <button onClick={toggleDark}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
            {isDark ? <Sun size={17} className="flex-shrink-0" /> : <Moon size={17} className="flex-shrink-0" />}
            {!sidebarCollapsed && <span className="text-xs font-semibold">{isDark ? 'Modo claro' : 'Modo oscuro'}</span>}
          </button>
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-50 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <LogOut size={17} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="text-xs font-semibold">Cerrar sesión</span>}
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
            {activeTab === 'inicio' ? 'Dashboard' : activeTab === 'solicitudes' ? 'Solicitudes' : activeTab === 'ingresos' ? 'Ingresos' : activeTab === 'sesiones' ? 'Sesiones' : activeTab === 'mensajes' ? 'Mensajes' : activeTab === 'verificacion' ? 'Verificación de Identidad' : activeTab === 'pagos' ? 'Datos de Cobro' : 'Perfil'}
          </p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={async () => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications && unreadNotifs > 0) {
                    const ids = notifications.filter(n => !n.read).map(n => n.id);
                    await supabase.from('notifications').update({ read: true }).in('id', ids);
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }
                }}
                className="relative p-2 hover:bg-gray-100 rounded-xl transition-all">
                <Bell size={17} className="text-gray-500" />
                {unreadNotifs > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-[#10B981] rounded-full text-[8px] font-black text-white flex items-center justify-center">{unreadNotifs}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <p className="font-bold text-gray-800 text-sm">Notificaciones</p>
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
                      <div className="px-4 py-8 text-center"><p className="text-gray-400 text-sm">Sin notificaciones</p></div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative flex items-center pl-3 border-l border-gray-100" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-800 leading-none">{firstName}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Asesor</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-[#10B981] text-xs font-black">{firstName[0]}</span>}
                </div>
                <ChevronDown size={13} className={`text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>
              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{profile?.full_name}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{advisorData?.title || 'Asesor'}</p>
                  </div>
                  <div className="p-1">
                    {[
                      { label: 'Editar perfil',          icon: User,          tab: 'perfil' },
                      { label: 'Mis sesiones',            icon: Calendar,      tab: 'sesiones' },
                      { label: 'Reporte de ingresos',     icon: DollarSign,    tab: 'ingresos' },
                      { label: 'Solicitudes pendientes',  icon: Bell,          tab: 'solicitudes' },
                      { label: 'Mensajes',                icon: MessageCircle, tab: 'mensajes' },
                    ].map((opt) => (
                      <button key={opt.label}
                        onClick={() => { setActiveTab(opt.tab); setShowProfileMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                        <opt.icon size={14} className="text-[#10B981] flex-shrink-0" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="p-1 border-t border-gray-100">
                    <button onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-50 rounded-lg transition-all">
                      <LogOut size={14} className="flex-shrink-0" /> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
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
                    <h1 className="text-2xl font-bold text-gray-800">Hola, {firstName}! 👋</h1>
                    <p className="text-gray-500 text-sm mt-1">
                      {pendingSessions.length > 0 ? `Tienes ${pendingSessions.length} solicitud${pendingSessions.length > 1 ? 'es' : ''} pendiente${pendingSessions.length > 1 ? 's' : ''}` : 'Tu panel de asesoría'}
                    </p>
                  </div>
                  <p className="text-gray-400 text-sm">{today}</p>
                </div>

                {/* ── BARRA DE COMPLETITUD DE PERFIL ── */}
                {(() => {
                  const comp = getAdvisorCompletion(profile, advisorData);
                  if (comp.pct >= 100) return null;
                  const missing = comp.items.filter(i => !i.done);
                  return (
                    <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                            <p className="text-sm font-bold text-gray-800">Completa tu perfil profesional</p>
                            <span className="ml-auto text-sm font-black text-amber-500 flex-shrink-0">{comp.pct}%</span>
                          </div>
                          <p className="text-xs text-gray-400 mb-3">
                            Tu perfil aún no es visible en el catálogo · {missing.length} campo{missing.length !== 1 ? 's' : ''} pendiente{missing.length !== 1 ? 's' : ''}
                          </p>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-700"
                              style={{ width: `${comp.pct}%` }}
                            />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {missing.slice(0, 4).map(item => (
                              <span key={item.label}
                                className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 font-medium">
                                {item.label}
                              </span>
                            ))}
                            {missing.length > 4 && (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-400">
                                +{missing.length - 4} más
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveTab('perfil')}
                          className="flex-shrink-0 px-4 py-2 bg-[#0A0E27] text-white text-xs font-bold rounded-xl hover:bg-[#0A0E27]/80 transition-all mt-1"
                        >
                          Completar
                        </button>
                      </div>
                    </div>
                  );
                })()}

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
                      <h2 className="font-bold text-gray-800">Rendimiento de ingresos</h2>
                      <p className="text-gray-400 text-xs mt-0.5">Ganancias en los últimos 6 meses</p>
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
                      <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke="#10B981" strokeWidth={2} fill="url(#gr)" dot={{ fill: '#10B981', r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {pendingSessions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-bold text-gray-800">Solicitudes pendientes</h2>
                      <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">{pendingSessions.length} nueva{pendingSessions.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="space-y-3">
                      {pendingSessions.map((session) => (
                        <div key={session.id} className="flex items-center gap-4 p-4 bg-[#f1f3f5] rounded-xl border border-gray-200">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-black text-sm flex-shrink-0 overflow-hidden">
                            {session.profiles?.avatar_url ? <img src={session.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-amber-600">{session.profiles?.full_name?.[0] || 'C'}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm">{session.profiles?.full_name || 'Cliente'}</p>
                            <p className="text-gray-400 text-xs">{session.profiles?.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleAccept(session)} className="px-4 py-2 bg-[#10B981] text-white text-xs font-bold rounded-xl hover:bg-[#0ea371] transition-all">Aceptar</button>
                            <button onClick={() => handleReject(session)} className="px-4 py-2 bg-white border border-gray-200 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all">Rechazar</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-bold text-gray-800 mb-4">Sesiones recientes</h2>
                  {sessions.length > 0 ? (
                    <div className="space-y-2">
                      {sessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="flex items-center gap-4 p-3 hover:bg-[#f1f3f5] rounded-xl transition-all">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {session.profiles?.avatar_url ? <img src={session.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : <span className="text-gray-500 font-bold text-sm">{session.profiles?.full_name?.[0] || 'C'}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{session.profiles?.full_name || 'Cliente'}</p>
                            <p className="text-gray-400 text-xs">{session.services?.name || 'Sesión de asesoría'}</p>
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
                      <p className="text-gray-400 text-sm">Aún no tienes sesiones. Completa tu perfil para atraer clientes.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SOLICITUDES ── */}
            {activeTab === 'solicitudes' && (() => {
              const pendientes = sessions.filter(s => s.status === 'pendiente');
              const enRevision = sessions.filter(s => s.status === 'en_revision');
              const allRequests = [...pendientes, ...enRevision];
              const shown = requestFilter === 'pendiente' ? pendientes : requestFilter === 'en_revision' ? enRevision : allRequests;
              const formatDate = (d: string | null) => d
                ? new Date(d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                : 'Fecha por coordinar';
              const formatTime = (d: string | null) => d
                ? new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                : null;

              return (
                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-800">Solicitudes de sesión</h1>
                      <p className="text-gray-400 text-sm mt-0.5">Gestiona las solicitudes de tus clientes</p>
                    </div>
                  </div>

                  {/* SUB-FILTRO */}
                  <div className="flex gap-2">
                    {[
                      { id: 'pendiente',   label: 'Pendientes',   count: pendientes.length },
                      { id: 'en_revision', label: 'En revisión',  count: enRevision.length },
                      { id: 'todas',       label: 'Todas',        count: allRequests.length },
                    ].map((f) => (
                      <button key={f.id} onClick={() => setRequestFilter(f.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          requestFilter === f.id ? 'bg-[#0A0E27] text-white border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                        }`}>
                        {f.label}
                        {f.count > 0 && (
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${requestFilter === f.id ? 'bg-white/20' : 'bg-amber-50 text-amber-500'}`}>
                            {f.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {shown.length > 0 ? (
                    <div className="space-y-4">
                      {shown.map((session) => {
                        const clientName = session.profiles?.full_name || 'Cliente';
                        const isReview = session.status === 'en_revision';
                        return (
                          <div key={session.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${isReview ? 'border-blue-200' : 'border-amber-200'}`}>
                            {/* Status strip */}
                            <div className={`px-5 py-2 flex items-center gap-2 ${isReview ? 'bg-blue-50 border-b border-blue-100' : 'bg-amber-50 border-b border-amber-100'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isReview ? 'bg-blue-400' : 'bg-amber-400'}`} />
                              <span className={`text-[11px] font-bold uppercase tracking-wider ${isReview ? 'text-blue-600' : 'text-amber-600'}`}>
                                {isReview ? 'En revisión' : 'Pendiente de respuesta'}
                              </span>
                              <span className="text-gray-400 text-[10px] ml-auto">
                                {new Date(session.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>

                            <div className="p-5">
                              <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-lg flex-shrink-0 overflow-hidden">
                                  {session.profiles?.avatar_url
                                    ? <img src={session.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                    : clientName[0]
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-800">{clientName}</p>
                                  <p className="text-gray-400 text-xs">{session.profiles?.email}</p>
                                  {session.services?.name && (
                                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">
                                      {session.services.name}
                                    </span>
                                  )}
                                </div>
                                {session.price && (
                                  <div className="text-right flex-shrink-0">
                                    <p className="text-lg font-black text-gray-800">${session.price}</p>
                                    <p className="text-gray-400 text-[10px]">pagado</p>
                                  </div>
                                )}
                              </div>

                              {/* Detalles de la solicitud */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Fecha solicitada</p>
                                  <p className="text-sm font-semibold text-gray-700">{formatDate(session.scheduled_at)}</p>
                                  {formatTime(session.scheduled_at) && (
                                    <p className="text-xs text-[#10B981] font-bold mt-0.5">{formatTime(session.scheduled_at)}</p>
                                  )}
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Tema / Motivo</p>
                                  <p className="text-sm font-semibold text-gray-700">{session.topic || 'No especificado'}</p>
                                </div>
                              </div>
                              {session.notes && (
                                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 mb-4">
                                  <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-1">Notas del cliente</p>
                                  <p className="text-sm text-gray-700 leading-relaxed">"{session.notes}"</p>
                                </div>
                              )}

                              {/* ACCIONES */}
                              <div className="flex items-center gap-2 flex-wrap">
                                {!isReview && (
                                  <button
                                    onClick={() => handleSetReview(session)}
                                    className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 text-blue-500 text-xs font-bold rounded-xl hover:bg-blue-50 transition-all"
                                  >
                                    <Clock size={13} /> En revisión
                                  </button>
                                )}
                                <button
                                  onClick={() => handleAccept(session)}
                                  className="flex items-center gap-1.5 px-5 py-2 bg-[#10B981] text-white text-xs font-bold rounded-xl hover:bg-[#0ea371] transition-all"
                                >
                                  <CheckCircle size={13} /> Aceptar sesión
                                </button>
                                <button
                                  onClick={() => handleReject(session)}
                                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all ml-auto"
                                >
                                  <XCircle size={13} /> Rechazar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                      <Clock size={32} className="text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-500 font-semibold mb-1">Sin solicitudes {requestFilter === 'pendiente' ? 'pendientes' : requestFilter === 'en_revision' ? 'en revisión' : ''}</p>
                      <p className="text-gray-400 text-sm">Las nuevas solicitudes de tus clientes aparecerán aquí</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── SESSIONS ── */}
            {activeTab === 'sesiones' && (() => {
              const AVAIL_DAYS = ['lunes','martes','miercoles','jueves','viernes','sabado'];
              const AVAIL_LABELS = ['Lun','Mar','Mié','Jue','Vie','Sáb'];
              const AVAIL_SLOTS = [
                { id: 'manana', label: 'Mañana',  sub: '8 – 12h' },
                { id: 'tarde',  label: 'Tarde',   sub: '12 – 18h' },
                { id: 'noche',  label: 'Noche',   sub: '18 – 22h' },
              ];
              const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
                pendiente:   { label: 'Pendiente',   cls: 'bg-amber-50 text-amber-600' },
                en_revision: { label: 'En revisión', cls: 'bg-blue-50 text-blue-500' },
                confirmada:  { label: 'Confirmada',  cls: 'bg-emerald-50 text-emerald-600' },
                completada:  { label: 'Completada',  cls: 'bg-[#10B981]/10 text-[#10B981]' },
                rechazada:   { label: 'Rechazada',   cls: 'bg-red-50 text-red-500' },
                cancelada:   { label: 'Cancelada',   cls: 'bg-gray-100 text-gray-400' },
              };
              const SESSION_FILTERS = [
                { id: 'todas', label: 'Todas' },
                { id: 'confirmada', label: 'Confirmadas' },
                { id: 'completada', label: 'Completadas' },
                { id: 'cancelada', label: 'Canceladas' },
                { id: 'rechazada', label: 'Rechazadas' },
              ];
              const processedSessions = sessions.filter(s => !['pendiente','en_revision'].includes(s.status));
              const filtered = sessionFilter === 'todas' ? processedSessions : processedSessions.filter(s => s.status === sessionFilter);
              const formatDate = (d: string | null) => d
                ? new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Fecha por coordinar';

              return (
                <div className="p-6 space-y-5">
                  <h1 className="text-2xl font-bold text-gray-800">Sesiones</h1>

                  {/* ── DISPONIBILIDAD ── */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setAvailOpen(!availOpen)}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                          <Calendar size={16} className="text-[#10B981]" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-800 text-sm">Mi disponibilidad</p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {Object.values(availability).filter(Boolean).length > 0
                              ? `${Object.values(availability).filter(Boolean).length} franjas activas`
                              : 'Configura cuándo puedes atender clientes'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {savingAvail && <span className="text-[10px] text-gray-400">Guardando...</span>}
                        <ChevronRight size={16} className={`text-gray-400 transition-transform ${availOpen ? 'rotate-90' : ''}`} />
                      </div>
                    </button>

                    {availOpen && (
                      <div className="px-6 pb-5 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mt-4 mb-3">Selecciona los días y franjas horarias en que estás disponible para atender sesiones:</p>
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[360px]">
                            <thead>
                              <tr>
                                <th className="text-left text-[10px] text-gray-400 font-semibold pb-3 pr-3 w-20" />
                                {AVAIL_LABELS.map((l, i) => (
                                  <th key={i} className="text-center text-[10px] text-gray-500 font-bold pb-3 px-1">{l}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {AVAIL_SLOTS.map((slot) => (
                                <tr key={slot.id}>
                                  <td className="py-1.5 pr-3">
                                    <p className="text-xs font-semibold text-gray-700">{slot.label}</p>
                                    <p className="text-[10px] text-gray-400">{slot.sub}</p>
                                  </td>
                                  {AVAIL_DAYS.map((day, di) => {
                                    const key = `${day}_${slot.id}`;
                                    const active = !!availability[key];
                                    return (
                                      <td key={day} className="py-1.5 px-1 text-center">
                                        <button
                                          onClick={() => toggleAvail(key)}
                                          title={`${AVAIL_LABELS[di]} ${slot.label}`}
                                          className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                                            active
                                              ? 'bg-[#10B981] text-white shadow-sm shadow-[#10B981]/20'
                                              : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                                          }`}
                                        >
                                          {active ? '✓' : '·'}
                                        </button>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-[10px] text-gray-300 mt-3">Los cambios se guardan automáticamente</p>
                      </div>
                    )}
                  </div>

                  {/* FILTROS */}
                  {processedSessions.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {SESSION_FILTERS.map((f) => {
                        const count = f.id === 'todas' ? processedSessions.length : processedSessions.filter(s => s.status === f.id).length;
                        if (f.id !== 'todas' && count === 0) return null;
                        const active = sessionFilter === f.id;
                        return (
                          <button key={f.id} onClick={() => setSessionFilter(f.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                              active ? 'bg-[#0A0E27] text-white border-transparent' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                            }`}>
                            {f.label}
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* LISTA */}
                  {filtered.length > 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                      {filtered.map((session, i) => {
                        const sc = STATUS_LABELS[session.status] || { label: session.status, cls: 'bg-gray-100 text-gray-400' };
                        const clientName = session.profiles?.full_name || 'Cliente';
                        return (
                          <div key={session.id} className={`flex items-center gap-4 p-5 hover:bg-[#f1f3f5] transition-all ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 flex-shrink-0 overflow-hidden">
                              {session.profiles?.avatar_url ? <img src={session.profiles.avatar_url} alt="" className="w-full h-full object-cover" /> : clientName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 text-sm">{clientName}</p>
                              <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                                <span>{session.services?.name || 'Sesión de asesoría'}</span>
                                <span className="text-gray-200">·</span>
                                <span>{formatDate(session.scheduled_at)}</span>
                                {session.topic && <><span className="text-gray-200">·</span><span className="truncate max-w-[120px]">{session.topic}</span></>}
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${sc.cls}`}>{sc.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                      <Calendar size={32} className="text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-500 font-semibold mb-1">Sin sesiones</p>
                      <p className="text-gray-400 text-sm">Las sesiones confirmadas y completadas aparecerán aquí</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── REVENUE ── */}
            {activeTab === 'ingresos' && (
              <div className="p-6 space-y-5">
                <h1 className="text-2xl font-bold text-gray-800">Ingresos</h1>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total generado', value: `$${totalEarnings}`, sub: 'Acumulado' },
                    { label: 'Sesiones completadas', value: completedSessions.length, sub: 'Pagadas y cerradas' },
                    { label: 'Promedio por sesión', value: completedSessions.length > 0 ? `$${Math.round(totalEarnings / completedSessions.length)}` : '$0', sub: 'Por sesión' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm">
                      <p className="text-3xl font-black text-gray-800 mb-1">{s.value}</p>
                      <p className="text-[#10B981] text-xs font-bold uppercase tracking-wider">{s.label}</p>
                      <p className="text-gray-400 text-xs mt-1">{s.sub}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-bold text-gray-800 mb-6">Ingresos mensuales</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={earningsData} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="ingresos" name="Ingresos" fill="#10B981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── MESSAGES ── */}
            {activeTab === 'mensajes' && (
              <AdvisorMessagesTab user={user} profile={profile} advisorId={advisorData?.id || null} />
            )}

            {/* ── PROFILE ── */}
            {activeTab === 'perfil' && (
              <div className="p-6 space-y-5">
                <h1 className="text-2xl font-bold text-gray-800">Mi perfil público</h1>

                {/* BANNER DE COMPLETITUD */}
                {(() => {
                  const comp = getAdvisorCompletion(profile, advisorData);
                  if (comp.pct >= 100) return (
                    <div className="flex items-center gap-3 bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl px-5 py-4">
                      <CheckCircle size={18} className="text-[#10B981] flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-[#10B981]">¡Perfil completo!</p>
                        <p className="text-xs text-gray-400 mt-0.5">Tu perfil es visible en el catálogo y puedes recibir clientes.</p>
                      </div>
                    </div>
                  );
                  const missing = comp.items.filter(i => !i.done);
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell size={15} className="text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-amber-800">Perfil incompleto — {comp.pct}% completado</p>
                        </div>
                        <div className="w-full h-1 bg-amber-200 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-amber-400 rounded-full" style={{ width: `${comp.pct}%` }} />
                        </div>
                        <p className="text-xs text-amber-700 leading-relaxed">
                          Campos pendientes: <span className="font-semibold">{missing.map(i => i.label).join(', ')}</span>
                        </p>
                      </div>
                    </div>
                  );
                })()}

                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                    <AvatarUpload currentUrl={advisorData?.avatar_url || profile?.avatar_url}
                      onUploadComplete={(url) => setAdvisorData((prev: any) => ({ ...prev, avatar_url: url }))} size="lg" />
                    <div>
                      <p className="font-bold text-gray-800 text-xl">{profile?.full_name}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{profile?.email}</p>
                      {advisorData?.verified && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] mt-2"><CheckCircle size={13} /> Asesor verificado</span>
                      )}
                      {advisorData?.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <Star size={13} className="text-[#10B981] fill-[#10B981]" />
                          <span className="text-sm font-bold text-gray-700">{advisorData.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-400">({advisorData.total_reviews || 0} reseñas)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Disponibilidad toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Disponible para nuevos clientes</p>
                      <p className="text-xs text-gray-400 mt-0.5">Tu perfil aparece en el catálogo cuando estás disponible</p>
                    </div>
                    <button type="button" onClick={handleToggleAvailability} disabled={togglingAvail}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${advisorData?.available ? 'bg-[#10B981]' : 'bg-gray-300'} disabled:opacity-60`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${advisorData?.available ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: 'Nombre completo', value: formFullName, set: setFormFullName, placeholder: 'Tu nombre completo' },
                        { label: 'Título profesional', value: formTitle, set: setFormTitle, placeholder: 'ej. CFO Independiente' },
                        { label: 'Experiencia', value: formExperience, set: setFormExperience, placeholder: 'ej. 10 años' },
                        { label: 'Idiomas', value: formLanguages, set: setFormLanguages, placeholder: 'Español, Inglés' },
                      ].map((f) => (
                        <div key={f.label}>
                          <label className="text-xs font-semibold text-gray-500 block mb-1.5">{f.label}</label>
                          <input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none bg-gray-50 transition-all" />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">Especialidad</label>
                        <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:border-[#10B981] outline-none bg-gray-50">
                          <option value="">Seleccionar especialidad</option>
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1.5">Bio profesional</label>
                      <textarea value={formBio} onChange={(e) => setFormBio(e.target.value)} rows={4}
                        placeholder="Describe tu experiencia y lo que ofreces a tus clientes..."
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none bg-gray-50 resize-none" />
                    </div>
                    <div className="flex items-center gap-4">
                      <button type="submit" disabled={savingProfile}
                        className="bg-[#0A0E27] text-white font-bold py-3 px-8 rounded-xl text-sm hover:bg-[#0A0E27]/90 transition-all disabled:opacity-50">
                        {savingProfile ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      {saveSuccess && <span className="flex items-center gap-1.5 text-[#10B981] text-sm font-bold"><CheckCircle size={14} /> ¡Guardado!</span>}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ── VERIFICACIÓN ── */}
            {activeTab === 'verificacion' && advisorData?.id && (
              <div className="p-6">
                <AdvisorVerificationModule
                  userId={user?.id || ''}
                  advisorId={advisorData.id}
                  isDark={isDark}
                />
              </div>
            )}

            {/* ── DATOS DE COBRO ── */}
            {activeTab === 'pagos' && advisorData?.id && (
              <div className="p-6">
                <AdvisorPayoutSetup
                  userId={user?.id || ''}
                  advisorId={advisorData.id}
                  isDark={isDark}
                />
              </div>
            )}

          </div>

        </div>
      </div>

      {/* ── ACCEPT MODAL ── */}
      {acceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !processingAction && setAcceptModal(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-[#10B981]/10 border-b border-[#10B981]/20 px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#10B981]/20 flex items-center justify-center">
                <CheckCircle size={18} className="text-[#10B981]" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Confirmar aceptación</p>
                <p className="text-xs text-gray-400">Revisa los detalles antes de confirmar</p>
              </div>
              <button onClick={() => setAcceptModal(null)} disabled={processingAction}
                className="ml-auto p-1.5 hover:bg-white/60 rounded-lg transition-all disabled:opacity-40">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-lg overflow-hidden flex-shrink-0">
                  {acceptModal.profiles?.avatar_url
                    ? <img src={acceptModal.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (acceptModal.profiles?.full_name?.[0] || 'C')
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800">{acceptModal.profiles?.full_name || 'Cliente'}</p>
                  <p className="text-gray-400 text-xs">{acceptModal.profiles?.email}</p>
                </div>
                {acceptModal.price && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-black text-gray-800">${acceptModal.price}</p>
                    <p className="text-[10px] text-gray-400">pagado</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Servicio</p>
                  <p className="text-sm font-semibold text-gray-700">{acceptModal.services?.name || 'Sesión de asesoría'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Fecha solicitada</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {acceptModal.scheduled_at
                      ? new Date(acceptModal.scheduled_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Por coordinar'
                    }
                  </p>
                </div>
                {acceptModal.topic && (
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Tema</p>
                    <p className="text-sm font-semibold text-gray-700">{acceptModal.topic}</p>
                  </div>
                )}
                {acceptModal.notes && (
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100 col-span-2">
                    <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold mb-0.5">Notas del cliente</p>
                    <p className="text-sm text-gray-700">"{acceptModal.notes}"</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-400 bg-[#10B981]/5 border border-[#10B981]/20 rounded-xl px-4 py-3">
                Al aceptar, el cliente recibirá una notificación confirmando su sesión.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setAcceptModal(null)} disabled={processingAction}
                className="flex-1 py-3 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                Cancelar
              </button>
              <button onClick={confirmAccept} disabled={processingAction}
                className="flex-1 py-3 bg-[#10B981] text-white text-sm font-bold rounded-xl hover:bg-[#0ea371] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {processingAction ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Confirmando...</>
                ) : (
                  <><CheckCircle size={15} /> Confirmar sesión</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !processingAction && setRejectModal(null)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                <XCircle size={18} className="text-red-400" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Rechazar solicitud</p>
                <p className="text-xs text-gray-400">Indica el motivo al cliente</p>
              </div>
              <button onClick={() => setRejectModal(null)} disabled={processingAction}
                className="ml-auto p-1.5 hover:bg-white/60 rounded-lg transition-all disabled:opacity-40">
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center font-bold text-gray-500 flex-shrink-0 overflow-hidden">
                  {rejectModal.profiles?.avatar_url
                    ? <img src={rejectModal.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    : (rejectModal.profiles?.full_name?.[0] || 'C')
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-700 text-sm">{rejectModal.profiles?.full_name || 'Cliente'}</p>
                  <p className="text-gray-400 text-xs truncate">{rejectModal.services?.name || 'Sesión de asesoría'}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-2">Motivo rápido (opcional)</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'No disponible en esa fecha',
                    'Fuera de mi especialidad',
                    'Agenda completa',
                    'Información insuficiente',
                  ].map((preset) => (
                    <button key={preset}
                      onClick={() => { setRejectPreset(preset); setRejectMessage(preset); }}
                      className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all ${
                        rejectPreset === preset
                          ? 'bg-[#0A0E27] text-white border-transparent'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}>
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                  Mensaje para el cliente <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectMessage}
                  onChange={(e) => { setRejectMessage(e.target.value); if (e.target.value !== rejectPreset) setRejectPreset(''); }}
                  rows={4}
                  placeholder="Explica brevemente por qué no puedes aceptar esta solicitud. Sé respetuoso y claro..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none resize-none bg-gray-50"
                />
                <p className={`text-[10px] mt-1 ${rejectMessage.trim().length < 10 ? 'text-gray-300' : 'text-gray-400'}`}>
                  {rejectMessage.trim().length}/200 · Mínimo 10 caracteres
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setRejectModal(null)} disabled={processingAction}
                className="flex-1 py-3 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50">
                Volver
              </button>
              <button onClick={confirmReject} disabled={processingAction || rejectMessage.trim().length < 10}
                className="flex-1 py-3 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
                {processingAction ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</>
                ) : (
                  <><XCircle size={15} /> Enviar rechazo</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotifications && <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />}
    </div>
  );
};

export default AdvisorDashboard;
