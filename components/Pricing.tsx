
import React, { useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileText,
  Info,
  Server,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PackageFeature, Product, ServicePackageRecord } from '../types';
import { loadQuote, saveQuote, clearQuote } from '../lib/quoteStore';
import { apiService, catalogService } from '../services/api';

type Step = 'preset' | 'hardware' | 'digital' | 'summary';
type HardwareCategory = 'audio' | 'lights' | 'video';

type DigitalService = PackageFeature & {
  steps: string[];
  audience: string;
  deliverables: string[];
};

const HARDWARE_CATEGORIES: Array<{
  id: HardwareCategory;
  label: string;
  description: string;
}> = [
  { id: 'audio', label: 'Audio', description: 'Casse, subwoofer e impianti completi.' },
  { id: 'lights', label: 'Luci', description: 'Teste mobili, wash e kit luci dinamici.' },
  { id: 'video', label: 'Video', description: 'Proiettori e soluzioni video professionali.' },
];


const STEP_ORDER: Step[] = ['preset', 'hardware', 'digital', 'summary'];

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>('preset');
  const [startMode, setStartMode] = useState<'custom' | 'preset' | null>(null);
  const [activeCategory, setActiveCategory] = useState<HardwareCategory>('audio');
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<DigitalService[]>([]);
  const [packages, setPackages] = useState<ServicePackageRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState(false);
  const [useStepTransition, setUseStepTransition] = useState(false);
  const [hardwareFilter, setHardwareFilter] = useState<'all' | 'popular' | 'top'>('all');
  const summaryRef = React.useRef<HTMLDivElement | null>(null);
  const [modal, setModal] = useState<
    | { type: 'product'; product: Product }
    | { type: 'service'; service: DigitalService }
    | null
  >(null);

  useEffect(() => {
    const stored = loadQuote();
    if (stored.products.length || stored.services.length) {
      setSelectedProducts(new Set(stored.products));
      setSelectedServices(new Set(stored.services));
      setStartMode('custom');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoadingData(true);
    Promise.allSettled([
      catalogService.getProducts(),
      catalogService.getDigitalServices(),
      catalogService.getPackages(),
    ])
      .then((results) => {
        if (!mounted) return;
        const [productsResult, servicesResult, packagesResult] = results;
        if (productsResult.status === 'fulfilled') {
          setProducts(productsResult.value);
        }
        if (servicesResult.status === 'fulfilled') {
          setServices(
            (servicesResult.value || []).map((row: any) => ({
              id: row.id,
              name: row.name,
              details: row.details || '',
              category: row.category,
              price: Number(row.price),
              audience: row.audience || '',
              deliverables: Array.isArray(row.deliverables) ? row.deliverables : [],
              steps: Array.isArray(row.steps) ? row.steps : [],
            }))
          );
        }
        if (packagesResult.status === 'fulfilled') {
          setPackages(packagesResult.value);
        }
      })
      .finally(() => {
        if (mounted) setLoadingData(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    saveQuote({
      products: Array.from(selectedProducts),
      services: Array.from(selectedServices),
    });
  }, [selectedProducts, selectedServices]);

  useEffect(() => {
    if (!useStepTransition) return;
    const timer = window.setTimeout(() => setUseStepTransition(false), 550);
    return () => window.clearTimeout(timer);
  }, [useStepTransition, currentStep]);

  useEffect(() => {
    if (currentStep !== 'summary') return;
    const timer = window.setTimeout(() => {
      if (!summaryRef.current) return;
      const top = summaryRef.current.getBoundingClientRect().top + window.scrollY - 200;
      window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [currentStep]);

  useEffect(() => {
    if (!packages.length) return;
    const params = new URLSearchParams(location.search);
    const presetSlug = params.get('preset');
    const stepParam = params.get('step') as Step | null;
    if (presetSlug) {
      const pkg = packages.find((item) => item.slug === presetSlug);
      if (pkg) {
        handleSelectPreset(pkg);
      }
    }
    if (stepParam && STEP_ORDER.includes(stepParam)) {
      setStep(stepParam, false);
    }
  }, [packages, location.search]);

  const totalPrice = useMemo(() => {
    let total = 0;
    selectedProducts.forEach((pid) => {
      const product = products.find((p) => p.id === pid);
      if (product) total += product.priceDay;
    });
    selectedServices.forEach((sid) => {
      const service = services.find((s) => s.id === sid);
      if (service) total += service.price;
    });
    return total;
  }, [selectedProducts, selectedServices, products, services]);

  const handleSelectPreset = (pkg: ServicePackageRecord) => {
    setStartMode('preset');
    setSelectedProducts(new Set(pkg.productIds));
    setSelectedServices(new Set(pkg.serviceIds));
  };

  const setStep = (nextStep: Step, withTransition: boolean) => {
    setUseStepTransition(withTransition);
    setCurrentStep(nextStep);
  };

  const handleCustomStart = (jumpToHardware = false) => {
    setStartMode('custom');
    setSelectedProducts(new Set());
    setSelectedServices(new Set());
    if (jumpToHardware) {
      setStep('hardware', false);
    }
  };

  const handleStepClick = (stepId: Step) => {
    if (stepId !== 'preset' && startMode === null) {
      handleCustomStart(false);
    }
    setStep(stepId, false);
  };

  const toggleProduct = (pid: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      const product = products.find((item) => item.id === pid);
      if (!product) return next;
      if (next.has(pid)) {
        next.delete(pid);
        return next;
      }
      products.forEach((item) => {
        if (item.category === product.category) {
          next.delete(item.id);
        }
      });
      next.add(pid);
      return next;
    });
  };

  const toggleService = (sid: string) => {
    setSelectedServices((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      return next;
    });
  };

  const handleSubmitQuote = async () => {
    setSubmitMessage(null);
    setSubmitError(false);
    setIsSubmitting(true);
    const user = await apiService.getCurrentUser();
    if (!user) {
      setSubmitMessage('Per inviare il preventivo devi accedere.');
      setSubmitError(true);
      setIsSubmitting(false);
      return;
    }

    const productItems = products
      .filter((product) => selectedProducts.has(product.id))
      .map((product) => ({ id: product.id, name: product.name, priceDay: product.priceDay }));
    const serviceItems = services
      .filter((service) => selectedServices.has(service.id))
      .map((service) => ({ id: service.id, name: service.name, price: service.price }));

    const result = await catalogService.createQuote({
      userId: user.id,
      products: productItems,
      services: serviceItems,
      total: totalPrice
    });

    if (!result.success) {
      setSubmitMessage(result.error || 'Errore durante l’invio del preventivo.');
      setSubmitError(true);
    } else {
      setSubmitMessage('Preventivo inviato con successo.');
      setSubmitError(false);
    }
    setIsSubmitting(false);
  };


  const goNext = () => {
    const idx = STEP_ORDER.indexOf(currentStep);
    const next = STEP_ORDER[Math.min(idx + 1, STEP_ORDER.length - 1)];
    setStep(next, true);
  };

  const goPrev = () => {
    const idx = STEP_ORDER.indexOf(currentStep);
    const prev = STEP_ORDER[Math.max(idx - 1, 0)];
    setStep(prev, false);
  };

  const resetAll = () => {
    setCurrentStep('preset');
    setStartMode(null);
    setSelectedProducts(new Set());
    setSelectedServices(new Set());
    setSubmitMessage(null);
    setSubmitError(false);
    clearQuote();
  };

  const productsById = useMemo(() => {
    return new Map(products.map((product) => [product.id, product]));
  }, [products]);

  const servicesById = useMemo(() => {
    return new Map(services.map((service) => [service.id, service]));
  }, [services]);

  const hardwareProducts = products.filter((product) => product.category === activeCategory);
  const filteredHardwareProducts = useMemo(() => {
    if (hardwareFilter === 'all') return hardwareProducts;
    if (hardwareProducts.length === 0) return hardwareProducts;
    if (hardwareFilter === 'popular') return hardwareProducts.slice(0, 6);
    const byPrice = [...hardwareProducts].sort((a, b) => b.priceDay - a.priceDay);
    return byPrice.slice(0, 6);
  }, [hardwareFilter, hardwareProducts]);

  const digitalByCategory = [
    { id: 'branding', label: 'Branding & Design' },
    { id: 'web', label: 'Sviluppo Web' },
    { id: 'social', label: 'Social Media' },
  ] as const;

  const canContinue = currentStep !== 'preset' || startMode !== null;

  const renderStepIndicator = () => {
    const steps: { id: Step; label: string; icon: any }[] = [
      { id: 'preset', label: 'Pacchetto', icon: ShoppingBag },
      { id: 'hardware', label: 'Strumentazione', icon: Server },
      { id: 'digital', label: 'Digital', icon: FileText },
      { id: 'summary', label: 'Preventivo', icon: Check },
    ];

    const currentIdx = steps.findIndex((s) => s.id === currentStep);

    return (
      <div className="flex justify-center mb-8 md:mb-12 mt-6 md:mt-10 relative no-print">
        <div className="flex items-start w-full max-w-4xl px-2 pb-2">
          {steps.map((step, idx) => {
            const isActive = idx === currentIdx;
            const isCompleted = idx < currentIdx;
            const isConnectorActive = idx < currentIdx;

            return (
              <div key={step.id} className="flex items-start flex-1">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className="flex flex-col items-center gap-2 bg-black transition-transform hover:-translate-y-0.5 w-20"
                  aria-current={isActive ? 'step' : undefined}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 
                        ${
                          isActive
                            ? 'border-neon bg-neon text-black scale-110 shadow-[0_0_15px_#a3e635]'
                            : isCompleted
                              ? 'border-neon bg-black text-neon'
                              : 'border-gray-800 bg-black text-gray-600'
                        }`}
                  >
                    <step.icon size={18} />
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-widest ${
                      isActive ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {idx < steps.length - 1 && (
                  <span
                    className={`block flex-1 h-px mx-2 sm:mx-3 mt-5 ${
                      isConnectorActive ? 'bg-neon' : 'bg-gray-800'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const StepPreset = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
      <div
        onClick={() => handleCustomStart(true)}
        className="border border-dashed border-gray-700 bg-gray-900/20 hover:bg-gray-900 hover:border-white p-8 rounded-2xl cursor-pointer flex flex-col items-center justify-center text-center group transition-all min-h-[520px]"
      >
        <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-black transition-colors">
          <ShoppingBag size={28} />
        </div>
        <h3 className="font-bold text-white text-xl uppercase mb-2">Configura da Zero</h3>
        <p className="text-gray-500 text-sm">Scegli ogni singolo elemento hardware e software.</p>
      </div>

      {loadingData ? (
        Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={`pkg-skeleton-${idx}`}
            className="border border-gray-800 bg-black/70 p-8 rounded-2xl animate-pulse min-h-[520px]"
          >
            <div className="h-10 w-24 bg-gray-800 rounded mb-4" />
            <div className="h-3 w-full bg-gray-800 rounded mb-2" />
            <div className="h-3 w-2/3 bg-gray-800 rounded" />
          </div>
        ))
      ) : packages.length === 0 ? (
        <div className="col-span-full border border-dashed border-gray-800 rounded-2xl p-10 text-center text-gray-500">
          Nessun piano disponibile al momento.
        </div>
      ) : (
        packages.map((pkg) => {
          const slug = (pkg.slug || '').toLowerCase();
          const isBest = slug.includes('medium');
          const priceOverride =
            slug.includes('basic')
              ? 780
              : slug.includes('medium')
                ? 1280
                : 1440;
          const pkgProducts = pkg.productIds.map((pid) => productsById.get(pid)).filter(Boolean);
          const pkgServices = pkg.serviceIds.map((sid) => servicesById.get(sid)).filter(Boolean);

          return (
            <div key={pkg.id} className="relative group">
              <div
                className={`bg-[#111] border border-gray-800 rounded-2xl p-8 flex flex-col h-full min-h-[520px] hover:border-gray-700 transition-colors duration-300 relative ${
                  isBest ? 'shadow-[0_0_30px_rgba(163,230,53,0.35)] border-neon/70' : ''
                }`}
              >
                {isBest && (
                  <div className="absolute top-4 left-4 text-[11px] font-black uppercase tracking-[0.2em] italic text-transparent bg-clip-text bg-gradient-to-r from-neon via-white to-neon drop-shadow-[0_0_10px_rgba(163,230,53,0.6)]">
                    Best choice!
                  </div>
                )}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-5xl font-bold text-white tracking-tight">€{priceOverride}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{pkg.name}</h3>
                  <p className="text-gray-500 text-sm">Una tantum.</p>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  <div className="text-xs uppercase tracking-widest text-neon">Strumentazione</div>
                  {pkgProducts.length === 0 ? (
                    <div className="text-gray-600 text-sm">Nessun prodotto incluso.</div>
                  ) : (
                    pkgProducts.map((product) => (
                      <div key={product!.id} className="flex items-start gap-3 text-sm text-gray-300">
                        <div className="h-5 w-5 rounded-full bg-neon/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-neon stroke-[3]" />
                        </div>
                        <span>{product!.name}</span>
                      </div>
                    ))
                  )}

                  <div className="pt-2 text-xs uppercase tracking-widest text-cyan-400">Servizi digitali</div>
                  {pkgServices.length === 0 ? (
                    <div className="text-gray-600 text-sm">Nessun servizio incluso.</div>
                  ) : (
                    pkgServices.map((service) => (
                      <div key={service!.id} className="flex items-start gap-3 text-sm text-gray-300">
                        <div className="h-5 w-5 rounded-full bg-cyan-400/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-cyan-400 stroke-[3]" />
                        </div>
                        <span>{service!.name}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-auto">
                  <button
                    onClick={() => navigate(`/pacchetti?preset=${pkg.slug}&step=summary`)}
                    className="w-full py-3 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold transition-colors duration-200"
                  >
                    Scegli piano
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  const StepHardware = () => (
    <div className={`space-y-6 ${useStepTransition ? 'animate-in fade-in slide-in-from-right-8 duration-500' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white italic">Scegli la Strumentazione</h3>
          <p className="text-gray-500 text-sm">Seleziona i prodotti che ti servono per l’evento.</p>
        </div>
        <div className="text-neon text-xs uppercase font-bold tracking-widest bg-neon/10 px-3 py-1 rounded">
          Prezzi giornalieri
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {HARDWARE_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
              activeCategory === category.id
                ? 'bg-neon text-black border-neon'
                : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-500 hover:text-white'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Tutti' },
          { id: 'popular', label: 'Più richiesti' },
          { id: 'top', label: 'Top quality' },
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setHardwareFilter(filter.id as 'all' | 'popular' | 'top')}
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
              hardwareFilter === filter.id
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-gray-500 border-gray-800 hover:border-gray-500 hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="border border-gray-800 rounded-2xl p-6 bg-gray-900/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-neon text-xs font-bold uppercase tracking-widest">
              {HARDWARE_CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h4>
            <p className="text-gray-500 text-sm">
              {HARDWARE_CATEGORIES.find((c) => c.id === activeCategory)?.description}
            </p>
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest">
            {filteredHardwareProducts.length} articoli
          </div>
        </div>

        {loadingData ? (
          <div className="text-center text-gray-500 italic py-10">Caricamento prodotti...</div>
        ) : filteredHardwareProducts.length === 0 ? (
          <div className="text-center text-gray-500 italic py-10">Nessun prodotto in questa categoria.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6">
            {filteredHardwareProducts.map((product) => {
              const isSelected = selectedProducts.has(product.id);
              return (
                <div
                  key={product.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleProduct(product.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleProduct(product.id);
                    }
                  }}
                  className={`text-left border rounded-xl overflow-hidden transition-all group relative cursor-pointer ${
                    isSelected
                      ? 'border-neon bg-gray-900/70 shadow-[0_0_25px_rgba(163,230,53,0.2)]'
                      : 'border-gray-800 bg-black hover:border-gray-600'
                  }`}
                >
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setModal({ type: 'product', product });
                    }}
                    className="absolute top-2 right-2 md:top-3 md:right-3 z-10 w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-700 bg-black/80 text-gray-400 hover:text-neon hover:border-neon transition-colors flex items-center justify-center"
                    aria-label={`Info ${product.name}`}
                  >
                    <Info size={16} />
                  </button>
                  {isSelected && (
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 bg-neon text-black text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                      Selezionato
                    </div>
                  )}
                  <div className="h-28 sm:h-32 md:h-40 bg-black/60 flex items-center justify-center overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain p-3 md:p-4 group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-3 md:p-4">
                    <div className="text-[9px] md:text-[10px] text-gray-500 uppercase font-bold">
                      {product.category}
                    </div>
                    <h4 className="text-white text-sm md:text-base font-bold leading-tight mt-1 line-clamp-2">
                      {product.name}
                    </h4>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-2 line-clamp-2 hidden sm:block">
                      {product.description}
                    </p>
                    <div className="mt-3 md:mt-4 flex items-center justify-between text-[10px] md:text-xs">
                      <span className="text-neon font-bold">€{product.priceDay}</span>
                      <span className="text-gray-500 uppercase tracking-wider">al giorno</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const StepDigital = () => (
    <div className={`space-y-8 ${useStepTransition ? 'animate-in fade-in slide-in-from-right-8 duration-500' : ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white italic">Servizi Digitali</h3>
          <p className="text-gray-500 text-sm">
            Seleziona i servizi e apri le schede per vedere i passaggi operativi.
          </p>
        </div>
        <div className="text-purple-400 text-xs uppercase font-bold tracking-widest bg-purple-900/20 px-3 py-1 rounded">
          Una Tantum / Mensile
        </div>
      </div>

      {loadingData ? (
        <div className="text-center text-gray-500 italic py-10">Caricamento servizi...</div>
      ) : (
        digitalByCategory.map((group) => (
        <div key={group.id} className="space-y-4">
          <h4 className="text-neon text-xs font-bold uppercase tracking-widest">{group.label}</h4>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
            {services.filter((service) => service.category === group.id).map((service) => {
              const isSelected = selectedServices.has(service.id);
              const nameClass =
                service.name.length > 16 ? 'text-[10px] md:text-xs' : 'text-[11px] md:text-sm';
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-4 md:p-6 border rounded-xl cursor-pointer transition-all flex flex-col md:flex-row justify-between items-start gap-3 md:gap-4 group overflow-hidden
                        ${
                          isSelected
                            ? 'bg-gray-900 border-neon shadow-[0_0_10px_rgba(163,230,53,0.1)]'
                            : 'bg-black border-gray-800 hover:border-gray-600'
                        }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 mb-2">
                      <span
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-neon border-neon' : 'border-gray-600'
                        }`}
                      >
                        {isSelected && <Check size={12} className="text-black" strokeWidth={4} />}
                      </span>
                      <h4
                        className={`font-bold uppercase tracking-wide ${nameClass} ${
                          isSelected ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        {service.name}
                      </h4>
                    </div>
                    <p className="text-[10px] md:text-xs text-gray-500 pl-6 md:pl-7 line-clamp-2">
                      {service.details}
                    </p>
                  </div>
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 w-full md:w-auto">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setModal({ type: 'service', service });
                      }}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-700 bg-black text-gray-400 hover:text-neon hover:border-neon transition-colors flex items-center justify-center"
                      aria-label={`Info ${service.name}`}
                    >
                      <Info size={14} className="md:w-4 md:h-4" />
                    </button>
                    <div className="text-right">
                      <span className="block font-mono text-sm md:text-lg text-neon">€{service.price}</span>
                      <span className="text-[9px] md:text-[10px] text-gray-600 uppercase font-bold">
                        {service.category}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        ))
      )}
    </div>
  );

  const StepSummary = () => (
    <div
      ref={summaryRef}
      className={`print-area max-w-3xl mx-auto scroll-mt-28 ${useStepTransition ? 'animate-in fade-in zoom-in duration-500' : ''}`}
    >
      <div className="bg-gray-900/60 border border-gray-800 p-6 md:p-10 rounded-xl shadow-2xl relative overflow-hidden text-sm">
        <div className="text-center border-b border-gray-800 pb-6 mb-6">
          <h3 className="font-display font-black text-4xl uppercase tracking-tighter text-white">Preventivo</h3>
          <p className="text-gray-500 uppercase text-xs tracking-widest mt-2">Kilowatt Service</p>
          <p className="text-gray-600 text-[10px] mt-1">{new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-4 mb-8">
            <div className="rounded-xl border border-gray-800 bg-black/50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neon mb-3">
              <Server size={14} /> Strumentazione
            </div>
            {selectedProducts.size === 0 ? (
              <div className="text-gray-600 italic">Nessun articolo selezionato.</div>
            ) : (
              <div className="space-y-2">
                {Array.from(selectedProducts).map((pid) => {
                  const prod = products.find((p) => p.id === pid);
                  if (!prod) return null;
                  return (
                    <div
                      key={pid}
                      className="flex justify-between items-center text-gray-200 text-sm border-b border-gray-800 pb-2 last:border-0 last:pb-0"
                    >
                      <div>{prod.name}</div>
                      <div className="text-neon">€{prod.priceDay}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-800 bg-black/50 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-3">
              <FileText size={14} /> Servizi digitali
            </div>
            {selectedServices.size === 0 ? (
              <div className="text-gray-600 italic">Nessun servizio selezionato.</div>
            ) : (
              <div className="space-y-2">
                {Array.from(selectedServices).map((sid) => {
                  const srv = services.find((s) => s.id === sid);
                  if (!srv) return null;
                  return (
                    <div
                      key={sid}
                      className="flex justify-between items-center text-gray-200 text-sm border-b border-gray-800 pb-2 last:border-0 last:pb-0"
                    >
                      <div>{srv.name}</div>
                      <div className="text-cyan-400">€{srv.price}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-800 pt-4 flex justify-between items-end mb-8">
          <span className="font-bold text-lg text-gray-300">TOTALE (IVA escl.)</span>
          <span className="font-black text-3xl text-neon">€{totalPrice}</span>
        </div>

        <div className="flex flex-col gap-3 no-print">
          <button
            onClick={handleSubmitQuote}
            disabled={isSubmitting}
            className={`w-full py-4 font-bold uppercase tracking-widest transition-colors ${
              isSubmitting ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-neon'
            }`}
          >
            {isSubmitting ? 'Invio in corso...' : 'Conferma e Invia'}
          </button>
          <button
            onClick={() => window.print()}
            className="w-full bg-transparent border border-gray-700 text-gray-200 py-3 font-bold uppercase tracking-widest hover:border-neon hover:text-neon transition-colors text-xs"
          >
            Scarica PDF
          </button>
          {submitMessage && (
            <div
              className={`text-xs uppercase tracking-widest px-3 py-2 rounded border ${
                submitError ? 'border-red-500 text-red-400' : 'border-neon/40 text-neon'
              }`}
            >
              {submitMessage}
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-[10px] text-gray-500 uppercase">
          Preventivo non vincolante. Soggetto a disponibilità.
        </div>
      </div>
    </div>
  );

  return (
    <section id="pricing" className="pt-32 pb-24 bg-black px-4 min-h-screen border-b border-gray-900">
      <div className="container mx-auto">
        <div className="text-center mb-12 no-print">
          <h2 className="font-display italic font-black text-5xl md:text-6xl text-white mb-4">
            CONFIGURA IL TUO <span className="text-neon outlined-text-fill">PACCHETTO</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Configuratore avanzato: scegli pacchetto, strumentazione e servizi con schede dettagliate.
          </p>
          
        </div>

        {renderStepIndicator()}

        <div className="max-w-6xl mx-auto min-h-[500px] flex flex-col">
          <div className="flex-1">
            <div key={currentStep} className={useStepTransition ? 'step-panel' : ''}>
              {currentStep === 'preset' && <StepPreset />}
              {currentStep === 'hardware' && <StepHardware />}
              {currentStep === 'digital' && <StepDigital />}
              {currentStep === 'summary' && <StepSummary />}
            </div>
          </div>

          <div className="no-print border-t border-gray-800 mt-12 pt-6 flex justify-between items-center sticky bottom-3 md:bottom-0 bg-black/95 backdrop-blur py-4 z-40 mx-2 md:mx-0 rounded-xl md:rounded-none">
            <button
              onClick={goPrev}
              disabled={currentStep === 'preset'}
              className={`flex items-center gap-2 uppercase font-bold text-sm tracking-widest px-6 py-3 rounded transition-colors ${
                currentStep === 'preset'
                  ? 'text-gray-700 cursor-not-allowed'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              <ArrowLeft size={16} /> Indietro
            </button>

            <div className="flex items-center gap-6">
              {currentStep !== 'summary' ? (
                <button
                  onClick={goNext}
                  disabled={!canContinue}
                  className={`px-8 py-3 font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    canContinue
                      ? 'bg-white text-black hover:bg-neon'
                      : 'bg-gray-900 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Continua <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={resetAll}
                  className="border border-red-500/50 text-red-500 px-6 py-3 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 text-xs"
                >
                  <Trash2 size={16} /> Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative bg-[#0b0b0b] border border-gray-800 rounded-2xl w-full max-w-2xl lg:max-w-5xl p-6 shadow-[0_0_40px_rgba(163,230,53,0.1)]">
            <button
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
              aria-label="Chiudi"
            >
              <X size={20} />
            </button>

            {modal.type === 'product' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/60 border border-gray-800 rounded-xl p-4 flex items-center justify-center">
                  <img
                    src={modal.product.image}
                    alt={modal.product.name}
                    className="w-full h-56 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-white text-2xl font-bold mb-2">{modal.product.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{modal.product.description}</p>
                  <div className="text-neon font-bold mb-4">€{modal.product.priceDay} / giorno</div>
                  <div className="space-y-2">
                    <div className="text-xs uppercase tracking-widest text-gray-500">Specifiche tecniche</div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {Object.entries(modal.product.specs).map(([key, val]) => (
                        <div key={key} className="bg-black border border-gray-800 rounded p-2">
                          <div className="text-gray-500 uppercase text-[10px]">{key}</div>
                          <div className="text-gray-200 font-mono">{val}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {modal.type === 'service' && (
              <div className="space-y-6">
                <div>
                  <div className="text-neon text-xs uppercase tracking-widest">{modal.service.category}</div>
                  <h3 className="text-white text-2xl font-bold">{modal.service.name}</h3>
                  <p className="text-gray-400 text-sm mt-2">{modal.service.details}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-800 rounded-xl p-4 bg-black/40">
                    <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Per chi è adatto</div>
                    <p className="text-gray-200 text-sm">{modal.service.audience}</p>
                  </div>
                  <div className="border border-gray-800 rounded-xl p-4 bg-black/40">
                    <div className="text-xs uppercase tracking-widest text-gray-500 mb-2">Cosa offriamo</div>
                    <ul className="space-y-2 text-sm text-gray-200">
                      {modal.service.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-neon shadow-[0_0_8px_rgba(163,230,53,0.4)]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border border-gray-800 rounded-xl p-4 bg-black/40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs uppercase tracking-widest text-gray-500">Roadmap operativa</div>
                    <div className="text-[10px] uppercase tracking-widest text-gray-600">
                      {modal.service.steps.length} step
                    </div>
                  </div>
                  <div className="relative pt-2">
                    <div className="absolute left-4 right-4 top-6 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent z-0" />
                    <div className="flex gap-4 overflow-x-auto pb-2 pr-2 snap-x snap-mandatory relative z-10">
                      {modal.service.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="min-w-[220px] snap-start bg-black/70 border border-gray-800 rounded-xl p-4 relative"
                        >
                          <div className="w-8 h-8 rounded-full bg-neon text-black font-bold flex items-center justify-center text-xs mb-3">
                            {idx + 1}
                          </div>
                          <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Step {idx + 1}</div>
                          <div className="text-gray-200 text-sm">{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Pricing;
