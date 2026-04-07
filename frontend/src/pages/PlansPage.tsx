import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Zap, Star, Shield, Clock, ArrowRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PLANS = [
  {
    id: 'sesion_inicial',
    name: 'Sesión Inicial',
    badge: null,
    price: 19,
    period: 'pago único',
    description: 'Perfecta para conocer al asesor y evaluar si es la guía que necesitas.',
    priceId: import.meta.env.VITE_STRIPE_PRICE_INICIAL,
    color: 'blue',
    duration: '30 minutos',
    features: [
      'Sesión de 30 minutos con el asesor',
      'Diagnóstico inicial de tu situación',
      'Plan de acción básico',
      'Acceso al chat con el asesor por 24 horas',
      'Resumen de la sesión por escrito',
    ],
    notIncluded: [
      'Seguimiento post-sesión',
      'Materiales y recursos adicionales',
      'Sesiones de seguimiento',
    ],
  },
  {
    id: 'plan_completo',
    name: 'Plan Completo',
    badge: 'Más popular',
    price: 149,
    period: 'pago único',
    description: 'Acceso completo a todo lo que el asesor puede ofrecerte para transformar tu situación.',
    priceId: import.meta.env.VITE_STRIPE_PRICE_COMPLETO,
    color: 'green',
    duration: '4 sesiones',
    features: [
      '4 sesiones completas de 60 minutos',
      'Diagnóstico profundo y estrategia personalizada',
      'Plan de acción detallado y priorizado',
      'Chat directo con el asesor por 30 días',
      'Materiales, recursos y plantillas exclusivas',
      'Seguimiento y ajuste del plan mensual',
      'Grabación de cada sesión disponible',
      'Acceso a la comunidad privada de clientes',
    ],
    notIncluded: [],
  },
];

const FAQ_ITEMS = [
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí. Los pagos son únicos y no hay compromisos de renovación automática. Tú decides cuándo volver a contratar.',
  },
  {
    q: '¿Cómo se realizan las sesiones?',
    a: 'Todas las sesiones se realizan por videollamada. Recibirás el enlace de acceso directamente en tu correo una vez confirmada la reserva.',
  },
  {
    q: '¿Qué métodos de pago aceptan?',
    a: 'Aceptamos tarjetas de crédito y débito internacionales (Visa, Mastercard, American Express) procesadas de forma segura a través de Stripe.',
  },
  {
    q: '¿Puedo empezar con la Sesión Inicial y luego pasar al Plan Completo?',
    a: 'Absolutamente. Muchos clientes comienzan con la Sesión Inicial para conocer al asesor y luego escalan al Plan Completo. El valor pagado en la Sesión Inicial se descuenta del Plan Completo.',
  },
  {
    q: '¿Cómo se protege mi información de pago?',
    a: 'Todos los pagos son procesados por Stripe, líder mundial en pagos digitales con certificación PCI DSS nivel 1. Axioma nunca almacena los datos de tu tarjeta.',
  },
];

const FAQItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="border-b border-gray-200 last:border-0 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between py-5 gap-4">
        <p className="text-gray-800 text-sm font-medium">{q}</p>
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

