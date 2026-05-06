import { describe, it, expect } from 'vitest'
import { normalize, normalizeSoft, stripAccents } from '@/lib/grading/normalizer'
import {
  gradeMultipleChoice,
  gradeTypeAnswer,
  gradeFillInBlank,
  gradeWordOrder,
  gradeMatchPairs,
} from '@/lib/grading/graders'
import { grade } from '@/lib/grading'

// ─── Normalizer ──────────────────────────────────────────────────────────────

describe('normalize', () => {
  it('strips common French accents', () => {
    expect(normalize('éèêë')).toBe('eeee')
    expect(normalize('àâä')).toBe('aaa')
    expect(normalize('îï')).toBe('ii')
    expect(normalize('ôö')).toBe('oo')
    expect(normalize('ùûü')).toBe('uuu')
  })
  it('handles ç → c', () => expect(normalize('ça')).toBe('ca'))
  it('handles œ → oe', () => expect(normalize('cœur')).toBe('coeur'))
  it('handles Œ → OE then lowercased to oe', () => expect(normalize('Œuvre')).toBe('oeuvre'))
  it('handles æ → ae', () => expect(normalize('æ')).toBe('ae'))
  it('handles Æ → AE then lowercased to ae', () => expect(normalize('Æ')).toBe('ae'))
  it('handles ñ → n', () => expect(normalize('niño')).toBe('nino'))
  it('lowercases', () => expect(normalize('Bonjour')).toBe('bonjour'))
  it('trims leading/trailing whitespace', () => expect(normalize('  hello  ')).toBe('hello'))
  it('collapses multiple spaces', () => expect(normalize('a  b   c')).toBe('a b c'))
  // Edge cases
  it('returns empty string for empty input', () => expect(normalize('')).toBe(''))
  it('returns empty string for whitespace-only', () => expect(normalize('   ')).toBe(''))
  it('collapses tabs to spaces', () => expect(normalize('a\tb')).toBe('a b'))
  it('collapses newlines to spaces', () => expect(normalize('a\nb')).toBe('a b'))
  it('preserves numbers', () => expect(normalize('vingt-deux 22')).toBe('vingt-deux 22'))
  it('preserves punctuation (apostrophe)', () => expect(normalize("c'est")).toBe("c'est"))
  it('preserves punctuation (hyphen)', () => expect(normalize('arc-en-ciel')).toBe('arc-en-ciel'))
  it('handles fully-accented word', () => expect(normalize('étudier')).toBe('etudier'))
  it('handles mixed accented and plain chars', () =>
    expect(normalize('boulangère')).toBe('boulangere'))
  it('handles non-French ASCII passthrough', () =>
    expect(normalize('hello world')).toBe('hello world'))
})

describe('normalizeSoft', () => {
  it('lowercases without stripping accents', () => expect(normalizeSoft('Étudier')).toBe('étudier'))
  it('trims whitespace', () => expect(normalizeSoft('  bonjour  ')).toBe('bonjour'))
  it('collapses spaces', () => expect(normalizeSoft('a  b')).toBe('a b'))
  it('keeps accents intact', () => expect(normalizeSoft('café')).toBe('café'))
})

describe('stripAccents', () => {
  it('leaves non-accented chars unchanged', () => expect(stripAccents('hello')).toBe('hello'))
  it('preserves case when stripping lowercase', () => expect(stripAccents('é')).toBe('e'))
  it('preserves case when stripping uppercase É → E', () => expect(stripAccents('É')).toBe('E'))
  it('preserves case when stripping uppercase À → A', () => expect(stripAccents('À')).toBe('A'))
  it('preserves case when stripping uppercase Ç → C', () => expect(stripAccents('Ç')).toBe('C'))
  it('uppercase Œ → OE (multi-char expansion)', () => expect(stripAccents('Œ')).toBe('OE'))
  it('lowercase œ → oe', () => expect(stripAccents('œ')).toBe('oe'))
  it('handles mixed-case word Éléphant', () => expect(stripAccents('Éléphant')).toBe('Elephant'))
  it('does not alter empty string', () => expect(stripAccents('')).toBe(''))
  it('does not alter pure ASCII', () => expect(stripAccents('abc123')).toBe('abc123'))
})

