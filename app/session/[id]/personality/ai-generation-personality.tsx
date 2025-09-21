"use client";

import { useState, type ChangeEvent } from "react";
import { PersonalityData } from "./personality-types";
import { neoExplanations } from "./neo-explanations";
import { personalityExamples } from "./personality-examples";

interface Props {
  personalityData: PersonalityData;
  setPersonalityData: (data: any) => void;
  isCompleted: boolean;
  sessionId: string;
}

export default function AiGenerationPersonality({
  personalityData,
  setPersonalityData,
  isCompleted,
  sessionId,
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateText = async () => {
    setIsGenerating(true);
    setError(null);

    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;
    const { neo_scores, personTitle, first_name, last_name } = personalityData;

    if (!neo_scores || !personTitle || (!first_name && !last_name)) {
      setError("Ontbrekende gegevens: Neo-scores, naam of titel ontbreken.");
      setIsGenerating(false);
      return;
    }

    // Aanspreekwijze + naam
    let displayName = "";
    let addressForm = "";
    if (personTitle === "Voornaam") {
      displayName = first_name || "";
      addressForm = "";
    } else if (personTitle === "De heer") {
      displayName = `de heer ${last_name || ""}`;
      addressForm = "de heer";
    } else if (personTitle === "Mevrouw") {
      displayName = `mevrouw ${last_name || ""}`;
      addressForm = "mevrouw";
    }

    const openingNaam =
      personTitle === "Voornaam" ? (first_name || "") : (last_name || "");
    const openingAanspreek = personTitle === "Voornaam" ? "" : addressForm;

    const scoresContext = Object.entries(neo_scores as Record<string, unknown>)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(", ");

    // =========================
    // SYSTEM PROMPT (STRIKT)
    // =========================
    const systemPrompt = `
Je schrijft Nederlandstalige, gortdroge persoonlijkheidsbeschrijvingen op basis van NEO-PI (geen testnaam en geen cijfers).

ONONDERHANDELBARE REGELS:
1) STIJL: staccato; korte zinnen (8–18 woorden); geen adviezen; geen interpretaties; geen ontwikkeltaal.
   Idiomen spaarzaam en herkenbaar; géén nieuwe metaforen; geen telegramstijl.
   Interpunctie: géén puntkomma’s; gebruik punten.
2) TERMINOLOGIE: gebruik “extraversie”; vermijd “extravertie”, “facet”, testnamen en cijfers.
3) STRUCTUUR: exact vijf alinea’s in vaste volgorde:
   1) Emotionele veerkracht
   2) Extraversie
   3) Openheid en onderzoekendheid
   4) Gerichtheid (op anderen vs. eigen belang)
   5) Consciëntieusheid
   Elke alinea gescheiden door precies één lege regel. Geen koppen/tags.
4) FACETDEKKING: behandel 30 aspecten beschrijvend; groepeer gelijke band; uitschieters kort apart.
   Emotionele veerkracht móét expliciet bevatten: angst, ergernis/boosheid, somberheid/depressieve gevoelens, schaamte/verlegenheid, impulscontrole, stressbestendigheid/kwetsbaarheid.
   Gerichtheid móét expliciet bevatten: vertrouwen, openhartigheid/oprechtheid, zorgzaamheid, inschikkelijkheid/competitie, bescheidenheid, medeleven.
5) TAAL: beschrijvend (“is minder aanwezig”, “ongeveer gemiddeld”, “ligt hoog”); vermijd doublures en de frase “wat zich uit in”.
6) OPENING (verplicht, exact): “Uit de persoonlijkheidstest komt [aanspreekwijze] [naam] naar voren als…”.
7) UITVOER: uitsluitend de uiteindelijke tekst (vijf alinea’s, één lege regel ertussen). Geen koppen, bullets of uitleg.
8) NUANCE: per domein exact 2 korte nuancezinnen met natuurlijk contrast/situatie (geen sjablonen).
9) VERGELIJKINGSANKER: **per alinea minimaal één** korte vergelijking, bv. “ten opzichte van de meeste mensen…”, “vergeleken met…”, “in de meeste situaties…”.
10) VERBODEN WOORDEN: gebruik **niet** “scoort” of “score”.
11) VORM: per alinea **4–7 zinnen**. Houd je hier strikt aan.
12) CONSISTENTIE: geen tegenspraak binnen hetzelfde aspect.

(Intern – context, niet uitschrijven)
${neoExplanations.structuur}
${neoExplanations.normScores}
`.trim();

    // =========================
    // USER PROMPT
    // =========================
    const userPrompt = `
Schrijf de persoonlijkheidsanalyse in de exacte stijl van de voorbeelden. Gortdroog. Staccato. Korte zinnen.

PERSOONSDATA
- Naam (weergave): ${displayName}
- Aanspreekwijze: ${addressForm}

NORMSCORES (1–9) PER ASPECT (alleen context; niet uitschrijven):
${scoresContext}

SCHRIJFOPDRACHT:
1) Begin exact met: "Uit de persoonlijkheidstest komt ${openingAanspreek}${openingAanspreek ? " " : ""}${openingNaam} naar voren als..."
2) Lever exact vijf alinea’s, gescheiden door één lege regel. Geen koppen of tags.
3) Volg de vaste volgorde: Emotionele veerkracht → Extraversie → Openheid → Gerichtheid → Consciëntieusheid.
4) In Emotionele veerkracht en Gerichtheid de verplichte termen expliciet opnemen.
5) **Per alinea: 4–7 zinnen, minimaal één vergelijkingsanker, en exact 2 nuancezinnen** met natuurlijk contrast.
6) Vermijd de woorden “scoort” en “score”.
7) Alleen de uiteindelijke tekst met vijf alinea’s.

--- START VOORBEELDEN ---
${personalityExamples.join("\n---\n")}
--- EINDE VOORBEELDEN ---
`.trim();

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1700,
          temperature: 0.34,
          top_p: 0.9,
          presence_penalty: 0.2,
          frequency_penalty: 0.35,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      let generated: string = data.choices?.[0]?.message?.content ?? "";

      // Lichte opschoning zonder alinea’s te slopen
      generated = generated.replace(/\r\n/g, "\n");           // normaliseer
      generated = generated.replace(/;\s*/g, ". ");           // geen ;
      generated = generated.replace(                          // hoofdletter na .?!
        /([.!?])\s+([a-z\u00C0-\u024F])/g,
        (_m: string, p1: string, p2: string) => `${p1} ${p2.toUpperCase()}`
      );
      generated = generated.replace(/[ \t]{2,}/g, " ");       // extra spaties
      generated = generated.replace(/\n{3,}/g, "\n\n").trim();// >1 lege regel → 1

      setPersonalityData((prev: PersonalityData) => ({
        ...prev,
        personalityText: generated,
      }));
    } catch (err) {
      setError(`Fout bij AI generatie: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ marginTop: "32px" }}>
      <button
        onClick={handleGenerateText}
        disabled={isGenerating}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: "bold",
          color: "white",
          backgroundColor: "#003366",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          transition: "background-color 0.3s ease",
        }}
      >
        {isGenerating ? "🧠 Bezig met genereren..." : "🧠 Genereer Persoonlijkheidsanalyse"}
      </button>

      {error && <p style={{ color: "red", marginTop: "16px" }}>{error}</p>}

      {personalityData.personalityText && (
        <div style={{ marginTop: "16px" }}>
          <textarea
            value={personalityData.personalityText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setPersonalityData((prev: PersonalityData) => ({
                ...prev,
                personalityText: e.target.value,
              }))
            }
            style={{
              width: "100%",
              minHeight: "320px",
              padding: "16px",
              fontSize: "16px",
              lineHeight: "1.7",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
              resize: "vertical",
              outline: "none",
              whiteSpace: "pre-wrap", // toont alinea-witregels
              background: "#fff",
            }}
          />
        </div>
      )}
    </div>
  );
}
