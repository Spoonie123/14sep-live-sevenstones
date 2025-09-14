"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface HistorySidebarProps {
  showHistory: boolean;
  setShowHistory: (show: boolean) => void;
  sessions: any[];
  onLoadSession: (session: any) => void;
  onDeleteSession: (sessionId: string) => Promise<boolean>;
  onUpdateSession: (sessionId: string, data: { name: string }) => Promise<any>;
  onNewSession: (name: string) => Promise<void>;
  currentPage: "home" | "tool"; // NEW
  onNavigate: (page: "home" | "tool") => void; // NEW
}

export function HistorySidebar({
  showHistory,
  setShowHistory,
  sessions,
  onLoadSession,
  onDeleteSession,
  onUpdateSession,
  onNewSession,
  currentPage, // NEW
  onNavigate, // NEW
}: HistorySidebarProps) {
  const router = useRouter();

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNewSessionPrompt, setShowNewSessionPrompt] = useState(false); // NEW
  const [newSessionName, setNewSessionName] = useState(""); // NEW

  // Start editing session name
  const handleStartEdit = (session: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditingName(session.name);
  };

  // Save edited session name
  const handleSaveEdit = async (sessionId: string) => {
    if (!editingName.trim()) {
      handleCancelEdit();
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateSession(sessionId, { name: editingName.trim() });
      setEditingSessionId(null);
      setEditingName("");
    } catch (error) {
      console.error("Error updating session name:", error);
      alert("Fout bij het opslaan van de naam: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUpdating(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingName("");
  };

  // NEW: Handle new session with name prompt
  const handleNewSessionClick = () => {
    setShowNewSessionPrompt(true);
    setNewSessionName("");
  };

  // NEW: Create new session with custom name
  const handleCreateNewSession = async () => {
    if (!newSessionName.trim()) {
      alert("Voer een naam in voor de nieuwe sessie");
      return;
    }

    try {
      await onNewSession(newSessionName.trim()); // Now properly awaiting the async function
      setShowNewSessionPrompt(false);
      setNewSessionName("");
    } catch (error) {
      console.error("Error creating new session:", error);
      alert("Fout bij het maken van nieuwe sessie");
    }
  };

  // NEW: Cancel new session creation
  const handleCancelNewSession = () => {
    setShowNewSessionPrompt(false);
    setNewSessionName("");
  };

  // Handle delete with confirmation
  const handleDeleteWithConfirmation = async (session: any, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      `Weet je zeker dat je "${session.name}" permanent wilt verwijderen?\n\nDeze actie kan niet ongedaan worden gemaakt.`
    );

    if (confirmed) {
      try {
        const success = await onDeleteSession(session.id);
        if (success) {
          console.log(`Sessie "${session.name}" succesvol verwijderd`);
        } else {
          alert("Er ging iets mis bij het verwijderen");
        }
      } catch (error) {
        console.error("Error deleting session:", error);
        alert("Fout bij het verwijderen van de sessie");
      }
    }
  };

  // Handle key press in edit mode
  const handleKeyPress = (e: React.KeyboardEvent, sessionId: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit(sessionId);
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // NEW: Handle key press for new session name
  const handleNewSessionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateNewSession();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelNewSession();
    }
  };

  /** 👉 Nieuw: Router-navigatie naar de persoonlijkheidspagina
   *  - Pakt de meest recent geüpdatete sessie (fallback: eerste item)
   *  - Navigeert naar /session/[id]/personality
   *  - Laat verder de bestaande onNavigate("tool") intact
   */
  const handleNavigateToTool = () => {
    onNavigate("tool"); // behoud bestaande gedrag/state

    if (!sessions || sessions.length === 0) return;

    // Kies de meest recent bijgewerkte sessie als target
    const target =
      [...sessions].sort((a, b) => {
        const ta = new Date(a.updated_at ?? 0).getTime();
        const tb = new Date(b.updated_at ?? 0).getTime();
        return tb - ta;
      })[0] || sessions[0];

    if (target?.id) {
      router.push(`/session/${target.id}/personality`);
    }
  };

  return (
    <div
      style={{
        width: showHistory ? "320px" : "64px",
        backgroundColor: "#f1f5f9",
        borderRight: "1px solid #e2e8f0",
        transition: "width 0.3s ease",
        flexShrink: 0,
      }}
    >
      <div style={{ padding: "16px" }}>
        {/* UPDATED: Header with collapse arrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: showHistory ? "flex-start" : "center",
              gap: "8px",
              padding: "12px",
              backgroundColor: "transparent",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#003366",
              fontSize: "16px",
              flex: 1,
            }}
          >
            📋{showHistory && <span>Geschiedenis</span>}
          </button>

          {/* NEW: Collapse arrow - only show when expanded */}
          {showHistory && (
            <button
              onClick={() => setShowHistory(false)}
              style={{
                padding: "8px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#64748b",
                fontSize: "16px",
              }}
              title="Menu inklappen"
            >
              ←
            </button>
          )}
        </div>
      </div>

      {showHistory && (
        <div style={{ padding: "0 16px 16px" }}>
          {/* NEW: Navigation buttons */}
          <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => onNavigate("home")}
              style={{
                width: "100%",
                backgroundColor: currentPage === "home" ? "#003366" : "white",
                color: currentPage === "home" ? "white" : "#003366",
                padding: "12px",
                borderRadius: "8px",
                border: currentPage === "home" ? "none" : "1px solid #e2e8f0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "flex-start",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              🏠 Home
            </button>

            <button
              onClick={handleNavigateToTool}
              style={{
                width: "100%",
                backgroundColor: currentPage === "tool" ? "#003366" : "white",
                color: currentPage === "tool" ? "white" : "#003366",
                padding: "12px",
                borderRadius: "8px",
                border: currentPage === "tool" ? "none" : "1px solid #e2e8f0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "flex-start",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              🔧 Rapportage Tool
            </button>
          </div>

          {/* Separator line */}
          <div style={{ height: "1px", backgroundColor: "#e2e8f0", marginBottom: "16px" }} />

          {/* NEW: New session prompt or button */}
          {showNewSessionPrompt ? (
            <div
              style={{
                backgroundColor: "white",
                padding: "16px",
                borderRadius: "8px",
                border: "2px solid #003366",
                marginBottom: "16px",
              }}
            >
              <div style={{ marginBottom: "12px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#003366",
                    marginBottom: "8px",
                  }}
                >
                  Naam voor nieuwe sessie:
                </label>
                <input
                  type="text"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  onKeyDown={handleNewSessionKeyPress}
                  placeholder="Bijv. Jan Jansen - Assessment"
                  autoFocus
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: "14px",
                    border: "1px solid #cbd5e1",
                    borderRadius: "6px",
                    outline: "none",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={handleCreateNewSession}
                  style={{
                    flex: 1,
                    backgroundColor: "#003366",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ✓ Maken
                </button>
                <button
                  onClick={handleCancelNewSession}
                  style={{
                    flex: 1,
                    backgroundColor: "#f1f5f9",
                    color: "#64748b",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                    fontSize: "14px",
                  }}
                >
                  ✕ Annuleren
                </button>
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", marginTop: "8px", textAlign: "center" }}>
                Enter = maken, Esc = annuleren
              </div>
            </div>
          ) : (
            <button
              onClick={handleNewSessionClick}
              style={{
                width: "100%",
                backgroundColor: "#003366",
                color: "white",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              ➕ Nieuwe Sessie
            </button>
          )}

          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {sessions.map((session) => (
              <div
                key={session.id}
                style={{
                  padding: "12px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  marginBottom: "8px",
                  cursor: editingSessionId === session.id ? "default" : "pointer",
                }}
                onClick={() => editingSessionId !== session.id && onLoadSession(session)} // UPDATED: Direct click loads session
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Editable session name */}
                    {editingSessionId === session.id ? (
                      <div style={{ marginBottom: "4px" }}>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => handleKeyPress(e, session.id)}
                          onBlur={() => handleSaveEdit(session.id)}
                          autoFocus
                          disabled={isUpdating}
                          style={{
                            width: "100%",
                            padding: "4px 6px",
                            fontSize: "14px",
                            fontWeight: "500",
                            color: "#003366",
                            border: "2px solid #003366",
                            borderRadius: "4px",
                            backgroundColor: isUpdating ? "#f3f4f6" : "white",
                            outline: "none",
                          }}
                        />
                        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                          {isUpdating ? "Opslaan..." : "Enter = opslaan, Esc = annuleren"}
                        </div>
                      </div>
                    ) : (
                      <h4
                        style={{
                          margin: "0 0 4px 0",
                          fontSize: "14px",
                          fontWeight: "500",
                          color: "#003366",
                          cursor: "pointer",
                        }}
                        onDoubleClick={(e) => handleStartEdit(session, e)}
                        title="Dubbelklik om te bewerken"
                      >
                        {session.name}
                      </h4>
                    )}

                    <div
                      style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "8px" }}
                    >
                      🕐 {new Date(session.updated_at).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      Stap {session.step + 1}/4
                      {session.neo_report_name && <span style={{ color: "#16a34a" }}> • 📄 NEO</span>}
                    </div>
                  </div>

                  {/* UPDATED: Action buttons - removed eye emoji */}
                  <div style={{ display: "flex", gap: "4px", marginLeft: "8px" }}>
                    {editingSessionId !== session.id && (
                      <>
                        <button
                          onClick={(e) => handleStartEdit(session, e)}
                          style={{
                            padding: "4px",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#003366",
                            fontSize: "12px",
                          }}
                          title="Naam bewerken"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={(e) => handleDeleteWithConfirmation(session, e)}
                          style={{
                            padding: "4px",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#dc2626",
                            fontSize: "12px",
                          }}
                          title="Sessie verwijderen"
                        >
                          🗑
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "14px",
                  padding: "20px",
                }}
              >
                Geen sessies gevonden
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Add default export for compatibility
export default HistorySidebar;
