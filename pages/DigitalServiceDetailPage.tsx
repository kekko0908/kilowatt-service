import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { catalogService } from '../services/api';
import {
  DigitalService,
  getDigitalServiceImage,
  mapDigitalService
} from '../lib/digitalServices';

const fallbackDeliverables = [
  'Analisi iniziale e definizione obiettivi',
  'Strategia e concept creativo',
  'Esecuzione con team dedicato',
  'Revisione e ottimizzazione finale'
];

const fallbackSteps = [
  'Briefing e raccolta materiali',
  'Proposta e validazione del concept',
  'Sviluppo operativo e revisioni',
  'Consegna e supporto post-lancio'
];

const helpPoints = [
  'Confronto continuo per mantenere coerenza e obiettivi chiari.',
  'Processo trasparente con feedback rapidi e decisioni guidate.',
  "Output pronti all'uso con file e asset organizzati.",
  "Supporto per l'attivazione e i primi risultati."
];

const DigitalServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [service, setService] = useState<DigitalService | null>(null);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    setLoading(true);
    catalogService
      .getDigitalServices()
      .then((rows) => {
        if (!mounted) return;
        const mapped = (rows || []).map(mapDigitalService);
        const index = mapped.findIndex((item) => item.slug === slug);
        const found = index >= 0 ? mapped[index] : null;
        setService(found);
        setServiceIndex(index >= 0 ? index : 0);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  const heroImage = useMemo(() => {
    if (!service) return getDigitalServiceImage('fallback', serviceIndex);
    return getDigitalServiceImage(service.slug, serviceIndex);
  }, [service, serviceIndex]);

  if (!service && !loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Servizio non trovato</h2>
          <button onClick={() => navigate('/digitale')} className="text-neon hover:underline">
            Torna ai servizi digitali
          </button>
        </div>
      </div>
    );
  }

  const deliverables =
    service?.deliverables && service.deliverables.length > 0 ? service.deliverables : fallbackDeliverables;
  const steps = service?.steps && service.steps.length > 0 ? service.steps : fallbackSteps;

  return (
    <div className="bg-black min-h-screen pt-24 pb-20">
      <div className="relative h-[45vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-10" />
        <img src={heroImage} alt={service?.name || 'Servizio digitale'} className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 w-full z-20 container mx-auto px-4 pb-10">
          <button
            onClick={() => navigate('/digitale')}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 uppercase text-xs font-bold tracking-widest transition-colors"
          >
            <ArrowLeft size={16} /> Torna ai servizi digitali
          </button>
          <div className="text-neon text-xs uppercase tracking-widest font-bold">{service?.category}</div>
          <h1 className="font-display italic font-black text-4xl md:text-6xl text-white uppercase mt-2">
            {service?.name || 'Caricamento...'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h3 className="text-2xl font-bold text-white mb-4 uppercase">Panoramica del servizio</h3>
            <p className="text-gray-300 text-base leading-relaxed">
              {service?.details || 'Descrizione in arrivo. Contattaci per una panoramica completa.'}
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-white mb-4 uppercase">Cosa facciamo noi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliverables.map((item, idx) => (
                <div
                  key={`${item}-${idx}`}
                  className="bg-gray-900/40 border border-gray-800 rounded-xl p-4 flex items-start gap-3"
                >
                  <CheckCircle size={18} className="text-neon mt-0.5" />
                  <span className="text-gray-200 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-white mb-4 uppercase">Roadmap operativa</h3>
            <div className="relative rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/60 via-black/80 to-black/90 p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">
                  Percorso operativo
                </span>
                <span className="text-[10px] uppercase tracking-widest text-neon">
                  {steps.length} step
                </span>
              </div>
              <div className="relative">
                <div className="absolute left-6 right-6 top-8 h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent hidden md:block" />
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 overflow-x-auto pb-2 md:pb-4">
                  {steps.map((step, idx) => (
                    <div
                      key={`${step}-${idx}`}
                      className="relative bg-black/70 border border-gray-800 rounded-2xl p-5 md:p-6 flex-1 md:min-w-[260px] shadow-[0_0_30px_rgba(163,230,53,0.08)]"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-neon text-black font-black flex items-center justify-center text-sm shadow-[0_0_15px_rgba(163,230,53,0.5)]">
                          {idx + 1}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-500">
                          Step {idx + 1}
                        </div>
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-white mb-4 uppercase">
              Come ti aiutiamo a ottenere un servizio impeccabile
            </h3>
            <div className="bg-gray-900/40 border border-gray-800 rounded-xl p-6 space-y-3">
              {helpPoints.map((point, idx) => (
                <div key={`${point}-${idx}`} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-neon mt-2" />
                  <span>{point}</span>
                </div>
              ))}
              {service?.audience && (
                <div className="text-[11px] uppercase tracking-widest text-gray-500 pt-2">
                  Ideale per: {service.audience}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 p-8 rounded-xl sticky top-28">
            <div className="text-xs uppercase tracking-widest text-gray-500">Tariffa</div>
            <div className="text-3xl font-black text-neon mt-2">€{service?.price ?? '--'}</div>
            <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-1">una tantum / mensile</div>

            <p className="text-gray-400 text-sm mt-6">
              Vuoi capire se questo servizio e' adatto al tuo progetto? Parliamone.
            </p>

            <button
              onClick={() => navigate('/contatti')}
              className="w-full bg-neon text-black font-bold uppercase py-4 rounded mt-6 hover:bg-white transition-colors"
            >
              Richiedi consulenza
            </button>
            <button
              onClick={() => navigate('/pacchetti')}
              className="w-full bg-transparent border border-gray-700 text-white font-bold uppercase py-4 rounded mt-3 hover:bg-gray-800 transition-colors text-xs"
            >
              Vedi pacchetti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalServiceDetailPage;
