/**
 * scripts/parse-content.ts
 *
 * Step 2 of the content pipeline.
 * Takes raw text extracted from a PDF and uses the Claude API to structure it
 * into vocabulary, grammar topics, and reading texts in our exact DB schema format.
 *
 * Usage:
 *   npx tsx scripts/parse-content.ts data/raw/all-in-one-french.txt --level a1
 *   npx tsx scripts/parse-content.ts data/raw/all-in-one-french.txt --level a1 --only vocab
 *   npx tsx scripts/parse-content.ts data/raw/all-in-one-french.txt --level a1 --only grammar
 *
 * Outputs:
 *   data/a1/vocabulary.json
 *   data/a1/grammar.json
 *   data/a1/reading.json
 *
 * Requires: ANTHROPIC_API_KEY in .env.local
 */

import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

// ─── CLI args ───────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const textPath = args[0]
const levelFlag = args.indexOf('--level')
const level = levelFlag !== -1 ? (args[levelFlag + 1] ?? 'a1').toUpperCase() : 'A1'
const onlyFlag = args.indexOf('--only')
const only = onlyFlag !== -1 ? args[onlyFlag + 1] : null // 'vocab' | 'grammar' | 'reading'

if (!textPath || !fs.existsSync(textPath)) {
  console.error(
    'Usage: npx tsx scripts/parse-content.ts <raw-text-file> [--level a1] [--only vocab|grammar|reading]',
  )
  process.exit(1)
}

const ANTHROPIC_API_KEY = process.env['ANTHROPIC_API_KEY']
if (!ANTHROPIC_API_KEY) {
  console.error('Missing ANTHROPIC_API_KEY in environment. Add it to .env.local and run:')
  console.error('  source .env.local && npx tsx scripts/parse-content.ts ...')
  process.exit(1)
}

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })
const rawText = fs.readFileSync(textPath, 'utf-8')
const outDir = path.join(process.cwd(), 'data', level.toLowerCase())
fs.mkdirSync(outDir, { recursive: true })

// ─── Chunking ────────────────────────────────────────────────────────────────

// Split text into ~4000-char chunks on paragraph boundaries
function chunkText(text: string, maxChars = 4000): string[] {
  const paragraphs = text.split(/\n\n+/)
  const chunks: string[] = []
  let current = ''
  for (const para of paragraphs) {
    if (current.length + para.length > maxChars && current.length > 0) {
      chunks.push(current.trim())
      current = ''
    }
    current += para + '\n\n'
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

// ─── Type definitions (matching DB schema) ───────────────────────────────────

interface VocabWord {
  french: string
  english: string
  ipa?: string
  gender?: 'masculine' | 'feminine' | null
  part_of_speech: string
  theme: string
  example_fr?: string
  example_en?: string
  level_code: string
}

interface GrammarTopic {
  title: string
  slug: string
  explanation_md: string
  key_points: string[]
  examples: Array<{ fr: string; en: string }>
  conjugation_table?: Record<string, string>
  common_mistakes?: string[]
  level_code: string
  order_index: number
}

interface ReadingText {
  title: string
  content_md: string
  english_translation?: string
  theme: string
  word_count: number
  level_code: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function callClaude(systemPrompt: string, userContent: string): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 4096,
    messages: [{ role: 'user', content: userContent }],
    system: systemPrompt,
  })
  const block = message.content[0]
  if (block?.type !== 'text') throw new Error('Unexpected response type from Claude')
  return block.text
}

function extractJSON<T>(text: string): T | null {
  // Claude sometimes wraps JSON in ```json ... ``` — strip that
  const cleaned = text
    .replace(/^```json\s*/m, '')
    .replace(/\s*```$/m, '')
    .trim()
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Try to extract just the array/object portion
    const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/)
    if (match?.[0]) {
      try {
        return JSON.parse(match[0]) as T
      } catch {
        return null
      }
    }
    return null
  }
}

// ─── Vocabulary extraction ───────────────────────────────────────────────────

