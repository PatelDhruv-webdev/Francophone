'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useMultipleChoice } from './headless/useMultipleChoice'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { PictureChoiceData } from '@/types/exercises'

interface PictureChoiceProps {
  prompt: string
  data: PictureChoiceData & {
    /** Per-option image URLs; if absent, falls back to the top-level image_url */
    image_urls?: string[]
  }
  disabled: boolean
  /** correctIndex is the index of the correct option, provided after submit */
  correctIndex?: number | null
  onSubmit: (answer: number) => void
}

export function PictureChoice({
  prompt,
  data,
  disabled,
  correctIndex,
  onSubmit,
}: PictureChoiceProps) {
  const { selected, select } = useMultipleChoice()
  const { options } = data
  // Per-option image URLs take priority; fall back to the single image_url for all options
  const image_urls: (string | undefined)[] = data.image_urls ?? options.map(() => data.image_url)

  const isSubmitted = correctIndex != null
  const questionText = prompt

  function handleSubmit() {
    if (selected === null) return
    onSubmit(selected)
  }

  function getCardState(i: number) {
    if (!isSubmitted) {
      return selected === i ? 'selected' : 'idle'
    }
    if (i === correctIndex) return 'correct'
    if (i === selected && i !== correctIndex) return 'wrong'
    return 'idle'
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt / question */}
      <p className="text-foreground french-text text-lg font-medium">{questionText}</p>

      {/* 2×2 grid of picture cards */}
      <div className="grid grid-cols-2 gap-3">
        {options.map((option, i) => {
          const state = getCardState(i)
          const imageUrl = image_urls?.[i]

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => !isSubmitted && select(i)}
              className={cn(
                'relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-center',
                'cursor-pointer text-sm font-medium transition-all duration-150',
                'focus-visible:ring-2 focus-visible:ring-[#C24E2A] focus-visible:outline-none',
                state === 'selected' && 'border-[#C24E2A] bg-[#FAF0EC]',
                state === 'correct' && 'border-[#2F7D52] bg-[#E8F5EE]',
                state === 'wrong' && 'border-[#9B2335] bg-[#F9EAEC]',
                state === 'idle' &&
                  'border-border bg-card hover:border-[#C24E2A]/40 hover:bg-[#F5E8E3]/30',
                disabled && 'cursor-not-allowed opacity-60',
              )}
            >
              {/* Image or emoji placeholder */}
              <div className="bg-muted relative mx-auto flex aspect-square w-full max-w-[150px] items-center justify-center overflow-hidden rounded-lg">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={option}
                    width={150}
                    height={150}
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-4xl">🖼️</span>
                )}

                {/* Overlay on submit */}
                {state === 'correct' && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#2F7D52]/20">
                    <CheckCircle2 className="h-8 w-8 text-[#2F7D52]" />
                  </div>
                )}
                {state === 'wrong' && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#9B2335]/20">
                    <XCircle className="h-8 w-8 text-[#9B2335]" />
                  </div>
                )}
              </div>

              {/* Option text */}
              <span
                className={cn(
                  'french-text text-xs leading-tight',
                  state === 'selected' && 'text-[#C24E2A]',
                  state === 'correct' && 'font-semibold text-[#2F7D52]',
                  state === 'wrong' && 'text-[#9B2335]',
                  state === 'idle' && 'text-foreground',
                )}
              >
                {option}
              </span>
            </button>
          )
        })}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={selected === null || disabled}
        className="h-12 w-full rounded-xl bg-[#C24E2A] text-base font-semibold text-white hover:bg-[#A03D20]"
      >
        Check
      </Button>
    </div>
  )
}
