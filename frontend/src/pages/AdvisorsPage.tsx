import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Clock, Filter, ChevronDown } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'finanzas', label: 'Finanzas' },
  { id: 'negocios', label: 'Negocios' },
  { id: 'datos', label: 'Datos & IA' },
  { id: 'legal', label: 'Legal' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'tecnologia', label: 'Tecnologia' },
  { id: 'rrhh', label: 'Recursos Humanos' },
  { id: 'startups', label: 'Startups' },
];

const MOCK_ADVISORS = [
  {
    id: '1',
    name: 'Carlos Mendoza',
    title: 'CFO Independiente',
    category: 'finanzas',
    categoryLabel: 'Finanzas',
    rating: 4.9,
    reviews: 87,
    rate: 80,
    availability: 'Disponible hoy',
    available: true,
    tags: ['Flujo de caja', 'Inversiones', 'Startups'],
    initials: 'CM',
    color: '#0F4C35',
  },
  {
    id: '2',
    name: 'Andrea Torres',
    title: 'Estratega de Negocios',
    category: 'negocios',
    categoryLabel: 'Negocios',
    rating: 4.8,
    reviews: 124,
    rate: 95,
    availability: 'Disponible manana',
    available: false,
    tags: ['Expansion', 'Operaciones', 'OKRs'],
    initials: 'AT',
    color: '#1A237E',
  },
  {
    id: '3',
    name: 'Luis Rojas',
    title: 'Data Scientist Senior',
    category: 'datos',
    categoryLabel: 'Datos & IA',
    rating: 5.0,
    reviews: 43,
    rate: 120,
    availability: 'Disponible hoy',
    available: true,
    tags: ['Machine Learning', 'Power BI', 'Python'],
    initials: 'LR',
    color: '#4A148C',
  },
  {
    id: '4',
    name: 'Maria Gonzalez',
    title: 'Abogada Corporativa',
    category: 'legal',
    categoryLabel: 'Legal',
    rating: 4.7,
    reviews: 61,
    rate: 110,
    availability: 'Disponible hoy',
    available: true,
    tags: ['Contratos', 'Compliance', 'M&A'],
    initials: 'MG',
    color: '#B71C1C',
  },
  {
    id: '5',
    name: 'Diego Paredes',
    title: 'Growth Marketing Lead',
    category: 'marketing',
    categoryLabel: 'Marketing',
    rating: 4.6,
    reviews: 98,
    rate: 70,
    availability: 'Disponible manana',
    available: false,
    tags: ['SEO', 'Paid Media', 'Branding'],
    initials: 'DP',
    color: '#E65100',
  },
  {
    id: '6',
    name: 'Sofia Herrera',
    title: 'CTO Fractional',
    category: 'tecnologia',
    categoryLabel: 'Tecnologia',
    rating: 4.9,
    reviews: 55,
    rate: 140,
    availability: 'Disponible hoy',
    available: true,
    tags: ['Arquitectura', 'Cloud', 'DevOps'],
    initials: 'SH',
    color: '#006064',
  },
  {
    id: '7',
    name: 'Roberto Vargas',
    title: 'People & Culture Director',
    category: 'rrhh',
    categoryLabel: 'Recursos Humanos',
    rating: 4.8,
    reviews: 72,
    rate: 75,
    availability: 'Disponible hoy',
    available: true,
    tags: ['Talent', 'Cultura', 'Compensacion'],
    initials: 'RV',
    color: '#1B5E20',
  },
  {
    id: '8',
    name: 'Valeria Castro',
    title: 'Startup Advisor & Investor',
    category: 'startups',
    categoryLabel: 'Startups',
    rating: 4.9,
    reviews: 39,
    rate: 150,
    availability: 'Disponible manana',
    available: false,
    tags: ['Fundraising', 'Pitch', 'Product'],
    initials: 'VC',
    color: '#880E4F',
  },
];

const AdvisorCard = ({ advisor }: { advisor: typeof MOCK_ADVISORS[0] }) => (
  <Link to={`/asesores/${advisor.id}`}>
    <GlassCard className="p-6 border-white/5 hover:border-[#10B981]/30 transition-all duration-500 group cursor-pointer h-full">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{ backgroundColor: advisor.color }}
          >
            {advisor.initials}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm group-hover:text-[#10B981] transition-colors">
              {advisor.name}
            </h3>
            <p className="text-slate-500 text-[11px]">{advisor.title}</p>
          </div>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${advisor.available
            ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20'
            : 'bg-white/5 text-slate-500 border border-white/10'
          }`}>
          {advisor.available ? 'Disponible' : 'Ocupado'}
        </span>
      </div>

      <div className="flex items-center gap-4 mb-5">
        <div className="flex items-center gap-1">
          <Star size={12} className="text-[#10B981] fill-[#10B981]" />
          <span className="text-white text-xs font-bold">{advisor.rating}</span>
          <span className="text-slate-500 text-[10px]">({advisor.reviews})</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <Clock size={11} />
          <span className="text-[10px]">{advisor.availability}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {advisor.tags.map((tag) => (
          <span
            key={tag}
            className="text-[9px] font-bold uppercase tracking-wider px-2 py-1 bg-white/5 text-slate-400 rounded-lg border border-white/5"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div>
          <span className="text-white font-bold text-base">${advisor.rate}</span>
          <span className="text-slate-500 text-[10px]"> / hora</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#10B981] group-hover:gap-2 transition-all">
          Ver perfil
        </span>
      </div>
    </GlassCard>
  </Link>
);

const AdvisorsPage = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('rating');

  const filtered = MOCK_ADVISORS
    .filter((a) => {
      const matchCategory = activeCategory === 'todos' || a.category === activeCategory;
      const matchSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCategory && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'precio_asc') return a.rate - b.rate;
      if (sortBy === 'precio_desc') return b.rate - a.rate;
      return 0;
    });

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-[10px] font-bold tracking-[0.4em] text-[#10B981] uppercase mb-3">
            Directorio profesional
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-white uppercase tracking-tight mb-2">
            Encuentra tu <span className="text-[#10B981] font-normal">asesor ideal</span>
          </h1>
          <p className="text-slate-500 text-sm font-light">
            {MOCK_ADVISORS.length} asesores verificados disponibles
          </p>
        </div>

        {/* BÚSQUEDA + ORDENAR */}
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

        {/* FILTROS POR CATEGORÍA */}
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

        {/* GRID DE ASESORES */}
        {filtered.length > 0 ? (
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