// lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 👉 Maak één gedeelde client aan die zowel in browser als server kan worden gebruikt.
//    (We gooien geen error bij import; met ontbrekende envs loggen we alleen een warning.)
if (!url || !anon) {
  // Niet crashen tijdens build; wel duidelijk loggen.
  console.warn(
    "[supabase] Ontbrekende env vars: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// Lege string fallback voorkomt type-errors; in praktijk zul je echte envs hebben.
export const supabase: SupabaseClient = createClient(url ?? "", anon ?? "");
