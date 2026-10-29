export type Kategori =
  | 'Excavator'
  | 'Bulldozer'
  | 'Wheel loader'
  | 'Motor grader'
  | 'Vibro roller'
  | 'Dump truck'
  | 'Crane'
  | 'Forklift'

export type StatusUnit = 'Tersedia' | 'Terbatas' | 'Disewa'

export interface DokumenUnit {
  nama: string
  status: 'Ada' | 'Dalam proses'
  /** Nomor atau masa berlaku. Di mockup ini selalu contoh. */
  keterangan: string
}

export interface Unit {
  id: string
  nama: string
  kategori: Kategori
  merek: string
  kapasitas: string
  tahun: number
  depo: string
  status: StatusUnit
  /** Tarif "mulai dari" dalam rupiah, bukan harga final. */
  tarifMulai: number
  satuan: 'jam' | 'hari'
  tarifDiperbarui: string
  minimumSewa: string
  termasuk: { operator: boolean; bbm: boolean; mobilisasi: boolean; perawatan: boolean }
  spesifikasi: [string, string][]
  dokumen: DokumenUnit[]
}
