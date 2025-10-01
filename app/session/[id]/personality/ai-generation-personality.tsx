"use client";

import { useState, type ChangeEvent } from "react";
import { PersonalityData } from "./personality-types";
import { personalityExamples } from "./personality-examples";

interface Props {
  personalityData: PersonalityData;
  setPersonalityData: (data: any) => void;
  isCompleted: boolean;
  sessionId: string;
}

/* ──────────────────────────────────────────────────────────────
   1️⃣  SYSTEM‑PROMPT – STRIKTE INSTRUCTIES (VERWIJDERDE VETO A5)
   ---------------------------------------------------------------- */
   const systemPrompt = `
   Je schrijft een zakelijk, droog, objectief Nederlands persoonlijkheidsrapport (de modelnaam mag NIET genoemd worden).
   
   🚫 **KERNWET – SCORE‑TERMIEN (gebruik ALLEEN deze 9 termen)**
   1 = zeer laag | 2 = laag | 3 = beneden gemiddeld | 4 = licht gemiddeld |
   5 = gemiddeld | 6 = licht boven gemiddeld | 7 = bovengemiddeld |
   8 = hoog | 9 = zeer hoog
   
   ✅ **HARD‑OVERRIDES (VETO‑REGELS) – MOETEN EXACT WORDEN GEHOUDEN**
   - Fantasie (O1) < 4: Gebruik ALLEEN “nuchter”, “feitelijk” of “pragmatisch”. De zin over O1 moet **altijd** 12‑15 woorden bevatten.
   - Fantasie (O1) > 6: Gebruik de termen “nuchter”, “feitelijk” of “pragmatisch” **NIET**.
   - Betrouwbaarheid (C3): Wees zeer voorzichtig met de beschrijving van **Betrouwbaarheid**; de tekst mag **NOOIT** de suggestie wekken van ontrouw, onbetrouwbaarheid, of een lakse houding ten opzichte van afspraken, ongeacht de score.
   - Vrolijkheid (E6): Geen zinnen over “rust nodig heeft” of onlogische contrasten met rust.
   - **Neuroticisme (N):** Als N beneden gemiddeld (≤ 3) is, benoem dan de **hoge emotionele veerkracht** in de openingszin, niet de lage veerkracht.
   
   📝 📝**STIJL & STRUCTUUR**
1. **ZINLENGTE**: De beschrijving van elk facet moet in **vloeiende, zakelijke zinnen** worden verwerkt. **Elke zin moet tussen de 12 en 15 woorden liggen**. De **exacte term** van het facet (bijv. Bescheidenheid, Zelfdiscipline) hoeft **NIET** in de zin te worden opgenomen.
2. **STRIKTE ZINSOPBOUW VETO**: **Verboden** is elke zinsconstructie die leidt tot een zin van minder dan 12 woorden. Start de zin altijd met een beschrijvende zin die het gedrag en de score integreert.
3. **PUNCTUATIE**: Gebruik punten (.) om zinnen duidelijk af te bakenen en de lezerssnelheid te optimaliseren. Gebruik komma's (,) alleen om onderdelen binnen de zin te scheiden, niet om zinnen onnodig te verlengen.
4. **STRUCTUUR**: Exact **vijf alinea’s** in vaste volgorde: 1) Emotionele veerkracht (N), 2) Extraversie (E), 3) Openheid & onderzoekendheid (O), 4) Altruïsme (A), 5) Consciëntieusheid (C).
5. **ALINEA-EISEN**: Elke alinea 4‑7 zinnen, gescheiden door één lege regel, **geen koppen/tags**.
6. **ANKERS**: Per alinea maximaal één van “ten opzichte van de meeste mensen”, “vergeleken met anderen”, of “in de meeste situaties”.
7. **NUANCE**: Per alinea exact twee nuance‑zinnen (een contrast‑zin of een algemene samenvatting bij middenscores 4‑6).
   
   🔍 **INHOUD EN FOCUS**
   - **Opvallend (1‑3 of 7‑9)**: Schrijf hierover een **volledige zin** van 12‑15 woorden met de **exacte term**.
   - **Minder opvallend (4, 5, 6)**: Combineer in een zin die de **exacte term** bevat.
   - **ISOLATIE VAN FACETTEN (versoepeld)**: Zorg ervoor dat de beschrijving van elk afzonderlijk facet in **één, duidelijke, complete zin** wordt behandeld. Uitzondering: Facetten met minder opvallende scores (4, 5, 6) mogen logisch worden gecombineerd.
   - **NEUROTICISME (N) SAMENVATTING**: De alinea mag beginnen met een **algemene samenvatting** van de lage N-scores, maar vermijd daarna doublures (herhaling van 'negatieve emoties' of 'somber'). Beschrijf elk facet daarna afzonderlijk en vloeiend.
   - **Geen losse korte zinnen** (i.e. altijd > 12 woorden).
   
   🔤 **TOEGESTANE IDIOMEN**: Alleen bij scores “hoog” of “zeer hoog” voor het betreffende facet.
   ❌ **VERBODEN WOORDEN**: ‘facet’, ‘test’, ‘%’, ‘;’, ‘advies’, ‘ontwikkeltaal’, ‘cijfers’, **'iets'**, **'hoog' (gebruikt als synoniem voor 'bovengemiddeld')**, **'zeer laag' (gebruikt als synoniem voor 'laag')**, **'hoge mate' (gebruikt als synoniem voor 'bovengemiddeld')**, **'gemiddelde' (gebruikt als synoniem voor 'licht gemiddeld' of 'licht boven gemiddeld')**.
   
   --- EINDE SYSTEM‑PROMPT ---`.trim();
