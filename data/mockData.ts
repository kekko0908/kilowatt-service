import { ServiceItem, Product } from '../types';

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'rental',
    slug: 'rental',
    title: 'Noleggio Strumentazione',
    description: 'Fitto strumentazione musicale, impianti audio, luci e backline per concerti ed eventi.',
    longDescription:
      'Offriamo un parco macchine completo per ogni esigenza: impianti PA Yamaha e RCF, mixer digitali, set luci con teste mobili e par LED, microfoni professionali. Ideale per concerti, conferenze, DJ set e feste private. Assistenza tecnica inclusa su richiesta.',
    image: 'https://picsum.photos/seed/audio-gear/1920/1080',
    iconKey: 'music'
  },
  {
    id: 'video',
    slug: 'video-foto',
    title: 'Video & Foto',
    description: 'Shooting professionali, riprese video 4K e post-produzione cinematografica.',
    longDescription:
      'Team di videomaker e fotografi professionisti per eventi aziendali, matrimoni, videoclip musicali e spot pubblicitari. Utilizziamo camere cinema, droni 4K e stabilizzatori. Editing avanzato con color grading e sound design.',
    image: 'https://picsum.photos/seed/video-prod/1920/1080',
    iconKey: 'video'
  },
  {
    id: 'branding',
    slug: 'branding',
    title: 'Branding & Grafica',
    description: 'Creazione loghi, palette colori, coordinati aziendali e materiali pubblicitari.',
    longDescription:
      'Diamo un volto al tuo business. Dallo studio del naming alla creazione del logo, passando per biglietti da visita, brochure e grafiche per social media. Costruiamo una brand identity coerente e memorabile.',
    image: 'https://picsum.photos/seed/branding/1920/1080',
    iconKey: 'palette'
  },
  {
    id: 'web',
    slug: 'sviluppo-web',
    title: 'Sviluppo Web',
    description: 'Siti web responsive, e-commerce e landing page ottimizzate.',
    longDescription:
      'Sviluppiamo siti web moderni, veloci e ottimizzati per i motori di ricerca (SEO). Dalle landing page ad alta conversione agli e-commerce complessi, garantiamo un\'esperienza utente impeccabile su tutti i dispositivi.',
    image: 'https://picsum.photos/seed/web-dev/1920/1080',
    iconKey: 'globe'
  },
  {
    id: 'manage',
    slug: 'gestione-tecnica',
    title: 'Gestione Tecnica',
    description: 'Manutenzione, aggiornamenti, sicurezza e hosting per la tua presenza online.',
    longDescription:
      'Non lasciare il tuo sito abbandonato. Offriamo pacchetti di manutenzione mensile che includono backup giornalieri, aggiornamenti di sicurezza, modifiche ai contenuti e monitoraggio delle performance.',
    image: 'https://picsum.photos/seed/server/1920/1080',
    iconKey: 'code'
  },
  {
    id: 'social',
    slug: 'social-media',
    title: 'Social Media',
    description: 'Strategia editoriale, creazione contenuti e gestione community.',
    longDescription:
      'Gestione completa dei profili Instagram, Facebook, TikTok e LinkedIn. Creiamo piani editoriali strategici, produciamo contenuti originali e gestiamo le campagne pubblicitarie per far crescere la tua audience.',
    image: 'https://picsum.photos/seed/social-media/1920/1080',
    iconKey: 'share'
  }
];

export const PRODUCTS_DATA: Product[] = [
  {
    id: 'p1',
    slug: 'yamaha-dxr12-pair',
    name: 'Coppia Yamaha DXR12',
    category: 'audio',
    priceDay: 80,
    image: 'https://picsum.photos/seed/speaker/800/800',
    description: 'Casse attive professionali da 1100W, ideali per DJ set, live band e conferenze.',
    specs: { Potenza: '1100W', Woofer: '12 pollici', 'SPL Max': '132dB', Peso: '19kg cad.' }
  },
  {
    id: 'p3',
    slug: 'kit-luci-party',
    name: 'Kit Luci Party (4 Teste Mobili)',
    category: 'lights',
    priceDay: 120,
    image: 'https://picsum.photos/seed/lights/800/800',
    description: 'Set dinamico composto da 4 teste mobili Wash/Beam + stativi. Controllo DMX incluso.',
    specs: { Tipo: 'LED Wash', Controllo: 'DMX/Auto', Colori: 'RGBW', Consumo: '400W tot' }
  },
  {
    id: 'p4',
    slug: 'rcf-18-sub',
    name: 'Subwoofer RCF 18"',
    category: 'audio',
    priceDay: 60,
    image: 'https://picsum.photos/seed/sub/800/800',
    description: 'Subwoofer attivo potente per rinforzare le basse frequenze nei grandi eventi.',
    specs: { Potenza: '1400W', Woofer: '18 pollici', 'SPL Max': '135dB', Risposta: '35Hz - 120Hz' }
  },
  {
    id: 'p5',
    slug: 'proiettore-4k',
    name: 'Proiettore 4K + Telo',
    category: 'video',
    priceDay: 100,
    image: 'https://picsum.photos/seed/projector/800/800',
    description: 'Videoproiettore alta luminosita per presentazioni e cinema all\'aperto.',
    specs: { Risoluzione: '4K UHD', Luminosita: '5000 Lumen', Telo: '2x2 metri', Ingressi: 'HDMI/VGA' }
  }
];
