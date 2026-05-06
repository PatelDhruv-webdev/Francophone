/**
 * scripts/extract-pdf.ts
 *
 * Step 1 of the content pipeline.
 * Extracts raw text from a French learning PDF and saves it as a .txt file
 * in data/raw/ so the parse-content script can process it.
 *
 * Usage:
 *   npx tsx scripts/extract-pdf.ts /path/to/french-book.pdf
 *   npx tsx scripts/extract-pdf.ts /path/to/french-book.pdf --level a2
 */

import fs from 'fs'
import path from 'path'
// @ts-expect-error — pdf-parse has no bundled types
import pdfParse from 'pdf-parse'

const args = process.argv.slice(2)
const pdfPath = args[0]
const levelFlag = args.indexOf('--level')
const level = levelFlag !== -1 ? (args[levelFlag + 1] ?? 'a1') : 'a1'

if (!pdfPath) {
  console.error('Usage: npx tsx scripts/extract-pdf.ts <path-to-pdf> [--level a1|a2|b1|b2|c1|c2]')
  process.exit(1)
}

if (!fs.existsSync(pdfPath)) {
  console.error(`File not found: ${pdfPath}`)
  process.exit(1)
}

const outDir = path.join(process.cwd(), 'data', 'raw')
fs.mkdirSync(outDir, { recursive: true })

const basename = path.basename(pdfPath, '.pdf').replace(/\s+/g, '-').toLowerCase()
const outPath = path.join(outDir, `${basename}.txt`)
const metaPath = path.join(outDir, `${basename}.meta.json`)

console.log(`📄 Reading ${pdfPath} …`)

const buffer = fs.readFileSync(pdfPath)
const result = await pdfParse(buffer)

console.log(`   ${result.numpages} pages, ~${result.text.length.toLocaleString()} characters`)

// Save raw text
fs.writeFileSync(outPath, result.text, 'utf-8')

// Save metadata so parse-content knows what level to tag content
fs.writeFileSync(
  metaPath,
  JSON.stringify(
    { level, pages: result.numpages, chars: result.text.length, source: pdfPath },
    null,
    2,
  ),
)

console.log(`✅ Saved raw text → ${outPath}`)
console.log(`   Metadata     → ${metaPath}`)
console.log()
console.log('Next step:')
console.log(`  npx tsx scripts/parse-content.ts data/raw/${basename}.txt --level ${level}`)
