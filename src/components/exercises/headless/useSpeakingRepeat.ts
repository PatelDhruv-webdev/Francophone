'use client'

import { useState, useCallback, useRef } from 'react'

export type RecordingState = 'idle' | 'recording' | 'processing' | 'done'

export interface UseSpeakingRepeatReturn {
  recordingState: RecordingState
  transcript: string
  correct: boolean | null
  startRecording: () => void
  stopRecording: () => void
  reset: () => void
  isSupported: boolean
}

/** Strip accents via NFD decomposition then remove combining marks */
function normalize(str: string): string {
  return str.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

// Web Speech API type shims — the built-in DOM lib may not include these
interface SpeechRecognitionResultItem {
  transcript: string
  confidence: number
}
interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResultItem[]
  [index: number]: SpeechRecognitionResultItem[]
}
interface SpeechRecognitionResultEvent extends Event {
  results: SpeechRecognitionResultList
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}
type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

const isSpeechSupported =
  typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

export function useSpeakingRepeat(
  targetPhrase: string,
  onResult: (correct: boolean, xp: number) => void,
  xpCorrect: number,
  xpAttempted: number,
): UseSpeakingRepeatReturn {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [transcript, setTranscript] = useState('')
  const [correct, setCorrect] = useState<boolean | null>(null)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const startRecording = useCallback(() => {
    const Ctor = getSpeechRecognition()
    if (!Ctor) return

    const recognition = new Ctor()
    recognition.lang = 'fr-FR'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setRecordingState('recording')
    }

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      setRecordingState('processing')
      const result = event.results[0]?.[0]?.transcript ?? ''
      setTranscript(result)
      const isCorrect = normalize(result) === normalize(targetPhrase)
      setCorrect(isCorrect)
      setRecordingState('done')
      onResult(isCorrect, isCorrect ? xpCorrect : xpAttempted)
    }

    recognition.onerror = () => {
      setRecordingState('idle')
    }

    recognition.onend = () => {
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [targetPhrase, onResult, xpCorrect, xpAttempted])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
  }, [])

  const reset = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setRecordingState('idle')
    setTranscript('')
    setCorrect(null)
  }, [])

  return {
    recordingState,
    transcript,
    correct,
    startRecording,
    stopRecording,
    reset,
    isSupported: isSpeechSupported,
  }
}
