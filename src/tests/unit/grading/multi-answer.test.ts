import { describe, it, expect } from 'vitest'
import { gradeFillInBlank, gradeTypeAnswer } from '@/lib/grading/graders'
import { grade } from '@/lib/grading'

// Phase 2.2 — gradeTypeAnswer + gradeFillInBlank accept `string | string[]`
// (any-of). Backwards-compatible with the existing single-string callers.

describe('gradeTypeAnswer — multi-variant accepted answers', () => {
  it('accepts the canonical variant', () => {
    expect(gradeTypeAnswer('connaître', ['connaître', 'connaitre']).correct).toBe(true)
  })
  it('accepts a non-canonical variant', () => {
    expect(gradeTypeAnswer('connaitre', ['connaître', 'connaitre']).correct).toBe(true)
  })
  it('rejects an answer that matches no variant', () => {
    expect(gradeTypeAnswer('connaitté', ['connaître', 'connaitre']).correct).toBe(false)
  })
  it('displayAnswer is the canonical (first) variant', () => {
    expect(gradeTypeAnswer('xxx', ['connaître', 'connaitre']).displayAnswer).toBe('connaître')
  })
  it('single-string variant list still works', () => {
    expect(gradeTypeAnswer('chat', ['chat']).correct).toBe(true)
    expect(gradeTypeAnswer('chien', ['chat']).correct).toBe(false)
  })
  it('case-insensitive across variants', () => {
    expect(gradeTypeAnswer('CONNAITRE', ['connaître', 'connaitre']).correct).toBe(true)
  })
  it('accent-tolerant: stripped answer matches accented variant', () => {
    expect(gradeTypeAnswer('connaitre', ['connaître']).correct).toBe(true)
  })
  it('empty variant list rejects', () => {
    expect(gradeTypeAnswer('anything', []).correct).toBe(false)
  })
  it('comma-separated string is NOT split — we expect explicit arrays', () => {
    // "a,b" is treated as the literal string "a,b", not as variants
    expect(gradeTypeAnswer('a', 'a,b').correct).toBe(false)
    expect(gradeTypeAnswer('a,b', 'a,b').correct).toBe(true)
  })
})

describe('gradeFillInBlank — per-blank variants', () => {
  it('plain string blanks: backwards compat', () => {
    expect(gradeFillInBlank(['je', 'suis'], ['je', 'suis']).correct).toBe(true)
  })
  it('one blank with variants — matches first variant', () => {
    expect(gradeFillInBlank(['j’ai'], [["j'ai", 'jai']]).correct).toBe(true)
  })
  it('one blank with variants — matches second variant', () => {
    expect(gradeFillInBlank(['jai'], [["j'ai", 'jai']]).correct).toBe(true)
  })
  it('one blank with variants — rejects non-variant', () => {
    expect(gradeFillInBlank(['je suis'], [["j'ai", 'jai']]).correct).toBe(false)
  })
  it('mixed plain + variant blanks', () => {
    expect(
      gradeFillInBlank(['nous', 'connaitre'], ['nous', ['connaître', 'connaitre']]).correct,
    ).toBe(true)
  })
  it('displayAnswer joins canonical forms with /', () => {
    const r = gradeFillInBlank(['x', 'y'], ['je', ['connaître', 'connaitre']])
    expect(r.displayAnswer).toBe('je / connaître')
  })
})

describe('grade dispatcher — string[] vs string for type_answer', () => {
  it('string correct_answer continues to work', () => {
    expect(grade({ type: 'type_answer', correct_answer: 'chat', answer: 'chat' }).correct).toBe(
      true,
    )
  })
  it('array correct_answer accepts any variant', () => {
    expect(
      grade({
        type: 'type_answer',
        correct_answer: ['connaître', 'connaitre'],
        answer: 'connaitre',
      }).correct,
    ).toBe(true)
  })
  it('conjugation also accepts variants', () => {
    expect(
      grade({
        type: 'conjugation',
        correct_answer: ['mangeons', 'mangons'],
        answer: 'mangeons',
      }).correct,
    ).toBe(true)
  })
})

describe('grade dispatcher — fill_in_blank with per-blank variants', () => {
  it('per-blank variants resolved through dispatcher', () => {
    expect(
      grade({
        type: 'fill_in_blank',
        correct_answer: ['je', ['connaître', 'connaitre']],
        answer: ['je', 'connaitre'],
      }).correct,
    ).toBe(true)
  })
  it('listening_blank also accepts variants', () => {
    expect(
      grade({
        type: 'listening_blank',
        correct_answer: [['bonjour', 'bonjours']],
        answer: ['bonjour'],
      }).correct,
    ).toBe(true)
  })
})
