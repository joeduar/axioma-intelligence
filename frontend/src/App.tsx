import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider } from './context/AuthContext';

import HomePage from './pages/HomePage';
import AdvisorsPage from './pages/AdvisorsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import AdvisorProfilePage from './pages/AdvisorProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClientDashboard from './pages/ClientDashboard';
import AdvisorDashboard from './pages/AdvisorDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import PlansPage from './pages/PlansPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.35 }}
  >
    {children}
  </motion.div>
);

const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#0A0E27] text-white flex flex-col">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

const CleanLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-[#0A0E27] text-white">
    {children}
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        <Route path="/" element={
          <PublicLayout><PageTransition><HomePage /></PageTransition></PublicLayout>
        } />

        <Route path="/asesores" element={
          <PublicLayout><PageTransition><AdvisorsPage /></PageTransition></PublicLayout>
        } />

        <Route path="/asesores/:id" element={
          <PublicLayout><PageTransition><AdvisorProfilePage /></PageTransition></PublicLayout>
        } />

        <Route path="/como-funciona" element={
          <PublicLayout><PageTransition><HowItWorksPage /></PageTransition></PublicLayout>
        } />

        <Route path="/nosotros" element={
          <PublicLayout><PageTransition><AboutPage /></PageTransition></PublicLayout>
        } />

        <Route path="/login" element={
          <CleanLayout><PageTransition><LoginPage /></PageTransition></CleanLayout>
        } />

        <Route path="/registro" element={
          <CleanLayout><PageTransition><RegisterPage /></PageTransition></CleanLayout>
        } />

        <Route path="/dashboard/cliente" element={
          <CleanLayout>
            <ProtectedRoute role="cliente">
              <PageTransition><ClientDashboard /></PageTransition>
            </ProtectedRoute>
          </CleanLayout>
        } />

        <Route path="/dashboard/asesor" element={
          <CleanLayout>
            <ProtectedRoute role="asesor">
              <PageTransition><AdvisorDashboard /></PageTransition>
            </ProtectedRoute>
          </CleanLayout>
        } />

        <Route path="/planes/:advisorId/:sessionId" element={
          <CleanLayout><PageTransition><PlansPage /></PageTransition></CleanLayout>
        } />

        <Route path="/planes" element={
          <CleanLayout>
            <PageTransition>
              <PlansPage /></PageTransition>
          </CleanLayout>
        } />

        <Route path="/checkout/:planType/:advisorId/:sessionId" element={
          <CleanLayout>
            <PageTransition>
              <CheckoutPage /></PageTransition>
          </CleanLayout>
        } />

        <Route path="/pago/exito" element={
          <CleanLayout>
            <PageTransition><PaymentSuccessPage /></PageTransition>
          </CleanLayout>
        } />

        <Route path="/pago/cancelado" element={
          <CleanLayout>
            <PageTransition><PaymentCancelledPage /></PageTransition>
          </CleanLayout>
        } />

        <Route path="*" element={
          <PublicLayout>
            <PageTransition>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <p className="text-[#10B981] text-[10px] font-bold tracking-[0.4em] uppercase mb-4">Error 404</p>
                  <h1 className="text-4xl font-light text-white uppercase tracking-widest mb-6">Pagina no encontrada</h1>
                  <a href="/" className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#10B981] border-b border-[#10B981]/30 pb-1 hover:border-[#10B981] transition-all">
                    Volver al inicio
                  </a>
                </div>
              </div>
            </PageTransition>
          </PublicLayout>
        } />

      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <LoadingScreen onAccess={() => setLoading(false)} />;
  }

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AnimatedRoutes />
      </Router>
    </AuthProvider>
  );
}