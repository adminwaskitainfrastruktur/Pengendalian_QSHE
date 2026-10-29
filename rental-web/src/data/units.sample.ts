import type { DokumenUnit, Unit } from './types'

// SELURUH DATA DI BERKAS INI CONTOH. Bukan armada, harga, atau dokumen nyata.
// Sumber data asli menyusul (arah awal: SharePoint List atau Google Drive).

const dokumen = (riksa: DokumenUnit['status'], silo: DokumenUnit['status']): DokumenUnit[] => [
  { nama: 'Sertifikat uji riksa', status: riksa, keterangan: riksa === 'Ada' ? 'No. contoh, berlaku sampai 2027' : 'Jadwal uji dikonfirmasi' },
  { nama: 'SILO alat', status: silo, keterangan: silo === 'Ada' ? 'No. contoh, diterbitkan dinas setempat' : 'Pengajuan berjalan' },
  { nama: 'SIO operator', status: 'Ada', keterangan: 'Operator bersertifikat, data pribadi disamarkan' },
  { nama: 'Asuransi alat', status: 'Ada', keterangan: 'Polis contoh, penanggung diisi nanti' },
]

const ex = (operator: boolean) => ({ operator, bbm: false, mobilisasi: false, perawatan: true })

export const unitContoh: Unit[] = [
  {
    id: 'exc-20t-01', nama: 'Excavator 20 ton', kategori: 'Excavator', merek: 'Komatsu', kapasitas: 'Bucket 0,9 m3',
    tahun: 2021, depo: 'Jakarta', status: 'Tersedia', tarifMulai: 450000, satuan: 'jam', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 100 jam', termasuk: ex(true),
    spesifikasi: [['Bobot operasi', 'sekitar 20 ton'], ['Kedalaman gali', 'sekitar 6,5 m'], ['Jenis sewa', 'Basah atau kering'], ['Hour meter saat ini', 'Diisi dari data unit']],
    dokumen: dokumen('Ada', 'Ada'),
  },
  {
    id: 'exc-mini-01', nama: 'Mini excavator 5 ton', kategori: 'Excavator', merek: 'Kobelco', kapasitas: 'Bucket 0,2 m3',
    tahun: 2022, depo: 'Jakarta', status: 'Tersedia', tarifMulai: 280000, satuan: 'jam', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 50 jam', termasuk: ex(false),
    spesifikasi: [['Bobot operasi', 'sekitar 5 ton'], ['Lebar jejak', 'sekitar 1,9 m'], ['Jenis sewa', 'Kering'], ['Cocok untuk', 'Galian saluran dan area sempit']],
    dokumen: dokumen('Ada', 'Dalam proses'),
  },
  {
    id: 'exc-30t-01', nama: 'Excavator 30 ton', kategori: 'Excavator', merek: 'Hitachi', kapasitas: 'Bucket 1,4 m3',
    tahun: 2019, depo: 'Surabaya', status: 'Terbatas', tarifMulai: 620000, satuan: 'jam', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 100 jam', termasuk: ex(true),
    spesifikasi: [['Bobot operasi', 'sekitar 30 ton'], ['Kedalaman gali', 'sekitar 7,2 m'], ['Jenis sewa', 'Basah atau kering'], ['Catatan', 'Ketersediaan dikonfirmasi per tanggal']],
    dokumen: dokumen('Ada', 'Ada'),
  },
  {
    id: 'dzr-01', nama: 'Bulldozer kelas 150 HP', kategori: 'Bulldozer', merek: 'Komatsu', kapasitas: 'Blade semi-U',
    tahun: 2018, depo: 'Medan', status: 'Tersedia', tarifMulai: 520000, satuan: 'jam', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 100 jam', termasuk: ex(true),
    spesifikasi: [['Tenaga', 'sekitar 150 HP'], ['Bobot operasi', 'sekitar 17 ton'], ['Jenis sewa', 'Basah atau kering'], ['Cocok untuk', 'Perataan lahan dan jalan kerja']],
    dokumen: dokumen('Ada', 'Ada'),
  },
  {
    id: 'whl-01', nama: 'Wheel loader 2,5 m3', kategori: 'Wheel loader', merek: 'Caterpillar', kapasitas: 'Bucket 2,5 m3',
    tahun: 2020, depo: 'Jakarta', status: 'Tersedia', tarifMulai: 380000, satuan: 'jam', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 100 jam', termasuk: ex(true),
    spesifikasi: [['Kapasitas bucket', 'sekitar 2,5 m3'], ['Bobot operasi', 'sekitar 17 ton'], ['Jenis sewa', 'Basah atau kering'], ['Cocok untuk', 'Pemuatan material dan stockpile']],
    dokumen: dokumen('Ada', 'Ada'),
  },
  {
    id: 'grd-01', nama: 'Motor grader 135 HP', kategori: 'Motor grader', merek: 'Komatsu', kapasitas: 'Blade 3,7 m',
    tahun: 2017, depo: 'Surabaya', status: 'Disewa', tarifMulai: 410000, satuan: 'jam', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 100 jam', termasuk: ex(true),
    spesifikasi: [['Tenaga', 'sekitar 135 HP'], ['Lebar blade', 'sekitar 3,7 m'], ['Jenis sewa', 'Basah'], ['Perkiraan kembali', 'Tanya tim penjualan']],
    dokumen: dokumen('Ada', 'Ada'),
  },
  {
    id: 'vib-01', nama: 'Vibro roller 10 ton', kategori: 'Vibro roller', merek: 'Bomag', kapasitas: 'Drum 2,1 m',
    tahun: 2021, depo: 'Jakarta', status: 'Tersedia', tarifMulai: 330000, satuan: 'jam', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 50 jam', termasuk: ex(true),
    spesifikasi: [['Bobot operasi', 'sekitar 10 ton'], ['Lebar drum', 'sekitar 2,1 m'], ['Jenis sewa', 'Basah atau kering'], ['Cocok untuk', 'Pemadatan tanah dan base course']],
    dokumen: dokumen('Ada', 'Dalam proses'),
  },
  {
    id: 'dmp-01', nama: 'Dump truck 10 ton', kategori: 'Dump truck', merek: 'Hino', kapasitas: 'Bak 10 ton',
    tahun: 2022, depo: 'Medan', status: 'Tersedia', tarifMulai: 1900000, satuan: 'hari', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 7 hari', termasuk: { operator: true, bbm: false, mobilisasi: false, perawatan: true },
    spesifikasi: [['Muatan', 'sekitar 10 ton'], ['Jenis sewa', 'Dengan pengemudi'], ['SIM pengemudi', 'B2, dicatat di dokumen'], ['Cocok untuk', 'Angkut material proyek']],
    dokumen: dokumen('Ada', 'Ada'),
  },
  {
    id: 'crn-25t-01', nama: 'Mobile crane 25 ton', kategori: 'Crane', merek: 'Tadano', kapasitas: 'Angkat 25 ton',
    tahun: 2016, depo: 'Jakarta', status: 'Terbatas', tarifMulai: 1500000, satuan: 'jam', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 8 jam per hari', termasuk: { operator: true, bbm: false, mobilisasi: false, perawatan: true },
    spesifikasi: [['Kapasitas angkat', 'sekitar 25 ton'], ['Panjang boom', 'sekitar 30 m'], ['Jenis sewa', 'Dengan operator dan rigger'], ['Catatan', 'Rencana angkat dibuat per pekerjaan']],
    dokumen: dokumen('Ada', 'Ada'),
  },
  {
    id: 'exc-14t-01', nama: 'Excavator 14 ton', kategori: 'Excavator', merek: 'Caterpillar', kapasitas: 'Bucket 0,6 m3',
    tahun: 2020, depo: 'Medan', status: 'Tersedia', tarifMulai: 360000, satuan: 'jam', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 100 jam', termasuk: ex(true),
    spesifikasi: [['Bobot operasi', 'sekitar 14 ton'], ['Kedalaman gali', 'sekitar 5,6 m'], ['Jenis sewa', 'Basah atau kering'], ['Cocok untuk', 'Galian pondasi dan saluran']],
    dokumen: dokumen('Ada', 'Ada'),
  },
  {
    id: 'vib-02', nama: 'Vibro roller 6 ton', kategori: 'Vibro roller', merek: 'Sakai', kapasitas: 'Drum 1,7 m',
    tahun: 2019, depo: 'Medan', status: 'Terbatas', tarifMulai: 270000, satuan: 'jam', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 50 jam', termasuk: ex(true),
    spesifikasi: [['Bobot operasi', 'sekitar 6 ton'], ['Lebar drum', 'sekitar 1,7 m'], ['Jenis sewa', 'Basah atau kering'], ['Cocok untuk', 'Pemadatan jalan lingkungan dan parkir']],
    dokumen: dokumen('Ada', 'Dalam proses'),
  },
  {
    id: 'fkl-01', nama: 'Forklift 3 ton', kategori: 'Forklift', merek: 'Toyota', kapasitas: 'Angkat 3 ton',
    tahun: 2022, depo: 'Surabaya', status: 'Tersedia', tarifMulai: 1100000, satuan: 'hari', tarifDiperbarui: '2026-10-29',
    minimumSewa: 'Minimum 7 hari', termasuk: { operator: false, bbm: false, mobilisasi: false, perawatan: true },
    spesifikasi: [['Kapasitas angkat', 'sekitar 3 ton'], ['Tinggi angkat', 'sekitar 4,5 m'], ['Jenis sewa', 'Kering'], ['Penggerak', 'Diesel']],
    dokumen: dokumen('Ada', 'Dalam proses'),
  },
]
