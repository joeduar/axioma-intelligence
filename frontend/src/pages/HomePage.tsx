import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Zap, TrendingUp, Users, CheckCircle, ChevronDown } from 'lucide-react';

const CATEGORIES = [
  { name: 'Finanzas', icon: '💰', count: '24 asesores', color: '#0F4C35' },
  { name: 'Negocios', icon: '📈', count: '18 asesores', color: '#1A237E' },
  { name: 'Datos & IA', icon: '🤖', count: '12 asesores', color: '#4A148C' },
  { name: 'Legal', icon: '⚖️', count: '9 asesores', color: '#B71C1C' },
  { name: 'Marketing', icon: '🎯', count: '15 asesores', color: '#E65100' },
  { name: 'Tecnología', icon: '💻', count: '21 asesores', color: '#006064' },
];

const STATS = [
  { value: '200+', label: 'Asesores verificados' },
  { value: '1,200+', label: 'Sesiones completadas' },
  { value: '4.9', label: 'Valoración promedio' },
  { value: '98%', label: 'Clientes satisfechos' },
];

const STEPS = [
  { number: '01', title: 'Encuentra tu asesor', desc: 'Explora nuestro catálogo de profesionales verificados y filtra por especialidad, experiencia e idioma.' },
  { number: '02', title: 'Elige tu plan', desc: 'Comienza con una sesión inicial de $19 para conocer al asesor, o accede al plan completo de $149.' },
  { number: '03', title: 'Crece con tu asesor', desc: 'Asiste a tus sesiones, recibe seguimiento personalizado y transforma tus resultados.' },
];

const TESTIMONIALS = [
  { name: 'María González', role: 'CEO, StartupVC', text: 'Encontré al CFO fractional perfecto para mi startup en menos de 24 horas. El proceso fue increíblemente sencillo.', rating: 5, color: '#0F4C35' },
  { name: 'Carlos Mendoza', role: 'Director de Operaciones', text: 'La calidad de los asesores en Axioma no tiene comparación. Mi asesor me ayudó a triplicar los ingresos en 6 meses.', rating: 5, color: '#1A237E' },
  { name: 'Ana Rodríguez', role: 'Emprendedora', text: 'Axioma democratizó el acceso a consultoría de alto nivel. Antes era imposible para una pequeña empresa.', rating: 5, color: '#4A148C' },
];

const useInView = (threshold = 0.15) => {
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
      transform: inView ? 'translateY(0)' : 'translateY(28px)',
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
    }, 1500 / steps);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{display}</span>;
};

