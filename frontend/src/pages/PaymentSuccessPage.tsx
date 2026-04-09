import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, MessageCircle, Download, ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const SUPABASE_URL = 'https://bcwsygdipoyrhonzqyvg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_CL_mM0jG6uwrxRt2_IeRnA_uoButs_y';

const PLAN_INFO = {
  sesion_inicial: {
    name: 'Sesión Inicial',
    price: 19,
    duration: '30 minutos',
    features: [
      'Sesión de 30 minutos con tu asesor',
      'Diagnóstico inicial de tu situación',
      'Plan de acción básico',
      'Acceso al chat por 24 horas',
      'Resumen de la sesión por escrito',
    ],
  },
  plan_completo: {
    name: 'Plan Completo',
    price: 149,
    duration: '4 sesiones de 60 min',
    features: [
      '4 sesiones completas de 60 minutos',
      'Estrategia personalizada y plan de acción',
      'Chat directo por 30 días',
      'Materiales y recursos exclusivos',
      'Seguimiento mensual incluido',
      'Grabación de cada sesión',
    ],
  },
};

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const [advisor, setAdvisor] = useState<any>(null);
  const [done, setDone] = useState(false);
  // Ref prevents double-execution in StrictMode / auth re-renders
  const savingRef = useRef(false);

  const planType = searchParams.get('plan') || 'sesion_inicial';
  const advisorId = searchParams.get('advisor');
  const stripeSessionId = searchParams.get('session_id');

  const plan = PLAN_INFO[planType as keyof typeof PLAN_INFO];

  // Load advisor data first, then run save
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      // Fetch advisor if present
      let advisorData: any = null;
      if (advisorId && advisorId !== 'general' && advisorId !== 'null') {
        const { data } = await supabase
          .from('advisors')
          .select('*, profiles(full_name, avatar_url)')
          .eq('id', advisorId)
          .single();
        advisorData = data;
        setAdvisor(data);
      }

      // Guard: run save only once per page load
      if (savingRef.current) return;
      savingRef.current = true;

      await saveAll(advisorData);
      setDone(true);
    };

    init();
  }, [user]);

  const saveAll = async (advisorData: any) => {
    if (!user || !plan) return;

    const realAdvisorId = advisorId && advisorId !== 'general' && advisorId !== 'null' ? advisorId : null;

    // ── Idempotency: skip if this Stripe session was already processed ──
    if (stripeSessionId) {
      const { data: existing } = await supabase
        .from('payments')
        .select('id')
        .eq('stripe_session_id', stripeSessionId)
        .maybeSingle();
      if (existing) return; // Already processed
    }

    const expiresAt = new Date();
    if (planType === 'sesion_inicial') {
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // 1. Subscription
    await supabase.from('subscriptions').insert({
      client_id: user.id,
      advisor_id: realAdvisorId,
      plan_type: planType,
      status: 'activa',
      amount_paid: plan.price,
      expires_at: expiresAt.toISOString(),
    });

    // 2. Payment (amount in USD, not cents)
    await supabase.from('payments').insert({
      client_id: user.id,
      advisor_id: realAdvisorId,
      amount: plan.price,
      currency: 'usd',
      status: 'completado',
      plan_type: planType,
      stripe_session_id: stripeSessionId || null,
    });

    // 3. Session record so the advisor sees the incoming request
    if (realAdvisorId) {
      await supabase.from('sessions').insert({
        client_id: user.id,
        advisor_id: realAdvisorId,
        status: 'pendiente',
        price: plan.price,
      });

      // 4. Conversation (upsert — safe to call multiple times)
      await supabase.from('conversations').upsert(
        { client_id: user.id, advisor_id: realAdvisorId },
        { onConflict: 'client_id,advisor_id' }
      );
    }

    // 5. Notification al cliente
    await supabase.from('notifications').insert({
      user_id: user.id,
      message: realAdvisorId
        ? `Tu ${plan.name} fue activado. Ya puedes chatear con tu asesor desde Mensajes.`
        : `Tu ${plan.name} fue activado correctamente.`,
      type: 'pago',
    });

    // 6. Email de confirmación
    await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({
        type: 'pago',
        to: profile?.email || user.email,
        name: profile?.full_name || 'Cliente',
        planName: plan.name,
        price: plan.price,
        advisorName: advisorData?.profiles?.full_name || 'Asesor Axioma',
        duration: plan.duration,
      }),
    });
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Cliente';
  const today = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-[#0A0E27] border-b border-[#10B981]/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="Axioma" className="w-8 h-8 object-contain" />
            <div>
              <p className="font-black tracking-tighter uppercase text-base leading-none text-white">AXIOMA</p>
              <p className="text-[#10B981] text-[7px] font-bold tracking-[0.4em] uppercase">VENTURES INTELLIGENCE</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <CheckCircle size={14} className="text-[#10B981]" />
            <span className="text-gray-500 text-xs font-medium">Pago confirmado</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* CONFIRMACIÓN */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full bg-[#10B981]/10 border-4 border-[#10B981]/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={36} className="text-[#10B981]" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0A0E27] mb-2">
            ¡Pago confirmado, {firstName}!
          </h1>
          <p className="text-gray-500 text-base">
            Tu {plan?.name} está activo. Revisa tu correo para más detalles.
          </p>
        </div>

        {/* RESUMEN DEL PLAN */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
          <div className="bg-[#0A0E27] px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Plan activo</p>
              <p className="text-white font-bold text-lg">{plan?.name}</p>
            </div>
            <div className="text-right">
              <p className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Total pagado</p>
              <p className="text-[#10B981] font-black text-2xl">${plan?.price}.00</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Calendar size={20} className="text-[#10B981] mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-1">Fecha</p>
                <p className="text-gray-800 text-xs font-bold">{today}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Clock size={20} className="text-[#10B981] mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-1">Duración</p>
                <p className="text-gray-800 text-xs font-bold">{plan?.duration}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl col-span-2 md:col-span-1">
                <Shield size={20} className="text-[#10B981] mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-1">Estado</p>
                <p className="text-[#10B981] text-xs font-bold">Activo</p>
              </div>
            </div>

            {/* LO QUE INCLUYE */}
            <div className="border-t border-gray-100 pt-6">
              <p className="text-sm font-semibold text-gray-500 mb-4">Tu plan incluye</p>
              <div className="space-y-2.5">
                {plan?.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={11} className="text-[#10B981]" />
                    </div>
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ASESOR ASIGNADO */}
            {advisor && (
              <div className="border-t border-gray-100 pt-6 mt-6">
                <p className="text-sm font-semibold text-gray-500 mb-4">Tu asesor</p>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base overflow-hidden"
                    style={{ backgroundColor: '#0F4C35' }}>
                    {advisor.profiles?.avatar_url
                      ? <img src={advisor.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (advisor.profiles?.full_name?.[0] || 'A')}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-bold">{advisor.profiles?.full_name}</p>
                    <p className="text-gray-400 text-xs">{advisor.title}</p>
                  </div>
                  {advisor.total_reviews > 0 && (
                    <div className="flex items-center gap-1">
                      <Star size={13} className="text-[#10B981] fill-[#10B981]" />
                      <span className="text-gray-700 text-sm font-bold">{advisor.rating?.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PRÓXIMOS PASOS */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <p className="text-sm font-semibold text-gray-500 mb-5">Próximos pasos</p>
          <div className="space-y-4">
            {[
              {
                icon: Calendar,
                title: 'Agenda tu primera sesión',
                desc: 'Accede a tu dashboard y coordina con tu asesor el horario de tu primera sesión.',
                action: 'Ir al dashboard',
                link: '/dashboard/cliente',
              },
              {
                icon: MessageCircle,
                title: 'Prepara tus preguntas',
                desc: 'Anota los temas más importantes que quieres abordar para aprovechar al máximo cada sesión.',
                action: null,
                link: null,
              },
              {
                icon: Download,
                title: 'Revisa tu correo',
                desc: 'Te enviamos un resumen de tu plan y los próximos pasos directamente a tu bandeja de entrada.',
                action: null,
                link: null,
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                  <step.icon size={18} className="text-[#10B981]" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 font-bold text-sm mb-0.5">{step.title}</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
                </div>
                {step.link && (
                  <Link to={step.link}
                    className="text-[#10B981] text-xs font-bold hover:opacity-80 transition-opacity flex items-center gap-1 flex-shrink-0">
                    {step.action} <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/dashboard/cliente"
            className="flex-1 bg-[#10B981] text-white font-black py-4 rounded-xl uppercase tracking-[0.1em] text-[11px] flex items-center justify-center gap-2 hover:bg-[#0ea371] transition-all">
            Ir a mi dashboard <ArrowRight size={14} />
          </Link>
          <Link to="/asesores"
            className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-4 rounded-xl uppercase tracking-[0.1em] text-[11px] flex items-center justify-center hover:border-gray-300 transition-all">
            Explorar más asesores
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccessPage;
