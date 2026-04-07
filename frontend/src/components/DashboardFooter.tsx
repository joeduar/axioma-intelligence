import React from 'react';
import { Link } from 'react-router-dom';

const DashboardFooter = () => {
  return (
    <footer className="border-t border-white/5 px-6 py-6 mt-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-600 text-[9px] font-bold tracking-widest uppercase">
          2026 Axioma Ventures Intelligence C.A. Todos los derechos reservados
        </p>
        <div className="flex items-center gap-6">
          <Link
            to="/nosotros"
            className="text-slate-600 hover:text-slate-400 text-[9px] font-bold tracking-widest uppercase transition-colors"
          >
            Nosotros
          </Link>
          <a
            href="#"
            className="text-slate-600 hover:text-slate-400 text-[9px] font-bold tracking-widest uppercase transition-colors"
          >
            Privacidad
          </a>
          <a
            href="#"
            className="text-slate-600 hover:text-slate-400 text-[9px] font-bold tracking-widest uppercase transition-colors"
          >
            Terminos
          </a>
          <a
            href="#"
            className="text-slate-600 hover:text-slate-400 text-[9px] font-bold tracking-widest uppercase transition-colors"
          >
            Condiciones
          </a>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
