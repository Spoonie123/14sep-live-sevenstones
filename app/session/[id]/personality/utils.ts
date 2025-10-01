// utils.ts
/**
 * Zet een NEO‑score (1‑9) om in de exacte norm‑term.
 * Houdt exact de termen die in de system‑prompt staan.
 */
export const scoreToTerm = (score?: number): string => {
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
  