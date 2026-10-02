// Perhitungan Project Performance Index (PPI) — mengikuti rencana indikator
// PPI WKI: Sumbu X = skor PROSES (penguatan peran GRC), Sumbu Y = skor OUTPUT
// (optimalisasi & efisiensi biaya operasional). Titik kuadran didapat dari
// penilaian atas proses (X) dan output (Y).
import type { UnifiedProjectData } from '../../types';

/** Ambang kuadran (persen). Proses ≥ 60% = "good process", Output ≥ 70% = "good output" */
export const AMBANG_PROSES = 60;
export const AMBANG_OUTPUT = 70;

export type Kuadran = 1 | 2 | 3 | 4;

export const KUADRAN_INFO: Record<Kuadran, { roman: string; nama: string; ket: string; warna: string }> = {
  1: { roman: 'I', nama: 'Development Priority', ket: 'low process, low output', warna: '#dc2626' },
  2: { roman: 'II', nama: 'Independent Performers', ket: 'low process, good output', warna: '#eab308' },
  3: { roman: 'III', nama: 'Process-Oriented', ket: 'good process, low output', warna: '#3b82f6' },
  4: { roman: 'IV', nama: 'Operational Excellence', ket: 'good process, good output', warna: '#16a34a' },
};

/** Satu indikator bernilai skor 0–5 dengan bobot tertentu */
export interface Indikator {
  key: string;
  label: string;
  skor: number;          // 0–5
  maks: number;          // 5
  bobot: number;         // persen
  keterangan: string;    // rincian angka di balik skor
  adaData: boolean;      // false = indikator belum punya sumber data
}

/**
 * Penilaian bertingkat deviasi terhadap ambang penyimpangan (slide 6).
 * Semakin kecil deviasi, semakin tinggi skor:
 *   deviasi ≤ 0                      → 5
 *   0 < deviasi ≤ 25% × penyimpangan → 4
 *   ... → 3, 2, 1
 *   deviasi > penyimpangan           → 0
 */
const skorDeviasi = (deviasi: number, penyimpangan: number): number => {
  if (deviasi <= 0) return 5;
  if (penyimpangan <= 0) return 0;          // Progress tinggi: deviasi > 0 langsung 0
  if (deviasi > penyimpangan) return 0;
  if (deviasi > 0.75 * penyimpangan) return 1;
  if (deviasi > 0.50 * penyimpangan) return 2;
  if (deviasi > 0.25 * penyimpangan) return 3;
  return 4;
};

/** Skor berjenjang untuk umur (hari) — makin tua makin rendah */
const skorUmur = (hari: number, batas: number[]): number => {
  // batas diurut menaik; skor 5 bila di bawah batas pertama
  for (let i = 0; i < batas.length; i++) {
    if (hari < batas[i]) return 5 - i;
  }
  return 0;
};

// ══════════════ SKOR OUTPUT (Sumbu Y) ══════════════
export const hitungOutput = (d: UnifiedProjectData): { skor: number; indikator: Indikator[] } => {
  const riPct = d.progress_fisik * 100;                      // progress realisasi (%)
  const lagPct = Math.max(-d.deviasi_progress, 0) * 100;     // ketinggalan progress (%)
  const overPct = Math.max(d.deviasi_bk_pu_baseline, 0) * 100; // kelebihan BK/PU (pp)

  // Ambang penyimpangan mengecil seiring progress naik, lalu nol di ujung
  const penyimpanganProgress = riPct < 90 ? 10 - riPct / 9 : 0;
  const penyimpanganBkPu = riPct < 85 ? 8.5 - riPct / 10 : 0;

  // Umur tagihan bruto: pakai porsi tertua yang masih ada nilainya
  const umurTagihan = d.tagihan_bruto_180 > 0 ? 200
    : d.tagihan_bruto_90 > 0 ? 120
      : d.tagihan_bruto > 0 ? 30 : 0;
  // Umur stok: sama, dari porsi tertua yang bernilai
  const umurStok = d.stock_180 > 0 ? 200
    : d.stock_90 > 0 ? 120
      : d.stock > 0 ? 30 : 0;

  const indikator: Indikator[] = [
    {
      key: 'progress', label: 'Progress', bobot: 45, maks: 5, adaData: d.progress_rencana > 0 || d.progress_fisik > 0,
      skor: skorDeviasi(lagPct, penyimpanganProgress),
      keterangan: `Ra ${(d.progress_rencana * 100).toFixed(2)}% · Ri ${riPct.toFixed(2)}% · deviasi ${(d.deviasi_progress * 100).toFixed(2)}%`,
    },
    {
      key: 'bkpu', label: 'BK/PU', bobot: 35, maks: 5, adaData: d.bk_pu_mapp > 0 || d.bk_pu_real_kumulatif > 0,
      skor: skorDeviasi(overPct, penyimpanganBkPu),
      keterangan: `App ${(d.bk_pu_mapp * 100).toFixed(2)}% · Real ${(d.bk_pu_real_kumulatif * 100).toFixed(2)}% · deviasi ${(d.deviasi_bk_pu_baseline * 100).toFixed(2)}%`,
    },
    {
      key: 'tagihan', label: 'Umur Tagihan Bruto', bobot: 10, maks: 5, adaData: true,
      skor: umurTagihan === 0 ? 5 : skorUmur(umurTagihan, [30, 60, 90, 180, 360]),
      keterangan: umurTagihan === 0 ? 'Tidak ada tagihan bruto tertunggak'
        : d.tagihan_bruto_180 > 0 ? '> 180 hari' : d.tagihan_bruto_90 > 0 ? '90–180 hari' : '< 90 hari',
    },
    {
      key: 'stok', label: 'Aging Stock', bobot: 10, maks: 5, adaData: true,
      skor: umurStok === 0 ? 5 : skorUmur(umurStok, [30, 45, 60, 75, 90]),
      keterangan: umurStok === 0 ? 'Tidak ada stok menua'
        : d.stock_180 > 0 ? '> 180 hari' : d.stock_90 > 0 ? '> 90 hari' : '< 90 hari',
    },
  ];

  const skor = indikator.reduce((s, i) => s + (i.skor / i.maks) * i.bobot, 0);
  return { skor, indikator };
};

