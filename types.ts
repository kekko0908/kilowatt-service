export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string; // Added for detailed view
  image: string; // Added for detailed view
  iconKey: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'audio' | 'video' | 'lights';
  priceDay: number;
  image: string;
  specs: { [key: string]: string };
  description: string;
}

export interface ServicePackageRecord {
  id: string;
  slug: string;
  name: string;
  description: string;
  audience: string;
  basePrice: number;
  badge?: string | null;
  serviceIds: string[];
  productIds: string[];
}

export interface PackageFeature {
  id: string;
  name: string;
  details?: string; // Added to explain exactly what is included (e.g. specific models)
  price: number; 
  category: 'rental' | 'branding' | 'web' | 'social';
}

export interface ServicePackage {
  id: 'base' | 'medium' | 'pro';
  name: string;
  basePrice: number;
  includedFeatureIds: string[]; 
  description: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface ProjectProposal {
  title: string;
  description: string;
  phone: string;
  fileUrl?: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface SeoSettings {
  page: string;
  title: string;
  description: string;
  keywords: string;
}
