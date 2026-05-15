'use client'

import { useFlashCard } from './headless/useFlashCard'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Volume2 } from 'lucide-react'

interface FlashCardProps {
  front: string // French word
  back: string // English translation
  example?: string // French example sentence
  onKnow: () => void
  onAgain: () => void
}

function speakFrench(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'fr-FR'
  window.speechSynthesis.speak(utt)
}

export function FlashCard({ front, back, example, onKnow, onAgain }: FlashCardProps) {
  const { side, isFlipping, flip, reset: resetCard } = useFlashCard()
  const isFlipped = side === 'back'

  function handleKnow() {
    resetCard()
    onKnow()
  }

  function handleAgain() {
    resetCard()
    onAgain()
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 3D flip card */}
      <div className="h-64 w-full max-w-md perspective-[1000px]">
        <div
          onClick={flip}
          className={cn(
            'flashcard relative h-full w-full cursor-pointer transition-transform duration-300',
            isFlipping || isFlipped ? 'flashcard--flipped' : '',
          )}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front face */}
          <div
            className="border-border absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 bg-white p-6 shadow-[0_2px_8px_rgba(30,27,22,0.08)]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p
              className="french-text text-fg text-center text-3xl font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {front}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation()
                speakFrench(front)
              }}
              className="border-border text-muted-foreground hover:border-brand hover:text-brand flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors"
              type="button"
              aria-label="Écouter la prononciation"
            >
              <Volume2 className="h-4 w-4" />
              <span>Écouter</span>
            </button>
            <p className="text-fg-muted mt-2 text-xs">Cliquez pour révéler</p>
          </div>

          {/* Back face */}
          <div
            className="border-brand/30 absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 bg-[#F5E8E3] p-6 shadow-[0_2px_8px_rgba(30,27,22,0.08)]"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p
              className="text-fg text-center text-2xl font-semibold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {back}
            </p>
            {example && (
              <p
                className="french-text text-fg-muted text-center text-sm leading-relaxed italic"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {example}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rating buttons — visible only on back */}
      <div
        className={cn(
          'flex w-full max-w-md gap-3 transition-opacity duration-200',
          side === 'back' ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <Button
          onClick={handleAgain}
          variant="outline"
          className="h-12 flex-1 rounded-xl border-2 border-[#9B2335] font-semibold text-[#9B2335] hover:border-[#9B2335] hover:bg-[#F9EAEC]"
        >
          À revoir ↩
        </Button>
        <Button
          onClick={handleKnow}
          className="h-12 flex-1 rounded-xl bg-[#2F7D52] font-semibold text-white hover:bg-[#256642]"
        >
          Je savais ✓
        </Button>
      </div>
    </div>
  )
}
