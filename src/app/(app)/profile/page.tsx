import type { Metadata } from 'next'
import Link from 'next/link'
import type { Route } from 'next'
import { redirect } from 'next/navigation'
import { BookOpen, Pencil } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from './SignOutButton'

export const metadata: Metadata = { title: 'Profil · FrancoPath' }

function LevelBadge({ level }: { level: string }) {
  const colorMap: Record<string, string> = {
    A1: 'bg-[#D4B896] text-[#5A3E1B]',
    A2: 'bg-[#C4903C] text-white',
    B1: 'bg-[#6B9E7A] text-white',
    B2: 'bg-[#3D5166] text-white',
    C1: 'bg-[#9B2335] text-white',
    C2: 'bg-[#1A1814] text-white',
  }
  const cls = colorMap[level] ?? 'bg-encre/10 text-encre'
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${cls}`}>
      {level}
    </span>
  )
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, username, xp, streak_days, current_level, avatar_url')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name ?? profile?.username ?? 'Utilisateur'
  const username = profile?.username ?? ''
  const xp = profile?.xp ?? 0
  const streak = profile?.streak_days ?? 0
  const level = profile?.current_level ?? 'A1'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="bg-ivoire min-h-screen p-6 lg:p-8">
      <div className="mx-auto max-w-xl space-y-6">
        {/* Page header */}
        <div className="mb-2">
          <h1
            className="text-encre text-3xl font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Mon profil
          </h1>
        </div>

        {/* Profile card */}
        <div className="shadow-card rounded-2xl bg-white p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="bg-terre-cuite flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white select-none">
              {initial}
            </div>

            {/* Name / username / level */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className="text-encre text-xl font-bold"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {displayName}
                </h2>
                <LevelBadge level={level} />
              </div>
              {username && <p className="text-gris-chaud mt-0.5 text-sm">@{username}</p>}
              <p className="text-gris-chaud mt-0.5 text-sm">{user.email}</p>
            </div>
          </div>

          {/* XP + streak row */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="bg-ivoire rounded-xl p-4 text-center">
              <p
                className="text-or-vif text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {xp.toLocaleString('fr-FR')}
              </p>
              <p className="text-gris-chaud mt-0.5 text-xs tracking-wide uppercase">XP total</p>
            </div>
            <div className="bg-ivoire rounded-xl p-4 text-center">
              <p
                className="text-flamme text-2xl font-bold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {streak} j
              </p>
              <p className="text-gris-chaud mt-0.5 text-xs tracking-wide uppercase">Série</p>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="shadow-card divide-encre/5 divide-y rounded-2xl bg-white">
          <Link
            href={'/writing/history' as Route}
            className="hover:bg-ivoire flex items-center gap-3 rounded-t-2xl px-5 py-4 transition-colors"
          >
            <BookOpen className="text-ardoise h-5 w-5 shrink-0" />
            <span className="text-encre text-sm font-medium">Historique d&apos;écriture</span>
            <span className="text-pale ml-auto text-sm">›</span>
          </Link>
        </div>

        {/* Edit button (disabled — coming soon) */}
        <div className="shadow-card rounded-2xl bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-encre text-sm font-medium">Modifier le profil</p>
              <p className="text-gris-chaud mt-0.5 text-xs">Nom, pseudonyme, avatar</p>
            </div>
            <div className="group relative">
              <button
                disabled
                className="bg-encre/5 text-pale flex cursor-not-allowed items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
                aria-label="Bientôt disponible"
              >
                <Pencil className="h-4 w-4" />
                Modifier
              </button>
              {/* Tooltip */}
              <div className="bg-encre pointer-events-none absolute right-0 bottom-full z-10 mb-2 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                Bientôt disponible
              </div>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="shadow-card rounded-2xl bg-white p-5">
          <p className="text-gris-chaud mb-3 text-sm">
            Connecté en tant que <span className="text-encre font-medium">{user.email}</span>
          </p>
          <SignOutButton />
        </div>
      </div>
    </div>
  )
}
