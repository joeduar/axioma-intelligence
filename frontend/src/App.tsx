import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Brain, Cpu, BarChart3, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import PortalHero from './components/PortalHero'; 
import PillarsSection from './components/PillarsSection';
import SectorFocus from './components/SectorFocus';
import InnovationFramework from './components/InnovationFramework';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';

// --- ANIMACIÓN ---
const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
);

// --- PÁGINAS ---
const SolucionesPage = () => (
  <div className="min-h-screen pt-40 pb-20 px-6 bg-[#020617] text-center">
    <h1 className="text-5xl font-black text-white">Nuestras <span className="text-[#10B981]">Soluciones</span></h1>
  </div>
);

const SectoresPage = () => (
  <div className="min-h-screen pt-40 pb-20 px-6 bg-[#020617] text-center">
    <h1 className="text-5xl font-black text-white">Sectores <span className="text-[#10B981]">Estratégicos</span></h1>
  </div>
);

// --- RUTAS ---
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#020617]">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <PageTransition>
              <main><PortalHero /><PillarsSection /><SectorFocus /><InnovationFramework /></main>
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

// --- APP PRINCIPAL ---
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