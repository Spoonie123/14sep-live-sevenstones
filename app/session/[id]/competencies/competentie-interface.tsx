"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  type Competency,
  MAIN_COMPETENCIES,
  ADDITIONAL_COMPETENCIES,
} from "./competentie-lijst";
import {
  type GenerationProps,
  generateCompetencyText,
} from "./ai-generation-competencies";
import type { PersonalityData } from "../personality/personality-types";
// ⬇️ Vervangen: geen top-level createClient meer
import { supabase } from "../../../../lib/supabase";

type SessionsRow = {
  person_title: string | null;
  first_name: string | null;
  last_name: string | null;
  personality_text: string | null; // ✅ toegevoegd
};

interface CompetentieInterfaceProps {
  sessionId: string;
  selectedCompetencies: Competency[];
  observations: Partial<Record<Competency, string>>;
  competencyScores: Partial<Record<Competency, number>>;
  personalityRelations: Partial<Record<Competency, boolean>>;
  generatedTexts: Partial<Record<Competency, string>>;

  personalityData?: Partial<PersonalityData> | Record<string, any>;
  onCompetencyToggle: (competency: Competency) => void;
  onObservationChange: (competency: Competency, value: string) => void;
  onScoreChange: (competency: Competency, score: number) => void;
  onPersonalityRelationToggle: (competency: Competency) => void;
  onGeneratedTextChange: (competency: Competency, text: string) => void;
}

