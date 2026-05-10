'use client'

import { useRef, useEffect } from 'react'
import { useTypeAnswer } from './headless/useTypeAnswer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { TypeAnswerData, ConjugationData } from '@/types/exercises'

interface TypeAnswerProps {
  prompt: string
  data: TypeAnswerData | ConjugationData
  disabled: boolean
  onSubmit: (answer: string) => void
}

// French accent helper characters — displayed below the input on mobile
const ACCENT_CHARS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ù', 'û', 'î', 'ï', 'ô', 'œ']

export function TypeAnswer({ prompt, data, disabled, onSubmit }: TypeAnswerProps) {
  const { value, onChange, answer } = useTypeAnswer()
  const inputRef = useRef<HTMLInputElement>(null)

  const hint = 'hint' in data ? data.hint : undefined

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && value.trim()) {
      onSubmit(answer)
    }
  }

  function insertChar(ch: string) {
    const el = inputRef.current
    if (!el) return
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = value.slice(0, start) + ch + value.slice(end)
    onChange(next)
    // Restore cursor after the inserted char
    requestAnimationFrame(() => {
      el.setSelectionRange(start + 1, start + 1)
      el.focus()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-foreground french-text text-lg font-medium">{prompt}</p>

      {hint && <p className="text-muted-foreground text-sm italic">Hint: {hint}</p>}

      <div className="flex flex-col gap-2">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Type your answer…"
          className="french-text focus-visible:border-brand h-12 rounded-xl border-2 text-base focus-visible:ring-0"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />

        {/* Accent helper row */}
        <div className="flex flex-wrap gap-1.5">
          {ACCENT_CHARS.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => insertChar(ch)}
              disabled={disabled}
              className="border-border bg-card text-foreground hover:border-brand hover:text-brand h-8 w-8 rounded-lg border text-sm font-medium transition-colors disabled:opacity-40"
            >
              {ch}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={() => onSubmit(answer)}
        disabled={!value.trim() || disabled}
        className="bg-brand hover:bg-brand-dark h-12 w-full rounded-xl text-base font-semibold text-white"
      >
        Check
      </Button>
    </div>
  )
}
