import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import { AuthProvider } from './context/AuthContext';
import { DarkModeProvider } from './context/DarkModeContext';

import HomePage from './pages/HomePage';
import AdvisorsPage from './pages/AdvisorsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import AdvisorProfilePage from './pages/AdvisorProfilePage';
import ClientDashboard from './pages/ClientDashboard';
import AdvisorDashboard from './pages/AdvisorDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import PlansPage from './pages/PlansPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelledPage from './pages/PaymentCancelledPage';
import AuthPage from './pages/AuthPage';
import SessionActivePage from './pages/SessionActivePage';
import AdminDashboard from './pages/AdminDashboard';
import ResetPasswordPage from './pages/ResetPasswordPage';

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
          <CleanLayout><AuthPage /></CleanLayout>
        } />

        <Route path="/registro" element={
          <CleanLayout><AuthPage /></CleanLayout>
        } />

        <Route path="/dashboard/cliente" element={
          <ProtectedRoute role="cliente">
            <ClientDashboard />
          </ProtectedRoute>
        } />

        <Route path="/dashboard/asesor" element={
          <ProtectedRoute role="asesor">
            <AdvisorDashboard />
          </ProtectedRoute>
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

        <Route path="/sesion/:sessionId" element={
          <ProtectedRoute role="cliente">
            <CleanLayout><SessionActivePage /></CleanLayout>
          </ProtectedRoute>
        } />

        <Route path="/dashboard/admin" element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/reset-password" element={
          <CleanLayout><ResetPasswordPage /></CleanLayout>
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
  const [loading, setLoading] = useState(() => {
    // Solo muestra loading si es la primera vez en esta sesion del navegador
    return !sessionStorage.getItem('app_loaded');
  });

  if (loading) {
    return <LoadingScreen onAccess={() => {
      sessionStorage.setItem('app_loaded', 'true');
      setLoading(false);
    }} />;
  }

  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AnimatedRoutes />
        </Router>
      </AuthProvider>
    </DarkModeProvider>
  );
}