import { describe, it, expect } from 'vitest'
import { gradeConjugation, type ConjugationLookup } from '@/lib/grading/conjugation'

// Phase 2.4 — Conjugation grader. Pure function over a ConjugationLookup,
// no DB access. Fixtures are inline.

const ETRE: ConjugationLookup = {
  infinitif: 'être',
  conjugations: {
    present: {
      je: 'suis',
      tu: 'es',
      il: 'est',
      nous: 'sommes',
      vous: 'êtes',
      ils: 'sont',
    },
    passe_compose: {
      je: 'ai été',
      tu: 'as été',
      il: 'a été',
      nous: 'avons été',
      vous: 'avez été',
      ils: 'ont été',
    },
  },
}

const AVOIR: ConjugationLookup = {
  infinitif: 'avoir',
  conjugations: {
    present: {
      je: 'ai',
      tu: 'as',
      il: 'a',
      nous: 'avons',
      vous: 'avez',
      ils: 'ont',
    },
  },
}

const MANGER: ConjugationLookup = {
  infinitif: 'manger',
  conjugations: {
    present: {
      je: 'mange',
      tu: 'manges',
      il: 'mange',
      nous: 'mangeons', // -ger trap: must keep the e before -ons
      vous: 'mangez',
      ils: 'mangent',
    },
  },
}

const CONNAITRE: ConjugationLookup = {
  infinitif: 'connaître',
  conjugations: {
    present: {
      je: 'connais',
      tu: 'connais',
      il: 'connaît',
      nous: 'connaissons',
      vous: 'connaissez',
      ils: 'connaissent',
    },
  },
}

describe('gradeConjugation — basic lookups', () => {
  it('être / present / je suis', () => {
    expect(
      gradeConjugation({ verb: ETRE, tense: 'present', person: 'je', answer: 'suis' }),
    ).toEqual({ correct: true, displayAnswer: 'suis' })
  })
  it('avoir / present / nous avons', () => {
    expect(
      gradeConjugation({ verb: AVOIR, tense: 'present', person: 'nous', answer: 'avons' }).correct,
    ).toBe(true)
  })
  it('manger / present / nous mangeons (the -ger trap)', () => {
    expect(
      gradeConjugation({
        verb: MANGER,
        tense: 'present',
        person: 'nous',
        answer: 'mangeons',
      }).correct,
    ).toBe(true)
  })
  it('manger / present / nous mangons is wrong (missing e)', () => {
    expect(
      gradeConjugation({
        verb: MANGER,
        tense: 'present',
        person: 'nous',
        answer: 'mangons',
      }).correct,
    ).toBe(false)
  })
  it('wrong tense/person returns false with empty displayAnswer', () => {
    expect(
      gradeConjugation({
        verb: ETRE,
        tense: 'subjonctif',
        person: 'je',
        answer: 'sois',
      }),
    ).toEqual({ correct: false, displayAnswer: '' })
  })
  it('wrong person returns false with empty displayAnswer', () => {
    expect(
      gradeConjugation({ verb: ETRE, tense: 'present', person: 'vouz', answer: 'êtes' }),
    ).toEqual({ correct: false, displayAnswer: '' })
  })
})

describe('gradeConjugation — accent / apostrophe tolerance through normalizer', () => {
  it('être / vous etes matches "êtes" via accent tolerance', () => {
    expect(
      gradeConjugation({ verb: ETRE, tense: 'present', person: 'vous', answer: 'etes' }).correct,
    ).toBe(true)
  })
  it('passe_compose "ai ete" (no accents) matches "ai été"', () => {
    expect(
      gradeConjugation({
        verb: ETRE,
        tense: 'passe_compose',
        person: 'je',
        answer: 'ai ete',
      }).correct,
    ).toBe(true)
  })
  it('connaître / il connait matches "connaît" via accent tolerance', () => {
    expect(
      gradeConjugation({
        verb: CONNAITRE,
        tense: 'present',
        person: 'il',
        answer: 'connait',
      }).correct,
    ).toBe(true)
  })
})

describe('gradeConjugation — spellingPreference', () => {
  it('with pref=both, accent-strict, "connait" matches "connaît"', () => {
    expect(
      gradeConjugation({
        verb: CONNAITRE,
        tense: 'present',
        person: 'il',
        answer: 'connait',
        spellingPreference: 'both',
        accentTolerant: false,
      }).correct,
    ).toBe(true)
  })
  it('without pref, accent-strict, "connait" does NOT match "connaît"', () => {
    expect(
      gradeConjugation({
        verb: CONNAITRE,
        tense: 'present',
        person: 'il',
        answer: 'connait',
        accentTolerant: false,
      }).correct,
    ).toBe(false)
  })
})

describe('gradeConjugation — person aliases', () => {
  const STORED_AS_IL_ELLE: ConjugationLookup = {
    conjugations: {
      present: {
        'il/elle': 'va',
      },
    },
  }
  it("resolves 'il' to 'il/elle' slot", () => {
    expect(
      gradeConjugation({
        verb: STORED_AS_IL_ELLE,
        tense: 'present',
        person: 'il',
        answer: 'va',
      }).correct,
    ).toBe(true)
  })
  it("resolves 'elle' to 'il/elle' slot", () => {
    expect(
      gradeConjugation({
        verb: STORED_AS_IL_ELLE,
        tense: 'present',
        person: 'elle',
        answer: 'va',
      }).correct,
    ).toBe(true)
  })
})

describe('gradeConjugation — displayAnswer shows the canonical form', () => {
  it('returns the stored conjugation as displayAnswer', () => {
    const r = gradeConjugation({
      verb: ETRE,
      tense: 'present',
      person: 'je',
      answer: 'wrong',
    })
    expect(r.correct).toBe(false)
    expect(r.displayAnswer).toBe('suis')
  })
})
