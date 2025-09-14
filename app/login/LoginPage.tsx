"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 👥 Toegestane e-mails (lowercased)
  const allowedEmails = [
    "peter@sevenstones.nl",
    "jochem@sevenstones.nl",
    "driessen@sevenstones.nl",
    "info@sevenstones.nl",
  ];

  // 🔐 Gedeeld account
  const SHARED_ACCOUNT = { email: "team@sevenstones.nl" };

  // Al ingelogd? Direct door.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) onLoginSuccess();
    });
  }, [onLoginSuccess]);

  const mapError = (message: string) => {
    const m = message.toLowerCase();
    if (m.includes("invalid login credentials")) return "Wachtwoord onjuist.";
    if (m.includes("rate limit")) return "Te veel pogingen. Probeer het zo dadelijk opnieuw.";
    return "Er is een fout opgetreden bij het inloggen.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!allowedEmails.includes(cleanEmail)) {
        throw new Error("Dit e-mailadres heeft geen toegang tot het systeem.");
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: SHARED_ACCOUNT.email,      // altijd het gedeelde account
        password: password,               // wachtwoord dat de gebruiker invoert
      });

      if (authError) throw authError;

      if (data.user) {
        // Bewaar “wie” er ingelogd is voor weergave in de UI
        localStorage.setItem("sevenstones_user_email", cleanEmail);
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(mapError(err?.message ?? ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "48px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ color: "#003366", fontSize: "28px", margin: "0 0 8px 0", fontWeight: "bold" }}>
            SEVEN STONES
          </h1>
          <p style={{ color: "#64748b", margin: 0, fontSize: "16px" }}>Workflow Tool</p>
          <div
            style={{
              backgroundColor: "#e0f2fe",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "16px",
              fontSize: "14px",
              color: "#0369a1",
            }}
          >
            👥 <strong>Team Login:</strong> gebruik je eigen e-mail + gedeeld wachtwoord
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="email"
              style={{ display: "block", marginBottom: 8, color: "#374151", fontSize: 14, fontWeight: 500 }}
            >
              E-mailadres
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@sevenstones.nl"
              required
              autoComplete="username"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              Toegestaan: peter@, jochem@, driessen@, info@sevenstones.nl
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label
              htmlFor="password"
              style={{ display: "block", marginBottom: 8, color: "#374151", fontSize: 14, fontWeight: 500 }}
            >
              Teamwachtwoord
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Gedeeld teamwachtwoord"
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  padding: "12px 44px 12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "16px",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                title={showPw ? "Verberg wachtwoord" : "Toon wachtwoord"}
                style={{
                  position: "absolute",
                  right: 8,
                  top: 8,
                  height: 30,
                  padding: "0 10px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  background: "#f9fafb",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {showPw ? "Verberg" : "Toon"}
              </button>
            </div>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 14,
              }}
            >
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: loading ? "#9ca3af" : "#003366",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color .2s",
            }}
          >
            {loading ? "Inloggen..." : "Inloggen"}
          </button>
        </form>

        {/* Info */}
        <div
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: "#f8fafc",
            borderRadius: 8,
            fontSize: 13,
            color: "#64748b",
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <strong>🔐 Hoe werkt dit?</strong>
          </div>
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            <li>Alle teamleden delen 1 account</li>
            <li>Iedereen ziet dezelfde sessies &amp; data</li>
            <li>Je eigen naam wordt getoond in de interface</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
