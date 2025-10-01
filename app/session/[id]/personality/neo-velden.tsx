"use client";

import React from "react";
import { PersonalityData } from "./personality-types";
import { scoreToTerm } from "./utils";          // <-- onze helper

/* -----------------------------------------------------------------
   1️⃣  DEFINITIE van de domeinen & facetten (ongewijzigd)
   ----------------------------------------------------------------- */
export const NEO_DOMAINS = [
  {
    key: "neuroticisme",
    label: "Neuroticisme",
    facets: [
      { key: "n1_angst", label: "N1 Angst" },
      { key: "n2_ergernis", label: "N2 Ergernis" },
      { key: "n3_depressie", label: "N3 Depressie" },
      { key: "n4_schaamte", label: "N4 Schaamte" },
      { key: "n5_impulsiviteit", label: "N5 Impulsiviteit" },
      { key: "n6_kwetsbaarheid", label: "N6 Kwetsbaarheid" },
    ],
  },
  {
    key: "extraversie",
    label: "Extraversie",
    facets: [
      { key: "e1_hartelijkheid", label: "E1 Hartelijkheid" },
      { key: "e2_sociabiliteit", label: "E2 Sociabiliteit" },
      { key: "e3_dominantie", label: "E3 Dominantie" },
      { key: "e4_energie", label: "E4 Energie" },
      { key: "e5_avonturisme", label: "E5 Avonturisme" },
      { key: "e6_vrolijkheid", label: "E6 Vrolijkheid" },
    ],
  },
  {
    key: "openheid",
    label: "Openheid",
    facets: [
      { key: "o1_fantasie", label: "O1 Fantasie" },
      { key: "o2_esthetiek", label: "O2 Esthetiek" },
      { key: "o3_gevoelens", label: "O3 Gevoelens" },
      { key: "o4_verandering", label: "O4 Verandering" },
      { key: "o5_ideeen", label: "O5 Ideeën" },
      { key: "o6_waarden", label: "O6 Waarden" },
    ],
  },
  {
    key: "altruisme",
    label: "Altruïsme",
    facets: [
      { key: "a1_vertrouwen", label: "A1 Vertrouwen" },
      { key: "a2_oprechtheid", label: "A2 Oprechtheid" },
      { key: "a3_zorgzaamheid", label: "A3 Zorgzaamheid" },
      { key: "a4_inschikkelijkheid", label: "A4 Inschikkelijkheid" },
      { key: "a5_bescheidenheid", label: "A5 Bescheidenheid" },
      { key: "a6_medeleven", label: "A6 Medeleven" },
    ],
  },
  {
    key: "consciëntieusheid",
    label: "Consciëntieusheid",
    facets: [
      { key: "c1_doelmatigheid", label: "C1 Doelmatigheid" },
      { key: "c2_ordelijkheid", label: "C2 Ordelijkheid" },
      { key: "c3_betrouwbaarheid", label: "C3 Betrouwbaarheid" },
      { key: "c4_ambitie", label: "C4 Ambitie" },
      { key: "c5_zelfdiscipline", label: "C5 Zelfdiscipline" },
      { key: "c6_bedachtzaamheid", label: "C6 Bedachtzaamheid" },
    ],
  },
];

/* -----------------------------------------------------------------
   2️⃣  Props‑interface (ongewijzigd)
   ----------------------------------------------------------------- */
interface NeoVeldenProps {
  personalityData: PersonalityData;
  setPersonalityData: React.Dispatch<React.SetStateAction<PersonalityData>>;
}

/* -----------------------------------------------------------------
   3️⃣  Component
   ----------------------------------------------------------------- */
