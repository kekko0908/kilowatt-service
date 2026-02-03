import { createClient } from '@supabase/supabase-js';

// Helper per accedere alle variabili d'ambiente in modo sicuro
const getEnvVar = (key: string, fallback: string) => {
  try {
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch (e) {
    console.warn('Error reading environment variable:', e);
  }
  return fallback;
};

// Utilizziamo i valori dal .env come fallback se import.meta.env fallisce
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://mmbqftslzjmytynituub.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'sb_publishable_KAgMZXMXid_SraVRRhv5RA_RTmvgP94');

console.log("Supabase Configuration:", { 
  url: supabaseUrl, 
  keyLength: supabaseAnonKey?.length 
});

export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
);

export const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === 'string' && 
    supabaseUrl.length > 0 && 
    !supabaseUrl.includes('placeholder') &&
    typeof supabaseAnonKey === 'string' && 
    supabaseAnonKey.length > 0 &&
    !supabaseAnonKey.includes('placeholder')
  );
};