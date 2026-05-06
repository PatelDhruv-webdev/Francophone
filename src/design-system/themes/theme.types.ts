export interface ThemeColors {
  // Surfaces
  background: string
  backgroundDark: string
  surface: string
  surfaceDark: string

  // Text
  textPrimary: string
  textMuted: string
  textDisabled: string

  // Brand / Action
  primary: string
  primaryHover: string
  primaryLight: string
  secondary: string

  // Gamification
  xp: string
  xpLight: string
  streak: string

  // Feedback
  correct: string
  correctLight: string
  wrong: string
  wrongLight: string

  // Borders
  border: string
  borderDark: string

  // CEFR level progression
  levels: {
    a1: string
    a2: string
    b1: string
    b2: string
    c1: string
    c2: string
  }
}

export interface ThemeFonts {
  display: string // CSS font-family for headings — editorial serif
  sans: string // CSS font-family for UI — friendly sans
  googleFonts: string[]
}

export interface ThemeRadius {
  card: string
  button: string
  pill: string
}

export interface ThemeShadows {
  card: string
  exercise: string
  elevated: string
}

export interface ThemeAnimations {
  shake: string
  floatUp: string
  glowPulse: string
}

export interface Theme {
  name: string
  colors: ThemeColors
  fonts: ThemeFonts
  radius: ThemeRadius
  shadows: ThemeShadows
  animations: ThemeAnimations
}
