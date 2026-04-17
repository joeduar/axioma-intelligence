
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, DollarSign, Settings,
  TrendingUp, Bell, LogOut, ChevronRight, CheckCircle, XCircle,
  Clock, AlertCircle, Eye, Search, Filter, RefreshCw, Download,
  Activity, BarChart2, ArrowUpRight, ArrowDownRight, FileText,
  UserCheck, UserX, Banknote, Percent, Globe, Moon, Sun,
  ChevronDown, MoreHorizontal, X, Check, MessageSquare, Loader2,
  Shield, Star, Calendar, Hash, Sliders, Database,
  UserPlus, Inbox, Send, Tag, ToggleLeft, ToggleRight, Headphones, Lock
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
    pending: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
    approved: { label: 'Aprobado', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    rejected: { label: 'Rechazado', cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
    more_info: { label: 'Más info', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
    completed: { label: 'Completado', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    active: { label: 'Activo', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    inactive: { label: 'Inactivo', cls: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40' },
    activa: { label: 'Activa', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
    pendiente: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
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

// ─── USER DETAIL MODAL ──────────────────────────────────────
const UserDetailModal = ({ userId, onClose }: { userId: string; onClose: () => void }) => {
  const [userData, setUserData] = useState<any>(null);
  const [advisorData, setAdvisorData] = useState<any>(null);
  const [payoutData, setPayoutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ data: prof }, { data: adv }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('advisors').select('*').eq('user_id', userId).maybeSingle(),
      ]);
      setUserData(prof);
      setAdvisorData(adv);
      if (adv) {
        const { data: payout } = await supabase
          .from('advisor_payout_info')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        setPayoutData(payout);
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const field = (label: string, value: string | undefined | null) => value ? (
    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
      <p className="text-[10px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900 dark:text-white break-all">{value}</p>
    </div>
  ) : null;

  const maskAccount = (val: string) => val ? '•••• ' + val.slice(-4) : '—';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0f1629] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Detalle de Usuario</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all">
            <X size={15} className="text-gray-500 dark:text-white/60" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={22} className="text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              {userData?.avatar_url ? (
                <img src={userData.avatar_url} className="w-14 h-14 rounded-2xl object-cover" alt="" />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-xl font-black text-emerald-500">
                  {userData?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{userData?.full_name || 'Sin nombre'}</p>
                <p className="text-sm text-gray-400">{userData?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${userData?.role === 'asesor' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                    {userData?.role === 'asesor' ? 'Asesor' : 'Cliente'}
                  </span>
                  {userData?.is_admin && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400">Admin</span>
                  )}
                  {userData?.full_name ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Activo
                    </span>
                  ) : (
                    <span className="text-xs text-amber-500 font-semibold">Incompleto</span>
                  )}
                </div>
              </div>
            </div>

            {/* Personal info */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Información Personal</p>
              <div className="grid grid-cols-2 gap-2">
                {field('Teléfono', userData?.phone)}
                {field('País', userData?.country)}
                {field('Ciudad', userData?.city)}
                {field('Dirección', userData?.address)}
                {field('Fecha de nacimiento', userData?.date_of_birth)}
                {field('Ocupación', userData?.occupation)}
                {field('Empresa', userData?.company)}
                {field('LinkedIn', userData?.linkedin_url)}
                {field('Sitio web', userData?.website_url)}
              </div>
              {userData?.bio && (
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 mt-2">
                  <p className="text-[10px] text-gray-400 mb-0.5">Bio</p>
                  <p className="text-sm text-gray-700 dark:text-white/70">{userData.bio}</p>
                </div>
              )}
              <p className="text-[10px] text-gray-400 mt-2">
                Registrado: {userData?.created_at ? new Date(userData.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
              </p>
            </div>

            {/* Advisor professional info */}
            {advisorData && (
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Información Profesional</p>
                <div className="grid grid-cols-2 gap-2">
                  {field('Título', advisorData.title)}
                  {field('Especialidad', advisorData.category)}
                  {field('Experiencia', advisorData.experience)}
                  {field('Tarifa por sesión', advisorData.hourly_rate ? `$${advisorData.hourly_rate} USD` : undefined)}
                  {field('Estado verificación', advisorData.verification_status)}
                  {field('Educación', advisorData.education_level)}
                  {field('Universidad', advisorData.university)}
                </div>
                <div className="flex items-center gap-3 mt-2">
                  {advisorData.verified && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-500"><ShieldCheck size={13} /> Verificado</span>
                  )}
                  <span className={`text-xs font-semibold ${advisorData.available ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {advisorData.available ? '● Disponible' : '○ No disponible'}
                  </span>
                </div>
              </div>
            )}

            {/* Payment data — gated behind consent click */}
            {advisorData && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Datos de Pago</p>
                  {!showPayment && (
                    <button onClick={() => setShowPayment(true)}
                      className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-500/30 px-3 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all">
                      <Lock size={11} /> Ver datos confidenciales
                    </button>
                  )}
                </div>

                {!showPayment ? (
                  <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                    <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Los datos de pago son confidenciales. Haz clic en "Ver datos confidenciales" para revelarlos. Solo accede si es estrictamente necesario.
                    </p>
                  </div>
                ) : payoutData ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {field('Método de pago', payoutData.payout_method)}
                      {payoutData.payout_method === 'bank_transfer' && (
                        <>
                          {field('Banco', payoutData.bank_name)}
                          {field('Titular', payoutData.bank_account_holder)}
                          {field('País banco', payoutData.bank_country)}
                          {field('Moneda', payoutData.bank_currency)}
                          {field('Tipo de cuenta', payoutData.bank_account_type)}
                          {field('Número (enmascarado)', payoutData.bank_account_last4 ? maskAccount(payoutData.bank_account_last4) : undefined)}
                        </>
                      )}
                      {payoutData.payout_method === 'paypal' && field('Email PayPal', payoutData.paypal_email)}
                      {payoutData.payout_method === 'zelle' && (
                        <>
                          {field('Email Zelle', payoutData.zelle_email)}
                          {field('Teléfono Zelle', payoutData.zelle_phone)}
                        </>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Los números de cuenta completos no se almacenan en texto plano.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 py-2">Este asesor aún no ha configurado sus datos de pago.</p>
                )}
              </div>
            )}
          </div>
        )}
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
  const [tabLoading, setTabLoading] = useState(false);

  const switchTab = (id: string) => {
    if (id === activeTab) return;
    setTabLoading(true);
    setTimeout(() => { setActiveTab(id); setTabLoading(false); }, 280);
  };
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

  // User detail
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Team
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', team_role: 'empleado', notes: '' });
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Support
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketMessages, setTicketMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [ticketFilter, setTicketFilter] = useState('abierto');

  // ── LOAD DATA ───────────────────────────────────────────────
  useEffect(() => {
    loadAll();

    // Real-time: reload team members on any change
    const teamChannel = supabase
      .channel('admin_team_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
        loadTeamMembers();
      })
      .subscribe();

    // Real-time: reload support tickets on new activity
    const ticketsChannel = supabase
      .channel('admin_tickets_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => {
        loadTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(teamChannel);
      supabase.removeChannel(ticketsChannel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      loadTeamMembers(),
      loadTickets(),
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
      .select('*, profiles!advisor_verification_user_id_fkey(full_name, email, avatar_url)')
      .order('submitted_at', { ascending: false });
    setVerifications(data || []);
  };

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*, advisors(verified, verification_status, rating, available)')
      .order('created_at', { ascending: false });
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

  const loadTeamMembers = async () => {
    const { data } = await supabase
      .from('team_members')
      .select('*, profiles(full_name, email, avatar_url, role)')
      .order('created_at', { ascending: false });
    setTeamMembers(data || []);
  };

  const loadTickets = async () => {
    const { data } = await supabase
      .from('support_tickets')
      .select('*, profiles!support_tickets_user_id_fkey(full_name, email, avatar_url, role), assigned:profiles!support_tickets_assigned_to_fkey(full_name)')
      .order('created_at', { ascending: false });
    setTickets(data || []);
  };

  const loadTicketMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*, profiles(full_name, avatar_url)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    setTicketMessages(data || []);
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

  // ── TEAM PERMISSIONS PRESET ─────────────────────────────────
  const ROLE_PRESETS: Record<string, Record<string, boolean>> = {
    admin: { ver_usuarios: true, editar_usuarios: true, ver_verificaciones: true, aprobar_verificaciones: true, ver_pagos: true, gestionar_pagos: true, ver_sesiones: true, gestionar_sesiones: true, ver_reportes: true, configurar_plataforma: true, gestionar_equipo: true, ver_soporte: true, responder_soporte: true },
    supervisor: { ver_usuarios: true, editar_usuarios: false, ver_verificaciones: true, aprobar_verificaciones: true, ver_pagos: true, gestionar_pagos: false, ver_sesiones: true, gestionar_sesiones: false, ver_reportes: true, configurar_plataforma: false, gestionar_equipo: false, ver_soporte: true, responder_soporte: true },
    operador: { ver_usuarios: true, editar_usuarios: true, ver_verificaciones: false, aprobar_verificaciones: false, ver_pagos: false, gestionar_pagos: false, ver_sesiones: true, gestionar_sesiones: true, ver_reportes: false, configurar_plataforma: false, gestionar_equipo: false, ver_soporte: true, responder_soporte: false },
    soporte: { ver_usuarios: true, editar_usuarios: false, ver_verificaciones: false, aprobar_verificaciones: false, ver_pagos: false, gestionar_pagos: false, ver_sesiones: false, gestionar_sesiones: false, ver_reportes: false, configurar_plataforma: false, gestionar_equipo: false, ver_soporte: true, responder_soporte: true },
    empleado: { ver_usuarios: false, editar_usuarios: false, ver_verificaciones: false, aprobar_verificaciones: false, ver_pagos: false, gestionar_pagos: false, ver_sesiones: true, gestionar_sesiones: false, ver_reportes: false, configurar_plataforma: false, gestionar_equipo: false, ver_soporte: false, responder_soporte: false },
  };

  const handleInviteTeamMember = async () => {
    setInviting(true);
    setInviteError('');
    // Find user by email
    const { data: found } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', inviteForm.email.trim())
      .maybeSingle();
    if (!found) {
      setInviteError('No se encontró un usuario con ese email. Debe registrarse primero.');
      setInviting(false);
      return;
    }
    const { error } = await supabase.from('team_members').insert({
      user_id: found.id,
      team_role: inviteForm.team_role,
      permissions: ROLE_PRESETS[inviteForm.team_role] || ROLE_PRESETS['empleado'],
      notes: inviteForm.notes || null,
      invited_by: profile?.id,
    });
    if (error) {
      setInviteError('Error al agregar miembro. ¿Ya es parte del equipo?');
    } else {
      setShowInviteModal(false);
      setInviteForm({ email: '', team_role: 'empleado', notes: '' });
      loadTeamMembers();
    }
    setInviting(false);
  };

  const handleToggleTeamMember = async (memberId: string, current: boolean) => {
    await supabase.from('team_members').update({ is_active: !current }).eq('id', memberId);
    loadTeamMembers();
  };

  const handleUpdateTeamRole = async (memberId: string, newRole: string) => {
    await supabase.from('team_members').update({
      team_role: newRole,
      permissions: ROLE_PRESETS[newRole] || ROLE_PRESETS['empleado'],
    }).eq('id', memberId);
    loadTeamMembers();
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    await supabase.from('team_members').delete().eq('id', memberId);
    loadTeamMembers();
  };

  // ── SUPPORT HANDLERS ─────────────────────────────────────────
  const handleSelectTicket = async (ticket: any) => {
    setSelectedTicket(ticket);
    await loadTicketMessages(ticket.id);
    // Mark as en_revision if still abierto
    if (ticket.status === 'abierto') {
      await supabase.from('support_tickets').update({ status: 'en_revision', assigned_to: profile?.id }).eq('id', ticket.id);
      loadTickets();
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;
    setSendingReply(true);
    await supabase.from('support_messages').insert({
      ticket_id: selectedTicket.id,
      sender_id: profile?.id,
      is_staff: true,
      body: replyText.trim(),
    });
    await supabase.from('support_tickets').update({ status: 'respondido', updated_at: new Date().toISOString() }).eq('id', selectedTicket.id);
    setReplyText('');
    await loadTicketMessages(selectedTicket.id);
    loadTickets();
    setSendingReply(false);
  };

  const handleCloseTicket = async (ticketId: string) => {
    await supabase.from('support_tickets').update({ status: 'cerrado', closed_at: new Date().toISOString() }).eq('id', ticketId);
    setSelectedTicket(null);
    loadTickets();
  };

  const filteredUsers = users.filter(u => {
    const q = searchUser.toLowerCase();
    const matchQ = !q || u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    const matchR = filterRole === 'all' || u.role === filterRole;
    return matchQ && matchR;
  });

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
    { id: 'verifications', label: 'Verificaciones', icon: ShieldCheck, badge: stats.pendingVerifications },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'sessions', label: 'Sesiones', icon: Calendar },
    { id: 'payouts', label: 'Pagos', icon: Banknote },
    { id: 'team', label: 'Equipo', icon: UserPlus },
    { id: 'support', label: 'Soporte', icon: Headphones, badge: tickets.filter(t => t.status === 'abierto').length || undefined },
    { id: 'settings', label: 'Configuración', icon: Settings },
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
      <aside className="w-60 shrink-0 h-screen sticky top-0 overflow-y-auto bg-white dark:bg-white/[0.03] border-r border-gray-100 dark:border-white/10 flex flex-col">
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
              onClick={() => switchTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
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

        <div className="p-8 relative">

          {/* Tab switching spinner */}
          {tabLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-[#0A0E27]/60 backdrop-blur-sm rounded-xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <Loader2 size={20} className="text-emerald-500 animate-spin" />
                </div>
              </div>
            </div>
          )}

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
                      onClick={() => { }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${s === 'all' ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/20'
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
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${filterRole === r ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/20'
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
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all cursor-pointer" onClick={() => setSelectedUser(u.id)}>
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
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${u.role === 'asesor'
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
                          <div className="flex flex-col gap-1">
                            {u.full_name ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" /> Incompleto
                              </span>
                            )}
                            {u.role === 'asesor' && u.advisors?.verified && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 w-fit">
                                <ShieldCheck size={10} /> Verificado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <button onClick={e => { e.stopPropagation(); toggleAdmin(u.id, u.is_admin); }}
                            className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${u.is_admin
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

          {/* ══ TEAM ══════════════════════════════════════════ */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Gestión del Equipo</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Administra los miembros internos y sus permisos</p>
                </div>
                <button onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-all">
                  <UserPlus size={14} /> Agregar miembro
                </button>
              </div>

              {/* Role legend */}
              <div className="grid grid-cols-5 gap-3">
                {[
                  { role: 'admin', label: 'Admin', desc: 'Acceso total', color: 'bg-violet-500/20 text-violet-400' },
                  { role: 'supervisor', label: 'Supervisor', desc: 'Aprueba, revisa', color: 'bg-blue-500/20 text-blue-400' },
                  { role: 'operador', label: 'Operador', desc: 'Gestiona sesiones', color: 'bg-teal-500/20 text-teal-400' },
                  { role: 'soporte', label: 'Soporte', desc: 'Tickets de ayuda', color: 'bg-amber-500/20 text-amber-400' },
                  { role: 'empleado', label: 'Empleado', desc: 'Solo lectura', color: 'bg-gray-200/50 text-gray-500 dark:bg-white/10 dark:text-white/40' },
                ].map(r => (
                  <div key={r.role} className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-xl p-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold ${r.color} mb-1`}>{r.label}</span>
                    <p className="text-[10px] text-gray-400">{r.desc}</p>
                  </div>
                ))}
              </div>

              {/* Team members table */}
              <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/10">
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-4">Miembro</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Rol</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Permisos clave</th>
                      <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-4 py-4">Estado</th>
                      <th className="px-4 py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                    {teamMembers.map(m => {
                      const perms: Record<string, boolean> = m.permissions || {};
                      const activePerms = Object.entries(perms).filter(([, v]) => v).map(([k]) => k.replace(/_/g, ' '));
                      return (
                        <tr key={m.id} className={`hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all ${!m.is_active ? 'opacity-50' : ''}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-sm font-bold text-emerald-500">
                                {m.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.profiles?.full_name || '—'}</p>
                                <p className="text-xs text-gray-400">{m.profiles?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={m.team_role}
                              onChange={e => handleUpdateTeamRole(m.id, e.target.value)}
                              className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                            >
                              {['admin','supervisor','operador','soporte','empleado'].map(r => (
                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {activePerms.slice(0, 3).map(p => (
                                <span key={p} className="text-[9px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">{p}</span>
                              ))}
                              {activePerms.length > 3 && (
                                <span className="text-[9px] text-gray-400">+{activePerms.length - 3} más</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <button onClick={() => handleToggleTeamMember(m.id, m.is_active)}
                              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${m.is_active ? 'text-emerald-500 hover:text-emerald-600' : 'text-gray-400 hover:text-gray-600'}`}>
                              {m.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                              {m.is_active ? 'Activo' : 'Inactivo'}
                            </button>
                          </td>
                          <td className="px-4 py-4">
                            <button onClick={() => handleRemoveTeamMember(m.id)}
                              className="text-xs text-red-400 hover:text-red-500 transition-colors">
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {teamMembers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-12 text-sm text-gray-400">
                          Aún no hay miembros en el equipo
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Activity log note */}
              <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4">
                <FileText size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Registro de actividad</p>
                  <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">
                    Todas las acciones del equipo quedan registradas en <code className="font-mono bg-blue-100 dark:bg-blue-500/20 px-1 rounded">admin_activity_log</code>. Solo tú como administrador puedes consultar el historial completo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══ SUPPORT ════════════════════════════════════════ */}
          {activeTab === 'support' && (
            <div className="flex gap-6 h-[calc(100vh-160px)]">
              {/* Ticket list */}
              <div className="w-80 shrink-0 flex flex-col gap-3">
                <div className="flex gap-2">
                  {['abierto','en_revision','respondido','cerrado'].map(s => (
                    <button key={s} onClick={() => setTicketFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${ticketFilter === s ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/40 hover:border-gray-300'}`}>
                      {s === 'abierto' ? 'Abiertos' : s === 'en_revision' ? 'En revisión' : s === 'respondido' ? 'Respondidos' : 'Cerrados'}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {tickets.filter(t => t.status === ticketFilter).map(t => (
                    <button key={t.id} onClick={() => handleSelectTicket(t)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${selectedTicket?.id === t.id
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-white dark:bg-white/[0.03] border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20'}`}>
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-500 shrink-0 mt-0.5">
                          {t.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{t.subject}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{t.profiles?.full_name} · {t.profiles?.role}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              t.priority === 'urgente' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' :
                              t.priority === 'alta' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                              'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-white/40'
                            }`}>{t.priority}</span>
                            <span className="text-[9px] text-gray-400">{t.category}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  {tickets.filter(t => t.status === ticketFilter).length === 0 && (
                    <div className="text-center py-8">
                      <Inbox size={28} className="text-gray-200 dark:text-white/10 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Sin tickets</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Conversation panel */}
              <div className="flex-1 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden">
                {selectedTicket ? (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedTicket.subject}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {selectedTicket.profiles?.full_name} · {selectedTicket.profiles?.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={selectedTicket.status} />
                        {selectedTicket.status !== 'cerrado' && (
                          <button onClick={() => handleCloseTicket(selectedTicket.id)}
                            className="text-xs text-gray-400 hover:text-red-400 border border-gray-200 dark:border-white/10 px-3 py-1.5 rounded-lg transition-all">
                            Cerrar ticket
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {ticketMessages.map(msg => (
                        <div key={msg.id} className={`flex gap-3 ${msg.is_staff ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${msg.is_staff ? 'bg-emerald-500/20 text-emerald-500' : 'bg-blue-500/20 text-blue-500'}`}>
                            {msg.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div className={`max-w-sm ${msg.is_staff ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            <p className="text-[10px] text-gray-400">
                              {msg.profiles?.full_name} · {new Date(msg.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <div className={`px-4 py-3 rounded-2xl text-sm ${msg.is_staff
                              ? 'bg-emerald-500 text-white rounded-tr-sm'
                              : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white rounded-tl-sm'}`}>
                              {msg.body}
                            </div>
                          </div>
                        </div>
                      ))}
                      {ticketMessages.length === 0 && (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-xs text-gray-400">Sin mensajes aún</p>
                        </div>
                      )}
                    </div>

                    {/* Reply box */}
                    {selectedTicket.status !== 'cerrado' && (
                      <div className="p-4 border-t border-gray-100 dark:border-white/10 flex gap-3">
                        <input
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                          placeholder="Escribe una respuesta..."
                          className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                        />
                        <button onClick={handleSendReply} disabled={!replyText.trim() || sendingReply}
                          className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-all disabled:opacity-40">
                          {sendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3">
                    <Headphones size={36} className="text-gray-200 dark:text-white/10" />
                    <p className="text-sm text-gray-400">Selecciona un ticket para ver la conversación</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ SETTINGS ═══════════════════════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-2xl mx-auto">
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

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailModal userId={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      {/* Invite Team Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0f1629] border border-gray-200 dark:border-white/10 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/10">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Agregar miembro al equipo</h2>
              <button onClick={() => { setShowInviteModal(false); setInviteError(''); }}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition-all">
                <X size={15} className="text-gray-500 dark:text-white/60" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1.5">
                  Email del usuario *
                </label>
                <input
                  value={inviteForm.email}
                  onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="correo@ejemplo.com"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-gray-400 mt-1">El usuario debe tener una cuenta registrada en la plataforma.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1.5">Rol interno</label>
                <select
                  value={inviteForm.team_role}
                  onChange={e => setInviteForm(p => ({ ...p, team_role: e.target.value }))}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
                >
                  {['admin','supervisor','operador','soporte','empleado'].map(r => (
                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-white/50 mb-1.5">Notas (opcional)</label>
                <textarea
                  value={inviteForm.notes}
                  onChange={e => setInviteForm(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  placeholder="Cargo, área de trabajo..."
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
              {inviteError && (
                <p className="text-xs text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3">
                  {inviteError}
                </p>
              )}
              <button onClick={handleInviteTeamMember} disabled={!inviteForm.email.trim() || inviting}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-3 rounded-xl text-sm hover:bg-emerald-600 transition-all disabled:opacity-60">
                {inviting ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />}
                Agregar al equipo
              </button>
            </div>
          </div>
        </div>
      )}

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
