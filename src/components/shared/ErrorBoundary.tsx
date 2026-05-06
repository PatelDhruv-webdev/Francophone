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
          className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[rgba(30,27,22,0.10)] bg-[#F7F4EF] p-8 text-center"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <p
            className="text-lg font-semibold text-[#1E1B16]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Quelque chose s&apos;est mal passé
          </p>
          <a
            href="/dashboard"
            className="text-sm font-medium text-[#C24E2A] underline underline-offset-2 transition-colors hover:text-[#A03D20]"
          >
            Retour au tableau de bord
          </a>
        </div>
      )
    }

    return this.props.children
  }
}
