/**
 * scripts/seed.ts
 *
 * Step 4 (final) of the content pipeline.
 * Reads the structured JSON files and inserts/upserts them into Supabase.
 *
 * Usage:
 *   npx tsx scripts/seed.ts --level a1
 *   npx tsx scripts/seed.ts --level a1 --only vocab
 *   npx tsx scripts/seed.ts --level a1 --only grammar
 *   npx tsx scripts/seed.ts --level a1 --only exercises
 *   npx tsx scripts/seed.ts --level a1 --only reading
 *   npx tsx scripts/seed.ts --level a1 --only reading_resources
 *   npx tsx scripts/seed.ts --level a1 --only writing_prompts
 *   npx tsx scripts/seed.ts --level a1 --only listening_videos
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in environment
 */

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// ─── Config ───────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const levelFlag = args.indexOf('--level')
const level = levelFlag !== -1 ? (args[levelFlag + 1] ?? 'a1').toUpperCase() : 'A1'
const levelLower = level.toLowerCase()
const onlyFlag = args.indexOf('--only')
const only = onlyFlag !== -1 ? args[onlyFlag + 1] : null

const SUPABASE_URL = process.env['NEXT_PUBLIC_SUPABASE_URL']
const SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY']

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  console.error('Run: export NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=...')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const dataDir = path.join(process.cwd(), 'data', levelLower)

