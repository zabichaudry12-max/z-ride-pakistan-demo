import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const appConfig = {
  demoMode: !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('example-project')
};

export const supabase =
  supabaseUrl && supabaseAnonKey && !appConfig.demoMode
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      })
    : null;
