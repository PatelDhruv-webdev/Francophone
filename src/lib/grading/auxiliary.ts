// Phase 2.5 — Auxiliary disambiguation for dual-aux verbs.
//
// Source: data/source/grammar_edge_cases.md §4.
// Six verbs take BOTH avoir and être depending on transitivity:
//   sortir, monter, descendre, passer, rentrer, retourner
//
//   Transitive (with direct object) → avoir
//     J'ai sorti la poubelle.
//   Intransitive (no direct object) → être
//     Je suis sorti hier.
//
// The grader can't do NLP on the prompt, so the caller passes a
// transitiveContext flag derived from the exercise data. When the caller
// can't determine transitivity ('unknown'), both auxiliaries are accepted
// and a hint is recommended (assembled by 2.7).

import { normalizeForGrading } from './normalizer'
import type { GradeResult } from './graders'
import type { UserAnswer } from '@/types/exercises'

export type Auxiliary = 'avoir' | 'être'
export type TransitiveContext = 'transitive' | 'intransitive' | 'unknown'

// Verbs from §4 that take both auxiliaries depending on transitivity.
const DUAL_AUX_VERBS: ReadonlySet<string> = new Set([
  'sortir',
  'monter',
  'descendre',
  'passer',
  'rentrer',
  'retourner',
])

export interface AuxiliaryLookup {
  infinitif: string
  // Single-aux verbs have 'avoir' or 'être'. Dual-aux verbs may have either
  // stored (the importer typically picks the more common one); we override
  // based on transitivity below.
  auxiliary: Auxiliary | string | null
}

export interface AuxiliaryDecision {
  accepted: readonly Auxiliary[]
  canonical: Auxiliary
  isDual: boolean
}

export function chooseAuxiliary({
  verb,
  transitiveContext,
}: {
  verb: AuxiliaryLookup
  transitiveContext: TransitiveContext
}): AuxiliaryDecision {
  const isDual = DUAL_AUX_VERBS.has(verb.infinitif.toLowerCase())
  if (isDual) {
    if (transitiveContext === 'transitive') {
      return { accepted: ['avoir'], canonical: 'avoir', isDual: true }
    }
    if (transitiveContext === 'intransitive') {
      return { accepted: ['être'], canonical: 'être', isDual: true }
    }
    // unknown — accept either; canonical defaults to the verb's stored aux
    // when it's one of the two, else avoir.
    const stored = verb.auxiliary as Auxiliary | null
    const canonical: Auxiliary = stored === 'avoir' || stored === 'être' ? stored : 'avoir'
    return { accepted: ['avoir', 'être'], canonical, isDual: true }
  }
  // Single-aux verb — defer to the stored value. If somehow missing, fall
  // back to avoir (90%+ of verbs).
  const single: Auxiliary =
    verb.auxiliary === 'avoir' || verb.auxiliary === 'être'
      ? (verb.auxiliary as Auxiliary)
      : 'avoir'
  return { accepted: [single], canonical: single, isDual: false }
}

export interface GradeAuxiliaryInput {
  verb: AuxiliaryLookup
  transitiveContext: TransitiveContext
  answer: UserAnswer
}

export function gradeAuxiliary({
  verb,
  transitiveContext,
  answer,
}: GradeAuxiliaryInput): GradeResult & { decision: AuxiliaryDecision } {
  const decision = chooseAuxiliary({ verb, transitiveContext })
  if (typeof answer !== 'string') {
    return { correct: false, displayAnswer: decision.canonical, decision }
  }
  const prepped = normalizeForGrading(answer)
  const correct = decision.accepted.some((aux) => normalizeForGrading(aux) === prepped)
  return { correct, displayAnswer: decision.canonical, decision }
}
