"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import TabNav from "../../components/TabNav";
import SaveButton from "../../components/SaveButton";
import { Feedback } from "../../components/feedback";

export default function SessionLayout({ children }: { children: React.ReactNode }) {
  // Session id voor opslaan/tonen feedback per sessie
  const params = useParams();
  const sessionId = (params?.id as string) ?? null;

  // Modal state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <main style={{ flex: 1, padding: 24 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {/* Brand: tekst + logo rechts ervan */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div>
            <h1 style={{ margin: 0 }}>SEVEN STONES</h1>
            <p style={{ margin: 0, color: "#6b7280" }}>AI Rapportage Assistent</p>
          </div>

          {/* Logo (groot zichtbaar) */}
          <Image
            src="/zonnebloem.png" // /public/zonnebloem.png
            alt="Seven Stones logo"
            width={80}
            height={80}
            priority
            style={{ display: "block" }}
          />
        </div>

        {/* TS fix: SaveButton vereist prop 'isCompleted' */}
        <SaveButton isCompleted={false} />
      </header>

      <TabNav />

      <div style={{ marginTop: 18 }}>{children}</div>

      {/* Floating Feedback knop (overal zichtbaar binnen de sessie) */}
      <button
        onClick={() => setIsFeedbackOpen(true)}
        title="Feedback"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: 1000,
          background: "#003366",
          color: "#fff",
          border: "none",
          borderRadius: 999,
          padding: "12px 16px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.15)",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        💬 Feedback
      </button>

      {/* Modal */}
      <Feedback
        sessionId={sessionId}
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </main>
  );
}
