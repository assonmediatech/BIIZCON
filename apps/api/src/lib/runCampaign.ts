import { Campaign } from '../models/campaign.js'
import { WaitlistEntry } from '../models/waitlistEntry.js'
import { env } from '../config/env.js'
import { sendEmail } from './mailer.js'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Runs in the background after the HTTP response; progress is persisted on the Campaign doc. */
export async function runCampaign(id: string) {
  try {
    const campaign = await Campaign.findById(id)
    if (!campaign) return
    const filter = { unsubscribedAt: { $exists: false } }
    campaign.total = await WaitlistEntry.countDocuments(filter)
    await campaign.save()

    let n = 0
    for await (const entry of WaitlistEntry.find(filter).select('email').lean().cursor()) {
      try {
        await sendEmail(entry.email, campaign.subject, campaign.html)
        campaign.sent++
      } catch (err) {
        campaign.failed++
        console.error('campaign send failed', (err as Error).message)
      }
      if (++n % 5 === 0) await campaign.save()
      await sleep(env.MAIL_DELAY_MS)
    }
    campaign.status = 'done'
    campaign.finishedAt = new Date()
    await campaign.save()
  } catch (err) {
    console.error('campaign crashed', err)
    await Campaign.findByIdAndUpdate(id, { status: 'failed', finishedAt: new Date() })
  }
}
