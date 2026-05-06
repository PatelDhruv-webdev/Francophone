'use client'

// NOTE: This component uses the Web Speech API (SpeechRecognition) which is not
// available during SSR. It must be imported with dynamic() + { ssr: false }
// in ExerciseRunner or any server component tree:
//   const SpeakingRepeat = dynamic(() => import('./SpeakingRepeat').then(m => ({ default: m.SpeakingRepeat })), { ssr: false })

import { cn } from '@/lib/utils'
import { useSpeakingRepeat } from './headless/useSpeakingRepeat'
import { Volume2, Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle } from 'lucide-react'

interface SpeakingRepeatProps {
  prompt: string
  data: {
    phrase: string
    translation?: string
  }
  disabled: boolean
  onSubmit: (answer: string) => void
}

function speakFrench(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.lang = 'fr-FR'
  window.speechSynthesis.speak(utt)
}

export function SpeakingRepeat({ prompt, data, disabled, onSubmit }: SpeakingRepeatProps) {
  const { recordingState, transcript, correct, startRecording, stopRecording, reset, isSupported } =
    useSpeakingRepeat(
      data.phrase,
      // onResult is called by the hook with the correctness judgment.
      // The parent (ExerciseRunner) is notified via the Continue button's onSubmit call.
      () => {},
      0,
      0,
    )

  if (!isSupported) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-foreground french-text text-lg font-medium">{prompt}</p>
        <div className="rounded-xl border-2 border-[#9B2335]/40 bg-[#F9EAEC] p-4 text-sm text-[#9B2335]">
          La reconnaissance vocale n&apos;est pas disponible dans votre navigateur. Utilisez Chrome.
        </div>
      </div>
    )
  }

  const isRecording = recordingState === 'recording'
  const isProcessing = recordingState === 'processing'
  const isDone = recordingState === 'done'

  return (
    <div className="flex flex-col gap-6">
      <p className="text-foreground french-text text-lg font-medium">{prompt}</p>

      {/* Phrase to repeat */}
      <div className="border-border bg-card flex flex-col gap-2 rounded-xl border-2 p-4 shadow-[0_2px_8px_rgba(30,27,22,0.08)]">
        <p
          className="french-text text-2xl font-bold text-[#1E1B16]"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {data.phrase}
        </p>
        {data.translation && <p className="text-sm text-[#6B6460]">{data.translation}</p>}
      </div>

      {/* TTS button */}
      <button
        onClick={() => speakFrench(data.phrase)}
        className="border-border text-muted-foreground flex items-center gap-2 self-start rounded-xl border-2 px-4 py-2 text-sm font-medium transition-colors hover:border-[#C24E2A] hover:text-[#C24E2A]"
        type="button"
        aria-label="Écouter la phrase"
      >
        <Volume2 className="h-4 w-4" />
        Écouter d&apos;abord
      </button>

      {/* Microphone button */}
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={isRecording ? stopRecording : isDone ? reset : startRecording}
          disabled={disabled || isProcessing}
          className={cn(
            'relative flex h-20 w-20 items-center justify-center rounded-full',
            'transition-all duration-200 focus-visible:ring-4 focus-visible:outline-none',
            isRecording
              ? 'animate-pulse bg-[#9B2335] hover:bg-[#7D1C2A] focus-visible:ring-[#9B2335]/30'
              : isDone
                ? correct
                  ? 'bg-[#2F7D52] focus-visible:ring-[#2F7D52]/30'
                  : 'bg-[#9B2335] focus-visible:ring-[#9B2335]/30'
                : 'bg-[#6B6460] hover:bg-[#1E1B16] focus-visible:ring-[#6B6460]/30',
            (disabled || isProcessing) && 'cursor-not-allowed opacity-60',
          )}
          aria-label={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
        >
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : isRecording ? (
            <MicOff className="h-8 w-8 text-white" />
          ) : (
            <Mic className="h-8 w-8 text-white" />
          )}
        </button>

        <p className="text-sm text-[#6B6460]">
          {recordingState === 'idle' && 'Appuyez pour parler'}
          {recordingState === 'recording' && 'Enregistrement en cours… appuyez pour arrêter'}
          {recordingState === 'processing' && 'Traitement…'}
          {recordingState === 'done' && 'Enregistrement terminé'}
        </p>
      </div>

      {/* Result after done */}
      {isDone && (
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl border-2 p-4',
            correct ? 'border-[#2F7D52] bg-[#E8F5EE]' : 'border-[#9B2335] bg-[#F9EAEC]',
          )}
        >
          {correct ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#2F7D52]" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#9B2335]" />
          )}
          <div>
            <p
              className={cn('text-sm font-semibold', correct ? 'text-[#2F7D52]' : 'text-[#9B2335]')}
            >
              {correct ? 'Parfait !' : 'Essayez encore'}
            </p>
            {transcript && (
              <p className="french-text mt-0.5 text-sm text-[#6B6460]">
                Entendu : &ldquo;{transcript}&rdquo;
              </p>
            )}
          </div>
        </div>
      )}

      {/* Retry / continue */}
      {isDone && (
        <div className="flex gap-3">
          <Button
            onClick={reset}
            variant="outline"
            disabled={disabled}
            className="h-12 flex-1 rounded-xl border-2 font-semibold"
          >
            Réessayer
          </Button>
          <Button
            onClick={() => onSubmit(transcript)}
            disabled={disabled}
            className="h-12 flex-1 rounded-xl bg-[#C24E2A] font-semibold text-white hover:bg-[#A03D20]"
          >
            Continuer
          </Button>
        </div>
      )}
    </div>
  )
}
