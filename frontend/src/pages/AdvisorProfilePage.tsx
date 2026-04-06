import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, Shield, ArrowLeft, Calendar, MessageCircle, ChevronRight } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const MOCK_ADVISORS = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    title: 'CFO Independiente',
    category: 'Finanzas',
    rating: 4.9,
    reviews: 87,
    rate: 80,
    available: true,
    availability: 'Disponible hoy',
    initials: 'CM',
    color: '#0F4C35',
    bio: 'CFO con 15 anos de experiencia en empresas de tecnologia y retail. He liderado rondas de inversion Serie A y B, optimizacion de estructura de capital y transformacion financiera en compañias de 50 a 500 empleados.',
    experience: '15 anos de experiencia',
    sessions: '200+ sesiones',
    languages: 'Español, Ingles',
    tags: ['Flujo de caja', 'Inversiones', 'Startups', 'Fundraising', 'Modelos financieros'],
    services: [
      { name: 'Sesion estrategica 1h', price: 80, duration: '60 min', desc: 'Analisis de situacion financiera y hoja de ruta' },
      { name: 'Revision de modelo financiero', price: 150, duration: '90 min', desc: 'Auditoria y mejora de proyecciones y supuestos' },
      { name: 'Paquete mensual', price: 500, duration: '4 sesiones', desc: 'Acompañamiento continuo como CFO fractional' },
    ],
    reviews_list: [
      { author: 'Juan P.', rating: 5, text: 'Carlos me ayudo a estructurar el pitch financiero para nuestra Serie A. Claridad total.', date: 'Hace 2 semanas' },
      { author: 'Maria L.', rating: 5, text: 'Excelente asesor. Identifica problemas rapidamente y propone soluciones practicas.', date: 'Hace 1 mes' },
      { author: 'Roberto K.', rating: 4, text: 'Muy util la sesion para revisar nuestro modelo de costos. Lo recomiendo.', date: 'Hace 2 meses' },
    ],
  },
  {
    id: '2',
    name: 'Andrea Torres',
    title: 'Estratega de Negocios',
    category: 'Negocios',
    rating: 4.8,
    reviews: 124,
    rate: 95,
    available: false,
    availability: 'Disponible manana',
    initials: 'AT',
    color: '#1A237E',
    bio: 'Consultora de estrategia con foco en expansion de mercado y optimizacion operativa. He trabajado con mas de 80 empresas en Latinoamerica ayudandolas a escalar sus operaciones de forma sostenible.',
    experience: '12 anos de experiencia',
    sessions: '300+ sesiones',
    languages: 'Español, Ingles, Portugues',
    tags: ['Expansion', 'Operaciones', 'OKRs', 'Estrategia', 'Scaling'],
    services: [
      { name: 'Sesion de estrategia', price: 95, duration: '60 min', desc: 'Diagnostico y plan de accion para tu negocio' },
      { name: 'Workshop OKRs', price: 200, duration: '2h', desc: 'Definicion de objetivos y metricas clave' },
      { name: 'Retainer mensual', price: 600, duration: '4 sesiones', desc: 'Acompañamiento estrategico continuo' },
    ],
    reviews_list: [
      { author: 'Pedro M.', rating: 5, text: 'Andrea transformo la forma en que pensamos nuestra estrategia de expansion.', date: 'Hace 1 semana' },
      { author: 'Lucia F.', rating: 5, text: 'Increiblemente preparada. Cada sesion trae valor inmediato.', date: 'Hace 3 semanas' },
      { author: 'Carlos R.', rating: 4, text: 'Muy buen manejo del framework de OKRs. Lo aplicamos de inmediato.', date: 'Hace 1 mes' },
    ],
  },
  {
    id: '3', name: 'Luis Rojas', title: 'Data Scientist Senior', category: 'Datos & IA',
    rating: 5.0, reviews: 43, rate: 120, available: true, availability: 'Disponible hoy',
    initials: 'LR', color: '#4A148C',
    bio: 'Especialista en analisis de datos y modelos predictivos con experiencia en banca, retail y salud. Experto en Python, SQL y herramientas de BI como Power BI y Tableau.',
    experience: '10 anos de experiencia', sessions: '150+ sesiones', languages: 'Español, Ingles',
    tags: ['Machine Learning', 'Power BI', 'Python', 'SQL', 'Tableau'],
    services: [
      { name: 'Sesion de datos', price: 120, duration: '60 min', desc: 'Analisis de tu stack de datos y recomendaciones' },
      { name: 'Implementacion BI', price: 250, duration: '2h', desc: 'Diseño de dashboard y metricas clave' },
      { name: 'Paquete analitica', price: 700, duration: '4 sesiones', desc: 'Estrategia de datos end-to-end' },
    ],
    reviews_list: [
      { author: 'Ana G.', rating: 5, text: 'Luis es excepcional. Nos ayudo a construir nuestro primer modelo predictivo.', date: 'Hace 3 dias' },
      { author: 'Miguel T.', rating: 5, text: 'El mejor data scientist con quien he trabajado. Muy didactico.', date: 'Hace 2 semanas' },
      { author: 'Sofia P.', rating: 5, text: 'Transformo nuestros reportes de Excel en dashboards reales de BI.', date: 'Hace 1 mes' },
    ],
  },
  {
    id: '4', name: 'Maria Gonzalez', title: 'Abogada Corporativa', category: 'Legal',
    rating: 4.7, reviews: 61, rate: 110, available: true, availability: 'Disponible hoy',
    initials: 'MG', color: '#B71C1C',
    bio: 'Abogada especializada en derecho corporativo, contratos comerciales y compliance regulatorio. Amplia experiencia en M&A, estructuracion de sociedades y propiedad intelectual.',
    experience: '14 anos de experiencia', sessions: '180+ sesiones', languages: 'Español, Ingles',
    tags: ['Contratos', 'Compliance', 'M&A', 'Sociedades', 'IP'],
    services: [
      { name: 'Consulta legal', price: 110, duration: '60 min', desc: 'Orientacion legal para tu situacion especifica' },
      { name: 'Revision de contrato', price: 200, duration: '90 min', desc: 'Analisis y recomendaciones sobre contratos' },
      { name: 'Retainer legal', price: 650, duration: '4 sesiones', desc: 'Acompañamiento legal mensual' },
    ],
    reviews_list: [
      { author: 'Fernando B.', rating: 5, text: 'Maria nos salvo de firmar un contrato con clausulas muy desfavorables.', date: 'Hace 1 semana' },
      { author: 'Carmen V.', rating: 4, text: 'Muy profesional y clara en sus explicaciones legales.', date: 'Hace 1 mes' },
      { author: 'Jose A.', rating: 5, text: 'Excelente manejo del proceso de due diligence para nuestra adquisicion.', date: 'Hace 2 meses' },
    ],
  },
  {
    id: '5', name: 'Diego Paredes', title: 'Growth Marketing Lead', category: 'Marketing',
    rating: 4.6, reviews: 98, rate: 70, available: false, availability: 'Disponible manana',
    initials: 'DP', color: '#E65100',
    bio: 'Especialista en growth marketing con foco en adquisicion de usuarios, optimizacion de conversion y estrategias de contenido. He escalado marcas desde cero hasta millones de usuarios.',
    experience: '9 anos de experiencia', sessions: '250+ sesiones', languages: 'Español, Ingles',
    tags: ['SEO', 'Paid Media', 'Branding', 'Growth', 'Conversion'],
    services: [
      { name: 'Auditoria de marketing', price: 70, duration: '60 min', desc: 'Analisis de canales y estrategia actual' },
      { name: 'Plan de growth', price: 180, duration: '2h', desc: 'Estrategia completa de adquisicion y retencion' },
      { name: 'Mentoria mensual', price: 450, duration: '4 sesiones', desc: 'Acompañamiento en ejecucion de campanas' },
    ],
    reviews_list: [
      { author: 'Laura M.', rating: 5, text: 'Diego nos ayudo a triplicar nuestro trafico organico en 3 meses.', date: 'Hace 2 semanas' },
      { author: 'Andres C.', rating: 4, text: 'Muy practico y orientado a resultados. Recomendado.', date: 'Hace 1 mes' },
      { author: 'Isabel R.', rating: 5, text: 'Su estrategia de paid media fue clave para nuestro lanzamiento.', date: 'Hace 2 meses' },
    ],
  },
  {
    id: '6', name: 'Sofia Herrera', title: 'CTO Fractional', category: 'Tecnologia',
    rating: 4.9, reviews: 55, rate: 140, available: true, availability: 'Disponible hoy',
    initials: 'SH', color: '#006064',
    bio: 'CTO con experiencia liderando equipos de ingenieria en startups y scaleups. Experta en arquitectura de software, migracion a cloud y construccion de equipos tecnicos de alto rendimiento.',
    experience: '13 anos de experiencia', sessions: '160+ sesiones', languages: 'Español, Ingles',
    tags: ['Arquitectura', 'Cloud', 'DevOps', 'Equipos', 'AWS'],
    services: [
      { name: 'Tech review', price: 140, duration: '60 min', desc: 'Auditoria de arquitectura y stack tecnologico' },
      { name: 'Roadmap tecnologico', price: 300, duration: '2h', desc: 'Definicion de estrategia tecnica a 12 meses' },
      { name: 'CTO fractional', price: 800, duration: '4 sesiones', desc: 'Liderazgo tecnico mensual para tu empresa' },
    ],
    reviews_list: [
      { author: 'Marcos L.', rating: 5, text: 'Sofia nos ayudo a migrar a AWS sin interrumpir operaciones. Brillante.', date: 'Hace 1 semana' },
      { author: 'Patricia O.', rating: 5, text: 'Excelente vision estrategica. Transformo nuestro equipo de tech.', date: 'Hace 3 semanas' },
      { author: 'Ricardo N.', rating: 4, text: 'Muy buena guia para escalar nuestra infraestructura.', date: 'Hace 2 meses' },
    ],
  },
  {
    id: '7', name: 'Roberto Vargas', title: 'People & Culture Director', category: 'Recursos Humanos',
    rating: 4.8, reviews: 72, rate: 75, available: true, availability: 'Disponible hoy',
    initials: 'RV', color: '#1B5E20',
    bio: 'Director de People con experiencia en cultura organizacional, adquisicion de talento y diseno de sistemas de compensacion. He liderado HR en empresas de 20 a 2000 empleados.',
    experience: '11 anos de experiencia', sessions: '190+ sesiones', languages: 'Español',
    tags: ['Talent', 'Cultura', 'Compensacion', 'HR', 'Onboarding'],
    services: [
      { name: 'Sesion de People', price: 75, duration: '60 min', desc: 'Diagnostico de cultura y talento' },
      { name: 'Diseno de compensacion', price: 160, duration: '90 min', desc: 'Estructura salarial y beneficios' },
      { name: 'Retainer HR', price: 480, duration: '4 sesiones', desc: 'Acompañamiento mensual de People' },
    ],
    reviews_list: [
      { author: 'Daniela F.', rating: 5, text: 'Roberto nos ayudo a reducir el turnover de 40% a 15% en 6 meses.', date: 'Hace 2 semanas' },
      { author: 'Nicolas B.', rating: 4, text: 'Muy buen manejo de la estrategia de cultura. Practico y claro.', date: 'Hace 1 mes' },
      { author: 'Elena S.', rating: 5, text: 'El sistema de compensacion que diseno fue clave para retener talento.', date: 'Hace 2 meses' },
    ],
  },
  {
    id: '8', name: 'Valeria Castro', title: 'Startup Advisor & Investor', category: 'Startups',
    rating: 4.9, reviews: 39, rate: 150, available: false, availability: 'Disponible manana',
    initials: 'VC', color: '#880E4F',
    bio: 'Advisora de startups e inversora angel con portfolio de 25+ companias. Especialista en product-market fit, fundraising y estrategia de go-to-market para etapas pre-seed y seed.',
    experience: '10 anos de experiencia', sessions: '120+ sesiones', languages: 'Español, Ingles',
    tags: ['Fundraising', 'Pitch', 'Product', 'PMF', 'Go-to-market'],
    services: [
      { name: 'Sesion startup', price: 150, duration: '60 min', desc: 'Diagnostico de etapa y siguientes pasos' },
      { name: 'Prep de pitch', price: 300, duration: '2h', desc: 'Revision y mejora de pitch deck para inversores' },
      { name: 'Advisory mensual', price: 900, duration: '4 sesiones', desc: 'Acompañamiento estrategico de fundador' },
    ],
    reviews_list: [
      { author: 'Tomas R.', rating: 5, text: 'Valeria nos ayudo a cerrar nuestra ronda seed. Conexiones y conocimiento top.', date: 'Hace 1 semana' },
      { author: 'Gabriela M.', rating: 5, text: 'La mejor inversión que hice fue una hora con Valeria antes de hablar con VCs.', date: 'Hace 3 semanas' },
      { author: 'Sebastian L.', rating: 4, text: 'Muy clara sobre lo que los inversores quieren ver. Muy util.', date: 'Hace 2 meses' },
    ],
  },
];

