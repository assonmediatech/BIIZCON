import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import { submitWaitlist } from '../lib/waitlist'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function WaitlistForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    const value = email.trim()
    if (!EMAIL_RE.test(value)) {
      setStatus('error')
      setError('Enter a valid email address, like name@example.com.')
      return
    }
    setStatus('loading')
    setError('')
    try {
      await submitWaitlist(value)
      setStatus('success')
    } catch {
      setStatus('error')
      setError("We couldn't add you just now. Check your connection and try again.")
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="rise mx-auto flex max-w-md flex-col items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky text-navy">
          <Check size={24} strokeWidth={3} aria-hidden="true" />
        </span>
        <p className="text-2xl font-semibold">You're on the list!</p>
        <p className="text-white/80">Thanks for joining Biizcon. We'll let you know when we're ready.</p>
      </div>
    )
  }

  const loading = status === 'loading'
  const invalid = status === 'error'

  return (
    <form onSubmit={onSubmit} noValidate className="mx-auto w-full max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="email" className="sr-only">Email address</label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Your email address"
          value={email}
          disabled={loading}
          onChange={(e) => { setEmail(e.target.value); if (invalid) setStatus('idle') }}
          aria-invalid={invalid}
          aria-describedby="email-hint"
          className="h-15 w-full min-w-0 appearance-none rounded-full bg-cream px-6 text-1xl text-navy outline-none placeholder:text-navy/55 transition-colors focus:bg-white disabled:opacity-60 sm:h-14 sm:flex-1 sm:px-6 sm:text-base"
          />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-16 shrink-0 items-center justify-center gap-2 rounded-full bg-sky px-8 text-lg font-semibold sm:h-14 sm:text-base text-navy outline-none transition duration-200 hover:-translate-y-0.5 hover:bg-cream active:translate-y-0 focus-visible:ring-4 focus-visible:ring-cream/70 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:bg-sky"
        >
          {loading ? (<><Loader2 size={18} className="animate-spin" aria-hidden="true" />Joining…</>) : 'Join waitlist'}
        </button>
      </div>
      <p
        id="email-hint"
        aria-live="polite"
        className={`mt-4 min-h-6 text-sm ${invalid ? 'text-[#ffb4a5]' : 'text-white/60'}`}
      >
        {invalid ? error : 'Be among the first to experience Biizcon.'}
      </p>
    </form>
  )
}
