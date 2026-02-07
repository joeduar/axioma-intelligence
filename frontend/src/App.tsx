import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Brain, Cpu, BarChart3, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Importaciones de tus componentes base
import Navbar from './components/Navbar';
import PortalHero from './components/PortalHero'; 
import PillarsSection from './components/PillarsSection';
import SectorFocus from './components/SectorFocus';
import InnovationFramework from './components/InnovationFramework';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

// --- COMPONENTE DE ANIMACIÓN ---
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

// --- PÁGINA DE SOLUCIONES (CONTENIDO RESTAURADO) ---
const SolucionesPage = () => {
  const services = [
    {
      title: "Análisis Predictivo",
      desc: "Modelos avanzados de Machine Learning para anticipar tendencias de mercado y comportamientos operativos.",
      icon: <BarChart3 className="w-8 h-8 text-[#10B981]" />,
    },
    {
      title: "Automatización Inteligente",
      desc: "Optimización de flujos de trabajo mediante agentes de IA que reducen costos y errores humanos.",
      icon: <Cpu className="w-8 h-8 text-[#10B981]" />,
    },
    {
      title: "Consultoría Estratégica",
      desc: "Acompañamiento en la integración de arquitectura de datos para escalabilidad y eficiencia global.",
      icon: <Brain className="w-8 h-8 text-[#10B981]" />,
    }
  ];

  return (
    <div className="relative min-h-screen pt-40 pb-20 px-6 bg-[#020617]">
      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <h1 className="text-5xl md:text-6xl font-black mb-12 text-white uppercase tracking-tighter">
          Nuestras <span className="text-[#10B981]">Soluciones</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {services.map((s, i) => (
            <div key={i} className="p-8 rounded-3xl bg-[#0a192f]/40 border border-[#10B981]/10 backdrop-blur-xl hover:border-[#10B981]/40 transition-all group">
              <div className="mb-6 p-4 bg-[#020617]/50 rounded-2xl w-fit">{s.icon}</div>
              <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">{s.title}</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">{s.desc}</p>
              <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold uppercase tracking-[0.2em]">
                Explorar <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- PÁGINA DE SECTORES (CONTENIDO RESTAURADO) ---
const SectoresPage = () => {
  const sectors = [
    {
      title: "Oil & Gas",
      focus: "Upstream Optimization",
      desc: "Optimización de reservorios y análisis sísmico mediante redes neuronales profundas.",
      icon: "🛢️",
      stats: "25% Eficiencia"
    },
    {
      title: "Energías Renovables",
      focus: "Smart Grid Systems",
      desc: "Algoritmos de balanceo de carga y predicción de demanda en tiempo real para redes eléctricas.",
      icon: "⚡",
      stats: "99.9% Estabilidad"
    },
    {
      title: "Manufactura Pesada",
      focus: "Predictive Integrity",
      desc: "Sistemas de visión artificial para detectar fallas estructurales antes de que ocurran.",
      icon: "🏭",
      stats: "-40% Downtime"
    }
  ];

  return (
    <div className="relative min-h-screen pt-40 pb-20 px-6 bg-[#020617]">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-16">
          <h2 className="text-[#10B981] font-bold tracking-[0.3em] uppercase text-[10px] mb-4">Verticales de Industria</h2>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">
            Sectores <span className="text-[#10B981]">Estratégicos</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sectors.map((s, i) => (
            <div key={i} className="group p-10 rounded-3xl bg-[#0a192f]/30 border border-[#10B981]/10 backdrop-blur-xl hover:border-[#10B981]/40 transition-all flex flex-col md:flex-row gap-8 items-start">
              <div className="text-6xl filter drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">{s.icon}</div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold uppercase tracking-widest mb-4">
                  {s.stats}
                </span>
                <h3 className="text-3xl font-bold text-white mb-1 uppercase tracking-tight">{s.title}</h3>
                <h4 className="text-[#10B981] text-xs font-bold mb-4 uppercase tracking-[0.2em]">{s.focus}</h4>
                <p className="text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MANEJADOR DE RUTAS ---
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
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
    </div>
  );
};

// --- APP ---
export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen onComplete={() => setLoading(false)} />;

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}