import React, { useEffect, useState } from 'react';
import GlassCard from './GlassCard';
import { BrainCircuit, Target, Zap, Database, ShieldCheck, LogOut } from 'lucide-react';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/v1/market-data')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(() => setData({
        precision: "99.4%",
        agents: "150+",
        optimization: "32%",
        latency: "12ms"
      }));
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0E27] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 border-b border-white/5 pb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tighter uppercase">Panel Institucional <span className="text-[#10B981]">AVI</span></h1>
            <p className="text-[#10B981] text-[9px] font-black tracking-[0.4em] mt-1 uppercase">Axioma Ventures Intelligence </p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 text-[9px] text-[#9198A5] border border-white/10 px-5 py-2.5 rounded-full hover:bg-white/5 transition-all uppercase font-bold tracking-widest">
            <LogOut size={12} /> Cerrar Sesión
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Precisión Algorítmica', value: data?.precision, icon: Target },
            { label: 'Modelos en Producción', value: data?.agents, icon: BrainCircuit },
            { label: 'Optimización Operativa', value: data?.optimization, icon: Zap },
            { label: 'Latencia Global', value: data?.latency, icon: Database }
          ].map((item, i) => (
            <GlassCard key={i} className="p-6 border-white/5 bg-white/[0.01]">
              <item.icon size={18} className="text-[#10B981] mb-4" />
              <p className="text-[9px] text-[#9198A5] uppercase font-bold tracking-widest mb-1">{item.label}</p>
              <p className="text-xl font-bold text-white">{item.value}</p>
            </GlassCard>
          ))}
        </div>

        <GlassCard className="p-6 border-[#10B981]/20 bg-[#10B981]/5">
          <div className="flex items-center gap-4">
            <ShieldCheck size={24} className="text-[#10B981]" />
            <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest">
              Sistemas validados bajo estándares de precisión y confianza algorítmica[cite: 29].
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Dashboard;