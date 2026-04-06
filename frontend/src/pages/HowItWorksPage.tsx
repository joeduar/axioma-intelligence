import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Video, Star, Shield, Zap, Users, ArrowRight, ChevronDown } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const STEPS_CLIENT = [
  {
    step: '01',
    icon: Search,
    title: 'Explora el catalogo',
    desc: 'Navega por mas de 200 asesores verificados. Filtra por especialidad, precio o disponibilidad para encontrar el perfil que mejor se adapta a lo que necesitas.',
    detail: 'Puedes ver el perfil completo de cada asesor, sus especialidades, tarifas, resenas de otros clientes y su disponibilidad en tiempo real antes de tomar cualquier decision.',
  },
  {
    step: '02',
    icon: Calendar,
    title: 'Reserva tu sesion',
    desc: 'Elige el servicio y el horario que mejor se adapte a tu agenda. El proceso de reserva toma menos de 2 minutos.',
    detail: 'Selecciona entre los distintos servicios que ofrece el asesor — sesiones individuales, paquetes o retainers mensuales. El pago se procesa de forma segura a traves de Stripe.',
  },
  {
    step: '03',
    icon: Video,
    title: 'Conecta y asesorate',
    desc: 'Recibe el link de videollamada por email. Conectate con tu asesor en el horario acordado y aprovecha al maximo tu sesion.',
    detail: 'Las sesiones se realizan por videollamada. Te recomendamos preparar tus preguntas y contexto con anticipacion para maximizar el valor de cada minuto.',
  },
  {
    step: '04',
    icon: Star,
    title: 'Califica tu experiencia',
    desc: 'Al finalizar la sesion podras dejar tu resena. Tu opinion ayuda a mantener la calidad de la plataforma.',
    detail: 'Las calificaciones son verificadas — solo pueden opinar quienes completaron una sesion pagada. Esto garantiza que todas las resenas sean autenticas y confiables.',
  },
];

const STEPS_ADVISOR = [
  {
    step: '01',
    icon: Users,
    title: 'Crea tu perfil',
    desc: 'Registrate como asesor y completa tu perfil profesional. Define tus especialidades, experiencia y tarifas.',
    detail: 'Tu perfil es tu carta de presentacion. Incluye tu bio, especialidades, servicios con precios y disponibilidad. Nuestro equipo lo revisa antes de publicarlo.',
  },
  {
    step: '02',
    icon: Shield,
    title: 'Pasa la verificacion',
    desc: 'Verificamos tu identidad y credenciales profesionales. Este proceso garantiza la confianza de los clientes.',
    detail: 'El proceso de verificacion incluye validacion de identidad y revision de credenciales. Una vez aprobado recibiras el badge de asesor verificado en tu perfil.',
  },
  {
    step: '03',
    icon: Calendar,
    title: 'Recibe solicitudes',
    desc: 'Los clientes encontraran tu perfil y solicitaran sesiones. Tu confirmas o rechazas segun tu disponibilidad.',
    detail: 'Recibes notificaciones por email cuando un cliente solicita una sesion. Tienes 24 horas para confirmar o rechazar. Si confirmas, el pago queda reservado.',
  },
  {
    step: '04',
    icon: Zap,
    title: 'Cobra automaticamente',
    desc: 'Una vez completada la sesion, recibes el pago directo en tu cuenta. Sin burocracia, sin esperas.',
    detail: 'Usamos Stripe Connect para procesar los pagos. La plataforma retiene el 15% como comision y el resto se transfiere a tu cuenta automaticamente al completar la sesion.',
  },
];

