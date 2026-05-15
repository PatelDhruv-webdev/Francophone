import React from 'react'

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ReactNode }>,
  State
> {
  constructor(props: React.PropsWithChildren<{ fallback?: React.ReactNode }>) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className="bg-bg flex flex-col items-center justify-center gap-4 rounded-2xl border border-[rgba(30,27,22,0.10)] p-8 text-center"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <p
            className="text-fg text-lg font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Quelque chose s&apos;est mal passé
          </p>
          <a
            href="/dashboard"
            className="text-brand hover:text-brand-dark text-sm font-medium underline underline-offset-2 transition-colors"
          >
            Retour au tableau de bord
          </a>
        </div>
      )
    }

    return this.props.children
  }
}
