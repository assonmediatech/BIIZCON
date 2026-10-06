import { describe, expect, it, vi, beforeAll } from 'vitest'

const { create } = vi.hoisted(() => ({ create: vi.fn() }))

vi.stubEnv('MONGODB_URI', 'mongodb://localhost/test')
vi.stubEnv('CORS_ORIGINS', 'http://localhost:5173')
vi.mock('../models/waitlistEntry.js', () => ({ WaitlistEntry: { create } }))
vi.mock('../lib/clientIp.js', () => ({ clientIp: () => '1.2.3.4' }))

let app: typeof import('../app.js').app
beforeAll(async () => {
  app = (await import('../app.js')).app
})

const post = (body: unknown, headers: Record<string, string> = { 'Content-Type': 'application/json' }) =>
  app.request('/api/waitlist', {
    method: 'POST',
    headers,
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

describe('POST /api/waitlist', () => {
  it('stores a normalized email', async () => {
    create.mockResolvedValueOnce({})
    const res = await post({ email: '  Foo@Example.com ', source: 'waitlist-page' })
    expect(res.status).toBe(201)
    expect(create).toHaveBeenCalledWith({ email: 'foo@example.com', source: 'waitlist-page' })
  })

  it('treats duplicates like new signups', async () => {
    create.mockRejectedValueOnce({ code: 11000 })
    expect((await post({ email: 'dup@example.com' })).status).toBe(201)
  })

  it('rejects invalid email, extra fields, bad content type', async () => {
    expect((await post({ email: 'nope' })).status).toBe(400)
    expect((await post({ email: 'a@b.co', role: 'admin' })).status).toBe(400)
    expect((await post({ email: { $ne: null } })).status).toBe(400)
    expect((await post('email=a@b.co', { 'Content-Type': 'text/plain' })).status).toBe(415)
  })

  it('silently drops honeypot hits', async () => {
    create.mockClear()
    expect((await post({ email: 'bot@example.com', website: 'x' })).status).toBe(201)
    expect(create).not.toHaveBeenCalled()
  })

  it('does not allow unknown origins', async () => {
    const res = await app.request('/api/waitlist', {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.com', 'Access-Control-Request-Method': 'POST' },
    })
    expect(res.headers.get('access-control-allow-origin')).toBeNull()
  })
})
