import React, { useState, useEffect } from 'react';
import {
  Banknote, CreditCard, Smartphone, CheckCircle, Loader2,
  AlertCircle, DollarSign, Percent, Info, Save, Eye, EyeOff,
  Building, Hash, User, Mail, Phone, Globe
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  userId: string;
  advisorId: string;
  isDark: boolean;
}

const PAYOUT_METHODS = [
  { id: 'bank_transfer', label: 'Transferencia Bancaria', icon: Building, desc: 'Cuenta bancaria local o internacional' },
  { id: 'paypal', label: 'PayPal', icon: Globe, desc: 'Recibe pagos en tu cuenta PayPal' },
  { id: 'zelle', label: 'Zelle', icon: Smartphone, desc: 'Solo disponible para cuentas en EE.UU.' },
];

interface PayoutForm {
  payout_method: string;
  bank_name: string;
  bank_account_holder: string;
  bank_routing_number: string;
  bank_account_number: string;
  bank_account_type: string;
  bank_country: string;
  bank_currency: string;
  paypal_email: string;
  zelle_email: string;
  zelle_phone: string;
}

export default function AdvisorPayoutSetup({ userId, advisorId, isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [commissionRate, setCommissionRate] = useState(20);

  const [form, setForm] = useState<PayoutForm>({
    payout_method: 'bank_transfer',
    bank_name: '',
    bank_account_holder: '',
    bank_routing_number: '',
    bank_account_number: '',
    bank_account_type: 'checking',
    bank_country: 'VE',
    bank_currency: 'USD',
    paypal_email: '',
    zelle_email: '',
    zelle_phone: '',
  });

  const [hourlyRate, setHourlyRate] = useState('');
  const [advisorRate, setAdvisorRate] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    const [{ data: payoutData }, { data: advisorData }, { data: settings }] = await Promise.all([
      supabase.from('advisor_payout_info').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('advisors').select('hourly_rate, commission_rate').eq('id', advisorId).maybeSingle(),
      supabase.from('platform_settings').select('value').eq('key', 'commission_rate').maybeSingle(),
    ]);

    if (payoutData) {
      setForm({
        payout_method: payoutData.payout_method || 'bank_transfer',
        bank_name: payoutData.bank_name || '',
        bank_account_holder: payoutData.bank_account_holder || '',
        bank_routing_number: payoutData.bank_routing_number || '',
        bank_account_number: payoutData.bank_account_number || '',
        bank_account_type: payoutData.bank_account_type || 'checking',
        bank_country: payoutData.bank_country || 'VE',
        bank_currency: payoutData.bank_currency || 'USD',
        paypal_email: payoutData.paypal_email || '',
        zelle_email: payoutData.zelle_email || '',
        zelle_phone: payoutData.zelle_phone || '',
      });
    }

    if (advisorData) {
      setAdvisorRate(advisorData);
      setHourlyRate(String(advisorData.hourly_rate || ''));
    }
    if (settings) setCommissionRate(Number(settings.value) || 20);
    setLoading(false);
  };

  const setField = (k: keyof PayoutForm, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const last4 = form.bank_account_number.slice(-4);

    await Promise.all([
      supabase.from('advisor_payout_info').upsert({
        advisor_id: advisorId,
        user_id: userId,
        ...form,
        bank_account_last4: last4,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'advisor_id' }),
      supabase.from('advisors').update({
        hourly_rate: hourlyRate ? Number(hourlyRate) : 0,
        payout_configured: true,
      }).eq('id', advisorId),
    ]);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const netRate = hourlyRate ? (Number(hourlyRate) * (1 - commissionRate / 100)).toFixed(2) : null;
  const commission = hourlyRate ? (Number(hourlyRate) * (commissionRate / 100)).toFixed(2) : null;

  const card = `bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl`;
  const input = `w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'} placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors`;
  const lbl = `block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`;

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={22} className="text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Datos de Cobro
        </h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          Configura cómo recibirás tus pagos por cada sesión completada en Axioma.
        </p>
      </div>

      {/* ── TARIFA ESTÁNDAR ─────────────────────────────────── */}
      <div className={`${card} p-6`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          Tu Tarifa Estándar
        </p>

        <div className="flex items-start gap-4">
          <div className="flex-1">
            <label className={lbl}>Tarifa por sesión (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">$</span>
              <input
                type="number"
                className={`${input} pl-7`}
                value={hourlyRate}
                onChange={e => setHourlyRate(e.target.value)}
                placeholder="0.00"
                min="0"
                step="1"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              Esta es la tarifa base que los clientes ven. El precio final del plan la incluye.
            </p>
          </div>

          {hourlyRate && Number(hourlyRate) > 0 && (
            <div className={`shrink-0 rounded-xl p-4 min-w-[160px] ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Distribución</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Tarifa bruta</span>
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>${hourlyRate}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-400">Comisión ({commissionRate}%)</span>
                  <span className="font-semibold text-red-400">-${commission}</span>
                </div>
                <div className={`flex justify-between text-xs pt-1.5 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <span className="text-emerald-500 font-bold">Tú recibes</span>
                  <span className="font-black text-emerald-500">${netRate}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Commission info */}
        <div className={`flex items-start gap-3 mt-4 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-blue-50'}`}>
          <Info size={14} className="text-blue-400 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-400/80 leading-relaxed">
            Axioma retiene el <strong>{commissionRate}%</strong> de comisión por el uso de la plataforma,
            procesamiento de pagos y gestión de clientes. El <strong>{100 - commissionRate}%</strong> restante
            se te transfiere mensualmente.
          </p>
        </div>
      </div>

      {/* ── MÉTODO DE PAGO ──────────────────────────────────── */}
      <div className={`${card} p-6`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          Método de Pago
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {PAYOUT_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setField('payout_method', m.id)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                form.payout_method === m.id
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : isDark ? 'border-white/10 hover:border-white/20' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <m.icon size={20} className={form.payout_method === m.id ? 'text-emerald-500' : 'text-gray-400'} />
              <p className={`text-xs font-bold ${form.payout_method === m.id ? 'text-emerald-500' : isDark ? 'text-white/70' : 'text-gray-700'}`}>
                {m.label}
              </p>
              <p className="text-[9px] text-gray-400 leading-relaxed">{m.desc}</p>
            </button>
          ))}
        </div>

        {/* ── Bank transfer fields ── */}
        {form.payout_method === 'bank_transfer' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Nombre del banco *</label>
                <input className={input} value={form.bank_name} onChange={e => setField('bank_name', e.target.value)}
                  placeholder="Banco Nacional de..." />
              </div>
              <div>
                <label className={lbl}>Tipo de cuenta</label>
                <select className={input} value={form.bank_account_type} onChange={e => setField('bank_account_type', e.target.value)}>
                  <option value="checking">Corriente / Checking</option>
                  <option value="savings">Ahorros / Savings</option>
                </select>
              </div>
            </div>

            <div>
              <label className={lbl}>Titular de la cuenta *</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className={`${input} pl-9`} value={form.bank_account_holder}
                  onChange={e => setField('bank_account_holder', e.target.value)}
                  placeholder="Nombre completo del titular" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Número de ruta / SWIFT</label>
                <input className={input} value={form.bank_routing_number}
                  onChange={e => setField('bank_routing_number', e.target.value)}
                  placeholder="021000021" />
              </div>
              <div>
                <label className={lbl}>Número de cuenta *</label>
                <div className="relative">
                  <input
                    className={`${input} pr-10`}
                    value={showAccount ? form.bank_account_number : form.bank_account_number.replace(/.(?=.{4})/g, '•')}
                    onChange={e => setField('bank_account_number', e.target.value)}
                    placeholder="••••••••••••4242"
                    type={showAccount ? 'text' : 'password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccount(!showAccount)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showAccount ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>País del banco</label>
                <select className={input} value={form.bank_country} onChange={e => setField('bank_country', e.target.value)}>
                  <option value="VE">Venezuela</option>
                  <option value="US">Estados Unidos</option>
                  <option value="MX">México</option>
                  <option value="CO">Colombia</option>
                  <option value="AR">Argentina</option>
                  <option value="ES">España</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Moneda de pago</label>
                <select className={input} value={form.bank_currency} onChange={e => setField('bank_currency', e.target.value)}>
                  <option value="USD">USD — Dólar americano</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="VES">VES — Bolívar</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── PayPal fields ── */}
        {form.payout_method === 'paypal' && (
          <div>
            <label className={lbl}>Correo de tu cuenta PayPal *</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} type="email" value={form.paypal_email}
                onChange={e => setField('paypal_email', e.target.value)}
                placeholder="tu@paypal.com" />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Asegúrate de que la cuenta PayPal esté verificada y acepte pagos internacionales.
            </p>
          </div>
        )}

        {/* ── Zelle fields ── */}
        {form.payout_method === 'zelle' && (
          <div className="space-y-4">
            <div className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'} border ${isDark ? 'border-amber-500/20' : 'border-amber-100'}`}>
              <AlertCircle size={14} className="text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-500">Zelle solo está disponible para cuentas bancarias en los Estados Unidos.</p>
            </div>
            <div>
              <label className={lbl}>Email de Zelle</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className={`${input} pl-9`} type="email" value={form.zelle_email}
                  onChange={e => setField('zelle_email', e.target.value)}
                  placeholder="email@zelle.com" />
              </div>
            </div>
            <div>
              <label className={lbl}>Teléfono de Zelle</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input className={`${input} pl-9`} value={form.zelle_phone}
                  onChange={e => setField('zelle_phone', e.target.value)}
                  placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── PAYOUT SCHEDULE INFO ─────────────────────────────── */}
      <div className={`${card} p-5`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          Calendario de Pagos
        </p>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '📅', label: 'Frecuencia', value: 'Mensual' },
            { icon: '📆', label: 'Día de pago', value: 'Día 5 de cada mes' },
            { icon: '💵', label: 'Mínimo acumulado', value: '$50 USD' },
          ].map(({ icon, label, value }) => (
            <div key={label} className={`rounded-xl p-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className="text-lg mb-1">{icon}</p>
              <p className={`text-xs font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
          Los pagos se procesan automáticamente el día 5 de cada mes para todas las sesiones completadas del mes anterior.
          Si el monto no alcanza el mínimo de $50 USD, se acumula para el siguiente período.
        </p>
      </div>

      {/* Save button */}
      <div className="flex items-center justify-between">
        {saved && (
          <div className="flex items-center gap-2 text-sm text-emerald-500">
            <CheckCircle size={15} /> Datos guardados correctamente
          </div>
        )}
        {!saved && <div />}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Guardar configuración
        </button>
      </div>
    </div>
  );
}
