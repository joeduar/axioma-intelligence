import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, ArrowRight } from 'lucide-react';

const PaymentCancelledPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">

      <div className="max-w-md w-full text-center">

        <div className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mx-auto mb-6">
          <XCircle size={36} className="text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-[#0A0E27] mb-2">
          Pago cancelado
        </h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          No se realizó ningún cargo. Puedes volver e intentarlo cuando quieras.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/asesores"
            className="w-full bg-[#10B981] text-white font-black py-4 rounded-xl uppercase tracking-[0.1em] text-[11px] flex items-center justify-center gap-2 hover:bg-[#0ea371] transition-all"
          >
            Volver al catálogo <ArrowRight size={14} />
          </Link>
          <Link
            to="/"
            className="w-full bg-white border border-gray-200 text-gray-500 font-bold py-3 rounded-xl uppercase tracking-[0.1em] text-[11px] flex items-center justify-center gap-2 hover:border-gray-300 transition-all"
          >
            <ArrowLeft size={14} /> Ir al inicio
          </Link>
        </div>

      </div>

    </div>
  );
};

export default PaymentCancelledPage;
