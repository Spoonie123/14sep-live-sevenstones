export interface PersonalityData {
  first_name?: string;
  last_name?: string;
  personTitle?: string;
  neo_scores: {
    [key: string]: number | undefined;
  };
  personalityText?: string;
  uploadedFile?: File | null;
  neo_report_name?: string;
  neo_report_path?: string;
}

export const PERSON_TITLES = [
  { value: "De heer", label: "De heer" },
  { value: "Mevrouw", label: "Mevrouw" },
  { value: "Voornaam", label: "Voornaam" },
] as const;

export type PersonTitle = (typeof PERSON_TITLES)[number]["value"];