export function CompetentieInterface({
  sessionId,
  selectedCompetencies,
  observations,
  competencyScores,
  personalityRelations,
  generatedTexts,
  onCompetencyToggle,
  onObservationChange,
  onScoreChange,
  onPersonalityRelationToggle,
  onGeneratedTextChange,
}: CompetentieInterfaceProps) {
  const [showMoreCompetencies, setShowMoreCompetencies] = useState(false);
  const [isGenerating, setIsGenerating] = useState<
    Partial<Record<Competency, boolean>>
  >({});
  const [error, setError] = useState<string | null>(null);

  /** ---- Persoonsgegevens rechtstreeks uit 'sessions' ---- */
  const [loadingPersonal, setLoadingPersonal] = useState(true);
  const [personalInfo, setPersonalInfo] = useState<{
    personTitle: string | null;
    first_name: string | null;
    last_name: string | null;
    personality_text: string | null; // ✅ toegevoegd
  }>({ personTitle: null, first_name: null, last_name: null, personality_text: null });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoadingPersonal(true);
      const { data, error } = await supabase
        .from("sessions")
        .select("person_title, first_name, last_name, personality_text") // ✅ personality_text mee selecteren
        .eq("id", sessionId)
        .single<SessionsRow>();

      if (!isMounted) return;

      if (error) {
        console.error("[competencies] Supabase error:", error);
        setError("Kon persoonsgegevens niet laden uit sessions.");
      } else if (data) {
        setPersonalInfo({
          personTitle: data.person_title,
          first_name: data.first_name,
          last_name: data.last_name,
          personality_text: data.personality_text ?? null, // ✅ opslaan
        });
      }
      setLoadingPersonal(false);
    })();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  /** ---- Validatie: wanneer mag je genereren? ---- */
  const canGenerate = useMemo(() => {
    const t = personalInfo.personTitle;
    const fn = (personalInfo.first_name || "")?.trim();
    const ln = (personalInfo.last_name || "")?.trim();

    if (!t) return false;
    if (t === "Voornaam") return fn.length > 0 || ln.length > 0;
    if (t === "De heer" || t === "Mevrouw") return ln.length > 0 || fn.length > 0;
    return fn.length > 0 || ln.length > 0;
  }, [personalInfo]);

  const handleGenerate = async (competency: Competency) => {
    setError(null);

    const relate = personalityRelations[competency] === true;

    // ✅ Alleen als 'relate' aan staat en er tekst is, sturen we personality_text mee
    const payloadPersonality: Record<string, any> = {
      personTitle: personalInfo.personTitle ?? undefined,
      first_name: personalInfo.first_name ?? undefined,
      last_name: personalInfo.last_name ?? undefined,
    };
    if (relate && personalInfo.personality_text) {
      payloadPersonality.personality_text = personalInfo.personality_text;
    }

    const payload: GenerationProps = {
      competency,
      personalityData: payloadPersonality,
      observation: observations[competency],
      score: competencyScores[competency],
      relateToPersonality: relate,
      onGeneratedTextChange,
      setIsGenerating,
      setError,
    };

    await generateCompetencyText(payload);
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div
        style={{
          backgroundColor: "white",
          border: "2px solid #e2e8f0",
          borderRadius: "12px",
          padding: "32px",
        }}
      >
        {/* Persoonlijke gegevens */}
        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                background: "rgba(0,51,102,0.08)",
                color: "#003366",
              }}
            >
              👤
            </span>
            <h3 style={{ margin: 0, color: "#003366" }}>Persoonlijke gegevens</h3>
            <span
              style={{
                marginLeft: "auto",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                background: loadingPersonal
                  ? "#e2e8f0"
                  : canGenerate
                  ? "rgba(16,185,129,.15)"
                  : "rgba(239,68,68,.15)",
                color: loadingPersonal
                  ? "#334155"
                  : canGenerate
                  ? "#065f46"
                  : "#991b1b",
              }}
            >
              {loadingPersonal
                ? "Laden…"
                : canGenerate
                ? "Gereed voor AI"
                : "Onvolledig"}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#475569",
                  marginBottom: 6,
                }}
              >
                Aanspreekwijze
              </label>
              <input
                value={personalInfo.personTitle ?? ""}
                readOnly
                placeholder="(niet gevonden)"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  background: "#f1f5f9",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#475569",
                  marginBottom: 6,
                }}
              >
                Voornaam
              </label>
              <input
                value={personalInfo.first_name ?? ""}
                readOnly
                placeholder="(niet gevonden)"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  background: "#f1f5f9",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#475569",
                  marginBottom: 6,
                }}
              >
                Achternaam
              </label>
              <input
                value={personalInfo.last_name ?? ""}
                readOnly
                placeholder="(niet gevonden)"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  background: "#f1f5f9",
                }}
              />
            </div>
          </div>

          {!loadingPersonal && !canGenerate && (
            <p style={{ marginTop: 10, color: "#b91c1c", fontSize: 13 }}>
              Vul eerst aanspreekwijze/naam in bij <strong>Persoonlijkheid</strong> of
              in de <strong>sessions</strong>-tabel. (De Genereer-knop is uitgeschakeld
              totdat dit compleet is.)
            </p>
          )}
        </div>

        {/* titel */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: "rgba(0,51,102,0.1)",
              color: "#003366",
              fontSize: "24px",
            }}
          >
            📋
          </span>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#003366",
              margin: 0,
            }}
          >
            Competenties & AI Uitwerking
          </h2>
        </div>

        {/* rechterkolom breder */}
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "32px" }}>
          {/* Linkerkolom: selectie */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 500,
                  color: "#003366",
                  marginBottom: "16px",
                }}
              >
                Kies competenties
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {MAIN_COMPETENCIES.map((c) => (
                  <div key={c} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      type="checkbox"
                      id={c}
                      checked={selectedCompetencies.includes(c)}
                      onChange={() => onCompetencyToggle(c)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <label
                      htmlFor={c}
                      style={{ fontSize: "14px", color: "#003366", cursor: "pointer" }}
                    >
                      {c}
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "24px" }}>
                <button
                  onClick={() => setShowMoreCompetencies(!showMoreCompetencies)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#003366",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  {showMoreCompetencies ? "⬆️" : "⬇️"} Meer competenties
                </button>

                {showMoreCompetencies && (
                  <div
                    style={{
                      marginTop: "12px",
                      paddingLeft: "24px",
                      borderLeft: "2px solid #e2e8f0",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {ADDITIONAL_COMPETENCIES.map((c) => (
                      <div key={c} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input
                          type="checkbox"
                          id={c}
                          checked={selectedCompetencies.includes(c)}
                          onChange={() => onCompetencyToggle(c)}
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <label
                          htmlFor={c}
                          style={{ fontSize: "14px", color: "#003366", cursor: "pointer" }}
                        >
                          {c}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rechterkolom: observaties + Uitwerking */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {selectedCompetencies.length > 0 && (
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#003366",
                    marginBottom: "16px",
                  }}
                >
                  Observaties per competentie
                </h3>

                <div
                  style={{
                    maxHeight: "80vh",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {selectedCompetencies.map((c) => (
                    <div
                      key={c}
                      style={{
                        padding: "16px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "#003366",
                          marginBottom: "8px",
                        }}
                      >
                        {c}
                      </label>

                      {/* Observaties */}
                      <textarea
                        placeholder="Voer observaties in..."
                        value={observations[c] || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          onObservationChange(c, e.target.value)
                        }
                        style={{
                          width: "100%",
                          minHeight: "220px",
                          padding: "10px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "6px",
                          fontSize: "14px",
                          resize: "vertical",
                          outline: "none",
                          backgroundColor: "white",
                        }}
                      />

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "12px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#003366",
                            }}
                          >
                            Score:
                          </span>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {[1, 2, 3, 4, 5].map((score) => {
                              const active = (competencyScores[c] || 0) >= score;
                              return (
                                <button
                                  key={score}
                                  onClick={() => onScoreChange(c, score)}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "50%",
                                    border: "2px solid",
                                    borderColor: active ? "#003366" : "#cbd5e1",
                                    backgroundColor: active ? "#003366" : "white",
                                    color: active ? "white" : "#003366",
                                    fontSize: "14px",
                                    fontWeight: 500,
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {score}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <input
                            type="checkbox"
                            id={`personality-${c}`}
                            checked={personalityRelations[c] || false}
                            onChange={() => onPersonalityRelationToggle(c)}
                            style={{ width: "16px", height: "16px", cursor: "pointer" }}
                          />
                          <label
                            htmlFor={`personality-${c}`}
                            style={{ fontSize: "12px", color: "#003366", cursor: "pointer" }}
                          >
                            Relateer aan Persoonlijkheidstest{" "}
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 11,
                                color: personalInfo.personality_text ? "#64748b" : "#b91c1c",
                              }}
                            >
                              {personalInfo.personality_text
                                ? "(profiel beschikbaar)"
                                : "(profiel ontbreekt)"}
                            </span>
                          </label>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "16px",
                          paddingTop: "16px",
                          borderTop: "1px solid #e2e8f0",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "14px",
                            fontWeight: 600,
                            color: "#003366",
                            marginBottom: "8px",
                          }}
                        >
                          Uitwerking
                        </h4>

                        {/* Uitwerking: bewerkbaar */}
                        <textarea
                          value={generatedTexts[c] || ""}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            onGeneratedTextChange(c, e.target.value)
                          }
                          placeholder="De (AI-)uitgewerkte tekst verschijnt hier en is volledig aanpasbaar."
                          style={{
                            width: "100%",
                            minHeight: "480px",
                            padding: "10px",
                            border: "1px solid #cbd5e1",
                            borderRadius: "6px",
                            fontSize: "14px",
                            resize: "vertical",
                            backgroundColor: "#f8fafc",
                            outline: "none",
                            color: "#334155",
                            whiteSpace: "pre-wrap",
                          }}
                        />

                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                          <button
                            onClick={() => handleGenerate(c)}
                            disabled={isGenerating[c] || !canGenerate || loadingPersonal}
                            style={{
                              padding: "8px 16px",
                              backgroundColor:
                                isGenerating[c] || !canGenerate || loadingPersonal
                                  ? "#94a3b8"
                                  : "#003366",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              fontSize: "14px",
                              cursor:
                                isGenerating[c] || !canGenerate || loadingPersonal
                                  ? "not-allowed"
                                  : "pointer",
                              opacity: isGenerating[c] ? 0.7 : 1,
                            }}
                          >
                            {isGenerating[c] ? "Bezig met genereren..." : "Genereer"}
                          </button>

                          {isGenerating[c] && (
                            <span style={{ fontSize: 12, color: "#64748b" }}>
                              Tekst blijft bewerkbaar terwijl er wordt gegenereerd.
                            </span>
                          )}
                        </div>

                        {error && (
                          <p style={{ marginTop: "8px", fontSize: "12px", color: "red" }}>
                            {error}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