const VOCAB_SYSTEM = `You are a French language curriculum specialist extracting vocabulary from a textbook.
Extract every French word or phrase you find and return a JSON array.
Each item must have exactly these fields:
- french: the French word/phrase (string)
- english: English translation (string)
- ipa: IPA pronunciation if inferable (string or null)
- gender: "masculine", "feminine", or null (for non-nouns)
- part_of_speech: "noun", "verb", "adjective", "adverb", "pronoun", "preposition", "conjunction", "interjection", or "phrase"
- theme: category such as "salutations", "family", "food", "numbers", "colors", "body", "house", "transport", "clothing", "places", "animals", "verbs", "adjectives", "time", "weather", or "other"
- example_fr: a simple example sentence in French using this word (string or null)
- example_en: English translation of the example (string or null)
- level_code: "${level}"

Return ONLY the JSON array, no explanation. If a section has no vocabulary, return [].`

async function extractVocabulary(chunks: string[]): Promise<VocabWord[]> {
  console.log(`\n📚 Extracting vocabulary from ${chunks.length} chunks…`)
  const all: VocabWord[] = []
  const seen = new Set<string>()

  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`   Chunk ${i + 1}/${chunks.length}… `)
    try {
      const raw = await callClaude(
        VOCAB_SYSTEM,
        `Extract vocabulary from this section:\n\n${chunks[i]}`,
      )
      const words = extractJSON<VocabWord[]>(raw)
      if (words && Array.isArray(words)) {
        const newWords = words.filter((w) => w.french && !seen.has(w.french.toLowerCase()))
        newWords.forEach((w) => seen.add(w.french.toLowerCase()))
        all.push(...newWords)
        process.stdout.write(`✓ ${newWords.length} words (total: ${all.length})\n`)
      } else {
        process.stdout.write(`⚠ no JSON found\n`)
      }
    } catch (err) {
      process.stdout.write(`✗ error: ${err}\n`)
    }
    if (i < chunks.length - 1) await sleep(500) // rate limit courtesy delay
  }

  return all
}

// ─── Grammar extraction ───────────────────────────────────────────────────────

const GRAMMAR_SYSTEM = `You are a French grammar curriculum specialist.
Identify grammar topics and rules in this text and return a JSON array.
Each item must have exactly these fields:
- title: clear English title like "Subject Pronouns" or "Present Tense of être" (string)
- slug: kebab-case identifier like "subject-pronouns" or "etre-present" (string)
- explanation_md: full Markdown explanation suitable for a learner. Use ## for subsections, **bold** for key terms, tables for conjugations (string)
- key_points: array of 3-5 short bullet strings summarising the most important rules
- examples: array of objects with "fr" (French sentence) and "en" (English translation), minimum 3 examples
- conjugation_table: if this topic involves a verb, an object like {"je": "suis", "tu": "es", "il/elle": "est", "nous": "sommes", "vous": "êtes", "ils/elles": "sont"}. Otherwise null.
- common_mistakes: array of 2-3 strings describing typical learner errors for this topic (or null)
- level_code: "${level}"
- order_index: sequential integer starting from 1

Return ONLY the JSON array. If a section contains no grammar rules, return [].`

async function extractGrammar(chunks: string[]): Promise<GrammarTopic[]> {
  console.log(`\n📖 Extracting grammar topics from ${chunks.length} chunks…`)
  const all: GrammarTopic[] = []
  const seenSlugs = new Set<string>()

  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`   Chunk ${i + 1}/${chunks.length}… `)
    try {
      const raw = await callClaude(
        GRAMMAR_SYSTEM,
        `Extract grammar topics from this section:\n\n${chunks[i]}`,
      )
      const topics = extractJSON<GrammarTopic[]>(raw)
      if (topics && Array.isArray(topics)) {
        const newTopics = topics.filter((t) => t.slug && !seenSlugs.has(t.slug))
        newTopics.forEach((t) => seenSlugs.add(t.slug))
        // Re-sequence order_index
        newTopics.forEach((t, idx) => {
          t.order_index = all.length + idx + 1
        })
        all.push(...newTopics)
        process.stdout.write(`✓ ${newTopics.length} topics (total: ${all.length})\n`)
      } else {
        process.stdout.write(`⚠ no JSON found\n`)
      }
    } catch (err) {
      process.stdout.write(`✗ error: ${err}\n`)
    }
    if (i < chunks.length - 1) await sleep(500)
  }

  return all
}

