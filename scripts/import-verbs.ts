/**
 * scripts/import-verbs.ts
 *
 * Imports the 35 hand-curated verbs from data/source/verbs_conjugated.json
 * into the public.verbs table (Sprint 2).
 *
 * Usage:
 *   export NEXT_PUBLIC_SUPABASE_URL=...
 *   export SUPABASE_SERVICE_ROLE_KEY=...
 *   npx tsx scripts/import-verbs.ts
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

interface SourceVerb {
  id: string
  infinitif: string
  en?: string
  level?: string
  group?: number
  auxiliary?: 'avoir' | 'être'
  is_irregular?: boolean
  edge_cases?: string
  stem_changes?: string
  participe_passe?: string
  participe_present?: string
  conjugations: Record<string, Record<string, string>>
}

interface SourceFile {
  _meta: unknown
  verbs: SourceVerb[]
}

interface VerbRow {
  id: string
  infinitif: string
  en: string | null
  level_code: string | null
  verb_group: number | null
  auxiliary: string | null
  is_irregular: boolean
  edge_cases: string | null
  stem_changes: string | null
  participe_passe: string | null
  participe_present: string | null
  conjugations: Record<string, Record<string, string>>
  source: 'manual'
}

function mapVerb(v: SourceVerb): VerbRow {
  return {
    id: v.id,
    infinitif: v.infinitif,
    en: v.en ?? null,
    level_code: v.level ?? null,
    verb_group: v.group ?? null,
    auxiliary: v.auxiliary ?? null,
    is_irregular: v.is_irregular ?? false,
    edge_cases: v.edge_cases ?? null,
    stem_changes: v.stem_changes ?? null,
    participe_passe: v.participe_passe ?? null,
    participe_present: v.participe_present ?? null,
    conjugations: v.conjugations ?? {},
    source: 'manual',
  }
}

async function main() {
  const sourcePath = path.join(process.cwd(), 'data', 'source', 'verbs_conjugated.json')
  if (!fs.existsSync(sourcePath)) {
    console.error(`File not found: ${sourcePath}`)
    process.exit(1)
  }

  const file = JSON.parse(fs.readFileSync(sourcePath, 'utf-8')) as SourceFile
  if (!Array.isArray(file.verbs)) {
    console.error('Invalid source file: expected `verbs` array')
    process.exit(1)
  }

  const rows = file.verbs.map(mapVerb)
  console.log(`📚 Importing ${rows.length} verbs from ${path.relative(process.cwd(), sourcePath)}`)

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const batchSize = 25
  let imported = 0
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const { error } = await supabase.from('verbs').upsert(batch, { onConflict: 'id' })
    if (error) {
      console.error(`   Batch ${i / batchSize + 1} failed:`, error.message)
      process.exit(1)
    }
    imported += batch.length
    console.log(`   ✓ ${imported}/${rows.length}`)
  }

  // Sanity check
  const { count } = await supabase.from('verbs').select('*', { count: 'exact', head: true })
  console.log(`✅ Done. Verbs table now has ${count} rows.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
