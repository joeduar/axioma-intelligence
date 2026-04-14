import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Star, Shield, Filter, SlidersHorizontal, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'Finanzas', label: 'Finanzas' },
  { id: 'Negocios', label: 'Negocios' },
  { id: 'Datos & IA', label: 'Datos & IA' },
  { id: 'Legal', label: 'Legal' },
  { id: 'Marketing', label: 'Marketing' },
  { id: 'Tecnologia', label: 'Tecnología' },
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
  if (!name) return 'AX';
  const parts = name.split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const AdvisorCard = ({ advisor, hasActivePlan, navigate }: { advisor: any; hasActivePlan: boolean; navigate: (path: string) => void }) => {
  const name = advisor.profiles?.full_name || advisor.title || 'Asesor';
  const avatarUrl = advisor.profiles?.avatar_url || advisor.avatar_url;
  const color = COLORS[advisor.category] || '#0F4C35';
  const initials = getInitials(name);
  const hasRating = advisor.total_reviews > 0;
  const canRequest = hasActivePlan && advisor.available;

  return (
    <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1 transition-all duration-300">

      {/* AVATAR AREA — always links to profile */}
      <Link to={`/asesores/${advisor.id}`} className="block">
        <div className="relative h-44 flex items-center justify-center"
          style={{ backgroundColor: `${color}08` }}>
          <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg"
            style={{ backgroundColor: color }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl">
                {initials}
              </div>
            )}
          </div>

          {advisor.available && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full shadow-sm border border-gray-100">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-[10px] font-semibold text-gray-600">Disponible</span>
            </div>
          )}

          {advisor.verified && (
            <div className="absolute top-4 left-4 flex items-center gap-1 px-2.5 py-1 bg-white rounded-full shadow-sm border border-gray-100">
              <Shield size={10} className="text-[#10B981]" />
              <span className="text-[10px] font-semibold text-gray-600">Verificado</span>
            </div>
          )}
        </div>
      </Link>

      {/* CONTENIDO */}
      <div className="p-5">
        <Link to={`/asesores/${advisor.id}`} className="block mb-3">
          <h3 className="font-bold text-[#0A0E27] text-base mb-0.5 group-hover:text-[#10B981] transition-colors">
            {name}
          </h3>
          <p className="text-gray-400 text-sm">{advisor.title}</p>
        </Link>

        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: `${color}12`, color: color }}>
            {advisor.category}
          </span>
          {advisor.languages && (
            <span className="text-gray-400 text-[10px]">{advisor.languages.split(',')[0].trim()}</span>
          )}
        </div>

        {advisor.tags && advisor.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {advisor.tags.slice(0, 3).map((tag: string) => (
              <span key={tag} className="text-[10px] text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
          {hasRating ? (
            <div className="flex items-center gap-1.5">
              <Star size={13} className="text-[#10B981] fill-[#10B981]" />
              <span className="font-bold text-[#0A0E27] text-sm">{advisor.rating?.toFixed(1)}</span>
              <span className="text-gray-400 text-xs">({advisor.total_reviews})</span>
            </div>
          ) : (
            <span className="text-gray-300 text-xs">Sin reseñas aún</span>
          )}

          {canRequest ? (
            <button
              onClick={() => navigate(`/asesores/${advisor.id}`)}
              className="flex items-center gap-1 text-[10px] font-bold text-white bg-[#10B981] px-3 py-1.5 rounded-full hover:bg-[#0ea371] transition-all"
            >
              <Send size={10} /> Solicitar sesión
            </button>
          ) : (
            <Link
              to={`/asesores/${advisor.id}`}
              className="text-[10px] font-semibold text-[#10B981] hover:underline"
            >
              Ver perfil →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const AdvisorsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('categoria') || 'todos');
  const [sortBy, setSortBy] = useState('rating');
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActivePlan, setHasActivePlan] = useState(false);

  useEffect(() => {
    fetchAdvisors();
  }, []);

  useEffect(() => {
    if (user) checkPlan();
    else setHasActivePlan(false);
  }, [user]);

  const fetchAdvisors = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('advisors')
      .select('*, profiles ( full_name, avatar_url )')
      .order('rating', { ascending: false });
    setAdvisors(data || []);
    setLoading(false);
  };

  const checkPlan = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('client_id', user!.id)
      .eq('status', 'activa')
      .limit(1);
    setHasActivePlan(!!(data && data.length > 0));
  };

  const filtered = advisors
    .filter((a) => {
      const matchCat = activeCategory === 'todos' || a.category === activeCategory;
      const name = a.profiles?.full_name || a.title || '';
      const matchSearch =
        name.toLowerCase().includes(search.toLowerCase()) ||
        (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.category || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.tags || []).some((t: string) => t.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'sessions') return (b.total_sessions || 0) - (a.total_sessions || 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER DE PAGINA */}
      <div className="bg-white border-b border-gray-100 pt-28 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#10B981] text-xs font-bold uppercase tracking-widest mb-2">Directorio</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0A0E27] mb-2">
            Encuentra tu asesor ideal
          </h1>
          <p className="text-gray-400">
            {loading ? 'Cargando...' : `${advisors.length} profesionales verificados disponibles`}
          </p>
          {hasActivePlan && (
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#10B981]/10 rounded-full border border-[#10B981]/20">
              <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span className="text-xs font-bold text-[#10B981]">Plan activo — puedes solicitar sesiones directamente</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* BARRA DE FILTROS */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, especialidad o habilidad..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/10 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-400">
              <SlidersHorizontal size={16} />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 focus:border-[#10B981] outline-none transition-all cursor-pointer"
            >
              <option value="rating">Mejor valorados</option>
              <option value="sessions">Más sesiones</option>
            </select>
          </div>
        </div>

        {/* CATEGORIAS */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#0A0E27] text-white'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* GRID DE ASESORES */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-white border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((advisor) => (
              <AdvisorCard key={advisor.id} advisor={advisor} hasActivePlan={hasActivePlan} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Filter size={32} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No se encontraron asesores con ese criterio</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('todos'); }}
              className="text-[#10B981] text-sm font-semibold hover:underline"
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