const FAQ = [
  {
    q: 'Como se garantiza la calidad de los asesores?',
    a: 'Todos los asesores pasan por un proceso de verificacion de identidad y credenciales antes de aparecer en la plataforma. Ademas el sistema de resenas verificadas permite a la comunidad mantener los estandares de calidad.',
  },
  {
    q: 'Que pasa si necesito cancelar una sesion?',
    a: 'Puedes cancelar hasta 24 horas antes de la sesion sin cargo. Cancelaciones con menos de 24 horas de anticipacion pueden estar sujetas a la politica de cancelacion del asesor.',
  },
  {
    q: 'Como funciona el pago?',
    a: 'Los pagos se procesan de forma segura a traves de Stripe. El monto se reserva al confirmar la sesion y se libera al asesor una vez completada. Aceptamos tarjetas de credito y debito internacionales.',
  },
  {
    q: 'Puedo tener sesiones recurrentes con el mismo asesor?',
    a: 'Si. Muchos asesores ofrecen paquetes mensuales o retainers que te permiten tener sesiones regulares con descuento. Tambien puedes reservar sesiones individuales de forma recurrente.',
  },
  {
    q: 'En que idiomas estan disponibles los asesores?',
    a: 'La mayoria de nuestros asesores hablan espanol e ingles. Algunos tambien hablan portugues u otros idiomas. Puedes ver los idiomas de cada asesor en su perfil.',
  },
  {
    q: 'Cuanto cobra la plataforma a los asesores?',
    a: 'Axioma retiene el 15% de cada sesion completada como comision de plataforma. Adicionalmente los asesores tienen una suscripcion mensual segun el plan que elijan.',
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-white/5 last:border-0 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between py-5 gap-4">
        <p className="text-white text-sm font-medium">{q}</p>
        <ChevronDown
          size={16}
          className={`text-[#10B981] flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && (
        <p className="text-slate-400 text-sm leading-relaxed font-light pb-5">
          {a}
        </p>
      )}
    </div>
  );
};

const HowItWorksPage = () => {
  const [activeRole, setActiveRole] = useState<'cliente' | 'asesor'>('cliente');

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">
            Proceso simple
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-tight mb-4">
            Como funciona <span className="text-[#10B981] font-normal">Axioma</span>
          </h1>
          <p className="text-slate-500 text-sm font-light max-w-xl mx-auto leading-relaxed">
            Una plataforma disenada para que conectar con un experto sea tan simple como reservar una cita.
          </p>
        </div>

        {/* SELECTOR CLIENTE / ASESOR */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveRole('cliente')}
              className={`px-8 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeRole === 'cliente'
                  ? 'bg-[#10B981] text-[#0A0E27]'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Soy cliente
            </button>
            <button
              onClick={() => setActiveRole('asesor')}
              className={`px-8 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeRole === 'asesor'
                  ? 'bg-[#10B981] text-[#0A0E27]'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Soy asesor
            </button>
          </div>
        </div>

        {/* PASOS */}
        <div className="space-y-4 mb-20">
          {(activeRole === 'cliente' ? STEPS_CLIENT : STEPS_ADVISOR).map((step, i) => (
            <GlassCard key={i} className="p-8 border-white/5">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                    <step.icon size={20} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[#10B981]/30 font-black text-2xl">{step.step}</span>
                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">{step.desc}</p>
                  <p className="text-slate-500 text-xs leading-relaxed font-light">{step.detail}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">
              Preguntas frecuentes
            </p>
            <h2 className="text-2xl md:text-3xl font-light text-white uppercase tracking-tight">
              Resolvemos tus <span className="text-[#10B981] font-normal">dudas</span>
            </h2>
          </div>
          <GlassCard className="px-8 border-white/5">
            {FAQ.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </GlassCard>
        </div>

        {/* CTA */}
        <GlassCard className="p-12 border-[#10B981]/10 text-center">
          <h2 className="text-2xl font-light text-white uppercase tracking-tight mb-4">
            Listo para <span className="text-[#10B981] font-normal">empezar?</span>
          </h2>
          <p className="text-slate-500 text-sm font-light mb-8 max-w-md mx-auto">
            {activeRole === 'cliente'
              ? 'Encuentra tu asesor ideal y reserva tu primera sesion hoy.'
              : 'Crea tu perfil y empieza a recibir clientes esta semana.'
            }
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to={activeRole === 'cliente' ? '/asesores' : '/registro'}
              className="inline-flex items-center gap-2 bg-[#10B981] text-[#0A0E27] font-black px-8 py-4 rounded-full text-[10px] uppercase tracking-wider hover:bg-[#0ea371] transition-all group"
            >
              {activeRole === 'cliente' ? 'Explorar asesores' : 'Crear mi perfil'}
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/asesores"
              className="inline-flex items-center gap-2 border border-white/20 text-white font-bold px-8 py-4 rounded-full text-[10px] uppercase tracking-wider hover:bg-white/5 transition-all"
            >
              Ver asesores
            </Link>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default HowItWorksPage;