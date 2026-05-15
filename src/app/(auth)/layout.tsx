import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FrancoPath — Sign in',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg flex min-h-screen items-center justify-center p-4 dark:bg-[#1A1814]">
      <div className="w-full max-w-md">
        {/* Logo / wordmark */}
        <div className="mb-8 text-center">
          <h1
            className="text-fg text-3xl font-bold tracking-tight dark:text-[#F0EBE3]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            FrancoPath
          </h1>
          <p className="text-fg-muted mt-1 text-sm dark:text-[#9A9088]">
            Your path to French fluency
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
