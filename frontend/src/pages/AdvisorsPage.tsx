import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Star, Clock, ChevronDown } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { supabase } from '../lib/supabase';

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'Finanzas', label: 'Finanzas' },
  { id: 'Negocios', label: 'Negocios' },
  { id: 'Datos & IA', label: 'Datos & IA' },
  { id: 'Legal', label: 'Legal' },
  { id: 'Marketing', label: 'Marketing' },
  { id: 'Tecnologia', label: 'Tecnologia' },
  { id: 'Recursos Humanos', label: 'Recursos Humanos' },
  { id: 'Startups', label: 'Startups' },
];

const COLORS: Record<string, string> = {
  'Finanzas': '#0F4C35',
  'Negocios': '#1A237E',
  'Datos & IA': '#4A148C',
  'Legal': '#B71C1C',
  'Marketing': '#E65100',
  'Tecnologia': '#006064',
  'Recursos Humanos': '#1B5E20',
  'Startups': '#880E4F',
};

const getInitials = (name: string) => {
  if (!name) return 'A';
  const parts = name.split(' ');
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
};

const AdvisorCard = ({ advisor }: { advisor: any }) => {
  const color = COLORS[advisor.category] || '#0F4C35';
  const name = advisor.profiles?.full_name || advisor.title || 'Asesor';
  const initials = getInitials(name);
  const avatarUrl = advisor.avatar_url || advisor.profiles?.avatar_url;

  return (
    <Link to={`/asesores/${advisor.id}`}>
      <GlassCard className="p-6 border-white/5 hover:border-[#10B981]/30 transition-all duration-500 group cursor-pointer h-full">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                {initials.toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-white font-bold text-sm group-hover:text-[#10B981] transition-colors">
                {name}
              </h3>
              <p className="text-slate-500 text-[11px]">{advisor.title}</p>
            </div>
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0 ${advisor.available
              ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
              : 'bg-white/5 text-slate-500 border border-white/10'
            }`}>
            {advisor.available ? 'Disponible' : 'Ocupado'}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-[#10B981] fill-[#10B981]" />
            <span className="text-white text-xs font-bold">{Number(advisor.rating || 5).toFixed(1)}</span>
            <span className="text-slate-500 text-[10px]">({advisor.total_reviews || 0})</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Clock size={11} />
            <span className="text-[10px]">{advisor.total_sessions || 0}+ sesiones</span>
          </div>
        </div>

        {advisor.tags && advisor.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {advisor.tags.slice(0, 3).map((tag: string) => (
              <span
                key={tag}
                className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-white/5 text-slate-400 rounded-lg border border-white/5"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
            {advisor.category}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981]">
            Ver perfil →
          </span>
        </div>
      </GlassCard>
    </Link>
  );
};

const AdvisorsPage = () => {
  const [searchParams] = useSearchParams();
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('categoria') || 'todos'
  );
  const [sortBy, setSortBy] = useState('rating');

  useEffect(() => {
    fetchAdvisors();
  }, []);

  const fetchAdvisors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('advisors')
      .select('*, profiles ( full_name, avatar_url )')
      .order('rating', { ascending: false });

    if (!error && data) setAdvisors(data);
    setLoading(false);
  };

  const filtered = advisors
    .filter((a) => {
      const matchCategory = activeCategory === 'todos' || a.category === activeCategory;
      const name = a.profiles?.full_name || a.title || '';
      const matchSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.category || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'precio_asc') return (a.rate || 0) - (b.rate || 0);
      if (sortBy === 'precio_desc') return (b.rate || 0) - (a.rate || 0);
      return 0;
    });

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="mb-10">
          <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">
            Directorio profesional
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-tight mb-2">
            Encuentra tu <span className="text-[#10B981] font-normal">asesor ideal</span>
          </h1>
          <p className="text-slate-500 text-sm font-light">
            {loading ? 'Cargando asesores...' : `${advisors.length} asesores verificados disponibles`}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, especialidad o habilidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:border-[#10B981]/40 focus:outline-none transition-colors"
            />
          </div>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-slate-300 focus:border-[#10B981]/40 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="rating" className="bg-[#0A0E27]">Mejor valorados</option>
              <option value="precio_asc" className="bg-[#0A0E27]">Menor precio</option>
              <option value="precio_desc" className="bg-[#0A0E27]">Mayor precio</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${activeCategory === cat.id
                  ? 'bg-[#10B981] text-[#0A0E27]'
                  : 'bg-white/5 text-slate-400 border border-white/10 hover:border-[#10B981]/30 hover:text-white'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((advisor) => (
              <AdvisorCard key={advisor.id} advisor={advisor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-slate-600 text-sm uppercase tracking-widest">
              No se encontraron asesores con ese criterio
            </p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('todos'); }}
              className="mt-4 text-[#10B981] text-[11px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity"
            >
              Limpiar filtros
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdvisorsPage;
