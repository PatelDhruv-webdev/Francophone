'use client'

import { cn } from '@/lib/utils'
import { useMultipleChoice } from './headless/useMultipleChoice'
import { Button } from '@/components/ui/button'

interface ReadingComprehensionProps {
  prompt: string
  data: {
    passage: string
    question: string
    options: string[]
  }
  disabled: boolean
  onSubmit: (answer: number) => void
}

export function ReadingComprehension({
  prompt,
  data,
  disabled,
  onSubmit,
}: ReadingComprehensionProps) {
  const { selected, select } = useMultipleChoice()

  function handleSubmit() {
    if (selected === null) return
    onSubmit(selected)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Passage card */}
      <div className="border-border bg-bg rounded-xl border-2 p-4 shadow-[0_2px_8px_rgba(30,27,22,0.08)]">
        <p
          className="french-text text-fg text-sm leading-7 whitespace-pre-wrap"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {data.passage}
        </p>
      </div>

      {/* Question */}
      <p className="text-foreground french-text text-base font-semibold">
        {data.question || prompt}
      </p>

      {/* Options as radio-style buttons */}
      <div className="flex flex-col gap-2">
        {data.options.map((option, i) => (
          <button
            key={i}
            disabled={disabled}
            onClick={() => select(i)}
            className={cn(
              'flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left',
              'cursor-pointer text-sm font-medium transition-all duration-150',
              'focus-visible:ring-brand focus-visible:ring-2 focus-visible:outline-none',
              selected === i
                ? 'border-brand text-brand bg-[#F5E8E3]'
                : 'border-border bg-card text-foreground hover:border-brand/40 hover:bg-[#F5E8E3]/30',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            {/* Radio indicator */}
            <span
              className={cn(
                'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2',
                selected === i ? 'border-brand' : 'border-muted-foreground/40',
              )}
            >
              {selected === i && <span className="bg-brand h-2.5 w-2.5 rounded-full" />}
            </span>
            <span className="french-text">{option}</span>
          </button>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={selected === null || disabled}
        className="bg-brand hover:bg-brand-dark h-12 w-full rounded-xl text-base font-semibold text-white"
      >
        Check
      </Button>
    </div>
  )
}
