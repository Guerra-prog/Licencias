import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api';
import { License, Grade } from '../types';
import LicenseCard from '../components/LicenseCard';

export default function Licenses() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedGrade) params.set('gradeId', selectedGrade);
      if (maxPrice) params.set('maxPrice', maxPrice);
      const res = await api.get(`/licenses?${params}`);
      setLicenses(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/grades').then((r) => setGrades(r.data));
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchLicenses, 300);
    return () => clearTimeout(timer);
  }, [search, selectedGrade, maxPrice]);

  const clearFilters = () => {
    setSearch('');
    setSelectedGrade('');
    setMaxPrice('');
  };

  const hasFilters = search || selectedGrade || maxPrice;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-dark-950 border-b border-slate-800 py-12 px-4">
        <div className="container-main text-center">
          <h1 className="section-title">Catálogo de <span className="gradient-text">Licencias</span></h1>
          <p className="section-subtitle mx-auto">
            Encuentra la certificación profesional perfecta para ti
          </p>
        </div>
      </div>

      <div className="container-main section">
        {/* Search & filters bar */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar licencias..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
              id="license-search"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary gap-2 md:w-auto"
            id="toggle-filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {hasFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
          </button>

          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost text-red-400">
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="card p-5 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
            <div>
              <label className="label">Grado de especialización</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="input"
                id="filter-grade"
              >
                <option value="">Todos los grados</option>
                {grades.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Precio máximo (USD)</label>
              <input
                type="number"
                min="0"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Sin límite"
                className="input"
                id="filter-max-price"
              />
            </div>
          </div>
        )}

        {/* Grade tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedGrade('')}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              !selectedGrade ? 'bg-primary-500 text-white' : 'bg-dark-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          {grades.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGrade(selectedGrade === g.id ? '' : g.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedGrade === g.id
                  ? 'text-white'
                  : 'bg-dark-800 text-slate-400 hover:text-white'
              }`}
              style={selectedGrade === g.id ? { background: g.color } : {}}
            >
              {g.name}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="spinner w-10 h-10" />
          </div>
        ) : licenses.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-slate-500 text-lg">No se encontraron licencias</p>
            <button onClick={clearFilters} className="btn-ghost mt-4 text-primary-400">
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {licenses.map((license) => (
              <LicenseCard key={license.id} license={license} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
