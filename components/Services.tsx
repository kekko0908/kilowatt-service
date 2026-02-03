import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Music, Video, Palette, Globe, Code, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { catalogService } from '../services/api';
import { ServiceItem } from '../types';

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap = useMemo(
    () => ({
      music: <Music size={40} />,
      video: <Video size={40} />,
      palette: <Palette size={40} />,
      globe: <Globe size={40} />,
      code: <Code size={40} />,
      share: <Share2 size={40} />,
    }),
    []
  );

  useEffect(() => {
    let mounted = true;
    catalogService
      .getServiceCatalog()
      .then((data) => {
        if (mounted) setServices(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section id="services" className="py-20 bg-dark px-4 border-b border-gray-900 relative">
      <div className="container mx-auto">
        <div className="mb-16 text-center">
          <h2 className="font-display italic font-black text-5xl md:text-6xl text-white mb-4">
            I NOSTRI <span className="text-neon">SERVIZI</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Soluzioni professionali per ogni tipo di evento e necessità digitale.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {(loading ? Array.from({ length: 3 }) : services).map((service, idx) => (
            <div
              key={loading ? idx : service.id}
              onClick={() => {
                if (!loading) navigate(`/servizi/${service.slug}`);
              }}
              className={`group relative p-5 md:p-8 bg-gray-900/50 border border-gray-800 transition-all duration-300 text-left rounded-xl overflow-hidden ${
                loading ? 'animate-pulse' : 'hover:border-neon hover:-translate-y-2 cursor-pointer'
              }`}
            >
              <div className="absolute inset-0 bg-neon/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 text-neon mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 bg-black/50 w-fit p-2.5 md:p-3 rounded-lg border border-gray-800">
                {loading ? <div className="w-10 h-10 rounded bg-gray-800" /> : iconMap[service.iconKey as keyof typeof iconMap]}
              </div>

              <h3 className="relative z-10 text-lg md:text-2xl font-display font-bold text-white mb-2 md:mb-3 uppercase italic group-hover:text-neon transition-colors">
                {loading ? 'Caricamento...' : service.title}
              </h3>

              <p className="relative z-10 text-gray-400 leading-relaxed text-xs md:text-sm line-clamp-3">
                {loading ? 'Recupero contenuti in corso.' : service.description}
              </p>

              {!loading && (
                <div className="relative z-10 mt-4 md:mt-6 flex items-center text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                  <span className="hidden sm:inline">Vai alla pagina</span>
                  <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
