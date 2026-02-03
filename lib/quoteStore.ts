export type QuoteData = {
  products: string[];
  services: string[];
};

const STORAGE_KEY = 'kw_quote_v1';

const safeParse = (raw: string | null): QuoteData | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as QuoteData;
    if (!parsed || !Array.isArray(parsed.products) || !Array.isArray(parsed.services)) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const loadQuote = (): QuoteData => {
  if (typeof window === 'undefined') {
    return { products: [], services: [] };
  }
  try {
    const parsed = safeParse(window.localStorage.getItem(STORAGE_KEY));
    return parsed ?? { products: [], services: [] };
  } catch {
    return { products: [], services: [] };
  }
};

export const saveQuote = (data: QuoteData) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore write errors (private mode, quota, etc.)
  }
};

export const addProductToQuote = (productId: string) => {
  const data = loadQuote();
  if (!data.products.includes(productId)) {
    data.products.push(productId);
    saveQuote(data);
  }
  return data;
};

export const clearQuote = () => {
  saveQuote({ products: [], services: [] });
};