// ══════════════ SKOR PROSES (Sumbu X) ══════════════
// Beberapa indikator rencana PPI (LEP, monitoring pengadaan, review pasal
// kontraktual, risk register) belum punya sumber data di Excel. Indikator itu
// tetap ditampilkan sebagai "belum ada data" dan bobotnya tidak ikut dihitung,
// sehingga skor proses jujur mencerminkan apa yang benar-benar terukur.
export const hitungProses = (d: UnifiedProjectData): { skor: number; indikator: Indikator[] } => {
  const adaMasterSchedule = d.progress_rencana > 0;
  const adaUpdateRealisasi = d.progress_fisik > 0;
  const adaApp = d.bk_pu_mapp > 0;

  const indikator: Indikator[] = [
    {
      key: 'master-schedule', label: 'Pembuatan Master Schedule', bobot: 10, maks: 5, adaData: true,
      skor: adaMasterSchedule ? 5 : 0,
      keterangan: adaMasterSchedule ? `Ada rencana progress (Ra ${(d.progress_rencana * 100).toFixed(2)}%)` : 'Belum ada rencana progress',
    },
    {
      key: 'update-realisasi', label: 'Update Realisasi Master Schedule', bobot: 15, maks: 5, adaData: true,
      skor: adaUpdateRealisasi ? 5 : 0,
      keterangan: adaUpdateRealisasi ? `Realisasi progress terisi (Ri ${(d.progress_fisik * 100).toFixed(2)}%)` : 'Realisasi progress belum diisi',
    },
    {
      key: 'input-sap', label: 'Input Realisasi Progress SAP', bobot: 10, maks: 5, adaData: true,
      skor: adaUpdateRealisasi ? 5 : 0,
      keterangan: adaUpdateRealisasi ? 'Progress terekam di sumber data' : 'Belum ada rekaman progress',
    },
    {
      key: 'app-budget', label: 'Ketersediaan APP / Budget', bobot: 20, maks: 5, adaData: true,
      skor: adaApp ? 5 : 0,
      keterangan: adaApp ? `Baseline BK/PU tersedia (${(d.bk_pu_mapp * 100).toFixed(2)}%)` : 'Baseline BK/PU belum tersedia',
    },
    {
      key: 'quality', label: 'Skor Kinerja Quality', bobot: 10, maks: 5, adaData: d.quality_score > 0,
      skor: d.quality_score <= 0 ? 0 : d.quality_score >= 100 ? 5 : d.quality_score > 80 ? 4 : 2,
      keterangan: d.quality_score > 0 ? `Skor ${d.quality_score.toFixed(2)}` : 'Belum ada penilaian Quality',
    },
    {
      key: 'she', label: 'Skor Kinerja SHE', bobot: 10, maks: 5, adaData: d.she_score > 0,
      skor: d.she_score <= 0 ? 0 : d.she_score >= 100 ? 5 : d.she_score > 80 ? 4 : 2,
      keterangan: d.she_score > 0 ? `Skor ${d.she_score.toFixed(2)}` : 'Belum ada penilaian SHE',
    },
    // ── Indikator rencana PPI yang belum punya sumber data ──
    { key: 'lep', label: 'Laporan Evaluasi Proyek (LEP)', bobot: 10, maks: 5, skor: 0, adaData: false, keterangan: 'Belum ada sumber data' },
    { key: 'pengadaan', label: 'Monitoring Pengadaan Vendor', bobot: 5, maks: 5, skor: 0, adaData: false, keterangan: 'Belum ada sumber data' },
    { key: 'kontraktual', label: 'Review Pasal Kontraktual', bobot: 5, maks: 5, skor: 0, adaData: false, keterangan: 'Belum ada sumber data' },
    { key: 'risiko', label: 'Ketersediaan Risk Register', bobot: 5, maks: 5, skor: 0, adaData: false, keterangan: 'Belum ada sumber data' },
  ];

  // Hanya indikator ber-data yang dinilai; bobotnya dinormalisasi ke 100%
  const terukur = indikator.filter(i => i.adaData);
  const totalBobot = terukur.reduce((s, i) => s + i.bobot, 0);
  const skor = totalBobot > 0
    ? terukur.reduce((s, i) => s + (i.skor / i.maks) * i.bobot, 0) / totalBobot * 100
    : 0;
  return { skor, indikator };
};

