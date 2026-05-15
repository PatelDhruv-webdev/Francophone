'use client'

import type React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Route } from 'next'
import { LayoutDashboard, GraduationCap, BookOpen, Headphones, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'

// Bottom navigation for mobile — 5 most-used destinations
const mobileNavItems: { label: string; href: Route; icon: React.ElementType }[] = [
  { label: 'Accueil', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Niveaux', href: '/levels', icon: GraduationCap },
  { label: 'Vocab', href: '/levels/a1/vocabulary', icon: BookOpen },
  { label: 'Écoute', href: '/levels/a1/listening' as Route, icon: Headphones },
  { label: 'Écriture', href: '/levels/a1/writing' as Route, icon: PenLine },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-[rgba(240,235,227,0.08)] bg-[#2A2522] lg:hidden dark:bg-[#141210]">
      <div className="pb-safe flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors',
                isActive ? 'text-brand' : 'text-fg-muted hover:text-[#F0EBE3]',
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
