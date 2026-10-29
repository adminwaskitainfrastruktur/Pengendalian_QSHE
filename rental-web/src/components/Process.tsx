const langkah = [
  { judul: 'Kirim kebutuhan', isi: 'Isi form atau kirim pesan WhatsApp: jenis alat, lokasi, tanggal mulai, dan durasi.' },
  { judul: 'Terima penawaran tertulis', isi: 'Penawaran menyebut tarif, minimum sewa, dan apa yang termasuk atau tidak, termasuk mobilisasi.' },
  { judul: 'Setujui dan serah terima', isi: 'Perjanjian ditandatangani, lalu unit diserahkan dengan berita acara dan pencatatan hour meter awal.' },
  { judul: 'Pakai dan laporkan jam kerja', isi: 'Jam kerja dicatat dari hour meter dan dilaporkan untuk dasar tagihan.' },
  { judul: 'Kembalikan unit', isi: 'Berita acara pengembalian mencatat hour meter akhir dan kondisi unit.' },
]

export function Process() {
  return (
    <section className="seksi seksi-gelap" id="cara-sewa">
      <div className="wrap">
        <p className="label">Cara sewa</p>
        <h2>Dari permintaan sampai unit kembali</h2>
        <p className="seksi-sub">Usulan alur. Disesuaikan dengan kebiasaan perusahaan setelah dikonfirmasi.</p>
        <ol className="langkah">
          {langkah.map((l) => (
            <li key={l.judul}>
              <h3>{l.judul}</h3>
              <p>{l.isi}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
