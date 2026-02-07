import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Brain, Cpu, BarChart3, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // 1. Nueva Importación

// Importaciones de tus componentes
import Navbar from './components/Navbar';
import PortalHero from './components/PortalHero'; 
import PillarsSection from './components/PillarsSection';
import SectorFocus from './components/SectorFocus';
import InnovationFramework from './components/InnovationFramework';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import AuthModal from './components/AuthModal';

// 2. COMPONENTE DE ANIMACIÓN (Va aquí, fuera de App)
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
const SectoresPage = () => {
  const sectors = [
    {
      title: "Oil & Gas",
      focus: "Exploración y Producción (Upstream)",
      desc: "Optimización de reservorios y análisis sísmico mediante redes neuronales profundas.",
      icon: "🛢️",
      stats: "25% Eficiencia extra"
    },
    {
      title: "Energías Renovables",
      focus: "Smart Grids y Almacenamiento",
      desc: "Algoritmos de predicción de demanda y balanceo de carga en tiempo real para redes eléctricas.",
      icon: "⚡",
      stats: "99.9% Estabilidad"
    },
    {
      title: "Manufactura Pesada",
      focus: "Mantenimiento Predictivo",
      desc: "Visión artificial para detectar fatiga estructural antes de que ocurran fallas críticas.",
      icon: "🏭",
      stats: "-40% Tiempo de inactividad"
    }
  ];

  return (
    <div className="relative min-h-screen pt-40 pb-20 px-6 bg-[#020617]">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16">
          <h2 className="text-[#10B981] font-bold tracking-[0.3em] uppercase text-xs mb-4">Verticales de Industria</h2>
          <h1 className="text-5xl font-black text-white mb-6">Sectores <span className="text-[#10B981]">Estratégicos</span></h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {sectors.map((s, i) => (
            <div key={i} className="group flex flex-col md:flex-row gap-8 p-10 rounded-3xl bg-[#0a192f]/30 border border-[#10B981]/10 backdrop-blur-xl hover:border-[#10B981]/40 transition-all duration-500">
              <div className="text-6xl mb-4 md:mb-0">{s.icon}</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold uppercase tracking-widest">
                    {s.stats}
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">{s.title}</h3>
                <h4 className="text-[#10B981] font-medium mb-4">{s.focus}</h4>
                <p className="text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. COMPONENTE PARA MANEJAR LAS RUTAS ANIMADAS
const AnimatedRoutes = () => {
  const location = useLocation();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-[#10B981]/30 text-white">
      <Navbar onLoginClick={() => setIsAuthModalOpen(true)} />
      
      {/* AnimatePresence permite detectar cuando una página sale */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Routes location={location} key={location.pathname}>
            
  {/* AÑADE ESTA LÍNEA */}
  <Route path="/sectores" element={<PageTransition><SectoresPage /></PageTransition>} />
</Routes>
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
          <Route path="/soluciones" element={
            <PageTransition>
              <SolucionesPage />
            </PageTransition>
          } />
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