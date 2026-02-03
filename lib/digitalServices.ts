export type DigitalService = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  details: string;
  audience: string;
  deliverables: string[];
  steps: string[];
};

const IMAGE_POOL = [
  '/images/rafael-garcin-LTKFGLXL1EE-unsplash.jpg',
  '/images/jan-machacek-PMELe-SFkws-unsplash.jpg',
  '/images/kc-shum-BDaSxGdQABM-unsplash.jpg',
  '/images/kc-shum-vty9CfvMvTo-unsplash.jpg',
  '/images/nick-gordon-G5oehOudyJ4-unsplash.jpg',
  '/images/samuel-regan-asante-J63ln0EZgtg-unsplash.jpg',
  '/images/austris-augusts-O-NvxOYwvHc-unsplash.jpg',
  '/images/jose-g-ortega-castro-cn302rFpTVs-unsplash.jpg'
];

const IMAGE_BY_SLUG: Record<string, string> = {
  'brand-identity': '/images/jan-machacek-PMELe-SFkws-unsplash.jpg',
  'kit-social': '/images/kc-shum-vty9CfvMvTo-unsplash.jpg',
  'social-media': '/images/kc-shum-vty9CfvMvTo-unsplash.jpg',
  'landing-page': '/images/nick-gordon-G5oehOudyJ4-unsplash.jpg',
  'contenuti-web': '/images/austris-augusts-O-NvxOYwvHc-unsplash.jpg',
  'manutenzione-web': '/images/rafael-garcin-LTKFGLXL1EE-unsplash.jpg',
  'sito-web': '/images/jose-g-ortega-castro-cn302rFpTVs-unsplash.jpg'
};

export const DIGITAL_HERO_IMAGE = '/images/tijs-van-leur-Qnlp3FCO2vc-unsplash.jpg';

const normalizeList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
};

export const mapDigitalService = (row: any): DigitalService => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  category: row.category,
  price: Number(row.price),
  details: row.details || '',
  audience: row.audience || '',
  deliverables: normalizeList(row.deliverables),
  steps: normalizeList(row.steps)
});

export const getDigitalServiceImage = (slug: string, index = 0): string => {
  return IMAGE_BY_SLUG[slug] || IMAGE_POOL[index % IMAGE_POOL.length];
};
