export interface AchievementMeta {
  slug: string
  title: string
  description: string
  icon: string // lucide icon name
  xp_reward: number
  condition_type:
    | 'xp_total'
    | 'streak_days'
    | 'lessons_complete'
    | 'exercises_correct'
    | 'level_complete'
  condition_value: number
}

export const ACHIEVEMENTS: AchievementMeta[] = [
  // Streak achievements
  {
    slug: 'streak-3',
    title: 'En feu !',
    description: '3 jours consécutifs',
    icon: 'Flame',
    xp_reward: 10,
    condition_type: 'streak_days',
    condition_value: 3,
  },
  {
    slug: 'streak-7',
    title: 'Une semaine !',
    description: '7 jours consécutifs',
    icon: 'Flame',
    xp_reward: 25,
    condition_type: 'streak_days',
    condition_value: 7,
  },
  {
    slug: 'streak-30',
    title: 'Un mois !',
    description: '30 jours consécutifs',
    icon: 'Flame',
    xp_reward: 100,
    condition_type: 'streak_days',
    condition_value: 30,
  },
  // XP achievements
  {
    slug: 'xp-100',
    title: 'Premiers pas',
    description: '100 XP gagnés',
    icon: 'Star',
    xp_reward: 10,
    condition_type: 'xp_total',
    condition_value: 100,
  },
  {
    slug: 'xp-500',
    title: 'En route !',
    description: '500 XP gagnés',
    icon: 'Star',
    xp_reward: 20,
    condition_type: 'xp_total',
    condition_value: 500,
  },
  {
    slug: 'xp-1000',
    title: 'Mille points !',
    description: '1000 XP gagnés',
    icon: 'Trophy',
    xp_reward: 50,
    condition_type: 'xp_total',
    condition_value: 1000,
  },
  {
    slug: 'xp-5000',
    title: 'Expert',
    description: '5000 XP gagnés',
    icon: 'Trophy',
    xp_reward: 150,
    condition_type: 'xp_total',
    condition_value: 5000,
  },
  // Lesson achievements
  {
    slug: 'lesson-1',
    title: 'Première leçon',
    description: 'Première leçon terminée',
    icon: 'BookOpen',
    xp_reward: 15,
    condition_type: 'lessons_complete',
    condition_value: 1,
  },
  {
    slug: 'lesson-10',
    title: 'Studieux',
    description: '10 leçons terminées',
    icon: 'BookOpen',
    xp_reward: 40,
    condition_type: 'lessons_complete',
    condition_value: 10,
  },
  {
    slug: 'lesson-50',
    title: 'Assidu',
    description: '50 leçons terminées',
    icon: 'GraduationCap',
    xp_reward: 150,
    condition_type: 'lessons_complete',
    condition_value: 50,
  },
  // Level completion
  {
    slug: 'level-a1',
    title: 'Niveau A1',
    description: 'A1 complété',
    icon: 'Award',
    xp_reward: 200,
    condition_type: 'level_complete',
    condition_value: 1,
  },
  {
    slug: 'level-a2',
    title: 'Niveau A2',
    description: 'A2 complété',
    icon: 'Award',
    xp_reward: 400,
    condition_type: 'level_complete',
    condition_value: 2,
  },
]