// ─── Multiple choice grader ───────────────────────────────────────────────────

describe('gradeMultipleChoice', () => {
  it('correct when selected index matches', () => {
    expect(gradeMultipleChoice(2, 2).correct).toBe(true)
  })
  it('incorrect when selected index differs', () => {
    expect(gradeMultipleChoice(1, 2).correct).toBe(false)
  })
  it('returns displayAnswer as string of correct index', () => {
    expect(gradeMultipleChoice(0, 3).displayAnswer).toBe('3')
  })
  // Edge cases
  it('index 0 is correct when correctIndex is 0 (falsy trap)', () => {
    expect(gradeMultipleChoice(0, 0).correct).toBe(true)
  })
  it('index 0 is wrong when correctIndex is 1', () => {
    expect(gradeMultipleChoice(0, 1).correct).toBe(false)
  })
  it('string answer does not equal numeric correct (type-strict)', () => {
    // Answers arriving as string '2' should not match number 2
    expect(gradeMultipleChoice('2' as unknown as number, 2).correct).toBe(false)
  })
  it('null answer is incorrect', () => {
    expect(gradeMultipleChoice(null as unknown as number, 1).correct).toBe(false)
  })
  it('works for large indices', () => {
    expect(gradeMultipleChoice(99, 99).correct).toBe(true)
    expect(gradeMultipleChoice(98, 99).correct).toBe(false)
  })
})

// ─── TypeAnswer grader ────────────────────────────────────────────────────────

describe('gradeTypeAnswer', () => {
  it('exact match is correct', () => {
    expect(gradeTypeAnswer('bonjour', 'bonjour').correct).toBe(true)
  })
  it('case insensitive by default', () => {
    expect(gradeTypeAnswer('Bonjour', 'bonjour').correct).toBe(true)
    expect(gradeTypeAnswer('BONJOUR', 'bonjour').correct).toBe(true)
  })
  it('accent tolerant by default: é matches e', () => {
    expect(gradeTypeAnswer('etudier', 'étudier').correct).toBe(true)
  })
  it('accent tolerant: ça → ca', () => {
    expect(gradeTypeAnswer('ca va', 'ça va').correct).toBe(true)
  })
  it('accent tolerant: correct has accent, answer does not', () => {
    expect(gradeTypeAnswer('boulangere', 'boulangère').correct).toBe(true)
  })
  it('accent tolerant: both have accent — still correct', () => {
    expect(gradeTypeAnswer('étudier', 'étudier').correct).toBe(true)
  })
  it('incorrect on completely wrong answer', () => {
    expect(gradeTypeAnswer('chat', 'chien').correct).toBe(false)
  })
  it('trims whitespace before comparing', () => {
    expect(gradeTypeAnswer('  bonjour  ', 'bonjour').correct).toBe(true)
  })
  it('collapses internal spaces', () => {
    expect(gradeTypeAnswer('je  suis', 'je suis').correct).toBe(true)
  })
  it('case sensitive mode: Bonjour ≠ bonjour', () => {
    expect(gradeTypeAnswer('Bonjour', 'bonjour', { caseSensitive: true }).correct).toBe(false)
  })
  it('case sensitive mode: exact case match', () => {
    expect(gradeTypeAnswer('Bonjour', 'Bonjour', { caseSensitive: true }).correct).toBe(true)
  })
  it('accent strict mode: e ≠ é', () => {
    expect(gradeTypeAnswer('etudier', 'étudier', { accentTolerant: false }).correct).toBe(false)
  })
  it('accent strict + case insensitive: Étudier === étudier', () => {
    expect(
      gradeTypeAnswer('Étudier', 'étudier', { caseSensitive: false, accentTolerant: false })
        .correct,
    ).toBe(true)
  })
  it('case sensitive + accent tolerant: E matches é but case differs → wrong', () => {
    // 'E' vs 'e' — accent stripped from both → 'E' vs 'e', case preserved → no match
    expect(gradeTypeAnswer('E', 'é', { caseSensitive: true, accentTolerant: true }).correct).toBe(
      false,
    )
  })
  it('empty string answer does not match a non-empty correct answer', () => {
    expect(gradeTypeAnswer('', 'bonjour').correct).toBe(false)
  })
  it('empty string matches empty correct answer', () => {
    expect(gradeTypeAnswer('', '').correct).toBe(true)
  })
  it('non-string answer returns false without throwing', () => {
    expect(gradeTypeAnswer(42 as unknown as string, 'bonjour').correct).toBe(false)
  })
  it('array answer returns false without throwing', () => {
    expect(gradeTypeAnswer(['bonjour'] as unknown as string, 'bonjour').correct).toBe(false)
  })
  it('displays correct answer when wrong', () => {
    expect(gradeTypeAnswer('chat', 'chien').displayAnswer).toBe('chien')
  })
  it('displays correct answer even when right', () => {
    expect(gradeTypeAnswer('chat', 'chat').displayAnswer).toBe('chat')
  })
  // French-specific apostrophe and hyphen
  it("apostrophe in answer preserved: c'est matches c'est", () => {
    expect(gradeTypeAnswer("c'est", "c'est").correct).toBe(true)
  })
  it('hyphenated answer: arc-en-ciel', () => {
    expect(gradeTypeAnswer('arc-en-ciel', 'arc-en-ciel').correct).toBe(true)
  })
})

