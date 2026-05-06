import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CEFR_LEVELS } from '@/constants/levels'
import { ListeningBrowser } from './ListeningBrowser'

interface Props {
  params: Promise<{ level: string }>
}

export default async function ListeningPage({ params }: Props) {
  const { level } = await params
  const levelCode = level.toUpperCase()

  if (!CEFR_LEVELS.includes(levelCode as (typeof CEFR_LEVELS)[number])) notFound()

  const supabase = await createClient()

  const { data: videos } = await supabase
    .from('listening_videos')
    .select('*')
    .eq('level_code', levelCode)
    .order('order_index')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let completedVideoIds: string[] = []
  if (user) {
    const { data: progress } = await supabase
      .from('user_listening_progress')
      .select('video_id')
      .eq('user_id', user.id)

    completedVideoIds = (progress ?? []).map((p) => p.video_id)
  }

  const allVideos = videos ?? []
  const themes = [...new Set(allVideos.map((v) => v.theme))].sort()

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1
            className="text-2xl font-bold text-[#1E1B16]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {levelCode} Écoute
          </h1>
          <p className="mt-0.5 text-sm text-[#6B6460]">
            {allVideos.length} vidéo{allVideos.length !== 1 ? 's' : ''} à travers {themes.length}{' '}
            thème{themes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <ListeningBrowser
          videos={allVideos}
          themes={themes}
          completedVideoIds={completedVideoIds}
        />
      </div>
    </div>
  )
}
