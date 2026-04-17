import React, { useState, useEffect } from 'react';
import {
  Headphones, Plus, Send, ChevronRight, ChevronLeft,
  Loader2, CheckCircle, Clock, MessageSquare, X, Inbox
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  userId: string;
  isDark: boolean;
}

const CATEGORIES = [
  { value: 'general', label: 'Consulta general' },
  { value: 'pagos', label: 'Pagos y facturación' },
  { value: 'sesiones', label: 'Sesiones' },
  { value: 'cuenta', label: 'Mi cuenta' },
  { value: 'verificacion', label: 'Verificación' },
  { value: 'tecnico', label: 'Problema técnico' },
  { value: 'otro', label: 'Otro' },
];

const PRIORITIES = [
  { value: 'baja', label: 'Baja', color: 'text-gray-400' },
  { value: 'normal', label: 'Normal', color: 'text-blue-500' },
  { value: 'alta', label: 'Alta', color: 'text-amber-500' },
  { value: 'urgente', label: 'Urgente', color: 'text-red-500' },
];

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  abierto: { label: 'Abierto', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  en_revision: { label: 'En revisión', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  respondido: { label: 'Respondido', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  cerrado: { label: 'Cerrado', cls: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40' },
};

export default function SupportWidget({ userId, isDark }: Props) {
  const [view, setView] = useState<'list' | 'new' | 'thread'>('list');
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New ticket form
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('general');
  const [priority, setPriority] = useState('normal');
  const [firstMessage, setFirstMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reply
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => { loadTickets(); }, [userId]);

  const loadTickets = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  };

  const loadMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const handleOpenTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    await loadMessages(ticket.id);
    setView('thread');
  };

  const handleCreateTicket = async () => {
    if (!subject.trim() || !firstMessage.trim()) return;
    setSubmitting(true);
    const { data: ticket, error } = await supabase
      .from('support_tickets')
      .insert({ user_id: userId, subject: subject.trim(), category, priority, status: 'abierto' })
      .select()
      .single();
    if (!error && ticket) {
      await supabase.from('support_messages').insert({
        ticket_id: ticket.id,
        sender_id: userId,
        is_staff: false,
        body: firstMessage.trim(),
      });
      setSuccess(true);
      await loadTickets();
      setTimeout(() => {
        setSuccess(false);
        setSubject(''); setCategory('general'); setPriority('normal'); setFirstMessage('');
        setView('list');
      }, 2000);
    }
    setSubmitting(false);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);
    await supabase.from('support_messages').insert({
      ticket_id: selectedTicket.id,
      sender_id: userId,
      is_staff: false,
      body: replyText.trim(),
    });
    await supabase.from('support_tickets').update({
      status: 'abierto',
      updated_at: new Date().toISOString(),
    }).eq('id', selectedTicket.id);
    setReplyText('');
    await loadMessages(selectedTicket.id);
    await loadTickets();
    setSendingReply(false);
  };

  const inputCls = `w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'} placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors`;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {view === 'new' ? 'Nuevo ticket de soporte' : view === 'thread' && selectedTicket ? selectedTicket.subject : 'Soporte'}
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            {view === 'list' ? 'Historial de solicitudes de ayuda' : view === 'new' ? 'Describe tu problema y te ayudaremos' : 'Conversación con el equipo de soporte'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(view === 'new' || view === 'thread') && (
            <button onClick={() => { setView('list'); setSelectedTicket(null); }}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all ${isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <ChevronLeft size={13} /> Volver
            </button>
          )}
          {view === 'list' && (
            <button onClick={() => setView('new')}
              className="flex items-center gap-2 bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-600 transition-all">
              <Plus size={14} /> Nuevo ticket
            </button>
          )}
        </div>
      </div>

      {/* ── LIST VIEW ── */}
      {view === 'list' && (
        <>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="text-emerald-500 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className={`rounded-2xl border p-10 text-center ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-gray-50 border-gray-100'}`}>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <Headphones size={22} className="text-emerald-500" />
              </div>
              <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>Sin solicitudes de soporte</p>
              <p className="text-xs text-gray-400">¿Tienes algún problema? Crea un ticket y te ayudamos.</p>
              <button onClick={() => setView('new')}
                className="mt-4 inline-flex items-center gap-2 bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all">
                <Plus size={13} /> Crear ticket
              </button>
            </div>
          ) : (
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-100'}`}>
              {tickets.map((t, i) => {
                const st = STATUS_LABEL[t.status] || STATUS_LABEL['abierto'];
                return (
                  <button key={t.id} onClick={() => handleOpenTicket(t)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all ${i < tickets.length - 1 ? 'border-b border-gray-50 dark:border-white/5' : ''}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.status === 'respondido' ? 'bg-emerald-500/20' : t.status === 'cerrado' ? 'bg-gray-100 dark:bg-white/5' : 'bg-blue-500/20'}`}>
                      {t.status === 'respondido' ? <CheckCircle size={16} className="text-emerald-500" /> :
                       t.status === 'cerrado' ? <X size={16} className="text-gray-400" /> :
                       <MessageSquare size={16} className="text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>{t.subject}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {t.category} · {new Date(t.updated_at || t.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold ${st.cls}`}>{st.label}</span>
                      <ChevronRight size={14} className="text-gray-300 dark:text-white/20" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── NEW TICKET VIEW ── */}
      {view === 'new' && (
        <div className={`rounded-2xl border p-6 space-y-4 ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-100'}`}>
          {success ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>¡Ticket creado!</p>
              <p className="text-xs text-gray-400">Nuestro equipo te responderá pronto.</p>
            </div>
          ) : (
            <>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Asunto *</label>
                <input className={inputCls} value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Describe brevemente tu problema..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Categoría</label>
                  <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Prioridad</label>
                  <select className={inputCls} value={priority} onChange={e => setPriority(e.target.value)}>
                    {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Descripción *</label>
                <textarea className={`${inputCls} resize-none`} rows={5} value={firstMessage} onChange={e => setFirstMessage(e.target.value)}
                  placeholder="Explica tu problema con el mayor detalle posible. Incluye pasos para reproducirlo si aplica." />
              </div>
              <button onClick={handleCreateTicket} disabled={!subject.trim() || !firstMessage.trim() || submitting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-600 transition-all disabled:opacity-40">
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                Enviar solicitud
              </button>
            </>
          )}
        </div>
      )}

      {/* ── THREAD VIEW ── */}
      {view === 'thread' && selectedTicket && (
        <div className={`rounded-2xl border overflow-hidden flex flex-col ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-gray-100'}`}>
          {/* Ticket info bar */}
          <div className={`flex items-center gap-3 px-5 py-3 border-b text-xs ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg font-bold ${STATUS_LABEL[selectedTicket.status]?.cls}`}>
              {STATUS_LABEL[selectedTicket.status]?.label}
            </span>
            <span className="text-gray-400">{CATEGORIES.find(c => c.value === selectedTicket.category)?.label}</span>
            <span className="text-gray-300 dark:text-white/20">·</span>
            <span className="text-gray-400">{new Date(selectedTicket.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          {/* Messages */}
          <div className="p-5 space-y-4 min-h-[200px] max-h-96 overflow-y-auto">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.is_staff ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${msg.is_staff ? 'bg-emerald-500 text-white' : 'bg-blue-500/20 text-blue-500'}`}>
                  {msg.is_staff ? 'AX' : (msg.profiles?.full_name?.[0]?.toUpperCase() || '?')}
                </div>
                <div className={`flex flex-col gap-1 max-w-sm ${msg.is_staff ? 'items-end' : 'items-start'}`}>
                  <p className="text-[10px] text-gray-400">
                    {msg.is_staff ? 'Axioma Soporte' : msg.profiles?.full_name} · {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.is_staff
                    ? 'bg-emerald-500 text-white rounded-tr-sm'
                    : `${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'} rounded-tl-sm`
                  }`}>
                    {msg.body}
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <Inbox size={24} className="text-gray-200 dark:text-white/10" />
                <p className="text-xs text-gray-400">Sin mensajes aún</p>
              </div>
            )}
          </div>

          {/* Reply box */}
          {selectedTicket.status !== 'cerrado' && (
            <div className={`flex gap-3 p-4 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                placeholder="Escribe tu mensaje..."
                className={`flex-1 ${inputCls}`}
              />
              <button onClick={handleSendReply} disabled={!replyText.trim() || sendingReply}
                className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all disabled:opacity-40">
                {sendingReply ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
          )}
          {selectedTicket.status === 'cerrado' && (
            <div className={`px-5 py-3 border-t text-center text-xs text-gray-400 ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
              Este ticket está cerrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}
