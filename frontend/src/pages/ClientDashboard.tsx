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

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const buildSessionChartData = (sessions: any[]) => {
  const now = new Date();
  const months: { mes: string; sesiones: number; completadas: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ mes: MONTH_NAMES[d.getMonth()], sesiones: 0, completadas: 0 });
  }
  sessions.forEach((s) => {
    const d = new Date(s.created_at);
    const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (diff >= 0 && diff <= 5) {
      months[5 - diff].sesiones += 1;
      if (s.status === 'completada') months[5 - diff].completadas += 1;
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
  const [showDetails, setShowDetails] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const advisorId = session.advisors?.id;
  const advisorName = session.advisors?.profiles?.full_name || 'Asesor';
  const statusLabels: Record<string, string> = {
    pendiente: 'Pendiente de confirmación',
    confirmada: 'Confirmada',
    completada: 'Completada',
    cancelada: 'Cancelada',
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button onClick={() => setOpen(!open)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-all">
          <MoreHorizontal size={14} className="text-gray-400" />
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-1">
              {session.status === 'confirmada' && (
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                  <ExternalLink size={14} className="text-[#10B981]" /> Unirse a sesión
                </button>
              )}
              <button
                onClick={() => { setShowDetails(true); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                <AlertCircle size={14} className="text-blue-500" /> Ver detalles
              </button>
              {advisorId && (
                <button
                  onClick={() => { navigate(`/asesores/${advisorId}`); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
                  <ExternalLink size={14} className="text-gray-400" /> Ver perfil del asesor
                </button>
              )}
              {(session.status === 'pendiente' || session.status === 'confirmada') && (
                <button
                  onClick={() => { onCancel(); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  <XCircle size={14} /> Cancelar sesión
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDetails(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800">Detalles de la sesión</h3>
              <button onClick={() => setShowDetails(false)} className="p-1 hover:bg-gray-100 rounded-lg transition-all">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Asesor</span>
                <span className="text-sm font-semibold text-gray-800">{advisorName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Especialidad</span>
                <span className="text-sm text-gray-700">{session.advisors?.title || session.advisors?.category || '—'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Estado</span>
                <span className="text-sm font-semibold text-gray-800">{statusLabels[session.status] || session.status}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs text-gray-400 font-medium">Precio</span>
                <span className="text-sm font-bold text-[#10B981]">${session.price || 0} USD</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-gray-400 font-medium">Fecha de solicitud</span>
                <span className="text-sm text-gray-700">
                  {new Date(session.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            {advisorId && (
              <button
                onClick={() => { navigate(`/asesores/${advisorId}`); setShowDetails(false); }}
                className="mt-5 w-full bg-[#0A0E27] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#0A0E27]/90 transition-all flex items-center justify-center gap-2">
                Ver perfil del asesor <ExternalLink size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </>
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
    { label: 'Editar perfil', icon: User, tab: 'perfil' },
    { label: 'Mis sesiones', icon: Calendar, tab: 'sesiones' },
    { label: 'Progreso', icon: Activity, tab: 'progreso' },
    { label: 'Explorar asesores', icon: Search, tab: 'explorar' },
    { label: 'Notificaciones', icon: Bell, tab: null },
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
            placeholder={`Escribe un mensaje a ${advisorName}...`}
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

// ── EXPLORE TAB ───────────────────────────────────────────
const EXPLORE_CATEGORIES = ['Todos', 'Finanzas', 'Negocios', 'Datos & IA', 'Legal', 'Marketing', 'Tecnologia', 'Recursos Humanos', 'Startups'];

const ADVISOR_COLORS: Record<string, string> = {
  'Finanzas': '#0F4C35', 'Negocios': '#1A237E', 'Datos & IA': '#4A148C',
  'Legal': '#B71C1C', 'Marketing': '#E65100', 'Tecnologia': '#006064',
  'Recursos Humanos': '#1B5E20', 'Startups': '#880E4F',
};

const ExploreTab = () => {
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAdvisors(); }, []);

  const fetchAdvisors = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('advisors')
      .select('*, profiles(full_name, avatar_url)')
      .eq('available', true)
      .order('rating', { ascending: false });
    setAdvisors(data || []);
    setLoading(false);
  };

  const filtered = advisors.filter(a => {
    const name = (a.profiles?.full_name || a.title || '').toLowerCase();
    const matchSearch = name.includes(search.toLowerCase()) || (a.title || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'Todos' || a.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Explorar asesores</h1>

      {/* Búsqueda + filtro */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o especialidad..."
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 flex-shrink-0">
          {EXPLORE_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                category === cat ? 'bg-[#0A0E27] text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-2.5 bg-gray-100 rounded w-full mb-2" />
              <div className="h-8 bg-gray-100 rounded-xl mt-4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <Search size={28} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No se encontraron asesores con ese criterio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(advisor => {
            const name = advisor.profiles?.full_name || advisor.title || 'Asesor';
            const avatar = advisor.profiles?.avatar_url;
            const color = ADVISOR_COLORS[advisor.category] || '#0F4C35';
            const initials = name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
            return (
              <div key={advisor.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-black text-base"
                    style={{ backgroundColor: color }}>
                    {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0A0E27] text-sm truncate">{name}</p>
                    <p className="text-[#10B981] text-xs font-medium truncate">{advisor.title}</p>
                    <p className="text-gray-400 text-[10px]">{advisor.category}</p>
                  </div>
                </div>
                {advisor.bio && (
                  <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">{advisor.bio}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {advisor.total_reviews > 0 && (
                      <span className="flex items-center gap-1">
                        <Star size={11} className="text-[#10B981] fill-[#10B981]" />
                        <span className="font-semibold text-gray-700">{advisor.rating?.toFixed(1)}</span>
                      </span>
                    )}
                    <span>{advisor.total_sessions || 0} sesiones</span>
                  </div>
                  <Link to={`/asesores/${advisor.id}`}
                    className="text-xs font-bold text-[#10B981] hover:underline flex items-center gap-1">
                    Ver perfil <ChevronRight size={12} />
                  </Link>
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
  { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
  { id: 'sesiones', label: 'Sesiones', icon: Calendar },
  { id: 'progreso', label: 'Progreso', icon: Activity },
  { id: 'explorar', label: 'Explorar', icon: Search },
  { id: 'mensajes', label: 'Mensajes', icon: MessageCircle },
  { id: 'perfil', label: 'Perfil', icon: User },
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
  const [sessionChartData, setSessionChartData] = useState(buildSessionChartData([]));
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Profile form state
  const [formFullName, setFormFullName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    const s = sessionsRes.data || [];
    setSessions(s);
    setSessionChartData(buildSessionChartData(s));
    setSubscriptions(subsRes.data || []);
    setNotifications(notifsRes.data || []);
    // Sync profile form fields
    setFormFullName(profile?.full_name || '');
    setFormPhone(profile?.phone || '');
    setFormCountry(profile?.country || '');
    setLoading(false);
  };

  const handleCancelSession = async (sessionId: string) => {
    await supabase.from('sessions').update({ status: 'cancelada' }).eq('id', sessionId);
    fetchAll();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await supabase.from('profiles').update({ full_name: formFullName, phone: formPhone, country: formCountry }).eq('id', user?.id);
    setSavingProfile(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = async () => { setLoggingOut(true); await signOut(); };

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario';
  const pendingSessions = sessions.filter(s => s.status === 'pendiente');
  const completedSessions = sessions.filter(s => s.status === 'completada');
  const confirmedSessions = sessions.filter(s => s.status === 'confirmada');
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const activeSub = subscriptions.find(s => s.status === 'activa');

  const stats = [
    { label: 'Total sesiones', value: sessions.length, icon: Calendar, change: sessions.length > 0 ? `+${sessions.length}` : '0', up: sessions.length > 0 },
    { label: 'Completadas', value: completedSessions.length, icon: CheckCircle, change: completedSessions.length > 0 ? `+${completedSessions.length}` : '0', up: completedSessions.length > 0 },
    { label: 'Pendientes', value: pendingSessions.length, icon: Clock, change: pendingSessions.length > 0 ? 'Revisar' : 'Ninguna', up: null },
    { label: 'Plan activo', value: activeSub ? '✓' : '–', icon: Shield, change: activeSub ? 'Activo' : 'Ninguno', up: !!activeSub },
  ];

  const progressData = [
    {
      label: 'Sesiones completadas',
      value: sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0,
      color: '#10B981',
    },
    {
      label: 'Plan adquirido',
      value: subscriptions.length > 0 ? 100 : 0,
      color: '#0A0E27',
    },
    {
      label: 'Plan completo',
      value: subscriptions.some(s => s.plan_type === 'plan_completo') ? 100 : subscriptions.length > 0 ? 40 : 0,
      color: '#10B981',
    },
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

        {/* TOPBAR */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <p className="font-bold text-gray-700 text-sm">
            {activeTab === 'inicio' ? 'Dashboard' : activeTab === 'progreso' ? 'Progreso' : activeTab === 'sesiones' ? 'Sesiones' : activeTab === 'explorar' ? 'Explorar' : activeTab === 'mensajes' ? 'Mensajes' : 'Perfil'}
          </p>
          <div className="flex items-center gap-2">
            {/* Toggle panel derecho */}
            <button onClick={() => setRightPanelVisible(!rightPanelVisible)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all" title={rightPanelVisible ? 'Ocultar panel' : 'Mostrar panel'}>
              {rightPanelVisible ? <PanelRightClose size={17} className="text-gray-500" /> : <PanelRightOpen size={17} className="text-gray-500" />}
            </button>

            {/* Notificaciones */}
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
                {unreadNotifs > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#10B981] rounded-full text-[8px] font-black text-white flex items-center justify-center">{unreadNotifs}</span>
                )}
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

            {/* Avatar */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-800 leading-none">{firstName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Cliente</p>
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
                    <h1 className="text-2xl font-bold text-gray-800">Hola, {firstName}! 👋</h1>
                    <p className="text-gray-500 text-sm mt-1">
                      {confirmedSessions.length > 0
                        ? `Tienes ${confirmedSessions.length} sesión${confirmedSessions.length > 1 ? 'es' : ''} confirmada${confirmedSessions.length > 1 ? 's' : ''}`
                        : 'Bienvenido a tu panel de asesorías'}
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
                      <h2 className="font-bold text-gray-800">Actividad de sesiones</h2>
                      <p className="text-gray-400 text-xs mt-0.5">Tus sesiones en los últimos 6 meses</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />Agendadas</div>
                      <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#0A0E27]" />Completadas</div>
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
                      <Area type="monotone" dataKey="sesiones" name="Agendadas" stroke="#10B981" strokeWidth={2} fill="url(#g1)" dot={{ fill: '#10B981', r: 3 }} />
                      <Area type="monotone" dataKey="completadas" name="Completadas" stroke="#0A0E27" strokeWidth={2} fill="url(#g2)" dot={{ fill: '#0A0E27', r: 3 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* PLANES ACTIVOS */}
                {subscriptions.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h2 className="font-bold text-gray-800 mb-4">Planes activos</h2>
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
                    <h2 className="font-bold text-gray-800">Sesiones activas</h2>
                    <span className="text-xs text-gray-400 font-medium">
                      Completado {sessions.length > 0 ? Math.round((completedSessions.length / sessions.length) * 100) : 0}%
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
                      <p className="text-gray-400 text-sm mb-4">Sin sesiones aún</p>
                      <Link to="/asesores" className="inline-flex items-center gap-2 bg-[#0A0E27] text-white font-bold px-5 py-2.5 rounded-full text-xs hover:bg-[#0A0E27]/90 transition-all">
                        Reservar primera sesión <ChevronRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── SESSIONS TAB ── */}
            {activeTab === 'sesiones' && (
              <div className="p-6 space-y-5">
                <h1 className="text-2xl font-bold text-gray-800">Mis sesiones</h1>
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
                    <p className="text-gray-400 mb-5">Sin sesiones registradas</p>
                    <Link to="/asesores" className="inline-flex items-center gap-2 bg-[#0A0E27] text-white font-bold px-6 py-3 rounded-full text-xs">
                      Explorar asesores <ChevronRight size={13} />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ── PROGRESS TAB ── */}
            {activeTab === 'progreso' && (
              <div className="p-6 space-y-5">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Progreso</h1>
                  <p className="text-gray-400 text-sm mt-1">Sigue tu crecimiento con tu asesor</p>
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
                  <h2 className="font-bold text-gray-800 mb-6">Actividad mensual</h2>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={sessionChartData} barSize={20}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" />
                      <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="sesiones" name="Agendadas" fill="#10B981" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="completadas" name="Completadas" fill="#0A0E27" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h2 className="font-bold text-gray-800 mb-5">Hitos alcanzados</h2>
                  <div className="space-y-3">
                    {[
                      { label: 'Primera sesión completada', done: completedSessions.length >= 1, desc: 'Completaste tu primera sesión de asesoría' },
                      { label: 'Plan activo adquirido', done: subscriptions.length > 0, desc: 'Compraste un plan de suscripción' },
                      { label: 'Hito: 3 sesiones', done: completedSessions.length >= 3, desc: 'Completa 3 sesiones de asesoría' },
                      { label: 'Actualización a plan completo', done: subscriptions.some(s => s.plan_type === 'plan_completo'), desc: 'Mejora al plan de asesoría completo' },
                    ].map((m, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-[#f1f3f5] border border-gray-200">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${m.done ? 'bg-[#10B981]/10 border-2 border-[#10B981]' : 'bg-gray-200 border-2 border-gray-300'}`}>
                          {m.done ? <CheckCircle size={16} className="text-[#10B981]" /> : <div className="w-2 h-2 rounded-full bg-gray-400" />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${m.done ? 'text-gray-800' : 'text-gray-400'}`}>{m.label}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{m.desc}</p>
                        </div>
                        {m.done && <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2.5 py-1 rounded-full">Listo</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── EXPLORE TAB ── */}
            {activeTab === 'explorar' && <ExploreTab />}

            {/* ── MESSAGES TAB ── */}
            {activeTab === 'mensajes' && (
              <div className="p-6 h-full flex flex-col">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Mensajes</h1>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm flex-1" style={{ minHeight: '500px' }}>
                  <ChatPanel user={user} profile={profile} onNavigate={setActiveTab} />
                </div>
              </div>
            )}

            {/* ── PROFILE TAB ── */}
            {activeTab === 'perfil' && (
              <div className="p-6 space-y-5">
                <h1 className="text-2xl font-bold text-gray-800">Mi perfil</h1>
                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                    <AvatarUpload
                      currentUrl={profile?.avatar_url}
                      onUploadComplete={async (url) => {
                        await supabase.from('profiles').update({ avatar_url: url }).eq('id', user?.id);
                      }}
                      size="lg"
                    />
                    <div>
                      <p className="font-bold text-gray-800 text-xl">{profile?.full_name}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{profile?.email}</p>
                      <span className="inline-block mt-2 text-[10px] font-semibold px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981]">Cliente</span>
                    </div>
                  </div>
                  <form onSubmit={handleSaveProfile} className="space-y-4 border-t border-gray-100 pt-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: 'Nombre completo', value: formFullName, set: setFormFullName, placeholder: 'Tu nombre completo' },
                        { label: 'Teléfono', value: formPhone, set: setFormPhone, placeholder: '+58 424 000 0000' },
                        { label: 'País', value: formCountry, set: setFormCountry, placeholder: 'Venezuela' },
                      ].map((f) => (
                        <div key={f.label}>
                          <label className="text-xs font-semibold text-gray-500 block mb-1.5">{f.label}</label>
                          <input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none bg-gray-50 transition-all" />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 block mb-1.5">Email</label>
                        <input value={profile?.email || ''} disabled
                          className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4 pt-2">
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
                    <button onClick={() => setActiveTab('mensajes')} title="Mensajes"
                      className="w-8 h-8 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-[#10B981]/10 hover:border-[#10B981]/30 transition-all">
                      <MessageCircle size={14} className="text-gray-500" />
                    </button>
                    <button onClick={() => setActiveTab('perfil')} title="Configuración"
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
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Chat en vivo</p>
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
