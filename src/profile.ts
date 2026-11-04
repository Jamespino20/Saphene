// Config-driven mechanical profile checks.
//
// Claim verification answers semantic questions. Some projects also want
// deterministic document mechanics beside it: length bands, repeated-term
// budgets, quote balance, paragraph ceilings, and cross-file repeated
// n-grams. Saphene ships no built-in taste: every threshold comes from the
// project's own JSON profile.

import { existsSync, readFileSync } from "node:fs";

export interface MechanicalProfile {
  wordBand?: [number, number];
  termBudgets?: Record<string, number>;
  quoteBalance?: boolean;
  maxParagraphWords?: number;
  crossFileNgram?: number;
}

export interface ProfileViolation {
  file: string;
  rule: string;
  detail: string;
}

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "of", "to", "in", "on", "for", "with", "by", "at", "from", "as", "is", "was", "were", "are", "be", "been", "it", "its", "this", "that", "these", "those", "he", "she", "they", "his", "her", "their", "had", "has", "have", "not", "no", "i", "you", "we",
]);

export function loadMechanicalProfile(path: string): MechanicalProfile {
  if (!existsSync(path)) {
    throw new Error(`Profile not found: ${path} (check the path, or create a JSON profile — see saphene guide profile)`);
  }
  const parsed = JSON.parse(readFileSync(path, "utf8")) as MechanicalProfile;
  return parsed;
}

function words(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
}

export function runMechanicalProfile(
  documents: Array<{ file: string; content: string }>,
  profile: MechanicalProfile,
): ProfileViolation[] {
  const violations: ProfileViolation[] = [];

  for (const doc of documents) {
    const wordList = words(doc.content);
    if (profile.wordBand) {
      const [min, max] = profile.wordBand;
      if (wordList.length < min || wordList.length > max) {
        violations.push({
          file: doc.file,
          rule: "word-band",
          detail: `${wordList.length} words; expected ${min}-${max}`,
        });
      }
    }

    if (profile.termBudgets) {
      for (const [term, max] of Object.entries(profile.termBudgets)) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const count = (doc.content.match(new RegExp(`\\b${escaped}\\b`, "gi")) ?? []).length;
        if (count > max) {
          violations.push({
            file: doc.file,
            rule: "term-budget",
            detail: `${count} uses of "${term}"; max ${max}`,
          });
        }
      }
    }

    if (profile.quoteBalance) {
      const straight = (doc.content.match(/"/g) ?? []).length;
      const curlyOpen = (doc.content.match(/“/g) ?? []).length;
      const curlyClose = (doc.content.match(/”/g) ?? []).length;
      if (straight % 2 !== 0 || curlyOpen !== curlyClose) {
        violations.push({
          file: doc.file,
          rule: "quote-balance",
          detail: `straight quotes ${straight}; curly quotes ${curlyOpen}/${curlyClose}`,
        });
      }
    }

    if (typeof profile.maxParagraphWords === "number") {
      const paragraphs = doc.content.split(/\r?\n\s*\r?\n/);
      paragraphs.forEach((paragraph, index) => {
        const count = words(paragraph).length;
        if (count > profile.maxParagraphWords!) {
          violations.push({
            file: doc.file,
            rule: "paragraph-words",
            detail: `paragraph ${index + 1} has ${count} words; max ${profile.maxParagraphWords}`,
          });
        }
      });
    }
  }

  if (profile.crossFileNgram && profile.crossFileNgram > 1) {
    const n = profile.crossFileNgram;
    const seen = new Map<string, string>();
    for (const doc of documents) {
      const wordList = words(doc.content);
      for (let i = 0; i + n <= wordList.length; i++) {
        const gramWords = wordList.slice(i, i + n);
        if (gramWords.filter((w) => !STOPWORDS.has(w)).length < 3) continue;
        const gram = gramWords.join(" ");
        const firstFile = seen.get(gram);
        if (firstFile && firstFile !== doc.file) {
          violations.push({
            file: doc.file,
            rule: `cross-file-${n}-gram`,
            detail: `repeats "${gram}" first seen in ${firstFile}`,
          });
        } else if (!firstFile) {
          seen.set(gram, doc.file);
        }
        if (violations.length >= 200) return violations;
      }
    }
  }

  return violations;
}
