import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ConnectionGraphic from './components/ConnectionGraphic'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-navy">
      <Navbar />
      <Hero />
      <div className="relative">
        <ConnectionGraphic />
        <Footer />
      </div>
    </div>
  )
}
