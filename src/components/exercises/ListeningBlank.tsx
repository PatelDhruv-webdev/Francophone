'use client'

import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useFillInBlank } from './headless/useFillInBlank'
import { Button } from '@/components/ui/button'
import { Volume2, Play, Pause } from 'lucide-react'
import { useState } from 'react'

interface ListeningBlankProps {
  prompt: string
  data: {
    audio_url?: string
    sentence: string
    blanks: string[]
  }
  disabled: boolean
  onSubmit: (answers: string[]) => void
}

const ACCENT_CHARS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ù', 'û', 'î', 'ï', 'ô', 'œ']

function normalize(s: string) {
  return s.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function ListeningBlank({ prompt, data, disabled, onSubmit }: ListeningBlankProps) {
  const { answers, setAnswer, submitted, submit } = useFillInBlank(data.blanks, () => {}, 0, 0)

  const segments = data.sentence.split('___')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'Enter') {
      if (index < data.blanks.length - 1) {
        inputRefs.current[index + 1]?.focus()
      } else if (answers.every((a) => a.trim())) {
        handleCheck()
      }
    }
  }

  function handleCheck() {
    submit()
    onSubmit(answers)
  }

  function isBlankCorrect(index: number): boolean {
    if (!submitted) return true
    return normalize(answers[index] ?? '') === normalize(data.blanks[index] ?? '')
  }

  function handleTTS() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(data.sentence.replace(/___/g, '...'))
    utt.lang = 'fr-FR'
    utt.rate = 0.75
    window.speechSynthesis.speak(utt)
  }

  function toggleAudio() {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-foreground french-text text-lg font-medium">{prompt}</p>

      {/* Audio player */}
      <div className="border-border bg-card flex items-center gap-3 rounded-xl border-2 p-3 shadow-[0_2px_8px_rgba(30,27,22,0.08)]">
        {data.audio_url ? (
          <>
            <audio
              ref={audioRef}
              src={data.audio_url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              preload="metadata"
              className="hidden"
            />
            <button
              onClick={toggleAudio}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#C24E2A] text-white transition-colors hover:bg-[#A03D20]"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
            </button>
            <p className="text-sm text-[#6B6460]">Écoutez et remplissez les blancs</p>
          </>
        ) : (
          <>
            <button
              onClick={handleTTS}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#C24E2A] text-white transition-colors hover:bg-[#A03D20]"
              aria-label="Écouter la phrase"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <p className="text-sm text-[#6B6460]">Écoutez et remplissez les blancs</p>
          </>
        )}
      </div>

      {/* Sentence with blanks */}
      <div
        className="border-border bg-card flex flex-wrap items-center gap-1 rounded-xl border-2 p-4 text-base leading-loose shadow-[0_2px_8px_rgba(30,27,22,0.08)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {segments.map((segment, i) => (
          <span key={i} className="inline-flex flex-wrap items-center gap-1">
            <span className="french-text">{segment}</span>
            {i < data.blanks.length && (
              <span className="inline-flex flex-col items-center gap-0.5">
                <input
                  ref={(el) => {
                    inputRefs.current[i] = el
                  }}
                  type="text"
                  value={answers[i] ?? ''}
                  onChange={(e) => setAnswer(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  disabled={disabled || submitted}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className={cn(
                    'french-text w-28 rounded border-2 px-2 py-1 text-center text-sm',
                    'transition-colors focus:ring-2 focus:ring-[#C24E2A] focus:outline-none',
                    submitted
                      ? isBlankCorrect(i)
                        ? 'border-[#2F7D52] bg-[#E8F5EE] text-[#2F7D52]'
                        : 'border-[#9B2335] bg-[#F9EAEC] text-[#9B2335]'
                      : 'border-border bg-background text-foreground',
                    (disabled || submitted) && 'cursor-not-allowed',
                  )}
                  style={{ fontFamily: 'var(--font-display)' }}
                />
                {submitted && !isBlankCorrect(i) && (
                  <span className="french-text text-xs font-semibold text-[#2F7D52]">
                    {data.blanks[i]}
                  </span>
                )}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Accent helper */}
      <div className="flex flex-wrap gap-1.5">
        {ACCENT_CHARS.map((ch) => (
          <button
            key={ch}
            type="button"
            disabled={disabled || submitted}
            onClick={() => {
              const focused = document.activeElement
              const idx = inputRefs.current.findIndex((r) => r === focused)
              if (idx >= 0) {
                const el = inputRefs.current[idx]!
                const start = el.selectionStart ?? (answers[idx] ?? '').length
                const end = el.selectionEnd ?? (answers[idx] ?? '').length
                const cur = answers[idx] ?? ''
                setAnswer(idx, cur.slice(0, start) + ch + cur.slice(end))
                requestAnimationFrame(() => {
                  el.setSelectionRange(start + 1, start + 1)
                  el.focus()
                })
              }
            }}
            className="border-border bg-card text-foreground h-8 w-8 rounded-lg border text-sm font-medium transition-colors hover:border-[#C24E2A] hover:text-[#C24E2A] disabled:opacity-40"
          >
            {ch}
          </button>
        ))}
      </div>

      <Button
        onClick={handleCheck}
        disabled={answers.some((a) => !a.trim()) || disabled || submitted}
        className="h-12 w-full rounded-xl bg-[#C24E2A] text-base font-semibold text-white hover:bg-[#A03D20]"
      >
        Check
      </Button>
    </div>
  )
}
