import nodemailer from 'nodemailer'
import { adminConfig, env } from '../config/env.js'
import { unsubscribeUrl } from './unsubscribe.js'

const transport = adminConfig
  ? nodemailer.createTransport({
      host: adminConfig.smtpHost,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      pool: true,
      maxConnections: 2,
    })
  : null

const toText = (html: string) =>
  html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, '')
    .replace(/<br\s*\/?>|<\/(p|div|h\d|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

/** Sends one email with an unsubscribe footer + List-Unsubscribe headers. */
export async function sendEmail(to: string, subject: string, html: string) {
  if (!transport || !adminConfig) throw new Error('Mail is not configured')
  const link = unsubscribeUrl(to)
  const body = `${html}
<hr style="border:none;border-top:1px solid #ddd;margin:32px 0 12px">
<p style="font-size:12px;color:#777;font-family:sans-serif">You're receiving this because you joined the Biizcon waitlist.
<a href="${link}">Unsubscribe</a></p>`
  await transport.sendMail({
    from: adminConfig.mailFrom,
    to,
    subject,
    html: body,
    text: `${toText(html)}\n\n--\nUnsubscribe: ${link}`,
    headers: {
      'List-Unsubscribe': `<${link}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })
}
