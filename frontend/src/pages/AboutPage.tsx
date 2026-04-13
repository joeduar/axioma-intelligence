import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Zap, Shield, Brain, Users, ArrowRight, MapPin, Mail, Phone } from 'lucide-react';

// ── Animación fade-up ──────────────────────────────────────
const useInView = (threshold = 0.12) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
};

const FadeUp = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

const AnimatedNumber = ({ target }: { target: string }) => {
  const { ref, inView } = useInView();
  const [display, setDisplay] = useState('0');
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const num = parseFloat(target.replace(/[^0-9.]/g, ''));
    const isDecimal = target.includes('.');
    const steps = 60;
    const increment = num / steps;
    let current = 0, step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, num);
      const formatted = isDecimal ? current.toFixed(1) : Math.floor(current).toLocaleString();
      const suffix = target.includes('+') ? '+' : target.includes('%') ? '%' : '';
      setDisplay(`${formatted}${suffix}`);
      if (step >= steps) clearInterval(timer);
    }, 1400 / steps);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{display}</span>;
};

// ── Datos ──────────────────────────────────────────────────
const VALUES = [
  {
    icon: Shield, color: '#0F4C35',
    title: 'Confianza',
    desc: 'Verificamos cada asesor antes de publicar su perfil. La confianza no es un eslogan, es nuestro proceso.',
  },
  {
    icon: Brain, color: '#1A237E',
    title: 'Inteligencia',
    desc: 'Aplicamos tecnología e IA para conectar mejor a quienes buscan orientación con quienes pueden darla.',
  },
  {
    icon: Zap, color: '#4A148C',
    title: 'Eficiencia',
    desc: 'Eliminamos la fricción del proceso. Encontrar, reservar y pagar una asesoría debe tomar minutos, no días.',
  },
  {
    icon: Users, color: '#006064',
    title: 'Comunidad',
    desc: 'Construimos una red de profesionales de alto nivel comprometidos con el crecimiento de sus clientes.',
  },
];

const TIMELINE = [
  {
    year: '2022',
    title: 'El origen',
    desc: 'Axioma Ventures Intelligence nace como empresa de tecnología e IA, desarrollando soluciones para empresas que querían usar inteligencia artificial.',
  },
  {
    year: '2023',
    title: 'El descubrimiento',
    desc: 'Identificamos que el mayor obstáculo para el crecimiento empresarial no era tecnología ni capital, sino la falta de orientación estratégica oportuna.',
  },
  {
    year: '2024',
    title: 'La plataforma',
    desc: 'Lanzamos el marketplace de asesorías: un espacio donde cualquier empresa o emprendedor puede conectar en minutos con el experto que necesita.',
  },
  {
    year: 'Hoy',
    title: 'En crecimiento',
    desc: 'Combinamos nuestra capacidad tecnológica con una red creciente de asesores verificados para ofrecer la experiencia de consultoría más accesible del mercado.',
  },
];

const STATS = [
  { value: '200+', label: 'Asesores verificados' },
  { value: '8', label: 'Especialidades' },
  { value: '1,400+', label: 'Sesiones completadas' },
  { value: '4.9', label: 'Calificación promedio' },
];

