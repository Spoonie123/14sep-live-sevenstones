"use client";

import { CONCLUSION_EXAMPLES } from "./conclusion-examples"; // verwacht: array met strings of {text: string}
export type GenerateConclusionPayload = {
  personTitle?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  personality_text?: string | null;
  generated_texts: Record<string, string>;
  psychologist_input: string;
};

/** Kleine helper: veilige key-zoeker (zoals elders gebruikt) */
function deepFind(obj: any, keys: string[]): any {
  if (!obj || typeof obj !== "object") return undefined;
  for (const k of Object.keys(obj)) if (keys.includes(k)) return obj[k];
  for (const v of Object.values(obj)) {
    if (v && typeof v === "object") {
      const hit = deepFind(v, keys);
      if (hit !== undefined) return hit;
    }
  }
  return undefined;
}

/** Adressering (zelfde logica als op de competentie-pagina) */
function formatAddress(personTitle?: string | null, first?: string | null, last?: string | null) {
  const fn = (first || "").trim();
  const ln = (last || "").trim();

  if (personTitle === "Voornaam") {
    const base = fn || ln;
    return {
      displayName: base,
      addressForm: base,
      pronounSubj: "hij/zij",
      pronounPoss: "zijn/haar",
    };
  }
  if (personTitle === "De heer") {
    return {
      displayName: `de heer ${ln || fn}`.trim(),
      addressForm: "de heer",
      pronounSubj: "hij",
      pronounPoss: "zijn",
    };
  }
  if (personTitle === "Mevrouw") {
    return {
      displayName: `mevrouw ${ln || fn}`.trim(),
      addressForm: "mevrouw",
      pronounSubj: "zij",
      pronounPoss: "haar",
    };
  }
  return {
    displayName: [fn, ln].filter(Boolean).join(" ").trim(),
    addressForm: personTitle || "",
    pronounSubj: "hij/zij",
    pronounPoss: "zijn/haar",
  };
}

/** Beperk lange strings; scheelt tokens */
function truncate(s: string, max = 1500) {
  return s.length > max ? s.slice(0, max) + "…" : s;
}

/** Maak compacte digest van competentieteksten (naam + eerste ~2 zinnen) */
function digestCompetencies(map: Record<string, string>): string {
  const items = Object.entries(map || {});
  if (!items.length) return "(geen uitgewerkte competenties aanwezig)";
  return items
    .sort(([a], [b]) => a.localeCompare(b, "nl", { sensitivity: "base" }))
    .map(([name, text]) => {
      const t = (text || "").replace(/\s+/g, " ").trim();
      // pak ongeveer de eerste 2 zinnen of tot ~350 tekens
      const cut = t.split(/(?<=\.)\s+/).slice(0, 2).join(" ");
      const short = truncate(cut || t, 350);
      return `• ${name}: ${short}`;
    })
    .join("\n");
}

/** Voorbeeldblok voor stijl (niet letterlijk kopiëren) */
const examplesBlock =
  (Array.isArray(CONCLUSION_EXAMPLES)
    ? CONCLUSION_EXAMPLES
        .map((ex: any, i: number) => {
          const txt = typeof ex === "string" ? ex : (ex?.text ?? "");
          return txt ? `Voorbeeld ${i + 1}\n${txt}` : "";
        })
        .filter(Boolean)
        .join("\n\n")
    : "") || "";

/** ───────────────────────────────────────────────────────────────────────────
 *  Named export die door de page wordt aangeroepen
 *  ─────────────────────────────────────────────────────────────────────────── */
