"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import ConclusionInterface from "./conclusion-interface"; // ← FIX: juiste bestandsnaam
import { generateConclusionAdvice } from "./ai-generation-conclusion"; // ← named export voor AI-call

type GeneratedTextsMap = Record<string, string>;

type SessionRow = {
  id: string;
  person_title: string | null;
  first_name: string | null;
  last_name: string | null;
  personality_text: string | null;
  generated_texts: GeneratedTextsMap | null;
  psychologist_input: string | null;
  conclusion_advice_text: string | null;
};

export default function ConclusionPage() {
  const params = useParams();
  const sessionId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State uit Supabase
  const [personTitle, setPersonTitle] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [personalityText, setPersonalityText] = useState<string | null>(null);
  const [generatedTexts, setGeneratedTexts] = useState<GeneratedTextsMap>({});
  const [psychologistInput, setPsychologistInput] = useState<string>("");
  const [conclusionAdviceText, setConclusionAdviceText] = useState<string>("");

  // Debounce refs
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Data laden
  useEffect(() => {
    if (!sessionId) return;
    (async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("sessions")
        .select(
          "person_title, first_name, last_name, personality_text, generated_texts, psychologist_input, conclusion_advice_text"
        )
        .eq("id", sessionId)
        .single<SessionRow>();

      if (error) {
        console.error("[conclusion] load error:", error);
        setError("Kon sessiegegevens niet laden.");
        setLoading(false);
        return;
      }

      setPersonTitle(data.person_title ?? null);
      setFirstName(data.first_name ?? null);
      setLastName(data.last_name ?? null);
      setPersonalityText(data.personality_text ?? "");
      setGeneratedTexts(data.generated_texts ?? {});
      setPsychologistInput(data.psychologist_input ?? "");
      setConclusionAdviceText(data.conclusion_advice_text ?? "");
      setLoading(false);
    })();
  }, [sessionId]);

  // Autosave (psychologist_input + conclusion_advice_text)
  useEffect(() => {
    if (loading || !sessionId) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      setIsSaving(true);
      const { error } = await supabase
        .from("sessions")
        .update({
          psychologist_input: psychologistInput,
          conclusion_advice_text: conclusionAdviceText,
        })
        .eq("id", sessionId);

      setIsSaving(false);
      if (error) {
        console.error("[conclusion] autosave error:", error);
      }
    }, 800);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [psychologistInput, conclusionAdviceText, loading, sessionId]);

  // Generate handler
  const handleGenerate = async () => {
    if (!sessionId) return;
    setError(null);
    setIsGenerating(true);
    try {
      const output = await generateConclusionAdvice({
        personTitle,
        first_name: firstName ?? undefined,
        last_name: lastName ?? undefined,
        personality_text: personalityText ?? undefined,
        generated_texts: generatedTexts,
        psychologist_input: psychologistInput,
      });

      const safeOutput = output?.trim() ?? "";
      setConclusionAdviceText(safeOutput);

      // direct save (naast autosave)
      setIsSaving(true);
      const { error } = await supabase
        .from("sessions")
        .update({ conclusion_advice_text: safeOutput })
        .eq("id", sessionId);
      setIsSaving(false);

      if (error) {
        console.error("[conclusion] save after generate error:", error);
      }
    } catch (e: any) {
      console.error("[conclusion] generate error:", e);
      setError(e?.message ?? "Er ging iets mis bij het genereren.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Readiness
  const canGenerate = useMemo(() => {
    const hasPersonality = !!(personalityText && personalityText.trim().length > 0);
    const hasAnyCompetencies =
      generatedTexts && Object.keys(generatedTexts).length > 0;
    return hasPersonality || hasAnyCompetencies;
  }, [personalityText, generatedTexts]);

  if (loading) {
    return (
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 32 }}>
        Conclusie &amp; Advies wordt geladen…
      </div>
    );
  }

  return (
    <section style={{ maxWidth: 1400, margin: "0 auto", padding: "24px" }}>
      <ConclusionInterface
        personTitle={personTitle}
        first_name={firstName}
        last_name={lastName}
        personality_text={personalityText}
        generated_texts={generatedTexts}
        psychologist_input={psychologistInput}
        conclusion_advice_text={conclusionAdviceText}
        onPsychologistInputChange={setPsychologistInput}
        onConclusionAdviceChange={setConclusionAdviceText}
        onGenerate={handleGenerate}
        canGenerate={canGenerate}
        isGenerating={isGenerating}
        isSaving={isSaving}
      />

      {error && (
        <p style={{ color: "red", marginTop: 12 }}>
          {error}
        </p>
      )}

    
    </section>
  );
}
