import { useState, type FormEvent } from 'react'
import { SITE } from '../config'
import type { Unit } from '../data'
import { waLink } from '../lib/format'

interface Isi {
  nama: string
  wa: string
  perusahaan: string
  alat: string
  lokasi: string
  mulai: string
  durasi: string
  operator: 'dengan' | 'tanpa' | 'belum'
}

const awal: Isi = { nama: '', wa: '', perusahaan: '', alat: '', lokasi: '', mulai: '', durasi: '', operator: 'belum' }

function susunPesan(i: Isi) {
  const op = i.operator === 'dengan' ? 'dengan operator' : i.operator === 'tanpa' ? 'tanpa operator' : 'operator belum ditentukan'
  return [
    'Halo, saya ingin meminta penawaran sewa alat berat.',
    `Nama: ${i.nama}${i.perusahaan ? ` (${i.perusahaan})` : ''}`,
    `Alat: ${i.alat || 'belum dipilih'}, ${op}`,
    `Lokasi proyek: ${i.lokasi || 'belum diisi'}`,
    `Mulai: ${i.mulai || 'belum diisi'}, durasi: ${i.durasi || 'belum diisi'}`,
  ].join('\n')
}

export function Hero({ units }: { units: Unit[] }) {
  const [isi, setIsi] = useState<Isi>(awal)
  const [ringkasan, setRingkasan] = useState<string | null>(null)
  const kategori = Array.from(new Set(units.map((u) => u.kategori)))

  const ubah = <K extends keyof Isi>(k: K, v: Isi[K]) => setIsi((s) => ({ ...s, [k]: v }))

  const kirim = (e: FormEvent) => {
    e.preventDefault()
    setRingkasan(susunPesan(isi))
  }

  return (
    <section className="hero" id="atas">
      <div className="wrap hero-isi">
        <div className="hero-teks">
          <p className="label">Rental alat berat</p>
          <h1>{SITE.tagline}</h1>
          <p className="hero-sub">
            Ceritakan kebutuhan proyek Anda. Tim kami membalas dengan penawaran tertulis yang menyebut apa saja yang termasuk dan tidak termasuk dalam tarif.
          </p>
          <ul className="poin">
            <li>Tarif ditampilkan sebagai "mulai dari", lengkap dengan tanggal pembaruan</li>
            <li>Dokumen uji riksa, SILO, dan SIO operator bisa diperiksa per unit</li>
            <li>{SITE.targetBalas}</li>
          </ul>
        </div>

        <form className="rfq" onSubmit={kirim} aria-labelledby="rfq-judul">
          <h2 id="rfq-judul">Minta penawaran</h2>
          <div className="baris-2">
            <label>Nama
              <input required value={isi.nama} onChange={(e) => ubah('nama', e.target.value)} autoComplete="name" />
            </label>
            <label>Nomor WhatsApp
              <input required inputMode="tel" value={isi.wa} onChange={(e) => ubah('wa', e.target.value)} autoComplete="tel" />
            </label>
          </div>
          <label><span>Perusahaan <span className="opsional">(opsional)</span></span>
            <input value={isi.perusahaan} onChange={(e) => ubah('perusahaan', e.target.value)} autoComplete="organization" />
          </label>
          <div className="baris-2">
            <label>Jenis alat
              <select value={isi.alat} onChange={(e) => ubah('alat', e.target.value)}>
                <option value="">Belum tahu</option>
                {kategori.map((k) => <option key={k}>{k}</option>)}
              </select>
            </label>
            <label>Lokasi proyek
              <input required value={isi.lokasi} onChange={(e) => ubah('lokasi', e.target.value)} placeholder="Kota atau kawasan" />
            </label>
          </div>
          <div className="baris-2">
            <label>Mulai tanggal
              <input type="date" value={isi.mulai} onChange={(e) => ubah('mulai', e.target.value)} />
            </label>
            <label>Perkiraan durasi
              <input value={isi.durasi} onChange={(e) => ubah('durasi', e.target.value)} placeholder="Misalnya 3 minggu" />
            </label>
          </div>
          <fieldset>
            <legend>Operator</legend>
            <label className="radio"><input type="radio" name="op" checked={isi.operator === 'dengan'} onChange={() => ubah('operator', 'dengan')} /> Dengan operator</label>
            <label className="radio"><input type="radio" name="op" checked={isi.operator === 'tanpa'} onChange={() => ubah('operator', 'tanpa')} /> Tanpa operator</label>
            <label className="radio"><input type="radio" name="op" checked={isi.operator === 'belum'} onChange={() => ubah('operator', 'belum')} /> Belum tahu</label>
          </fieldset>
          <button className="tombol tombol-utama" type="submit">Lihat ringkasan permintaan</button>

          {ringkasan && (
            <div className="ringkasan" role="status">
              <p className="catatan-mockup">Mockup: permintaan ini belum terkirim ke mana pun.</p>
              <pre>{ringkasan}</pre>
              <a className="tombol tombol-wa" href={waLink(ringkasan)} target="_blank" rel="noopener noreferrer">Kirim lewat WhatsApp</a>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
