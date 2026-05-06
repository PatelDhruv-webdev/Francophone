// Normalizes French text for lenient answer matching.
// Strips diacritics, trims whitespace, collapses runs of spaces.
// Used by type_answer, fill_in_blank, conjugation, and word_order graders.

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

export function stripAccents(s: string): string {
  return s.replace(/[àâäéèêëîïôöùûüçœæñ]/gi, (ch) => {
    const mapped = ACCENT_MAP[ch.toLowerCase()] ?? ch
    // Preserve the case of the original character (É → E, é → e)
    return ch === ch.toUpperCase() ? mapped.toUpperCase() : mapped
  })
}

export function normalize(s: string): string {
  return stripAccents(s.trim().toLowerCase()).replace(/\s+/g, ' ')
}

// Strict version — keeps accents and case, only trims/collapses whitespace
export function normalizeSoft(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}
