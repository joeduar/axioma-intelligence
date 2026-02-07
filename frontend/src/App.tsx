import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import PortalHero from './components/PortalHero'; 
import PillarsSection from './components/PillarsSection';
import SectorFocus from './components/SectorFocus';
import InnovationFramework from './components/InnovationFramework';
import Footer from './components/Footer';

import { Brain, Cpu, BarChart3, ArrowRight } from 'lucide-react'; // Importamos nuevos iconos

const SolucionesPage = () => {
  const services = [
    {
      title: "Análisis Predictivo",
      desc: "Modelos avanzados de Machine Learning para anticipar tendencias de mercado y comportamientos del consumidor.",
      icon: <BarChart3 className="w-8 h-8 text-cyan-400" />,
      color: "border-cyan-500/30"
    },
    {
      title: "Automatización Inteligente",
      desc: "Optimización de flujos de trabajo mediante agentes de IA que reducen costos operativos y errores humanos.",
      icon: <Cpu className="w-8 h-8 text-[#10B981]" />,
      color: "border-[#10B981]/30"
    },
    {
      title: "Consultoría Estratégica",
      desc: "Acompañamiento en la integración de cultura Data-Driven y arquitectura de datos para escalabilidad global.",
      icon: <Brain className="w-8 h-8 text-purple-400" />,
      color: "border-purple-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabecera de la página */}
        <div className="text-center mb-20 animate-fade-in">
          <h2 className="text-[#10B981] font-bold tracking-[0.3em] uppercase text-xs mb-4">Innovation Suite</h2>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Nuestras <br className="md:hidden" /> <span className="text-[#10B981]">Soluciones</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Fusionamos inteligencia artificial con visión empresarial para transformar datos crudos en ventajas competitivas reales.
          </p>
        </div>

        {/* Rejilla de servicios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className={`p-8 rounded-2xl bg-white/5 border ${service.color} backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group cursor-default`}
            >
              <div className="mb-6 p-3 bg-black/40 rounded-xl w-fit">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">
                {service.title}
              </h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                {service.desc}
              </p>
              <div className="flex items-center gap-2 text-[#10B981] text-xs font-bold uppercase tracking-widest cursor-pointer hover:gap-4 transition-all">
                Saber más <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};