// ─── FillInBlank grader ───────────────────────────────────────────────────────

describe('gradeFillInBlank', () => {
  it('all blanks correct', () => {
    expect(gradeFillInBlank(['je', 'suis'], ['je', 'suis']).correct).toBe(true)
  })
  it('one blank wrong out of two', () => {
    expect(gradeFillInBlank(['je', 'es'], ['je', 'suis']).correct).toBe(false)
  })
  it('all blanks wrong', () => {
    expect(gradeFillInBlank(['tu', 'es'], ['je', 'suis']).correct).toBe(false)
  })
  it('length mismatch (too few) is wrong', () => {
    expect(gradeFillInBlank(['je'], ['je', 'suis']).correct).toBe(false)
  })
  it('length mismatch (too many) is wrong', () => {
    expect(gradeFillInBlank(['je', 'suis', 'extra'], ['je', 'suis']).correct).toBe(false)
  })
  it('accent tolerant', () => {
    expect(gradeFillInBlank(['etudier'], ['étudier']).correct).toBe(true)
  })
  it('single blank correct', () => {
    expect(gradeFillInBlank(['suis'], ['suis']).correct).toBe(true)
  })
  it('single blank wrong', () => {
    expect(gradeFillInBlank(['es'], ['suis']).correct).toBe(false)
  })
  it('empty correct answer array', () => {
    // An empty sentence with no blanks — any non-array answer is wrong
    expect(gradeFillInBlank([], []).correct).toBe(true)
  })
  it('non-array answer returns false', () => {
    expect(gradeFillInBlank('je' as unknown as string[], ['je']).correct).toBe(false)
  })
  it('array with number returns false (not all strings)', () => {
    expect(gradeFillInBlank([1 as unknown as string], ['1']).correct).toBe(false)
  })
  it('returns display answer joined with / on length mismatch', () => {
    expect(gradeFillInBlank(['je'], ['a', 'b']).displayAnswer).toBe('a / b')
  })
  it('returns display answer joined with / on content mismatch', () => {
    expect(gradeFillInBlank(['x', 'y'], ['a', 'b']).displayAnswer).toBe('a / b')
  })
  it('returns display answer joined with / on success too', () => {
    expect(gradeFillInBlank(['a', 'b'], ['a', 'b']).displayAnswer).toBe('a / b')
  })
  it('case insensitive', () => {
    expect(gradeFillInBlank(['JE'], ['je']).correct).toBe(true)
  })
  it('whitespace trimmed in blanks', () => {
    expect(gradeFillInBlank([' suis '], ['suis']).correct).toBe(true)
  })
})

