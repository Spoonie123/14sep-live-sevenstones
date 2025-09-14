"use client";

import React, { useMemo } from "react";

type GeneratedTextsMap = Record<string, string>;

interface ReportViewProps {
  personTitle?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  personality_text?: string | null;
  generated_texts?: GeneratedTextsMap | null;
  conclusion_advice_text?: string | null;
}

export default function ReportView({
  personTitle,
  first_name,
  last_name,
  personality_text,
  generated_texts,
  conclusion_advice_text,
}: ReportViewProps) {
  const displayName = useMemo(() => {
    const fn = (first_name || "").trim();
    const ln = (last_name || "").trim();
    if (personTitle === "Voornaam") return fn || ln || "";
    if (personTitle === "De heer") return ln ? `de heer ${ln}` : fn ? `de heer ${fn}` : "de heer";
    if (personTitle === "Mevrouw") return ln ? `mevrouw ${ln}` : fn ? `mevrouw ${fn}` : "mevrouw";
    return [fn, ln].filter(Boolean).join(" ");
  }, [personTitle, first_name, last_name]);

  const entries = useMemo(
    () =>
      Object.entries(generated_texts || {}).sort(([a], [b]) =>
        a.localeCompare(b, "nl", { sensitivity: "base" })
      ),
    [generated_texts]
  );

  return (
    <div id="print-root" style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Titel / header */}
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, color: "#0f172a" }}>Definitief Rapport</h1>
        <div style={{ color: "#475569", marginTop: 6 }}>
          {personTitle || "(aanspreekwijze onbekend)"} • {displayName || "(naam onbekend)"}
        </div>
      </header>

      {/* Persoonlijkheid */}
      <section
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          pageBreakInside: "avoid",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 20, color: "#0f172a" }}>Persoonlijkheidsanalyse</h2>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#334155", fontSize: 16 }}>
          {personality_text?.trim() || "Geen persoonlijkheidstekst beschikbaar."}
        </div>
      </section>

      {/* Competenties */}
      <section
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 20, color: "#0f172a" }}>Uitgewerkte competenties</h2>

        {entries.length === 0 ? (
          <div style={{ color: "#64748b" }}>Geen competentieteksten beschikbaar.</div>
        ) : (
          entries.map(([name, text]) => (
            <article
              key={name}
              style={{
                padding: "16px 0",
                borderTop: "1px solid #e5e7eb",
                pageBreakInside: "avoid",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", fontSize: 18, color: "#0f172a" }}>{name}</h3>
              <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#334155", fontSize: 16 }}>
                {text?.trim() || "(geen tekst)"}
              </div>
            </article>
          ))
        )}
      </section>

      {/* Conclusie & Advies */}
      <section
        style={{
          background: "white",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          marginBottom: 24,
          pageBreakInside: "avoid",
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: 20, color: "#0f172a" }}>Conclusie & Advies</h2>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#334155", fontSize: 16 }}>
          {conclusion_advice_text?.trim() || "Nog geen conclusie & advies beschikbaar."}
        </div>
      </section>
    </div>
  );
}