const AdvisorProfilePage = () => {
  const { id } = useParams();
  const [selectedService, setSelectedService] = useState(0);

  const advisor = MOCK_ADVISORS.find((a) => a.id === id);

  if (!advisor) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 uppercase tracking-widest text-sm mb-4">Asesor no encontrado</p>
          <Link to="/asesores" className="text-[#10B981] text-[11px] font-bold uppercase tracking-wider">
            Volver al catalogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* BACK */}
        <Link
          to="/asesores"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-[11px] font-bold uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft size={14} /> Volver al catalogo
        </Link>

        <div className="grid lg:grid-cols-3 gap-8 lg:items-start">

          {/* COLUMNA IZQUIERDA */}
          <div className="lg:col-span-2 space-y-6">

            {/* HEADER DEL PERFIL */}
            <GlassCard className="p-8 border-white/5">
              <div className="flex items-start gap-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0"
                  style={{ backgroundColor: advisor.color }}
                >
                  {advisor.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">{advisor.name}</h1>
                      <p className="text-[#10B981] text-sm font-medium">{advisor.title}</p>
                      <p className="text-slate-500 text-xs mt-1">{advisor.category}</p>
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${advisor.available
                      ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
                      : 'bg-white/5 text-slate-500 border border-white/10'
                      }`}>
                      {advisor.availability}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="text-[#10B981] fill-[#10B981]" />
                      <span className="text-white font-bold text-sm">{advisor.rating}</span>
                      <span className="text-slate-500 text-xs">({advisor.reviews} resenas)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock size={13} />
                      <span className="text-xs">{advisor.sessions}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Shield size={13} className="text-[#10B981]" />
                      <span className="text-xs text-[#10B981]">Verificado</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* BIO */}
            <GlassCard className="p-8 border-white/5">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] mb-4">
                Acerca del asesor
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed font-light">{advisor.bio}</p>

              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
                {[
                  { label: 'Experiencia', value: advisor.experience },
                  { label: 'Sesiones', value: advisor.sessions },
                  { label: 'Idiomas', value: advisor.languages },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500 mb-1">{item.label}</p>
                    <p className="text-white text-xs font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* ESPECIALIDADES */}
            <GlassCard className="p-8 border-white/5">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] mb-5">
                Especialidades
              </h2>
              <div className="flex flex-wrap gap-2">
                {advisor.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-white/5 text-slate-300 rounded-lg border border-white/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </GlassCard>

            {/* RESEÑAS */}
            <GlassCard className="p-8 border-white/5">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] mb-6">
                Resenas de clientes
              </h2>
              <div className="space-y-5">
                {advisor.reviews_list.map((review, i) => (
                  <div key={i} className="pb-5 border-b border-white/5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                          {review.author[0]}
                        </div>
                        <span className="text-white text-xs font-bold">{review.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, s) => (
                          <Star key={s} size={10} className="text-[#10B981] fill-[#10B981]" />
                        ))}
                        <span className="text-slate-500 text-[9px] ml-2">{review.date}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed font-light">{review.text}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

          </div>

          {/* COLUMNA DERECHA — RESERVA */}
          <div className="space-y-5 lg:sticky lg:top-28 lg:self-start">

            <GlassCard className="p-6 border-[#10B981]/10">
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#10B981] mb-5">
                Reservar sesion
              </h2>

              {/* SERVICIOS */}
              <div className="space-y-3 mb-6">
                {advisor.services.map((service, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedService(i)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${selectedService === i
                      ? 'border-[#10B981]/40 bg-[#10B981]/5'
                      : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-white text-xs font-bold mb-1">{service.name}</p>
                        <p className="text-slate-500 text-[10px] leading-relaxed">{service.desc}</p>
                        <p className="text-slate-600 text-[9px] mt-1 uppercase tracking-wider">{service.duration}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-white font-bold text-sm">${service.price}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* PRECIO TOTAL */}
              <div className="flex items-center justify-between py-3 border-t border-white/5 mb-5">
                <span className="text-slate-400 text-xs uppercase tracking-wider">Total</span>
                <span className="text-white font-bold text-lg">
                  ${advisor.services[selectedService].price}
                </span>
              </div>

              {/* BOTONES */}
              <button className="w-full bg-[#10B981] text-[#0A0E27] font-black py-4 rounded-xl uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 hover:bg-[#0ea371] transition-all mb-3">
                <Calendar size={14} />
                Reservar sesion
              </button>

              <button className="w-full bg-white/5 border border-white/10 text-white font-bold py-3 rounded-xl uppercase tracking-[0.15em] text-[10px] flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                <MessageCircle size={14} />
                Enviar mensaje
              </button>

              <p className="text-center text-slate-600 text-[9px] uppercase tracking-wider mt-4">
                Pago seguro procesado por Stripe
              </p>
            </GlassCard>

            {/* BADGE DE CONFIANZA */}
            <GlassCard className="p-5 border-white/5">
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-xs font-bold mb-1">Plataforma verificada</p>
                  <p className="text-slate-500 text-[10px] leading-relaxed font-light">
                    Todos los asesores pasan por un proceso de verificacion de identidad y credenciales antes de aparecer en la plataforma.
                  </p>
                </div>
              </div>
            </GlassCard>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisorProfilePage;