interface Props {
  lines?: number
  className?: string
  variant?: 'card' | 'text' | 'circle'
}

export function LoadingSkeleton({ lines = 3, className, variant = 'text' }: Props) {
  const baseShimmer = 'animate-pulse bg-[rgba(30,27,22,0.08)] rounded'

  if (variant === 'circle') {
    return (
      <div className={`${baseShimmer} h-10 w-10 flex-shrink-0 rounded-full ${className ?? ''}`} />
    )
  }

  if (variant === 'card') {
    return <div className={`${baseShimmer} h-36 w-full rounded-xl ${className ?? ''}`} />
  }

  // 'text' variant: stacked shimmer lines of varying widths
  const widths = ['w-full', 'w-4/5', 'w-3/5', 'w-2/3', 'w-full', 'w-1/2']

  return (
    <div className={`flex flex-col gap-2.5 ${className ?? ''}`}>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className={`${baseShimmer} h-4 ${widths[i % widths.length] ?? 'w-full'}`} />
      ))}
    </div>
  )
}
