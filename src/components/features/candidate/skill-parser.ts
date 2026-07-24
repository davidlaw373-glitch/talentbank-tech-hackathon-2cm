/**
 * Deterministic, offline "AI" skill parser for the candidate profile.
 *
 * The concept calls for an AI that reads a candidate's everyday prose
 * (summaries, experience, project descriptions) and tags the profile with
 * *structured* skills. We implement that as a pure, deterministic lexicon
 * matcher rather than a network call: the same input always yields the same
 * ordered suggestions, so the demo is stable and reviewable.
 *
 * The lexicon is data-driven — built from the union of skills that already
 * exist in the immutable datasets (verified credentials, market signals, and
 * job requirements) — so it never invents a skill the platform doesn't know
 * about. Kept free of React / `"use client"`.
 */
import type { Credential } from "@/types/credential";
import type { Job } from "@/types/job";
import type { MarketSignal } from "@/types/market-signal";
import { normalize } from "@/components/features/candidate/credential-derivations";

/** A canonical skill plus every lowercase alias that should match it. */
type LexiconEntry = {
  canonical: string;
  aliases: string[];
};

export type SkillLexicon = {
  /** Canonical entries, longest phrase first for greedy matching. */
  entries: LexiconEntry[];
};

/**
 * Extra aliases for a handful of skills whose everyday spelling differs from
 * the canonical label. Each alias maps to a canonical skill that must already
 * be present in the data-derived lexicon — we never introduce new skills here.
 */
const ALIASES: Record<string, string[]> = {
  typescript: ["ts"],
  javascript: ["js"],
  "next.js": ["nextjs", "next js"],
  "node.js": ["nodejs", "node js", "node"],
  react: ["react.js", "reactjs"],
  postgresql: ["postgres", "psql"],
  kubernetes: ["k8s"],
  accessibility: ["a11y"],
};

export function buildSkillLexicon({
  credentials,
  marketSignals,
  jobs,
}: {
  credentials: Credential[];
  marketSignals: MarketSignal[];
  jobs: Job[];
}): SkillLexicon {
  // Canonical skills = union of credential skills, market-signal skills, and
  // structured job skill arrays (mustHave / niceToHave). Prose `requirements`
  // are deliberately excluded — they aren't structured skills.
  const canonicalByKey = new Map<string, string>();
  const addCanonical = (skill: string) => {
    const key = normalize(skill);
    if (key && !canonicalByKey.has(key)) canonicalByKey.set(key, skill);
  };

  for (const credential of credentials) credential.skills.forEach(addCanonical);
  for (const signal of marketSignals) addCanonical(signal.skill);
  for (const job of jobs) {
    job.mustHave.forEach(addCanonical);
    job.niceToHave.forEach(addCanonical);
  }

  const entries: LexiconEntry[] = [];
  for (const [key, canonical] of canonicalByKey) {
    const aliases = new Set<string>([key]);
    for (const alias of ALIASES[key] ?? []) aliases.add(normalize(alias));
    entries.push({ canonical, aliases: [...aliases] });
  }

  // Greedy longest-first matching so "React Native" wins over "React".
  entries.sort(
    (a, b) => longestAlias(b) - longestAlias(a) || a.canonical.localeCompare(b.canonical),
  );

  return { entries };
}

function longestAlias(entry: LexiconEntry): number {
  return entry.aliases.reduce((max, a) => Math.max(max, a.length), 0);
}

/**
 * Match on whole-word / phrase boundaries within a normalized haystack that
 * is padded with spaces and has skill punctuation preserved. Boundaries are
 * anything that isn't a word char, `.`, `+`, or `#`, so "Next.js", "C++",
 * and "C#" match but "reactionary" does not match "react".
 */
function containsSkill(haystack: string, alias: string): boolean {
  let from = 0;
  for (;;) {
    const idx = haystack.indexOf(alias, from);
    if (idx === -1) return false;
    const before = haystack[idx - 1] ?? " ";
    const after = haystack[idx + alias.length] ?? " ";
    if (!isSkillChar(before) && !isSkillChar(after)) return true;
    from = idx + 1;
  }
}

function isSkillChar(char: string): boolean {
  return /[a-z0-9.+#]/.test(char);
}

/**
 * Detect canonical skills mentioned in a block of text. Returns canonical
 * labels in lexicon order (longest-first) de-duplicated case-insensitively.
 */
export function detectSkills(text: string, lexicon: SkillLexicon): string[] {
  if (!text.trim()) return [];
  const haystack = ` ${normalize(text)} `;
  const found: string[] = [];
  for (const entry of lexicon.entries) {
    if (entry.aliases.some((alias) => containsSkill(haystack, alias))) {
      found.push(entry.canonical);
    }
  }
  return found;
}

export type DetectedSkill = {
  skill: string;
  /** Human-readable origin, e.g. "Found in your Northstar Labs experience". */
  source: string;
};

type CandidateText = {
  summary: string;
  experience: { role: string; company: string; description: string }[];
  projects: { name: string; description: string }[];
};

/**
 * Scan the whole profile and return detected skills with a source label,
 * excluding anything already accepted (candidate skills) or already verified.
 * First mention wins the source label; output order is stable.
 */
export function detectCandidateSkills(
  candidate: CandidateText,
  lexicon: SkillLexicon,
  exclude: string[] = [],
): DetectedSkill[] {
  const excluded = new Set(exclude.map(normalize));
  const seen = new Set<string>();
  const out: DetectedSkill[] = [];

  const consider = (text: string, source: string) => {
    for (const skill of detectSkills(text, lexicon)) {
      const key = normalize(skill);
      if (excluded.has(key) || seen.has(key)) continue;
      seen.add(key);
      out.push({ skill, source });
    }
  };

  consider(candidate.summary, "Found in your summary");
  for (const exp of candidate.experience) {
    consider(exp.description, `Found in your ${exp.company} experience`);
  }
  for (const project of candidate.projects) {
    consider(project.description, `Found in your ${project.name} project`);
  }

  return out;
}
