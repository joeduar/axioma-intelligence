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

// --- PÁGINA DE SOLUCIONES ---
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
        <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.5em] mb-6">
  Nuestras <span className="text-[#10B981] font-normal">Soluciones</span>
</h1>
<div className="w-20 h-px bg-[#10B981]/30 mx-auto mb-12" /> {/* Línea sutil decorativa */}
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

// --- PÁGINA DE SECTORES ---
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
          <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.5em] mb-4 text-center">
  Sectores <span className="text-[#10B981] font-normal">Estratégicos</span>
</h1>
<p className="text-[10px] font-medium tracking-[0.3em] text-slate-500 uppercase text-center mb-16">
  Especialización por vertical de industria
</p>
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

// --- PÁGINA ACERCA DE NOSOTROS ---
const NosotrosPage = () => {
  return (
    <div className="min-h-screen pt-40 pb-20 px-6 bg-[#020617]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-[#10B981] font-bold tracking-[0.3em] uppercase text-[10px] mb-4">Nuestra Esencia</h2>
        <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-[0.5em] mb-12">
  Acerca de <span className="text-[#10B981] font-normal">Nosotros</span>
</h1>
        
        <div className="space-y-8 text-lg text-slate-400 leading-relaxed text-left bg-[#0a192f]/30 p-10 rounded-3xl border border-[#10B981]/10 backdrop-blur-xl">
          <p>
            Axioma Ventures Intelligence, C.A <span className="text-white font-bold"></span>, es una agencia de Inteligencia Artificial enfocada en transformar datos en decisiones estratégicas de alto impacto. Desarrollamos soluciones de IA como softwares, automatizaciones, estadísticas de análisis de datos, y Big Data con un enfoque en precisión algorítmica, innovación constante y crecimiento sostenible. 
          </p>
          <p>
            También aportamos servicios de consultoría estratégica en base a analítica de negocios (Business Analytics).
          </p>
          <p>
            Trabajamos junto a empresas que buscan optimizar su rendimiento hoy mientras construyen ventajas competitivas a largo plazo.
          </p>
        </div>
      </div>
    </div>
  );
};


const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#020617] selection:bg-[#10B981]/30 text-white flex flex-col">
      <Navbar />
      
      <div className="flex-grow">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* INICIO DE RUTAS */}
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
            
            {/* NUEVA RUTA: ACERCA DE NOSOTROS */}
            <Route path="/nosotros" element={<PageTransition><NosotrosPage /></PageTransition>} />
            
            <Route path="/sectores" element={<PageTransition><SectoresPage /></PageTransition>} />
            
            <Route path="/contacto" element={
              <PageTransition>
                <main><PortalHero /><PillarsSection /><SectorFocus /><InnovationFramework /></main>
              </PageTransition>
            } />
            {/* FIN DE RUTAS */}
          </Routes>
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default function App() {
  // 1. El estado inicial busca si ya hay acceso. Si no existe, es true (muestra loading).
  const [loading, setLoading] = useState(() => {
    return localStorage.getItem('auth_access') !== 'true';
  });

  // 2. Función que se activa cuando metes el código correcto en el LoadingScreen
  const handleAccess = () => {
    setLoading(false);
  };

  // 3. Si loading es true, bloqueamos toda la web con el LoadingScreen
  if (loading) {
    return <LoadingScreen onAccess={handleAccess} />;
  }

  // 4. Solo si loading es false, se renderiza el contenido real
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}