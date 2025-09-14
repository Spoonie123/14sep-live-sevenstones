"use client";

import type { PersonalityData } from "../personality/personality-types";
import type { Competency } from "./competentie-lijst"; // ← gebruik het echte type
import { COMPETENCY_EXAMPLES } from "./competentie-voorbeelden"; // voorbeelden als stijlcontext

export interface GenerationProps {
  competency: Competency;
  personalityData?: Partial<PersonalityData> | Record<string, any>;
  observation?: string;
  score?: number; // 1-5
  relateToPersonality?: boolean;

  onGeneratedTextChange: (competency: Competency, text: string) => void;
  setIsGenerating: (
    updater:
      | Partial<Record<Competency, boolean>>
      | ((
          prev: Partial<Record<Competency, boolean>>
        ) => Partial<Record<Competency, boolean>>)
  ) => void;
  setError: (msg: string | null) => void;
}

/** Recursief een key (incl. aliassen) zoeken in een (mogelijk genest) object. */
function deepFind(obj: any, aliases: string[]): any {
  if (!obj || typeof obj !== "object") return undefined;

  // direct hit?
  for (const k of Object.keys(obj)) {
    if (aliases.includes(k)) return obj[k];
  }

  // genest
  for (const v of Object.values(obj)) {
    if (v && typeof v === "object") {
      const hit = deepFind(v, aliases);
      if (hit !== undefined) return hit;
    }
  }

  return undefined;
}

function resolveAddressing(pd?: Partial<PersonalityData> | Record<string, any>) {
  // === Zelfde intentie als personality, maar robuuster: lees meerdere aliassen en diep genest. ===
  const personTitle =
    deepFind(pd, ["personTitle", "person_title", "aanspreekwijze", "salutation"]) ?? null;

  const first_name =
    deepFind(pd, ["first_name", "firstName", "voornaam"]) ?? "";
  const last_name =
    deepFind(pd, ["last_name", "lastName", "achternaam"]) ?? "";

  if (!personTitle) {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line no-console
      console.debug("[competencies] personalityData binnengekomen (keys):", pd ? Object.keys(pd as any) : "undefined");
      // eslint-disable-next-line no-console
      console.debug("[competencies] voorbeeld personalityData:", pd);
    }
    return {
      ok: false,
      error: "Ontbrekende gegevens: aanspreekwijze ontbreekt (personTitle/person_title).",
      displayName: "",
      addressForm: "",
      nameForOpening: "",
    };
  }

  let displayName = "";
  let addressForm = "";
  let nameForOpening = "";

  if (personTitle === "Voornaam") {
    const base = first_name || last_name;
    displayName = base;
    addressForm = base;
    nameForOpening = base;
  } else if (personTitle === "De heer") {
    displayName = `de heer ${last_name || first_name}`.trim();
    addressForm = "de heer";
    nameForOpening = last_name || first_name || "";
  } else if (personTitle === "Mevrouw") {
    displayName = `mevrouw ${last_name || first_name}`.trim();
    addressForm = "mevrouw";
    nameForOpening = last_name || first_name || "";
  } else {
    // fallback
    displayName = [first_name, last_name].filter(Boolean).join(" ").trim();
    addressForm = String(personTitle);
    nameForOpening = last_name || first_name || displayName;
  }

  if (!displayName) {
    return {
      ok: false,
      error: "Ontbrekende gegevens: voor- of achternaam ontbreekt.",
      displayName,
      addressForm,
      nameForOpening,
    };
  }

  return { ok: true, error: null, displayName, addressForm, nameForOpening, personTitle };
}

