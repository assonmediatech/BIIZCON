import { useCallback, useEffect, useState } from 'react'
import { API_BASE } from '../lib/waitlist'
import { TEMPLATES } from './templates'

const TOKEN_KEY = 'biizcon_admin_token'
const field = 'w-full rounded-lg bg-cream px-3 py-2 text-navy outline-none focus:bg-white'
const btn = 'rounded-full bg-sky px-5 py-2 font-semibold text-navy transition hover:bg-cream disabled:opacity-60'

function useToken() {
  const [token, setToken] = useState(() => {
    try { return sessionStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
  })
  const save = (t) => {
    setToken(t)
    try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
  }
  return [token, save]
}

async function api(token, path, body) {
  const res = await fetch(`${API_BASE}/api/admin${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${token}`, ...(body && { 'Content-Type': 'application/json' }) },
    body: body && JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: res.status })
  return data
}

export default function AdminPage() {
  const [token, setToken] = useToken()
  const [input, setInput] = useState('')
  const [stats, setStats] = useState(null)
  const [campaigns, setCampaigns] = useState([])
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id)
  const [subject, setSubject] = useState(TEMPLATES[0].subject)
  const [html, setHtml] = useState(TEMPLATES[0].html)
  const [testTo, setTestTo] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    document.title = 'Admin'
    const meta = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex,nofollow' })
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  const refresh = useCallback(async () => {
    if (!token) return
    try {
      const [s, c] = await Promise.all([api(token, '/stats'), api(token, '/campaigns')])
      setStats(s)
      setCampaigns(c.campaigns)
      setAuthError('')
    } catch (e) {
      if (e.status === 401) { setToken(''); setAuthError('Wrong admin token.') }
      else setMsg(e.status === 404 ? 'Admin is not enabled on the server.' : e.message)
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { refresh() }, [refresh])

  // Poll while a campaign is sending.
  const sending = campaigns.some((c) => c.status === 'sending')
  useEffect(() => {
    if (!sending) return
    const id = setInterval(refresh, 3000)
    return () => clearInterval(id)
  }, [sending, refresh])

  function pickTemplate(id) {
    const t = TEMPLATES.find((x) => x.id === id)
    setTemplateId(id)
    setSubject(t.subject)
    setHtml(t.html)
  }

  async function run(fn) {
    setBusy(true); setMsg('')
    try { await fn() } catch (e) { setMsg(e.message) } finally { setBusy(false) }
  }

  const sendTest = () => run(async () => {
    await api(token, '/test', { to: testTo, subject, html })
    setMsg(`Test email sent to ${testTo}.`)
  })

  const sendAll = () => run(async () => {
    if (!window.confirm(`Send "${subject}" to ${stats?.subscribed ?? 0} subscribers? This can't be undone.`)) return
    await api(token, '/campaigns', { subject, html })
    setMsg('Campaign started.')
    await refresh()
  })

  if (!token) {
    return (
      <main className="mx-auto max-w-sm px-4 py-24">
        <h1 className="mb-6 text-2xl font-semibold">Admin</h1>
        <form onSubmit={(e) => { e.preventDefault(); setToken(input.trim()) }} className="flex flex-col gap-3">
          <label htmlFor="token" className="sr-only">Admin token</label>
          <input id="token" type="password" autoComplete="off" placeholder="Admin token" value={input}
            onChange={(e) => setInput(e.target.value)} className={field} />
          {authError && <p role="alert" className="text-sm text-[#ffb4a5]">{authError}</p>}
          <button className={btn} disabled={!input.trim()}>Sign in</button>
        </form>
      </main>
    )
  }

  const canSend = subject.trim() && html.trim() && !busy && !sending

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Waitlist admin</h1>
        <div className="flex items-center gap-4 text-sm text-white/80">
          {stats && <span>{stats.subscribed} subscribed · {stats.unsubscribed} unsubscribed</span>}
          <button onClick={() => setToken('')} className="underline">Sign out</button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-3">
          <label className="text-sm text-white/70" htmlFor="tpl">Template</label>
          <select id="tpl" value={templateId} onChange={(e) => pickTemplate(e.target.value)} className={field}>
            {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>

          <label className="text-sm text-white/70" htmlFor="subject">Subject</label>
          <input id="subject" value={subject} maxLength={200} onChange={(e) => setSubject(e.target.value)} className={field} />

          <label className="text-sm text-white/70" htmlFor="html">HTML body (unsubscribe footer is added automatically)</label>
          <textarea id="html" value={html} onChange={(e) => setHtml(e.target.value)} rows={14}
            className={`${field} font-mono text-sm`} spellCheck={false} />

          <div className="flex flex-wrap gap-2">
            <input type="email" placeholder="Send a test to…" value={testTo} onChange={(e) => setTestTo(e.target.value)}
              className={`${field} min-w-0 flex-1`} aria-label="Test recipient" />
            <button className={btn} onClick={sendTest} disabled={!canSend || !testTo}>Send test</button>
          </div>
          <button className={`${btn} bg-cream`} onClick={sendAll} disabled={!canSend || !stats?.subscribed}>
            Send to all subscribers
          </button>
          {msg && <p role="status" className="text-sm text-white/80">{msg}</p>}
        </section>

        <section>
          <p className="mb-2 text-sm text-white/70">Preview</p>
          {/* sandbox with no flags: no scripts, no same-origin access */}
          <iframe title="Email preview" sandbox="" srcDoc={html} className="h-96 w-full rounded-lg bg-white" />

          <h2 className="mb-2 mt-8 text-lg font-semibold">Recent campaigns</h2>
          {campaigns.length === 0 ? <p className="text-sm text-white/60">None yet.</p> : (
            <ul className="flex flex-col gap-2 text-sm">
              {campaigns.map((c) => (
                <li key={c._id} className="rounded-lg bg-white/10 px-3 py-2">
                  <div className="font-semibold">{c.subject}</div>
                  <div className="text-white/70">
                    {c.status} · {c.sent}/{c.total} sent{c.failed ? ` · ${c.failed} failed` : ''} · {new Date(c.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
