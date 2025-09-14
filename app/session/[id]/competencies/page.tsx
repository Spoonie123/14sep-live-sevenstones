"use client"

import { useState, useEffect, useRef, use } from "react"
import { CompetentieInterface } from "./competentie-interface"
import { type Competency } from "./competentie-lijst"
import { supabase } from "../../../../lib/supabase" // ✅ lazy/browser-safe client

// Type van wat in Supabase staat
interface SessionData {
  selected_competencies: Competency[]
  observations: Partial<Record<Competency, string>>
  competency_scores: Partial<Record<Competency, number>>
  personality_relations: Partial<Record<Competency, boolean>>
  generated_texts: Partial<Record<Competency, string>>
  personality_data: any | null
}

export default function CompetentiesPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ unwrap params met React.use()
  const { id: sessionId } = use(params)

  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null)

  // Data ophalen bij laden
  useEffect(() => {
    async function loadSessionData() {
      const { data, error } = await supabase
        .from("sessions")
        .select(
          `selected_competencies, 
           observations, 
           competency_scores, 
           personality_relations, 
           generated_texts,
           personality_data`
        )
        .eq("id", sessionId)
        .single()

      if (error) {
        console.error("❌ Fout bij het laden van sessiegegevens:", error.message)
        setSessionData({
          selected_competencies: [],
          observations: {},
          competency_scores: {},
          personality_relations: {},
          generated_texts: {},
          personality_data: null,
        })
        return
      }

      if (!data) {
        console.warn("⚠️ Geen sessiedata gevonden → initialiseer leeg")
        setSessionData({
          selected_competencies: [],
          observations: {},
          competency_scores: {},
          personality_relations: {},
          generated_texts: {},
          personality_data: null,
        })
        return
      }

      setSessionData({
        selected_competencies: data.selected_competencies || [],
        observations: data.observations || {},
        competency_scores: data.competency_scores || {},
        personality_relations: data.personality_relations || {},
        generated_texts: data.generated_texts || {},
        personality_data: data.personality_data || null,
      })
    }

    if (sessionId) {
      loadSessionData()
    }
  }, [sessionId])

  // Autosave
  useEffect(() => {
    if (!sessionData) return

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }

    debounceTimeout.current = setTimeout(async () => {
      const { error } = await supabase
        .from("sessions")
        .update({
          selected_competencies: sessionData.selected_competencies,
          observations: sessionData.observations,
          competency_scores: sessionData.competency_scores,
          personality_relations: sessionData.personality_relations,
          generated_texts: sessionData.generated_texts,
          personality_data: sessionData.personality_data,
        })
        .eq("id", sessionId)

      if (error) {
        console.error("❌ Fout bij opslaan:", error.message)
      } else {
        console.log("✅ Gegevens succesvol opgeslagen.")
      }
    }, 1500)

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current)
      }
    }
  }, [sessionData, sessionId])

  // Handlers
  const handleCompetencyToggle = (competency: Competency) => {
    setSessionData((prev) => {
      if (!prev) return prev
      const isSelected = prev.selected_competencies.includes(competency)
      const newSelected = isSelected
        ? prev.selected_competencies.filter((c) => c !== competency)
        : [...prev.selected_competencies, competency]
      return { ...prev, selected_competencies: newSelected }
    })
  }

  const handleObservationChange = (competency: Competency, value: string) => {
    setSessionData((prev) =>
      prev
        ? { ...prev, observations: { ...prev.observations, [competency]: value } }
        : prev
    )
  }

  const handleScoreChange = (competency: Competency, score: number) => {
    setSessionData((prev) =>
      prev
        ? { ...prev, competency_scores: { ...prev.competency_scores, [competency]: score } }
        : prev
    )
  }

  const handlePersonalityRelationToggle = (competency: Competency) => {
    setSessionData((prev) =>
      prev
        ? {
            ...prev,
            personality_relations: {
              ...prev.personality_relations,
              [competency]: !prev.personality_relations[competency],
            },
          }
        : prev
    )
  }

  const handleGeneratedTextChange = (competency: Competency, text: string) => {
    setSessionData((prev) =>
      prev
        ? { ...prev, generated_texts: { ...prev.generated_texts, [competency]: text } }
        : prev
    )
  }

  if (!sessionData) {
    return <div>Laden van competenties…</div>
  }

  return (
    <div className="bg-gray-100 min-h-screen py-12 flex items-center justify-center">
      <CompetentieInterface
        sessionId={sessionId}
        selectedCompetencies={sessionData.selected_competencies}
        observations={sessionData.observations}
        competencyScores={sessionData.competency_scores}
        personalityRelations={sessionData.personality_relations}
        generatedTexts={sessionData.generated_texts}
        personalityData={sessionData.personality_data}
        onCompetencyToggle={handleCompetencyToggle}
        onObservationChange={handleObservationChange}
        onScoreChange={handleScoreChange}
        onPersonalityRelationToggle={handlePersonalityRelationToggle}
        onGeneratedTextChange={handleGeneratedTextChange}
      />
    </div>
  )
}
