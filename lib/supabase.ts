import { createClient } from "@supabase/supabase-js";

// Vervang de volgende variabelen door je eigen Supabase URL en Anon Key.
// Je vindt deze in je Supabase project onder Settings > API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Ontbrekende omgevingsvariabelen voor Supabase');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