// ── Página ─────────────────────────────────────────────────
const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Fondos */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-[-5%] w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(10,14,39,0.04) 0%, transparent 70%)' }} />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.4 }} />
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#10B981]/8 border border-[#10B981]/20 rounded-full px-4 py-1.5 mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[#10B981] text-[10px] font-bold tracking-[0.25em] uppercase">Nuestra esencia</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-[#0A0E27] leading-[1.05] mb-6">
              Construimos el puente entre el conocimiento{' '}
              <span className="text-[#10B981]">y quienes lo necesitan</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
              Axioma Ventures Intelligence nació con una visión clara: democratizar el acceso a asesoría
              profesional de alto nivel, conectando expertos verificados con empresas y personas que
              buscan orientación estratégica.
            </p>
          </div>

          {/* Stat pills flotantes */}
          <div className="flex flex-wrap gap-3 mt-10">
            {STATS.map((s, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
                <span className="text-xl font-black text-[#0A0E27]">
                  <AnimatedNumber target={s.value} />
                </span>
                <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ MISIÓN + VISIÓN ════════════════════════════════ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <FadeUp>
              <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm h-full">
                <div className="w-12 h-12 rounded-2xl bg-[#0F4C35] flex items-center justify-center mb-5">
                  <Target size={20} className="text-white" />
                </div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase mb-3">Nuestra misión</p>
                <h2 className="text-lg font-black text-[#0A0E27] mb-4 leading-snug">
                  Conectar expertos con quienes los necesitan
                </h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Conectar a profesionales expertos con quienes necesitan orientación estratégica, creando
                  un ecosistema de confianza donde el conocimiento se convierte en ventaja competitiva real.
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={120}>
              <div className="bg-[#0A0E27] border border-[#0A0E27] rounded-2xl p-8 shadow-sm h-full">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                  <Eye size={20} className="text-[#10B981]" />
                </div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase mb-3">Nuestra visión</p>
                <h2 className="text-lg font-black text-white mb-4 leading-snug">
                  La plataforma de referencia en Latinoamérica
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Ser la plataforma de referencia en Latinoamérica para la conexión entre asesores
                  profesionales y clientes, impulsada por inteligencia artificial y estándares de excelencia.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══ HISTORIA — TIMELINE ════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="mb-12">
              <p className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase mb-3">Nuestra historia</p>
              <h2 className="text-2xl md:text-3xl font-black text-[#0A0E27]">
                De la idea al marketplace
              </h2>
            </div>
          </FadeUp>

          <div className="relative">
            {/* Línea horizontal desktop */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-gray-100" />

            <div className="grid md:grid-cols-4 gap-6 md:gap-4">
              {TIMELINE.map((item, i) => (
                <FadeUp key={i} delay={i * 100}>
                  <div className="relative">
                    {/* Punto en la línea */}
                    <div className="hidden md:flex items-center justify-start mb-6">
                      <div className="w-4 h-4 rounded-full bg-[#10B981] border-4 border-white shadow-md relative z-10" />
                    </div>
                    {/* Año */}
                    <span className="inline-block text-xs font-black text-[#10B981] bg-[#10B981]/8 px-3 py-1 rounded-full mb-3">
                      {item.year}
                    </span>
                    <h3 className="font-bold text-[#0A0E27] text-sm mb-2">{item.title}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ VALORES ════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase mb-3">Lo que nos define</p>
              <h2 className="text-2xl md:text-3xl font-black text-[#0A0E27]">
                Nuestros valores
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-5">
            {VALUES.map((value, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-start gap-5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: value.color }}>
                      <value.icon size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#0A0E27] text-base mb-2">{value.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{value.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CONTACTO ═══════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="mb-10">
              <p className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase mb-3">Hablemos</p>
              <h2 className="text-2xl md:text-3xl font-black text-[#0A0E27]">
                Contacto directo
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Mail, color: '#0F4C35',
                label: 'Email',
                value: 'info@axiomaventures.com',
                href: 'mailto:info@axiomaventures.com',
              },
              {
                icon: Phone, color: '#1A237E',
                label: 'WhatsApp Business',
                value: '+58 424 160 1430',
                href: 'https://wa.me/584241601430',
              },
              {
                icon: MapPin, color: '#4A148C',
                label: 'Ubicación',
                value: 'Venezuela · Remoto global',
                href: null,
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: item.color }}>
                    <item.icon size={16} className="text-white" />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400 mb-1">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                      className="text-gray-800 font-semibold text-sm hover:text-[#10B981] transition-colors">
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-gray-800 font-semibold text-sm">{item.value}</p>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA FINAL ══════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <div className="relative bg-[#0A0E27] rounded-3xl p-12 text-center overflow-hidden">
              {/* Fondo decorativo */}
              <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <div className="absolute bottom-0 left-0 w-52 h-52 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

              <div className="relative">
                <span className="inline-block text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase mb-4">
                  Únete a Axioma
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                  Forma parte de la comunidad
                </h2>
                <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                  Ya seas un profesional que quiere monetizar su conocimiento o alguien que busca
                  orientación experta, aquí tienes tu lugar.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    to="/asesores"
                    className="inline-flex items-center gap-2 bg-[#10B981] text-[#0A0E27] font-black px-8 py-4 rounded-full text-xs uppercase tracking-wider hover:bg-[#0ea371] transition-all group"
                  >
                    Explorar asesores
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/registro"
                    className="inline-flex items-center gap-2 border border-white/20 text-white font-bold px-8 py-4 rounded-full text-xs uppercase tracking-wider hover:bg-white/5 transition-all"
                  >
                    Registrarme como asesor
                  </Link>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
