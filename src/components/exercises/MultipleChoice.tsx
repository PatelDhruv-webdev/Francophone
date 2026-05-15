'use client'

import { cn } from '@/lib/utils'
import { useMultipleChoice } from './headless/useMultipleChoice'
import { Button } from '@/components/ui/button'
import type { MultipleChoiceData, PictureChoiceData } from '@/types/exercises'

interface MultipleChoiceProps {
  prompt: string
  data: MultipleChoiceData | PictureChoiceData
  disabled: boolean
  onSubmit: (answer: number) => void
}

export function MultipleChoice({ prompt, data, disabled, onSubmit }: MultipleChoiceProps) {
  const { selected, select } = useMultipleChoice()
  const options = data.options

  function handleSubmit() {
    if (selected === null) return
    onSubmit(selected)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Prompt */}
      <p className="text-foreground french-text text-lg font-medium">{prompt}</p>

      {/* Option grid — 2 cols on mobile, up to 4 cols for short options */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option, i) => (
          <button
            key={i}
            disabled={disabled}
            onClick={() => select(i)}
            className={cn(
              'relative flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left',
              'cursor-pointer text-sm font-medium transition-all duration-150',
              'focus-visible:ring-brand focus-visible:ring-2 focus-visible:outline-none',
              selected === i
                ? 'border-brand text-brand bg-[#F5E8E3]'
                : 'border-border bg-card text-foreground hover:border-brand/40 hover:bg-[#F5E8E3]/30',
              disabled && 'cursor-not-allowed opacity-60',
            )}
          >
            {/* Option letter chip */}
            <span
              className={cn(
                'flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold',
                selected === i ? 'bg-brand text-white' : 'bg-muted text-muted-foreground',
              )}
            >
              {String.fromCharCode(65 + i)}
            </span>
            <span className="french-text">{option}</span>
          </button>
        ))}
      </div>

      {/* Submit button */}
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
