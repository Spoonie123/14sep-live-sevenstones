"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "../../lib/supabase"

interface LoginPageProps {
  onLoginSuccess: () => void
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // 👥 Toegestane email adressen voor het team
  const allowedEmails = [
    "peter@sevenstones.nl",
    "jochem@sevenstones.nl",
    "driessen@sevenstones.nl",
    "info@sevenstones.nl",
  ]

  // 🔐 Het gedeelde team account
  const SHARED_ACCOUNT = {
    email: "team@sevenstones.nl",
    // Het wachtwoord wordt ingevoerd door de gebruiker
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // ✅ Check of het email adres is toegestaan
      if (!allowedEmails.includes(email.toLowerCase())) {
        throw new Error("Dit email adres heeft geen toegang tot het systeem.")
      }

      // 🔑 Log in met het gedeelde team account
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: SHARED_ACCOUNT.email, // Altijd inloggen met team@sevenstones.nl
        password: password, // Maar het wachtwoord dat de gebruiker invoert
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        // 💾 Sla het echte email adres op in localStorage voor weergave
        localStorage.setItem("sevenstones_user_email", email)

        console.log(`✅ ${email} is ingelogd via gedeeld team account`)
        onLoginSuccess()
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Er is een fout opgetreden bij het inloggen.")
    } finally {
      setLoading(false)
    }
  }

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
          <h1 style={{ color: "#003366", fontSize: "28px", margin: "0 0 8px 0", fontWeight: "bold" }}>SEVEN STONES</h1>
          <p style={{ color: "#64748b", margin: "0", fontSize: "16px" }}>Workflow Tool</p>
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
            👥 <strong>Team Login:</strong> Gebruik je eigen email + gedeeld wachtwoord
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Email adres
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@sevenstones.nl"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
              Toegestaan: peter@, jochem@, driessen@, info@sevenstones.nl
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Team Wachtwoord
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Gedeeld team wachtwoord"
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "16px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                padding: "12px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
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
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {loading ? "Inloggen..." : "Inloggen"}
          </button>
        </form>

        {/* Info */}
        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          <div style={{ marginBottom: "8px" }}>
            <strong>🔐 Hoe werkt dit?</strong>
          </div>
          <ul style={{ margin: "0", paddingLeft: "16px" }}>
            <li>Alle teamleden delen 1 account</li>
            <li>Iedereen ziet dezelfde sessies & data</li>
            <li>Je eigen naam wordt getoond in de interface</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
