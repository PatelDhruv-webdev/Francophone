import { describe, it, expect } from 'vitest'
import { chooseAuxiliary, gradeAuxiliary, type AuxiliaryLookup } from '@/lib/grading/auxiliary'

// Phase 2.5 — Auxiliary disambiguation. Source: grammar_edge_cases.md §4.

const sortir: AuxiliaryLookup = { infinitif: 'sortir', auxiliary: 'être' }
const monter: AuxiliaryLookup = { infinitif: 'monter', auxiliary: 'être' }
const descendre: AuxiliaryLookup = { infinitif: 'descendre', auxiliary: 'être' }
const passer: AuxiliaryLookup = { infinitif: 'passer', auxiliary: 'avoir' }
const rentrer: AuxiliaryLookup = { infinitif: 'rentrer', auxiliary: 'être' }
const retourner: AuxiliaryLookup = { infinitif: 'retourner', auxiliary: 'être' }
const manger: AuxiliaryLookup = { infinitif: 'manger', auxiliary: 'avoir' }
const aller: AuxiliaryLookup = { infinitif: 'aller', auxiliary: 'être' }

describe('chooseAuxiliary — dual-aux verbs', () => {
  it('sortir + transitive → avoir only', () => {
    expect(chooseAuxiliary({ verb: sortir, transitiveContext: 'transitive' })).toEqual({
      accepted: ['avoir'],
      canonical: 'avoir',
      isDual: true,
    })
  })
  it('sortir + intransitive → être only', () => {
    expect(chooseAuxiliary({ verb: sortir, transitiveContext: 'intransitive' })).toEqual({
      accepted: ['être'],
      canonical: 'être',
      isDual: true,
    })
  })
  it('sortir + unknown → both accepted', () => {
    const d = chooseAuxiliary({ verb: sortir, transitiveContext: 'unknown' })
    expect(d.isDual).toBe(true)
    expect(d.accepted).toEqual(['avoir', 'être'])
  })
  it('monter / descendre / passer / rentrer / retourner are all dual', () => {
    for (const v of [monter, descendre, passer, rentrer, retourner]) {
      expect(chooseAuxiliary({ verb: v, transitiveContext: 'unknown' }).isDual).toBe(true)
    }
  })
})

describe('chooseAuxiliary — single-aux verbs', () => {
  it('manger → avoir, not dual', () => {
    expect(chooseAuxiliary({ verb: manger, transitiveContext: 'transitive' })).toEqual({
      accepted: ['avoir'],
      canonical: 'avoir',
      isDual: false,
    })
  })
  it('aller → être, not dual', () => {
    expect(chooseAuxiliary({ verb: aller, transitiveContext: 'intransitive' })).toEqual({
      accepted: ['être'],
      canonical: 'être',
      isDual: false,
    })
  })
  it('missing auxiliary defaults to avoir', () => {
    const r = chooseAuxiliary({
      verb: { infinitif: 'unknownverb', auxiliary: null },
      transitiveContext: 'unknown',
    })
    expect(r).toEqual({ accepted: ['avoir'], canonical: 'avoir', isDual: false })
  })
})

describe('gradeAuxiliary — actual grading', () => {
  it("j'ai sorti la poubelle: avoir is correct (transitive)", () => {
    const r = gradeAuxiliary({
      verb: sortir,
      transitiveContext: 'transitive',
      answer: 'avoir',
    })
    expect(r.correct).toBe(true)
    expect(r.displayAnswer).toBe('avoir')
  })
  it('je suis sorti: être is correct (intransitive)', () => {
    const r = gradeAuxiliary({
      verb: sortir,
      transitiveContext: 'intransitive',
      answer: 'être',
    })
    expect(r.correct).toBe(true)
  })
  it('j’ai sorti hier is wrong (intransitive context expects être)', () => {
    expect(
      gradeAuxiliary({
        verb: sortir,
        transitiveContext: 'intransitive',
        answer: 'avoir',
      }).correct,
    ).toBe(false)
  })
  it('unknown context accepts either', () => {
    expect(
      gradeAuxiliary({ verb: passer, transitiveContext: 'unknown', answer: 'avoir' }).correct,
    ).toBe(true)
    expect(
      gradeAuxiliary({ verb: passer, transitiveContext: 'unknown', answer: 'être' }).correct,
    ).toBe(true)
  })
  it('accent-tolerant: "etre" matches "être"', () => {
    expect(
      gradeAuxiliary({
        verb: sortir,
        transitiveContext: 'intransitive',
        answer: 'etre',
      }).correct,
    ).toBe(true)
  })
  it('non-string answer returns false', () => {
    expect(
      gradeAuxiliary({
        verb: sortir,
        transitiveContext: 'transitive',
        answer: 5 as never,
      }).correct,
    ).toBe(false)
  })
  it('decision is included in the result for hint plumbing', () => {
    const r = gradeAuxiliary({
      verb: sortir,
      transitiveContext: 'unknown',
      answer: 'avoir',
    })
    expect(r.decision.isDual).toBe(true)
    expect(r.decision.accepted).toEqual(['avoir', 'être'])
  })
})
