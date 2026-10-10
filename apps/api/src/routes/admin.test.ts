import { describe, expect, it, vi, beforeAll } from 'vitest'

const { updateOne } = vi.hoisted(() => ({ updateOne: vi.fn() }))
const TOKEN = 'a'.repeat(40)

vi.stubEnv('MONGODB_URI', 'mongodb://localhost/test')
vi.stubEnv('ADMIN_TOKEN', TOKEN)
vi.stubEnv('UNSUBSCRIBE_SECRET', 'b'.repeat(40))
vi.stubEnv('PUBLIC_API_URL', 'http://localhost:8787')
vi.stubEnv('SMTP_HOST', 'smtp.example.com')
vi.stubEnv('MAIL_FROM', 'Biizcon <hi@example.com>')
vi.mock('../models/waitlistEntry.js', () => ({
  WaitlistEntry: { create: vi.fn(), updateOne, countDocuments: vi.fn().mockResolvedValue(3) },
}))
vi.mock('../models/campaign.js', () => ({ Campaign: { find: vi.fn(), exists: vi.fn(), create: vi.fn() } }))
vi.mock('../lib/clientIp.js', () => ({ clientIp: () => '1.2.3.4' }))

let app: typeof import('../app.js').app
let unsub: typeof import('../lib/unsubscribe.js')
beforeAll(async () => {
  app = (await import('../app.js')).app
  unsub = await import('../lib/unsubscribe.js')
}, 30_000)

describe('admin', () => {
  it('rejects missing or wrong tokens', async () => {
    expect((await app.request('/api/admin/stats')).status).toBe(401)
    const bad = await app.request('/api/admin/stats', { headers: { Authorization: 'Bearer nope' } })
    expect(bad.status).toBe(401)
  })

  it('accepts the right token', async () => {
    const res = await app.request('/api/admin/stats', { headers: { Authorization: `Bearer ${TOKEN}` } })
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ ok: true, subscribed: 3 })
  })
})

describe('unsubscribe', () => {
  it('GET never unsubscribes', async () => {
    const url = new URL(unsub.unsubscribeUrl('a@b.co'))
    const res = await app.request(url.pathname + url.search)
    expect(res.status).toBe(200)
    expect(updateOne).not.toHaveBeenCalled()
  })

  it('POST with a valid token unsubscribes; forged token is refused', async () => {
    const url = new URL(unsub.unsubscribeUrl('a@b.co'))
    expect((await app.request(url.pathname + url.search, { method: 'POST' })).status).toBe(200)
    expect(updateOne).toHaveBeenCalledTimes(1)
    expect((await app.request('/api/unsubscribe?e=a@b.co&t=forged', { method: 'POST' })).status).toBe(400)
    expect(updateOne).toHaveBeenCalledTimes(1)
  })
})
