// Verbs domain service. Reads from public.verbs (RLS allows public_read).

import { createClient } from '@/lib/supabase/server'

export interface VerbConjugations {
  // Each tense: a record of person -> form (or { form: string } for participles).
  [tense: string]: Record<string, string>
}

export interface VerbSummary {
  id: string
  infinitif: string
  en: string | null
  level_code: string | null
  verb_group: number | null
  auxiliary: string | null
  is_irregular: boolean
}

export interface VerbDetail extends VerbSummary {
  edge_cases: string | null
  stem_changes: string | null
  participe_passe: string | null
  participe_present: string | null
  conjugations: VerbConjugations
}

const SUMMARY_COLUMNS = 'id, infinitif, en, level_code, verb_group, auxiliary, is_irregular'

const DETAIL_COLUMNS =
  'id, infinitif, en, level_code, verb_group, auxiliary, is_irregular, edge_cases, stem_changes, participe_passe, participe_present, conjugations'

export interface ListVerbsFilter {
  level?: string
  group?: number
  auxiliary?: 'avoir' | 'être'
  irregularOnly?: boolean
}

export async function listVerbs(filter: ListVerbsFilter = {}): Promise<VerbSummary[]> {
  const supabase = await createClient()
  let query = supabase
    .from('verbs')
    .select(SUMMARY_COLUMNS)
    .order('verb_group', { ascending: true, nullsFirst: false })
    .order('infinitif', { ascending: true })

  if (filter.level) query = query.eq('level_code', filter.level.toUpperCase())
  if (typeof filter.group === 'number') query = query.eq('verb_group', filter.group)
  if (filter.auxiliary) query = query.eq('auxiliary', filter.auxiliary)
  if (filter.irregularOnly) query = query.eq('is_irregular', true)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as VerbSummary[]
}

export async function getVerbById(id: string): Promise<VerbDetail | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('verbs')
    .select(DETAIL_COLUMNS)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return (data as VerbDetail | null) ?? null
}
