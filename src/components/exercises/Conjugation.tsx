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
        Conjuguez <strong className="french-text text-[#C24E2A]">{data.verb}</strong> avec{' '}
        <strong className="french-text text-[#C24E2A]">{data.subject}</strong> au{' '}
        <strong className="text-[#C24E2A]">{data.tense}</strong>
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
              'focus-visible:border-[#C24E2A] focus-visible:ring-0',
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
            className="border-border text-muted-foreground flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:border-[#C24E2A] hover:text-[#C24E2A]"
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
            className="border-border bg-card text-foreground h-8 w-8 rounded-lg border text-sm font-medium transition-colors hover:border-[#C24E2A] hover:text-[#C24E2A] disabled:opacity-40"
          >
            {ch}
          </button>
        ))}
      </div>

      <Button
        onClick={() => onSubmit(answer)}
        disabled={!value.trim() || disabled}
        className="h-12 w-full rounded-xl bg-[#C24E2A] text-base font-semibold text-white hover:bg-[#A03D20]"
      >
        Check
      </Button>
    </div>
  )
}
