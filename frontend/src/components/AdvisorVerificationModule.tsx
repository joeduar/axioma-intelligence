import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, ShieldX, Clock, Upload, FileText, User, GraduationCap,
  AlertCircle, CheckCircle, Loader2, X, Plus, ExternalLink, Info,
  Camera, CreditCard, Award, Linkedin, Globe, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  userId: string;
  advisorId: string;
  isDark: boolean;
}

interface VerifData {
  id?: string;
  status?: string;
  rejection_reason?: string;
  submitted_at?: string;
  reviewed_at?: string;
}

interface FormState {
  full_legal_name: string;
  id_document_type: string;
  professional_title: string;
  education_level: string;
  university: string;
  graduation_year: string;
  license_number: string;
  linkedin_url: string;
  portfolio_url: string;
  notes: string;
}

interface FileState {
  id_document: File | null;
  selfie: File | null;
  degree: File | null;
  license: File | null;
  certificates: File[];
}

type UploadStatus = Record<string, 'idle' | 'uploading' | 'done' | 'error'>;

const EDUCATION_LEVELS = [
  { value: 'bachelor', label: 'Licenciatura / Ingeniería' },
  { value: 'master', label: 'Maestría / MBA' },
  { value: 'phd', label: 'Doctorado (PhD)' },
  { value: 'technical', label: 'Técnico Superior' },
  { value: 'other', label: 'Otro / Autodidacta' },
];

const ID_TYPES = [
  { value: 'cedula', label: 'Cédula de Identidad' },
  { value: 'passport', label: 'Pasaporte' },
  { value: 'driver_license', label: 'Licencia de Conducir' },
];

