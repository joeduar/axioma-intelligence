import React from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Zap, Shield, Brain, Users, ArrowRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const VALUES = [
  {
    icon: Shield,
    title: 'Confianza',
    desc: 'Verificamos cada asesor antes de publicar su perfil. La confianza no es un slogan, es nuestro proceso.',
  },
  {
    icon: Brain,
    title: 'Inteligencia',
    desc: 'Aplicamos tecnologia e IA para conectar mejor a quienes buscan orientacion con quienes pueden darla.',
  },
  {
    icon: Zap,
    title: 'Eficiencia',
    desc: 'Eliminamos la friccion del proceso. Encontrar, reservar y pagar una asesoria debe tomar minutos, no dias.',
  },
  {
    icon: Users,
    title: 'Comunidad',
    desc: 'Construimos una red de profesionales de alto nivel comprometidos con el crecimiento de sus clientes.',
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-16">
          <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">
            Nuestra esencia
          </p>
          <h1 className="text-3xl md:text-5xl font-light text-white uppercase tracking-tight leading-tight mb-6">
            Construimos el puente entre el conocimiento{' '}
            <span className="text-[#10B981] font-normal">y quienes lo necesitan</span>
          </h1>
          <p className="text-slate-400 text-base font-light leading-relaxed max-w-2xl">
            Axioma Ventures Intelligence nacio con una vision clara: democratizar el acceso a asesoria
            profesional de alto nivel, conectando expertos verificados con empresas y personas que
            buscan orientacion estrategica.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <GlassCard className="p-8 border-[#10B981]/10">
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] mb-5 border border-[#10B981]/20">
              <Target size={18} />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] mb-3">
              Nuestra mision
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-light">
              Conectar a profesionales expertos con quienes necesitan orientacion estrategica, creando
              un ecosistema de confianza donde el conocimiento se convierte en ventaja competitiva real.
            </p>
          </GlassCard>

          <GlassCard className="p-8 border-white/5">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white mb-5 border border-white/10">
              <Eye size={18} />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-3">
              Nuestra vision
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed font-light">
              Ser la plataforma de referencia en Latinoamerica para la conexion entre asesores
              profesionales y clientes, impulsada por inteligencia artificial y estandares de excelencia.
            </p>
          </GlassCard>
        </div>

        <div className="mb-16">
          <GlassCard className="p-10 border-white/5">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] mb-6">
              Nuestra historia
            </h2>
            <div className="space-y-4 text-slate-300 text-sm leading-relaxed font-light">
              <p>
                Axioma Ventures Intelligence C.A. es una empresa de tecnologia e inteligencia artificial
                fundada con el objetivo de transformar la forma en que las organizaciones y personas
                acceden a conocimiento experto.
              </p>
              <p>
                Comenzamos desarrollando soluciones de IA para empresas y entendimos que el mayor
                obstaculo para el crecimiento de muchas organizaciones no era la falta de recursos,
                sino la falta de orientacion estrategica oportuna.
              </p>
              <p>
                Esa observacion nos llevo a construir esta plataforma: un marketplace donde cualquier
                empresa o emprendedor puede conectar en minutos con el experto que necesita, en el area
                que necesita, al precio que puede pagar.
              </p>
              <p>
                Hoy combinamos nuestra capacidad tecnologica con una red creciente de asesores
                verificados para ofrecer la experiencia de consultoria mas accesible, eficiente y
                confiable del mercado.
              </p>
            </div>
          </GlassCard>
        </div>

        <div className="mb-16">
          <div className="mb-10">
            <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">
              Lo que nos define
            </p>
            <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-tight">
              Nuestros <span className="text-[#10B981] font-normal">valores</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {VALUES.map((value, i) => (
              <GlassCard key={i} className="p-7 border-white/5 group hover:border-[#10B981]/20 transition-all duration-500">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] flex-shrink-0 border border-[#10B981]/10 group-hover:bg-[#10B981]/20 transition-all">
                    <value.icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold uppercase tracking-wider text-sm mb-2 group-hover:text-[#10B981] transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed font-light">{value.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <GlassCard className="p-10 border-white/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: '200+', label: 'Asesores verificados' },
                { value: '8', label: 'Especialidades' },
                { value: '1,400+', label: 'Sesiones completadas' },
                { value: '4.9', label: 'Calificacion promedio' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl font-light text-white mb-1">{stat.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="mb-16">
          <div className="mb-8">
            <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">
              Hablemos
            </p>
            <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-tight">
              Contacto <span className="text-[#10B981] font-normal">directo</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <GlassCard className="p-7 border-white/5">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">
                Email
              </p>
              <a
                href="mailto:info@axiomaventures.com"
                className="text-white font-medium text-sm hover:text-[#10B981] transition-colors"
              >
                info@axiomaventures.com
              </a>
            </GlassCard>
            <GlassCard className="p-7 border-white/5">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-2">
                WhatsApp Business
              </p>
              <a
                href="https://wa.me/584241601430"
                target="_blank"
                rel="noreferrer"
                className="text-white font-medium text-sm hover:text-[#10B981] transition-colors"
              >
                +58 424 160 1430
              </a>
            </GlassCard>
          </div>
        </div>

        <GlassCard className="p-12 border-[#10B981]/10 text-center">
          <h2 className="text-2xl font-light text-white uppercase tracking-tight mb-4">
            Forma parte de <span className="text-[#10B981] font-normal">Axioma</span>
          </h2>
          <p className="text-slate-500 text-sm font-light mb-8 max-w-md mx-auto">
            Ya seas un profesional que quiere monetizar su conocimiento o alguien que busca
            orientacion experta, aqui tienes tu lugar.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/asesores"
              className="inline-flex items-center gap-2 bg-[#10B981] text-[#0A0E27] font-black px-8 py-4 rounded-full text-[10px] uppercase tracking-wider hover:bg-[#0ea371] transition-all group"
            >
              Explorar asesores
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/registro"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-bold px-8 py-4 rounded-full text-[10px] uppercase tracking-wider hover:bg-white/5 transition-all"
            >
              Registrarme como asesor
            </Link>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default AboutPage;
