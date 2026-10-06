import WaitlistForm from './WaitlistForm'

export default function Hero() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12 text-center sm:py-16">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center">
        <h1 className="rise text-balance text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl" style={{ animationDelay: '.1s' }}>
        Discover who and what’s around you.
        </h1>
        <p className="rise mt-6 max-w-md text-balance text-lg leading-relaxed text-white/80 sm:text-xl" style={{ animationDelay: '.22s' }}>
          Discover who’s available, what’s happening, and opportunities around campus
        </p>
        <div className="rise mt-10 w-full" style={{ animationDelay: '.34s' }}>
          <WaitlistForm />
        </div>
      </section>
    </main>
  )
}
