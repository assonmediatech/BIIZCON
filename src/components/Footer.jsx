export default function Footer() {
  return (
    <footer className="absolute inset-x-0 bottom-3 text-center text-xs text-white/55 sm:bottom-4 sm:text-sm">
      © {new Date().getFullYear()} Biizcon
    </footer>
  )
}
