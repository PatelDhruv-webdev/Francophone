export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
export type CefrLevel = (typeof CEFR_LEVELS)[number]

export const LEVEL_META: Record<CefrLevel, { title: string; description: string; color: string }> =
  {
    A1: {
      title: 'Beginner',
      description: 'Basic phrases and everyday expressions',
      color: '#D4B896',
    },
    A2: {
      title: 'Elementary',
      description: 'Simple sentences on familiar topics',
      color: '#C4903C',
    },
    B1: {
      title: 'Intermediate',
      description: 'Main points of clear standard input',
      color: '#6B9E7A',
    },
    B2: {
      title: 'Upper Intermediate',
      description: 'Complex texts and abstract topics',
      color: '#5A7FA0',
    },
    C1: {
      title: 'Advanced',
      description: 'Demanding texts with implicit meaning',
      color: '#8B6B8B',
    },
    C2: {
      title: 'Mastery',
      description: 'Everything you understand and express',
      color: '#C4A35A',
    },
  }