// ─── FILE DROP ZONE ─────────────────────────────────────────
const FileDropZone = ({
  label, hint, accept, file, onChange, isDark, icon: Icon
}: {
  label: string;
  hint: string;
  accept: string;
  file: File | null;
  onChange: (f: File) => void;
  isDark: boolean;
  icon: React.ElementType;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      onClick={() => ref.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) onChange(f);
      }}
      className={`relative border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
        dragging
          ? 'border-emerald-500 bg-emerald-500/10'
          : file
            ? 'border-emerald-500/50 bg-emerald-500/5'
            : isDark
              ? 'border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]'
              : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => {
        const f = e.target.files?.[0];
        if (f) onChange(f);
      }} />
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          file ? 'bg-emerald-500/20' : isDark ? 'bg-white/5' : 'bg-gray-100'
        }`}>
          {file ? <CheckCircle size={16} className="text-emerald-500" /> : <Icon size={16} className={isDark ? 'text-white/40' : 'text-gray-400'} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold truncate ${
            file ? 'text-emerald-600 dark:text-emerald-400' : isDark ? 'text-white/70' : 'text-gray-700'
          }`}>
            {file ? file.name : label}
          </p>
          <p className="text-[10px] text-gray-400 mt-0.5">{hint}</p>
        </div>
        {!file && (
          <Upload size={14} className={isDark ? 'text-white/30' : 'text-gray-300'} />
        )}
      </div>
    </div>
  );
};

// ─── STATUS BANNER ───────────────────────────────────────────
const StatusBanner = ({ status, rejectionReason, submittedAt, reviewedAt }: {
  status: string;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
}) => {
  if (status === 'approved') return (
    <div className="flex items-start gap-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
        <ShieldCheck size={20} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-emerald-400">¡Verificación Aprobada!</p>
        <p className="text-xs text-emerald-400/70 mt-1">
          Tu identidad y credenciales han sido verificadas. Apareces como asesor verificado en la plataforma.
        </p>
        {reviewedAt && (
          <p className="text-[10px] text-emerald-500/50 mt-2">
            Aprobado el {new Date(reviewedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );

  if (status === 'pending') return (
    <div className="flex items-start gap-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
        <Clock size={20} className="text-amber-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-amber-400">Solicitud en Revisión</p>
        <p className="text-xs text-amber-400/70 mt-1">
          Tu solicitud está siendo revisada por nuestro equipo. El proceso tarda entre 1 y 3 días hábiles.
        </p>
        {submittedAt && (
          <p className="text-[10px] text-amber-500/50 mt-2">
            Enviado el {new Date(submittedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
      </div>
    </div>
  );

  if (status === 'rejected') return (
    <div className="flex items-start gap-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
        <ShieldX size={20} className="text-red-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-red-400">Solicitud Rechazada</p>
        {rejectionReason && (
          <p className="text-xs text-red-400/70 mt-1">
            <span className="font-semibold">Motivo: </span>{rejectionReason}
          </p>
        )}
        <p className="text-xs text-red-400/50 mt-2">
          Puedes corregir la información y enviar una nueva solicitud.
        </p>
      </div>
    </div>
  );

  return null;
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AdvisorVerificationModule({ userId, advisorId, isDark }: Props) {
  const [verifData, setVerifData] = useState<VerifData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: identity, 2: education, 3: documents
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState<FormState>({
    full_legal_name: '',
    id_document_type: 'cedula',
    professional_title: '',
    education_level: 'bachelor',
    university: '',
    graduation_year: '',
    license_number: '',
    linkedin_url: '',
    portfolio_url: '',
    notes: '',
  });

  const [files, setFiles] = useState<FileState>({
    id_document: null,
    selfie: null,
    degree: null,
    license: null,
    certificates: [],
  });

  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({});

  useEffect(() => {
    loadVerification();
  }, [userId]);

  const loadVerification = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('advisor_verification')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setVerifData(data);
    setLoading(false);
  };

  const setField = (key: keyof FormState, val: string) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    setUploadStatus(prev => ({ ...prev, [path]: 'uploading' }));
    const ext = file.name.split('.').pop();
    const filePath = `${userId}/${path}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('verification-docs')
      .upload(filePath, file, { upsert: true });

    if (error) {
      setUploadStatus(prev => ({ ...prev, [path]: 'error' }));
      return null;
    }

    const { data } = supabase.storage.from('verification-docs').getPublicUrl(filePath);
    setUploadStatus(prev => ({ ...prev, [path]: 'done' }));
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    if (!form.full_legal_name.trim() || !form.professional_title.trim()) return;

    setSubmitting(true);

    try {
      // Upload files
      const [idUrl, selfieUrl, degreeUrl, licenseUrl] = await Promise.all([
        files.id_document ? uploadFile(files.id_document, 'id_document') : Promise.resolve(null),
        files.selfie ? uploadFile(files.selfie, 'selfie') : Promise.resolve(null),
        files.degree ? uploadFile(files.degree, 'degree') : Promise.resolve(null),
        files.license ? uploadFile(files.license, 'license') : Promise.resolve(null),
      ]);

      const certUrls: { name: string; url: string }[] = [];
      for (let i = 0; i < files.certificates.length; i++) {
        const url = await uploadFile(files.certificates[i], `cert_${i}`);
        if (url) certUrls.push({ name: files.certificates[i].name.replace(/\.[^.]+$/, ''), url });
      }

      // Upsert verification record
      const { error } = await supabase
        .from('advisor_verification')
        .upsert({
          advisor_id: advisorId,
          user_id: userId,
          full_legal_name: form.full_legal_name,
          id_document_type: form.id_document_type,
          professional_title: form.professional_title,
          education_level: form.education_level,
          university: form.university || null,
          graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
          license_number: form.license_number || null,
          linkedin_url: form.linkedin_url || null,
          portfolio_url: form.portfolio_url || null,
          notes: form.notes || null,
          id_document_url: idUrl,
          selfie_url: selfieUrl,
          degree_url: degreeUrl,
          license_url: licenseUrl,
          certificate_urls: certUrls,
          status: 'pending',
          submitted_at: new Date().toISOString(),
        }, { onConflict: 'advisor_id' });

      if (!error) {
        // Update advisor verification_status
        await supabase
          .from('advisors')
          .update({ verification_status: 'pending', verification_submitted_at: new Date().toISOString() })
          .eq('id', advisorId);

        // Notify admin (optional: create notification for admin users)
        setSuccessMsg('¡Solicitud enviada! Nuestro equipo la revisará en 1-3 días hábiles.');
        loadVerification();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmitStep1 = form.full_legal_name.trim().length > 2 && form.professional_title.trim().length > 2;
  const canSubmitStep2 = form.education_level !== '';
  const canSubmit = canSubmitStep1 && canSubmitStep2 && (files.id_document !== null || files.selfie !== null);

  const card = `bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 rounded-2xl`;
  const input = `w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm ${isDark ? 'text-white' : 'text-gray-900'} placeholder-gray-400 focus:outline-none focus:border-emerald-500 transition-colors`;
  const label = `block text-xs font-semibold mb-1.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={22} className="text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Verificación de Identidad
        </h2>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
          Verifica tu identidad y credenciales para obtener el sello de asesor verificado en la plataforma.
        </p>
      </div>

      {/* Why verify */}
      {!verifData && (
        <div className={`${card} p-5`}>
          <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
            ¿Por qué verificarme?
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, title: 'Sello verificado', desc: 'Aparece como asesor de confianza en los resultados de búsqueda.' },
              { icon: Award, title: 'Más contrataciones', desc: 'Los asesores verificados reciben hasta 3x más solicitudes.' },
              { icon: User, title: 'Mayor tarifa', desc: 'Justifica tarifas más altas con credenciales validadas.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                  <Icon size={18} className="text-emerald-500" />
                </div>
                <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</p>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status banner if already submitted */}
      {verifData?.status && (
        <StatusBanner
          status={verifData.status}
          rejectionReason={verifData.rejection_reason}
          submittedAt={verifData.submitted_at}
          reviewedAt={verifData.reviewed_at}
        />
      )}

      {/* Success */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
          <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400">{successMsg}</p>
        </div>
      )}

      {/* Form — only show if not pending/approved */}
      {(!verifData?.status || verifData.status === 'rejected') && !successMsg && (
        <>
          {/* Step indicator */}
          <div className="flex items-center gap-3">
            {[
              { n: 1, label: 'Identidad' },
              { n: 2, label: 'Educación' },
              { n: 3, label: 'Documentos' },
            ].map(({ n, label: l }, i) => (
              <React.Fragment key={n}>
                <button
                  onClick={() => { if (n < step || (n === 2 && canSubmitStep1) || (n === 3 && canSubmitStep2 && canSubmitStep1)) setStep(n); }}
                  className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                    step === n
                      ? 'text-emerald-500'
                      : step > n
                        ? 'text-emerald-400/70'
                        : isDark ? 'text-white/30' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                    step > n ? 'bg-emerald-500 text-white' : step === n ? 'bg-emerald-500 text-white' : isDark ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {step > n ? <CheckCircle size={12} /> : n}
                  </div>
                  {l}
                </button>
                {i < 2 && <div className={`flex-1 h-px ${step > n + 0 ? 'bg-emerald-500/50' : isDark ? 'bg-white/10' : 'bg-gray-100'}`} />}
              </React.Fragment>
            ))}
          </div>

          {/* ── STEP 1: IDENTITY ─────────────────────────────── */}
          {step === 1 && (
            <div className={`${card} p-6 space-y-4`}>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Información Personal
              </p>

              <div>
                <label className={label}>Nombre legal completo *</label>
                <input className={input} value={form.full_legal_name} onChange={e => setField('full_legal_name', e.target.value)}
                  placeholder="Tal como aparece en tu documento de identidad" />
              </div>

              <div>
                <label className={label}>Tipo de documento de identidad *</label>
                <select className={input} value={form.id_document_type} onChange={e => setField('id_document_type', e.target.value)}>
                  {ID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className={label}>Título profesional *</label>
                <input className={input} value={form.professional_title} onChange={e => setField('professional_title', e.target.value)}
                  placeholder="Ej: Consultor Financiero, Especialista en Marketing Digital..." />
              </div>

              <div>
                <label className={label}>Número de licencia profesional (si aplica)</label>
                <input className={input} value={form.license_number} onChange={e => setField('license_number', e.target.value)}
                  placeholder="Número de colegiatura o licencia" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>LinkedIn</label>
                  <div className="relative">
                    <Linkedin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className={`${input} pl-9`} value={form.linkedin_url} onChange={e => setField('linkedin_url', e.target.value)}
                      placeholder="linkedin.com/in/tu-perfil" />
                  </div>
                </div>
                <div>
                  <label className={label}>Portafolio / Sitio web</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className={`${input} pl-9`} value={form.portfolio_url} onChange={e => setField('portfolio_url', e.target.value)}
                      placeholder="tu-sitio.com" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setStep(2)} disabled={!canSubmitStep1}
                  className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Continuar <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: EDUCATION ────────────────────────────── */}
          {step === 2 && (
            <div className={`${card} p-6 space-y-4`}>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Formación Académica
              </p>

              <div>
                <label className={label}>Nivel educativo *</label>
                <select className={input} value={form.education_level} onChange={e => setField('education_level', e.target.value)}>
                  {EDUCATION_LEVELS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={label}>Universidad / Institución</label>
                  <input className={input} value={form.university} onChange={e => setField('university', e.target.value)}
                    placeholder="Nombre de la institución" />
                </div>
                <div>
                  <label className={label}>Año de graduación</label>
                  <input className={input} type="number" value={form.graduation_year} onChange={e => setField('graduation_year', e.target.value)}
                    placeholder="2020" min="1970" max={new Date().getFullYear()} />
                </div>
              </div>

              <div>
                <label className={label}>Nota adicional (opcional)</label>
                <textarea className={`${input} resize-none`} rows={3}
                  value={form.notes} onChange={e => setField('notes', e.target.value)}
                  placeholder="Cuéntanos brevemente sobre tu experiencia y por qué quieres ser asesor en Axioma..." />
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)}
                  className={`text-sm font-medium px-5 py-3 rounded-xl border transition-all ${isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  Atrás
                </button>
                <button onClick={() => setStep(3)} disabled={!canSubmitStep2}
                  className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  Continuar <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: DOCUMENTS ────────────────────────────── */}
          {step === 3 && (
            <div className={`${card} p-6 space-y-5`}>
              <div>
                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Documentos de Verificación
                </p>
                <div className="flex items-start gap-2 mt-2">
                  <Info size={13} className="text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-400">
                    Los documentos son confidenciales y solo los verá el equipo de Axioma. Acepta JPG, PNG o PDF de máximo 5MB.
                  </p>
                </div>
              </div>

              {/* Required docs */}
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                  Obligatorios
                </p>
                <div className="space-y-3">
                  <FileDropZone
                    label="Documento de identidad"
                    hint="Cédula, pasaporte o licencia (anverso y reverso)"
                    accept="image/*,.pdf"
                    file={files.id_document}
                    onChange={f => setFiles(p => ({ ...p, id_document: f }))}
                    isDark={isDark}
                    icon={CreditCard}
                  />
                  <FileDropZone
                    label="Selfie sosteniendo el documento"
                    hint="Foto clara de tu cara junto al documento de identidad"
                    accept="image/*"
                    file={files.selfie}
                    onChange={f => setFiles(p => ({ ...p, selfie: f }))}
                    isDark={isDark}
                    icon={Camera}
                  />
                </div>
              </div>

              {/* Optional docs */}
              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                  Opcionales (aumentan probabilidad de aprobación)
                </p>
                <div className="space-y-3">
                  <FileDropZone
                    label="Título universitario / Diploma"
                    hint="Escaneo del diploma oficial"
                    accept="image/*,.pdf"
                    file={files.degree}
                    onChange={f => setFiles(p => ({ ...p, degree: f }))}
                    isDark={isDark}
                    icon={GraduationCap}
                  />
                  <FileDropZone
                    label="Licencia o habilitación profesional"
                    hint="Si tu profesión requiere colegiatura"
                    accept="image/*,.pdf"
                    file={files.license}
                    onChange={f => setFiles(p => ({ ...p, license: f }))}
                    isDark={isDark}
                    icon={FileText}
                  />

                  {/* Certificates */}
                  <div>
                    <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      Certificados adicionales
                    </p>
                    {files.certificates.map((cert, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-xl mb-2 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <Award size={14} className="text-emerald-500 shrink-0" />
                        <p className="text-xs text-emerald-500 flex-1 truncate">{cert.name}</p>
                        <button onClick={() => setFiles(p => ({ ...p, certificates: p.certificates.filter((_, j) => j !== i) }))}>
                          <X size={13} className="text-gray-400 hover:text-red-400 transition-colors" />
                        </button>
                      </div>
                    ))}
                    <label className={`flex items-center gap-2 text-xs font-medium cursor-pointer px-3 py-2.5 rounded-xl border-dashed border-2 transition-all ${isDark ? 'border-white/10 text-white/40 hover:border-white/20' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) setFiles(p => ({ ...p, certificates: [...p.certificates, f] }));
                      }} />
                      <Plus size={14} /> Agregar certificado
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(2)}
                  className={`text-sm font-medium px-5 py-3 rounded-xl border transition-all ${isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                  Atrás
                </button>
                <button onClick={handleSubmit} disabled={!canSubmit || submitting}
                  className="flex items-center gap-2 bg-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  {submitting ? (
                    <><Loader2 size={15} className="animate-spin" /> Enviando...</>
                  ) : (
                    <><ShieldCheck size={15} /> Enviar Solicitud</>
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Info box */}
      <div className={`${card} p-5`}>
        <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
          Proceso de verificación
        </p>
        <div className="space-y-3">
          {[
            { step: '01', text: 'Envías tu solicitud con documentos e información profesional.' },
            { step: '02', text: 'Nuestro equipo revisa tus documentos en 1-3 días hábiles.' },
            { step: '03', text: 'Recibes una notificación con el resultado de tu verificación.' },
            { step: '04', text: 'Con la verificación aprobada, apareces en búsquedas con el sello verificado.' },
          ].map(({ step: s, text }) => (
            <div key={s} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-500 shrink-0 mt-0.5">
                {s}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
