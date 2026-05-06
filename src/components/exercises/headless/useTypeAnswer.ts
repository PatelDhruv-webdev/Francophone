'use client'

import { useState, useCallback } from 'react'

interface UseTypeAnswerReturn {
  value: string
  onChange: (v: string) => void
  reset: () => void
  answer: string
}

export function useTypeAnswer(): UseTypeAnswerReturn {
  const [value, setValue] = useState('')

  const onChange = useCallback((v: string) => setValue(v), [])
  const reset = useCallback(() => setValue(''), [])

  return { value, onChange, reset, answer: value }
}
