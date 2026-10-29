import { useEffect, useState } from 'react'
import { DATA_ADALAH_CONTOH, getUnits, type Unit } from './data'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Catalog } from './components/Catalog'
import { UnitDialog } from './components/UnitDialog'
import { Process } from './components/Process'
import { Compliance } from './components/Compliance'
import { Areas } from './components/Areas'
import { Faq } from './components/Faq'
import { Footer } from './components/Footer'

export default function App() {
  const [units, setUnits] = useState<Unit[] | null>(null)
  const [dipilih, setDipilih] = useState<Unit | null>(null)

  useEffect(() => {
    let batal = false
    getUnits().then((u) => { if (!batal) setUnits(u) })
    return () => { batal = true }
  }, [])

  return (
    <>
      {DATA_ADALAH_CONTOH && (
        <div className="contoh-bar" role="note">
          Mockup awal. Semua unit, harga, dan dokumen di halaman ini adalah data contoh, bukan armada nyata.
        </div>
      )}
      <Header />
      <main>
        <Hero units={units ?? []} />
        <Catalog units={units} onPilih={setDipilih} />
        <Process />
        <Compliance />
        <Areas units={units ?? []} />
        <Faq />
      </main>
      <Footer />
      <UnitDialog unit={dipilih} onTutup={() => setDipilih(null)} />
    </>
  )
}
