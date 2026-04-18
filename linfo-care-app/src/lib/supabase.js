import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper: check if Supabase is fully configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// In demo mode (no env vars), createClient() would throw at import time and
// blank the page. Export a stub whose methods resolve harmlessly instead.
function createStubClient() {
  const ok = async () => ({ data: null, error: null });
  const table = () => ({
    select: () => ({ eq: () => ({ single: ok, maybeSingle: ok }), order: ok, limit: ok }),
    insert: () => ({ select: () => ({ single: ok }) }),
    update: () => ({ eq: ok }),
    delete: () => ({ eq: ok }),
    upsert: ok,
  });
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOtp: async () => ({ error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
    },
    from: table,
    storage: { from: () => ({ upload: ok, download: ok, getPublicUrl: () => ({ data: { publicUrl: '' } }), remove: ok, list: ok }) },
  };
}

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'linfocare-auth',
      },
    })
  : createStubClient();
