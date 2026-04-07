import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Star, Shield, Zap, BarChart3, Brain,
  Briefcase, Users, Rocket, CheckCircle, Quote
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { HOW_IT_WORKS_STEPS, STATS, ADVISORY_CATEGORIES } from '../constants';

// ─── ANIMACION DE ENTRADA AL HACER SCROLL ───
const FadeInSection = ({
  children,
  delay = 0,
  direction = 'up'
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'none';
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const variants = {
    hidden: {
      opacity: 0 as number,
      y: (direction === 'up' ? 30 : 0) as number,
      x: (direction === 'left' ? -30 : direction === 'right' ? 30 : 0) as number,
    },
    visible: {
      opacity: 1 as number,
      y: 0 as number,
      x: 0 as number,
      transition: { duration: 0.6, delay, ease: 'easeOut' as const },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
    >
      {children}
    </motion.div>
  );
};

// ─── HERO ────────────────────────────────────
const Hero = () => (
  <section className="relative min-h-screen flex items-center pt-28 pb-24 px-6 overflow-hidden">

    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />
    </div>

    <div className="max-w-7xl mx-auto w-full relative z-10">
      <div className="grid lg:grid-cols-2 gap-16 items-center">

        {/* LADO IZQUIERDO */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase">
              Plataforma de asesoria profesional
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-6xl font-light text-white leading-[1.1] mb-6 uppercase tracking-tight"
          >
            El experto que <br />
            necesitas, a un <br />
            <span className="text-[#10B981] font-normal">click de distancia</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-400 text-lg max-w-lg mb-8 leading-relaxed font-light"
          >
            Conectamos asesores verificados en finanzas, negocios, datos,
            tecnologia y mas con quienes necesitan orientacion estrategica.
            Reserva en minutos.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-4 mb-10"
          >
            <Link
              to="/asesores"
              className="px-8 py-4 bg-[#10B981] text-[#0A0E27] font-bold rounded-full flex items-center gap-2 hover:bg-[#0ea371] transition-all group uppercase tracking-[0.15em] text-[11px]"
            >
              Encontrar asesor
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/registro"
              className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-all uppercase tracking-[0.15em] text-[11px]"
            >
              Soy asesor
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center gap-6"
          >
            {[
              'Asesores verificados',
              'Pago seguro con Stripe',
              'Primera sesion garantizada',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle size={13} className="text-[#10B981]" />
                <span className="text-slate-500 text-[11px] font-medium">{item}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* LADO DERECHO — cards flotantes */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="hidden lg:block relative"
        >
          <div className="relative h-[500px]">

            {/* Card principal */}
            <div className="absolute top-0 right-0 w-72">
              <GlassCard className="p-5 border-[#10B981]/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0F4C35] flex items-center justify-center text-white font-black text-sm">
                    CM
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Carlos Mendoza</p>
                    <p className="text-slate-500 text-[10px]">CFO Independiente</p>
                  </div>
                  <div className="ml-auto">
                    <div className="flex items-center gap-1">
                      <Star size={11} className="text-[#10B981] fill-[#10B981]" />
                      <span className="text-white text-xs font-bold">4.9</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['Finanzas', 'Startups', 'Fundraising'].map((t) => (
                    <span key={t} className="text-[9px] font-bold uppercase px-2 py-1 bg-white/5 text-slate-400 rounded-lg border border-white/5">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">$80 <span className="text-slate-500 text-[10px] font-normal">/ hora</span></span>
                  <span className="text-[9px] font-bold uppercase px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
                    Disponible
                  </span>
                </div>
              </GlassCard>
            </div>

            {/* Card secundaria */}
            <div className="absolute top-44 left-0 w-64">
              <GlassCard className="p-5 border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#4A148C] flex items-center justify-center text-white font-black text-sm">
                    LR
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Luis Rojas</p>
                    <p className="text-slate-500 text-[10px]">Data Scientist</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-[#10B981] fill-[#10B981]" />
                    <span className="text-white text-xs font-bold">5.0</span>
                    <span className="text-slate-500 text-[10px]">(43)</span>
                  </div>
                  <span className="text-white font-bold text-sm">$120/h</span>
                </div>
              </GlassCard>
            </div>

            {/* Card stats */}
            <div className="absolute bottom-10 right-8 w-56">
              <GlassCard className="p-5 border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                    <Shield size={14} className="text-[#10B981]" />
                  </div>
                  <p className="text-white text-xs font-bold">Sesion completada</p>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} className="text-[#10B981] fill-[#10B981]" />
                  ))}
                </div>
                <p className="text-slate-500 text-[10px] font-light leading-relaxed">
                  Excelente sesion, muy claro y preciso en sus recomendaciones.
                </p>
              </GlassCard>
            </div>

            {/* Decoracion */}
            <div className="absolute top-20 left-28 w-2 h-2 rounded-full bg-[#10B981]/40" />
            <div className="absolute top-60 right-24 w-1.5 h-1.5 rounded-full bg-[#10B981]/20" />
            <div className="absolute bottom-32 left-20 w-1 h-1 rounded-full bg-[#10B981]/30" />
          </div>
        </motion.div>

      </div>
    </div>
  </section>
);

// ─── STATS ───────────────────────────────────
const StatsBar = () => (
  <FadeInSection>
    <section className="py-12 px-6 border-y border-white/5 bg-[#080C20]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {STATS.map((stat, i) => (
          <div key={i} className="text-center">
            <p className="text-4xl font-light text-white mb-1">{stat.value}</p>
            <p className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase">{stat.label}</p>
            <p className="text-xs text-slate-600 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>
    </section>
  </FadeInSection>
);

// ─── CATEGORÍAS ──────────────────────────────
const iconMap: Record<string, React.ReactNode> = {
  BarChart3: <BarChart3 size={20} />,
  Briefcase: <Briefcase size={20} />,
  Brain: <Brain size={20} />,
  Scale: <Shield size={20} />,
  Megaphone: <Zap size={20} />,
  Cpu: <Zap size={20} />,
  Users: <Users size={20} />,
  Rocket: <Rocket size={20} />,
};

const Categories = () => (
  <section className="py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <FadeInSection>
        <div className="text-center mb-14">
          <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">
            Especialidades
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-tight">
            En que area necesitas{' '}
            <span className="text-[#10B981] font-normal">orientacion?</span>
          </h2>
        </div>
      </FadeInSection>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ADVISORY_CATEGORIES.map((cat, i) => (
          <FadeInSection key={cat.id} delay={i * 0.07}>
            <Link to={`/asesores?categoria=${cat.id}`}>
              <GlassCard className="p-6 border-white/5 hover:border-[#10B981]/30 transition-all duration-500 group cursor-pointer h-full">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] mb-4 border border-[#10B981]/10 group-hover:bg-[#10B981]/20 transition-all">
                  {iconMap[cat.icon]}
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 group-hover:text-[#10B981] transition-colors">
                  {cat.label}
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">{cat.desc}</p>
              </GlassCard>
            </Link>
          </FadeInSection>
        ))}
      </div>
    </div>
  </section>
);

// ─── ASESORES DESTACADOS ─────────────────────
const FEATURED = [
  { id: '1', name: 'Carlos Mendoza', title: 'CFO Independiente', category: 'Finanzas', rating: 4.9, reviews: 87, rate: 80, initials: 'CM', color: '#0F4C35', tags: ['Fundraising', 'Modelos financieros'] },
  { id: '3', name: 'Luis Rojas', title: 'Data Scientist Senior', category: 'Datos & IA', rating: 5.0, reviews: 43, rate: 120, initials: 'LR', color: '#4A148C', tags: ['Machine Learning', 'Power BI'] },
  { id: '6', name: 'Sofia Herrera', title: 'CTO Fractional', category: 'Tecnologia', rating: 4.9, reviews: 55, rate: 140, initials: 'SH', color: '#006064', tags: ['Arquitectura', 'Cloud'] },
  { id: '8', name: 'Valeria Castro', title: 'Startup Advisor', category: 'Startups', rating: 4.9, reviews: 39, rate: 150, initials: 'VC', color: '#880E4F', tags: ['Fundraising', 'Pitch'] },
];

const FeaturedAdvisors = () => (
  <section className="py-24 px-6 bg-[#080C20]">
    <div className="max-w-7xl mx-auto">
      <FadeInSection>
        <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">
              Top asesores
            </p>
            <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-tight">
              Los mas <span className="text-[#10B981] font-normal">valorados</span>
            </h2>
          </div>
          <Link
            to="/asesores"
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#10B981] border-b border-[#10B981]/30 pb-1 hover:border-[#10B981] transition-all group"
          >
            Ver todos los asesores
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </FadeInSection>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURED.map((advisor, i) => (
          <FadeInSection key={advisor.id} delay={i * 0.1}>
            <Link to={`/asesores/${advisor.id}`}>
              <GlassCard className="p-6 border-white/5 hover:border-[#10B981]/30 transition-all duration-500 group cursor-pointer h-full">

                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                    style={{ backgroundColor: advisor.color }}
                  >
                    {advisor.initials}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm group-hover:text-[#10B981] transition-colors">
                      {advisor.name}
                    </p>
                    <p className="text-slate-500 text-[10px]">{advisor.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-[#10B981] fill-[#10B981]" />
                    <span className="text-white text-xs font-bold">{advisor.rating}</span>
                    <span className="text-slate-500 text-[10px]">({advisor.reviews})</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                    {advisor.category}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {advisor.tags.map((tag) => (
                    <span key={tag} className="text-[9px] font-bold uppercase px-2 py-1 bg-white/5 text-slate-400 rounded-lg border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-white font-bold">${advisor.rate}<span className="text-slate-500 text-[10px] font-normal"> /h</span></span>
                  <span className="text-[#10B981] text-[10px] font-bold uppercase tracking-wider">
                    Ver perfil
                  </span>
                </div>

              </GlassCard>
            </Link>
          </FadeInSection>
        ))}
      </div>
    </div>
  </section>
);

// ─── CÓMO FUNCIONA ───────────────────────────
const HowItWorks = () => (
  <section className="py-24 px-6">
    <div className="max-w-7xl mx-auto">
      <FadeInSection>
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">
            Proceso simple
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-tight">
            Tres pasos para tu{' '}
            <span className="text-[#10B981] font-normal">primera sesion</span>
          </h2>
        </div>
      </FadeInSection>

      <div className="grid md:grid-cols-3 gap-6">
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <FadeInSection key={i} delay={i * 0.15}>
            <GlassCard className="p-8 border-white/5 hover:border-[#10B981]/20 transition-all duration-500 group h-full">
              <span className="text-5xl font-black text-[#10B981]/15 block mb-4 group-hover:text-[#10B981]/25 transition-colors">
                {step.step}
              </span>
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3 group-hover:text-[#10B981] transition-colors">
                {step.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">{step.desc}</p>
            </GlassCard>
          </FadeInSection>
        ))}
      </div>

      <FadeInSection delay={0.3}>
        <div className="text-center mt-10">
          <Link
            to="/como-funciona"
            className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#10B981] border-b border-[#10B981]/30 pb-1 hover:border-[#10B981] transition-all"
          >
            Ver explicacion completa
          </Link>
        </div>
      </FadeInSection>
    </div>
  </section>
);

// ─── TESTIMONIOS ─────────────────────────────
const TESTIMONIALS = [
  {
    text: 'Encontre a Carlos en Axioma y en una sola sesion reestructuro completamente nuestra proyeccion financiera. Lo que tardabamos semanas en resolver, lo resolvimos en una hora.',
    author: 'Miguel Torres',
    role: 'CEO, Fintech startup',
    rating: 5,
  },
  {
    text: 'Como asesor la plataforma me ha permitido conectar con clientes de calidad sin perder tiempo en prospectacion. El sistema de pagos es impecable y el soporte excelente.',
    author: 'Sofia Herrera',
    role: 'CTO Fractional',
    rating: 5,
  },
  {
    text: 'Buscaba orientacion legal para mi empresa y en menos de 24 horas ya habia tenido mi primera sesion con Maria. La calidad del asesoramiento supero mis expectativas.',
    author: 'Laura Mendez',
    role: 'Fundadora, AgriTech',
    rating: 5,
  },
];

const Testimonials = () => (
  <section className="py-24 px-6 bg-[#080C20]">
    <div className="max-w-7xl mx-auto">
      <FadeInSection>
        <div className="text-center mb-14">
          <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">
            Lo que dicen
          </p>
          <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-tight">
            Resultados <span className="text-[#10B981] font-normal">reales</span>
          </h2>
        </div>
      </FadeInSection>

      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <FadeInSection key={i} delay={i * 0.1}>
            <GlassCard className="p-8 border-white/5 h-full flex flex-col">
              <Quote size={24} className="text-[#10B981]/30 mb-5 flex-shrink-0" />
              <p className="text-slate-300 text-sm leading-relaxed font-light flex-grow mb-6">
                {t.text}
              </p>
              <div className="pt-5 border-t border-white/5">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <Star key={s} size={11} className="text-[#10B981] fill-[#10B981]" />
                  ))}
                </div>
                <p className="text-white font-bold text-sm">{t.author}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{t.role}</p>
              </div>
            </GlassCard>
          </FadeInSection>
        ))}
      </div>
    </div>
  </section>
);

// ─── CTA FINAL ───────────────────────────────
const CTASection = () => (
  <FadeInSection>
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <GlassCard className="p-14 border-[#10B981]/10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 mb-8">
            <Star size={12} className="text-[#10B981]" />
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase">
              Para asesores profesionales
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-tight mb-6">
            Monetiza tu conocimiento{' '}
            <span className="text-[#10B981] font-normal">hoy mismo</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10 font-light max-w-xl mx-auto">
            Crea tu perfil, define tus tarifas y empieza a recibir clientes esta semana.
            Sin complicaciones, sin burocracia.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/registro"
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#10B981] text-[#0A0E27] font-bold rounded-full hover:bg-[#0ea371] transition-all uppercase tracking-[0.15em] text-[11px] group"
            >
              Crear mi perfil de asesor
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/asesores"
              className="inline-flex items-center gap-2 px-10 py-4 border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-all uppercase tracking-[0.15em] text-[11px]"
            >
              Explorar asesores
            </Link>
          </div>
        </GlassCard>
      </div>
    </section>
  </FadeInSection>
);

// ─── PÁGINA COMPLETA ─────────────────────────
const HomePage = () => (
  <>
    <Hero />
    <StatsBar />
    <Categories />
    <FeaturedAdvisors />
    <HowItWorks />
    <Testimonials />
    <CTASection />
  </>
);

export default HomePage;