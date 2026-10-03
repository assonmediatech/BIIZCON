export function Logo({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 64 64" className="h-10 w-10 sm:h-11 sm:w-11" aria-hidden="true">
        <rect width="64" height="64" rx="12" fill="var(--color-brand)" />
        <path d="M14 14h10a9 9 0 0 1 0 18H14Z" fill="var(--color-cream)" />
        <circle cx="44" cy="23" r="9" fill="var(--color-cream)" />
        <path d="M14 36h10a9 9 0 0 1 0 18H14Z" fill="var(--color-cream)" />
        <circle cx="44" cy="45" r="9" fill="var(--color-cream)" />
      </svg>
      <span className="text-2xl font-normal tracking-wide sm:text-[1.7rem]">BIIZCON</span>
    </div>
  )
}

// No links: on a waitlist page every extra exit weakens the one action that matters.
export default function Navbar() {
  return (
    <header className="fade flex items-center justify-between px-6 pt-6 sm:px-10 sm:pt-8">
      <a href="/" aria-label="Biizcon home"><Logo /></a>
      <p className="flex items-center gap-2 text-sm text-white/70">
        <span />
        Launching soon
      </p>
    </header>
  )
}