const HomePage = () => {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 33%{transform:translateY(-10px) rotate(1deg)} 66%{transform:translateY(-5px) rotate(-1deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes float3 { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes border-spin {
          0% { border-color: #e5e7eb transparent transparent transparent; }
          25% { border-color: #10B981 #e5e7eb transparent transparent; }
          50% { border-color: transparent #10B981 #e5e7eb transparent; }
          75% { border-color: transparent transparent #10B981 #e5e7eb; }
          100% { border-color: transparent transparent transparent #10B981; }
        }
        @keyframes glow-border {
          0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); border-color: #f3f4f6; }
          50% { box-shadow: 0 4px 20px rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); }
        }
        .float { animation: float 7s ease-in-out infinite; }
        .float2 { animation: float2 6s ease-in-out infinite 1.5s; }
        .float3 { animation: float3 8s ease-in-out infinite 3s; }
        .shimmer-text {
          background: linear-gradient(90deg, #10B981, #0A0E27 40%, #10B981);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
        }
        .cat-card { transition: all 0.3s ease; }
        .cat-card:hover {
          border-color: rgba(16,185,129,0.4);
          box-shadow: 0 8px 30px rgba(16,185,129,0.08), 0 0 0 1px rgba(16,185,129,0.15);
          transform: translateY(-4px);
        }
        .cat-card:hover .cat-arrow { color: #10B981; transform: translateX(4px); }
        .cat-card:hover .cat-icon { transform: scale(1.15); }
        .cat-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(135deg, transparent 30%, rgba(16,185,129,0) 50%, transparent 70%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          transition: background 0.5s ease;
          pointer-events: none;
        }
        .cat-card:hover::before {
          background: linear-gradient(135deg, rgba(16,185,129,0.5) 0%, rgba(16,185,129,0.1) 50%, rgba(16,185,129,0.5) 100%);
        }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.85)} }
      `}</style>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

        {/* Fondos */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[550px] h-[550px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
          <div className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(10,14,39,0.05) 0%, transparent 70%)' }} />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.45 }} />
        </div>

        {/* ── Floating card IZQUIERDA — más hacia el centro ── */}
        <div className="absolute left-[4%] xl:left-[6%] top-[35%] hidden lg:block float">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-48"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-[#0F4C35] flex items-center justify-center text-white font-black text-xs flex-shrink-0">CF</div>
              <div>
                <p className="text-xs font-bold text-gray-800 leading-none">Carlos F.</p>
                <p className="text-[9px] text-gray-400 mt-0.5">CFO Independiente</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 mb-2.5">
              {[1,2,3,4,5].map(i => <Star key={i} size={9} className="text-[#10B981] fill-[#10B981]" />)}
              <span className="text-[9px] text-gray-500 ml-1 font-medium">5.0</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#10B981] to-[#0ea371] rounded-full" style={{ width: '92%' }} />
            </div>
            <p className="text-[9px] text-gray-400 mt-1.5">92% satisfacción</p>
          </div>
        </div>

        {/* ── Floating card DERECHA SUPERIOR — más centrada ── */}
        <div className="absolute right-[4%] xl:right-[6%] top-[22%] hidden lg:block float2">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-44"
            style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.05)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-[#10B981] pulse-dot" />
              <p className="text-[11px] font-semibold text-gray-700">Session confirmed</p>
            </div>
            <p className="text-[9px] text-gray-400 mb-3">Finanzas · 60 min</p>
            <div className="bg-[#10B981]/8 rounded-xl p-2.5 text-center border border-[#10B981]/15">
              <p className="text-[10px] font-bold text-[#10B981]">Today, 3:00 PM</p>
            </div>
          </div>
        </div>

        {/* ── Floating card DERECHA INFERIOR — más centrada ── */}
        <div className="absolute right-[5%] xl:right-[7%] bottom-[28%] hidden lg:block float3">
          <div className="rounded-2xl p-4 w-40"
            style={{ background: '#0A0E27', boxShadow: '0 20px 60px rgba(10,14,39,0.3), 0 4px 20px rgba(10,14,39,0.2)' }}>
            <p className="text-[8px] text-white/40 uppercase tracking-wider mb-1 font-medium">Revenue growth</p>
            <p className="text-2xl font-black text-[#10B981]">+340%</p>
            <p className="text-[9px] text-white/30 mt-1">After 3 months</p>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">

          <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(-16px)', transition: 'all 0.6s ease 0.1s' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#10B981]/25 text-[#10B981] text-xs font-semibold mb-8"
              style={{ backgroundColor: 'rgba(16,185,129,0.06)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Más de 200 asesores verificados disponibles
            </div>
          </div>

          <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s ease 0.25s' }}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#0A0E27] leading-[1.05] tracking-tight mb-6">
              Conecta con los{' '}
              <span className="relative inline-block">
                <span className="shimmer-text">mejores asesores</span>
                <svg className="absolute -bottom-2 left-0 w-full opacity-25" viewBox="0 0 400 10" fill="none">
                  <path d="M0 8 Q100 2 200 6 Q300 10 400 4" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
                </svg>
              </span>{' '}
              para tu negocio
            </h1>
          </div>

          <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s ease 0.4s' }}>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto leading-relaxed mb-10">
              Accede a consultoría profesional de alto nivel desde <span className="font-bold text-[#0A0E27]">$19</span>. Asesores verificados en finanzas, negocios, tecnología y más.
            </p>
          </div>

          <div style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.8s ease 0.55s' }}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link to="/asesores"
                className="group inline-flex items-center gap-2 bg-[#0A0E27] text-white font-semibold px-8 py-4 rounded-full text-sm hover:bg-[#0A0E27]/90 transition-all shadow-lg shadow-[#0A0E27]/15 hover:shadow-xl hover:-translate-y-0.5">
                Explorar asesores <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/como-funciona"
                className="inline-flex items-center gap-2 text-gray-600 font-medium px-8 py-4 rounded-full text-sm border border-gray-300 hover:border-gray-400 hover:bg-gray-50 hover:-translate-y-0.5 transition-all">
                Cómo funciona
              </Link>
            </div>
          </div>

          <div style={{ opacity: heroVisible ? 1 : 0, transition: 'opacity 1s ease 0.75s' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-8 border-t border-gray-200">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-bold text-[#0A0E27] mb-1"><AnimatedNumber target={stat.value} /></p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-400 animate-bounce">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* ═══════════ CATEGORÍAS ═══════════ */}
      <section className="py-24 px-6 bg-[#0A0E27] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)' }} />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <FadeUp className="text-center mb-14">
            <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-3">Especialidades</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Encuentra tu área de asesoría</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Conecta con expertos verificados en las áreas más importantes para el crecimiento de tu negocio.
            </p>
          </FadeUp>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat, i) => (
              <FadeUp key={cat.name} delay={i * 80}>
                <Link to={`/asesores?categoria=${cat.name}`}
                  className="group relative p-6 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-[#10B981]/40 hover:-translate-y-1 transition-all duration-300 block"
                  style={{ backdropFilter: 'blur(4px)' }}>
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-3xl inline-block group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                    <ArrowRight size={16} className="text-white/20 group-hover:text-[#10B981] group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <div className="w-8 h-0.5 rounded-full mb-3"
                    style={{ backgroundColor: cat.color, opacity: 0.7 }} />
                  <h3 className="font-bold text-white mb-1 group-hover:text-[#10B981] transition-colors">{cat.name}</h3>
                  <p className="text-white/40 text-sm">{cat.count}</p>
                  {/* Glow en hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 30px rgba(16,185,129,0.05)` }} />
                </Link>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ COMO FUNCIONA ═══════════ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <FadeUp>
              <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-3">Proceso</p>
              <h2 className="text-3xl md:text-4xl font-bold text-[#0A0E27] mb-6 leading-tight">
                Tres pasos para transformar tu negocio
              </h2>
              <p className="text-gray-500 mb-10 leading-relaxed">
                Diseñamos el proceso más sencillo posible para que puedas conectar con el asesor perfecto sin complicaciones.
              </p>
              <Link to="/como-funciona"
                className="group inline-flex items-center gap-2 text-[#10B981] font-semibold text-sm">
                Ver más detalles <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </FadeUp>

            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <FadeUp key={i} delay={i * 120}>
                  <div className="group flex gap-5 p-5 rounded-2xl border border-gray-200 hover:border-[#10B981]/30 hover:shadow-lg hover:shadow-[#10B981]/5 hover:-translate-y-0.5 transition-all duration-300 bg-white cursor-default">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:border-[#10B981]/25 group-hover:bg-[#10B981]/5 transition-all">
                      <span className="text-sm font-black text-gray-300 group-hover:text-[#10B981] transition-colors">{step.number}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1 group-hover:text-[#10B981] transition-colors">{step.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PROPUESTA DE VALOR ═══════════ */}
      <section className="py-24 px-6 bg-[#0A0E27] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <FadeUp className="text-center mb-14">
            <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-3">Por qué Axioma</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">La plataforma que los profesionales eligen</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              No somos un directorio más. Somos una plataforma de conexión verificada con procesos de calidad.
            </p>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: 'Asesores verificados', desc: 'Cada asesor pasa por un riguroso proceso de verificación de credenciales, experiencia y referencias.' },
              { icon: Zap, title: 'Conexión inmediata', desc: 'Desde que eliges tu plan hasta tu primera sesión, el proceso toma menos de 24 horas.' },
              { icon: TrendingUp, title: 'Resultados medibles', desc: 'Nuestros asesores trabajan con objetivos claros y métricas definidas. 98% de clientes satisfechos.' },
            ].map((item, i) => (
              <FadeUp key={item.title} delay={i * 100}>
                <div className="group p-7 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#10B981]/40 hover:bg-white/[0.07] transition-all duration-300 h-full">
                  <div className="w-11 h-11 rounded-xl bg-[#10B981]/10 flex items-center justify-center mb-5 group-hover:bg-[#10B981]/20 transition-colors">
                    <item.icon size={20} className="text-[#10B981]" />
                  </div>
                  <h3 className="font-bold text-white mb-3 group-hover:text-[#10B981] transition-colors">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIOS ═══════════ */}
      <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)' }}>
        <div className="max-w-6xl mx-auto">
          <FadeUp className="text-center mb-14">
            <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-3">Testimonios</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0A0E27] mb-4">Lo que dicen nuestros clientes</h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <FadeUp key={t.name} delay={i * 100}>
                <div className="group p-7 bg-white rounded-2xl border border-gray-200 hover:shadow-xl hover:shadow-gray-200/60 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                  <div className="flex items-center gap-1 mb-5">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} size={13} className="text-[#10B981] fill-[#10B981]" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: t.color }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                      <p className="text-gray-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="py-24 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f0fdf8 0%, #f8fafc 50%, #f0f4ff 100%)' }}>
        {/* Decoración de fondo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)' }} />
          <div className="absolute top-8 right-8 w-32 h-32 rounded-full border border-[#10B981]/10" />
          <div className="absolute bottom-8 left-8 w-20 h-20 rounded-full border border-[#10B981]/10" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#10B981]/25 text-[#10B981] text-xs font-semibold mb-6 bg-white/80 shadow-sm">
              <Users size={12} />
              Únete a más de 1,200 clientes satisfechos
            </div>
          </FadeUp>

          <FadeUp delay={100}>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0A0E27] mb-6 leading-tight">
              Empieza hoy desde{' '}
              <span className="text-[#10B981] relative inline-block">
                $19
                <svg className="absolute -bottom-1 left-0 w-full opacity-30" viewBox="0 0 60 8" fill="none">
                  <path d="M0 6 Q15 2 30 5 Q45 8 60 4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              </span>
            </h2>
          </FadeUp>

          <FadeUp delay={180}>
            <p className="text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
              Una sesión inicial con el asesor perfecto puede cambiar el rumbo de tu negocio. Sin compromisos, sin contratos.
            </p>
          </FadeUp>

          <FadeUp delay={260}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Link to="/asesores"
                className="group inline-flex items-center gap-2 bg-[#10B981] text-white font-semibold px-8 py-4 rounded-full text-sm hover:bg-[#0ea371] hover:-translate-y-0.5 transition-all shadow-lg shadow-[#10B981]/25 hover:shadow-xl hover:shadow-[#10B981]/30">
                Comenzar ahora <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/registro"
                className="inline-flex items-center gap-2 text-gray-600 font-medium px-8 py-4 rounded-full text-sm bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 transition-all">
                Crear cuenta gratis
              </Link>
            </div>
          </FadeUp>

          <FadeUp delay={340}>
            <div className="flex items-center justify-center gap-8">
              {['Sin contratos', 'Pago seguro', 'Asesores verificados'].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-gray-500 text-xs">
                  <CheckCircle size={12} className="text-[#10B981]" />
                  {item}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
