"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import PersonalInfo from "./personal-info";
import NeoVelden from "./neo-velden";
import AiGenerationPersonality from "./ai-generation-personality";
import { PersonalityData } from "./personality-types";

export default function PersonalityPage() {
  const params = useParams();
  const sessionID = params.id as string;
  const searchParams = useSearchParams();
  const neoReportName = searchParams.get("neo_report_name");

  const [isCompleted, setIsCompleted] = useState(false);
  const [personalityData, setPersonalityData] = useState<PersonalityData>({
    first_name: "",
    last_name: "",
    personTitle: "",
    neo_scores: {},          // alleen cijfers, UI‑inputs blijven gelijk
    personalityText: "",
    uploadedFile: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  /* -----------------------------------------------------------------
     HELPER :  score → exacte term (1‑9 tabel)
     ----------------------------------------------------------------- */
  const scoreToTerm = (score?: number): string => {
    if (score === undefined) return "";
    const map: Record<number, string> = {
      1: "zeer laag",
      2: "laag",
      3: "beneden gemiddeld",
      4: "licht gemiddeld",
      5: "gemiddeld",
      6: "licht boven gemiddeld",
      7: "bovengemiddeld",
      8: "hoog",
      9: "zeer hoog",
    };
    return map[score] ?? "";
  };

  /* -----------------------------------------------------------------
     HELPER :  bouw één object waarin elk facet zowel score als term
               bevat – dit *schrijft* we naar de kolom `neo_scores`.
     ----------------------------------------------------------------- */
  const buildCombinedNeo = (scores: Record<string, number | undefined>) => {
    const combined: Record<string, { score?: number; term: string }> = {};
    Object.entries(scores).forEach(([key, score]) => {
      combined[key] = { score, term: scoreToTerm(score) };
    });
    return combined;
  };

  /* -----------------------------------------------------------------
     FETCH – laad sessie, splits het (eventueel) samengestelde object
     ----------------------------------------------------------------- */
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("id", sessionID)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        setError("Kan sessiegegevens niet laden.");
        setIsLoading(false);
        return;
      }

      /* -----------------------------------------------------------------
         `data.neo_scores` kan twee vormen hebben:
           a) { facet: { score: 4, term: "licht gemiddeld" }, … }
           b) { facet: 4, … }   (oude records – alleen cijfer)
         We willen alleen de **cijfers** terug in de UI‑state.
         ----------------------------------------------------------------- */
      const rawNeo = (data.neo_scores || {}) as Record<string, any>;

      const scoresOnly: Record<string, number | undefined> = {};

      Object.entries(rawNeo).forEach(([key, value]) => {
        if (
          value &&
          typeof value === "object" &&
          "score" in value // ← herkenning van het samengestelde object
        ) {
          // cast naar any, daarna safe‑extractie van het cijfer
          scoresOnly[key] = (value as any).score as number | undefined;
        } else if (typeof value === "number") {
          // simple plain score (oude record)
          scoresOnly[key] = value;
        }
        // we negeren `term` hier – de UI heeft alleen de cijfers nodig
      });

      const fetchedData: PersonalityData = {
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        personTitle: data.person_title || "",
        neo_scores: scoresOnly,
        personalityText: data.personality_text || "",
        uploadedFile: null,
        neo_report_name: data.neo_report_name || "",
        neo_report_path: data.neo_report_path || "",
      };

      setPersonalityData(fetchedData);
      setIsLoading(false);
    };

    if (sessionID) fetchSession();
  }, [sessionID]);

  /* -----------------------------------------------------------------
     AUTOSAVE – schrijf **gecombineerd** JSON‑object (score + term)
                weg naar kolom `neo_scores`.
     ----------------------------------------------------------------- */
  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(async () => {
      console.log("Saving changes automatically…");

      // 1️⃣  Maak het object met zowel score als term
      const combinedNeo = buildCombinedNeo(personalityData.neo_scores);

      // 2️⃣  Up‑sert naar Supabase (alleen de kolom neo_scores)
      const { error } = await supabase
        .from("sessions")
        .update({
          first_name: personalityData.first_name,
          last_name: personalityData.last_name,
          person_title: personalityData.personTitle,
          neo_scores: combinedNeo,                // <-- **samengesteld JSONB**
          personality_text: personalityData.personalityText,
        })
        .eq("id", sessionID);

      if (error) {
        console.error("Error during autosave:", error);
      } else {
        console.log("Autosave succesvol!");
      }
    }, 1500); // 1,5 s debounce‑timer

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [personalityData, sessionID]);

  /* -----------------------------------------------------------------
     RENDER (ongewijzigd)
     ----------------------------------------------------------------- */
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Laden…
      </div>
    );
  }

  if (error) {
    return <div>Fout: {error}</div>;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#003366" }}>
          Persoonlijkheidsanalyse
        </h2>
        {/* geen extra “Opslaan”‑knop – autosave regelt alles */}
      </div>

      <div
        style={{
          padding: "20px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <PersonalInfo
            personalityData={personalityData}
            setPersonalityData={setPersonalityData}
          />
        </div>

        <div style={{ marginBottom: "32px" }}>
          <NeoVelden
            personalityData={personalityData}
            setPersonalityData={setPersonalityData}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <AiGenerationPersonality
            personalityData={personalityData}
            setPersonalityData={setPersonalityData}
            isCompleted={isCompleted}
            sessionId={sessionID}
          />
        </div>
      </div>
    </div>
  );
}
