import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PortalHero from './components/PortalHero';
import LoadingScreen from './components/LoadingScreen';
import Footer from './components/Footer';
// Asegúrate de que estos nombres coincidan con tus archivos actuales
import InnovationFramework from './components/InnovationFramework'; 
import SectorFocus from './components/SectorFocus';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  useEffect(() => {
  document.title = "Axioma Ventures Intelligence";
}, []);

  if (isLoading) {
    return <LoadingScreen onComplete={() => setIsLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white selection:bg-[#10B981]/30">
      {isLoggedIn ? (
        <div id="dashboard">
          {/* Aquí iría tu componente de Dashboard interno */}
          <button onClick={() => setIsLoggedIn(false)} className="m-10 p-4 bg-white/10">Logout</button>
        </div>
      ) : (
        <>
          <Navbar onLoginClick={() => setShowAuthModal(true)} />
          
          <main>
            {/* El Hero es la entrada principal */}
            <PortalHero />

            {/* Vinculamos 'Soluciones' al framework de innovación */}
            <section id="soluciones" className="scroll-mt-20">
              <InnovationFramework />
            </section>

            {/* Vinculamos 'Sectores' a tu enfoque de mercado */}
            <section id="sectores" className="scroll-mt-20">
              <SectorFocus />
            </section>

            {/* El contacto suele estar integrado o cerca del Footer */}
            <section id="contacto" className="scroll-mt-20">
              <Footer />
            </section>
          </main>

          {/* Aquí puedes renderizar tu Modal de Auth si showAuthModal es true */}
          {showAuthModal && (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
               <div className="bg-[#0D122B] border border-white/10 p-8 rounded-2xl max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4">Portal de Acceso</h2>
                  <p className="text-white/60 text-sm mb-6">Introduce tus credenciales para acceder a la terminal estratégica.</p>
                  <button 
                    onClick={() => setShowAuthModal(false)}
                    className="w-full py-3 bg-[#10B981] text-[#0A0E27] font-bold rounded-xl uppercase text-xs tracking-widest"
                  >
                    Cerrar
                  </button>
               </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;