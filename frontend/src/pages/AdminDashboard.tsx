import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, DollarSign, Settings,
  TrendingUp, Bell, LogOut, ChevronRight, CheckCircle, XCircle,
  Clock, AlertCircle, Eye, Search, Filter, RefreshCw, Download,
  Activity, BarChart2, ArrowUpRight, ArrowDownRight, FileText,
  UserCheck, UserX, Banknote, Percent, Globe, Moon, Sun,
  ChevronDown, MoreHorizontal, X, Check, MessageSquare, Loader2,
  Shield, Star, Calendar, Hash, Sliders, Database
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useDarkMode } from '../context/DarkModeContext';

// ─── TYPES ──────────────────────────────────────────────────
interface Stats {
  totalUsers: number;
  totalClients: number;
  totalAdvisors: number;
  totalRevenue: number;
  totalCommissions: number;
  totalSessions: number;
  activeSessions: number;
  pendingVerifications: number;
  pendingPayouts: number;
  newUsersThisMonth: number;
  revenueThisMonth: number;
}

interface VerificationRequest {
  id: string;
  user_id: string;
  advisor_id: string;
  full_legal_name: string;
  professional_title: string;
  education_level: string;
  university: string;
  linkedin_url: string;
  status: string;
  submitted_at: string;
  notes: string;
  id_document_url: string;
  selfie_url: string;
  degree_url: string;
  license_url: string;
  certificate_urls: any[];
  profiles?: { full_name: string; email: string; avatar_url: string };
}

// ─── MINI STAT CARD ─────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, trend }: any) => (
  <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
          {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
      {sub && <p className="text-xs text-emerald-500 font-medium mt-1">{sub}</p>}
    </div>
  </div>
);