export interface BarisPpi {
  d: UnifiedProjectData;
  id: string;
  nama: string;
  segmentasi: string;
  prosesPct: number;
  outputPct: number;
  kuadran: Kuadran;
  indikatorProses: Indikator[];
  indikatorOutput: Indikator[];
}

const SEG_NON_PROYEK = ['AMP', 'Workshop'];

/** Menentukan kuadran dari titik (proses, output) */
export const tentukanKuadran = (prosesPct: number, outputPct: number): Kuadran => {
  const prosesBaik = prosesPct >= AMBANG_PROSES;
  const outputBaik = outputPct >= AMBANG_OUTPUT;
  if (prosesBaik && outputBaik) return 4;
  if (prosesBaik && !outputBaik) return 3;
  if (!prosesBaik && outputBaik) return 2;
  return 1;
};

/**
 * Tren bulanan skor proses & output untuk satu proyek.
 * Yang benar-benar tersedia per bulan hanyalah realisasi keuangan, progress,
 * dan skor QSHE — maka output bulanan dihitung dari deviasi BK/PU bulan itu,
 * dan proses bulanan dari kelengkapan pencatatan + skor QSHE bulan tersebut.
 */
export const trenBulananPpi = (d: UnifiedProjectData) => {
  const baris = [...d.histori_bulanan]
    .filter(h => h.rkap !== 0 || h.real !== 0 || h.qshe > 0)
    .sort((a, b) => (a.tahun - b.tahun) || (a.bulanIndex - b.bulanIndex));

  let akRkap = 0, akReal = 0, akBkRkap = 0, akBkReal = 0;
  return baris.map(h => {
    akRkap += h.rkap; akReal += h.real;
    akBkRkap += h.bkRkap; akBkReal += h.bkReal;

    // Output: deviasi BK/PU kumulatif terhadap baseline bulan berjalan
    const bkPuReal = akReal > 0 ? (akBkReal / akReal) * 100 : 0;
    const bkPuRkap = akRkap > 0 ? (akBkRkap / akRkap) * 100 : 0;
    const riPct = h.progress * 100;
    const penyimpangan = riPct < 85 ? 8.5 - riPct / 10 : 0;
    const skorBkPu = skorDeviasi(Math.max(bkPuReal - bkPuRkap, 0), penyimpangan);

    // Proses: pencatatan progress + skor QSHE bulan itu
    const nilaiQ = (v: number) => v <= 0 ? 0 : v >= 100 ? 5 : v > 80 ? 4 : 2;
    const komponen = [
      h.progress > 0 ? 5 : 0,
      nilaiQ(h.quality),
      nilaiQ(h.she),
    ];
    const proses = (komponen.reduce((s, v) => s + v, 0) / (komponen.length * 5)) * 100;

    return {
      label: `${h.bulan} ${String(h.tahun).slice(-2)}`,
      proses: Number(proses.toFixed(2)),
      output: Number(((skorBkPu / 5) * 100).toFixed(2)),
    };
  });
};

export const hitungPpi = (data: UnifiedProjectData[]): BarisPpi[] =>
  data
    .filter(d => !d.is_overhead && !SEG_NON_PROYEK.includes(d.segmentasi))
    .map(d => {
      const output = hitungOutput(d);
      const proses = hitungProses(d);
      return {
        d, id: d.id_project, nama: d.project_name, segmentasi: d.segmentasi,
        prosesPct: proses.skor,
        outputPct: output.skor,
        kuadran: tentukanKuadran(proses.skor, output.skor),
        indikatorProses: proses.indikator,
        indikatorOutput: output.indikator,
      };
    })
    .sort((a, b) => b.outputPct - a.outputPct);
