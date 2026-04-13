import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Calendar, Video, Star, Shield, Zap, Users, ArrowRight,
  ChevronDown, CheckCircle, DollarSign,
} from 'lucide-react';

// ── Animación fade-up (igual que homepage) ─────────────────
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

// ── Datos ──────────────────────────────────────────────────
const STEPS_CLIENT = [
  {
    step: '01', icon: Search, color: '#0F4C35',
    title: 'Explora el catálogo',
    desc: 'Navega por más de 200 asesores verificados. Filtra por especialidad, precio o disponibilidad para encontrar el perfil que mejor se adapta a lo que necesitas.',
    detail: 'Puedes ver el perfil completo de cada asesor, sus especialidades, tarifas, reseñas de otros clientes y su disponibilidad en tiempo real antes de tomar cualquier decisión.',
  },
  {
    step: '02', icon: Calendar, color: '#1A237E',
    title: 'Reserva tu sesión',
    desc: 'Elige el servicio y el horario que mejor se adapte a tu agenda. El proceso de reserva toma menos de 2 minutos.',
    detail: 'Selecciona entre los distintos servicios que ofrece el asesor — sesiones individuales, paquetes o retainers mensuales. El pago se procesa de forma segura a través de Stripe.',
  },
  {
    step: '03', icon: Video, color: '#4A148C',
    title: 'Conecta y asesórate',
    desc: 'Recibe el link de videollamada por email. Conéctate con tu asesor en el horario acordado y aprovecha al máximo tu sesión.',
    detail: 'Las sesiones se realizan por videollamada. Te recomendamos preparar tus preguntas y contexto con anticipación para maximizar el valor de cada minuto.',
  },
  {
    step: '04', icon: Star, color: '#E65100',
    title: 'Califica tu experiencia',
    desc: 'Al finalizar la sesión podrás dejar tu reseña. Tu opinión ayuda a mantener la calidad de la plataforma.',
    detail: 'Las calificaciones son verificadas — solo pueden opinar quienes completaron una sesión pagada. Esto garantiza que todas las reseñas sean auténticas y confiables.',
  },
];

const STEPS_ADVISOR = [
  {
    step: '01', icon: Users, color: '#0F4C35',
    title: 'Crea tu perfil',
    desc: 'Regístrate como asesor y completa tu perfil profesional. Define tus especialidades, experiencia y tarifas.',
    detail: 'Tu perfil es tu carta de presentación. Incluye tu bio, especialidades, servicios con precios y disponibilidad. Nuestro equipo lo revisa antes de publicarlo.',
  },
  {
    step: '02', icon: Shield, color: '#1A237E',
    title: 'Pasa la verificación',
    desc: 'Verificamos tu identidad y credenciales profesionales. Este proceso garantiza la confianza de los clientes.',
    detail: 'El proceso de verificación incluye validación de identidad y revisión de credenciales. Una vez aprobado recibirás el badge de asesor verificado en tu perfil.',
  },
  {
    step: '03', icon: Calendar, color: '#4A148C',
    title: 'Recibe solicitudes',
    desc: 'Los clientes encontrarán tu perfil y solicitarán sesiones. Tú confirmas o rechazas según tu disponibilidad.',
    detail: 'Recibes notificaciones por email cuando un cliente solicita una sesión. Tienes 24 horas para confirmar o rechazar. Si confirmas, el pago queda reservado.',
  },
  {
    step: '04', icon: Zap, color: '#006064',
    title: 'Cobra automáticamente',
    desc: 'Una vez completada la sesión, recibes el pago directo en tu cuenta. Sin burocracia, sin esperas.',
    detail: 'Usamos Stripe Connect para procesar los pagos. La plataforma retiene el 15% como comisión y el resto se transfiere a tu cuenta automáticamente al completar la sesión.',
  },
];

