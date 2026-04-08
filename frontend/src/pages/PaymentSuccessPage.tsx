import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, MessageCircle, Download, ArrowRight, Star, Shield, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

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
  const planType = searchParams.get('plan') || 'sesion_inicial';
  const advisorId = searchParams.get('advisor');
  const [advisor, setAdvisor] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  const plan = PLAN_INFO[planType as keyof typeof PLAN_INFO];

  useEffect(() => {
    if (advisorId && advisorId !== 'general') fetchAdvisor();
    if (user && !saved) saveSubscription();
  }, [user]);

  const fetchAdvisor = async () => {
    const { data } = await supabase
      .from('advisors')
      .select('*, profiles(full_name, avatar_url)')
      .eq('id', advisorId)
      .single();
    setAdvisor(data);
  };

  const saveSubscription = async () => {
    if (!user || !plan) return;
    setSaved(true);

    const expiresAt = new Date();
    if (planType === 'sesion_inicial') {
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    await supabase.from('subscriptions').insert({
      client_id: user.id,
      advisor_id: advisorId !== 'general' ? advisorId : null,
      plan_type: planType,
      status: 'activa',
      amount_paid: plan.price,
      expires_at: expiresAt.toISOString(),
    });

    await supabase.from('payments').insert({
      client_id: user.id,
      advisor_id: advisorId !== 'general' ? advisorId : null,
      amount: plan.price * 100,
      currency: 'usd',
      status: 'completado',
      plan_type: planType,
    });

    if (advisorId && advisorId !== 'general') {
      await supabase
        .from('conversations')
        .upsert({
          client_id: user.id,
          advisor_id: advisorId,
        }, { onConflict: 'client_id,advisor_id' });

      if (user.id) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          message: 'Tu plan fue activado. Ya puedes chatear con tu asesor desde Mensajes.',
          type: 'pago',
        });
      }
    }

    const planNames: Record<string, string> = {
      sesion_inicial: 'Sesion Inicial',
      plan_completo: 'Plan Completo',
    };
    const durations: Record<string, string> = {
      sesion_inicial: '30 minutos',
      plan_completo: '4 sesiones de 60 minutos',
    };

    const supabaseUrl = 'https://bcwsygdipoyrhonzqyvg.supabase.co';
    const supabaseKey = 'sb_publishable_CL_mM0jG6uwrxRt2_IeRnA_uoButs_y';

    await fetch(
      `${supabaseUrl}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          type: 'pago',
          to: profile?.email || user?.email,
          name: profile?.full_name || 'Cliente',
          planName: planNames[planType] || planType,
          price: plan?.price,
          advisorName: advisor?.profiles?.full_name || 'Asesor Axioma',
          duration: durations[planType] || '',
        }),
      }
    );
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'Cliente';
  const today = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

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

        {/* CONFIRMACION */}
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
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Fecha</p>
                <p className="text-gray-800 text-xs font-bold">{today}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <Clock size={20} className="text-[#10B981] mx-auto mb-2" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Duración</p>
                <p className="text-gray-800 text-xs font-bold">{plan?.duration}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl col-span-2 md:col-span-1">
                <Shield size={20} className="text-[#10B981] mx-auto mb-2" />
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-1">Estado</p>
                <p className="text-[#10B981] text-xs font-bold uppercase">Activo</p>
              </div>
            </div>

            {/* LO QUE INCLUYE */}
            <div className="border-t border-gray-100 pt-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                Tu plan incluye
              </p>
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
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                  Tu asesor
                </p>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-base overflow-hidden"
                    style={{ backgroundColor: '#0F4C35' }}
                  >
                    {advisor.profiles?.avatar_url ? (
                      <img src={advisor.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      advisor.profiles?.full_name?.[0] || 'A'
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-bold">{advisor.profiles?.full_name}</p>
                    <p className="text-gray-400 text-xs">{advisor.title}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={13} className="text-[#10B981] fill-[#10B981]" />
                    <span className="text-gray-700 text-sm font-bold">{advisor.rating?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* PROXIMOS PASOS */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-5">
            Próximos pasos
          </p>
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
                  <Link
                    to={step.link}
                    className="text-[#10B981] text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1 flex-shrink-0"
                  >
                    {step.action} <ArrowRight size={12} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* BOTONES */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/dashboard/cliente"
            className="flex-1 bg-[#10B981] text-white font-black py-4 rounded-xl uppercase tracking-[0.1em] text-[11px] flex items-center justify-center gap-2 hover:bg-[#0ea371] transition-all"
          >
            Ir a mi dashboard <ArrowRight size={14} />
          </Link>
          <Link
            to="/asesores"
            className="flex-1 bg-white border border-gray-200 text-gray-600 font-bold py-4 rounded-xl uppercase tracking-[0.1em] text-[11px] flex items-center justify-center hover:border-gray-300 transition-all"
          >
            Explorar más asesores
          </Link>
        </div>

      </div>
    </div>
  );
};

export default PaymentSuccessPage;
