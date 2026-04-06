import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Linkedin, Twitter, Instagram } from 'lucide-react';

const Footer = () => {

  const navLinks = [
    { label: 'Inicio', path: '/' },
    { label: 'Asesores', path: '/asesores' },
    { label: 'Como funciona', path: '/como-funciona' },
    { label: 'Nosotros', path: '/nosotros' },
  ];

  return (
    <footer className="bg-[#080C20] border-t border-white/5 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          <div className="md:col-span-2 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3 w-fit">
              <img
                src="/favicon.png"
                alt="Axioma Logo"
                className="w-9 h-9 object-contain opacity-90"
              />
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter text-white leading-none uppercase">
                  AXIOMA
                </span>
                <span className="text-[7px] font-bold tracking-[0.4em] text-[#10B981] uppercase mt-1">
                  VENTURES INTELLIGENCE
                </span>
              </div>
            </Link>

            <p className="text-slate-500 text-xs font-light leading-relaxed max-w-xs">
              La plataforma que conecta asesores profesionales verificados con empresas
              y personas que necesitan orientacion estrategica.
            </p>

            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-[#10B981] transition-all">
                <Linkedin size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-[#10B981] transition-all">
                <Twitter size={15} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-[#10B981] transition-all">
                <Instagram size={15} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-[9px] uppercase tracking-[0.35em] mb-7">
              Plataforma
            </h4>
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-slate-500 hover:text-white text-[11px] font-medium tracking-wide transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/registro"
                className="text-[#10B981] hover:text-white text-[11px] font-medium tracking-wide transition-colors"
              >
                Registrarme como asesor
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold text-[9px] uppercase tracking-[0.35em] mb-7">
              Contacto
            </h4>
            <div className="flex flex-col gap-5">
              <a
                href="mailto:info@axiomaventures.com"
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#10B981] group-hover:border-[#10B981]/30 transition-all">
                  <Mail size={13} />
                </div>
                <span className="text-slate-500 text-[11px] group-hover:text-white transition-colors">
                  info@axiomaventures.com
                </span>
              </a>

              <a
                href="https://wa.me/584241601430"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-[#10B981] group-hover:border-[#10B981]/30 transition-all">
                  <MessageCircle size={13} />
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 text-[11px] group-hover:text-white transition-colors">
                    WhatsApp Business
                  </span>
                  <span className="text-[9px] text-[#10B981]/50 font-bold uppercase tracking-widest">
                    Respuesta rapida
                  </span>
                </div>
              </a>
            </div>
          </div>

        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-600 text-[9px] font-bold tracking-widest uppercase">
            2026 Axioma Ventures Intelligence C.A. Todos los derechos reservados
          </p>
          <div className="flex items-center gap-8">
            <a href="#" className="text-slate-600 hover:text-slate-400 text-[9px] font-bold tracking-widest uppercase transition-colors">
              Privacidad
            </a>
            <a href="#" className="text-slate-600 hover:text-slate-400 text-[9px] font-bold tracking-widest uppercase transition-colors">
              Terminos
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;