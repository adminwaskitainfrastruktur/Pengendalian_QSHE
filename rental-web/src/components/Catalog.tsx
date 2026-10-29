import { useMemo, useState } from 'react'
import type { Kategori, Unit } from '../data'
import { rupiah } from '../lib/format'

type Urut = 'tarif-naik' | 'tarif-turun' | 'tahun'

export function Catalog({ units, onPilih }: { units: Unit[] | null; onPilih: (u: Unit) => void }) {
  const [kategori, setKategori] = useState<Kategori | ''>('')
  const [depo, setDepo] = useState('')
  const [hanyaTersedia, setHanyaTersedia] = useState(false)
  const [cari, setCari] = useState('')
  const [urut, setUrut] = useState<Urut>('tarif-naik')

  const semua = units ?? []
  const daftarKategori = useMemo(() => Array.from(new Set(semua.map((u) => u.kategori))), [semua])
  const daftarDepo = useMemo(() => Array.from(new Set(semua.map((u) => u.depo))).sort(), [semua])

  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase()
    const hasil = semua.filter((u) =>
      (!kategori || u.kategori === kategori) &&
      (!depo || u.depo === depo) &&
      (!hanyaTersedia || u.status !== 'Disewa') &&
      (!q || `${u.nama} ${u.merek} ${u.kategori}`.toLowerCase().includes(q)),
    )
    // Tarif per jam dan per hari tidak sebanding, jadi urut tarif membandingkan per satuan lebih dulu.
    const kunci = (u: Unit) => (u.satuan === 'jam' ? 0 : 1)
    return hasil.sort((a, b) => {
      if (urut === 'tahun') return b.tahun - a.tahun
      const d = kunci(a) - kunci(b) || a.tarifMulai - b.tarifMulai
      return urut === 'tarif-naik' ? d : -d
    })
  }, [semua, kategori, depo, hanyaTersedia, cari, urut])

  return (
    <section className="seksi" id="armada">
      <div className="wrap">
        <p className="label">Armada</p>
        <h2>Pilih unit, lihat apa yang termasuk dalam tarif</h2>
        <p className="seksi-sub">
          Tarif adalah "mulai dari" dan bisa berubah menurut durasi, lokasi, dan mobilisasi. Penawaran tertulis menjadi acuan.
        </p>

        <div className="saring" role="search" aria-label="Saring armada">
          <div className="chips" role="group" aria-label="Jenis alat">
            <button className="chip" aria-pressed={kategori === ''} onClick={() => setKategori('')}>Semua</button>
            {daftarKategori.map((k) => (
              <button key={k} className="chip" aria-pressed={kategori === k} onClick={() => setKategori(k)}>{k}</button>
            ))}
          </div>
          <div className="saring-baris">
            <label>Cari
              <input type="search" value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Nama atau merek" />
            </label>
            <label>Depo
              <select value={depo} onChange={(e) => setDepo(e.target.value)}>
                <option value="">Semua depo</option>
                {daftarDepo.map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label>Urutkan
              <select value={urut} onChange={(e) => setUrut(e.target.value as Urut)}>
                <option value="tarif-naik">Tarif terendah dulu</option>
                <option value="tarif-turun">Tarif tertinggi dulu</option>
                <option value="tahun">Tahun terbaru dulu</option>
              </select>
            </label>
            <label className="centang">
              <input type="checkbox" checked={hanyaTersedia} onChange={(e) => setHanyaTersedia(e.target.checked)} />
              Sembunyikan yang sedang disewa
            </label>
          </div>
        </div>

        {units === null ? (
          <p className="kosong">Memuat armada.</p>
        ) : tampil.length === 0 ? (
          <p className="kosong">Tidak ada unit yang cocok. Coba ubah penyaring, atau minta penawaran dan kami carikan.</p>
        ) : (
          <ul className="grid-unit">
            {tampil.map((u) => (
              <li key={u.id}>
                <button className="kartu" onClick={() => onPilih(u)} aria-label={`Lihat detail ${u.nama}`}>
                  <span className="foto" aria-hidden="true">
                    <span className="foto-kode">{u.kategori}</span>
                    <span className="foto-ket">Foto asli menyusul</span>
                  </span>
                  <span className="kartu-isi">
                    <span className="kartu-atas">
                      <span className="kartu-nama">{u.nama}</span>
                      <span className={`status status-${u.status.toLowerCase()}`}>{u.status}</span>
                    </span>
                    <span className="kartu-meta">{u.merek} · {u.kapasitas} · {u.tahun} · Depo {u.depo}</span>
                    <span className="kartu-tarif">
                      <span className="tarif-kecil">mulai dari</span> <strong>{rupiah(u.tarifMulai)}</strong> <span className="tarif-kecil">per {u.satuan}</span>
                    </span>
                    <span className="kartu-minimum">{u.minimumSewa}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
