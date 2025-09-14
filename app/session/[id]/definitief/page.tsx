"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReportView from "./report-view";
import { supabase } from "../../../../lib/supabase";

/** Wat we lezen uit 'sessions' */
type SessionRow = {
  id: string;
  person_title: string | null;
  first_name: string | null;
  last_name: string | null;
  personality_text: string | null;
  generated_texts: Record<string, string> | null; // jsonb
  conclusion_advice_text: string | null;
};

export default function DefinitiefPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [row, setRow] = useState<SessionRow | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ophalen
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("sessions")
        .select(
          "id, person_title, first_name, last_name, personality_text, generated_texts, conclusion_advice_text"
        )
        .eq("id", sessionId)
        .single<SessionRow>();

      if (error) {
        setError(error.message);
      } else {
        setRow(data);
      }
      setLoading(false);
    })();
  }, [sessionId]);

  // Print handler
  const handleDownloadPDF = () => {
    // Browser print → Kies "Opslaan als PDF"
    window.print();
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: "40px auto", color: "#475569" }}>
        Definitief rapport laden…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: "40px auto", color: "#b91c1c" }}>
        Fout bij laden: {error}
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 16px" }}>
      {/* Topbar met download-knop */}
      <div
        className="no-print"
        style={{
          maxWidth: 900,
          margin: "0 auto 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <h2 style={{ margin: 0, color: "#003366" }}>Definitief</h2>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={handleDownloadPDF}
            style={{
              padding: "10px 14px",
              background: "#003366",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Download als PDF
          </button>
        </div>
      </div>

      {/* Inhoud */}
      <ReportView
        personTitle={row?.person_title}
        first_name={row?.first_name}
        last_name={row?.last_name}
        personality_text={row?.personality_text}
        generated_texts={row?.generated_texts}
        conclusion_advice_text={row?.conclusion_advice_text}
      />

      {/* Print CSS: mooie PDF (A4), verberg knoppen, nette marges, pagina-afbrekingen */}
      <style jsx global>{`
        @media print {
          /* Verberg navigatie/knoppen */
          .no-print,
          nav,
          header,
          footer {
            display: none !important;
          }

          @page {
            size: A4;
            margin: 18mm 16mm 18mm 16mm; /* top right bottom left */
          }

          html,
          body {
            background: #ffffff !important;
          }

          #print-root {
            max-width: 100% !important;
          }

          section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          h1,
          h2,
          h3 {
            color: #111827 !important;
          }
        }
      `}</style>
    </div>
  );
}