// ─── WordOrder grader ─────────────────────────────────────────────────────────

describe('gradeWordOrder', () => {
  it('correct when token order matches', () => {
    expect(gradeWordOrder(['je', 'suis', 'étudiant'], ['je', 'suis', 'étudiant']).correct).toBe(
      true,
    )
  })
  it('incorrect when order differs', () => {
    expect(gradeWordOrder(['suis', 'je', 'étudiant'], ['je', 'suis', 'étudiant']).correct).toBe(
      false,
    )
  })
  it('accent tolerant', () => {
    expect(gradeWordOrder(['je', 'suis', 'etudiant'], ['je', 'suis', 'étudiant']).correct).toBe(
      true,
    )
  })
  it('single token correct', () => {
    expect(gradeWordOrder(['bonjour'], ['bonjour']).correct).toBe(true)
  })
  it('single token wrong', () => {
    expect(gradeWordOrder(['bonsoir'], ['bonjour']).correct).toBe(false)
  })
  it('empty arrays are equal', () => {
    expect(gradeWordOrder([], []).correct).toBe(true)
  })
  it('extra token in answer is wrong', () => {
    expect(gradeWordOrder(['je', 'suis', 'bien', 'extra'], ['je', 'suis', 'bien']).correct).toBe(
      false,
    )
  })
  it('missing token in answer is wrong', () => {
    expect(gradeWordOrder(['je', 'suis'], ['je', 'suis', 'étudiant']).correct).toBe(false)
  })
  it('non-array answer returns false', () => {
    expect(gradeWordOrder('je suis' as unknown as string[], ['je', 'suis']).correct).toBe(false)
  })
  it('display answer is tokens joined by space', () => {
    expect(gradeWordOrder([], ['a', 'b']).displayAnswer).toBe('a b')
  })
  it('display answer uses correct tokens, not answer tokens', () => {
    expect(gradeWordOrder(['b', 'a'], ['a', 'b']).displayAnswer).toBe('a b')
  })
  it('duplicate tokens: same word twice, order matters', () => {
    expect(gradeWordOrder(['pas', 'pas'], ['pas', 'pas']).correct).toBe(true)
    expect(gradeWordOrder(['pas'], ['pas', 'pas']).correct).toBe(false)
  })
})

// ─── MatchPairs grader ────────────────────────────────────────────────────────

describe('gradeMatchPairs', () => {
  it('all pairs correct', () => {
    expect(gradeMatchPairs({ '0': 2, '1': 0 }, { '0': 2, '1': 0 }).correct).toBe(true)
  })
  it('one pair wrong', () => {
    expect(gradeMatchPairs({ '0': 1, '1': 0 }, { '0': 2, '1': 0 }).correct).toBe(false)
  })
  it('all pairs wrong', () => {
    expect(gradeMatchPairs({ '0': 1, '1': 2 }, { '0': 2, '1': 0 }).correct).toBe(false)
  })
  it('non-object answer returns false', () => {
    expect(gradeMatchPairs('wrong' as unknown as Record<string, number>, { '0': 0 }).correct).toBe(
      false,
    )
  })
  it('array answer returns false', () => {
    expect(gradeMatchPairs([0] as unknown as Record<string, number>, { '0': 0 }).correct).toBe(
      false,
    )
  })
  it('empty pairs are trivially correct', () => {
    expect(gradeMatchPairs({}, {}).correct).toBe(true)
  })
  it('extra keys in answer do not affect result (only correct_answer keys checked)', () => {
    expect(gradeMatchPairs({ '0': 2, '1': 0, '99': 5 }, { '0': 2, '1': 0 }).correct).toBe(true)
  })
})

// ─── Central grade dispatcher ─────────────────────────────────────────────────

