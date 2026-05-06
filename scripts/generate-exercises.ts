/**
 * scripts/generate-exercises.ts
 *
 * Step 3 of the content pipeline.
 * Reads vocabulary.json and grammar.json and generates exercise JSON
 * matching the exercises table schema (including correct_answer).
 *
 * For each vocabulary word → generates: multiple_choice, type_answer
 * For each grammar topic   → generates: fill_in_blank, word_order, conjugation (if verb)
 * Uses Claude only for grammar exercises — vocab exercises are generated locally.
 *
 * Usage:
 *   npx tsx scripts/generate-exercises.ts --level a1
 *   npx tsx scripts/generate-exercises.ts --level a1 --only grammar
 *   npx tsx scripts/generate-exercises.ts --level a1 --only vocab
 *
 * Output:
 *   data/a1/exercises.json
 */

import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

const args = process.argv.slice(2)
const levelFlag = args.indexOf('--level')
const level = levelFlag !== -1 ? (args[levelFlag + 1] ?? 'a1').toUpperCase() : 'A1'
const levelLower = level.toLowerCase()
const onlyFlag = args.indexOf('--only')
const only = onlyFlag !== -1 ? args[onlyFlag + 1] : null

const ANTHROPIC_API_KEY = process.env['ANTHROPIC_API_KEY']
if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY. Add it to .env.local first.')
  process.exit(1)
}

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
const dataDir = path.join(process.cwd(), 'data', levelLower)

// ─── Types ────────────────────────────────────────────────────────────────────

interface Exercise {
  type: string
  prompt: string
  data: Record<string, unknown>
  correct_answer: unknown
  level_code: string
  difficulty: number
  tags: string[]
}

interface VocabWord {
  french: string
  english: string
  gender?: string | null
  part_of_speech: string
  theme: string
  example_fr?: string
  example_en?: string
}

interface GrammarTopic {
  title: string
  slug: string
  explanation_md: string
  examples: Array<{ fr: string; en: string }>
  conjugation_table?: Record<string, string> | null
  level_code: string
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

// ─── Vocabulary exercises (no API needed) ─────────────────────────────────────

function generateVocabExercises(words: VocabWord[]): Exercise[] {
  const exercises: Exercise[] = []

  for (const word of words) {
    // 1. Multiple choice: French → English
    // Pick 3 random wrong answers from other words in the same part_of_speech where possible
    const pool = shuffle(
      words.filter((w) => w.french !== word.french && w.english !== word.english),
    ).slice(0, 3)

    if (pool.length === 3) {
      const distractors = pool.map((w) => w.english)
      const options = shuffle([word.english, ...distractors])
      const correctIndex = options.indexOf(word.english)

      exercises.push({
        type: 'multiple_choice',
        prompt: `What does "${word.french}" mean?`,
        data: { question: word.french, options },
        correct_answer: correctIndex,
        level_code: level,
        difficulty: 1,
        tags: ['vocabulary', word.theme, word.part_of_speech],
      })
    }

    // 2. Type answer: English → French
    exercises.push({
      type: 'type_answer',
      prompt: `How do you say "${word.english}" in French?`,
      data: {
        prompt: `"${word.english}" in French`,
        accent_tolerant: true,
        hint: word.gender
          ? `${word.gender === 'masculine' ? 'masculine noun' : 'feminine noun'}`
          : undefined,
      },
      correct_answer: word.french,
      level_code: level,
      difficulty: 2,
      tags: ['vocabulary', word.theme, 'spelling'],
    })

    // 3. Fill in blank from example sentence (if available)
    if (word.example_fr && word.example_en) {
      const blanked = word.example_fr.replace(new RegExp(`\\b${word.french}\\b`, 'i'), '___')
      if (blanked !== word.example_fr) {
        exercises.push({
          type: 'fill_in_blank',
          prompt: `Fill in the blank: ${word.example_en}`,
          data: {
            sentence: blanked,
            blanks: [{ index: 0, hint: word.part_of_speech }],
          },
          correct_answer: [word.french],
          level_code: level,
          difficulty: 2,
          tags: ['vocabulary', word.theme, 'context'],
        })
      }
    }
  }

  return exercises
}

// ─── Grammar exercises (Claude-assisted) ─────────────────────────────────────

const GRAMMAR_EXERCISE_SYSTEM = `You are a French language exercise writer creating exercises for CEFR ${level} learners.
Given a grammar topic with examples, generate 5-8 exercises.
Mix these types based on what fits:
- "fill_in_blank": a sentence with ___ gaps. correct_answer is a JSON array of strings for each blank.
- "word_order": tokens that must be rearranged. correct_answer is the ordered token array.
- "multiple_choice": choose the correct form. correct_answer is the 0-based index.
- "conjugation": fill in the correct verb form. correct_answer is the correct conjugated form string.

Return a JSON array where each item has EXACTLY:
{
  "type": string,
  "prompt": string,
  "data": object matching the type's schema,
  "correct_answer": (number | string | string[]),
  "difficulty": 1|2|3,
  "tags": string[]
}

For fill_in_blank data: { "sentence": "Je ___ étudiant.", "blanks": [{"index": 0}] }
For word_order data:    { "english": "I am a student.", "tokens": ["Je", "suis", "un", "étudiant"] }
For multiple_choice data: { "question": "Choose the correct form:", "options": ["suis", "es", "est", "sommes"] }
For conjugation data:   { "verb": "être", "tense": "présent", "subject": "je" }

IMPORTANT: correct_answer must ALWAYS be the right answer value, not a description of it.
Return ONLY the JSON array.`

async function generateGrammarExercises(topics: GrammarTopic[]): Promise<Exercise[]> {
  console.log(`\n✏️  Generating grammar exercises for ${topics.length} topics…`)
  const all: Exercise[] = []

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i]!
    process.stdout.write(`   "${topic.title}"… `)

