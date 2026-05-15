import { describe, it, expect } from 'vitest'
import {
  normalize,
  normalizeForGrading,
  normalizeSoft,
  normalizeUnicode,
  stripAccents,
} from '@/lib/grading/normalizer'

// Phase 2.1 — Unicode normalization, apostrophe family, NBSP, curly quotes.
// These tests focus on the new behavior introduced by normalizeUnicode and
// normalizeForGrading. The existing accent/whitespace coverage lives in
// src/tests/unit/grading.test.ts.

describe('normalizeUnicode', () => {
  it('is a no-op for plain ASCII', () => {
    expect(normalizeUnicode("c'est")).toBe("c'est")
    expect(normalizeUnicode('bonjour')).toBe('bonjour')
  })

  // Apostrophe family
  it("collapses U+2019 (’) to ASCII '", () => {
    expect(normalizeUnicode('c’est')).toBe("c'est")
  })
  it("collapses U+2018 (‘) to ASCII '", () => {
    expect(normalizeUnicode('c‘est')).toBe("c'est")
  })
  it("collapses U+02BC (ʼ) to ASCII '", () => {
    expect(normalizeUnicode('cʼest')).toBe("c'est")
  })
  it("collapses U+2032 (′) to ASCII '", () => {
    expect(normalizeUnicode('c′est')).toBe("c'est")
  })
  it("collapses U+FF07 (＇) to ASCII '", () => {
    expect(normalizeUnicode('c＇est')).toBe("c'est")
  })

  // Double quote family
  it('collapses U+201C / U+201D to ASCII "', () => {
    expect(normalizeUnicode('“bonjour”')).toBe('"bonjour"')
  })

  // Whitespace family
  it('collapses U+00A0 (NBSP) to plain space', () => {
    expect(normalizeUnicode('j ai')).toBe('j ai')
  })
  it('collapses U+202F (narrow NBSP) to plain space', () => {
    expect(normalizeUnicode('j ai')).toBe('j ai')
  })
  it('collapses U+2009 (thin space) to plain space', () => {
    expect(normalizeUnicode('j ai')).toBe('j ai')
  })

  // Zero-width invisibles
  it('strips U+200B (zero-width space)', () => {
    expect(normalizeUnicode('bon​jour')).toBe('bonjour')
  })
  it('strips U+FEFF (BOM)', () => {
    expect(normalizeUnicode('﻿bonjour')).toBe('bonjour')
  })

  // NFC composition
  it('composes decomposed é (e + COMBINING ACUTE) into precomposed é', () => {
    const decomposed = 'é' // length 2
    const result = normalizeUnicode(decomposed)
    expect(result).toBe('é') // length 1 precomposed
    expect(result.length).toBe(1)
  })

  it('is idempotent', () => {
    const sample = 'c’est l’hôtel'
    expect(normalizeUnicode(normalizeUnicode(sample))).toBe(normalizeUnicode(sample))
  })
})

describe('normalize (with new unicode pass)', () => {
  it("matches c'est across apostrophe variants", () => {
    expect(normalize("c'est")).toBe(normalize('c’est'))
    expect(normalize('cʼest')).toBe("c'est")
  })

  it('strips accents introduced by NFC composition', () => {
    expect(normalize('étudier')).toBe('etudier')
  })

  it('treats NBSP as a regular separator', () => {
    expect(normalize('j ai 25 ans')).toBe('j ai 25 ans')
  })
})

describe('normalizeSoft (preserves accents but cleans unicode)', () => {
  it('still keeps accents', () => {
    expect(normalizeSoft('café')).toBe('café')
  })
  it('unifies the apostrophe family', () => {
    expect(normalizeSoft('C’est')).toBe("c'est")
  })
  it('collapses NBSP', () => {
    expect(normalizeSoft('j AI')).toBe('j ai')
  })
})

describe('stripAccents (unchanged behavior)', () => {
  it('still strips é → e', () => {
    expect(stripAccents('é')).toBe('e')
  })
  it('preserves case', () => {
    expect(stripAccents('É')).toBe('E')
  })
})

describe('normalizeForGrading', () => {
  it('default: accent-tolerant, case-insensitive', () => {
    expect(normalizeForGrading('Étudier')).toBe('etudier')
  })
  it('case-sensitive option preserves case', () => {
    expect(normalizeForGrading('Étudier', { caseSensitive: true })).toBe('Etudier')
  })
  it('accent-strict option keeps accents', () => {
    expect(normalizeForGrading('Étudier', { accentTolerant: false })).toBe('étudier')
  })
  it('accent-strict + case-sensitive is nearly identity (modulo whitespace + unicode)', () => {
    expect(normalizeForGrading('  Étudier  ', { caseSensitive: true, accentTolerant: false })).toBe(
      'Étudier',
    )
  })
  it('unifies apostrophes regardless of options', () => {
    expect(normalizeForGrading('C’est')).toBe("c'est")
    expect(normalizeForGrading('C’est', { caseSensitive: true, accentTolerant: false })).toBe(
      "C'est",
    )
  })
  it('collapses NBSP regardless of options', () => {
    expect(normalizeForGrading('j ai')).toBe('j ai')
  })
  it('handles empty string', () => {
    expect(normalizeForGrading('')).toBe('')
  })
})
