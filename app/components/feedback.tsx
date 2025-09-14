"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface FeedbackItem {
  id: string;
  session_id: string | null;
  user_feedback: string;
  created_at: string;
}

interface FeedbackProps {
  sessionId: string | null;  // mag null zijn; nieuwe feedback kan dan ‘algemeen’ zijn
  isOpen: boolean;
  onClose: () => void;
}

export function Feedback({ sessionId, isOpen, onClose }: FeedbackProps) {
  const [feedback, setFeedback] = useState("");
  const [allFeedback, setAllFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bij openen: ALTIJD alle feedback ophalen (ongeacht sessie)
  useEffect(() => {
    if (!isOpen) return;
    loadAllFeedback();
  }, [isOpen]);

  // Realtime: luister naar INSERT/UPDATE/DELETE voor ALLE sessies
  useEffect(() => {
    if (!isOpen) return;

    const channel = supabase
      .channel("feedback_all_sessions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "feedback" },
        (payload) => {
          const n = payload.new as FeedbackItem;
          setAllFeedback((prev) => {
            if (prev.some((x) => x.id === n.id)) return prev;
            return [n, ...prev].sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "feedback" },
        (payload) => {
          const n = payload.new as FeedbackItem;
          setAllFeedback((prev) =>
            prev
              .map((x) => (x.id === n.id ? n : x))
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "feedback" },
        (payload) => {
          const o = payload.old as FeedbackItem;
          setAllFeedback((prev) => prev.filter((x) => x.id !== o.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen]);

  async function loadAllFeedback() {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("id, session_id, user_feedback, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllFeedback(data ?? []);
    } catch (e: any) {
      console.error("Error loading feedback:", e);
      setError("Kon feedback niet laden.");
    } finally {
      setLoading(false);
    }
  }

  async function saveFeedback() {
    if (!feedback.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("feedback")
        .insert({
          session_id: sessionId ?? null, // blijft koppelen als er een sessie is
          user_feedback: feedback.trim(),
        })
        .select("id, session_id, user_feedback, created_at")
        .single();

      if (error) throw error;

      if (data) {
        setAllFeedback((prev) =>
          [data as FeedbackItem, ...prev].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
        );
      }
      setFeedback("");
    } catch (e: any) {
      console.error("Error saving feedback:", e);
      setError("Fout bij opslaan van feedback.");
      alert("Fout bij opslaan van feedback");
    } finally {
      setSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: 12,
          padding: 24,
          width: "90%",
          maxWidth: 700,
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: "bold", color: "#003366", margin: 0 }}>
            Feedback
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ marginBottom: 12, color: "#b91c1c", fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Nieuwe feedback */}
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              display: "block",
              marginBottom: 8,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Nieuwe feedback:
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Voer hier uw feedback in…"
            style={{
              width: "100%",
              minHeight: 100,
              padding: 12,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              fontSize: 14,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
            <button
              onClick={saveFeedback}
              disabled={saving || !feedback.trim()}
              style={{
                backgroundColor: "#16a34a",
                color: "white",
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                cursor: saving || !feedback.trim() ? "not-allowed" : "pointer",
                fontSize: 14,
                opacity: saving || !feedback.trim() ? 0.6 : 1,
              }}
            >
              {saving ? "Opslaan..." : "Feedback Opslaan"}
            </button>
          </div>
        </div>

        {/* Eén overzicht: alle sessies */}
        <div>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#003366",
              marginBottom: 12,
            }}
          >
            Alle feedback (alle sessies)
          </h3>

          {loading ? (
            <div style={{ textAlign: "center", padding: 20, color: "#64748b" }}>
              Feedback laden...
            </div>
          ) : allFeedback.length === 0 ? (
            <div style={{ textAlign: "center", padding: 20, color: "#64748b" }}>
              Nog geen feedback beschikbaar
            </div>
          ) : (
            <div style={{ maxHeight: 380, overflow: "auto" }}>
              {allFeedback.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: 14,
                    borderRadius: 8,
                    marginBottom: 10,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <p style={{ margin: "0 0 8px 0", color: "#374151", lineHeight: 1.5 }}>
                    {item.user_feedback}
                  </p>
                  <div style={{ fontSize: 12, color: "#64748b", display: "flex", gap: 10 }}>
                    <span>{new Date(item.created_at).toLocaleString("nl-NL")}</span>
                    <span style={{ opacity: 0.8 }}>
                      sessie: {item.session_id ? item.session_id.slice(0, 8) : "—"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
