import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // Keep session in localStorage across browser closes
    autoRefreshToken: true,      // Auto-refresh before expiry — no re-login needed
    detectSessionInUrl: true,    // Catch magic link tokens from email redirects
    storageKey: 'linfocare-auth', // Named key so it doesn't conflict with other apps
  },
});

// Helper: check if Supabase is fully configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};