export async function generateCompetencyText({
  competency,
  personalityData,
  observation,
  score,
  relateToPersonality,
  onGeneratedTextChange,
  setIsGenerating,
  setError,
}: GenerationProps) {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;
  if (!apiKey) {
    setError(
      "Kon geen API-sleutel vinden (NEXT_PUBLIC_OPENAI_API_KEY). Voeg deze toe aan je env."
    );
    return;
  }

  // zet loading aan voor deze competentie
  setIsGenerating((prev) => ({ ...(prev || {}), [competency]: true }));
  setError(null);

  const ax = resolveAddressing(personalityData);
  if (!ax.ok) {
    setError(ax.error);
    setIsGenerating((prev) => ({ ...(prev || {}), [competency]: false }));
    return;
  }

  const { displayName, addressForm, nameForOpening, personTitle } = ax;

  // NEO scores (aliassen en diepte)
  const neo_scores =
    deepFind(personalityData, ["neo_scores", "neoScores", "neo", "neoPI3"]) as
      | Record<string, number>
      | undefined;

  const scoresContext =
    relateToPersonality && neo_scores
      ? Object.entries(neo_scores)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ")
      : null;

  /** Voornaamwoorden op basis van aanspreekwijze */
  const pronounSubject =
    personTitle === "De heer" ? "hij" : personTitle === "Mevrouw" ? "zij" : "hij/zij";
  const pronounPossessive =
    personTitle === "De heer" ? "zijn" : personTitle === "Mevrouw" ? "haar" : "zijn/haar";

  /** Voorbeelden opnemen in de prompt (schrijfstijl/structuur) */
  const examplesBlock =
    COMPETENCY_EXAMPLES?.map(
      (ex) =>
        `• Voorbeeld (${ex.competency})\n${(ex as any).text ?? ""}`
    ).join("\n\n") ?? "";

  /** Persoonlijkheidstekst (gated & getrunct) */
  const personalityTextRaw =
    (deepFind(personalityData, ["personality_text", "personalityText"]) as string | undefined) ??
    undefined;

  const shouldRelate = !!relateToPersonality;
  const hasPersonalityText = !!(personalityTextRaw && personalityTextRaw.trim().length > 0);

  // Truncation helper (± 1200 tekens → voldoende context, lage tokencost)
  const truncate = (s: string, max = 1200) =>
    s.length > max ? s.slice(0, max) + "…" : s;

  const personalityContextBlock =
    shouldRelate && hasPersonalityText
      ? `
PERSOONLIJKHEIDS-BESCHRIJVING (context, samengevat; NIET letterlijk citeren):
"${truncate(personalityTextRaw!, 1200)}"

Instructie voor relatie: Verwijs **subtiel** in hooguit 1–2 zinnen naar relevante elementen uit bovenstaande beschrijving,
specifiek in relatie tot de competentie "${competency}" en de observaties. Noem **geen** testnamen of cijfers.
      `.trim()
      : "";

  if (shouldRelate && !hasPersonalityText) {
    // milde waarschuwing; generatie gaat gewoon door zonder relatie
    setError(
      "Relatie met persoonlijkheid aangevinkt, maar er is geen persoonlijkheidstekst gevonden; er wordt zonder relatie geschreven."
    );
  }

  const systemPrompt = `
Je bent een zeer ervaren (arbeids)psycholoog. Je schrijft compacte, professionele competentie-teksten
voor rapportages. Je tekst is menselijk en genuanceerd en klinkt niet als AI.
Je gebruikt ALTIJD de juiste aanspreekwijze en naam zoals aangeleverd.
Vermijd jargon en schrijf helder, natuurlijk Nederlands; varieer zinslengte en ritme; geen holle of generieke AI-frases.

Schrijfstijl:
- 1 korte openingszin die de competentie koppelt aan ${addressForm} ${nameForOpening} (de enige plek waar naam/aanspreekwijze voorkomt).
- Daarna uitsluitend de voornaamwoorden: "${pronounSubject}" en bezittelijk "${pronounPossessive}".
- Schrijf één doorlopende, aaneengesloten tekst (geen alinea’s/opsommingen/lege regels); verwerk observaties en onderbouwing vloeiend en koppel ze kwalitatief aan de inhoud (zonder cijfers of het woord ‘score’ te noemen) en aan eventuele voorbeelden.
- Als 'relateer aan persoonlijkheid' aan staat: leg subtiel verband met persoonlijkheidskenmerken zónder testnamen of cijfers te noemen.
- Sluit af met 1 zin die de implicatie op werkcontext samenvat.

--- STIJLVOORBEELDEN (niet kopiëren, alleen toon/structuur volgen) ---
${examplesBlock}
--- EINDE VOORBEELDEN ---
  `.trim();

  const userPrompt = `
PERSOON:
- Naam (alleen in openingszin gebruiken): ${displayName}
- Aanspreekwijze (alleen in openingszin gebruiken): ${addressForm}
- Voornaamwoorden na openingszin: "${pronounSubject}" / "${pronounPossessive}"

COMPETENTIE:
- Naam: ${competency}

INPUT VAN PSYCHOLOOG (LEIDEND):
- Observaties (leidend, herschrijf beknopt indien nodig): ${observation ? observation : "(geen observaties ingevuld)"}
- Score (1–5, alleen voor jou; niet citeren of naar verwijzen): ${typeof score === "number" ? score : "(geen score ingevuld)"}

${shouldRelate && hasPersonalityText ? personalityContextBlock : "OPDRACHT RELATIE: Niet relateren aan persoonlijkheidsprofiel."}

${shouldRelate && scoresContext ? `NEO-PI-3 context (alleen inspiratie, geen cijfers/testnamen in de tekst): ${scoresContext}` : ""}

SCHRIJFOPDRACHT:
1) Schrijf **minimaal 200 en maximaal 350 woorden**.
2) Noem **naam + aanspreekwijze exact één keer** in de openingszin; daarna alleen "${pronounSubject}" / "${pronounPossessive}".
3) Laat de observaties leidend zijn en schrijf een **beoordelende/analytische** uitwerking van de competentie (hoe ${pronounSubject} het doet, zichtbare patronen, consequenties).
4) Vermijd AI-achtige formuleringen (bv. "in deze tekst", "samenvattend", "deze analyse toont aan", "over het algemeen"); schrijf menselijk en concreet.
5) Gebruik de **interne indicatie** als richting; **noem of suggereer geen cijfers en gebruik het woord ‘score’ niet**. Beschrijf **kwalitatief** (bijv. ‘sterk’, ‘wisselend’, ‘beperkt’).
6) Sluit af met één heldere implicatie voor de werkpraktijk.
  `.trim();

  try {
    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 1100, // ruimte voor 200–350 woorden + context
        temperature: 0.7,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(
        `API error ${resp.status}: ${resp.statusText} – ${JSON.stringify(err)}`
      );
    }

    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content?.trim() ?? "";

    if (!text) {
      throw new Error("Lege AI-respons.");
    }

    onGeneratedTextChange(competency, text);
  } catch (e: any) {
    setError(`Fout bij AI generatie: ${e?.message ?? String(e)}`);
  } finally {
    setIsGenerating((prev) => ({ ...(prev || {}), [competency]: false }));
  }
}
