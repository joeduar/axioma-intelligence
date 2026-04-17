import React, { useState, useEffect } from 'react';
import {
  User, Phone, MapPin, Globe, Calendar, GraduationCap, Award,
  Linkedin, CheckCircle, Loader2, Save, Plus, X, Star,
  Languages, DollarSign, Clock, BookOpen, Briefcase, Building,
  Tag, ToggleLeft, ToggleRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AvatarUpload from './AvatarUpload';

interface Props {
  userId: string;
  advisorId: string;
  isDark: boolean;
  onProfileUpdated?: () => void;
}

const CATEGORIES = [
  'Finanzas', 'Negocios', 'Datos & IA', 'Legal', 'Marketing',
  'Tecnología', 'Recursos Humanos', 'Startups', 'Salud', 'Educación', 'Otro',
];

const EDUCATION_LEVELS = [
  { value: 'bachelor', label: 'Licenciatura / Ingeniería' },
  { value: 'master', label: 'Maestría / MBA' },
  { value: 'phd', label: 'Doctorado (PhD)' },
  { value: 'technical', label: 'Técnico Superior' },
  { value: 'other', label: 'Otro / Autodidacta' },
];

const LANGUAGES = ['Español', 'English', 'Português', 'Français', 'Deutsch', 'Italiano'];

const COUNTRIES = [
  'Venezuela', 'Colombia', 'México', 'Argentina', 'Chile', 'Perú',
  'Ecuador', 'España', 'Estados Unidos', 'Otro',
];

const TIMEZONES = [
  'America/Caracas', 'America/Bogota', 'America/Lima', 'America/Mexico_City',
  'America/Argentina/Buenos_Aires', 'America/New_York', 'Europe/Madrid',
];

export default function AdvisorProfileExpanded({ userId, advisorId, isDark, onProfileUpdated }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    full_name: '', phone: '', country: '', city: '',
    date_of_birth: '', bio: '', linkedin_url: '',
    website_url: '', timezone: 'America/Caracas', language_pref: 'es',
  });

  const [advisorForm, setAdvisorForm] = useState({
    title: '', category: 'Finanzas', bio: '', experience: '',
    education_level: 'bachelor', university: '', graduation_year: '',
    license_number: '', portfolio_url: '', available: true,
  });

  const [selectedLangs, setSelectedLangs] = useState<string[]>(['Español']);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpec, setNewSpec] = useState('');
  const [certifications, setCertifications] = useState<{ name: string; issuer: string; year: string }[]>([]);

  useEffect(() => { loadProfile(); }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    const [{ data: profile }, { data: advisor }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('advisors').select('*').eq('id', advisorId).single(),
    ]);

    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        city: profile.city || '',
        date_of_birth: profile.date_of_birth || '',
        bio: profile.bio || '',
        linkedin_url: profile.linkedin_url || '',
        website_url: profile.website_url || '',
        timezone: profile.timezone || 'America/Caracas',
        language_pref: profile.language_pref || 'es',
      });
      setAvatarUrl(profile.avatar_url);
    }

    if (advisor) {
      setAdvisorForm({
        title: advisor.title || '',
        category: advisor.category || 'Finanzas',
        bio: advisor.bio || '',
        experience: advisor.experience || '',
        education_level: advisor.education_level || 'bachelor',
        university: advisor.university || '',
        graduation_year: advisor.graduation_year ? String(advisor.graduation_year) : '',
        license_number: advisor.license_number || '',
        portfolio_url: advisor.portfolio_url || '',
        available: advisor.available !== false,
      });
      setSelectedLangs(advisor.languages ? advisor.languages.split(',').map((l: string) => l.trim()) : ['Español']);
      setSpecializations(advisor.specializations || []);
      setCertifications(advisor.certifications || []);
    }
    setLoading(false);
  };

  const setP = (k: string, v: any) => setProfileForm(p => ({ ...p, [k]: v }));
  const setA = (k: string, v: any) => setAdvisorForm(p => ({ ...p, [k]: v }));

  const toggleLang = (lang: string) => {
    setSelectedLangs(prev =>
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const addSpec = () => {
    if (newSpec.trim() && !specializations.includes(newSpec.trim())) {
      setSpecializations(p => [...p, newSpec.trim()]);
      setNewSpec('');
    }
  };

  const addCert = () => setCertifications(p => [...p, { name: '', issuer: '', year: '' }]);
  const setCert = (i: number, k: string, v: string) => {
    setCertifications(p => p.map((c, j) => j === i ? { ...c, [k]: v } : c));
  };

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      supabase.from('profiles').update({
        ...profileForm,
        updated_at: new Date().toISOString(),
      }).eq('id', userId),
      supabase.from('advisors').update({
        ...advisorForm,
        graduation_year: advisorForm.graduation_year ? Number(advisorForm.graduation_year) : null,
        languages: selectedLangs.join(', '),
        specializations,
        certifications: certifications.filter(c => c.name.trim()),
        updated_at: new Date().toISOString(),
      }).eq('id', advisorId),
    ]);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onProfileUpdated?.();
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
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>Mi Perfil Profesional</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            Un perfil completo genera hasta 3x más solicitudes de clientes.
          </p>
        </div>
        {/* Availability toggle */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            {advisorForm.available ? 'Disponible' : 'No disponible'}
          </span>
          <button onClick={() => setA('available', !advisorForm.available)}
            className="transition-all">
            {advisorForm.available
              ? <ToggleRight size={28} className="text-emerald-500" />
              : <ToggleLeft size={28} className="text-gray-400" />
            }
          </button>
        </div>
      </div>

      {/* Avatar */}
      <div className={`${card} p-6`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Foto de Perfil</p>
        <AvatarUpload userId={userId} currentUrl={avatarUrl} onUpload={url => setAvatarUrl(url)} />
      </div>

      {/* Personal */}
      <div className={`${card} p-6 space-y-4`}>
        <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Información Personal</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Nombre completo *</label>
            <input className={input} value={profileForm.full_name} onChange={e => setP('full_name', e.target.value)} placeholder="Tu nombre completo" />
          </div>
          <div>
            <label className={lbl}>Teléfono</label>
            <input className={input} value={profileForm.phone} onChange={e => setP('phone', e.target.value)} placeholder="+58 412 000 0000" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>País</label>
            <select className={input} value={profileForm.country} onChange={e => setP('country', e.target.value)}>
              <option value="">Seleccionar</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Ciudad</label>
            <input className={input} value={profileForm.city} onChange={e => setP('city', e.target.value)} placeholder="Tu ciudad" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Fecha de nacimiento</label>
            <input type="date" className={input} value={profileForm.date_of_birth} onChange={e => setP('date_of_birth', e.target.value)} />
          </div>
          <div>
            <label className={lbl}>Zona horaria</label>
            <select className={input} value={profileForm.timezone} onChange={e => setP('timezone', e.target.value)}>
              {TIMEZONES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>LinkedIn</label>
            <input className={input} value={profileForm.linkedin_url} onChange={e => setP('linkedin_url', e.target.value)} placeholder="linkedin.com/in/..." />
          </div>
          <div>
            <label className={lbl}>Portafolio / Web</label>
            <input className={input} value={profileForm.website_url} onChange={e => setP('website_url', e.target.value)} placeholder="tu-sitio.com" />
          </div>
        </div>
      </div>

      {/* Professional */}
      <div className={`${card} p-6 space-y-4`}>
        <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Perfil Profesional</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Título profesional *</label>
            <input className={input} value={advisorForm.title} onChange={e => setA('title', e.target.value)}
              placeholder="Ej: Consultor Financiero Senior" />
          </div>
          <div>
            <label className={lbl}>Categoría principal *</label>
            <select className={input} value={advisorForm.category} onChange={e => setA('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={lbl}>Experiencia y trayectoria *</label>
          <textarea className={`${input} resize-none`} rows={2}
            value={advisorForm.experience} onChange={e => setA('experience', e.target.value)}
            placeholder="Ej: 10+ años en finanzas corporativas, ex-Director en..." />
        </div>

        <div>
          <label className={lbl}>Descripción profesional *</label>
          <textarea className={`${input} resize-none`} rows={4}
            value={advisorForm.bio} onChange={e => setA('bio', e.target.value)}
            placeholder="Describe tu enfoque de trabajo, metodología y cómo ayudas a tus clientes. Esta descripción es lo primero que verán los clientes potenciales..." />
          <p className="text-[10px] text-gray-400 mt-1">{advisorForm.bio.length} caracteres — Se recomienda mínimo 150</p>
        </div>
      </div>

      {/* Education */}
      <div className={`${card} p-6 space-y-4`}>
        <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Formación Académica</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Nivel educativo</label>
            <select className={input} value={advisorForm.education_level} onChange={e => setA('education_level', e.target.value)}>
              {EDUCATION_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Universidad / Institución</label>
            <input className={input} value={advisorForm.university} onChange={e => setA('university', e.target.value)}
              placeholder="Nombre de la institución" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Año de graduación</label>
            <input type="number" className={input} value={advisorForm.graduation_year}
              onChange={e => setA('graduation_year', e.target.value)}
              placeholder="2018" min="1970" max={new Date().getFullYear()} />
          </div>
          <div>
            <label className={lbl}>N° de licencia / colegiatura</label>
            <input className={input} value={advisorForm.license_number} onChange={e => setA('license_number', e.target.value)}
              placeholder="Si aplica a tu profesión" />
          </div>
        </div>

        {/* Certifications */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className={lbl}>Certificaciones</label>
            <button onClick={addCert}
              className="flex items-center gap-1 text-xs font-medium text-emerald-500 hover:text-emerald-600 transition-colors">
              <Plus size={13} /> Añadir
            </button>
          </div>
          <div className="space-y-2">
            {certifications.map((cert, i) => (
              <div key={i} className={`p-3 rounded-xl border ${isDark ? 'border-white/10 bg-white/[0.02]' : 'border-gray-100 bg-gray-50'}`}>
                <div className="grid grid-cols-3 gap-2">
                  <input className={input} value={cert.name} onChange={e => setCert(i, 'name', e.target.value)}
                    placeholder="Nombre del certificado" />
                  <input className={input} value={cert.issuer} onChange={e => setCert(i, 'issuer', e.target.value)}
                    placeholder="Emisor (Google, AWS...)" />
                  <div className="flex gap-2">
                    <input type="number" className={`${input} flex-1`} value={cert.year} onChange={e => setCert(i, 'year', e.target.value)}
                      placeholder="Año" min="2000" max={new Date().getFullYear()} />
                    <button onClick={() => setCertifications(p => p.filter((_, j) => j !== i))}
                      className="w-10 h-11 rounded-xl border border-red-200 dark:border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all shrink-0">
                      <X size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {certifications.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-3">
                Añade tus certificaciones para aumentar tu credibilidad
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className={`${card} p-6`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Idiomas</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              onClick={() => toggleLang(lang)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedLangs.includes(lang)
                  ? 'bg-emerald-500 text-white'
                  : isDark
                    ? 'bg-white/5 border border-white/10 text-white/50 hover:border-white/20'
                    : 'bg-gray-100 border border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Specializations */}
      <div className={`${card} p-6`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Especializaciones</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {specializations.map(s => (
            <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Tag size={11} className="text-emerald-500" />
              <span className="text-xs font-medium text-emerald-500">{s}</span>
              <button onClick={() => setSpecializations(p => p.filter(x => x !== s))}>
                <X size={11} className="text-emerald-400 hover:text-red-400 transition-colors" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className={`${input} flex-1`}
            value={newSpec}
            onChange={e => setNewSpec(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSpec()}
            placeholder="Ej: Análisis Financiero, Facebook Ads, Derecho Laboral..."
          />
          <button onClick={addSpec} disabled={!newSpec.trim()}
            className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all disabled:opacity-40">
            <Plus size={14} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-2">Presiona Enter o el botón + para agregar</p>
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
