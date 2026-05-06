'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Route } from 'next'
import type { SrsCardWithVocab } from './page'

type Props = {
  cards: SrsCardWithVocab[]
}

type SessionState = 'reviewing' | 'complete'

export function ReviewSession({ cards }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [sessionState, setSessionState] = useState<SessionState>('reviewing')
  const [reviewedCount, setReviewedCount] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Empty state
  if (cards.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 text-6xl">🎉</div>
        <h1
          className="text-encre mb-3 text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Pas de cartes à réviser aujourd&apos;hui !
        </h1>
        <p className="text-gris-chaud mb-8 text-lg">
          Revenez demain pour continuer votre progression.
        </p>
        <Link
          href={'/dashboard' as Route}
          className="bg-terre-cuite hover:bg-terre-cuite-hover inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    )
  }

  // Complete state
  if (sessionState === 'complete') {
    const xpEstimate = reviewedCount * 2
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 text-6xl">✨</div>
        <h1
          className="text-encre mb-3 text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Session terminée !
        </h1>
        <div className="shadow-card mb-8 w-full max-w-sm rounded-2xl bg-white p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-terre-cuite text-3xl font-bold">{reviewedCount}</div>
              <div className="text-gris-chaud mt-1 text-sm">cartes révisées</div>
            </div>
            <div className="text-center">
              <div className="text-or-vif text-3xl font-bold">+{xpEstimate}</div>
              <div className="text-gris-chaud mt-1 text-sm">XP estimés</div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={'/dashboard' as Route}
            className="bg-terre-cuite hover:bg-terre-cuite-hover inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-colors"
          >
            Tableau de bord
          </Link>
          <Link
            href={'/levels' as Route}
            className="text-encre border-encre/10 hover:bg-ivoire shadow-card inline-flex items-center gap-2 rounded-xl border bg-white px-6 py-3 font-semibold transition-colors"
          >
            Continuer à apprendre
          </Link>
        </div>
      </div>
    )
  }

  const card = cards[currentIndex]
  if (!card) return null
  const cardId = card.id
  const vocab = card.vocabulary
  const progress = (currentIndex / cards.length) * 100

  async function handleRating(quality: 1 | 3 | 5) {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      await fetch('/api/srs/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId, quality }),
      })
    } catch {
      // Non-fatal — advance regardless to avoid blocking the user
    }

    const nextIndex = currentIndex + 1
    setReviewedCount((c) => c + 1)

    if (nextIndex >= cards.length) {
      setSessionState('complete')
    } else {
      setCurrentIndex(nextIndex)
      setFlipped(false)
    }

    setIsSubmitting(false)
  }

  return (
    <div className="mx-auto max-w-lg p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-encre text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Révision quotidienne
        </h1>
        <span className="text-gris-chaud text-sm font-medium">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="bg-encre/10 mb-8 h-2 w-full rounded-full">
        <div
          className="bg-terre-cuite h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="relative mb-6" style={{ perspective: '1000px' }}>
        <div
          className="w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="shadow-exercise flex min-h-48 flex-col items-center justify-center rounded-2xl bg-white p-8 text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className="text-pale mb-4 text-xs font-semibold tracking-wider uppercase">
              {card.item_type}
            </span>
            <p
              className="text-encre french-text text-4xl font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {vocab?.french ?? '—'}
            </p>
          </div>

          {/* Back */}
          <div
            className="shadow-exercise absolute inset-0 flex min-h-48 flex-col items-center justify-center rounded-2xl bg-white p-8 text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-encre mb-3 text-2xl font-semibold">{vocab?.english ?? '—'}</p>
            {vocab?.example_fr && (
              <p className="text-gris-chaud french-text text-sm italic">
                &ldquo;{vocab.example_fr}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      {!flipped ? (
        <button
          onClick={() => setFlipped(true)}
          className="bg-ardoise hover:bg-ardoise/90 shadow-card w-full rounded-xl py-4 text-lg font-semibold text-white transition-colors"
        >
          Voir la réponse
        </button>
      ) : (
        <div className="space-y-3">
          <p className="text-gris-chaud mb-4 text-center text-sm">Comment était-ce ?</p>
          <div className="grid grid-cols-3 gap-3">
            <button
              disabled={isSubmitting}
              onClick={() => handleRating(1)}
              className="bg-bordeaux-light text-bordeaux border-bordeaux/20 hover:bg-bordeaux/10 flex flex-col items-center gap-1 rounded-xl border py-4 font-semibold transition-colors disabled:opacity-50"
            >
              <span className="text-lg">😣</span>
              <span className="text-sm">Encore</span>
            </button>
            <button
              disabled={isSubmitting}
              onClick={() => handleRating(3)}
              className="bg-or-vif-light text-or-vif border-or-vif/20 hover:bg-or-vif/10 flex flex-col items-center gap-1 rounded-xl border py-4 font-semibold transition-colors disabled:opacity-50"
            >
              <span className="text-lg">🤔</span>
              <span className="text-sm">Difficile</span>
            </button>
            <button
              disabled={isSubmitting}
              onClick={() => handleRating(5)}
              className="bg-vert-foret-light text-vert-foret border-vert-foret/20 hover:bg-vert-foret/10 flex flex-col items-center gap-1 rounded-xl border py-4 font-semibold transition-colors disabled:opacity-50"
            >
              <span className="text-lg">😊</span>
              <span className="text-sm">Facile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
