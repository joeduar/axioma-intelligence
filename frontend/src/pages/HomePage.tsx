import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Zap, BarChart3, Brain, Briefcase, Users, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '../components/GlassCard';
import { HOW_IT_WORKS_STEPS, STATS, ADVISORY_CATEGORIES } from '../constants';

// ─── HERO ───────────────────────────────────
const Hero = () => (
  <section className="relative min-h-screen flex items-center pt-28 pb-24 px-6 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(16,185,129,0.07),transparent_55%)] pointer-events-none" />

    <div className="max-w-7xl mx-auto w-full relative z-10">
      <div className="max-w-3xl">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase">
            Plataforma de asesoría profesional
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl font-light text-white leading-[1.1] mb-6 uppercase tracking-tight"
        >
          Conectamos expertos <br />
          con quienes <br />
          <span className="text-[#10B981] font-normal">los necesitan</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg max-w-xl mb-10 leading-relaxed font-light"
        >
          Encuentra asesores verificados en finanzas, negocios, datos, tecnología y más.
          Reserva una sesión en minutos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            to="/asesores"
            className="px-8 py-4 bg-[#10B981] text-[#0A0E27] font-bold rounded-full flex items-center gap-2 hover:bg-[#0ea371] transition-all group uppercase tracking-[0.15em] text-[11px]"
          >
            Explorar asesores
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/registro"
            className="px-8 py-4 bg-transparent border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-all uppercase tracking-[0.15em] text-[11px]"
          >
            Soy asesor →
          </Link>
        </motion.div>

      </div>
    </div>
  </section>
);

// ─── STATS ──────────────────────────────────
const StatsBar = () => (
  <section className="py-12 px-6 border-y border-white/5">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      {STATS.map((stat, i) => (
        <div key={i} className="text-center">
          <p className="text-3xl font-light text-white mb-1">{stat.value}</p>
          <p className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase">{stat.label}</p>
          <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
        </div>
      ))}
    </div>
  </section>
);

// ─── CATEGORÍAS ─────────────────────────────
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
      <div className="text-center mb-14">
        <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">Especialidades</p>
        <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-tight">
          ¿En qué área necesitas <span className="text-[#10B981] font-normal">orientación?</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ADVISORY_CATEGORIES.map((cat) => (
          <Link key={cat.id} to={`/asesores?categoria=${cat.id}`}>
            <GlassCard className="p-6 border-white/5 hover:border-[#10B981]/30 transition-all duration-500 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] mb-4 border border-[#10B981]/10 group-hover:bg-[#10B981]/20 transition-all">
                {iconMap[cat.icon]}
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1 group-hover:text-[#10B981] transition-colors">
                {cat.label}
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">{cat.desc}</p>
            </GlassCard>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

// ─── CÓMO FUNCIONA ──────────────────────────
const HowItWorks = () => (
  <section className="py-24 px-6 bg-[#080C20]">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">Proceso simple</p>
        <h2 className="text-3xl md:text-4xl font-light text-white uppercase tracking-tight">
          Tres pasos para tu <span className="text-[#10B981] font-normal">primera sesión</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {HOW_IT_WORKS_STEPS.map((step, i) => (
          <div key={i} className="relative">
            {i < HOW_IT_WORKS_STEPS.length - 1 && (
              <div className="hidden md:block absolute top-8 left-full w-full h-px bg-[#10B981]/10 z-0" />
            )}
            <GlassCard className="p-8 border-white/5 relative z-10">
              <span className="text-4xl font-black text-[#10B981]/20 block mb-4">{step.step}</span>
              <h3 className="text-base font-bold text-white uppercase tracking-wider mb-3">{step.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-light">{step.desc}</p>
            </GlassCard>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          to="/como-funciona"
          className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#10B981] border-b border-[#10B981]/30 pb-1 hover:border-[#10B981] transition-all"
        >
          Ver explicación completa →
        </Link>
      </div>
    </div>
  </section>
);

// ─── CTA FINAL ──────────────────────────────
const CTASection = () => (
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
          ¿Eres experto en tu área? <br />
          <span className="text-[#10B981] font-normal">Monetiza tu conocimiento</span>
        </h2>
        <p className="text-slate-400 text-base leading-relaxed mb-10 font-light max-w-xl mx-auto">
          Crea tu perfil, define tus tarifas y empieza a recibir clientes esta semana.
          Sin complicaciones, sin burocracia.
        </p>
        <Link
          to="/registro"
          className="inline-flex items-center gap-2 px-10 py-4 bg-[#10B981] text-[#0A0E27] font-bold rounded-full hover:bg-[#0ea371] transition-all uppercase tracking-[0.15em] text-[11px] group"
        >
          Crear mi perfil de asesor
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </GlassCard>
    </div>
  </section>
);

// ─── PÁGINA COMPLETA ────────────────────────
const HomePage = () => (
  <>
    <Hero />
    <StatsBar />
    <Categories />
    <HowItWorks />
    <CTASection />
  </>
);

export default HomePage;