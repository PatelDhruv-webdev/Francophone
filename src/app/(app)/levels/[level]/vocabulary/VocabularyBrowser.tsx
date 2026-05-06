'use client'

import { useState, useMemo } from 'react'
import { Search, RotateCcw, Volume2, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react'

interface VocabWord {
  id: string
  french: string
  english: string
  ipa: string | null
  gender: string | null
  part_of_speech: string
  theme: string
  example_fr: string | null
  example_en: string | null
}

interface Props {
  words: VocabWord[]
  themes: string[]
  levelCode: string
}

function speakFrench(text: string) {
  if (!('speechSynthesis' in window)) return
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'fr-FR'
  utt.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utt)
}

function ThemeLabel({ theme }: { theme: string }) {
  const label = theme.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return <span>{label}</span>
}

// ─── FlashCard Mode ───────────────────────────────────────────────────────────

function FlashCardView({ words, onExit }: { words: VocabWord[]; onExit: () => void }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const word = words[index]
  if (!word) return null

  const prev = () => {
    setFlipped(false)
    setIndex((i) => Math.max(0, i - 1))
  }
  const next = () => {
    setFlipped(false)
    setIndex((i) => Math.min(words.length - 1, i + 1))
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex w-full max-w-lg items-center justify-between">
        <button
          onClick={onExit}
          className="flex items-center gap-1 text-sm text-[#6B6460] transition-colors hover:text-[#C24E2A]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to list
        </button>
        <span className="text-sm text-[#6B6460]">
          {index + 1} / {words.length}
        </span>
      </div>

      {/* Card */}
      <div
        className="h-52 w-full max-w-lg cursor-pointer rounded-2xl select-none"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative h-full w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-[rgba(30,27,22,0.1)] bg-white px-8 shadow-[0_4px_16px_rgba(30,27,22,0.1)]"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p
              className="text-center text-3xl font-medium text-[#1E1B16]"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
            >
              {word.french}
            </p>
            {word.ipa && <p className="text-sm text-[#A09890]">{word.ipa}</p>}
            {word.gender && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${word.gender === 'masculine' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}
              >
                {word.gender === 'masculine' ? 'masc.' : 'fém.'}
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation()
                speakFrench(word.french)
              }}
              className="mt-2 rounded-full p-2 text-[#6B6460] transition-colors hover:bg-[#F7F4EF]"
              title="Listen"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <p className="mt-1 text-xs text-[#A09890]">Tap to reveal</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-[rgba(194,78,42,0.15)] bg-[#FBF6F0] px-8 shadow-[0_4px_16px_rgba(30,27,22,0.1)]"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <p className="text-center text-2xl font-medium text-[#1E1B16]">{word.english}</p>
            {word.example_fr && (
              <div className="mt-2 text-center">
                <p className="text-sm text-[#1E1B16] italic">{word.example_fr}</p>
                <p className="mt-0.5 text-xs text-[#A09890]">{word.example_en}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={prev}
          disabled={index === 0}
          className="rounded-full border border-[rgba(30,27,22,0.1)] bg-white p-3 text-[#1E1B16] transition-colors hover:border-[#C24E2A] disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="rounded-full border border-[rgba(30,27,22,0.1)] bg-white p-3 text-[#1E1B16] transition-colors hover:border-[#C24E2A]"
          title="Flip"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          disabled={index === words.length - 1}
          className="rounded-full border border-[rgba(30,27,22,0.1)] bg-white p-3 text-[#1E1B16] transition-colors hover:border-[#C24E2A] disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Progress dots (up to 10) */}
      {words.length <= 20 && (
        <div className="mt-4 flex gap-1">
          {words.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIndex(i)
                setFlipped(false)
              }}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${i === index ? 'bg-[#C24E2A]' : 'bg-[#D4B896]'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Word Card ─────────────────────────────────────────────────────────────────

function WordCard({ word }: { word: VocabWord }) {
  return (
    <div className="group rounded-xl border border-[rgba(30,27,22,0.08)] bg-white p-4 shadow-[0_2px_8px_rgba(30,27,22,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(30,27,22,0.1)]">
      <div className="mb-1 flex items-start justify-between">
        <p
          className="text-lg font-medium tracking-wide text-[#1E1B16]"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
        >
          {word.french}
        </p>
        <button
          onClick={() => speakFrench(word.french)}
          className="rounded-full p-1.5 text-[#A09890] opacity-0 transition-colors group-hover:opacity-100 hover:bg-[#F5E8E3] hover:text-[#C24E2A]"
          title="Listen"
        >
          <Volume2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {word.ipa && <p className="mb-1 text-xs text-[#A09890]">{word.ipa}</p>}

      <p className="text-sm text-[#6B6460]">{word.english}</p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-[#F7F4EF] px-2 py-0.5 text-xs text-[#6B6460]">
          {word.part_of_speech}
        </span>
        {word.gender && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              word.gender === 'masculine' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
            }`}
          >
            {word.gender === 'masculine' ? 'm.' : 'f.'}
          </span>
        )}
      </div>

      {word.example_fr && (
        <div className="mt-2 border-t border-[rgba(30,27,22,0.05)] pt-2">
          <p className="text-xs text-[#6B6460] italic">{word.example_fr}</p>
          <p className="text-xs text-[#A09890]">{word.example_en}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main Browser ─────────────────────────────────────────────────────────────

export function VocabularyBrowser({ words, themes, levelCode: _levelCode }: Props) {
  const [search, setSearch] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [flashMode, setFlashMode] = useState(false)

  const filtered = useMemo(() => {
    return words.filter((w) => {
      const matchesTheme = !selectedTheme || w.theme === selectedTheme
      const matchesSearch =
        !search ||
        w.french.toLowerCase().includes(search.toLowerCase()) ||
        w.english.toLowerCase().includes(search.toLowerCase())
      return matchesTheme && matchesSearch
    })
  }, [words, selectedTheme, search])

  if (flashMode) {
    return (
      <FlashCardView
        words={filtered.length > 0 ? filtered : words}
        onExit={() => setFlashMode(false)}
      />
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#A09890]" />
          <input
            type="text"
            placeholder="Search words…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[rgba(30,27,22,0.15)] bg-white py-2 pr-4 pl-9 text-sm text-[#1E1B16] placeholder-[#A09890] focus:border-[#C24E2A] focus:ring-2 focus:ring-[#C24E2A]/30 focus:outline-none"
          />
        </div>
        <button
          onClick={() => setFlashMode(true)}
          className="flex items-center gap-2 rounded-lg bg-[#C24E2A] px-4 py-2 text-sm font-medium whitespace-nowrap text-white transition-colors hover:bg-[#A03D20]"
        >
          <RotateCcw className="h-4 w-4" />
          Flashcards {filtered.length > 0 ? `(${filtered.length})` : ''}
        </button>
      </div>

      {/* Theme chips */}
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTheme(null)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            !selectedTheme
              ? 'bg-[#C24E2A] text-white'
              : 'border border-[rgba(30,27,22,0.15)] bg-white text-[#6B6460] hover:border-[#C24E2A]'
          }`}
        >
          All ({words.length})
        </button>
        {themes.map((theme) => {
          const count = words.filter((w) => w.theme === theme).length
          return (
            <button
              key={theme}
              onClick={() => setSelectedTheme(selectedTheme === theme ? null : theme)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedTheme === theme
                  ? 'bg-[#C24E2A] text-white'
                  : 'border border-[rgba(30,27,22,0.15)] bg-white text-[#6B6460] hover:border-[#C24E2A]'
              }`}
            >
              <ThemeLabel theme={theme} /> ({count})
            </button>
          )
        })}
      </div>

      {/* Results count */}
      {(search || selectedTheme) && (
        <p className="mb-3 text-xs text-[#A09890]">
          {filtered.length} word{filtered.length !== 1 ? 's' : ''} found
          {selectedTheme && (
            <>
              {' '}
              in <ThemeLabel theme={selectedTheme} />
            </>
          )}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-[#A09890]">
          <LayoutGrid className="mx-auto mb-2 h-8 w-8 opacity-50" />
          <p className="text-sm">No words match your search.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((word) => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      )}
    </div>
  )
}
