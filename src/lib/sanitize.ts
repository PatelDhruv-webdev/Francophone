// HTML / rich-text sanitizer. Use for any user-submitted text that will be
// stored or rendered. The previous regex strip (replace(/<[^>]*>/g, '')) missed
// entity-encoded payloads and event handlers — DOMPurify handles those properly.

import DOMPurify from 'isomorphic-dompurify'

// Strict: removes all tags, returns plain text. Use for writing submissions
// where we never want any HTML in the stored content.
export function stripHtml(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim()
}

// Permissive: allows simple inline formatting. Use for AI-generated feedback
// that we want to render as styled text.
export function sanitizeRichText(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'mark', 'br', 'p', 'ul', 'ol', 'li', 'code'],
    ALLOWED_ATTR: [],
  })
}
