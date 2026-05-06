'use client'

import { useState, useCallback } from 'react'

export interface UseFillInBlankReturn {
  answers: string[]
  setAnswer: (index: number, value: string) => void
  submitted: boolean
  correct: boolean
  submit: () => void
  reset: () => void
}

/** Strip accents via NFD decomposition then remove combining marks */
function normalize(str: string): string {
  return str.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function useFillInBlank(
  blanks: string[],
  onResult: (correct: boolean, xp: number) => void,
  xpCorrect: number,
  xpAttempted: number,
): UseFillInBlankReturn {
  const [answers, setAnswers] = useState<string[]>(() => blanks.map(() => ''))
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)

  const setAnswer = useCallback((index: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  const submit = useCallback(() => {
    const allCorrect = blanks.every((blank, i) => normalize(answers[i] ?? '') === normalize(blank))
    setSubmitted(true)
    setCorrect(allCorrect)
    onResult(allCorrect, allCorrect ? xpCorrect : xpAttempted)
  }, [answers, blanks, onResult, xpCorrect, xpAttempted])

  const reset = useCallback(() => {
    setAnswers(blanks.map(() => ''))
    setSubmitted(false)
    setCorrect(false)
  }, [blanks])

  return { answers, setAnswer, submitted, correct, submit, reset }
}
