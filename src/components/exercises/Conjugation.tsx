'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTypeAnswer } from './headless/useTypeAnswer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Volume2 } from 'lucide-react'

interface ConjugationProps {
  prompt?: string
  data: {
    verb: string
    subject: string
    tense: string
  }
  disabled: boolean
  /** correctAnswer is provided after submit for TTS */
  correctAnswer?: string
  onSubmit: (answer: string) => void
}

const ACCENT_CHARS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ù', 'û', 'î', 'ï', 'ô', 'œ']

function speakFrench(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'fr-FR'
  window.speechSynthesis.speak(utt)
}

export function Conjugation({ data, disabled, correctAnswer, onSubmit }: ConjugationProps) {
  const { value, onChange, answer } = useTypeAnswer()
  const inputRef = useRef<HTMLInputElement>(null)

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
    requestAnimationFrame(() => {
      el.setSelectionRange(start + 1, start + 1)
      el.focus()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt */}
      <p className="text-foreground text-lg font-medium">
        Conjuguez <strong className="french-text text-brand">{data.verb}</strong> avec{' '}
        <strong className="french-text text-brand">{data.subject}</strong> au{' '}
        <strong className="text-brand">{data.tense}</strong>
      </p>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-full max-w-xs">
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Votre réponse…"
            className={cn(
              'french-text h-14 rounded-xl border-2 text-center text-xl',
              'focus-visible:border-brand focus-visible:ring-0',
            )}
            style={{ fontFamily: 'var(--font-display)' }}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>

        {/* TTS button for correct answer — shown only after submit when correctAnswer is provided */}
        {disabled && correctAnswer && (
          <button
            onClick={() => speakFrench(correctAnswer)}
            className="border-border text-muted-foreground hover:border-brand hover:text-brand flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
            type="button"
            aria-label="Écouter la réponse correcte"
          >
            <Volume2 className="h-4 w-4" />
            <span className="french-text">{correctAnswer}</span>
          </button>
        )}
      </div>

      {/* Accent helper */}
      <div className="flex flex-wrap justify-center gap-1.5">
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