function readJSON<T>(filename: string): T | null {
  const p = path.join(dataDir, filename)
  if (!fs.existsSync(p)) {
    console.warn(`⚠  ${filename} not found — skipping`)
    return null
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as T
}

// ─── Seed vocabulary ──────────────────────────────────────────────────────────

async function seedVocabulary() {
  const words = readJSON<Record<string, unknown>[]>('vocabulary.json')
  if (!words) return

  console.log(`\n📚 Seeding ${words.length} vocabulary words…`)

  // Batch upsert in chunks of 100
  const batchSize = 100
  let inserted = 0
  for (let i = 0; i < words.length; i += batchSize) {
    const batch = words.slice(i, i + batchSize)
    const { error } = await supabase
      .from('vocabulary')
      .upsert(batch, { onConflict: 'french,level_code' })
    if (error) {
      console.error(`   Batch ${i / batchSize + 1} error:`, error.message)
    } else {
      inserted += batch.length
    }
  }
  console.log(`✅ Vocabulary: ${inserted} upserted`)
}

// ─── Seed grammar topics ──────────────────────────────────────────────────────

async function seedGrammar() {
  const topics = readJSON<Record<string, unknown>[]>('grammar.json')
  if (!topics) return

  console.log(`\n📖 Seeding ${topics.length} grammar topics…`)

  const { error } = await supabase
    .from('grammar_topics')
    .upsert(topics, { onConflict: 'slug,level_code' })

  if (error) console.error('   Error:', error.message)
  else console.log(`✅ Grammar topics: ${topics.length} upserted`)
}

// ─── Seed reading texts ───────────────────────────────────────────────────────

async function seedReading() {
  const texts = readJSON<Record<string, unknown>[]>('reading.json')
  if (!texts) return

  console.log(`\n📰 Seeding ${texts.length} reading texts…`)

  const { error } = await supabase
    .from('reading_texts')
    .upsert(texts, { onConflict: 'title,level_code' })

  if (error) console.error('   Error:', error.message)
  else console.log(`✅ Reading texts: ${texts.length} upserted`)
}

// ─── Seed exercises ───────────────────────────────────────────────────────────

async function seedExercises() {
  const exercises = readJSON<Record<string, unknown>[]>('exercises.json')
  if (!exercises) return

  console.log(`\n✏️  Seeding ${exercises.length} exercises…`)

  // Exercises link to lessons — if no lesson_id we use null (standalone exercises)
  // The lesson_id gets assigned when you wire exercises to lessons in seed-lessons.ts
  const batchSize = 50
  let inserted = 0
  for (let i = 0; i < exercises.length; i += batchSize) {
    const batch = exercises.slice(i, i + batchSize).map((ex, idx) => ({
      ...ex,
      lesson_id: ex['lesson_id'] ?? null,
      order_index: ex['order_index'] ?? i + idx,
    }))
    const { error } = await supabase.from('exercises').insert(batch)
    if (error) {
      console.error(`   Batch ${i / batchSize + 1} error:`, error.message)
    } else {
      inserted += batch.length
    }
  }
  console.log(`✅ Exercises: ${inserted} inserted`)
}

// ─── Seed lesson structure ────────────────────────────────────────────────────

async function seedLessonStructure() {
  const structure = readJSON<{
    units: Array<{
      title: string
      description: string
      order_index: number
      chapters: Array<{
        title: string
        order_index: number
        lessons: Array<{
          title: string
          description: string
          order_index: number
          exercise_tags: string[]
        }>
      }>
    }>
  }>('structure.json')

  if (!structure) return

  console.log(`\n🏗  Seeding lesson structure for ${level}…`)

  // Get the level row
  const { data: levelRow } = await supabase.from('levels').select('id').eq('code', level).single()

  if (!levelRow) {
    console.error(`   Level ${level} not found in DB — run migrations first`)
    return
  }

  for (const unit of structure.units) {
    const { data: unitRow, error: uErr } = await supabase
      .from('units')
      .upsert(
        {
          title: unit.title,
          description: unit.description,
          level_id: levelRow.id,
          order_index: unit.order_index,
        },
        { onConflict: 'title,level_id' },
      )
      .select('id')
      .single()

    if (uErr || !unitRow) {
      console.error('Unit error:', uErr?.message)
      continue
    }

    for (const chapter of unit.chapters) {
      const { data: chapterRow, error: cErr } = await supabase
        .from('chapters')
        .upsert(
          { title: chapter.title, unit_id: unitRow.id, order_index: chapter.order_index },
          { onConflict: 'title,unit_id' },
        )
        .select('id')
        .single()

      if (cErr || !chapterRow) {
        console.error('Chapter error:', cErr?.message)
        continue
      }

      for (const lesson of chapter.lessons) {
        const { data: lessonRow, error: lErr } = await supabase
          .from('lessons')
          .upsert(
            {
              title: lesson.title,
              description: lesson.description,
              chapter_id: chapterRow.id,
              order_index: lesson.order_index,
            },
            { onConflict: 'title,chapter_id' },
          )
          .select('id')
          .single()

        if (lErr || !lessonRow) {
          console.error('Lesson error:', lErr?.message)
          continue
        }

        // Wire exercises to this lesson by matching tags
        if (lesson.exercise_tags?.length) {
          const { error: exErr } = await supabase
            .from('exercises')
            .update({ lesson_id: lessonRow.id })
            .contains('tags', lesson.exercise_tags)
            .eq('level_code', level)
            .is('lesson_id', null)

          if (exErr) console.error('Exercise wire error:', exErr.message)
        }
      }
    }
  }

  console.log('✅ Lesson structure seeded')
}

// ─── Seed reading resources (fabulang links) ──────────────────────────────────

async function seedReadingResources() {
  const resources = readJSON<Record<string, unknown>[]>('reading_resources.json')
  if (!resources) return

  console.log(`\n🔗 Seeding ${resources.length} reading resources…`)

  const rows = resources.map((r) => ({ ...r, level_code: level }))
  const { error } = await supabase
    .from('reading_resources')
    .upsert(rows, { onConflict: 'external_url' })

  if (error) console.error('   Error:', error.message)
  else console.log(`✅ Reading resources: ${resources.length} upserted`)
}

// ─── Seed writing prompts ─────────────────────────────────────────────────────

async function seedWritingPrompts() {
  const prompts = readJSON<Record<string, unknown>[]>('writing_prompts.json')
  if (!prompts) return

  console.log(`\n✍️  Seeding ${prompts.length} writing prompts…`)

  const { error } = await supabase
    .from('writing_prompts')
    .upsert(prompts, { onConflict: 'title,level_code' })

  if (error) console.error('   Error:', error.message)
  else console.log(`✅ Writing prompts: ${prompts.length} upserted`)
}

// ─── Seed listening videos ────────────────────────────────────────────────────

async function seedListeningVideos() {
  const videos = readJSON<Record<string, unknown>[]>('listening_videos.json')
  if (!videos) return

  console.log(`\n🎧 Seeding ${videos.length} listening videos…`)

  const { error } = await supabase
    .from('listening_videos')
    .upsert(videos, { onConflict: 'youtube_id' })

  if (error) console.error('   Error:', error.message)
  else console.log(`✅ Listening videos: ${videos.length} upserted`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log(`\n🇫🇷 FrancoPath Seed Script`)
console.log(`   Level:  ${level}`)
console.log(`   Source: data/${levelLower}/`)
console.log(`   DB:     ${SUPABASE_URL}`)

if (!only || only === 'vocab') await seedVocabulary()
if (!only || only === 'grammar') await seedGrammar()
if (!only || only === 'reading') await seedReading()
if (!only || only === 'exercises') await seedExercises()
if (!only || only === 'structure') await seedLessonStructure()
if (!only || only === 'reading_resources') await seedReadingResources()
if (!only || only === 'writing_prompts') await seedWritingPrompts()
if (!only || only === 'listening_videos') await seedListeningVideos()

console.log('\n🎉 Done! Check your Supabase dashboard to verify the data.')
