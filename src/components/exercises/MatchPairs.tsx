'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { MatchPairsData } from '@/types/exercises'

interface MatchPairsProps {
  prompt: string
  data: MatchPairsData
  disabled: boolean
  onSubmit: (answer: Record<string, number>) => void
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export function MatchPairs({ prompt, data, disabled, onSubmit }: MatchPairsProps) {
  // Shuffle once on mount (data.right identity changes when a new exercise loads,
  // which causes MatchPairs to remount anyway)
  const shuffledRight = useMemo(() => shuffle(data.right), [data.right])
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matched, setMatched] = useState<Map<number, number>>(new Map()) // leftIdx -> rightIdx
  const [wrong, setWrong] = useState<[number, number] | null>(null) // [leftIdx, rightIdx]

  // Reset wrong pair highlight after short delay
  useEffect(() => {
    if (!wrong) return
    const t = setTimeout(() => setWrong(null), 600)
    return () => clearTimeout(t)
  }, [wrong])

  const handleLeftClick = useCallback(
    (leftIdx: number) => {
      if (disabled) return
      if (matched.has(leftIdx)) return
      setSelectedLeft(leftIdx)
    },
    [disabled, matched],
  )

  const handleRightClick = useCallback(
    (rightDisplayIdx: number) => {
      if (disabled) return
      if (selectedLeft === null) return

      // Find the original right index from the shuffled array
      const rightText = shuffledRight[rightDisplayIdx]
      const originalRightIdx = data.right.indexOf(rightText ?? '')

      // Check if this right item is already matched
      const alreadyMatchedLeft = [...matched.entries()].find(([, ri]) => ri === originalRightIdx)
      if (alreadyMatchedLeft !== undefined) {
        setSelectedLeft(null)
        return
      }

      // Check correctness: data.left[selectedLeft] pairs with data.right[selectedLeft]
      const isCorrect = originalRightIdx === selectedLeft

      if (isCorrect) {
        const next = new Map(matched)
        next.set(selectedLeft, originalRightIdx)
        setMatched(next)
        setSelectedLeft(null)

        // All matched?
        if (next.size === data.left.length) {
          const answer: Record<string, number> = {}
          next.forEach((ri, li) => {
            answer[String(li)] = ri
          })
          onSubmit(answer)
        }
      } else {
        setWrong([selectedLeft, rightDisplayIdx])
        setSelectedLeft(null)
      }
    },
    [disabled, selectedLeft, shuffledRight, data.right, data.left.length, matched, onSubmit],
  )

  // Determine state for left items
  function leftState(i: number): 'matched' | 'selected' | 'wrong' | 'idle' {
    if (matched.has(i)) return 'matched'
    if (wrong?.[0] === i) return 'wrong'
    if (selectedLeft === i) return 'selected'
    return 'idle'
  }

  // Determine state for right items (by display index in shuffled array)
  function rightState(displayIdx: number): 'matched' | 'wrong' | 'idle' {
    const rightText = shuffledRight[displayIdx]
    const originalRightIdx = data.right.indexOf(rightText ?? '')
    if ([...matched.values()].includes(originalRightIdx)) return 'matched'
    if (wrong?.[1] === displayIdx) return 'wrong'
    return 'idle'
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-foreground french-text text-lg font-medium">{prompt}</p>

      <div className="grid grid-cols-2 gap-3">
        {/* Left column — French terms */}
        <div className="flex flex-col gap-2">
          <p className="text-fg-muted mb-1 text-xs font-semibold tracking-wider uppercase">
            Français
          </p>
          {data.left.map((term, i) => {
            const state = leftState(i)
            return (
              <button
                key={i}
                onClick={() => handleLeftClick(i)}
                disabled={disabled || state === 'matched'}
                className={cn(
                  'french-text rounded-xl border-2 px-4 py-3 text-left text-sm font-medium',
                  'focus-visible:ring-brand transition-all duration-150 focus-visible:ring-2 focus-visible:outline-none',
                  state === 'matched' &&
                    'cursor-default border-[#2F7D52] bg-[#E8F5EE] text-[#2F7D52]',
                  state === 'selected' && 'border-brand text-brand bg-[#F5E8E3]',
                  state === 'wrong' && 'animate-shake border-[#9B2335] bg-[#F9EAEC] text-[#9B2335]',
                  state === 'idle' &&
                    'border-border bg-card text-foreground hover:border-brand/40 hover:bg-[#F5E8E3]/30',
                  disabled && state !== 'matched' && 'cursor-not-allowed opacity-60',
                )}
              >
                {term}
              </button>
            )
          })}
        </div>

        {/* Right column — English terms (shuffled) */}
        <div className="flex flex-col gap-2">
          <p className="text-fg-muted mb-1 text-xs font-semibold tracking-wider uppercase">
            English
          </p>
          {shuffledRight.map((term, i) => {
            const state = rightState(i)
            return (
              <button
                key={i}
                onClick={() => handleRightClick(i)}
                disabled={disabled || state === 'matched'}
                className={cn(
                  'rounded-xl border-2 px-4 py-3 text-left text-sm font-medium',
                  'focus-visible:ring-brand transition-all duration-150 focus-visible:ring-2 focus-visible:outline-none',
                  state === 'matched' &&
                    'cursor-default border-[#2F7D52] bg-[#E8F5EE] text-[#2F7D52]',
                  state === 'wrong' && 'animate-shake border-[#9B2335] bg-[#F9EAEC] text-[#9B2335]',
                  state === 'idle' &&
                    cn(
                      'border-border bg-card text-foreground hover:border-brand/40 hover:bg-[#F5E8E3]/30',
                      selectedLeft !== null && 'cursor-pointer',
                    ),
                  disabled && state !== 'matched' && 'cursor-not-allowed opacity-60',
                )}
              >
                {term}
              </button>
            )
          })}
        </div>
      </div>

      {/* Progress indicator */}
      <p className="text-fg-muted text-center text-sm">
        {matched.size} / {data.left.length} matched
      </p>
    </div>
  )
}
