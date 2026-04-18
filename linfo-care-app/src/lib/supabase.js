import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper: check if Supabase is fully configured
export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

// In demo mode (no env vars), createClient() would throw at import time and
// blank the page. Export a stub whose methods resolve harmlessly instead.
// The query builder is a thenable Proxy so any chain length works:
//   from('x').select('*').eq(...).eq(...).order(...).limit(1).single()
// all returns the same proxy until awaited, which resolves to {data: null, error: null}.
function createStubClient() {
  const emptyResult = { data: null, error: null };
  const emptyListResult = { data: [], error: null };

  const makeQueryProxy = (result = emptyResult) => {
    const promise = Promise.resolve(result);
    const proxy = new Proxy(() => {}, {
      get(_t, prop) {
        if (prop === 'then')    return promise.then.bind(promise);
        if (prop === 'catch')   return promise.catch.bind(promise);
        if (prop === 'finally') return promise.finally.bind(promise);
        // Any other property access returns a function that returns the proxy,
        // so chains like .select().eq().order().limit().single() all work.
        return () => proxy;
      },
      apply() { return proxy; },
    });
    return proxy;
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOtp: async () => ({ error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
    },
    from: () => makeQueryProxy(),
    storage: {
      from: () => ({
        upload:         async () => emptyResult,
        download:       async () => emptyResult,
        getPublicUrl:   () => ({ data: { publicUrl: '' } }),
        createSignedUrl: async () => emptyResult,
        remove:         async () => emptyListResult,
        list:           async () => emptyListResult,
      }),
    },
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
