// Normalizes French text for lenient answer matching.
// Strips diacritics, trims whitespace, collapses runs of spaces, unifies the
// apostrophe family and common Unicode punctuation that learners produce
// through different keyboards / paste sources.

const ACCENT_MAP: Record<string, string> = {
  à: 'a',
  â: 'a',
  ä: 'a',
  é: 'e',
  è: 'e',
  ê: 'e',
  ë: 'e',
  î: 'i',
  ï: 'i',
  ô: 'o',
  ö: 'o',
  ù: 'u',
  û: 'u',
  ü: 'u',
  ç: 'c',
  œ: 'oe',
  æ: 'ae',
  ñ: 'n',
}

// Single-quote-shaped code points learners type or paste. Smart keyboards
// (macOS, iOS, Word) emit U+2019; some systems emit U+02BC / U+2032. All of
// these should match ASCII U+0027 so c'est / c’est / cʼest match.
//   U+2018 LEFT SINGLE QUOTATION MARK
//   U+2019 RIGHT SINGLE QUOTATION MARK
//   U+201A SINGLE LOW-9 QUOTATION MARK
//   U+201B SINGLE HIGH-REVERSED-9 QUOTATION MARK
//   U+02BC MODIFIER LETTER APOSTROPHE
//   U+02B9 MODIFIER LETTER PRIME
//   U+02BB MODIFIER LETTER TURNED COMMA
//   U+2032 PRIME
//   U+FF07 FULLWIDTH APOSTROPHE
const APOSTROPHE_FAMILY = /[‘’‚‛ʼʹʻ′＇]/g

// Double-quote-shaped code points → ASCII ".
//   U+201C, U+201D, U+201E, U+201F, U+2033, U+FF02
const QUOTE_FAMILY = /[“”„‟″＂]/g

// Unicode whitespace → plain space.
//   U+00A0 NBSP, U+2000-U+200A spaces, U+202F NNBSP,
//   U+205F MMSP, U+3000 ideographic space
const SPACE_FAMILY = /[  -   　]/g

// Zero-width invisibles → strip entirely.
//   U+200B ZWSP, U+200C ZWNJ, U+200D ZWJ, U+FEFF BOM
const ZWSP_FAMILY = /[​-‍﻿]/g

export function stripAccents(s: string): string {
  return s.replace(/[àâäéèêëîïôöùûüçœæñ]/gi, (ch) => {
    const mapped = ACCENT_MAP[ch.toLowerCase()] ?? ch
    // Preserve the case of the original character (É → E, é → e)
    return ch === ch.toUpperCase() ? mapped.toUpperCase() : mapped
  })
}

// Unify visually-equivalent code points to a single canonical form before
// any case/accent processing. Idempotent.
export function normalizeUnicode(s: string): string {
  return s
    .normalize('NFC')
    .replace(APOSTROPHE_FAMILY, "'")
    .replace(QUOTE_FAMILY, '"')
    .replace(ZWSP_FAMILY, '')
    .replace(SPACE_FAMILY, ' ')
}

export function normalize(s: string): string {
  return stripAccents(normalizeUnicode(s).trim().toLowerCase()).replace(/\s+/g, ' ')
}

// Strict version — keeps accents and case, only normalizes whitespace/punctuation
// and trims.
export function normalizeSoft(s: string): string {
  return normalizeUnicode(s).trim().toLowerCase().replace(/\s+/g, ' ')
}

export interface NormalizeForGradingOptions {
  caseSensitive?: boolean
  accentTolerant?: boolean
}

// Single entry point used by graders 2.2+. Composes the existing primitives so
// callers don't have to remember which order to apply them in.
export function normalizeForGrading(
  s: string,
  { caseSensitive = false, accentTolerant = true }: NormalizeForGradingOptions = {},
): string {
  let v = normalizeUnicode(s).trim().replace(/\s+/g, ' ')
  if (accentTolerant) v = stripAccents(v)
  if (!caseSensitive) v = v.toLowerCase()
  return v
}
