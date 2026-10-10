import { createHmac, timingSafeEqual } from 'node:crypto'
import { adminConfig } from '../config/env.js'

// Stateless token: HMAC(secret, email). No per-user storage, can't be forged without the secret.
export function unsubscribeToken(email: string): string {
  return createHmac('sha256', adminConfig!.unsubscribeSecret).update(email).digest('hex')
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const a = Buffer.from(unsubscribeToken(email))
  const b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function unsubscribeUrl(email: string): string {
  const q = new URLSearchParams({ e: email, t: unsubscribeToken(email) })
  return `${adminConfig!.publicApiUrl}/api/unsubscribe?${q}`
}
