import { describe, it, expect } from 'vitest'
import { expandVariants, reformOf, traditionalOf } from '@/lib/grading/spelling-variants'
import { gradeTypeAnswer } from '@/lib/grading/graders'

// Phase 2.3 — 1990 reform spelling variant expansion.
// Source of truth: data/source/grammar_edge_cases.md §14.

describe('reformOf — circumflex on î (always droppable)', () => {
  it('connaître → connaitre', () => {
    expect(reformOf('connaître')).toBe('connaitre')
  })
  it('île → ile', () => {
    expect(reformOf('île')).toBe('ile')
  })
  it("s'il vous plaît → s'il vous plait", () => {
    expect(reformOf("s'il vous plaît")).toBe("s'il vous plait")
  })
  it('preserves uppercase Î → I', () => {
    expect(reformOf('Île')).toBe('Ile')
  })
  it('no circumflex → unchanged', () => {
    expect(reformOf('bonjour')).toBe('bonjour')
  })
})

describe('reformOf — circumflex on û (droppable unless protected)', () => {
  it('coût → cout', () => {
    expect(reformOf('coût')).toBe('cout')
  })
  it('août → aout', () => {
    expect(reformOf('août')).toBe('aout')
  })
  it('preserves dû (not du)', () => {
    expect(reformOf('dû')).toBe('dû')
  })
  it('preserves mûr / mûre / mûres', () => {
    expect(reformOf('mûr')).toBe('mûr')
    expect(reformOf('mûre')).toBe('mûre')
    expect(reformOf('mûres')).toBe('mûres')
  })
  it('preserves sûr / sûreté', () => {
    expect(reformOf('sûr')).toBe('sûr')
    expect(reformOf('sûreté')).toBe('sûreté')
  })
  it('preserves jeûne / jeûner', () => {
    expect(reformOf('jeûne')).toBe('jeûne')
    expect(reformOf('jeûner')).toBe('jeûner')
  })
})

describe('reformOf — lexical swaps', () => {
  it('oignon → ognon', () => {
    expect(reformOf('oignon')).toBe('ognon')
  })
  it('nénuphar → nénufar', () => {
    expect(reformOf('nénuphar')).toBe('nénufar')
  })
  it('preserves capitalization on swap', () => {
    expect(reformOf('Oignon')).toBe('Ognon')
  })
})

describe('reformOf — compound number hyphenation', () => {
  it('vingt et un → vingt-et-un', () => {
    expect(reformOf('vingt et un')).toBe('vingt-et-un')
  })
  it('trente et un → trente-et-un', () => {
    expect(reformOf('trente et un')).toBe('trente-et-un')
  })
  it('soixante et onze → soixante-et-onze', () => {
    expect(reformOf('soixante et onze')).toBe('soixante-et-onze')
  })
  it('quatre-vingt et un → quatre-vingt-et-un', () => {
    expect(reformOf('quatre-vingt et un')).toBe('quatre-vingt-et-un')
  })
  it('does not hyphenate unrelated et-phrases', () => {
    expect(reformOf('toi et moi')).toBe('toi et moi')
  })
})

describe('traditionalOf', () => {
  it('reverses oignon swap (ognon → oignon)', () => {
    expect(traditionalOf('ognon')).toBe('oignon')
  })
  it('reverses nénufar → nénuphar', () => {
    expect(traditionalOf('nénufar')).toBe('nénuphar')
  })
  it('de-hyphenates vingt-et-un', () => {
    expect(traditionalOf('vingt-et-un')).toBe('vingt et un')
  })
  it('does NOT re-add circumflexes (connaitre stays connaitre)', () => {
    expect(traditionalOf('connaitre')).toBe('connaitre')
  })
  it('leaves traditional form unchanged', () => {
    expect(traditionalOf('connaître')).toBe('connaître')
  })
})

describe('expandVariants', () => {
  it('default both — includes the canonical and the reform variant', () => {
    const v = expandVariants('connaître')
    expect(v).toContain('connaître')
    expect(v).toContain('connaitre')
  })
  it("traditional pref — doesn't add the reform variant", () => {
    expect(expandVariants('connaître', 'traditional')).toEqual(['connaître'])
  })
  it('reform pref — returns only canonical + reformed', () => {
    const v = expandVariants('connaître', 'reform')
    expect(v).toContain('connaître')
    expect(v).toContain('connaitre')
  })
  it('canonical with no variants is returned as a single-entry list', () => {
    expect(expandVariants('bonjour')).toEqual(['bonjour'])
  })
  it('protected stems do not produce a reform variant', () => {
    expect(expandVariants('dû')).toEqual(['dû'])
    expect(expandVariants('mûr')).toEqual(['mûr'])
    expect(expandVariants('sûr')).toEqual(['sûr'])
  })
  it('oignon expands to include ognon', () => {
    const v = expandVariants('oignon')
    expect(v).toContain('oignon')
    expect(v).toContain('ognon')
  })
  it('compound number expands both forms', () => {
    const v = expandVariants('vingt et un')
    expect(v).toContain('vingt et un')
    expect(v).toContain('vingt-et-un')
  })
})

describe('gradeTypeAnswer — spellingPreference integration', () => {
  it('accepts reform spelling when pref=both', () => {
    expect(gradeTypeAnswer('connaitre', 'connaître', { spellingPreference: 'both' }).correct).toBe(
      true,
    )
  })
  it('accepts traditional spelling when pref=both', () => {
    expect(gradeTypeAnswer('connaître', 'connaître', { spellingPreference: 'both' }).correct).toBe(
      true,
    )
  })
  it('rejects mûr-as-mur (protected, not a valid variant)', () => {
    // We grade case- and accent-tolerantly by default, so "mur" stripped of
    // accents equals "mur" stripped of accents. To verify protection we run
    // with accentTolerant=false.
    expect(
      gradeTypeAnswer('mur', 'mûr', {
        spellingPreference: 'both',
        accentTolerant: false,
      }).correct,
    ).toBe(false)
  })
  it('without spellingPreference, reform is still accepted via accent-tolerance', () => {
    // Because the default normalizer is accent-tolerant, even without the
    // spelling expander, "connaitre" matches "connaître". The pref option
    // matters more for case-sensitive / accent-strict modes.
    expect(gradeTypeAnswer('connaitre', 'connaître').correct).toBe(true)
  })
  it('without spellingPreference in accent-strict mode, reform is rejected', () => {
    expect(gradeTypeAnswer('connaitre', 'connaître', { accentTolerant: false }).correct).toBe(false)
  })
  it('with spellingPreference=both in accent-strict mode, reform is accepted', () => {
    expect(
      gradeTypeAnswer('connaitre', 'connaître', {
        accentTolerant: false,
        spellingPreference: 'both',
      }).correct,
    ).toBe(true)
  })
})
