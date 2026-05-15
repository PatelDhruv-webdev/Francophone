import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ListeningExercise } from './ListeningPlayer'
import { ListeningPlayer } from './ListeningPlayer'

export interface ListeningVideo {
  id: string
  youtube_id: string
  title: string
  channel_name: string
  duration_seconds: number
  level_code: string
  theme: string
  description: string | null
  transcript: string | null
  exercises: ListeningExercise[]
  order_index: number
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ListeningVideoPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()

  const { data: video } = await supabase.from('listening_videos').select('*').eq('id', id).single()

  if (!video) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let alreadyCompleted = false
  if (user) {
    const { data: progress } = await supabase
      .from('user_listening_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('video_id', id)
      .maybeSingle()

    alreadyCompleted = !!progress
  }

  return (
    <div className="bg-bg min-h-screen">
      <div className="mx-auto max-w-6xl p-4 lg:p-8">
        {/* Page heading */}
        <div className="mb-6">
          <h1
            className="text-fg text-2xl leading-tight font-bold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {video.title}
          </h1>
          <p className="text-fg-muted mt-1 text-sm">{video.channel_name}</p>
        </div>

        <ListeningPlayer video={video as ListeningVideo} alreadyCompleted={alreadyCompleted} />
      </div>
    </div>
  )
}
