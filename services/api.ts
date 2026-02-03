import { supabase } from '../lib/supabaseClient';
import { User, ProjectProposal, SeoSettings, Product, ServiceItem, ServicePackageRecord } from '../types';

export const apiService = {
  // Auth Services
  loginWithGoogle: async (): Promise<{ user: User | null, error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) return { user: null, error: error.message };
    return { user: null, error: null };
  },

  signUpWithEmail: async (
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User | null; error: string | null; requiresConfirmation?: boolean }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        }
      }
    });

    if (error) return { user: null, error: error.message };

    if (data.session?.user) {
      return {
        user: {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.user_metadata.full_name || name,
          avatarUrl: ''
        },
        error: null,
        requiresConfirmation: false
      };
    }

    if (data.user) {
      return { user: null, error: null, requiresConfirmation: true };
    }

    return { user: null, error: "Controlla la tua email per confermare la registrazione.", requiresConfirmation: true };
  },

  signInWithEmail: async (email: string, password: string): Promise<{ user: User | null, error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) return { user: null, error: error.message };
    
    if (data.session?.user) {
        return {
            user: {
                id: data.session.user.id,
                email: data.session.user.email || '',
                name: data.session.user.user_metadata.full_name || 'Utente',
                avatarUrl: data.session.user.user_metadata.avatar_url
            },
            error: null
        }
    }
    return { user: null, error: "Errore sconosciuto" };
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  getCurrentUser: async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return {
        id: session.user.id,
        email: session.user.email || '',
        name: session.user.user_metadata.full_name || session.user.email || 'Utente',
        avatarUrl: session.user.user_metadata.avatar_url
      };
    }
    return null;
  },

  // Project Services
  submitProposal: async (
    proposal: Omit<ProjectProposal, 'status' | 'createdAt'>,
    file: File
  ): Promise<{ success: boolean; error?: string }> => {

    try {
      // 1. Upload File
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${proposal.userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('proposals')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Insert Record
      const { error: dbError } = await supabase
        .from('projects')
        .insert({
          title: proposal.title,
          description: proposal.description,
          phone: proposal.phone,
          user_id: proposal.userId,
          file_path: filePath,
          status: 'pending'
        });

      if (dbError) throw dbError;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // SEO Services
  getSeoSettings: async (page: string = 'home'): Promise<SeoSettings | null> => {
    try {
      const { data, error } = await supabase
        .from('seo_config')
        .select('*')
        .eq('page', page)
        .single();
      
      if (error) {
        console.warn('SEO config not found or error:', error.message);
        return null;
      }
      return data as SeoSettings;
    } catch (e) {
      console.error('Error fetching SEO settings:', e);
      return null;
    }
  }
};
// --- Catalog data ---
const mapProduct = (row: any): Product => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  category: row.category,
  priceDay: Number(row.price_day),
  image: row.image_url,
  specs: row.specs || {},
  description: row.description || ''
});

const mapServiceCatalog = (row: any): ServiceItem => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  description: row.description,
  longDescription: row.long_description,
  image: row.image_url,
  iconKey: row.icon_key || 'globe'
});

export const catalogService = {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return (data || []).map(mapProduct);
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data ? mapProduct(data) : null;
  },

  async getServiceCatalog(): Promise<ServiceItem[]> {
    const { data, error } = await supabase
      .from('service_catalog')
      .select('*')
      .eq('is_active', true)
      .order('title');
    if (error) throw error;
    return (data || []).map(mapServiceCatalog);
  },

  async getServiceCatalogBySlug(slug: string): Promise<ServiceItem | null> {
    const { data, error } = await supabase
      .from('service_catalog')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return null;
    return data ? mapServiceCatalog(data) : null;
  },

  async getDigitalServices(): Promise<any[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async getPackages(): Promise<ServicePackageRecord[]> {
    const { data: packages, error } = await supabase
      .from('packages')
      .select('*')
      .order('base_price');
    if (error) throw error;

    const { data: pkgServices } = await supabase
      .from('package_services')
      .select('package_id, service_id');

    const { data: pkgProducts } = await supabase
      .from('package_products')
      .select('package_id, product_id');

    const servicesByPackage = new Map<string, string[]>();
    (pkgServices || []).forEach((row: any) => {
      const list = servicesByPackage.get(row.package_id) || [];
      list.push(row.service_id);
      servicesByPackage.set(row.package_id, list);
    });

    const productsByPackage = new Map<string, string[]>();
    (pkgProducts || []).forEach((row: any) => {
      const list = productsByPackage.get(row.package_id) || [];
      list.push(row.product_id);
      productsByPackage.set(row.package_id, list);
    });

    return (packages || []).map((pkg: any) => ({
      id: pkg.id,
      slug: pkg.slug,
      name: pkg.name,
      description: pkg.description || '',
      audience: pkg.audience || '',
      basePrice: Number(pkg.base_price),
      badge: pkg.badge,
      serviceIds: servicesByPackage.get(pkg.id) || [],
      productIds: productsByPackage.get(pkg.id) || []
    }));
  },

  async createQuote(params: {
    userId: string;
    products: { id: string; name: string; priceDay: number }[];
    services: { id: string; name: string; price: number }[];
    total: number;
  }): Promise<{ success: boolean; error?: string; quoteId?: string }> {
    const { data: quote, error } = await supabase
      .from('quotes')
      .insert({
        user_id: params.userId,
        status: 'sent',
        total: params.total
      })
      .select('*')
      .single();

    if (error || !quote) return { success: false, error: error?.message || 'Errore creazione preventivo' };

    const items = [
      ...params.products.map((product) => ({
        quote_id: quote.id,
        item_type: 'product',
        item_id: product.id,
        name: product.name,
        unit_price: product.priceDay,
        meta: {}
      })),
      ...params.services.map((service) => ({
        quote_id: quote.id,
        item_type: 'service',
        item_id: service.id,
        name: service.name,
        unit_price: service.price,
        meta: {}
      }))
    ];

    const { error: itemsError } = await supabase.from('quote_items').insert(items);
    if (itemsError) return { success: false, error: itemsError.message };

    return { success: true, quoteId: quote.id };
  }
};
