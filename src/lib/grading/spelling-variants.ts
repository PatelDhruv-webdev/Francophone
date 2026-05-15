// Phase 2.3 — 1990 reform spelling variant expansion.
//
// Source of truth: data/source/grammar_edge_cases.md §14 + §17.
// FrancoPath's stated policy (§17) is to teach traditional spelling by default
// and accept both in user input. This module produces the list of accepted
// variants given a canonical form so the grader can match either spelling.
//
// What this module does:
//   - î / Î circumflex: always droppable (île ↔ ile, connaître ↔ connaitre).
//   - û / Û circumflex: droppable EXCEPT on a small protected stem set where
//     the circumflex distinguishes meaning (dû vs du, mûr vs mur, sûr vs sur,
//     jeûne vs jeune, crût vs crut). Protection is stem-based so derivatives
//     (mûres, sûreté, jeûner …) keep the accent too.
//   - lexical swaps: oignon ↔ ognon, nénuphar ↔ nénufar.
//   - number hyphenation: `vingt et un` → `vingt-et-un` (also trente / quarante
//     / cinquante / soixante / quatre-vingt + et + un|une|onze).
//
// What this module does NOT do:
//   - Re-add circumflexes to a reform-spelled input (we have no oracle for
//     "did the author mean û here?"). If you author reform-only content you
//     get exactly that variant back.

export type SpellingPreference = 'traditional' | 'reform' | 'both'

// Stems where the circumflex on û disambiguates from a homograph.
const PROTECTED_U_STEMS = [
  'dû',
  'mûr', // mûr, mûre, mûrs, mûres, mûrir, mûrit, …
  'sûr', // sûr, sûre, sûrement, sûreté, …
  'jeûn', // jeûne, jeûner, jeûnait, …
  'crû', // crût (subjonctif of croître); also crû/crûe
] as const

const isProtectedU = (lowerWord: string): boolean =>
  PROTECTED_U_STEMS.some((stem) => lowerWord.startsWith(stem))

// Bidirectional lexical swaps (both spellings are accepted; reform prefers
// the second member, traditional the first).
const SWAP_GROUPS: ReadonlyArray<readonly [string, string]> = [
  ['oignon', 'ognon'],
  ['nénuphar', 'nénufar'],
]

// "et" connector numbers — the reform hyphenates these.
const NUMBER_PREFIX = /(vingt|trente|quarante|cinquante|soixante|quatre-vingt)/i
const NUMBER_TAIL = /(un|une|onze)/i
const NUMBER_ET_PATTERN = new RegExp(
  `\\b${NUMBER_PREFIX.source}\\s+et\\s+${NUMBER_TAIL.source}\\b`,
  'gi',
)
const NUMBER_HYPHENATED_PATTERN = new RegExp(
  `\\b${NUMBER_PREFIX.source}-et-${NUMBER_TAIL.source}\\b`,
  'gi',
)

const splitWords = (s: string): string[] =>
  // Split keeping separators so we can reassemble accurately.
  s.split(/(\s+|[-,.?!;:'’])/g)

const isWord = (token: string): boolean => /\p{L}/u.test(token)

// Convert a single word to its reform spelling.
function reformWord(word: string): string {
  const lower = word.toLowerCase()
  // Lexical swaps (case-preserving for the first letter, lowercase otherwise).
  for (const [trad, ref] of SWAP_GROUPS) {
    if (lower === trad) return matchCaseOf(word, ref)
  }
  // Circumflex stripping.
  let out = word.replace(/î/g, 'i').replace(/Î/g, 'I')
  if (!isProtectedU(lower)) {
    out = out.replace(/û/g, 'u').replace(/Û/g, 'U')
  }
  return out
}

// Convert a single word to its traditional spelling.
function traditionalWord(word: string): string {
  const lower = word.toLowerCase()
  for (const [trad, ref] of SWAP_GROUPS) {
    if (lower === ref) return matchCaseOf(word, trad)
  }
  // We do not re-add circumflexes; that information isn't recoverable from a
  // reform-spelled input.
  return word
}

function matchCaseOf(template: string, target: string): string {
  if (template.length === 0) return target
  const first = template[0] ?? ''
  if (first === first.toUpperCase() && first !== first.toLowerCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1)
  }
  return target
}

function mapWords(s: string, fn: (w: string) => string): string {
  return splitWords(s)
    .map((tok) => (isWord(tok) ? fn(tok) : tok))
    .join('')
}

// Public: apply the reform-1990 transformation to an entire phrase.
export function reformOf(s: string): string {
  const wordwise = mapWords(s, reformWord)
  // Number hyphenation: vingt et un → vingt-et-un.
  return wordwise.replace(NUMBER_ET_PATTERN, (_match, a: string, b: string) => `${a}-et-${b}`)
}

// Public: apply the inverse (reverse swap pairs + de-hyphenate compound
// numbers). Does NOT restore circumflexes (see file-level note).
export function traditionalOf(s: string): string {
  const wordwise = mapWords(s, traditionalWord)
  return wordwise.replace(
    NUMBER_HYPHENATED_PATTERN,
    (_match, a: string, b: string) => `${a} et ${b}`,
  )
}

// Public: return all acceptable spellings of the given canonical form per the
// requested preference. Always includes the original form. Deduplicated.
export function expandVariants(form: string, pref: SpellingPreference = 'both'): string[] {
  const out = new Set<string>([form])
  if (pref === 'traditional' || pref === 'both') {
    out.add(traditionalOf(form))
  }
  if (pref === 'reform' || pref === 'both') {
    out.add(reformOf(form))
  }
  return [...out]
}
