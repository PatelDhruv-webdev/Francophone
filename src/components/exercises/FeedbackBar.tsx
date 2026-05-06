'use client'

import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FeedbackBarProps {
  correct: boolean
  displayAnswer: string
  xpAwarded: number
  onContinue: () => void
}

export function FeedbackBar({ correct, displayAnswer, xpAwarded, onContinue }: FeedbackBarProps) {
  return (
    <div
      className={cn(
        'animate-float-up fixed right-0 bottom-0 left-0 z-40 border-t-2',
        'px-4 py-4 lg:px-8',
        correct ? 'border-[#2F7D52] bg-[#E8F5EE]' : 'border-[#9B2335] bg-[#F9EAEC]',
      )}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {correct ? (
            <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#2F7D52]" />
          ) : (
            <XCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-[#9B2335]" />
          )}
          <div>
            <p
              className={cn('text-sm font-semibold', correct ? 'text-[#2F7D52]' : 'text-[#9B2335]')}
            >
              {correct ? 'Correct!' : 'Not quite'}
            </p>
            {!correct && displayAnswer && (
              <p className="french-text mt-0.5 text-sm text-[#9B2335]/80">
                Correct answer: <span className="font-semibold">{displayAnswer}</span>
              </p>
            )}
            {correct && xpAwarded > 0 && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#2F7D52]/80">
                <Plus className="h-3 w-3" />
                {xpAwarded} XP
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={onContinue}
          className={cn(
            'flex-shrink-0 rounded-xl px-6 font-semibold',
            correct
              ? 'bg-[#2F7D52] text-white hover:bg-[#256642]'
              : 'bg-[#9B2335] text-white hover:bg-[#7D1C2A]',
          )}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
