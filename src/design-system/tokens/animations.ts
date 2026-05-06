export const DURATIONS = {
  fast: '150ms',
  normal: '250ms',
  slow: '400ms',
} as const

export const EASINGS = {
  default: 'ease-out',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
} as const

export const KEYFRAMES = {
  shake: {
    '0%,100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-3px)' },
    '75%': { transform: 'translateX(3px)' },
  },
  floatUp: {
    from: { opacity: '0', transform: 'translateY(8px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  glowPulse: {
    '0%,100%': { filter: 'drop-shadow(0 0 4px rgba(212,151,10,0.3))' },
    '50%': { filter: 'drop-shadow(0 0 12px rgba(212,151,10,0.7))' },
  },
} as const