export async function generateConclusionAdvice(
  payload: GenerateConclusionPayload
): Promise<string> {
  const {
    personTitle,
    first_name,
    last_name,
    personality_text,
    generated_texts,
    psychologist_input,
  } = payload;

  const { displayName, addressForm, pronounSubj, pronounPoss } = formatAddress(
    personTitle,
    first_name,
    last_name
  );

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;
  if (!apiKey) {
    // Fail-soft: nette fallback
    return [
      "⚠️ Geen API-sleutel gevonden (NEXT_PUBLIC_OPENAI_API_KEY).",
      "",
      "Tip: voeg je sleutel toe aan .env en herstart de app.",
    ].join("\n");
  }

  const personality = (personality_text || "").trim();
  const compsDigest = digestCompetencies(generated_texts || {});
  const extra = (psychologist_input || "").trim();

  const systemPrompt = `
Je bent een ervaren rapportageschrijver/arbeidspsycholoog.
Schrijf een professionele, menselijke en compacte **Conclusie & Advies**-rapporttekst in helder Nederlands,
op basis van een persoonlijkheidsbeschrijving én uitgewerkte competentieteksten, aangevuld met input van de psycholoog.
Gebruik ALTIJD de juiste aanspreekwijze/naam zoals aangeleverd.
Vermijd AI-achtige frases; geen bullet lists in de output (doorlopende tekst); geen overbodige herhaling.
**Noem nergens scores/cijfers/percentielen** en **noem geen type/naam van gebruikte methoden/assessments**,
behalve in de opgegeven verplichte openingszin.
Hanteer de volgorde: **eerst sterke kanten**, daarna **ontwikkelpunten** en **advies** (praktisch en toepasbaar).
**Schrijf nooit in de ik-vorm.** Na de openingszin geen ‘we/wij’; schrijf verder onpersoonlijk of in de derde persoon.

---- STIJLVOORBEELDEN (niet kopiëren, alleen toon/structuur volgen) ----
${examplesBlock}
---- EINDE VOORBEELDEN ----
  `.trim();

  const openingSentence =
    "Op basis van de resultaten tijdens het assessment center, de psychologische test en de interviews, komen wij tot de volgende conclusie.";

  const userPrompt = `
PERSOON
- Getoonde naam: ${displayName || "(onbekend)"}  (gebruik dit NIET als aanspreekvorm; dit is alleen de naam)
- Aanspreekwijze voor lopende tekst (indien nodig): ${addressForm || "(onbekend)"}
- Te gebruiken voornaamwoorden: "${pronounSubj}" / "${pronounPoss}"

BRONNEN (alleen context, NIET letterlijk overnemen):
- Persoonlijkheidsanalyse (samenvatting):
${personality ? truncate(personality, 1500) : "(geen persoonlijkheidstekst)"}

- Competentie-uitwerkingen (compact digest per competentie):
${compsDigest}

- Aanvullende input psycholoog (**verplicht verwerken in de tekst**):
${extra ? truncate(extra, 1200) : "(geen aanvullende input aangeleverd — vermeld dit kort, verzin niets)"}

INSTRUCTIES VOOR DE TEKST
1) **Begin de allereerste zin EXACT met**:
   "${openingSentence}"
2) Dit is een **Conclusie & Advies**-rapporttekst op basis van de persoonlijkheidsanalyse en de competentieteksten,
   aangevuld met de **aanvullende input van de psycholoog** — verwerk die input **altijd expliciet** in de tekst.
3) Gebruik daarna nergens ‘ik’; en **na** de openingszin ook geen ‘we/wij’. Schrijf verder in de derde persoon of onpersoonlijk.
4) **Noem nergens expliciet cijfers, scores of methoden/assessmentnamen** (behalve in die openingszin).
5) **Eerst** de sterkere kanten/kwaliteiten, **dan** aandachtspunten/valkuilen/ontwikkelpunten, **dan** een kort, toepasbaar **advies**.
6) Schrijf **500–650 woorden** in een **doorlopende tekst** (geen witregels of opsommingen).
7) Schrijf concreet en menselijk; geen holle managementtaal; vermijd zinnen als "in deze tekst", "concluderend", "samenvattend".
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
        // iets ruimer ivm 500–650 woorden + context
        max_tokens: 1600,
        temperature: 0.7,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(`API error ${resp.status}: ${resp.statusText} – ${JSON.stringify(err)}`);
    }

    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content?.trim() ?? "";

    return text || "Lege AI-respons.";
  } catch (e: any) {
    return `Fout bij AI-generatie: ${e?.message ?? String(e)}`;
  }
}

/* (Optioneel) Demo-component laten staan voor losse tests; niet nodig voor de page. */
import { useState } from "react";

export default function AIGenerateConclusion() {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    const demo = await generateConclusionAdvice({
      personTitle: "De heer",
      first_name: "Jan",
      last_name: "Jansen",
      personality_text:
        "Samengevat toont hij veerkracht, doelgerichtheid en sociale assertiviteit, met soms neiging tot ongeduld onder tijdsdruk.",
      generated_texts: {
        "Leidinggeven":
          "Toont initiatief, neemt gemakkelijk de regie en houdt koers. In discussies blijft hij duidelijk, al kan hij soms te snel doorpakken.",
        "Resultaatgerichtheid":
          "Werkt doelbewust en efficiënt; schakelt snel naar actie. De focus op snelheid kan reflectie op het proces beperken.",
      },
      psychologist_input:
        "Benadruk balans tussen daadkracht en ruimte geven; advies: expliciet reflectiemoment inbouwen bij deadlines.",
    });
    setText(demo);
    setLoading(false);
  };

  return (
    <div style={{ padding: 12, borderRadius: 8, background: "#fff", border: "1px solid #e6eaf0" }}>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Genereren..." : "Genereer Conclusie & Advies (demo)"}
      </button>
      {text && <div style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{text}</div>}
    </div>
  );
}
