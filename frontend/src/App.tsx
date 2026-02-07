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
      desc: "Modelos avanzados de Machine Learning para anticipar tendencias de mercado y comportamientos operativos.",
      icon: <BarChart3 className="w-8 h-8 text-cyan-400" />,
      color: "border-cyan-500/20"
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
      icon: <Brain className="w-8 h-8 text-purple-400" />,
      color: "border-purple-500/20"
    }
  ];

  return (
    // Quitamos el bg-[#050505] sólido y usamos un gradiente que fluya con el fondo general
    <div className="relative min-h-screen pt-40 pb-20 px-6 bg-gradient-to-b from-black via-[#0a0a0a] to-black">
      {/* Efecto de luz de fondo para quitar la sensación de "todo negro" */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#10B981]/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-[#10B981] font-bold tracking-[0.3em] uppercase text-xs mb-4">Servicios de Élite</h2>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            Nuestras <span className="text-[#10B981]">Soluciones</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Impulsamos la eficiencia operativa mediante tecnología disruptiva diseñada para el sector energético.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div 
              key={i} 
              className={`group p-8 rounded-3xl bg-white/[0.03] border ${s.color} backdrop-blur-md hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-2`}
            >
              <div className="mb-6 p-4 bg-black/50 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">
                {s.title}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-8">
                {s.desc}
              </p>
              <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold uppercase tracking-[0.2em] group-hover:gap-4 transition-all">
                Explorar Solución <ArrowRight size={14} />
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