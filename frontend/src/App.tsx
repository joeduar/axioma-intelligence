import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PortalHero from './components/PortalHero'; 
import PillarsSection from './components/PillarsSection';
import SectorFocus from './components/SectorFocus';
import InnovationFramework from './components/InnovationFramework';
import Footer from './components/Footer';

const SolucionesPage = () => (
  <div className="min-h-screen bg-[#050505] text-white pt-40 px-6 text-center">
    <h1 className="text-5xl font-bold text-[#10B981]">Nuestras Soluciones</h1>
    <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
      Estamos desarrollando herramientas de IA de última generación para potenciar Axioma Intelligence.
    </p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#050505]">
        <Navbar onLoginClick={() => console.log("Login clicked")} />
        <Routes>
          <Route path="/" element={
            <>
              <PortalHero />
              <PillarsSection />
              <SectorFocus />
              <InnovationFramework />
            </>
          } />
          <Route path="/soluciones" element={<SolucionesPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;