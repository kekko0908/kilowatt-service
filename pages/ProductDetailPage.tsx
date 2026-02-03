import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Box, Truck, ShieldCheck } from 'lucide-react';
import { addProductToQuote } from '../lib/quoteStore';
import { catalogService } from '../services/api';
import { Product } from '../types';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    setAdded(false);
  }, [id]);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    catalogService
      .getProductBySlug(id)
      .then((data) => {
        if (mounted) setProduct(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!product && !loading) return <div className="text-white">Prodotto non trovato</div>;

  return (
    <div className="bg-black min-h-screen pt-32 pb-20 px-4">
      <div className="container mx-auto">
        <button
          onClick={() => navigate('/prodotti')}
          className="flex items-center gap-2 text-gray-500 hover:text-white mb-8 uppercase text-xs font-bold tracking-widest transition-colors"
        >
          <ArrowLeft size={16} /> Torna al catalogo
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl aspect-square flex items-center justify-center p-12 relative overflow-hidden group">
              <div className="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              {product && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
          </div>

          <div>
            <div className="inline-block px-3 py-1 bg-gray-900 text-neon text-xs font-bold uppercase tracking-widest rounded-full mb-4 border border-gray-800">
              {product?.category || '...'}
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-black italic text-white mb-4 leading-none">
              {product?.name || 'Caricamento...'}
            </h1>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">{product?.description}</p>

            {product && (
              <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-6 mb-8">
                <h4 className="text-white text-xs font-bold uppercase mb-4 border-b border-gray-800 pb-2">Scheda Tecnica</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key}>
                      <span className="block text-gray-500 text-xs uppercase mb-1">{key}</span>
                      <span className="block text-white font-mono text-sm">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-end justify-between border-t border-gray-800 pt-8 mb-8">
              <div>
                <span className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1 block">Tariffa Giornaliera</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-neon">€{product?.priceDay ?? '--'}</span>
                  <span className="text-gray-500 text-sm font-bold">+ IVA</span>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-green-500 text-xs font-bold uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Disponibile
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <button
                onClick={() => {
                  if (!product) return;
                  addProductToQuote(product.id);
                  setAdded(true);
                  setToastVisible(true);
                }}
                className="flex-1 bg-neon text-black py-4 rounded-lg font-black uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 text-lg shadow-[0_0_20px_rgba(163,230,53,0.3)]"
              >
                {added ? 'Aggiunto al Preventivo' : 'Aggiungi al Preventivo'} <Zap size={20} fill="black" />
              </button>
              {added && (
                <button
                  onClick={() => navigate('/pacchetti')}
                  className="text-xs uppercase tracking-widest text-neon border border-neon/40 py-3 rounded hover:border-neon hover:text-white transition-colors"
                >
                  Vai al configuratore preventivo
                </button>
              )}
            </div>
            {toastVisible && product && (
              <div className="fixed bottom-24 right-6 z-50 bg-black border border-gray-800 px-4 py-3 rounded-xl shadow-2xl">
                <div className="text-xs uppercase tracking-widest text-gray-500">Aggiunto al preventivo</div>
                <div className="text-white font-bold text-sm">{product.name}</div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-900/30 rounded border border-gray-800">
                <Box className="mx-auto text-gray-500 mb-2" size={20} />
                <span className="text-[10px] text-gray-400 uppercase font-bold">Flight Case Incluso</span>
              </div>
              <div className="p-4 bg-gray-900/30 rounded border border-gray-800">
                <Truck className="mx-auto text-gray-500 mb-2" size={20} />
                <span className="text-[10px] text-gray-400 uppercase font-bold">Consegna Disponibile</span>
              </div>
              <div className="p-4 bg-gray-900/30 rounded border border-gray-800">
                <ShieldCheck className="mx-auto text-gray-500 mb-2" size={20} />
                <span className="text-[10px] text-gray-400 uppercase font-bold">Testato & Garantito</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
