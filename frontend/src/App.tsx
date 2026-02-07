import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Brain, Cpu, BarChart3, ArrowRight } from 'lucide-react';

// Importaciones de tus componentes
import Navbar from './components/Navbar';
import PortalHero from './components/PortalHero'; 
import PillarsSection from './components/PillarsSection';
import SectorFocus from './components/SectorFocus';
import InnovationFramework from './components/InnovationFramework';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import AuthModal from './components/AuthModal';

// 1. DEFINICIÓN DE SOLUCIONES (Esto es lo que faltaba en tu captura)
const SolucionesPage = () => {
  const services = [
    {
      title: "Análisis Predictivo",
      desc: "Modelos avanzados de Machine Learning para anticipar tendencias de mercado y comportamientos operativos.",
      icon: <BarChart3 className="w-8 h-8 text-[#10B981]" />,
      color: "border-[#10B981]/20"
    },
    {
      title: "Automatización Inteligente",
      desc: "Optimización de flujos de trabajo mediante agentes de IA que reducen costos y errores humanos.",
      icon: <Cpu className="w-8 h-8 text-[#10B981]" />,
      color: "border-[#10B981]/20"
    },
    {
      title: "Consultoría Estratégica",
      desc: "Acompañamiento en la integración de arquitectura de datos para escalabilidad y eficiencia global.",
      icon: <Brain className="w-8 h-8 text-[#10B981]" />,
      color: "border-[#10B981]/20"
    }
  ];

  return (
    <div className="relative min-h-screen pt-40 pb-20 px-6 bg-[#020617]">
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <h1 className="text-5xl md:text-6xl font-black mb-12 text-white">
          Nuestras <span className="text-[#10B981]">Soluciones</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {services.map((s, i) => (
            <div key={i} className={`p-8 rounded-3xl bg-[#0a192f]/40 border ${s.color} backdrop-blur-xl hover:bg-[#0a192f]/60 transition-all`}>
              <div className="mb-6 p-4 bg-[#020617]/50 rounded-2xl w-fit">{s.icon}</div>
              <h3 className="text-2xl font-bold mb-4 text-white">{s.title}</h3>
              <p className="text-slate-400 mb-8">{s.desc}</p>
              <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold uppercase tracking-widest">
                Explorar Solución <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. FUNCIÓN APP ÚNICA (Sin duplicados)
function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#020617] selection:bg-[#10B981]/30 text-white">
        <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
        
        <Routes>
          <Route path="/" element={
            <main>
              <PortalHero />
              <PillarsSection />
              <SectorFocus />
              <InnovationFramework />
            </main>
          } />
          <Route path="/soluciones" element={<SolucionesPage />} />
        </Routes>

        <Footer />
        
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onLoginSuccess={() => setIsAuthModalOpen(false)}
        />
      </div>
    </Router>
  );
}

export default App;