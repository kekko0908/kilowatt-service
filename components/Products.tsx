import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProductToQuote } from '../lib/quoteStore';
import { Product } from '../types';
import { catalogService } from '../services/api';

const Products: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'all' | Product['category']>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'popular' | 'top'>('all');
  const [addedId, setAddedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    catalogService
      .getProducts()
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!addedId) return;
    const timer = setTimeout(() => setAddedId(null), 2000);
    return () => clearTimeout(timer);
  }, [addedId]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    const base = products.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category;
      const matchesText =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term);
      const matchesMin = min === null || Number.isNaN(min) ? true : product.priceDay >= min;
      const matchesMax = max === null || Number.isNaN(max) ? true : product.priceDay <= max;
      return matchesCategory && matchesText && matchesMin && matchesMax;
    });
    if (quickFilter === 'all') return base;
    if (quickFilter === 'popular') return base.slice(0, 8);
    const byPrice = [...base].sort((a, b) => b.priceDay - a.priceDay);
    return byPrice.slice(0, 8);
  }, [search, category, minPrice, maxPrice, products, quickFilter]);

  const handleAddToQuote = (event: React.MouseEvent, productId: string) => {
    event.stopPropagation();
    addProductToQuote(productId);
    setAddedId(productId);
    const product = products.find((p) => p.id === productId);
    setToast(product ? product.name : 'Prodotto');
  };

  return (
    <section id="products" className="py-24 bg-black px-4 border-b border-gray-900">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="font-display italic font-black text-5xl text-white mb-2">
              NOLEGGIO <span className="text-neon outlined-text-fill">PRODOTTI</span>
            </h2>
            <p className="text-gray-400">
              Catalogo completo con filtri. Clicca sul prodotto per la scheda tecnica.
            </p>
            <p className="text-gray-500 text-xs mt-3 uppercase tracking-widest">
              I prodotti aggiunti finiscono nel preventivo del configuratore.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { id: 'all', label: 'Tutti' },
            { id: 'popular', label: 'Più richiesti' },
            { id: 'top', label: 'Top quality' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setQuickFilter(filter.id as 'all' | 'popular' | 'top')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
                quickFilter === filter.id
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-500 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-10">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca per nome o descrizione..."
            className="w-full bg-black border border-gray-800 rounded px-4 py-3 text-sm text-white focus:border-neon outline-none"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as 'all' | Product['category'])}
            className="w-full bg-black border border-gray-800 rounded px-4 py-3 text-sm text-white focus:border-neon outline-none"
          >
            <option value="all">Tutte le categorie</option>
            <option value="audio">Audio</option>
            <option value="lights">Luci</option>
            <option value="video">Video</option>
          </select>
          <input
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Prezzo min €"
            type="number"
            min={0}
            className="w-full bg-black border border-gray-800 rounded px-4 py-3 text-sm text-white focus:border-neon outline-none"
          />
          <input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Prezzo max €"
            type="number"
            min={0}
            className="w-full bg-black border border-gray-800 rounded px-4 py-3 text-sm text-white focus:border-neon outline-none"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {(loading ? Array.from({ length: 4 }) : filteredProducts).map((product, idx) => (
            <div
              key={loading ? idx : product.id}
              onClick={() => !loading && navigate(`/prodotti/${product.slug}`)}
              className={`bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden group transition-all ${
                loading ? 'animate-pulse' : 'hover:border-neon cursor-pointer'
              }`}
            >
              <div className="h-32 sm:h-40 md:h-56 overflow-hidden relative bg-black/50">
                {loading ? (
                  <div className="w-full h-full bg-gray-800" />
                ) : (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-3 md:p-4 group-hover:scale-110 transition-transform duration-500"
                  />
                )}
                {!loading && (
                  <div className="absolute top-2 right-2 bg-black/70 border border-neon text-neon text-[10px] md:text-xs font-bold px-2 py-1 rounded">
                    €{product.priceDay}
                  </div>
                )}
              </div>
              <div className="p-3 md:p-4 border-t border-gray-800">
                <div className="text-[9px] md:text-[10px] text-neon uppercase font-bold tracking-widest mb-1">
                  {loading ? 'Categoria' : product.category}
                </div>
                <h3 className="text-white font-bold text-sm md:text-lg leading-tight mb-2 group-hover:text-neon transition-colors line-clamp-2">
                  {loading ? 'Caricamento...' : product.name}
                </h3>
                <p className="text-gray-500 text-[10px] md:text-xs line-clamp-2 hidden sm:block">
                  {loading ? 'Recupero informazioni prodotto.' : product.description}
                </p>
                {!loading && (
                  <button
                    onClick={(event) => handleAddToQuote(event, product.id)}
                    className={`mt-3 md:mt-4 w-full text-[10px] md:text-xs font-bold uppercase tracking-widest py-2 rounded border transition-colors ${
                      addedId === product.id
                        ? 'bg-neon text-black border-neon'
                        : 'border-gray-700 text-gray-300 hover:border-neon hover:text-neon'
                    }`}
                  >
                    {addedId === product.id ? 'Aggiunto al preventivo' : 'Aggiungi al preventivo'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {toast && (
          <div className="fixed bottom-24 right-6 z-50 bg-black border border-gray-800 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-500">Aggiunto al preventivo</div>
              <div className="text-white font-bold text-sm">{toast}</div>
            </div>
            <button
              onClick={() => navigate('/pacchetti')}
              className="text-xs uppercase font-bold tracking-widest text-neon border border-neon/40 px-3 py-2 rounded hover:border-neon hover:text-white transition-colors"
            >
              Vai al preventivo
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
