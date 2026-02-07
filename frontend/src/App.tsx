import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Brain, Cpu, BarChart3, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Importaciones de tus componentes
import Navbar from './components/Navbar';
import PortalHero from './components/PortalHero'; 
import PillarsSection from './components/PillarsSection';
import SectorFocus from './components/SectorFocus';
import InnovationFramework from './components/InnovationFramework';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import AuthModal from './components/AuthModal';

// --- COMPONENTES DE TRANSICIÓN ---
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// --- PÁGINA DE SOLUCIONES ---
const SolucionesPage = () => {
  const services = [
    {
      title: "Análisis Predictivo",
      desc: "Modelos avanzados de Machine Learning para anticipar tendencias de mercado.",
      icon: <BarChart3 className="w-8 h-8 text-[#10B981]" />,
      color: "border-[#10B981]/20"
    },
    {
      title: "Automatización Inteligente",
      desc: "Optimización de flujos de trabajo mediante agentes de IA especializados.",
      icon: <Cpu className="w-8 h-8 text-[#10B981]" />,
      color: "border-[#10B981]/20"
    },
    {
      title: "Consultoría Estratégica",
      desc: "Arquitectura de datos para escalabilidad y eficiencia global.",
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

// --- PÁGINA DE SECTORES ---
const SectoresPage = () => {
  const sectors = [
    { title: "Oil & Gas", focus: "Exploración y Producción", desc: "Optimización de reservorios y análisis sísmico mediante IA.", icon: "🛢️" },
    { title: "Energías Renovables", focus: "Smart Grids", desc: "Algoritmos de predicción de demanda en tiempo real.", icon: "⚡" },
    { title: "Manufactura", focus: "Mantenimiento Predictivo", desc: "Visión artificial para detectar fallas críticas.", icon: "🏭" }
  ];

  return (
    <div className="relative min-h-screen pt-40 pb-20 px-6 bg-[#020617]">
      <div className="max-w-7xl mx-auto relative z-10">
        <h1 className="text-5xl font-black text-white mb-12">Sectores <span className="text-[#10B981]">Estratégicos</span></h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sectors.map((s, i) => (
            <div key={i} className="group p-10 rounded-3xl bg-[#0a192f]/30 border border-[#10B981]/10 backdrop-blur-xl flex gap-6 items-start">
              <div className="text-5xl">{s.icon}</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{s.title}</h3>
                <h4 className="text-[#10B981] text-sm font-bold mb-3 uppercase tracking-tighter">{s.focus}</h4>
                <p className="text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- RUTAS ANIMADAS ---
const AnimatedRoutes = () => {
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-[#10B981]/30 text-white">
      <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <PageTransition>
              <main>
                <PortalHero />
                <PillarsSection />
                <SectorFocus />
                <InnovationFramework />
              </main>
            </PageTransition>
          } />
          <Route path="/soluciones" element={<PageTransition><SolucionesPage /></PageTransition>} />
          <Route path="/sectores" element={<PageTransition><SectoresPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>

      <Footer />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;