const PlansPage = () => {
  const navigate = useNavigate();
  const { advisorId, sessionId } = useParams();
  const { user, profile } = useAuth();

  const handleSelectPlan = (plan: typeof PLANS[0]) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/checkout/${plan.id}/${advisorId || 'general'}/${sessionId || 'none'}`);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* HEADER */}
      <div className="bg-[#0A0E27] border-b border-[#10B981]/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="Axioma" className="w-8 h-8 object-contain" />
            <div>
              <p className="font-black tracking-tighter uppercase text-base leading-none text-white">AXIOMA</p>
              <p className="text-[#10B981] text-[7px] font-bold tracking-[0.4em] uppercase">VENTURES INTELLIGENCE</p>
            </div>
          </a>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[#10B981]" />
            <span className="text-slate-400 text-xs">Pago 100% seguro con Stripe</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* TITULO */}
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
            <Zap size={12} />
            Elige tu plan
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0A0E27] mb-4 leading-tight">
            Invierte en tu crecimiento<br />
            <span className="text-[#10B981]">desde hoy mismo</span>
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto leading-relaxed">
            Comienza con una sesión inicial para conocer al asesor, o accede directamente al plan completo y desbloquea todo el potencial de la consultoría.
          </p>
        </div>

        {/* GARANTIA BADGE */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-6 px-6 py-3 bg-gray-50 rounded-full border border-gray-200">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-[#10B981]" />
              <span className="text-gray-600 text-xs font-medium">Pagos seguros</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <Star size={14} className="text-[#10B981]" />
              <span className="text-gray-600 text-xs font-medium">Asesores verificados</span>
            </div>
            <div className="w-px h-4 bg-gray-300" />
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#10B981]" />
              <span className="text-gray-600 text-xs font-medium">Respuesta en 24h</span>
            </div>
          </div>
        </div>

        {/* PLANES */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 p-8 transition-all duration-300 ${plan.badge
                ? 'border-[#10B981] shadow-lg shadow-[#10B981]/10'
                : 'border-gray-200 hover:border-[#10B981]/40'
                }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-[#10B981] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${plan.color === 'green' ? 'bg-[#10B981]/10' : 'bg-blue-50'
                    }`}>
                    {plan.color === 'green'
                      ? <Star size={16} className="text-[#10B981]" />
                      : <Zap size={16} className="text-blue-500" />
                    }
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${plan.color === 'green' ? 'text-[#10B981]' : 'text-blue-500'
                    }`}>
                    {plan.name}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-black text-[#0A0E27]">${plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${plan.color === 'green'
                  ? 'bg-[#10B981]/10 text-[#10B981]'
                  : 'bg-blue-50 text-blue-600'
                  }`}>
                  <Clock size={11} />
                  {plan.duration}
                </div>

                <p className="text-gray-500 text-sm leading-relaxed mt-4">{plan.description}</p>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${plan.color === 'green' ? 'bg-[#10B981]/10' : 'bg-blue-50'
                      }`}>
                      <Check size={11} className={plan.color === 'green' ? 'text-[#10B981]' : 'text-blue-500'} />
                    </div>
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 opacity-40">
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-px bg-gray-400 rounded" />
                    </div>
                    <span className="text-gray-400 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.15em] text-[11px] flex items-center justify-center gap-2 transition-all group ${plan.badge
                  ? 'bg-[#10B981] text-white hover:bg-[#0ea371]'
                  : 'bg-[#0A0E27] text-white hover:bg-[#0A0E27]/90'
                  }`}
              >
                Comenzar con {plan.name}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* DESCUENTO UPGRADE */}
        <div className="bg-gradient-to-r from-[#0A0E27] to-[#1a2040] rounded-2xl p-8 mb-16 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#10B981]/20 text-[#10B981] text-[10px] font-bold uppercase tracking-widest mb-4">
            Oferta especial
          </span>
          <h3 className="text-white font-bold text-xl mb-2">
            ¿Ya hiciste tu Sesión Inicial?
          </h3>
          <p className="text-white/60 text-sm mb-6 max-w-lg mx-auto">
            El valor de tu sesión inicial se descuenta automáticamente al contratar el Plan Completo. Paga solo la diferencia.
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Sesión inicial</p>
              <p className="text-white font-bold text-lg line-through opacity-50">$19</p>
            </div>
            <div className="text-[#10B981] text-2xl font-bold">+</div>
            <div className="text-center">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Diferencia</p>
              <p className="text-white font-bold text-lg">$130</p>
            </div>
            <div className="text-[#10B981] text-2xl font-bold">=</div>
            <div className="text-center">
              <p className="text-[#10B981] text-xs uppercase tracking-wider font-bold mb-1">Plan Completo</p>
              <p className="text-[#10B981] font-black text-2xl">$149</p>
            </div>
          </div>
        </div>

        {/* METODOS DE PAGO */}
        <div className="text-center mb-16">
          <p className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-6">
            Métodos de pago aceptados
          </p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['VISA', 'MASTERCARD', 'AMEX', 'STRIPE'].map((method) => (
              <div key={method} className="px-5 py-2.5 border border-gray-200 rounded-lg bg-white">
                <span className="text-gray-600 text-xs font-bold tracking-wider">{method}</span>
              </div>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-4 flex items-center justify-center gap-2">
            <Shield size={12} className="text-[#10B981]" />
            Transacciones cifradas con SSL de 256 bits
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-[#0A0E27] text-center mb-8">
            Preguntas frecuentes
          </h2>
          <div className="bg-white border border-gray-200 rounded-2xl px-8">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PlansPage;
