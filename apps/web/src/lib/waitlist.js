// Single integration point for the waitlist.
// Set VITE_WAITLIST_ENDPOINT to the API app (apps/api): http://localhost:8787/api/waitlist in dev,
// https://<your-render-service>/api/waitlist in production (Vercel > Settings > Environment Variables).
// Keep secrets on the server, never here.
// Without an endpoint, submission is simulated so the UI is fully testable.
export const ENDPOINT = import.meta.env.VITE_WAITLIST_ENDPOINT

// Origin of the API, derived from the endpoint (used by the admin page).
export const API_BASE = ENDPOINT ? new URL(ENDPOINT).origin : ''

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
