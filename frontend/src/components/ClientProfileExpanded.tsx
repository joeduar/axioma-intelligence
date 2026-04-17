import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Globe, Calendar, Briefcase,
  Building, Linkedin, CheckCircle, Loader2, Save, Camera,
  AlertCircle, Hash
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AvatarUpload from './AvatarUpload';

interface Props {
  userId: string;
  isDark: boolean;
  onProfileUpdated?: () => void;
}

const TIMEZONES = [
  'America/Caracas', 'America/Bogota', 'America/Lima', 'America/Mexico_City',
  'America/Argentina/Buenos_Aires', 'America/Santiago', 'America/New_York',
  'Europe/Madrid', 'America/Los_Angeles',
];

const COUNTRIES = [
  'Venezuela', 'Colombia', 'México', 'Argentina', 'Chile', 'Perú',
  'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay', 'Costa Rica', 'Panamá',
  'España', 'Estados Unidos', 'Otro',
];

export default function ClientProfileExpanded({ userId, isDark, onProfileUpdated }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    date_of_birth: '',
    occupation: '',
    company: '',
    bio: '',
    linkedin_url: '',
    website_url: '',
    timezone: 'America/Caracas',
    language_pref: 'es',
  });

  useEffect(() => { loadProfile(); }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setForm({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        country: data.country || '',
        city: data.city || '',
        address: data.address || '',
        date_of_birth: data.date_of_birth || '',
        occupation: data.occupation || '',
        company: data.company || '',
        bio: data.bio || '',
        linkedin_url: data.linkedin_url || '',
        website_url: data.website_url || '',
        timezone: data.timezone || 'America/Caracas',
        language_pref: data.language_pref || 'es',
      });
      setAvatarUrl(data.avatar_url);
    }
    setLoading(false);
  };

  const setField = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const completionFields = [
    'full_name', 'phone', 'country', 'city', 'date_of_birth', 'occupation', 'bio',
  ];
  const filled = completionFields.filter(f => (form as any)[f]?.trim?.()).length;
  const completion = Math.round((filled / completionFields.length) * 100);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        ...form,
        profile_completed_at: completion === 100 ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onProfileUpdated?.();
    }
  };

  const card = `bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl`;
  const input = `w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'} placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors`;
  const lbl = `block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`;

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={22} className="text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Mi Perfil</h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          Mantén tu información actualizada para una mejor experiencia en la plataforma.
        </p>
      </div>

      {/* Completion bar */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Perfil completado
          </p>
          <p className={`text-xs font-black ${completion === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {completion}%
          </p>
        </div>
        <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
          <div
            className={`h-full rounded-full transition-all duration-700 ${completion === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${completion}%` }}
          />
        </div>
        {completion < 100 && (
          <p className="text-[10px] text-gray-400 mt-2">
            Completa tu perfil para mayor credibilidad ante los asesores.
          </p>
        )}
      </div>

      {/* Avatar */}
      <div className={`${card} p-6`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          Foto de Perfil
        </p>
        <AvatarUpload
          currentUrl={avatarUrl}
          onUploadComplete={(url: string) => setAvatarUrl(url)}
        />
      </div>

      {/* Personal info */}
      <div className={`${card} p-6 space-y-4`}>
        <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          Información Personal
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Nombre completo *</label>
            <input className={input} value={form.full_name} onChange={e => setField('full_name', e.target.value)}
              placeholder="Tu nombre completo" />
          </div>
          <div>
            <label className={lbl}>Correo electrónico</label>
            <input className={`${input} opacity-60 cursor-not-allowed`} value={form.email} readOnly
              placeholder="email@ejemplo.com" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Teléfono</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={form.phone} onChange={e => setField('phone', e.target.value)}
                placeholder="+58 412 000 0000" />
            </div>
          </div>
          <div>
            <label className={lbl}>Fecha de nacimiento</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" className={`${input} pl-9`} value={form.date_of_birth} onChange={e => setField('date_of_birth', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>País</label>
            <select className={input} value={form.country} onChange={e => setField('country', e.target.value)}>
              <option value="">Seleccionar país</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Ciudad</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={form.city} onChange={e => setField('city', e.target.value)}
                placeholder="Tu ciudad" />
            </div>
          </div>
        </div>

        <div>
          <label className={lbl}>Dirección</label>
          <input className={input} value={form.address} onChange={e => setField('address', e.target.value)}
            placeholder="Calle, número, sector..." />
        </div>
      </div>

      {/* Professional info */}
      <div className={`${card} p-6 space-y-4`}>
        <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          Información Profesional
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Ocupación / Cargo</label>
            <div className="relative">
              <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={form.occupation} onChange={e => setField('occupation', e.target.value)}
                placeholder="Ej: Emprendedor, Gerente..." />
            </div>
          </div>
          <div>
            <label className={lbl}>Empresa / Organización</label>
            <div className="relative">
              <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={form.company} onChange={e => setField('company', e.target.value)}
                placeholder="Nombre de tu empresa" />
            </div>
          </div>
        </div>

        <div>
          <label className={lbl}>Bio / Descripción breve</label>
          <textarea
            className={`${input} resize-none`}
            rows={3}
            value={form.bio}
            onChange={e => setField('bio', e.target.value)}
            placeholder="Cuéntanos un poco sobre ti, tus metas y en qué área buscas asesoría..."
          />
          <p className="text-[10px] text-gray-400 mt-1">{form.bio.length}/300 caracteres</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>LinkedIn</label>
            <div className="relative">
              <Linkedin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={form.linkedin_url} onChange={e => setField('linkedin_url', e.target.value)}
                placeholder="linkedin.com/in/tu-perfil" />
            </div>
          </div>
          <div>
            <label className={lbl}>Sitio web</label>
            <div className="relative">
              <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={form.website_url} onChange={e => setField('website_url', e.target.value)}
                placeholder="tu-sitio.com" />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className={`${card} p-6 space-y-4`}>
        <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          Preferencias
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Zona horaria</label>
            <select className={input} value={form.timezone} onChange={e => setField('timezone', e.target.value)}>
              {TIMEZONES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Idioma preferido</label>
            <select className={input} value={form.language_pref} onChange={e => setField('language_pref', e.target.value)}>
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        {saved && (
          <div className="flex items-center gap-2 text-sm text-emerald-500">
            <CheckCircle size={15} /> Perfil actualizado correctamente
          </div>
        )}
        {!saved && <div />}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
