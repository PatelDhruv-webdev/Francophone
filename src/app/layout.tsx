import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-display-custom',
  weight: ['400', '600', '700'],
})

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans-custom',
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'FrancoPath — Learn French A1 to C2',
  description:
    'A gamified French learning platform that guides you from beginner to advanced through structured CEFR lessons, spaced repetition, and daily practice.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground min-h-full font-sans">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
