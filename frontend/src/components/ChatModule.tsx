import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import GlassCard from './GlassCard';

interface Props {
  role: 'cliente' | 'asesor';
}

const ChatModule: React.FC<Props> = ({ role }) => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [hasActivePlan, setHasActivePlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      checkActivePlan();
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
      subscribeToMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkActivePlan = async () => {
    if (role === 'cliente') {
      const { data } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('client_id', user?.id)
        .eq('status', 'activa')
        .limit(1);
      setHasActivePlan((data || []).length > 0);
    } else {
      setHasActivePlan(true);
    }
    setLoading(false);
  };

  const fetchConversations = async () => {
    if (role === 'cliente') {
      const { data } = await supabase
        .from('conversations')
        .select(`
          *,
          advisors (
            id, title, category,
            profiles ( full_name, avatar_url )
          )
        `)
        .eq('client_id', user?.id)
        .order('last_message_at', { ascending: false });
      setConversations(data || []);
    } else {
      const { data: advisorRow } = await supabase
        .from('advisors')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (advisorRow) {
        const { data } = await supabase
          .from('conversations')
          .select(`
            *,
            profiles!conversations_client_id_fkey ( full_name, avatar_url )
          `)
          .eq('advisor_id', advisorRow.id)
          .order('last_message_at', { ascending: false });
        setConversations(data || []);
      }
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select(`*, profiles!messages_sender_id_fkey ( full_name, avatar_url )`)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessages(data || []);

    await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user?.id);
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || sending) return;
    setSending(true);

    const content = newMessage.trim();
    setNewMessage('');

    await supabase.from('messages').insert({
      conversation_id: activeConversation.id,
      sender_id: user?.id,
      content,
    });

    await supabase
      .from('conversations')
      .update({ last_message: content, last_message_at: new Date().toISOString() })
      .eq('id', activeConversation.id);

    setSending(false);
    fetchConversations();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getConversationName = (conv: any) => {
    if (role === 'cliente') {
      return conv.advisors?.profiles?.full_name || 'Asesor';
    }
    return conv.profiles?.full_name || 'Cliente';
  };

  const getConversationAvatar = (conv: any) => {
    if (role === 'cliente') return conv.advisors?.profiles?.avatar_url;
    return conv.profiles?.avatar_url;
  };

  const getConversationSubtitle = (conv: any) => {
    if (role === 'cliente') return conv.advisors?.title || conv.advisors?.category;
    return 'Cliente';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 text-sm animate-pulse uppercase tracking-widest">Cargando mensajes...</p>
      </div>
    );
  }

  if (!hasActivePlan && role === 'cliente') {
    return (
      <GlassCard className="p-12 border-white/5 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-5">
          <Lock size={28} className="text-slate-500" />
        </div>
        <h3 className="text-white font-bold text-base uppercase tracking-wider mb-3">
          Chat bloqueado
        </h3>
        <p className="text-slate-500 text-sm font-light leading-relaxed max-w-sm mx-auto mb-6">
          Para acceder al chat con tu asesor necesitas tener un plan activo. Reserva una sesion para desbloquear esta funcion.
        </p>
        <a
          href="/asesores"
          className="inline-flex items-center gap-2 bg-[#10B981] text-[#0A0E27] font-black px-6 py-3 rounded-full text-[10px] uppercase tracking-wider hover:bg-[#0ea371] transition-all"
        >
          Ver asesores y planes
        </a>
      </GlassCard>
    );
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-200px)] min-h-96">

      {/* LISTA DE CONVERSACIONES */}
      <div className={`w-72 flex-shrink-0 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <GlassCard className="flex-1 border-white/5 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-white/5">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#10B981]">
              Conversaciones
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full p-4 border-b border-white/5 last:border-0 text-left hover:bg-white/5 transition-all ${
                    activeConversation?.id === conv.id ? 'bg-[#10B981]/5 border-l-2 border-l-[#10B981]' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] font-black text-sm flex-shrink-0 overflow-hidden">
                      {getConversationAvatar(conv) ? (
                        <img src={getConversationAvatar(conv)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        getConversationName(conv)[0]
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-white text-xs font-bold truncate">{getConversationName(conv)}</p>
                      <p className="text-slate-500 text-[10px] truncate">
                        {conv.last_message || 'Sin mensajes aun'}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageCircle size={24} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-xs font-light">
                  {role === 'cliente'
                    ? 'Reserva un plan para iniciar una conversacion con tu asesor'
                    : 'Las conversaciones apareceran aqui cuando los clientes te escriban'
                  }
                </p>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* VENTANA DE CHAT */}
      <div className={`flex-1 flex flex-col ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <GlassCard className="flex-1 border-white/5 overflow-hidden flex flex-col">

            {/* HEADER DEL CHAT */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
              <button
                onClick={() => setActiveConversation(null)}
                className="md:hidden text-slate-500 hover:text-white transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="w-9 h-9 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] font-black text-sm overflow-hidden">
                {getConversationAvatar(activeConversation) ? (
                  <img src={getConversationAvatar(activeConversation)} alt="" className="w-full h-full object-cover" />
                ) : (
                  getConversationName(activeConversation)[0]
                )}
              </div>
              <div>
                <p className="text-white text-sm font-bold">{getConversationName(activeConversation)}</p>
                <p className="text-slate-500 text-[10px]">{getConversationSubtitle(activeConversation)}</p>
              </div>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[#10B981] text-[9px] font-bold uppercase tracking-wider">En linea</span>
              </div>
            </div>

            {/* MENSAJES */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle size={32} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-light">
                      Inicia la conversacion enviando un mensaje
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isOwn
                            ? 'bg-[#10B981] text-[#0A0E27] rounded-tr-sm'
                            : 'bg-white/10 text-white rounded-tl-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-600">
                            {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isOwn && msg.read && (
                            <CheckCircle size={10} className="text-[#10B981]" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 border-t border-white/5">
              <div className="flex items-end gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe un mensaje... (Enter para enviar)"
                  rows={1}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors resize-none"
                  style={{ maxHeight: '120px' }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="w-10 h-10 bg-[#10B981] text-[#0A0E27] rounded-xl flex items-center justify-center hover:bg-[#0ea371] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>

          </GlassCard>
        ) : (
          <GlassCard className="flex-1 border-white/5 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle size={40} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 text-sm font-light">
                Selecciona una conversacion para comenzar
              </p>
            </div>
          </GlassCard>
        )}
      </div>

    </div>
  );
};

export default ChatModule;
