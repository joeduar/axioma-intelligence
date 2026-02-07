import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Brain, Cpu, BarChart3, ArrowRight, Zap, Factory } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Componentes base
import Navbar from './components/Navbar';
import PortalHero from './components/PortalHero'; 
import PillarsSection from './components/PillarsSection';
import SectorFocus from './components/SectorFocus';
import InnovationFramework from './components/InnovationFramework';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.5 }}
  >
    {children}
  </motion.div>
);

// --- PÁGINA DE SOLUCIONES (TARJETAS RESTAURADAS) ---
const SolucionesPage = () => {
  const services = [
    {
      title: "Análisis Predictivo",
      desc: "Modelos de Machine Learning diseñados para anticipar tendencias críticas y optimizar la toma de decisiones.",
      icon: <BarChart3 className="w-8 h-8 text-[#10B981]" />,
    },
    {
      title: "Automatización IA",
      desc: "Implementación de agentes inteligentes que optimizan flujos operativos y reducen la carga administrativa.",
      icon: <Cpu className="w-8 h-8 text-[#10B981]" />,
    },
    {
      title: "Estrategia de Datos",
      desc: "Arquitectura avanzada para la gestión de datos, garantizando escalabilidad y soberanía tecnológica.",
      icon: <Brain className="w-8 h-8 text-[#10B981]" />,
    }
  ];

  return (
    <div className="min-h-screen pt-40 pb-20 px-6 bg-[#020617]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-black mb-16 text-white text-center uppercase tracking-tighter">
          Nuestras <span className="text-[#10B981]">Soluciones</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="p-10 rounded-3xl bg-[#0a192f]/40 border border-[#10B981]/10 backdrop-blur-xl hover:border-[#10B981]/40 transition-all group">
              <div className="mb-6 p-4 bg-[#020617]/50 rounded-2xl w-fit">{s.icon}</div>
              <h3 className="text-2xl font-bold mb-4 text-white uppercase">{s.title}</h3>
              <p className="text-slate-400 mb-8 leading-relaxed">{s.desc}</p>
              <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold uppercase tracking-widest">
                Saber más <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- PÁGINA DE SECTORES (INFORMACIÓN RESTAURADA) ---
const SectoresPage = () => {
  const sectors = [
    {
      title: "Oil & Gas",
      focus: "Optimización de Reservorios",
      desc: "Aplicamos IA para el análisis sísmico y la eficiencia en la producción de hidrocarburos.",
      icon: <Factory className="w-10 h-10 text-[#10B981]" />,
      tag: "Eficiencia Upstream"
    },
    {
      title: "Energía",
      focus: "Smart Grids",
      desc: "Sistemas inteligentes para el balanceo de carga y predicción de demanda energética.",
      icon: <Zap className="w-10 h-10 text-[#10B981]" />,
      tag: "Estabilidad de Red"
    }
  ];

  return (
    <div className="min-h-screen pt-40 pb-20 px-6 bg-[#020617]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-[#10B981] font-bold tracking-[0.3em] uppercase text-[10px] mb-4 text-center">Verticales Estratégicas</h2>
          <h1 className="text-5xl md:text-6xl font-black text-white text-center uppercase tracking-tighter">
            Sectores <span className="text-[#10B981]">Clave</span>
          </h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {sectors.map((s, i) => (
            <div key={i} className="group p-12 rounded-3xl bg-[#0a192f]/30 border border-[#10B981]/10 backdrop-blur-xl flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
              <div className="p-6 bg-[#020617]/50 rounded-full">{s.icon}</div>
              <div>
                <span className="text-[#10B981] text-[10px] font-bold uppercase tracking-widest block mb-2">{s.tag}</span>
                <h3 className="text-3xl font-bold text-white mb-2 uppercase">{s.title}</h3>
                <h4 className="text-slate-300 text-sm font-medium mb-4">{s.focus}</h4>
                <p className="text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

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
    
    {/* MODIFICACIÓN: En lugar de cargar el footer solo, redirigimos a la Home con animación */}
    <Route path="/contacto" element={
      <PageTransition>
        <main>
          <PortalHero />
          <PillarsSection />
          <SectorFocus />
          <InnovationFramework />
          {/* Al entrar aquí, la animación sutil se ejecutará igual que en las otras páginas */}
        </main>
      </PageTransition>
    } />
  </Routes>
</AnimatePresence>
    </div>
  );
};

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