const FAQ = [
  {
    q: '¿Cómo se garantiza la calidad de los asesores?',
    a: 'Todos los asesores pasan por un proceso de verificación de identidad y credenciales antes de aparecer en la plataforma. Además, el sistema de reseñas verificadas permite a la comunidad mantener los estándares de calidad.',
  },
  {
    q: '¿Qué pasa si necesito cancelar una sesión?',
    a: 'Puedes cancelar hasta 24 horas antes de la sesión sin cargo. Cancelaciones con menos de 24 horas de anticipación pueden estar sujetas a la política de cancelación del asesor.',
  },
  {
    q: '¿Cómo funciona el pago?',
    a: 'Los pagos se procesan de forma segura a través de Stripe. El monto se reserva al confirmar la sesión y se libera al asesor una vez completada. Aceptamos tarjetas de crédito y débito internacionales.',
  },
  {
    q: '¿Puedo tener sesiones recurrentes con el mismo asesor?',
    a: 'Sí. Muchos asesores ofrecen paquetes mensuales o retainers que te permiten tener sesiones regulares con descuento. También puedes reservar sesiones individuales de forma recurrente.',
  },
  {
    q: '¿En qué idiomas están disponibles los asesores?',
    a: 'La mayoría de nuestros asesores hablan español e inglés. Algunos también hablan portugués u otros idiomas. Puedes ver los idiomas de cada asesor en su perfil.',
  },
  {
    q: '¿Cuánto cobra la plataforma a los asesores?',
    a: 'Axioma retiene el 15% de cada sesión completada como comisión de plataforma. Adicionalmente los asesores tienen una suscripción mensual según el plan que elijan.',
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0 cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between py-5 gap-4">
        <p className="text-gray-800 text-sm font-semibold">{q}</p>
        <ChevronDown
          size={16}
          className={`text-[#10B981] flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && (
        <p className="text-gray-500 text-sm leading-relaxed pb-5">{a}</p>
      )}
    </div>
  );
};

// ── Página ─────────────────────────────────────────────────
const HowItWorksPage = () => {
  const [activeRole, setActiveRole] = useState<'cliente' | 'asesor'>('cliente');
  const steps = activeRole === 'cliente' ? STEPS_CLIENT : STEPS_ADVISOR;

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ═══ HERO ═══════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Fondos */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(10,14,39,0.04) 0%, transparent 70%)' }} />
          <div className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '28px 28px', opacity: 0.4 }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[#10B981]/8 border border-[#10B981]/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="text-[#10B981] text-[10px] font-bold tracking-[0.25em] uppercase">Proceso simple</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#0A0E27] leading-tight mb-5">
            Cómo funciona{' '}
            <span className="text-[#10B981]">Axioma</span>
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-xl mx-auto mb-10">
            Una plataforma diseñada para que conectar con un experto sea tan simple como reservar una cita médica.
          </p>

          {/* Selector Cliente / Asesor */}
          <div className="inline-flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
            <button
              onClick={() => setActiveRole('cliente')}
              className={`px-8 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                activeRole === 'cliente'
                  ? 'bg-white text-[#0A0E27] shadow-sm border border-gray-200'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Soy cliente
            </button>
            <button
              onClick={() => setActiveRole('asesor')}
              className={`px-8 py-3 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 ${
                activeRole === 'asesor'
                  ? 'bg-white text-[#0A0E27] shadow-sm border border-gray-200'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Soy asesor
            </button>
          </div>
        </div>
      </section>

      {/* ═══ PASOS — TIMELINE ════════════════════════════════ */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Línea vertical */}
            <div className="absolute left-[27px] top-0 bottom-0 w-px bg-gray-100 hidden md:block" />

            <div className="space-y-6">
              {steps.map((step, i) => (
                <FadeUp key={`${activeRole}-${i}`} delay={i * 100}>
                  <div className="flex gap-6 group">
                    {/* Número + ícono */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-2 relative z-10">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100 transition-all group-hover:shadow-md group-hover:-translate-y-0.5"
                        style={{ backgroundColor: step.color }}>
                        <step.icon size={20} className="text-white" />
                      </div>
                      <span className="text-[10px] font-black text-gray-300">{step.step}</span>
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all">
                      <h3 className="font-bold text-[#0A0E27] text-base mb-2">{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{step.desc}</p>
                      <p className="text-gray-400 text-xs leading-relaxed border-t border-gray-50 pt-3">{step.detail}</p>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ GARANTÍAS ══════════════════════════════════════ */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase mb-3">Nuestro compromiso</p>
              <h2 className="text-2xl md:text-3xl font-black text-[#0A0E27]">
                Lo que garantizamos
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: Shield,
                title: 'Asesores verificados',
                desc: 'Cada profesional pasa por un proceso riguroso de verificación de identidad y credenciales antes de publicar su perfil.',
                color: '#0F4C35',
              },
              {
                icon: DollarSign,
                title: 'Pagos seguros',
                desc: 'Todos los pagos se procesan a través de Stripe con cifrado de nivel bancario. Tu información financiera nunca toca nuestros servidores.',
                color: '#1A237E',
              },
              {
                icon: CheckCircle,
                title: 'Reseñas auténticas',
                desc: 'Solo los clientes que completaron una sesión pagada pueden dejar una reseña. Cero reseñas falsas, cero manipulación.',
                color: '#4A148C',
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 120}>
                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: item.color }}>
                    <item.icon size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-[#0A0E27] text-sm mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <FadeUp>
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase mb-3">Preguntas frecuentes</p>
              <h2 className="text-2xl md:text-3xl font-black text-[#0A0E27] mb-3">
                Resolvemos tus dudas
              </h2>
              <p className="text-gray-500 text-sm">Todo lo que necesitas saber antes de empezar.</p>
            </div>
          </FadeUp>

          <FadeUp delay={100}>
            <div className="bg-white border border-gray-100 rounded-2xl px-8 shadow-sm">
              {FAQ.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <div className="relative bg-[#0A0E27] rounded-3xl p-12 text-center overflow-hidden">
              {/* Fondo decorativo */}
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

              <div className="relative">
                <span className="inline-block text-[10px] font-bold tracking-[0.3em] text-[#10B981] uppercase mb-4">
                  {activeRole === 'cliente' ? 'Para clientes' : 'Para asesores'}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
                  ¿Listo para empezar?
                </h2>
                <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
                  {activeRole === 'cliente'
                    ? 'Encuentra tu asesor ideal y reserva tu primera sesión hoy. Sesión inicial desde $19.'
                    : 'Crea tu perfil y empieza a recibir clientes esta semana. Sin costo de registro.'
                  }
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    to={activeRole === 'cliente' ? '/asesores' : '/registro'}
                    className="inline-flex items-center gap-2 bg-[#10B981] text-[#0A0E27] font-black px-8 py-4 rounded-full text-xs uppercase tracking-wider hover:bg-[#0ea371] transition-all group"
                  >
                    {activeRole === 'cliente' ? 'Explorar asesores' : 'Crear mi perfil'}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/asesores"
                    className="inline-flex items-center gap-2 border border-white/20 text-white font-bold px-8 py-4 rounded-full text-xs uppercase tracking-wider hover:bg-white/5 transition-all"
                  >
                    Ver asesores
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

export default HowItWorksPage;