    const userContent = `Grammar topic: ${topic.title}
Slug: ${topic.slug}
Examples: ${JSON.stringify(topic.examples, null, 2)}
${topic.conjugation_table ? `Conjugation table: ${JSON.stringify(topic.conjugation_table, null, 2)}` : ''}

Generate 5-8 diverse exercises for this grammar point.`

    try {
      const raw = await client.messages.create({
        model: 'claude-opus-4-7',
        max_tokens: 3000,
        messages: [{ role: 'user', content: userContent }],
        system: GRAMMAR_EXERCISE_SYSTEM,
      })

      const block = raw.content[0]
      if (block?.type !== 'text') throw new Error('unexpected response type')

      const text = block.text
        .replace(/^```json\s*/m, '')
        .replace(/\s*```$/m, '')
        .trim()
      let exercises: Exercise[] = []
      try {
        exercises = JSON.parse(text) as Exercise[]
      } catch {
        const match = text.match(/(\[[\s\S]*\])/)
        if (match?.[0]) exercises = JSON.parse(match[0]) as Exercise[]
      }

      const tagged = exercises.map((ex) => ({
        ...ex,
        level_code: level,
        tags: [...(ex.tags ?? []), 'grammar', topic.slug],
      }))

      all.push(...tagged)
      process.stdout.write(`✓ ${tagged.length} exercises\n`)
    } catch (err) {
      process.stdout.write(`✗ ${err}\n`)
    }

    if (i < topics.length - 1) await sleep(600)
  }

  return all
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log(`\n🇫🇷 FrancoPath Exercise Generator`)
console.log(`   Level:  ${level}`)
console.log(`   Source: data/${levelLower}/`)

const exercisesPath = path.join(dataDir, 'exercises.json')
let existing: Exercise[] = []
if (fs.existsSync(exercisesPath)) {
  existing = JSON.parse(fs.readFileSync(exercisesPath, 'utf-8')) as Exercise[]
  console.log(`   Found ${existing.length} existing exercises — will append new ones`)
}

const allExercises: Exercise[] = [...existing]

if (!only || only === 'vocab') {
  const vocabPath = path.join(dataDir, 'vocabulary.json')
  if (!fs.existsSync(vocabPath)) {
    console.warn('⚠  No vocabulary.json found — skipping vocab exercises')
  } else {
    const words = JSON.parse(fs.readFileSync(vocabPath, 'utf-8')) as VocabWord[]
    console.log(`\n📚 Generating vocab exercises for ${words.length} words…`)
    const vocabExercises = generateVocabExercises(words)
    allExercises.push(...vocabExercises)
    console.log(`✅ Generated ${vocabExercises.length} vocabulary exercises`)
  }
}

if (!only || only === 'grammar') {
  const grammarPath = path.join(dataDir, 'grammar.json')
  if (!fs.existsSync(grammarPath)) {
    console.warn('⚠  No grammar.json found — skipping grammar exercises')
  } else {
    const topics = JSON.parse(fs.readFileSync(grammarPath, 'utf-8')) as GrammarTopic[]
    const grammarExercises = await generateGrammarExercises(topics)
    allExercises.push(...grammarExercises)
    console.log(`✅ Generated ${grammarExercises.length} grammar exercises`)
  }
}

fs.writeFileSync(exercisesPath, JSON.stringify(allExercises, null, 2))
console.log(`\n✅ Total exercises: ${allExercises.length} → ${exercisesPath}`)
console.log('\nNext step:')
console.log(`  npx tsx scripts/seed.ts --level ${levelLower}`)
