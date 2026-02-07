import React from 'react';
import { Mail, Linkedin, Twitter, MessageSquare } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0A0E27] pt-20 pb-10 border-t border-white/5 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Columna 1: Logo y Bio */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center shrink-0">
                <img 
                  src="/favicon.png" 
                  alt="Axioma Logo" 
                  className="w-10 h-10 md:w-12 md:h-12 object-contain opacity-90 hover:opacity-100 transition-opacity"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="flex flex-col justify-center leading-none">
                <span className="text-white font-black tracking-tighter text-lg md:text-xl uppercase">
                  Axioma Ventures
                </span>
                <span className="text-[#10B981] font-bold tracking-[0.15em] text-[10px] md:text-[11px] uppercase mt-0.5">
                  Intelligence
                </span>
              </div>
            </div>
            
            <p className="text-white/50 text-sm leading-relaxed max-w-md">
              Transformamos datos complejos en decisiones estratégicas de alto impacto mediante precisión algorítmica e innovación constante.
            </p>
          </div>

          {/* Columna 2: Contacto */}
          <div>
            <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.3em] mb-8">Contacto</h4>
            <div className="space-y-4">
              <a href="mailto:info@axiomaventures.com" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981]/20 transition-all">
                  <Mail size={16} />
                </div>
                <span className="text-white/60 text-xs group-hover:text-white transition-colors">info@axiomaventures.com</span>
              </a>
            </div>
          </div>

          {/* Columna 3: Redes */}
          <div>
            <h4 className="text-white font-bold text-[10px] uppercase tracking-[0.3em] mb-8">Social</h4>
            <div className="flex gap-4">
              {[
                { icon: <Linkedin size={18} />, href: "#" },
                { icon: <Twitter size={18} />, href: "#" },
                { icon: <MessageSquare size={18} />, href: "#" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href} 
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 hover:text-[#10B981] hover:bg-[#10B981]/10 transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Barra Inferior Corregida */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/60 text-xs font-medium">
            © 2026 AXIOMA VENTURES INTELLIGENCE C.A.
          </p>
          <div className="flex gap-10">
            <a href="#" className="text-white/60 text-xs font-medium hover:text-white transition-colors tracking-widest uppercase">Privacidad</a>
            <a href="#" className="text-white/60 text-xs font-medium hover:text-white transition-colors tracking-widest uppercase">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;