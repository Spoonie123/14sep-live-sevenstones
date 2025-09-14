"use client";

import React, { useMemo, useState } from "react";

type GeneratedTextsMap = Record<string, string>;

interface ConclusionInterfaceProps {
  /** Persoonsgegevens voor header/labeling (alleen tonen) */
  personTitle?: string | null;
  first_name?: string | null;
  last_name?: string | null;

  /** Linkerkolom: persoonlijkheidsanalyse (alleen-lezen) */
  personality_text?: string | null;

  /** Rechterkolom: alle uitgewerkte competenties (alleen-lezen weergave) */
  generated_texts: GeneratedTextsMap;

  /** Midden: invoerveld + AI-output (beide bewerkbaar) */
  psychologist_input: string;
  conclusion_advice_text: string;

  /** Callbacks (autosave/AI-triggers worden in page.tsx afgehandeld) */
  onPsychologistInputChange: (value: string) => void;
  onConclusionAdviceChange: (value: string) => void;
  onGenerate: () => void;

  /** UI-states */
  canGenerate?: boolean;   // bepaalt of de generate-knop actief is
  isGenerating?: boolean;  // spinner/disabled tijdens generatie
  isSaving?: boolean;      // toon "Opslaan..." badge
}

export default function ConclusionInterface({
  personTitle,
  first_name,
  last_name,
  personality_text,
  generated_texts,
  psychologist_input,
  conclusion_advice_text,
  onPsychologistInputChange,
  onConclusionAdviceChange,
  onGenerate,
  canGenerate = true,
  isGenerating = false,
  isSaving = false,
}: ConclusionInterfaceProps) {
  /** Weergavenaam voor header */
  const displayName = useMemo(() => {
    const fn = (first_name || "").trim();
    const ln = (last_name || "").trim();
    if (personTitle === "Voornaam") return fn || ln || "";
    if (personTitle === "De heer") return ln ? `de heer ${ln}` : fn ? `de heer ${fn}` : "de heer";
    if (personTitle === "Mevrouw") return ln ? `mevrouw ${ln}` : fn ? `mevrouw ${fn}` : "mevrouw";
    return [fn, ln].filter(Boolean).join(" ");
  }, [personTitle, first_name, last_name]);

  /** Collapsible state per competentie (dicht als default) */
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const toggleOpen = (key: string) =>
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));

  const competencyEntries = useMemo(
    () => Object.entries(generated_texts || {}).sort(([a], [b]) =>
      a.localeCompare(b, "nl", { sensitivity: "base" })
    ),
    [generated_texts]
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
      <div
        style={{
          backgroundColor: "white",
          border: "2px solid #e2e8f0",
          borderRadius: "12px",
          padding: "28px",
        }}
      >
        {/* Titelbalk */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
              background: "rgba(0,51,102,0.1)",
              color: "#003366",
              fontSize: 22,
            }}
          >
            🧭
          </span>
        <h2 style={{ margin: 0, color: "#003366" }}>Conclusie & Advies</h2>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                background: canGenerate ? "rgba(16,185,129,.15)" : "rgba(239,68,68,.15)",
                color: canGenerate ? "#065f46" : "#991b1b",
              }}
            >
              {canGenerate ? "Gereed voor AI" : "Onvolledig"}
            </span>
            {isSaving && (
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  background: "rgba(59,130,246,.12)",
                  color: "#1d4ed8",
                }}
              >
                Opslaan…
              </span>
            )}
          </div>
        </div>

        {/* ───────────────────────────────────────── */}
        {/* BOVENSTE RIJ: Persoonlijkheid (breed) + Competenties (rechts) */}
        {/* ───────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 420px",
            gap: 24,
            marginBottom: 24,
          }}
        >
          {/* Persoonlijkheidsanalyse (links, breed) */}
          <div
            style={{
              padding: 16,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              background: "#f8fafc",
              height: "60vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(0,51,102,0.08)",
                  color: "#003366",
                  fontSize: 16,
                }}
              >
                👤
              </span>
              <h3 style={{ margin: 0, color: "#003366", fontSize: 16 }}>Persoonlijkheidsanalyse</h3>
            </div>

            <div style={{ fontSize: 12, color: "#475569", marginBottom: 6 }}>
              {personTitle || "(geen aanspreekwijze)"} • {displayName || "(naam onbekend)"}
            </div>

            <div
              style={{
                marginTop: 8,
                padding: 12,
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                overflowY: "auto",
                whiteSpace: "pre-wrap",
                lineHeight: 1.55,
                color: "#334155",
                height: "100%",
              }}
            >
              {personality_text?.trim()
                ? personality_text
                : "Geen persoonlijkheidstekst beschikbaar."}
            </div>
          </div>

          {/* Competenties (rechts) */}
          <div
            style={{
              padding: 16,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              background: "#f8fafc",
              height: "60vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(0,51,102,0.08)",
                  color: "#003366",
                  fontSize: 16,
                }}
              >
                📋
              </span>
              <h3 style={{ margin: 0, color: "#003366", fontSize: 16 }}>Uitgewerkte competenties</h3>
            </div>

            <div
              style={{
                marginTop: 8,
                overflowY: "auto",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: 8,
                height: "100%",
              }}
            >
              {competencyEntries.length === 0 ? (
                <div style={{ padding: 12, color: "#64748b", fontSize: 14 }}>
                  Nog geen gegenereerde competentieteksten.
                </div>
              ) : (
                competencyEntries.map(([name, text]) => {
                  const open = !!openMap[name];
                  return (
                    <div
                      key={name}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 8,
                        marginBottom: 10,
                        overflow: "hidden",
                        background: "#ffffff",
                      }}
                    >
                      <button
                        onClick={() => toggleOpen(name)}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          padding: "10px 12px",
                          background: "#f1f5f9",
                          border: "none",
                          borderBottom: "1px solid #e5e7eb",
                          cursor: "pointer",
                          color: "#003366",
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{name}</span>
                        <span style={{ color: "#64748b", fontWeight: 500 }}>
                          {open ? "▲" : "▼"}
                        </span>
                      </button>
                      {open && (
                        <div
                          style={{
                            padding: 12,
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.55,
                            color: "#334155",
                          }}
                        >
                          {text?.trim() || "(geen tekst)"}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────── */}
        {/* MIDDEN: Input psycholoog (volle breedte) */}
        {/* ───────────────────────────────────────── */}
        <div
          style={{
            padding: 16,
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            background: "#fafafa",
            marginBottom: 16,
          }}
        >
          <h3 style={{ marginTop: 0, color: "#003366", fontSize: 16 }}>Input psycholoog</h3>
          <p style={{ marginTop: 4, fontSize: 12, color: "#64748b" }}>
            Voeg hier extra context, observaties of accenten toe. Dit wordt meegenomen in de AI-generatie.
          </p>
          <textarea
            value={psychologist_input}
            onChange={(e) => onPsychologistInputChange(e.target.value)}
            placeholder="Bijv. kernobservaties, accenten, gewenste toon of focus…"
            style={{
              width: "100%",
              minHeight: 180,
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 14,
              resize: "vertical",
              outline: "none",
              background: "white",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <button
              onClick={onGenerate}
              disabled={isGenerating || !canGenerate}
              style={{
                padding: "10px 16px",
                backgroundColor: isGenerating || !canGenerate ? "#94a3b8" : "#003366",
                color: "white",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                cursor: isGenerating || !canGenerate ? "not-allowed" : "pointer",
              }}
            >
              {isGenerating ? "Bezig met genereren…" : "Genereer Conclusie & Advies"}
            </button>
            <span style={{ fontSize: 12, color: "#64748b" }}>
              Gebruikt persoonlijkheidsanalyse + competenties + jouw input.
            </span>
          </div>
        </div>

        {/* ───────────────────────────────────────── */}
        {/* ONDER: Conclusie & Advies (uitkomst, volle breedte) */}
        {/* ───────────────────────────────────────── */}
        <div
          style={{
            padding: 16,
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            background: "#fafafa",
          }}
        >
          <h3 style={{ marginTop: 0, color: "#003366", fontSize: 16 }}>
            Conclusie & Advies (uitkomst)
          </h3>
          <textarea
            value={conclusion_advice_text}
            onChange={(e) => onConclusionAdviceChange(e.target.value)}
            placeholder="De (AI-)uitkomst verschijnt hier. Je kunt vrij aanpassen en aanvullen."
            style={{
              width: "100%",
              minHeight: 320,
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 14,
              resize: "vertical",
              outline: "none",
              background: "#f8fafc",
              color: "#334155",
              whiteSpace: "pre-wrap",
            }}
          />
        </div>
      </div>
    </div>
  );
}
