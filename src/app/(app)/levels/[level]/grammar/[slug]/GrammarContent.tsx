'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Volume2, AlertCircle, CheckCircle2 } from 'lucide-react'

function speakFrench(text: string) {
  if (!('speechSynthesis' in window)) return
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'fr-FR'
  utt.rate = 0.85
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utt)
}

interface GrammarTopic {
  title: string
  slug: string
  explanation_md: string
  key_points: string[] | null
  examples: Array<{ fr: string; en: string }> | null
  conjugation_table: Record<string, string> | null
  common_mistakes: string[] | null
}

export function GrammarContent({ topic }: { topic: GrammarTopic; levelSlug?: string }) {
  return (
    <div>
      <h1
        className="text-fg mb-6 text-2xl font-bold sm:text-3xl"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {topic.title}
      </h1>

      {/* Key points */}
      {topic.key_points && topic.key_points.length > 0 && (
        <div className="mb-6 rounded-xl border border-[rgba(194,78,42,0.2)] bg-[#F5E8E3] p-4">
          <h3 className="text-brand mb-2 text-sm font-semibold tracking-wide uppercase">
            Key Points
          </h3>
          <ul className="space-y-1">
            {topic.key_points.map((point, i) => (
              <li key={i} className="text-fg flex items-start gap-2 text-sm">
                <CheckCircle2 className="text-brand mt-0.5 h-4 w-4 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Explanation (Markdown) */}
      <div className="prose prose-sm grammar-prose mb-6 max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ children }) => (
              <h2
                className="text-fg mt-6 mb-3 text-xl font-bold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-fg mt-4 mb-2 text-base font-semibold">{children}</h3>
            ),
            p: ({ children }) => <p className="text-fg mb-3 text-sm leading-relaxed">{children}</p>,
            ul: ({ children }) => (
              <ul className="text-fg mb-3 list-inside list-disc space-y-1 text-sm">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="text-fg mb-3 list-inside list-decimal space-y-1 text-sm">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="text-fg text-sm">{children}</li>,
            strong: ({ children }) => (
              <strong className="text-brand font-semibold">{children}</strong>
            ),
            em: ({ children }) => <em className="text-fg italic">{children}</em>,
            code: ({ children }) => (
              <code className="bg-bg text-brand rounded px-1.5 py-0.5 font-mono text-xs">
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-brand bg-bg text-fg-muted my-3 rounded-r-lg border-l-3 py-1 pl-4 text-sm italic">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="mb-4 overflow-x-auto rounded-xl border border-[rgba(30,27,22,0.1)]">
                <table className="w-full text-sm">{children}</table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-bg">{children}</thead>,
            th: ({ children }) => (
              <th className="text-fg-muted px-4 py-2.5 text-left text-xs font-semibold tracking-wide uppercase">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="text-fg border-t border-[rgba(30,27,22,0.06)] px-4 py-2.5 text-sm">
                {children}
              </td>
            ),
            tr: ({ children }) => <tr className="hover:bg-[#FAFAF8]">{children}</tr>,
          }}
        >
          {topic.explanation_md}
        </ReactMarkdown>
      </div>

      {/* Conjugation table (standalone if present) */}
      {topic.conjugation_table && (
        <div className="mb-6">
          <h3 className="text-fg mb-3 text-sm font-semibold tracking-wide uppercase">
            Conjugation Table
          </h3>
          <div className="overflow-hidden rounded-xl border border-[rgba(30,27,22,0.1)]">
            <table className="w-full text-sm">
              <thead className="bg-bg">
                <tr>
                  <th className="text-fg-muted w-1/2 px-4 py-2.5 text-left text-xs font-semibold tracking-wide uppercase">
                    Pronom
                  </th>
                  <th className="text-fg-muted w-1/2 px-4 py-2.5 text-left text-xs font-semibold tracking-wide uppercase">
                    Forme
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(topic.conjugation_table).map(([pronoun, form]) => (
                  <tr
                    key={pronoun}
                    className="border-t border-[rgba(30,27,22,0.06)] hover:bg-[#FAFAF8]"
                  >
                    <td className="text-fg-muted px-4 py-2.5 font-medium">{pronoun}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-fg font-medium" style={{ letterSpacing: '0.02em' }}>
                          {form}
                        </span>
                        <button
                          onClick={() => speakFrench(form)}
                          className="text-fg-subtle hover:text-brand rounded p-1 transition-colors hover:bg-[#F5E8E3]"
                          title="Listen"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Examples */}
      {topic.examples && topic.examples.length > 0 && (
        <div className="mb-6">
          <h3 className="text-fg mb-3 text-sm font-semibold tracking-wide uppercase">Examples</h3>
          <div className="space-y-2">
            {topic.examples.map((ex, i) => (
              <div
                key={i}
                className="group flex items-start gap-3 rounded-xl border border-[rgba(30,27,22,0.08)] bg-white px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p
                    className="text-fg text-base font-medium"
                    style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}
                  >
                    {ex.fr}
                  </p>
                  <p className="text-fg-muted mt-0.5 text-sm">{ex.en}</p>
                </div>
                <button
                  onClick={() => speakFrench(ex.fr)}
                  className="text-fg-subtle hover:text-brand flex-shrink-0 rounded-full p-1.5 opacity-0 transition-colors group-hover:opacity-100 hover:bg-[#F5E8E3]"
                  title="Listen"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common mistakes */}
      {topic.common_mistakes && topic.common_mistakes.length > 0 && (
        <div className="rounded-xl border border-[rgba(155,35,53,0.15)] bg-[#F9EAEC] p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-[#9B2335]" />
            <h3 className="text-sm font-semibold tracking-wide text-[#9B2335] uppercase">
              Common Mistakes
            </h3>
          </div>
          <ul className="space-y-1.5">
            {topic.common_mistakes.map((mistake, i) => (
              <li key={i} className="text-fg text-sm">
                {mistake}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
