export type SrsItemType = 'vocabulary' | 'grammar' | 'phrase'

export enum Quality {
  Again = 1,
  Hard = 3,
  Good = 4,
  Easy = 5,
}

export interface SrsCard {
  id: string
  user_id: string
  item_type: SrsItemType
  item_id: string
  ease_factor: number
  interval_days: number
  repetitions: number
  due_date: string // ISO date string 'YYYY-MM-DD'
  last_reviewed: string | null
}
