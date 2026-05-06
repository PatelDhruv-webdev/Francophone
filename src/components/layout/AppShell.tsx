'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="bg-background flex h-full min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar — Sheet overlay */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="left"
          className="w-60 border-r border-[rgba(240,235,227,0.08)] bg-[#2A2522] p-0 dark:bg-[#141210]"
        >
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header onMobileMenuOpen={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-auto pb-16 lg:pb-0">{children}</main>

        {/* Bottom nav — mobile only */}
        <MobileNav />
      </div>
    </div>
  )
}
