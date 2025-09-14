"use client";

import React from "react";
import { PersonalityData, PERSON_TITLES } from "./personality-types";

interface PersonalInfoProps {
  personalityData: PersonalityData;
  setPersonalityData: React.Dispatch<React.SetStateAction<PersonalityData>>;
}

export default function PersonalInfo({ personalityData, setPersonalityData }: PersonalInfoProps) {
  const handleChange = (field: keyof PersonalityData, value: string) => {
    setPersonalityData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const disableFirstName = personalityData.personTitle === "Mevrouw" || personalityData.personTitle === "De heer";
  const disableLastName = personalityData.personTitle === "Voornaam";

  return (
    <div
      style={{
        marginBottom: "32px",
        padding: "24px",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
      }}
    >
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#003366",
          marginBottom: "20px",
        }}
      >
        👤 Persoonlijke Gegevens
      </h3>

      {/* Aanspreekwijze */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "16px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Aanspreekwijze *
        </label>
        <select
          value={personalityData.personTitle || ""}
          onChange={(e) => handleChange("personTitle", e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "16px",
            backgroundColor: "white",
            cursor: "pointer",
          }}
        >
          <option value="">Selecteer aanspreekwijze...</option>
          {PERSON_TITLES.map((title) => (
            <option key={title.value} value={title.value}>
              {title.label}
            </option>
          ))}
        </select>
      </div>

      {/* Voornaam */}
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "16px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Voornaam *
        </label>
        <input
          type="text"
          value={personalityData.first_name || ""}
          onChange={(e) => handleChange("first_name", e.target.value)}
          placeholder="Bijv. Jan"
          disabled={disableFirstName}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "16px",
            backgroundColor: disableFirstName ? "#f1f5f9" : "white",
            opacity: disableFirstName ? 0.6 : 1,
          }}
        />
      </div>

      {/* Achternaam */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "16px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "8px",
          }}
        >
          Achternaam *
        </label>
        <input
          type="text"
          value={personalityData.last_name || ""}
          onChange={(e) => handleChange("last_name", e.target.value)}
          placeholder="Bijv. Jansen"
          disabled={disableLastName}
          style={{
            width: "100%",
            padding: "12px 16px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "16px",
            backgroundColor: disableLastName ? "#f1f5f9" : "white",
            opacity: disableLastName ? 0.6 : 1,
          }}
        />
      </div>
    </div>
  );
}
