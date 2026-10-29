import { useEffect, useRef } from 'react'
import type { Unit } from '../data'
import { pesanUntukUnit, rupiah, tanggalPanjang, waLink } from '../lib/format'

const baris: { kunci: keyof Unit['termasuk']; nama: string }[] = [
  { kunci: 'operator', nama: 'Operator atau pengemudi' },
  { kunci: 'bbm', nama: 'Bahan bakar (BBM)' },
  { kunci: 'mobilisasi', nama: 'Mobilisasi dan demobilisasi' },
  { kunci: 'perawatan', nama: 'Perawatan berkala' },
]

export function UnitDialog({ unit, onTutup }: { unit: Unit | null; onTutup: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (unit && !d.open) d.showModal()
    if (!unit && d.open) d.close()
  }, [unit])

  return (
    <dialog ref={ref} className="dialog" onClose={onTutup} onClick={(e) => { if (e.target === ref.current) onTutup() }}>
      {unit && (
        <div className="dialog-isi">
          <div className="dialog-kepala">
            <div>
              <p className="label">{unit.kategori} · Depo {unit.depo}</p>
              <h2>{unit.nama}</h2>
              <p className="kartu-meta">{unit.merek} · {unit.kapasitas} · tahun {unit.tahun}</p>
            </div>
            <button className="tutup" onClick={onTutup} aria-label="Tutup detail">Tutup</button>
          </div>

          <div className="dialog-kolom">
            <div>
              <h3>Tarif</h3>
              <p className="tarif-besar">
                <span className="tarif-kecil">mulai dari</span> <strong>{rupiah(unit.tarifMulai)}</strong> <span className="tarif-kecil">per {unit.satuan}</span>
              </p>
              <p className="catatan">Diperbarui {tanggalPanjang(unit.tarifDiperbarui)}. {unit.minimumSewa}. Belum termasuk PPN. Harga final ada di penawaran tertulis.</p>

              <h3>Termasuk dan tidak termasuk</h3>
              <ul className="termasuk">
                {baris.map((b) => (
                  <li key={b.kunci} className={unit.termasuk[b.kunci] ? 'ya' : 'tidak'}>
                    <span>{b.nama}</span>
                    <span>{unit.termasuk[b.kunci] ? 'Termasuk' : 'Tidak termasuk'}</span>
                  </li>
                ))}
              </ul>

              <h3>Spesifikasi</h3>
              <dl className="spek">
                {unit.spesifikasi.map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
            </div>

            <div>
              <h3>Ketersediaan</h3>
              <p><span className={`status status-${unit.status.toLowerCase()}`}>{unit.status}</span> <span className="catatan">Dikonfirmasi tim saat penawaran dibuat.</span></p>

              <h3>Dokumen unit dan operator</h3>
              <ul className="dokumen">
                {unit.dokumen.map((d) => (
                  <li key={d.nama}>
                    <span className="dok-nama">{d.nama}</span>
                    <span className={`dok-status dok-${d.status === 'Ada' ? 'ada' : 'proses'}`}>{d.status}</span>
                    <span className="catatan">{d.keterangan}</span>
                  </li>
                ))}
              </ul>
              <p className="catatan">Contoh. Di situs nyata, nomor dan masa berlaku diambil dari data unit.</p>

              <div className="aksi">
                <a className="tombol tombol-wa" href={waLink(pesanUntukUnit(unit))} target="_blank" rel="noopener noreferrer">Tanya unit ini lewat WhatsApp</a>
                <a className="tombol tombol-utama" href="#atas" onClick={onTutup}>Minta penawaran</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}
