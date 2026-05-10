'use client'

import type React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  RotateCcw,
  BarChart2,
  Trophy,
  User,
  Flame,
  Headphones,
  PenLine,
  Library,
} from 'lucide-react'
import type { Route } from 'next'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/store/userStore'

const navItems: { label: string; href: Route; icon: React.ElementType }[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Niveaux', href: '/levels', icon: GraduationCap },
  { label: 'Vocabulaire', href: '/levels/a1/vocabulary', icon: BookOpen },
  { label: 'Lectures', href: '/levels/a1/reading' as Route, icon: Library },
  { label: 'Écoute', href: '/levels/a1/listening' as Route, icon: Headphones },
  { label: 'Écriture', href: '/levels/a1/writing' as Route, icon: PenLine },
  { label: 'Révision', href: '/review', icon: RotateCcw },
  { label: 'Statistiques', href: '/stats', icon: BarChart2 },
  { label: 'Succès', href: '/achievements', icon: Trophy },
  { label: 'Profil', href: '/profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const profile = useUserStore((s) => s.profile)

  return (
    <aside className="hidden min-h-screen w-60 flex-col border-r border-[rgba(240,235,227,0.08)] bg-[#2A2522] lg:flex dark:bg-[#141210]">
      {/* Wordmark */}
      <div className="border-b border-[rgba(240,235,227,0.08)] px-6 py-6">
        <Link href="/dashboard" className="block">
          <span
            className="text-xl font-bold text-[#F0EBE3]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FrancoPath
          </span>
        </Link>
      </div>

      {/* Streak + XP quick view */}
      {profile && (
        <div className="border-b border-[rgba(240,235,227,0.08)] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Flame
                className={cn(
                  'h-4 w-4',
                  profile.streak_days > 0 ? 'animate-glow-pulse text-streak' : 'text-fg-muted',
                )}
              />
              <span className="text-sm font-semibold text-[#F0EBE3]">{profile.streak_days}</span>
            </div>
            <div className="h-3 w-px bg-[rgba(240,235,227,0.15)]" />
            <div className="flex items-center gap-1.5">
              <span className="text-accent text-sm">✦</span>
              <span className="text-sm font-semibold text-[#F0EBE3]">
                {profile.xp.toLocaleString()} XP
              </span>
            </div>
            <div className="ml-auto">
              <span className="text-accent rounded-full bg-[rgba(212,151,10,0.15)] px-2 py-0.5 text-xs font-medium">
                {profile.current_level}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'border-brand -ml-px border-l-2 bg-[rgba(194,78,42,0.18)] pl-[11px] text-white'
                  : 'text-fg-subtle hover:bg-[rgba(240,235,227,0.06)] hover:text-[#F0EBE3]',
              )}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Level badge at bottom */}
      {profile && (
        <div className="border-t border-[rgba(240,235,227,0.08)] px-4 py-4">
          <div className="text-fg-muted text-xs">Currently studying</div>
          <div className="mt-1 text-sm font-medium text-[#F0EBE3]">
            Level {profile.current_level}
          </div>
        </div>
      )}
    </aside>
  )
}
