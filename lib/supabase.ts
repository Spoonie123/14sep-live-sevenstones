// lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // Niet bij import falen; alleen wanneer er écht Supabase gebruikt wordt.
    throw new Error(
      "[supabase] Ontbrekende env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Zet ze in Vercel (Project → Settings → Environment Variables → Production) en redeploy."
    );
  }

  _client = createClient(url, anon);
  return _client;
}

// Export die hetzelfde blijft als vroeger: `supabase.from(...)
// Maar de echte client wordt pas gebouwd zodra je er iets op aanroept.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    // @ts-ignore – dynamic forward
    return Reflect.get(client, prop, receiver);
  },
});
