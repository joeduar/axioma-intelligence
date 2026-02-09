import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Twitter, MessageSquare, Mail } from 'lucide-react';
import { Phone, MessageCircle, } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#020617] border-t border-[#10B981]/10 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* COLUMNA 1: IDENTIDAD Y CTA */}
<div className="flex flex-col gap-6 col-span-1 md:col-span-2">
  <div className="flex items-center gap-3">
    <img 
      src="/favicon.png" 
      alt="Axioma Logo" 
      className="w-10 h-10 object-contain opacity-80" 
    />
    <div className="flex flex-col">
      <span className="text-2xl font-black tracking-tighter text-white leading-[0.8] uppercase">AXIOMA</span>
      <span className="text-[8px] font-bold tracking-[0.4em] text-[#10B981] uppercase mt-1">VENTURES INTELLIGENCE</span>
    </div>
  </div>
  
  {/* NUEVA LLAMADA A LA ACCIÓN */}
  <div className="max-w-xs space-y-4">
    <p className="text-slate-400 text-xs font-light leading-relaxed tracking-wide">
      Si deseas agendar una reunión para conocer a detalle nuestros servicios, te invitamos a escribirnos directamente:
    </p>
    <a href="mailto:info@axiomaventures.com" className="inline-block text-[#10B981] text-[10px] font-bold tracking-[0.2em] uppercase border-b border-[#10B981]/30 pb-1 hover:border-[#10B981] transition-all">
      Agendar Consultoría →
    </a>
  </div>
</div>{/* COLUMNA 2: CONTACTO MULTICANAL */}
<div>
  <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.3em] mb-8">Primer Contacto</h4>
  <div className="space-y-5">
    {/* CORREO */}
    <a href="mailto:info@axiomaventures.com" className="flex items-center gap-4 group">
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#10B981] border border-white/5 group-hover:border-[#10B981]/40 transition-all">
        <Mail size={14} />
      </div>
      <span className="text-slate-400 text-[11px] group-hover:text-white transition-colors tracking-wide">info@axiomaventures.com</span>
    </a>

    {/* WHATSAPP / LLAMADA */}
    <a href="https://wa.me/+584241601430" target="_blank" className="flex items-center gap-4 group">
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#10B981] border border-white/5 group-hover:border-[#10B981]/40 transition-all">
        <MessageCircle size={14} />
      </div>
      <div className="flex flex-col">
        <span className="text-slate-400 text-[11px] group-hover:text-white transition-colors tracking-wide">+XX XXX XXXXXXX</span>
        <span className="text-[9px] text-[#10B981]/60 uppercase tracking-widest font-bold">WhatsApp Business</span>
      </div>
    </a>
  </div>
</div>

          {/* COLUMNA 3: SOCIAL */}
          <div>
            <h4 className="text-white font-bold text-[10px] tracking-[0.3em] uppercase mb-6">Social</h4>
            <div className="flex gap-3">
              {[Linkedin, Twitter, MessageSquare].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-[#0a192f]/50 border border-[#10B981]/5 flex items-center justify-center text-slate-400 hover:text-[#10B981] hover:border-[#10B981]/20 transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* LÍNEA FINAL */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">
            © 2026 AXIOMA VENTURES INTELLIGENCE C.A.
          </p>
          <div className="flex gap-10">
            <a href="#" className="text-slate-500 hover:text-white text-[10px] font-bold tracking-widest uppercase transition-colors">Privacidad</a>
            <a href="#" className="text-slate-500 hover:text-white text-[10px] font-bold tracking-widest uppercase transition-colors">Términos</a>
          </div>
        </div>
      </div>
    </footer>
    
  ); <button 
  onClick={() => {
    localStorage.removeItem('auth_access');
    window.location.reload();
  }}
  className="text-white/20 text-[8px] uppercase tracking-widest hover:text-red-500"
>
  Bloquear Acceso
</button>

};


export default Footer;