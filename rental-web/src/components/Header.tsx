import { SITE } from '../config'
import { waLink } from '../lib/format'

export function Header() {
  return (
    <header className="atas">
      <div className="wrap atas-isi">
        <a className="merek" href="#atas" aria-label={SITE.nama}>
          <span className="merek-tanda" aria-hidden="true" />
          <span>{SITE.nama}</span>
        </a>
        <nav className="nav" aria-label="Utama">
          <a href="#armada">Armada</a>
          <a href="#cara-sewa">Cara sewa</a>
          <a href="#k3">Legalitas dan K3</a>
          <a href="#wilayah">Wilayah</a>
          <a href="#faq">Tanya jawab</a>
        </nav>
        <a className="tombol tombol-wa" href={waLink('Halo, saya ingin bertanya tentang sewa alat berat.')} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
      </div>
    </header>
  )
}
