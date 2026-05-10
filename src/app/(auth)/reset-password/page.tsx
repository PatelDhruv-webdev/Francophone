'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type ResetForm = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({ resolver: zodResolver(schema) })

  async function onSubmit(values: ResetForm) {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) {
      setServerError(error.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <Card className="shadow-card border-0">
        <CardContent className="space-y-4 pt-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F5E6B8]">
            <span className="text-2xl">📬</span>
          </div>
          <h2
            className="text-fg text-xl font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Email sent
          </h2>
          <p className="text-fg-muted text-sm">
            Check your inbox for a password reset link. It expires in 1 hour.
          </p>
          <Link href="/login" className="text-brand hover:text-brand-dark text-sm font-medium">
            Back to sign in
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-display)' }}>
          Reset your password
        </CardTitle>
        <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-[#9B2335]">{errors.email.message}</p>}
          </div>

          {serverError && (
            <div className="rounded-lg border border-[#9B2335]/20 bg-[#F9EAEC] px-4 py-3">
              <p className="text-sm text-[#9B2335]">{serverError}</p>
            </div>
          )}

          <Button
            type="submit"
            className="bg-brand hover:bg-brand-dark w-full text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send reset link
          </Button>

          <Link
            href="/login"
            className="text-fg-muted hover:text-fg flex items-center justify-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}
