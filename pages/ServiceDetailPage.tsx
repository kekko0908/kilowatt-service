import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Music, Video, Palette, Globe, Code, Share2 } from 'lucide-react';
import { catalogService } from '../services/api';
import { Product, ServiceItem } from '../types';

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap = useMemo(
    () => ({
      music: <Music size={32} />,
      video: <Video size={32} />,
      palette: <Palette size={32} />,
      globe: <Globe size={32} />,
      code: <Code size={32} />,
      share: <Share2 size={32} />,
    }),
    []
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setLoading(true);
    catalogService
      .getServiceCatalogBySlug(id)
      .then(async (data) => {
        if (!mounted) return;
        setService(data);
        if (data?.slug === 'rental') {
          const products = await catalogService.getProducts();
          if (mounted) setRelatedProducts(products);
        } else {
          setRelatedProducts([]);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!service && !loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Servizio non trovato</h2>
          <button onClick={() => navigate('/servizi')} className="text-neon hover:underline">
            Torna ai servizi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen pt-24 pb-20">
      <div className="relative h-[50vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
        {service && <img src={service.image} alt={service.title} className="w-full h-full object-cover" />}
        <div className="absolute bottom-0 left-0 w-full z-20 container mx-auto px-4 pb-12">
          <button
            onClick={() => navigate('/servizi')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 uppercase text-xs font-bold tracking-widest transition-colors"
          >
            <ArrowLeft size={16} /> Torna indietro
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-neon bg-black/50 p-3 rounded-xl border border-gray-800 backdrop-blur-sm">
              {service ? iconMap[service.iconKey as keyof typeof iconMap] : null}
            </div>
            <div className="h-px w-20 bg-neon" />
          </div>
          <h1 className="font-display italic font-black text-5xl md:text-7xl text-white uppercase">
            {service?.title || 'Caricamento...'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2">
          <h3 className="text-2xl font-bold text-white mb-6 uppercase">Descrizione Completa</h3>
          <p className="text-gray-300 text-lg leading-relaxed mb-12">
            {service?.longDescription || 'Caricamento descrizione...'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-900/30 border border-gray-800 p-8 rounded-xl">
              <h4 className="text-neon font-bold uppercase mb-4 text-sm tracking-widest">Per chi è adatto</h4>
              <ul className="space-y-3">
                {['Aziende e Startup', 'Organizzatori Eventi', 'Privati', 'Artisti & Band'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400 text-sm">
                    <CheckCircle size={16} className="text-gray-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-900/30 border border-gray-800 p-8 rounded-xl">
              <h4 className="text-neon font-bold uppercase mb-4 text-sm tracking-widest">Cosa Offriamo</h4>
              <ul className="space-y-3">
                {['Supporto H24', 'Preventivi Gratuiti', 'Tecnici Qualificati', 'Attrezzatura Top Brand'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-400 text-sm">
                    <CheckCircle size={16} className="text-gray-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white uppercase">Articoli correlati</h3>
                <span className="text-xs uppercase tracking-widest text-gray-500">Consigliati per il noleggio</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/prodotti/${product.slug}`)}
                    className="bg-gray-900/40 border border-gray-800 rounded-xl overflow-hidden group hover:border-neon transition-all cursor-pointer"
                  >
                    <div className="h-48 overflow-hidden relative bg-black/50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-black/70 border border-neon text-neon text-xs font-bold px-2 py-1 rounded">
                        �{product.priceDay}
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-800">
                      <div className="text-[10px] text-neon uppercase font-bold tracking-widest mb-1">
                        {product.category}
                      </div>
                      <h4 className="text-white font-bold text-sm leading-tight mb-2 group-hover:text-neon transition-colors truncate">
                        {product.name}
                      </h4>
                      <p className="text-gray-500 text-xs line-clamp-2">{product.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl sticky top-32">
            <h3 className="text-xl font-bold text-white mb-2 uppercase italic">Interessato?</h3>
            <p className="text-gray-500 text-sm mb-6">Contattaci per un preventivo personalizzato su {service?.title}.</p>

            <button
              onClick={() => navigate('/contatti')}
              className="w-full bg-neon text-black font-bold uppercase py-4 rounded hover:bg-white transition-colors mb-4"
            >
              Richiedi Preventivo
            </button>
            <button
              onClick={() => navigate('/pacchetti')}
              className="w-full bg-transparent border border-gray-700 text-white font-bold uppercase py-4 rounded hover:bg-gray-800 transition-colors"
            >
              Vedi Pacchetti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
