// Starter email templates. Plain inline-styled HTML (email clients ignore most CSS).
// An unsubscribe footer is appended automatically by the server.
const wrap = (inner) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#003049">
${inner}
</div>`

export const TEMPLATES = [
  {
    id: 'launch',
    name: 'Launch announcement',
    subject: 'Biizcon is live 🎉',
    html: wrap(`<h1 style="margin:0 0 16px">We're live!</h1>
<p>Thanks for joining the Biizcon waitlist. Today you can finally discover who and what's around you.</p>
<p><a href="https://biizcon.vercel.app" style="display:inline-block;background:#4592bb;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none">Open Biizcon</a></p>`),
  },
  {
    id: 'update',
    name: 'Progress update',
    subject: "What we've been building",
    html: wrap(`<h2 style="margin:0 0 16px">A quick update</h2>
<p>Here's what's new since you joined the waitlist:</p>
<ul><li>Feature one</li><li>Feature two</li><li>Feature three</li></ul>
<p>More soon,<br>The Biizcon team</p>`),
  },
  {
    id: 'blank',
    name: 'Blank',
    subject: '',
    html: wrap('<p>Write your message here.</p>'),
  },
]
