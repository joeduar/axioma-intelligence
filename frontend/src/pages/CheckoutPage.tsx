import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, ArrowLeft, Check, CreditCard, Loader2, Star, Zap, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const PLAN_DATA = {
  sesion_inicial: {
    name: 'Sesión Inicial',
    price: 19,
    duration: '30 minutos',
    priceId: import.meta.env.VITE_STRIPE_PRICE_INICIAL,
    color: 'blue',
    features: [
      'Sesión de 30 minutos con el asesor',
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
    priceId: import.meta.env.VITE_STRIPE_PRICE_COMPLETO,
    color: 'green',
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

const CheckoutPage = () => {
  const { planType, advisorId, sessionId } = useParams<{
    planType: string;
    advisorId: string;
    sessionId: string;
  }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [advisor, setAdvisor] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingAdvisor, setLoadingAdvisor] = useState(true);
  const [error, setError] = useState('');

  const plan = PLAN_DATA[planType as keyof typeof PLAN_DATA];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (advisorId && advisorId !== 'general') {
      fetchAdvisor();
    } else {
      setLoadingAdvisor(false);
    }
  }, [user, advisorId]);

  const fetchAdvisor = async () => {
    const { data } = await supabase
      .from('advisors')
      .select('*, profiles(full_name, avatar_url)')
      .eq('id', advisorId)
      .single();
    setAdvisor(data);
    setLoadingAdvisor(false);
  };

  const handleCheckout = async () => {
    if (!user || !plan) return;
    setLoading(true);
    setError('');

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || supabaseKey;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/rapid-worker`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'apikey': supabaseKey,
          },
          body: JSON.stringify({
            priceId: plan.priceId,
            advisorId: advisorId !== 'general' ? advisorId : null,
            sessionId: sessionId !== 'none' ? sessionId : null,
            clientEmail: profile?.email || user.email,
            planType,
            successUrl: `${window.location.origin}/pago/exito?plan=${planType}&advisor=${advisorId}&session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${window.location.origin}/pago/cancelado`,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Error al crear la sesion de pago');
      }

      window.location.href = data.url;

    } catch (err: any) {
      setError(err.message || 'Error al procesar el pago. Intenta de nuevo.');
      setLoading(false);
    }
  };

  const advisorName = advisor?.profiles?.full_name || 'Asesor';
  const firstName = profile?.full_name?.split(' ')[0] || 'Cliente';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-[#0A0E27] border-b border-[#10B981]/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/favicon.png" alt="Axioma" className="w-8 h-8 object-contain" />
            <div>
              <p className="font-black tracking-tighter uppercase text-base leading-none text-white">AXIOMA</p>
              <p className="text-[#10B981] text-[7px] font-bold tracking-[0.4em] uppercase">VENTURES INTELLIGENCE</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-[#10B981]" />
            <span className="text-gray-400 text-xs">Pago seguro y cifrado</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-700 text-sm font-medium mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Volver
        </button>

        <div className="grid lg:grid-cols-5 gap-8">

          {/* COLUMNA IZQUIERDA — Resumen del pedido */}
          <div className="lg:col-span-3 space-y-5">

            <div>
              <h1 className="text-2xl font-bold text-[#0A0E27] mb-1">
                Resumen del pedido
              </h1>
              <p className="text-gray-400 text-sm">
                Revisa los detalles antes de proceder al pago
              </p>
            </div>

            {/* CARD DEL PLAN */}
            <div className={`rounded-2xl border-2 p-6 bg-white ${plan.color === 'green' ? 'border-[#10B981]' : 'border-blue-200'
              }`}>
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
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
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${plan.color === 'green'
                    ? 'bg-[#10B981]/10 text-[#10B981]'
                    : 'bg-blue-50 text-blue-600'
                    }`}>
                    <Clock size={11} />
                    {plan.duration}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-[#0A0E27]">${plan.price}</p>
                  <p className="text-gray-400 text-xs">pago único</p>
                </div>
              </div>

              <div className="space-y-2.5 pt-5 border-t border-gray-100">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.color === 'green' ? 'bg-[#10B981]/10' : 'bg-blue-50'
                      }`}>
                      <Check size={11} className={plan.color === 'green' ? 'text-[#10B981]' : 'text-blue-500'} />
                    </div>
                    <span className="text-gray-600 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ASESOR SELECCIONADO */}
            {advisor && !loadingAdvisor && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Asesor seleccionado
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm overflow-hidden"
                    style={{ backgroundColor: '#0F4C35' }}
                  >
                    {advisor.profiles?.avatar_url ? (
                      <img src={advisor.profiles.avatar_url} alt={advisorName} className="w-full h-full object-cover" />
                    ) : (
                      advisorName[0]
                    )}
                  </div>
                  <div>
                    <p className="text-gray-800 font-bold text-sm">{advisorName}</p>
                    <p className="text-gray-400 text-xs">{advisor.title}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Star size={12} className="text-[#10B981] fill-[#10B981]" />
                    <span className="text-gray-700 text-xs font-bold">{advisor.rating?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* CLIENTE */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                Tu cuenta
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] font-black text-sm">
                  {firstName[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-gray-800 font-bold text-sm">{profile?.full_name}</p>
                  <p className="text-gray-400 text-xs">{profile?.email || user?.email}</p>
                </div>
              </div>
            </div>

          </div>

          {/* COLUMNA DERECHA — Pago */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-8">

              <h2 className="text-base font-bold text-[#0A0E27] mb-6">
                Detalle del pago
              </h2>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{plan.name}</span>
                  <span className="text-gray-800 font-medium">${plan.price}.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Comisión de plataforma</span>
                  <span className="text-gray-800 font-medium">Incluida</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IVA</span>
                  <span className="text-gray-800 font-medium">$0.00</span>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100 mb-6">
                <span className="font-bold text-[#0A0E27]">Total</span>
                <span className="font-black text-[#0A0E27] text-xl">${plan.price}.00 USD</span>
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-red-600 text-[11px] font-bold">{error}</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-[#10B981] text-white font-black py-4 rounded-xl uppercase tracking-[0.1em] text-[11px] flex items-center justify-center gap-2 hover:bg-[#0ea371] transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <CreditCard size={16} />
                    Pagar ${plan.price}.00 USD
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 mb-4">
                <Shield size={13} className="text-gray-400" />
                <span className="text-gray-400 text-xs">Powered by</span>
                <span className="text-gray-600 text-xs font-bold">Stripe</span>
              </div>

              {/* LOGOS DE PAGO */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                {['VISA', 'MC', 'AMEX'].map((card) => (
                  <div key={card} className="px-3 py-1.5 border border-gray-200 rounded-lg">
                    <span className="text-gray-500 text-[10px] font-bold">{card}</span>
                  </div>
                ))}
              </div>

              <p className="text-center text-gray-400 text-[10px] mt-4 leading-relaxed">
                Al continuar aceptas nuestros{' '}
                <a href="#" className="text-[#10B981] hover:underline">Términos de servicio</a>
                {' '}y{' '}
                <a href="#" className="text-[#10B981] hover:underline">Política de privacidad</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
