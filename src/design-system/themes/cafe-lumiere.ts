import type { Theme } from './theme.types'

// Café Lumière — warm editorial palette inspired by French culture:
// bistro walls, Provençal ochre, Bordeaux wine, bookshop warmth, Le Monde typography.
// Named in French to signal cultural intentionality.
export const cafeLumiere: Theme = {
  name: 'cafe-lumiere',

  colors: {
    // Surfaces — warm cream, NOT clinical white; dark brown NOT pure black
    background: '#F7F4EF', // Ivoire — page background (light)
    backgroundDark: '#1A1814', // Nuit — page background (dark)
    surface: '#FFFFFF', // Card/exercise surfaces on ivoire
    surfaceDark: '#242019', // Card surfaces in dark mode

    // Text — warm tones, never pure black/gray
    textPrimary: '#1E1B16', // Encre — warm dark brown
    textMuted: '#6B6460', // Gris Chaud — warm gray
    textDisabled: '#A09890', // Pâle — placeholder, disabled

    // Brand / Action — terracotta replaces generic indigo/blue
    primary: '#C24E2A', // Terre Cuite — primary CTA
    primaryHover: '#A03D20', // Brique — hover state
    primaryLight: '#F5E8E3', // Light fill for primary surfaces
    secondary: '#3D5166', // Ardoise — French slate for secondary

    // Gamification — warm gold, NOT generic amber
    xp: '#D4970A', // Or Vif — XP, streaks, gold badges
    xpLight: '#F5E6B8', // Or Pâle — XP bar background
    streak: '#E8612A', // Flamme — streak flame icon

    // Feedback — sophisticated, NOT alarming neon
    correct: '#2F7D52', // Vert Forêt — deep forest green
    correctLight: '#E8F5EE', // Vert Pâle — correct surface fill
    wrong: '#9B2335', // Bordeaux — wine red, not alarming red
    wrongLight: '#F9EAEC', // Rose Vieux — wrong surface fill

    // Borders — warm tinted
    border: 'rgba(30,27,22,0.10)',
    borderDark: 'rgba(240,235,227,0.12)',

    // CEFR levels — warm→cool progression signals the learning journey
    levels: {
      a1: '#D4B896', // Sable — warm sand
      a2: '#C4903C', // Ocre — ochre gold
      b1: '#6B9E7A', // Sauge — sage green
      b2: '#5A7FA0', // Ardoise Bleue — slate blue
      c1: '#8B6B8B', // Mauve — dusty mauve
      c2: '#C4A35A', // Or Antique — antique gold
    },
  },

  fonts: {
    display: "var(--font-display), 'Georgia', serif",
    sans: 'var(--font-sans), system-ui, sans-serif',
    googleFonts: ['Playfair_Display', 'DM_Sans'],
  },

  radius: {
    card: '12px', // Not pill, not sharp — intentional middle ground
    button: '8px',
    pill: '9999px',
  },

  shadows: {
    // Warm tint — never blue-tinted generic box-shadow
    card: '0 2px 8px rgba(30,27,22,0.08), 0 0 0 1px rgba(30,27,22,0.05)',
    exercise: '0 4px 16px rgba(30,27,22,0.10), 0 0 0 1px rgba(30,27,22,0.06)',
    elevated: '0 8px 32px rgba(30,27,22,0.12)',
  },

  animations: {
    shake: 'shake 0.2s ease-in-out',
    floatUp: 'float-up 0.25s ease-out',
    glowPulse: 'glow-pulse 2s ease-in-out infinite',
  },
}
