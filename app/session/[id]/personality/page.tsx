"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import PersonalInfo from "./personal-info";
import NeoVelden from "./neo-velden";
import AiGenerationPersonality from "./ai-generation-personality";
// import TabNav from "../../../components/TabNav"; // verwijderd om dubbel menu te voorkomen
// import SaveButton from "../../../components/SaveButton";
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
    neo_scores: {},
    personalityText: "",
    uploadedFile: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("sessions")
        .select(`*`)
        .eq("id", sessionID)
        .single();

      if (error) {
        console.error("Error fetching session:", error);
        setError("Kan sessiegegevens niet laden.");
        setIsLoading(false);
      } else {
        const fetchedData: PersonalityData = {
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          personTitle: data.person_title || "",
          neo_scores: data.neo_scores || {},
          personalityText: data.personality_text || "",
          uploadedFile: null,
          neo_report_name: data.neo_report_name || "",
          neo_report_path: data.neo_report_path || "",
        };
        setPersonalityData(fetchedData);
        setIsLoading(false);
      }
    };
    if (sessionID) fetchSession();
  }, [sessionID]);

  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(async () => {
      console.log("Saving changes automatically...");
      const { error } = await supabase
        .from("sessions")
        .update({
          first_name: personalityData.first_name,
          last_name: personalityData.last_name,
          person_title: personalityData.personTitle,
          neo_scores: personalityData.neo_scores,
          personality_text: personalityData.personalityText,
        })
        .eq("id", sessionID);

      if (error) {
        console.error("Error during autosave:", error);
      } else {
        console.log("Autosave succesvol!");
      }
    }, 1500);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [personalityData, sessionID]);

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
        Laden...
      </div>
    );
  }

  if (error) {
    return <div>Fout: {error}</div>;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px" }}>
      {/* Header bovenaan de pagina */}
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
        {/* Geen extra knoppen hier; autosave is actief */}
      </div>

      {/* Verwijderd: <TabNav /> om dubbel menu te voorkomen */}

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
