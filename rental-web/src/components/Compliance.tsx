const dokumen = [
  { judul: 'Sertifikat uji riksa', isi: 'Hasil pemeriksaan dan pengujian alat oleh pihak berwenang, ditampilkan per unit.' },
  { judul: 'SILO alat', isi: 'Surat izin laik operasi dari dinas setempat, dengan nomor dan masa berlaku.' },
  { judul: 'SIO dan sertifikat operator', isi: 'Kompetensi operator terbukti. Data pribadi operator disamarkan di halaman publik.' },
  { judul: 'Asuransi dan komitmen K3', isi: 'Polis alat dan surat komitmen K3 yang bisa diminta tim pengadaan.' },
]

export function Compliance() {
  return (
    <section className="seksi" id="k3">
      <div className="wrap">
        <p className="label">Legalitas dan K3</p>
        <h2>Bukti kepatuhan yang bisa diperiksa tim pengadaan</h2>
        <p className="seksi-sub">
          Tim pengadaan kontraktor biasanya meminta dokumen ini sebelum unit masuk proyek. Kami tampilkan lebih awal supaya proses seleksi lebih cepat.
        </p>
        <div className="grid-dok">
          {dokumen.map((d) => (
            <article key={d.judul} className="dok-kartu">
              <h3>{d.judul}</h3>
              <p>{d.isi}</p>
            </article>
          ))}
        </div>
        <p className="catatan catatan-lebar">
          Rujukan hukum K3 sedang berubah pada 2026. Pasal dan nomor peraturan baru dicantumkan setelah teksnya dibaca langsung dan diperiksa.
        </p>
      </div>
    </section>
  )
}
