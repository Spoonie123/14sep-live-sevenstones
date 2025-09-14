"use client";

import { useState } from "react";
import { PersonalityData, PERSON_TITLES } from "./personality-types";
import { neoExplanations } from "./neo-explanations";
import { personalityExamples } from "./personality-examples";

import { createClient } from "@supabase/supabase-js";

// Supabase client is hier niet langer nodig omdat page.tsx het al regelt.
// Je zou dit kunnen verwijderen voor een schonere code.

interface Props {
  personalityData: PersonalityData;
  setPersonalityData: (data: any) => void;
  // onSave is verwijderd, omdat autosave in page.tsx het opslaan regelt
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
    
    // Stap 1: Haal de benodigde data op en voer null-checks uit
    const { neo_scores, personTitle, first_name, last_name } = personalityData;

    if (!neo_scores || !personTitle || (!first_name && !last_name)) {
      setError("Ontbrekende gegevens: Neo-scores, naam of titel ontbreken.");
      setIsGenerating(false);
      return;
    }

    // Stap 2: Bepaal de correcte aanspreekwijze
    let displayName = "";
    let addressForm = "";
    const name = first_name || last_name;

    if (personTitle === "Voornaam") {
      displayName = first_name || "";
      addressForm = displayName;
    } else if (personTitle === "De heer") {
      displayName = `de heer ${last_name || ""}`;
      addressForm = "de heer";
    } else if (personTitle === "Mevrouw") {
      displayName = `mevrouw ${last_name || ""}`;
      addressForm = "mevrouw";
    }

    // Stap 3: Bouw de prompts op met de geïmporteerde data
    const scoresContext = Object.entries(neo_scores)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");

    const systemPrompt = `
      Jij bent een zeer ervaren psycholoog, gespecialiseerd in het schrijven van professionele en genuanceerde persoonlijkheidsrapporten. 
      Je bent bekend met de NEO-PI-3 persoonlijkheidstest.

      Jouw expertise:
      - 15+ jaar ervaring met persoonlijkheidsanalyse
      - Expert in het schrijven van professionele, menselijke rapporten die niet als AI-gegenereerd klinken
      - Je toont in je teksten inzicht in psychologische concepten en gedragspatronen

      Je schrijft in een gebalanceerde en professionele toon, zonder oordeel.
      Je gebruikt altijd de volledige naam en correcte aanspreekwijze zoals die worden aangeleverd.

      BELANGRIJKE KENNIS EN CONTEXT:
      ${neoExplanations.normScores}
      ${neoExplanations.structuur}
      ${Object.values(neoExplanations.hoofdtrekken).map(h => `
        ### ${h.titel}
        ${h.omschrijving}
        **Facetten:**
        ${Object.values(h.facetten).map(f => `- ${f}`).join("\n")}
      `).join("\n")}
    `;

    const userPrompt = `
      Schrijf een persoonlijkheidsanalyse voor de volgende persoon, gebaseerd op de aangeleverde data en in de stijl van de voorbeelden.

      PERSOONSDATA:
      - Naam: ${displayName}
      - Aanspreekwijze: ${addressForm}
      
      NEO-PI-3 NORM SCORES (1-9):
      ${scoresContext}

      SCHRIJFOPDRACHT:
      1. Schrijf een professioneel en menselijk rapport in het Nederlands.
      2. Noem GEEN letterlijke cijfers of de naam van de test.
      3. Gebruik de naam "${displayName}" in de tekst, maar zorg dat het niet te vaak voorkomt.
      4. Begin de tekst ALTIJD met de verplichte openingszin: "Uit de persoonlijkheidstest komt ${addressForm} ${personTitle === "Voornaam" ? first_name : last_name} naar voren als..."
      5. De tekst moet de vijf hoofdtrekken (Neuroticisme, Extraversie, Openheid, Altruïsme, Consciëntieusheid) in die exacte volgorde behandelen.
      6. Gebruik GEEN van de volgende woorden in je tekst: facet, neuroticisme, extraversie, openheid, altruïsme, consciëntieusheid, en de facet-namen. Beschrijf in plaats daarvan de onderliggende kenmerken op basis van de scores, zoals de neiging tot zorgen maken, openstaan voor nieuwe ideeën, of georganiseerd zijn.
      7. Je bent getraind op de volgende schrijfstijl. Gebruik deze voorbeelden als leidraad voor toon, woordkeuze en opbouw:
      
      --- START VOORBEELDEN ---
      ${personalityExamples.join("\n---\n")}
      --- EINDE VOORBEELDEN ---

      Je tekst moet zuiver beschrijvend zijn en geen adviezen of aanbevelingen bevatten. 
      Begin direct met de verplichte openingszin.
    `;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo-preview", // Gebruik een geavanceerder model voor betere resultaten
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          max_tokens: 1200, // Zorg voor voldoende tokens voor een uitgebreid rapport
          temperature: 0.7, // Standaard temperatuur voor creativiteit
        }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0].message.content;

      // Update de state, de autosave in page.tsx zal het opslaan afhandelen
      setPersonalityData((prev: PersonalityData) => ({
        ...prev,
        personalityText: generatedText,
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
        <div style={{ marginTop: "24px" }}>
          <textarea
            value={personalityData.personalityText}
            onChange={(e) =>
              setPersonalityData((prev: PersonalityData) => ({
                ...prev,
                personalityText: e.target.value,
              }))
            }
            style={{
              width: "100%",
              minHeight: "300px",
              padding: "16px",
              fontSize: "16px",
              lineHeight: "1.6",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba",
              resize: "vertical",
              outline: "none",
            }}
          />
        </div>
      )}
    </div>
  );
}