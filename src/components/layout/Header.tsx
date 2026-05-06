'use client'

import { useRouter } from 'next/navigation'
import { Moon, Sun, LogOut, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSettingsStore } from '@/store/settingsStore'
import { useUserStore } from '@/store/userStore'
import { signOut } from '@/lib/actions/auth.actions'
import { useEffect } from 'react'

interface HeaderProps {
  onMobileMenuOpen?: () => void
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const router = useRouter()
  const { darkMode, toggleDarkMode } = useSettingsStore()
  const { profile } = useUserStore()

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const initials = profile?.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : (profile?.username?.slice(0, 2).toUpperCase() ?? '??')

  return (
    <header className="border-border bg-background flex h-14 items-center justify-between border-b px-4 lg:px-6">
      {/* Mobile menu trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="text-[#6B6460] hover:text-[#1E1B16] lg:hidden"
        onClick={onMobileMenuOpen}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Page title slot (left on desktop, center on mobile) */}
      <div className="hidden lg:block" />

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="text-[#6B6460] hover:text-[#1E1B16] dark:text-[#9A9088] dark:hover:text-[#F0EBE3]"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#C24E2A] focus-visible:ring-offset-2">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarImage src={profile?.avatar_url ?? ''} alt={profile?.display_name ?? ''} />
              <AvatarFallback className="bg-[#F5E8E3] text-xs font-semibold text-[#C24E2A]">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {profile && (
              <>
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium">
                    {profile.display_name ?? profile.username}
                  </p>
                  <p className="text-xs text-[#6B6460]">Level {profile.current_level}</p>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              Profile &amp; settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/stats')}>
              Progress stats
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void signOut()}
              className="text-[#9B2335] focus:text-[#9B2335]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
