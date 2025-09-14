// app/components/SaveButton.tsx
"use client";

import { FaCheckCircle } from 'react-icons/fa'; // Zorg ervoor dat deze import bestaat

interface Props {
  // Verwijder onSave, want die is niet nodig met autosave
  isCompleted: boolean; // Voeg deze prop toe
}

export default function SaveButton({ isCompleted }: Props) {
  return (
    <button
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        borderRadius: "9999px",
        backgroundColor: isCompleted ? "#22c55e" : "#003366",
        color: "white",
        fontWeight: "bold",
        cursor: "default", // Deactiveer de cursor, want de knop is statisch
        transition: "background-color 0.2s",
      }}
      disabled // De knop is niet klikbaar
    >
      {isCompleted ? (
        <>
          <FaCheckCircle /> Voltooid
        </>
      ) : (
        "Auto Save..."
      )}
    </button>
  );
}