describe('grade dispatcher', () => {
  // Covered types
  it('routes multiple_choice correctly', () => {
    expect(grade({ type: 'multiple_choice', correct_answer: 1, answer: 1 }).correct).toBe(true)
    expect(grade({ type: 'multiple_choice', correct_answer: 1, answer: 2 }).correct).toBe(false)
  })
  it('routes picture_choice like multiple_choice', () => {
    expect(grade({ type: 'picture_choice', correct_answer: 0, answer: 0 }).correct).toBe(true)
    expect(grade({ type: 'picture_choice', correct_answer: 0, answer: 1 }).correct).toBe(false)
  })
  it('routes type_answer correctly', () => {
    expect(grade({ type: 'type_answer', correct_answer: 'chat', answer: 'chat' }).correct).toBe(
      true,
    )
    expect(grade({ type: 'type_answer', correct_answer: 'chat', answer: 'chien' }).correct).toBe(
      false,
    )
  })
  it('routes conjugation like type_answer', () => {
    expect(grade({ type: 'conjugation', correct_answer: 'suis', answer: 'suis' }).correct).toBe(
      true,
    )
    expect(grade({ type: 'conjugation', correct_answer: 'suis', answer: 'est' }).correct).toBe(
      false,
    )
  })
  it('routes fill_in_blank with array correct_answer', () => {
    expect(
      grade({ type: 'fill_in_blank', correct_answer: ['je', 'vais'], answer: ['je', 'vais'] })
        .correct,
    ).toBe(true)
    expect(
      grade({ type: 'fill_in_blank', correct_answer: ['je', 'vais'], answer: ['tu', 'vais'] })
        .correct,
    ).toBe(false)
  })
  it('routes word_order with array correct_answer', () => {
    expect(
      grade({
        type: 'word_order',
        correct_answer: ['il', 'est', 'grand'],
        answer: ['il', 'est', 'grand'],
      }).correct,
    ).toBe(true)
    expect(
      grade({
        type: 'word_order',
        correct_answer: ['il', 'est', 'grand'],
        answer: ['grand', 'est', 'il'],
      }).correct,
    ).toBe(false)
  })
  it('routes listening_blank like fill_in_blank', () => {
    expect(
      grade({ type: 'listening_blank', correct_answer: ['bonjour'], answer: ['bonjour'] }).correct,
    ).toBe(true)
  })
  it('routes speaking_repeat like type_answer', () => {
    expect(
      grade({ type: 'speaking_repeat', correct_answer: 'bonjour', answer: 'bonjour' }).correct,
    ).toBe(true)
  })
  it('routes reading_comprehension like multiple_choice', () => {
    expect(grade({ type: 'reading_comprehension', correct_answer: 2, answer: 2 }).correct).toBe(
      true,
    )
    expect(grade({ type: 'reading_comprehension', correct_answer: 2, answer: 1 }).correct).toBe(
      false,
    )
  })
  it('routes match_pairs', () => {
    expect(
      grade({ type: 'match_pairs', correct_answer: { '0': 1 }, answer: { '0': 1 } }).correct,
    ).toBe(true)
  })
  // Type-coercion in dispatcher
  it('multiple_choice with string correct_answer "2" coerces to 2', () => {
    expect(grade({ type: 'multiple_choice', correct_answer: '2', answer: 2 }).correct).toBe(true)
  })
  it('word_order with string correct_answer falls back to space split', () => {
    expect(
      grade({ type: 'word_order', correct_answer: 'je suis', answer: ['je', 'suis'] }).correct,
    ).toBe(true)
  })
  it('fill_in_blank with non-array correct_answer wraps in array', () => {
    expect(grade({ type: 'fill_in_blank', correct_answer: 'suis', answer: ['suis'] }).correct).toBe(
      true,
    )
  })
  // Default / unknown type
  it('unknown type returns incorrect without throwing', () => {
    const r = grade({
      type: 'nonexistent_type' as unknown as 'multiple_choice',
      correct_answer: 'x',
      answer: 'x',
    })
    expect(r.correct).toBe(false)
  })
  // Index-0 correctness in dispatcher
  it('multiple_choice correct_answer 0 is correct when answer is 0', () => {
    expect(grade({ type: 'multiple_choice', correct_answer: 0, answer: 0 }).correct).toBe(true)
  })
})
