/* ==============================
   personality-types.ts
   –  bestaande interface blijft intact
   –  extra eigenschap **neo_terms** toegevoegd
   –  enkele handige type‑aliases (optioneel) voor leesbaarheid
   ============================== */

   export interface PersonalityData {
    /* ----------  basis‑identiteit  ---------- */
    first_name?: string;
    last_name?: string;
    personTitle?: string;
  
    /* ----------  NEO‑scores (cijfer)  ---------- */
    neo_scores: {
      /** score 1 – 9 per facet (of undefined wanneer nog niet ingevuld) */
      [key: string]: number | undefined;
    };
  
    /* ----------  NEO‑term‑interpretatie  ---------- */
    /** 
     *  Exacte norm‑term die hoort bij de score van het facet  
     *  (“zeer laag”, “laag”, “beneden gemiddeld”, … “zeer hoog”).  
     *  Wordt automatisch gevuld in **NeoVelden.tsx** (see code‑update).  
     */
    neo_terms?: {
      /** term per facet – dezelfde keys als bij `neo_scores` */
      [key: string]: string;
    };
  
    /* ----------  overige data  ---------- */
    personalityText?: string;          // rapport‑tekst die door de LLM wordt teruggegeven
    uploadedFile?: File | null;        // eventueel een PDF‑/DOC‑bestand dat de psycholoog uploadt
    neo_report_name?: string;          // bestandsnaam in Supabase (indien je het als bestand opslaat)
    neo_report_path?: string;          // volledige URL / path in de storage‑bucket
  }
  
  /* -----------------------------------------------------------------
     2️⃣  Hulp‑type‑aliases  (optioneel – maken de code netter)
     ----------------------------------------------------------------- */
  export type NeoScores   = Record<string, number | undefined>;
  export type NeoTerms    = Record<string, string>;
  
  /* -----------------------------------------------------------------
     3️⃣  Person‑titles (ongewijzigd)
     ----------------------------------------------------------------- */
  export const PERSON_TITLES = [
    { value: "De heer",   label: "De heer" },
    { value: "Mevrouw",  label: "Mevrouw" },
    { value: "Voornaam", label: "Voornaam" },
  ] as const;
  
  export type PersonTitle = (typeof PERSON_TITLES)[number]["value"];
  