// ─── Reading text extraction ──────────────────────────────────────────────────

const READING_SYSTEM = `You are extracting short French reading passages from a textbook.
Identify complete paragraphs or short texts suitable for reading comprehension practice.
Return a JSON array where each item has:
- title: a descriptive title for the text (string)
- content_md: the French text in Markdown. Use *italics* for any glossed words. (string)
- english_translation: full English translation (string or null)
- theme: topic like "self-introduction", "family", "at the cafe", "shopping", "daily routine", "weather", "my apartment", "at school", "planning a trip", "a recipe", or "other"
- word_count: approximate word count of the French text (number)
- level_code: "${level}"

Only include texts that are at least 30 words long.
Return ONLY the JSON array. If no reading texts are found, return [].`

async function extractReadingTexts(chunks: string[]): Promise<ReadingText[]> {
  console.log(`\n📰 Extracting reading texts from ${chunks.length} chunks…`)
  const all: ReadingText[] = []
  const seenTitles = new Set<string>()

  for (let i = 0; i < chunks.length; i++) {
    process.stdout.write(`   Chunk ${i + 1}/${chunks.length}… `)
    try {
      const raw = await callClaude(
        READING_SYSTEM,
        `Extract reading texts from this section:\n\n${chunks[i]}`,
      )
      const texts = extractJSON<ReadingText[]>(raw)
      if (texts && Array.isArray(texts)) {
        const newTexts = texts.filter((t) => t.title && !seenTitles.has(t.title))
        newTexts.forEach((t) => seenTitles.add(t.title))
        all.push(...newTexts)
        process.stdout.write(`✓ ${newTexts.length} texts (total: ${all.length})\n`)
      } else {
        process.stdout.write(`⚠ no JSON found\n`)
      }
    } catch (err) {
      process.stdout.write(`✗ error: ${err}\n`)
    }
    if (i < chunks.length - 1) await sleep(500)
  }

  return all
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log(`\n🇫🇷 FrancoPath Content Parser`)
console.log(`   Source: ${textPath}`)
console.log(`   Level:  ${level}`)
console.log(`   Output: data/${level.toLowerCase()}/\n`)

const chunks = chunkText(rawText)
console.log(`   Split into ${chunks.length} chunks (~4000 chars each)`)

if (!only || only === 'vocab') {
  const vocab = await extractVocabulary(chunks)
  const vocabPath = path.join(outDir, 'vocabulary.json')

  // Merge with any existing vocabulary (avoid duplicates)
  let existing: VocabWord[] = []
  if (fs.existsSync(vocabPath)) {
    existing = JSON.parse(fs.readFileSync(vocabPath, 'utf-8')) as VocabWord[]
    const existingFr = new Set(existing.map((w) => w.french.toLowerCase()))
    const merged = [...existing, ...vocab.filter((w) => !existingFr.has(w.french.toLowerCase()))]
    fs.writeFileSync(vocabPath, JSON.stringify(merged, null, 2))
    console.log(`\n✅ Vocabulary: ${merged.length} words (${vocab.length} new) → ${vocabPath}`)
  } else {
    fs.writeFileSync(vocabPath, JSON.stringify(vocab, null, 2))
    console.log(`\n✅ Vocabulary: ${vocab.length} words → ${vocabPath}`)
  }
}

if (!only || only === 'grammar') {
  const grammar = await extractGrammar(chunks)
  const grammarPath = path.join(outDir, 'grammar.json')
  fs.writeFileSync(grammarPath, JSON.stringify(grammar, null, 2))
  console.log(`\n✅ Grammar: ${grammar.length} topics → ${grammarPath}`)
}

if (!only || only === 'reading') {
  const reading = await extractReadingTexts(chunks)
  const readingPath = path.join(outDir, 'reading.json')
  fs.writeFileSync(readingPath, JSON.stringify(reading, null, 2))
  console.log(`\n✅ Reading texts: ${reading.length} passages → ${readingPath}`)
}

console.log('\nNext step:')
console.log(`  npx tsx scripts/generate-exercises.ts --level ${level.toLowerCase()}`)