export default function NeoVelden({
  personalityData,
  setPersonalityData,
}: NeoVeldenProps) {
  /* ---------------------------------------------------------------
     3.1  Huidige score → term‑mapping + state‑update
     --------------------------------------------------------------- */
  const handleChange = (facetKey: string, value: string) => {
    const numValue = value === "" ? undefined : Number.parseInt(value, 10);
    if (numValue !== undefined && (numValue < 1 || numValue > 9)) return;

    const term = scoreToTerm(numValue); // ← nieuwe term berekenen

    setPersonalityData((prev) => ({
      ...prev,
      // ---- scores ----
      neo_scores: { ...prev.neo_scores, [facetKey]: numValue },

      // ---- terms (maak object aan indien nog niet bestaat) ----
      neo_terms: { ...(prev.neo_terms ?? {}), [facetKey]: term },
    }));
  };

  /* ---------------------------------------------------------------
     3.2  Huidige interpretablije (kleur‑/tekst) voor UI
         – nu gebruiken we nog steeds “Laag / Gemiddeld / Hoog”,
           maar we kunnen er later de *exacte* term uit `neo_terms`
           voor laten zien als we dat willen.
     --------------------------------------------------------------- */
  const getInterpretation = (score?: number) => {
    if (!score) return { text: "", color: "#6b7280" };
    if (score >= 1 && score <= 3) return { text: "Laag", color: "#dc2626" };
    if (score >= 4 && score <= 6) return { text: "Gemiddeld", color: "#059669" };
    if (score >= 7 && score <= 9) return { text: "Hoog", color: "#2563eb" };
    return { text: "", color: "#6b7280" };
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
    }
  };

  /* ---------------------------------------------------------------
     3.3  Render
     --------------------------------------------------------------- */
  return (
    <div>
      {/* Titel */}
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#003366",
          marginBottom: "20px",
        }}
      >
        📊 NEO-PI-3 Norm Scores (1‑9)
      </h3>

      {/* Doorloop alle domeinen */}
      {NEO_DOMAINS.map((domain) => (
        <div key={domain.key} style={{ marginBottom: "32px" }}>
          {/* Domeinnaam */}
          <h4
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#003366",
              marginBottom: "16px",
              borderBottom: "2px solid #e2e8f0",
              paddingBottom: "8px",
            }}
          >
            {domain.label}
          </h4>

          {/* -----  HOOFDTREK (gemiddelde van facetten) ----- */}
          <div
            style={{
              marginBottom: "16px",
              padding: "16px",
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
              border: "2px solid #3b82f6",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <label
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1e40af",
                }}
              >
                {domain.label} (Gemiddelde van facetten)
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="text"
                value={personalityData.neo_scores?.[domain.key] || ""}
                onChange={(e) => handleChange(domain.key, e.target.value)}
                onKeyDown={handleKeyDown}
                onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                style={{
                  width: "60px",
                  padding: "8px 12px",
                  border: "1px solid #3b82f6",
                  borderRadius: "6px",
                  fontSize: "16px",
                  textAlign: "center",
                  fontWeight: "600",
                }}
                placeholder="1‑9"
              />
              {/* toon eventueel de *term* die we net berekend hebben */}
              <span
                style={{
                  fontSize: "12px",
                  color:
                    getInterpretation(
                      personalityData.neo_scores?.[domain.key]
                    ).color,
                }}
              >
                {getInterpretation(
                  personalityData.neo_scores?.[domain.key]
                ).text}
              </span>
            </div>
          </div>

          {/* -----  FACETEN ----- */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {domain.facets.map((facet) => {
              const score = personalityData.neo_scores?.[facet.key];
              const term = personalityData.neo_terms?.[facet.key] ?? "";
              const interpretation = getInterpretation(score);

              return (
                <div
                  key={facet.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                >
                  {/* facet‑label + (optioneel) term‑visualisatie */}
                  <div>
                    <label
                      style={{
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      {facet.label}
                    </label>
                    {interpretation.text && (
                      <span
                        style={{
                          fontSize: "12px",
                          marginLeft: "8px",
                          color: interpretation.color,
                        }}
                      >
                        {interpretation.text}
                      </span>
                    )}
                    {/* **Extra:** toon de exacte term (bijv. “licht gemiddeld”) */}
                    {term && (
                      <span
                        style={{
                          fontSize: "12px",
                          marginLeft: "8px",
                          color: "#6b7280",
                        }}
                      >
                        ({term})
                      </span>
                    )}
                  </div>

                  {/* input‑veld */}
                  <input
                    type="text"
                    value={score ?? ""}
                    onChange={(e) => handleChange(facet.key, e.target.value)}
                    onKeyDown={handleKeyDown}
                    onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                    style={{
                      width: "60px",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "16px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                    placeholder="1‑9"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