// ─── STATUS BADGE ───────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    pending:   { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
    approved:  { label: 'Aprobado',   cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    rejected:  { label: 'Rechazado',  cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
    more_info: { label: 'Más info',   cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
    completed: { label: 'Completado', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    active:    { label: 'Activo',     cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    inactive:  { label: 'Inactivo',   cls: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40' },
    activa:    { label: 'Activa',     cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    pendiente: { label: 'Pendiente',  cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  };
  const s = map[status] || { label: status, cls: 'bg-gray-100 text-gray-500' };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
};

// ─── VERIFICATION DETAIL MODAL ───────────────────────────────
const VerificationModal = ({ req, onClose, onDecision }: {
  req: VerificationRequest;
  onClose: () => void;
  onDecision: (id: string, status: 'approved' | 'rejected', reason?: string) => void;
}) => {
  const [rejReason, setRejReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    await onDecision(req.id, 'approved');
    setLoading(false);
    onClose();
  };

  const handleReject = async () => {
    if (!rejReason.trim()) return;
    setLoading(true);
    await onDecision(req.id, 'rejected', rejReason);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f1629] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Solicitud de Verificación</h2>
            <p className="text-sm text-gray-400 mt-0.5">{req.profiles?.email}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all">
            <X size={16} className="text-gray-500 dark:text-white/60" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Identity */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Identidad Personal</p>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Nombre legal" value={req.full_legal_name} />
              <InfoRow label="Título profesional" value={req.professional_title} />
            </div>
          </div>

          {/* Education */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Educación y Credenciales</p>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Nivel educativo" value={req.education_level} />
              <InfoRow label="Universidad" value={req.university || '—'} />
            </div>
            {req.linkedin_url && (
              <a href={req.linkedin_url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 mt-3 text-sm text-blue-500 hover:text-blue-600 transition-colors">
                <Globe size={14} /> Ver LinkedIn
              </a>
            )}
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Documentos Adjuntos</p>
            <div className="grid grid-cols-2 gap-3">
              <DocLink label="Documento de identidad" url={req.id_document_url} />
              <DocLink label="Selfie con documento" url={req.selfie_url} />
              <DocLink label="Título universitario" url={req.degree_url} />
              <DocLink label="Licencia profesional" url={req.license_url} />
            </div>
            {req.certificate_urls?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-2">Certificados adicionales:</p>
                <div className="flex flex-wrap gap-2">
                  {req.certificate_urls.map((cert: any, i: number) => (
                    <a key={i} href={cert.url} target="_blank" rel="noreferrer"
                      className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">
                      {cert.name || `Certificado ${i + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {req.notes && (
            <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nota del Asesor</p>
              <p className="text-sm text-gray-600 dark:text-white/70">{req.notes}</p>
            </div>
          )}

          {/* Reject reason */}
          {showReject && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Motivo de Rechazo</p>
              <textarea
                value={rejReason}
                onChange={e => setRejReason(e.target.value)}
                placeholder="Explica al asesor por qué fue rechazada su solicitud..."
                rows={3}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-red-400 resize-none"
              />
            </div>
          )}

          {/* Actions */}
          {req.status === 'pending' && (
            <div className="flex gap-3 pt-2">
              {!showReject ? (
                <>
                  <button onClick={handleApprove} disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-600 transition-all disabled:opacity-60">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                    Aprobar Verificación
                  </button>
                  <button onClick={() => setShowReject(true)}
                    className="flex-1 flex items-center justify-center gap-2 border border-red-300 dark:border-red-500/30 text-red-500 font-bold py-3 rounded-xl text-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                    <X size={15} /> Rechazar
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleReject} disabled={loading || !rejReason.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-red-600 transition-all disabled:opacity-60">
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <XCircle size={15} />}
                    Confirmar Rechazo
                  </button>
                  <button onClick={() => setShowReject(false)}
                    className="px-5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    <p className="text-sm font-semibold text-gray-900 dark:text-white">{value || '—'}</p>
  </div>
);

const DocLink = ({ label, url }: { label: string; url?: string }) => (
  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 flex items-center justify-between">
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xs font-medium text-gray-600 dark:text-white/60 mt-0.5">
        {url ? 'Adjunto' : 'No enviado'}
      </p>
    </div>
    {url ? (
      <a href={url} target="_blank" rel="noreferrer"
        className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all">
        <Eye size={13} className="text-blue-500" />
      </a>
    ) : (
      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
        <X size={13} className="text-gray-300 dark:text-white/20" />
      </div>
    )}
  </div>
);

// ─── CUSTOM TOOLTIP ─────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-[#0f1629] border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 shadow-xl text-xs">
        <p className="font-bold text-gray-700 dark:text-white mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="font-medium">
            {p.name}: {p.name.includes('$') || p.name === 'Ingresos' || p.name === 'Comisiones' ? `$${p.value}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ═══════════════════════════════════════════════════════════════
// MAIN ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0, totalClients: 0, totalAdvisors: 0,
    totalRevenue: 0, totalCommissions: 0, totalSessions: 0,
    activeSessions: 0, pendingVerifications: 0, pendingPayouts: 0,
    newUsersThisMonth: 0, revenueThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<VerificationRequest[]>([]);
  const [selectedVerif, setSelectedVerif] = useState<VerificationRequest | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState<Record<string, string>>({});

  // ── LOAD DATA ───────────────────────────────────────────────
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadStats(),
      loadVerifications(),
      loadUsers(),
      loadSessions(),
      loadPayouts(),
      loadSettings(),
      loadChartData(),
    ]);
    setLoading(false);
  };

  const loadStats = async () => {
    const [
      { count: totalUsers },
      { count: totalClients },
      { count: totalAdvisors },
      { data: payments },
      { count: totalSessions },
      { count: activeSessions },
      { count: pendingVerif },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'cliente'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'asesor'),
      supabase.from('payments').select('amount, created_at').eq('status', 'completado'),
      supabase.from('sessions').select('*', { count: 'exact', head: true }),
      supabase.from('sessions').select('*', { count: 'exact', head: true }).in('status', ['pendiente', 'confirmada']),
      supabase.from('advisor_verification').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const totalRev = (payments || []).reduce((a, p) => a + Number(p.amount), 0);
    const monthRev = (payments || []).filter(p => p.created_at >= monthStart).reduce((a, p) => a + Number(p.amount), 0);

    setStats({
      totalUsers: totalUsers || 0,
      totalClients: totalClients || 0,
      totalAdvisors: totalAdvisors || 0,
      totalRevenue: totalRev,
      totalCommissions: totalRev * 0.2,
      totalSessions: totalSessions || 0,
      activeSessions: activeSessions || 0,
      pendingVerifications: pendingVerif || 0,
      pendingPayouts: 0,
      newUsersThisMonth: 0,
      revenueThisMonth: monthRev,
    });
  };

  const loadVerifications = async () => {
    const { data } = await supabase
      .from('advisor_verification')
      .select('*, profiles(full_name, email, avatar_url)')
      .order('submitted_at', { ascending: false });
    setVerifications(data || []);
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, advisors(verified, verification_status, rating, available)')
      .order('created_at', { ascending: false })
      .limit(100);
    setUsers(data || []);
  };

  const loadSessions = async () => {
    const { data } = await supabase
      .from('sessions')
      .select('*, profiles!sessions_client_id_fkey(full_name), advisors(id, profiles(full_name))')
      .order('created_at', { ascending: false })
      .limit(50);
    setSessions(data || []);
  };

  const loadPayouts = async () => {
    const { data } = await supabase
      .from('payouts')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(50);
    setPayouts(data || []);
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from('platform_settings')
      .select('*')
      .order('key');
    if (data) {
      setSettings(data);
      const form: Record<string, string> = {};
      data.forEach(s => { form[s.key] = s.value; });
      setSettingsForm(form);
    }
  };

  const loadChartData = async () => {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, created_at')
      .eq('status', 'completado');

    const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { mes: MONTHS[d.getMonth()], ingresos: 0, comisiones: 0, year: d.getFullYear(), month: d.getMonth() };
    });

    (payments || []).forEach(p => {
      const d = new Date(p.created_at);
      const idx = months.findIndex(m => m.month === d.getMonth() && m.year === d.getFullYear());
      if (idx >= 0) {
        months[idx].ingresos += Number(p.amount);
        months[idx].comisiones += Number(p.amount) * 0.2;
      }
    });

    setChartData(months.map(m => ({
      mes: m.mes,
      Ingresos: Math.round(m.ingresos),
      Comisiones: Math.round(m.comisiones),
    })));
  };

  // ── VERIFICATION DECISION ────────────────────────────────────
  const handleVerificationDecision = async (id: string, status: 'approved' | 'rejected', reason?: string) => {
    const verif = verifications.find(v => v.id === id);
    if (!verif) return;

    await supabase
      .from('advisor_verification')
      .update({
        status,
        rejection_reason: reason || null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: profile?.id,
      })
      .eq('id', id);

    await supabase
      .from('advisors')
      .update({
        verified: status === 'approved',
        verification_status: status,
        rejection_reason: reason || null,
      })
      .eq('id', verif.advisor_id);

    // Log activity
    await supabase.from('admin_activity_log').insert({
      admin_id: profile?.id,
      action: status === 'approved' ? 'approve_verification' : 'reject_verification',
      target_type: 'verification',
      target_id: id,
      details: { reason, advisor_id: verif.advisor_id },
    });

    // Notify advisor
    await supabase.from('notifications').insert({
      user_id: verif.user_id,
      message: status === 'approved'
        ? '¡Tu verificación fue aprobada! Ya puedes ofrecer tus servicios en la plataforma.'
        : `Tu solicitud de verificación fue rechazada. Motivo: ${reason}`,
      type: 'verificacion',
      read: false,
    });

    loadVerifications();
    loadStats();
  };

  // ── SAVE SETTINGS ────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const updates = Object.entries(settingsForm).map(([key, value]) =>
      supabase.from('platform_settings').update({ value, updated_at: new Date().toISOString(), updated_by: profile?.id }).eq('key', key)
    );
    await Promise.all(updates);
    setSavingSettings(false);
    loadSettings();
  };

  // ── TOGGLE USER ADMIN ────────────────────────────────────────
  const toggleAdmin = async (userId: string, current: boolean) => {
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', userId);
    loadUsers();
  };

  const filteredUsers = users.filter(u => {
    const q = searchUser.toLowerCase();
    const matchQ = !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchR = filterRole === 'all' || u.role === filterRole;
    return matchQ && matchR;
  });

  const tabs = [
    { id: 'overview',       label: 'Resumen',      icon: LayoutDashboard },
    { id: 'verifications',  label: 'Verificaciones', icon: ShieldCheck,  badge: stats.pendingVerifications },
    { id: 'users',          label: 'Usuarios',     icon: Users },
    { id: 'sessions',       label: 'Sesiones',     icon: Calendar },
    { id: 'payouts',        label: 'Pagos',        icon: Banknote },
    { id: 'settings',       label: 'Configuración', icon: Settings },
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'dark bg-[#0A0E27]' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
            <Loader2 size={22} className="text-emerald-400 animate-spin" />
          </div>
          <p className="text-sm text-gray-400">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#0A0E27]' : 'bg-gray-50'} flex`}>
      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className="w-60 shrink-0 bg-white dark:bg-white/[0.03] border-r border-gray-100 dark:border-white/10 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-black tracking-widest text-gray-900 dark:text-white uppercase">AXIOMA</p>
              <p className="text-[9px] font-bold text-emerald-500 tracking-[0.3em] uppercase">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <tab.icon size={16} />
              <span className="flex-1 text-left">{tab.label}</span>
              {tab.badge ? (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-100 dark:border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-500">
                {profile?.full_name?.[0]?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{profile?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-emerald-500 font-medium">Administrador</p>
            </div>
          </div>
          <button onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white transition-all">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
            {isDark ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <header className="bg-white dark:bg-white/[0.03] border-b border-gray-100 dark:border-white/10 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white capitalize">
              {tabs.find(t => t.id === activeTab)?.label || 'Resumen'}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button onClick={loadAll}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-white/80 transition-colors">
            <RefreshCw size={13} /> Actualizar
          </button>
        </header>

        <div className="p-8">

          {/* ══ OVERVIEW ══════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Usuarios totales" value={stats.totalUsers} color="bg-blue-500" trend={12} />
                <StatCard icon={DollarSign} label="Ingresos totales" value={`$${stats.totalRevenue.toFixed(0)}`} color="bg-emerald-500" trend={8} sub={`$${stats.revenueThisMonth.toFixed(0)} este mes`} />
                <StatCard icon={Percent} label="Comisiones plataforma" value={`$${stats.totalCommissions.toFixed(0)}`} color="bg-violet-500" trend={8} />
                <StatCard icon={Activity} label="Sesiones activas" value={stats.activeSessions} color="bg-amber-500" sub={`${stats.totalSessions} total`} />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={UserCheck} label="Asesores" value={stats.totalAdvisors} color="bg-teal-500" />
                <StatCard icon={Users} label="Clientes" value={stats.totalClients} color="bg-indigo-500" />
                <StatCard icon={ShieldCheck} label="Verificaciones pendientes" value={stats.pendingVerifications} color="bg-red-500" />
                <StatCard icon={Banknote} label="Pagos pendientes" value={stats.pendingPayouts} color="bg-orange-500" />
              </div>

              {/* Revenue Chart */}
              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Ingresos y Comisiones</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Últimos 6 meses</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <span className="w-3 h-1 rounded-full bg-emerald-500 inline-block" /> Ingresos
                    </span>
                    <span className="flex items-center gap-1.5 text-gray-400">
                      <span className="w-3 h-1 rounded-full bg-violet-500 inline-block" /> Comisiones
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradComisiones" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="Ingresos" stroke="#10B981" strokeWidth={2} fill="url(#gradIngresos)" />
                    <Area type="monotone" dataKey="Comisiones" stroke="#8B5CF6" strokeWidth={2} fill="url(#gradComisiones)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent verifications & sessions */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Verificaciones Recientes</h3>
                    <button onClick={() => setActiveTab('verifications')} className="text-xs text-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1">
                      Ver todas <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {verifications.slice(0, 5).map(v => (
                      <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all cursor-pointer" onClick={() => setSelectedVerif(v)}>
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-500">
                          {v.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{v.profiles?.full_name || 'Sin nombre'}</p>
                          <p className="text-[10px] text-gray-400 truncate">{v.professional_title}</p>
                        </div>
                        <StatusBadge status={v.status} />
                      </div>
                    ))}
                    {verifications.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">Sin solicitudes de verificación</p>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Sesiones Recientes</h3>
                    <button onClick={() => setActiveTab('sessions')} className="text-xs text-emerald-500 hover:text-emerald-600 transition-colors flex items-center gap-1">
                      Ver todas <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map(s => (
                      <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                          <Calendar size={14} className="text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {s.profiles?.full_name || 'Cliente'}
                          </p>
                          <p className="text-[10px] text-gray-400">{new Date(s.created_at).toLocaleDateString('es-ES')}</p>
                        </div>
                        <StatusBadge status={s.status} />
                      </div>
                    ))}
                    {sessions.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">Sin sesiones registradas</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ VERIFICATIONS ═════════════════════════════════ */}
          {activeTab === 'verifications' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {['all', 'pending', 'approved', 'rejected'].map(s => (
                    <button key={s}
                      onClick={() => {}}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                        s === 'all' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/20'
                      }`}>
                      {s === 'all' ? 'Todas' : s === 'pending' ? 'Pendientes' : s === 'approved' ? 'Aprobadas' : 'Rechazadas'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10">
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Asesor</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Título</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Educación</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Enviado</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Estado</th>
                      <th className="px-4 py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {verifications.map(v => (
                      <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-500">
                              {v.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{v.profiles?.full_name || 'Sin nombre'}</p>
                              <p className="text-xs text-gray-400">{v.profiles?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-white/70">{v.professional_title}</td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-white/70">{v.education_level || '—'}</td>
                        <td className="px-4 py-4 text-xs text-gray-400">
                          {new Date(v.submitted_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={v.status} /></td>
                        <td className="px-4 py-4">
                          <button onClick={() => setSelectedVerif(v)}
                            className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 hover:text-emerald-600 transition-colors">
                            <Eye size={13} /> Revisar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {verifications.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-sm text-gray-400">
                          No hay solicitudes de verificación
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ USERS ══════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchUser}
                    onChange={e => setSearchUser(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'cliente', 'asesor'].map(r => (
                    <button key={r} onClick={() => setFilterRole(r)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        filterRole === r ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/20'
                      }`}>
                      {r === 'all' ? 'Todos' : r === 'cliente' ? 'Clientes' : 'Asesores'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10">
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Usuario</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Rol</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">País</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Registrado</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Estado</th>
                      <th className="px-4 py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} className="w-9 h-9 rounded-xl object-cover" alt="" />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-500">
                                {u.full_name?.[0]?.toUpperCase() || '?'}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">{u.full_name || 'Sin nombre'}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            u.role === 'asesor'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                          }`}>
                            {u.role === 'asesor' ? 'Asesor' : 'Cliente'}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-white/70">{u.country || '—'}</td>
                        <td className="px-4 py-4 text-xs text-gray-400">
                          {new Date(u.created_at || '').toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-4">
                          {u.role === 'asesor' && (
                            <div className="flex items-center gap-2">
                              {u.advisors?.verified && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                  <ShieldCheck size={10} /> Verificado
                                </span>
                              )}
                              {u.advisors?.available && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                  Disponible
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={() => toggleAdmin(u.id, u.is_admin)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                              u.is_admin
                                ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400 hover:bg-violet-200 dark:hover:bg-violet-500/30'
                                : 'bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}>
                            {u.is_admin ? 'Admin ✓' : 'Hacer Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-sm text-gray-400">
                          No se encontraron usuarios
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ SESSIONS ═══════════════════════════════════════ */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10">
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Cliente</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Asesor</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Precio</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Fecha</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {sessions.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {s.profiles?.full_name || 'Cliente'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-white/70">
                          {s.advisors?.profiles?.full_name || 'Asesor'}
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-emerald-500">
                          ${Number(s.price || 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-400">
                          {new Date(s.created_at).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={s.status} /></td>
                      </tr>
                    ))}
                    {sessions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-sm text-gray-400">
                          No hay sesiones registradas
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ PAYOUTS ═══════════════════════════════════════ */}
          {activeTab === 'payouts' && (
            <div className="space-y-6">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl p-5">
                  <p className="text-xs text-gray-400 mb-2">Total pagado a asesores</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">
                    ${payouts.filter(p => p.status === 'completed').reduce((a, p) => a + Number(p.net_amount), 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl p-5">
                  <p className="text-xs text-gray-400 mb-2">Pendiente de procesar</p>
                  <p className="text-2xl font-black text-amber-500">
                    ${payouts.filter(p => p.status === 'pending').reduce((a, p) => a + Number(p.net_amount), 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl p-5">
                  <p className="text-xs text-gray-400 mb-2">Comisiones retenidas</p>
                  <p className="text-2xl font-black text-emerald-500">
                    ${(stats.totalRevenue * 0.2).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Historial de Pagos a Asesores</h3>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10">
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Asesor</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Bruto</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Comisión (20%)</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Neto</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Período</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {payouts.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {p.profiles?.full_name || 'Asesor'}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-white/70">${Number(p.gross_amount).toFixed(2)}</td>
                        <td className="px-4 py-4 text-sm text-red-400">-${Number(p.commission_amount).toFixed(2)}</td>
                        <td className="px-4 py-4 text-sm font-bold text-emerald-500">${Number(p.net_amount).toFixed(2)}</td>
                        <td className="px-4 py-4 text-xs text-gray-400">
                          {p.period_start} — {p.period_end}
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                    {payouts.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-sm text-gray-400">
                          No hay pagos registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ SETTINGS ═══════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Configuración de la Plataforma</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Parámetros operativos del sistema</p>
                  </div>
                  <button onClick={handleSaveSettings} disabled={savingSettings}
                    className="flex items-center gap-2 bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-60">
                    {savingSettings ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    Guardar cambios
                  </button>
                </div>

                <div className="space-y-4">
                  {settings.map(s => (
                    <div key={s.key}>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1.5">
                        {s.description || s.key}
                      </label>
                      <input
                        value={settingsForm[s.key] || ''}
                        onChange={e => setSettingsForm(prev => ({ ...prev, [s.key]: e.target.value }))}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                        placeholder={s.value}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Commission info */}
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                    <Percent size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Modelo de Comisiones</p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400/80 mt-1 leading-relaxed">
                      La plataforma retiene un <strong>{settingsForm['commission_rate'] || 20}%</strong> de cada pago.
                      El asesor recibe el <strong>{100 - Number(settingsForm['commission_rate'] || 20)}%</strong> neto.
                      Los pagos se procesan mensualmente el día <strong>{settingsForm['payout_day'] || 5}</strong> de cada mes,
                      con un mínimo de <strong>${settingsForm['min_payout_threshold'] || 50}</strong> USD acumulados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Verification Modal */}
      {selectedVerif && (
        <VerificationModal
          req={selectedVerif}
          onClose={() => setSelectedVerif(null)}
          onDecision={handleVerificationDecision}
        />
      )}
    </div>
  );
}
