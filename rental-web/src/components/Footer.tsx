import { SITE } from '../config'

export function Footer() {
  return (
    <footer className="kaki">
      <div className="wrap kaki-isi">
        <div>
          <p className="kaki-nama">{SITE.nama}</p>
          <p>{SITE.alamat}</p>
        </div>
        <div>
          <p className="label">Kontak</p>
          <p>WhatsApp: {SITE.whatsapp}</p>
          <p>Telepon: {SITE.telepon}</p>
          <p>Email: {SITE.email}</p>
          <p>{SITE.jamLayanan}</p>
        </div>
        <div>
          <p className="label">Catatan mockup</p>
          <p>Nomor, alamat, dan identitas di atas placeholder. Isi di <code>src/config.ts</code>.</p>
        </div>
      </div>
    </footer>
  )
}
