const tanya = [
  { q: 'Apa beda sewa basah dan sewa kering?', a: 'Sewa kering hanya alatnya. Sewa basah mencakup operator, dan sering BBM. Cakupan pastinya tertulis di penawaran, karena praktik antar perusahaan berbeda.' },
  { q: 'Apa saja yang biasanya tidak termasuk dalam tarif?', a: 'Mobilisasi dan demobilisasi, BBM, uang makan atau mess operator, dan lembur. Tabel "termasuk dan tidak termasuk" di tiap unit menunjukkan mana yang berlaku.' },
  { q: 'Berapa minimum sewa?', a: 'Tergantung unit. Contohnya ada yang minimum 50 jam atau 100 jam, ada yang minimum beberapa hari. Angkanya tertera di kartu dan detail unit.' },
  { q: 'Apakah harga sudah termasuk PPN?', a: 'Belum. Tarif ditampilkan sebelum PPN. Perlakuan pajak lainnya mengikuti ketentuan yang berlaku dan dijelaskan di penawaran.' },
  { q: 'Bagaimana cara menagih pemakaian?', a: 'Berdasarkan jam kerja dari hour meter yang dicatat saat serah terima dan pengembalian, atau minimum jam yang disepakati.' },
]

export function Faq() {
  return (
    <section className="seksi" id="faq">
      <div className="wrap wrap-sempit">
        <p className="label">Tanya jawab</p>
        <h2>Pertanyaan yang sering muncul</h2>
        <div className="faq">
          {tanya.map((t) => (
            <details key={t.q}>
              <summary>{t.q}</summary>
              <p>{t.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
