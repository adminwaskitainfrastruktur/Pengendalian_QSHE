import type { Unit } from '../data'

export function Areas({ units }: { units: Unit[] }) {
  const depo = Array.from(new Set(units.map((u) => u.depo))).sort()
  return (
    <section className="seksi seksi-abu" id="wilayah">
      <div className="wrap">
        <p className="label">Wilayah layanan</p>
        <h2>Depo dan jangkauan mobilisasi</h2>
        <p className="seksi-sub">
          Biaya mobilisasi bergantung jarak depo ke lokasi proyek. Setiap depo yang nyata mendapat halaman sendiri dengan isi yang berbeda, bukan salinan antar kota.
        </p>
        <ul className="depo">
          {depo.map((d) => (
            <li key={d}>
              <strong>{d}</strong>
              <span>{units.filter((u) => u.depo === d).length} unit contoh</span>
            </li>
          ))}
        </ul>
        <p className="catatan catatan-lebar">Peta area layanan menyusul setelah daftar depo dan wilayah pasti.</p>
      </div>
    </section>
  )
}
