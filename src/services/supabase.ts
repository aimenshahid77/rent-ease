import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://sdmrqygyitliguqostxq.supabase.co').trim();
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Strip any trailing API subpaths to make sure createClient receives the clean project base URL
const cleanUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '');

if (!supabaseKey) {
  console.warn('Missing VITE_SUPABASE_ANON_KEY. Supabase auth will not work until it is configured.');
} else if (supabaseKey.startsWith('sb_secret_')) {
  console.warn('VITE_SUPABASE_ANON_KEY is set to a secret key. Use the public anon or publishable key in browser apps.');
}

export const supabase = createClient(cleanUrl, supabaseKey);
