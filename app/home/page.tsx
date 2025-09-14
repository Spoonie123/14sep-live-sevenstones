"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

type SessionRow = {
  id: string
  name: string | null
  updated_at: string | null
  step: number | null
  neo_report_name: string | null
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomePage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<SessionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllSessions, setShowAllSessions] = useState(false)
  const [creating, setCreating] = useState(false)

  // Sessies ophalen
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("sessions")
        .select("id, name, updated_at, step, neo_report_name")
        .order("updated_at", { ascending: false })
      if (cancelled) return
      if (error) {
        console.error("Fout bij laden sessies:", error.message)
        setError("Kon sessies niet laden.")
        setSessions([])
      } else {
        setSessions((data ?? []) as SessionRow[])
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const recentSessions = useMemo(
    () => (showAllSessions ? sessions : sessions.slice(0, 5)),
    [sessions, showAllSessions]
  )

  const handleNavigateToTool = (sessionId: string) => {
    router.push(`/session/${sessionId}/personality`)
  }

  const handleLoadSession = (session: SessionRow) => {
    handleNavigateToTool(session.id)
  }

  const handleNewSession = async (name: string): Promise<string | null> => {
    setCreating(true)
    setError(null)
    // Probeer een “veilige” insert met basisvelden
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        name,
        step: 0,
        // Optioneel: initialiseer veelgebruikte JSON/arrays om not-null te vermijden
        selected_competencies: [],
        observations: {},
        competency_scores: {},
        personality_relations: {},
        generated_texts: {},
        personality_data: null,
      })
      .select("id")
      .single()

    setCreating(false)

    if (error) {
      console.error("Fout bij maken nieuwe sessie:", error.message)
      setError("Kon nieuwe sessie niet aanmaken.")
      return null
    }

    // Refresh lijst (optioneel)
    const { data: refreshed } = await supabase
      .from("sessions")
      .select("id, name, updated_at, step, neo_report_name")
      .order("updated_at", { ascending: false })
    setSessions((refreshed ?? []) as SessionRow[])

    return data?.id ?? null
  }

  const handleQuickStart = async () => {
    const name = `Nieuwe Assessment - ${new Date().toLocaleDateString()}`
    const newId = await handleNewSession(name)
    if (newId) handleNavigateToTool(newId)
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <h1
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: "#003366",
            margin: "0 0 16px 0",
            fontFamily: "Georgia, serif",
          }}
        >
          Welkom
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#64748b",
            margin: "0 0 16px 0",
            lineHeight: "1.6",
          }}
        >
          Dit is de rapportage tool van Seven Stones
        </p>
        <p
          style={{
            fontSize: "18px",
            color: "#64748b",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: "1.6",
          }}
        >
          Creëer professionele assessmentrapporten met de kracht van kunstmatige intelligentie.
        </p>
      </div>

      {/* Centered New Assessment Card */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "48px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            border: "2px solid #e2e8f0",
            borderRadius: "16px",
            padding: "48px",
            textAlign: "center",
            cursor: creating ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            maxWidth: "400px",
            width: "100%",
            opacity: creating ? 0.7 : 1,
          }}
          onClick={creating ? undefined : handleQuickStart}
          onMouseOver={(e) => {
            if (creating) return
            e.currentTarget.style.borderColor = "#003366"
            e.currentTarget.style.transform = "translateY(-4px)"
            e.currentTarget.style.boxShadow = "0 12px 35px rgba(0,51,102,0.2)"
          }}
          onMouseOut={(e) => {
            if (creating) return
            e.currentTarget.style.borderColor = "#e2e8f0"
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          <div
            style={{
              fontSize: "64px",
              marginBottom: "24px",
            }}
          >
            ✨
          </div>
          <h3
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#003366",
              margin: "0 0 16px 0",
            }}
          >
            Nieuwe Assessment
          </h3>
          <p
            style={{
              fontSize: "18px",
              color: "#64748b",
              margin: "0 0 32px 0",
              lineHeight: "1.6",
            }}
          >
            Start een nieuwe assessment sessie met AI-ondersteuning voor persoonlijkheid, competenties en conclusies.
          </p>
          <div
            style={{
              backgroundColor: creating ? "#94a3b8" : "#003366",
              color: "white",
              padding: "16px 32px",
              borderRadius: "8px",
              display: "inline-block",
              fontSize: "18px",
              fontWeight: "500",
            }}
          >
            {creating ? "Bezig..." : "Snel Starten"}
          </div>
        </div>
      </div>

      {/* Status / foutmelding */}
      {error && (
        <div
          style={{
            backgroundColor: "rgba(239,68,68,.08)",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {/* Laden indicator */}
      {loading && (
        <div
          style={{
            backgroundColor: "white",
            border: "2px solid #e2e8f0",
            borderRadius: "16px",
            padding: "24px",
            textAlign: "center",
            color: "#64748b",
          }}
        >
          Sessies laden…
        </div>
      )}

      {/* Recent Sessions */}
      {!loading && sessions.length > 0 && (
        <div
          style={{
            backgroundColor: "white",
            border: "2px solid #e2e8f0",
            borderRadius: "16px",
            padding: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#003366",
              margin: "0 0 24px 0",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            📋 Recente Sessies
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {recentSessions.map((session) => (
              <div
                key={session.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => handleLoadSession(session)}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f5f9"
                  e.currentTarget.style.borderColor = "#003366"
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc"
                  e.currentTarget.style.borderColor = "#e2e8f0"
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#003366",
                      margin: "0 0 4px 0",
                    }}
                  >
                    {session.name || "(naamloos)"}
                  </h4>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <span>🕐 {session.updated_at ? new Date(session.updated_at).toLocaleDateString() : "-"}</span>
                    <span>📊 Stap {(session.step ?? 0) + 1}/4</span>
                    {session.neo_report_name && <span style={{ color: "#16a34a" }}>📄 NEO Rapport</span>}
                  </div>
                </div>
                <div
                  style={{
                    color: "#003366",
                    fontSize: "18px",
                  }}
                >
                  →
                </div>
              </div>
            ))}
          </div>

          {sessions.length > 5 && (
            <div style={{ textAlign: "center", marginTop: "24px" }}>
              <button
                onClick={() => setShowAllSessions(!showAllSessions)}
                style={{
                  backgroundColor: "transparent",
                  color: "#003366",
                  border: "2px solid #003366",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                {showAllSessions ? "Minder sessies tonen" : `Alle ${sessions.length} sessies bekijken`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && sessions.length === 0 && (
        <div
          style={{
            backgroundColor: "white",
            border: "2px dashed #cbd5e1",
            borderRadius: "16px",
            padding: "48px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>📝</div>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#003366",
              margin: "0 0 12px 0",
            }}
          >
            Nog geen sessies
          </h3>
          <p
            style={{
              fontSize: "16px",
              color: "#64748b",
              margin: "0 0 24px 0",
            }}
          >
            Begin je eerste assessment om aan de slag te gaan met de AI Rapportage Assistent.
          </p>
          <button
            onClick={handleQuickStart}
            disabled={creating}
            style={{
              backgroundColor: creating ? "#94a3b8" : "#003366",
              color: "white",
              padding: "16px 32px",
              borderRadius: "8px",
              border: "none",
              cursor: creating ? "not-allowed" : "pointer",
              fontSize: "18px",
              fontWeight: "500",
            }}
          >
            {creating ? "Bezig..." : "✨ Eerste Assessment Starten"}
          </button>
        </div>
      )}
    </div>
  )
}
