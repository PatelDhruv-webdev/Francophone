import { activeTheme } from '../index'

// Flat color map for use in Tailwind config's `theme.extend.colors`
// These are derived from the active theme, so swapping the theme
// automatically updates all Tailwind color classes.
export const colorTokens = {
  ivoire: {
    DEFAULT: activeTheme.colors.background,
    dark: activeTheme.colors.backgroundDark,
  },
  surface: {
    DEFAULT: activeTheme.colors.surface,
    dark: activeTheme.colors.surfaceDark,
  },
  encre: activeTheme.colors.textPrimary,
  'gris-chaud': activeTheme.colors.textMuted,
  pale: activeTheme.colors.textDisabled,
  'terre-cuite': {
    DEFAULT: activeTheme.colors.primary,
    hover: activeTheme.colors.primaryHover,
    light: activeTheme.colors.primaryLight,
  },
  ardoise: activeTheme.colors.secondary,
  'or-vif': {
    DEFAULT: activeTheme.colors.xp,
    light: activeTheme.colors.xpLight,
  },
  flamme: activeTheme.colors.streak,
  'vert-foret': {
    DEFAULT: activeTheme.colors.correct,
    light: activeTheme.colors.correctLight,
  },
  bordeaux: {
    DEFAULT: activeTheme.colors.wrong,
    light: activeTheme.colors.wrongLight,
  },
  level: activeTheme.colors.levels,
} as const