/* ──────────────────────────────────────────────────────────────
   2️⃣  USER‑PROMPT – INPUT‑VARIABELEN
   ---------------------------------------------------------------- */
const userPromptTemplate = (
  displayName: string,
  addressForm: string,
  openingAanspreek: string,
  openingNaam: string,
  scoresContext: string
) => `
Schrijf de persoonlijkheidsanalyse volgens precies de stijl en structuur die in de system‑prompt is beschreven.

**VOORBEELDEN (GEBRUIK DEZE STIJL EN TONALITEIT)**
${personalityExamples.slice(0, 3).join("\n---\n")}

PERSOONSDATA
- Naam (weergave): ${displayName}
- Aanspreekwijze: ${addressForm}

NORMSCORES (1–9) PER FACET (alleen ter informatie):
${scoresContext}

SCHRIJFOPDRACHT
1. Begin exact met: "Uit de persoonlijkheidstest komt ${openingAanspreek}${openingAanspreek ? " " : ""}${openingNaam} naar voren als..."
2. Lever exact vijf alinea’s, gescheiden door één lege regel.
3. Volg de vaste alinea-volgorde en alle regels uit de SYSTEM-PROMPT strikt.
4. Retourneer **alleen** de uiteindelijke tekst (vijf alinea’s).`.trim();

/* ──────────────────────────────────────────────────────────────
   3️⃣  COMPONENT – LOGICA
   ---------------------------------------------------------------- */
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

    /* ---- 3.1 VALIDATIE ---- */
    if (!neo_scores || !personTitle || (!first_name && !last_name)) {
      setError("Ontbrekende gegevens: Neo‑scores, naam of titel ontbreken.");
      setIsGenerating(false);
      return;
    }

    /* ---- 3.2 NAAM & AANSPREEKFORMAAT (ongewijzigd) ---- */
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

    /* ---- 3.3 SCORE CONTEXT ---- */
    // De scores worden al correct doorgegeven via scoresContext, dit is OK.

    const scoresContext = Object.entries(
      neo_scores as Record<string, unknown>
    )
      .map(([k, v]) => `${k}: ${String(v)}`)
      .join(", ");

    /* ---- 3.4 USER PROMPT ---- */
    const userPrompt = userPromptTemplate(
      displayName,
      addressForm,
      openingAanspreek,
      openingNaam,
      scoresContext
    );

    /* ---- 3.5 CALL TO OPENAI ---- */
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
          temperature: 0.3,      // Iets lagere T voor meer precisie
          top_p: 0.9,
          presence_penalty: 0.2,
          frequency_penalty: 0.35,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(
          `API‑fout: ${response.statusText} – ${JSON.stringify(err)}`
        );
      }

      const data = await response.json();
      let generated: string = data.choices?.[0]?.message?.content ?? "";

      /* ---- 3.6 POST‑PROCESSING (minimum) ---- */
      generated = generated
        .replace(/\r\n/g, "\n")            // normaliseer line‑ends
        .replace(/;\s*/g, ". ")            // geen puntkomma’s
        .replace(/[ \t]{2,}/g, " ")       // dubbele spaties
        .replace(/\n{3,}/g, "\n\n")        // >1 lege regel → 1
        // HOOFDLETTERCORRECTIE toegevoegd in de vorige stap
        .replace(/\. ([a-z])/g, (_, p1) => `. ${p1.toUpperCase()}`)
        .replace(/^[a-z]/, (m) => m.toUpperCase()) 
        .trim();

      /* ---- 3.7 (optioneel) VALIDATIE NA GENERATIE ---- */
      // const validatorErrors = validateReport(generated, neo_scores as any);
      // if (validatorErrors.length) {
      //   setError(`Validatiefouten: ${validatorErrors.join(" | ")}`);
      //   setIsGenerating(false);
      //   return;
      // }

      setPersonalityData((prev: PersonalityData) => ({
        ...prev,
        personalityText: generated,
      }));
    } catch (err) {
      setError(
        `Fout bij AI‑generatie: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /* ──────────────────────────────────────────────────────────────
     4️⃣  UI (ongewijzigd)
     ---------------------------------------------------------------- */
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
              whiteSpace: "pre-wrap",
              background: "#fff",
            }}
          />
        </div>
      )}
    </div>
  );
}