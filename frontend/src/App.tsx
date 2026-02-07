import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Brain, Cpu, BarChart3, ArrowRight } from 'lucide-react';

// Importaciones de tus componentes reales
import Navbar from './components/Navbar';
import PortalHero from './components/PortalHero'; 
import PillarsSection from './components/PillarsSection';
import SectorFocus from './components/SectorFocus';
import InnovationFramework from './components/InnovationFramework';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import AuthModal from './components/AuthModal';

const SolucionesPage = () => {
  const services = [
    {
      title: "Análisis Predictivo",
      desc: "Modelos avanzados de Machine Learning para anticipar tendencias de mercado.",
      icon: <BarChart3 className="w-8 h-8 text-cyan-400" />,
      color: "border-cyan-500/30"
    },
    {
      title: "Automatización Inteligente",
      desc: "Optimización de flujos de trabajo mediante agentes de IA especializados.",
      icon: <Cpu className="w-8 h-8 text-[#10B981]" />,
      color: "border-[#10B981]/30"
    },
    {
      title: "Consultoría Estratégica",
      desc: "Acompañamiento en la integración de cultura Data-Driven y arquitectura de datos.",
      icon: <Brain className="w-8 h-8 text-purple-400" />,
      color: "border-purple-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-5xl font-black mb-12">Nuestras <span className="text-[#10B981]">Soluciones</span></h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {services.map((s, i) => (
            <div key={i} className={`p-8 rounded-2xl bg-white/5 border ${s.color} backdrop-blur-sm hover:bg-white/10 transition-all`}>
              <div className="mb-4">{s.icon}</div>
              <h3 className="text-xl font-bold mb-2">{s.title}</h3>
              <p className="text-gray-400 text-sm mb-6">{s.desc}</p>
              <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold uppercase tracking-widest cursor-pointer">
                Saber más <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Arreglo para LoadingScreen: Le pasamos una función vacía a onComplete para que no de error
  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] selection:bg-[#10B981]/30">
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