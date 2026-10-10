import { z } from 'zod'

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8787),
  MONGODB_URI: z.string().min(1),
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean)),
  TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),

  // Admin + email. All optional: if any is missing the admin routes are disabled (404).
  ADMIN_TOKEN: z.string().min(32, 'ADMIN_TOKEN must be at least 32 characters').optional(),
  UNSUBSCRIBE_SECRET: z.string().min(32).optional(),
  PUBLIC_API_URL: z.string().url().optional(), // e.g. https://biizcon.onrender.com (used in unsubscribe links)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().optional(), // e.g. Biizcon <hello@biizcon.com>
  MAIL_DELAY_MS: z.coerce.number().int().min(0).default(250),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data

export const adminConfig =
  env.ADMIN_TOKEN && env.UNSUBSCRIBE_SECRET && env.PUBLIC_API_URL && env.SMTP_HOST && env.MAIL_FROM
    ? {
        adminToken: env.ADMIN_TOKEN,
        unsubscribeSecret: env.UNSUBSCRIBE_SECRET,
        publicApiUrl: env.PUBLIC_API_URL.replace(/\/$/, ''),
        smtpHost: env.SMTP_HOST,
        mailFrom: env.MAIL_FROM,
      }
    : null
