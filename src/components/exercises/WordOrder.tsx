'use client'

import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useWordOrder } from './headless/useWordOrder'
import { Button } from '@/components/ui/button'
import type { WordOrderData } from '@/types/exercises'

interface WordOrderProps {
  prompt: string
  data: WordOrderData
  disabled: boolean
  onSubmit: (answer: string[]) => void
}

export function WordOrder({ prompt: _prompt, data, disabled, onSubmit }: WordOrderProps) {
  const { bank, placed, addToken, removeToken, reset, answer } = useWordOrder(data.tokens)

  // Reset whenever the exercise data changes (new exercise)
  useEffect(() => {
    reset(data.tokens)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.tokens.join('|')])

  return (
    <div className="flex flex-col gap-6">
      {/* English prompt the user must translate */}
      <div>
        <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
          Translate to French
        </p>
        <p className="text-foreground text-lg font-medium">{data.english}</p>
      </div>

      {/* Sentence construction area */}
      <div
        className={cn(
          'flex min-h-[60px] flex-wrap gap-2 rounded-xl border-2 border-dashed p-3',
          placed.length > 0 ? 'border-[#C24E2A]/30' : 'border-border',
        )}
      >
        {placed.length === 0 && (
          <span className="text-muted-foreground self-center text-sm">
            Tap the words below to build your sentence
          </span>
        )}
        {placed.map((token, i) => (
          <button
            key={`placed-${i}`}
            onClick={() => !disabled && removeToken(i)}
            disabled={disabled}
            className={cn(
              'rounded-lg border-2 border-[#C24E2A] bg-[#F5E8E3] px-3 py-1.5 text-[#C24E2A]',
              'french-text text-sm font-medium transition-all duration-100',
              'hover:bg-[#C24E2A] hover:text-white',
              disabled && 'cursor-not-allowed',
            )}
          >
            {token}
          </button>
        ))}
      </div>

      {/* Word bank */}
      <div className="flex flex-wrap gap-2">
        {bank.map((token, i) => (
          <button
            key={`bank-${i}`}
            onClick={() => !disabled && addToken(token, i)}
            disabled={disabled}
            className={cn(
              'border-border bg-card text-foreground rounded-lg border-2 px-3 py-1.5',
              'french-text text-sm font-medium shadow-sm transition-all duration-100',
              'hover:border-[#C24E2A]/60 hover:bg-[#F5E8E3]/40',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            {token}
          </button>
        ))}
      </div>

      <Button
        onClick={() => onSubmit(answer)}
        disabled={placed.length === 0 || disabled}
        className="h-12 w-full rounded-xl bg-[#C24E2A] text-base font-semibold text-white hover:bg-[#A03D20]"
      >
        Check
      </Button>
    </div>
  )
}
