// Single integration point for the waitlist.
// Set VITE_WAITLIST_ENDPOINT to POST to your own backend (serverless function,
// Supabase Edge Function, Express route...). Keep secrets on the server, never here.
// Without an endpoint, submission is simulated so the UI is fully testable.
const ENDPOINT = import.meta.env.VITE_WAITLIST_ENDPOINT

export async function submitWaitlist(email) {
  if (!ENDPOINT) {
    await new Promise((r) => setTimeout(r, 1100))
    return { ok: true }
  }
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, source: 'waitlist-page' }),
  })
  if (!res.ok) throw new Error('Request failed')
  return { ok: true }
}
