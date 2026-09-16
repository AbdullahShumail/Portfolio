import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Null when the environment is not configured.
 *
 * createClient throws if either value is missing, and because the contact form
 * imports this at module scope that would take the whole site down with a blank
 * screen on any deploy where the env vars were not set. The form checks for
 * null and offers a plain mailto instead.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isContactFormEnabled = supabase !== null;
