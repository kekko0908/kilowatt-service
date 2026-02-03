import React, { useEffect, useMemo, useState } from 'react';
import FlowingMenu from '../components/FlowingMenu';
import { catalogService } from '../services/api';
import {
  DigitalService,
  DIGITAL_HERO_IMAGE,
  getDigitalServiceImage,
  mapDigitalService
} from '../lib/digitalServices';

const DigitalServicesPage: React.FC = () => {
  const [services, setServices] = useState<DigitalService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    catalogService
      .getDigitalServices()
      .then((rows) => {
        if (!mounted) return;
        setServices((rows || []).map(mapDigitalService));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const menuItems = useMemo(
    () =>
      services.map((service, idx) => ({
        link: `/digitale/${service.slug}`,
        text: service.name,
        image: getDigitalServiceImage(service.slug, idx)
      })),
    [services]
  );

  return (
    <div className="bg-black min-h-screen pt-28 pb-20">
      <section className="relative w-full overflow-hidden border-b border-gray-900">
        <img
          src={DIGITAL_HERO_IMAGE}
          alt="Servizi digitali"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
        <div className="relative z-10 container mx-auto px-4 py-16 md:py-20 lg:py-24 max-w-3xl">
          <span className="text-neon text-xs font-bold uppercase tracking-widest">Servizi digitali</span>
          <h1 className="mt-4 text-4xl md:text-5xl font-display font-black italic text-white leading-none">
            Soluzioni digitali su misura per il tuo brand
          </h1>
          <p className="mt-4 text-gray-300 text-sm md:text-base leading-relaxed">
            Dalla brand identity alle landing page, costruiamo asset digitali chiari, coerenti e
            pronti a convertire. Scegli un servizio per vedere la scheda completa.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white italic">Esplora i servizi</h2>
            <p className="text-gray-500 text-sm">
              Clicca su un servizio per scoprire tutti i dettagli, la roadmap e cosa realizziamo.
            </p>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-neon border border-neon/30 px-3 py-1 rounded-full">
            Clicca sui servizi per approfondire
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 italic py-10">Caricamento servizi digitali...</div>
        ) : services.length === 0 ? (
          <div className="text-center text-gray-500 italic py-10">Nessun servizio disponibile.</div>
        ) : (
          <div className="h-[55vh] md:h-[60vh] border border-gray-800 rounded-2xl overflow-hidden">
            <FlowingMenu
              items={menuItems}
              speed={15}
              textColor="#ffffff"
              bgColor="#060010"
              marqueeBgColor="#a3e635"
              marqueeTextColor="#060010"
              borderColor="#1f2937"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DigitalServicesPage;
