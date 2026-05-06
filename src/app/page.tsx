import Link from 'next/link'
import type { Route } from 'next'

export default function HomePage() {
  return (
    <div
      className="flex min-h-screen flex-col bg-[#F7F4EF]"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[rgba(30,27,22,0.08)] bg-[#F7F4EF]/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <span
            className="text-xl font-bold tracking-tight text-[#1E1B16]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FrancoPath
          </span>
          <div className="flex items-center gap-3">
            <Link
              href={'/login' as Route}
              className="rounded-lg px-4 py-1.5 text-sm font-medium text-[#6B6460] transition-colors hover:text-[#1E1B16]"
            >
              Se connecter
            </Link>
            <Link
              href={'/signup' as Route}
              className="rounded-lg bg-[#C24E2A] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#A03D20]"
            >
              Commencer gratuitement
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <h1
          className="max-w-2xl text-5xl leading-tight font-bold tracking-tight text-[#1E1B16] sm:text-6xl"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Apprenez le français, <span className="text-[#C24E2A]">étape par étape.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#6B6460]">
          De A1 à C2 — leçons adaptées, révision espacée, et exercices interactifs. Gratuit.
        </p>
        <Link
          href={'/signup' as Route}
          className="mt-8 inline-flex items-center gap-1 rounded-xl bg-[#C24E2A] px-7 py-3.5 text-base font-semibold text-white shadow-[0_2px_8px_rgba(194,78,42,0.3)] transition-colors hover:bg-[#A03D20]"
        >
          Commencer maintenant →
        </Link>
      </section>

      {/* ── Features grid ───────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(30,27,22,0.08),0_0_0_1px_rgba(30,27,22,0.05)]">
            <div className="mb-4 text-3xl">🎯</div>
            <h3
              className="mb-2 text-lg font-bold text-[#1E1B16]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Parcours adapté
            </h3>
            <p className="text-sm leading-relaxed text-[#6B6460]">
              Placement test, niveaux A1→C2. Commencez exactement là où vous en êtes.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(30,27,22,0.08),0_0_0_1px_rgba(30,27,22,0.05)]">
            <div className="mb-4 text-3xl">🔄</div>
            <h3
              className="mb-2 text-lg font-bold text-[#1E1B16]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Révision espacée
            </h3>
            <p className="text-sm leading-relaxed text-[#6B6460]">
              Algorithme SM-2, vocabulaire qui reste. Mémorisez plus, oubliez moins.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-[0_2px_8px_rgba(30,27,22,0.08),0_0_0_1px_rgba(30,27,22,0.05)]">
            <div className="mb-4 text-3xl">✍️</div>
            <h3
              className="mb-2 text-lg font-bold text-[#1E1B16]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              4 compétences
            </h3>
            <p className="text-sm leading-relaxed text-[#6B6460]">
              Lecture, écoute, écriture, grammaire. Une approche complète du français.
            </p>
          </div>
        </div>
      </section>

      {/* ── Levels strip ────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12">
        <p className="mb-6 text-center text-xs font-semibold tracking-widest text-[#A09890] uppercase">
          Tous les niveaux CECR
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { level: 'A1', color: '#D4B896', label: 'Débutant' },
            { level: 'A2', color: '#C4903C', label: 'Élémentaire' },
            { level: 'B1', color: '#6B9E7A', label: 'Intermédiaire' },
            { level: 'B2', color: '#5A7FA0', label: 'Avancé' },
            { level: 'C1', color: '#8B6B8B', label: 'Supérieur' },
            { level: 'C2', color: '#C4A35A', label: 'Maîtrise' },
          ].map(({ level, color, label }) => (
            <div key={level} className="flex flex-col items-center gap-1.5">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-base font-bold text-white shadow-[0_2px_6px_rgba(30,27,22,0.15)]"
                style={{ backgroundColor: color, fontFamily: 'var(--font-display)' }}
              >
                {level}
              </div>
              <span className="text-xs text-[#6B6460]">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center gap-0.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-px w-8 bg-[rgba(30,27,22,0.12)]" />
          ))}
        </div>
      </section>

      {/* ── CTA section ─────────────────────────────────────────────────── */}
      <section className="mx-auto w-full max-w-5xl px-6 py-16 text-center">
        <h2
          className="mb-3 text-3xl font-bold text-[#1E1B16]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Prêt à commencer ?
        </h2>
        <p className="mb-8 text-[#6B6460]">
          Rejoignez des milliers d&apos;apprenants qui progressent chaque jour.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={'/signup' as Route}
            className="rounded-xl bg-[#C24E2A] px-8 py-3 font-semibold text-white shadow-[0_2px_8px_rgba(194,78,42,0.25)] transition-colors hover:bg-[#A03D20]"
          >
            Créer un compte
          </Link>
          <Link
            href={'/login' as Route}
            className="rounded-xl border border-[rgba(30,27,22,0.15)] px-8 py-3 font-semibold text-[#1E1B16] transition-colors hover:bg-[rgba(30,27,22,0.04)]"
          >
            Se connecter
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[rgba(30,27,22,0.08)] py-6">
        <p className="text-center text-sm text-[#A09890]">
          FrancoPath · 2026 · Gratuit · Pour apprendre le français
        </p>
      </footer>
    </div>
  )
}
