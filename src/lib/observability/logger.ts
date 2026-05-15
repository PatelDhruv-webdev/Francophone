// Structured logger. Emits JSON lines to stdout/stderr so log aggregators
// (Vercel, CloudWatch, Datadog) can parse them. No runtime dependency.

import { env } from '@/lib/env'

type Level = 'debug' | 'info' | 'warn' | 'error'

interface LogFields {
  requestId?: string
  userId?: string
  route?: string
  status?: number
  code?: string
  message?: string
  durationMs?: number
  [key: string]: unknown
}

function emit(level: Level, fields: LogFields) {
  const line = {
    level,
    time: new Date().toISOString(),
    ...fields,
  }
  const serialized = JSON.stringify(line)
  if (level === 'error' || level === 'warn') console.error(serialized)
  else console.log(serialized)
}

export const logger = {
  debug(fields: LogFields) {
    if (env.NODE_ENV !== 'production') emit('debug', fields)
  },
  info(fields: LogFields) {
    emit('info', fields)
  },
  warn(fields: LogFields) {
    emit('warn', fields)
  },
  error(fields: LogFields) {
    emit('error', fields)
  },
}

export type Logger = typeof logger
