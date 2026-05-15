import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WritingEditor } from './WritingEditor'

interface Props {
  params: Promise<{ id: string }>
}

export default async function WritingPage({ params }: Props) {
  const { id } = await params

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?redirectTo=/writing/${id}`)
  }

  const { data: prompt } = await supabase.from('writing_prompts').select('*').eq('id', id).single()

  if (!prompt) {
    redirect('/dashboard')
  }

  return (
    <div className="bg-bg min-h-screen">
      <WritingEditor prompt={prompt} />
    </div>
  )
}
