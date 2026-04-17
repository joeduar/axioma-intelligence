import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Globe, Calendar, Briefcase,
  Building, Linkedin, CheckCircle, Loader2, Save,
  AlertCircle, Star, DollarSign, Languages, Tag, Plus, X,
  Shield, MailCheck
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

const CATEGORIES = [
  'Finanzas', 'Negocios', 'Datos & IA', 'Legal', 'Marketing',
  'Tecnología', 'Recursos Humanos', 'Startups', 'Inversiones',
  'Contabilidad', 'Consultoría', 'Coaching', 'Otro',
];

const LANGUAGES_LIST = ['Español', 'Inglés', 'Portugués', 'Francés', 'Alemán', 'Italiano'];

export default function AdvisorProfileFull({ userId, isDark, onProfileUpdated }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [advisorId, setAdvisorId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Email change
  const [newEmail, setNewEmail] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  // Profile fields
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    date_of_birth: '',
    bio: '',
    linkedin_url: '',
    website_url: '',
    timezone: 'America/Caracas',
    language_pref: 'es',
    occupation: '',
    company: '',
  });

  // Advisor fields
  const [advisor, setAdvisor] = useState({
    title: '',
    category: '',
    experience: '',
    bio: '',
    hourly_rate: '',
    available: true,
    specializations: [] as string[],
    education_level: '',
    university: '',
    graduation_year: '',
  });

  const [languages, setLanguages] = useState<string[]>([]);
  const [specializationInput, setSpecializationInput] = useState('');

  useEffect(() => { loadAll(); }, [userId]);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: prof }, { data: adv }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('advisors').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    if (prof) {
      setProfile({
        full_name: prof.full_name || '',
        email: prof.email || '',
        phone: prof.phone || '',
        country: prof.country || '',
        city: prof.city || '',
        address: prof.address || '',
        date_of_birth: prof.date_of_birth || '',
        bio: prof.bio || '',
        linkedin_url: prof.linkedin_url || '',
        website_url: prof.website_url || '',
        timezone: prof.timezone || 'America/Caracas',
        language_pref: prof.language_pref || 'es',
        occupation: prof.occupation || '',
        company: prof.company || '',
      });
      setAvatarUrl(prof.avatar_url || null);
    }

    if (adv) {
      setAdvisorId(adv.id);
      setAdvisor({
        title: adv.title || '',
        category: adv.category || '',
        experience: adv.experience || '',
        bio: adv.bio || '',
        hourly_rate: adv.hourly_rate?.toString() || '',
        available: adv.available ?? true,
        specializations: adv.specializations || [],
        education_level: adv.education_level || '',
        university: adv.university || '',
        graduation_year: adv.graduation_year?.toString() || '',
      });
      const langs = adv.languages
        ? (typeof adv.languages === 'string' ? adv.languages.split(',').map((l: string) => l.trim()) : adv.languages)
        : [];
      setLanguages(langs);
    }
    setLoading(false);
  };

  const setProfileField = (k: string, v: any) => setProfile(p => ({ ...p, [k]: v }));
  const setAdvisorField = (k: string, v: any) => setAdvisor(p => ({ ...p, [k]: v }));

  // Completion
  const completionFields = [
    profile.full_name, profile.phone, profile.country, profile.city,
    advisor.title, advisor.category, advisor.bio, advisor.experience,
  ];
  const filled = completionFields.filter(Boolean).length;
  const completion = Math.round((filled / completionFields.length) * 100);

  const handleSave = async () => {
    setSaving(true);
    const [{ error: e1 }, { error: e2 }] = await Promise.all([
      supabase.from('profiles').update({
        full_name: profile.full_name,
        phone: profile.phone,
        country: profile.country,
        city: profile.city,
        address: profile.address,
        date_of_birth: profile.date_of_birth || null,
        bio: profile.bio,
        linkedin_url: profile.linkedin_url,
        website_url: profile.website_url,
        timezone: profile.timezone,
        language_pref: profile.language_pref,
        occupation: profile.occupation,
        company: profile.company,
        updated_at: new Date().toISOString(),
      }).eq('id', userId),

      advisorId
        ? supabase.from('advisors').update({
            title: advisor.title,
            category: advisor.category,
            experience: advisor.experience,
            bio: advisor.bio,
            hourly_rate: advisor.hourly_rate ? Number(advisor.hourly_rate) : null,
            available: advisor.available,
            specializations: advisor.specializations,
            languages: languages.join(', '),
            education_level: advisor.education_level,
            university: advisor.university,
            graduation_year: advisor.graduation_year ? Number(advisor.graduation_year) : null,
            updated_at: new Date().toISOString(),
          }).eq('id', advisorId)
        : Promise.resolve({ error: null }),
    ]);

    setSaving(false);
    if (!e1 && !e2) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onProfileUpdated?.();
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail.trim() || newEmail === profile.email) return;
    setChangingEmail(true);
    setEmailError('');
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      setEmailError(error.message);
    } else {
      setEmailSent(true);
      setNewEmail('');
    }
    setChangingEmail(false);
  };

  const addSpecialization = () => {
    const val = specializationInput.trim();
    if (val && !advisor.specializations.includes(val)) {
      setAdvisorField('specializations', [...advisor.specializations, val]);
    }
    setSpecializationInput('');
  };

  const toggleLanguage = (lang: string) => {
    setLanguages(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const card = `bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl`;
  const input = `w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'} placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors`;
  const lbl = `block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`;
  const section = `text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`;

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 size={22} className="text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Mi Perfil Público</h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          Esta información es visible para los clientes al consultar tu perfil de asesor.
        </p>
      </div>

      {/* Completion bar */}
      <div className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-3">
          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Perfil completado</p>
          <p className={`text-xs font-black ${completion === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>{completion}%</p>
        </div>
        <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
          <div className={`h-full rounded-full transition-all duration-700 ${completion === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${completion}%` }} />
        </div>
        {completion < 100 && (
          <p className="text-[10px] text-gray-400 mt-2">
            Un perfil completo recibe hasta 3x más solicitudes de clientes.
          </p>
        )}
      </div>

      {/* Avatar */}
      <div className={`${card} p-6`}>
        <p className={`${section} mb-4`}>Foto de Perfil</p>
        <AvatarUpload
          currentUrl={avatarUrl}
          onUploadComplete={url => setAvatarUrl(url)}
        />
      </div>

      {/* ─── INFORMACIÓN PERSONAL ─────────────────────────────── */}
      <div className={`${card} p-6 space-y-4`}>
        <p className={section}>Información Personal</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Nombre completo *</label>
            <input className={input} value={profile.full_name}
              onChange={e => setProfileField('full_name', e.target.value)}
              placeholder="Tu nombre completo" />
          </div>
          <div>
            <label className={lbl}>Teléfono</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={profile.phone}
                onChange={e => setProfileField('phone', e.target.value)}
                placeholder="+58 412 000 0000" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>País</label>
            <select className={input} value={profile.country}
              onChange={e => setProfileField('country', e.target.value)}>
              <option value="">Seleccionar país</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Ciudad</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={profile.city}
                onChange={e => setProfileField('city', e.target.value)}
                placeholder="Tu ciudad" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Fecha de nacimiento</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="date" className={`${input} pl-9`} value={profile.date_of_birth}
                onChange={e => setProfileField('date_of_birth', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={lbl}>Empresa / Organización</label>
            <div className="relative">
              <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={profile.company}
                onChange={e => setProfileField('company', e.target.value)}
                placeholder="Tu empresa" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>LinkedIn</label>
            <div className="relative">
              <Linkedin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={profile.linkedin_url}
                onChange={e => setProfileField('linkedin_url', e.target.value)}
                placeholder="linkedin.com/in/tu-perfil" />
            </div>
          </div>
          <div>
            <label className={lbl}>Sitio web</label>
            <div className="relative">
              <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={profile.website_url}
                onChange={e => setProfileField('website_url', e.target.value)}
                placeholder="tu-sitio.com" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── CAMBIO DE CORREO ─────────────────────────────────── */}
      <div className={`${card} p-6 space-y-4`}>
        <p className={section}>Correo Electrónico</p>

        <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          <Mail size={15} className="text-gray-400 shrink-0" />
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{profile.email}</p>
            <p className="text-[10px] text-gray-400">Correo actual de tu cuenta</p>
          </div>
        </div>

        {emailSent ? (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
            <MailCheck size={16} className="text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-500">
              Te enviamos un enlace de confirmación. Revisa tu bandeja de entrada y confirma el cambio.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className={lbl}>Cambiar correo electrónico</label>
              <div className="flex gap-2">
                <input className={`${input} flex-1`} value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="nuevo@correo.com" type="email" />
                <button onClick={handleEmailChange}
                  disabled={!newEmail.trim() || newEmail === profile.email || changingEmail}
                  className="flex items-center gap-2 bg-emerald-500 text-white text-xs font-bold px-4 py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-40 whitespace-nowrap">
                  {changingEmail ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                  Confirmar
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5">
                Te enviaremos un email de confirmación al nuevo correo. El cambio aplica al confirmarlo.
              </p>
              {emailError && <p className="text-xs text-red-400 mt-1">{emailError}</p>}
            </div>
          </>
        )}
      </div>

      {/* ─── PERFIL PROFESIONAL ───────────────────────────────── */}
      <div className={`${card} p-6 space-y-4`}>
        <p className={section}>Perfil Profesional</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Título profesional *</label>
            <div className="relative">
              <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={advisor.title}
                onChange={e => setAdvisorField('title', e.target.value)}
                placeholder="Ej: CFO Independiente" />
            </div>
          </div>
          <div>
            <label className={lbl}>Especialidad *</label>
            <select className={input} value={advisor.category}
              onChange={e => setAdvisorField('category', e.target.value)}>
              <option value="">Seleccionar especialidad</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Años de experiencia</label>
            <div className="relative">
              <Star size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${input} pl-9`} value={advisor.experience}
                onChange={e => setAdvisorField('experience', e.target.value)}
                placeholder="Ej: 8 años" />
            </div>
          </div>
          <div>
            <label className={lbl}>Tarifa por sesión (USD)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="number" className={`${input} pl-9`} value={advisor.hourly_rate}
                onChange={e => setAdvisorField('hourly_rate', e.target.value)}
                placeholder="50" min="0" />
            </div>
          </div>
        </div>

        <div>
          <label className={lbl}>Bio profesional *</label>
          <textarea className={`${input} resize-none`} rows={4}
            value={advisor.bio}
            onChange={e => setAdvisorField('bio', e.target.value)}
            placeholder="Describe tu experiencia, metodología y qué pueden esperar tus clientes..." />
          <p className="text-[10px] text-gray-400 mt-1">{advisor.bio.length}/500 caracteres</p>
        </div>

        {/* Disponibilidad */}
        <div className={`flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-700'}`}>Disponible para nuevos clientes</p>
            <p className="text-xs text-gray-400 mt-0.5">Apareces en el catálogo cuando estás disponible</p>
          </div>
          <button type="button" onClick={() => setAdvisorField('available', !advisor.available)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ${advisor.available ? 'bg-emerald-500' : isDark ? 'bg-white/20' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${advisor.available ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* ─── FORMACIÓN Y ESPECIALIDADES ───────────────────────── */}
      <div className={`${card} p-6 space-y-4`}>
        <p className={section}>Formación y Especialidades</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Nivel educativo</label>
            <select className={input} value={advisor.education_level}
              onChange={e => setAdvisorField('education_level', e.target.value)}>
              <option value="">Seleccionar</option>
              <option value="bachelor">Licenciatura / Ingeniería</option>
              <option value="master">Maestría / MBA</option>
              <option value="phd">Doctorado (PhD)</option>
              <option value="technical">Técnico Superior</option>
              <option value="other">Otro / Autodidacta</option>
            </select>
          </div>
          <div>
            <label className={lbl}>Universidad / Institución</label>
            <input className={input} value={advisor.university}
              onChange={e => setAdvisorField('university', e.target.value)}
              placeholder="Nombre de la institución" />
          </div>
        </div>

        {/* Specializations tags */}
        <div>
          <label className={lbl}>Sub-especialidades (tags)</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {advisor.specializations.map(s => (
              <span key={s} className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-medium px-2.5 py-1 rounded-lg">
                {s}
                <button onClick={() => setAdvisorField('specializations', advisor.specializations.filter(x => x !== s))}>
                  <X size={11} className="hover:text-red-400 transition-colors" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input className={`${input} flex-1`} value={specializationInput}
              onChange={e => setSpecializationInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSpecialization(); } }}
              placeholder="Ej: Reestructuración de deuda, SaaS..." />
            <button onClick={addSpecialization}
              className={`px-3 py-3 rounded-xl border transition-all ${isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              <Plus size={15} />
            </button>
          </div>
        </div>

        {/* Languages */}
        <div>
          <label className={lbl}>Idiomas</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES_LIST.map(lang => (
              <button key={lang} onClick={() => toggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  languages.includes(lang)
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : isDark ? 'border-white/10 text-white/50 hover:border-white/30' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}>
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PREFERENCIAS ─────────────────────────────────────── */}
      <div className={`${card} p-6 space-y-4`}>
        <p className={section}>Preferencias</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Zona horaria</label>
            <select className={input} value={profile.timezone}
              onChange={e => setProfileField('timezone', e.target.value)}>
              {TIMEZONES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Idioma preferido</label>
            <select className={input} value={profile.language_pref}
              onChange={e => setProfileField('language_pref', e.target.value)}>
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
          <div className="flex items-center gap-2 text-sm text-emerald-500 font-semibold">
            <CheckCircle size={16} /> ¡Cambios guardados!
          </div>
        )}
        {!saved && <div />}
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-emerald-500 text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-emerald-600 transition-all disabled:opacity-60">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  );
}
