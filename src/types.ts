export interface HistoriBulanan {
  tahun: number;
  bulanIndex: number;
  bulan: string;
  rkap: number;
  real: number;
  bkRkap: number;
  bkReal: number;
  labaRkap: number;
  labaReal: number;
  progress: number;
  qshe: number;
  she: number;
  quality: number;
  qsheTarget: number;
  // Nilai posisi (bukan akumulasi) per bulan — dipakai agar filter bulan/tahun
  // ikut mengubah skor PPI dan matriks, bukan hanya angka keuangan
  progressRencana: number;
  deviasiProgress: number;
  bkPuMapp: number;
  bkPuRealKum: number;
  deviasiBkPu: number;
  stock: number;
  stock90: number;
  stock180: number;
  bkd: number;
  wipBk: number;
  tagihan: number;
  tagihan90: number;
  tagihan180: number;
}

export interface UnifiedProjectData {
  id_project: string;
  periode: string;
  tahun: number;
  bulan_index: number;
  project_name: string;
  pu_rkap: number;
  pu_real: number;
  segmentasi: string;
  klien: string;
  nilai_kontrak: number;
  nilai_proyek: number;
  bk_rkap: number;
  bk_real: number;
  laba_rkap: number;
  laba_real: number;
  deviasi_pu: number;
  deviasi_laba: number;
  bk_pu_ratio: number;
  bk_pu_ratio_rkap: number;
  pct_laba_terhadap_rkap: number;
  bk_pu_mapp: number;
  deviasi_bk_pu_baseline: number;
  progress_fisik: number;
  has_progress_data: boolean;
  qshe_score: number;
  she_score: number;
  quality_score: number;
  // Progress kumulatif (fraksi 0-1) bulan terakhir — dasar deteksi behind schedule
  progress_rencana: number;
  deviasi_progress: number;
  // Posisi neraca proyek bulan terakhir (rupiah) dari sheet Data based RKAP_value
  stock: number;
  stock_90: number;   // Stock umur >90 hari (kolom AO)
  stock_180: number;  // Stock umur >180 hari (kolom AP)
  bkd: number;
  wip_bk: number;
  tagihan_bruto: number;
  tagihan_bruto_90: number;   // umur >90 hari (kolom AR)
  tagihan_bruto_180: number;  // umur >180 hari (kolom AS)
  // BK/PU realisasi kumulatif bulan terakhir (fraksi, kolom AF)
  bk_pu_real_kumulatif: number;
  status_proyek: string;
  status_proyek_raw: string;
  kota: string;
  kota_valid: boolean;
  lat: number;
  lng: number;
  persentase_pu: number;
  status_kesehatan: 'Sehat' | 'Perhatian' | 'Kritis';
  has_koordinat: boolean;
  koordinat_bermasalah: boolean;
  has_master_data: boolean;
  is_overhead: boolean;
  histori_bulanan: HistoriBulanan[];
}

export interface MonthlyTrend {
  month: string;
  month_index: number;
  tahun: number;
  target: number;
  realisasi: number;
}

export interface NkbTrendPoint {
  month: string;
  month_index: number;
  rkap: number;
  realisasi: number;
  realisasiKonstruksi: number;
  realisasiSewaAlat: number;
  realisasiFabrikasi: number;
}

export interface YoyDataPoint {
  bulanIndex: number;
  bulan: string;
  segmentasi: string;
  puReal2025: number;
  bkReal2025: number;
  labaReal2025: number;
}

export interface KumulatifFinancials {
  puRkap: number;
  puReal: number;
  puRkapTotal: number;
  puRealTotal: number;
  bkRkap: number;
  bkReal: number;
  bkRkapTotal: number;
  bkRealTotal: number;
  labaRkap: number;
  labaReal: number;
  labaRkapTotal: number;
  bkPuRealPct: number;
  projectCount: number;
  qsheRataRata: number;
  qsheProyekCount: number;
  sheRataRata: number;
  qualityRataRata: number;
  qsheTarget: number;
  puReal2025: number;
  bkReal2025: number;
  labaReal2025: number;
}

export type View = 'overview' | 'project_performance' | 'qshe' | 'master_data' | 'paparan';

// Satu baris proyek dari sheet "all proyek" (database lengkap 2021-2026)
export interface AllProyekRow {
  no: number;
  id_project: string;
  project_name: string;
  segmentasi: string;
  pemberi_kerja: string;
  nilai_kontrak: number;        // rupiah
  progress_pct: number;         // 0-100
  pu_sd: number;                // PU kumulatif s.d. periode berjalan (rupiah)
  bk_sd: number;                // BK kumulatif s.d. periode berjalan (rupiah)
  bk_pu_pct: number;            // 0-100
  status: string;               // 'Selesai' | 'Kontribusi Annual' | lainnya
  kota: string;                 // provinsi/kota (dinormalisasi)
  provinsi: string;             // provinsi hasil normalisasi untuk peta
  internal_eksternal: string;   // 'Internal' | 'Eksternal'
  mapp_pct: number;             // 0-100, baseline BK/PU
  piutang: number;              // rupiah (sheet all proyek kolom P)
  annual: AnnualFinancialPoint[];
}

// PU/BK per tahun dari kolom UPDATE DATA ANNUAL sheet "all proyek"
export interface AnnualFinancialPoint {
  tahun: number;
  pu: number;   // rupiah
  bk: number;   // rupiah
}

export type SortKey =
  | 'pu_rkap' | 'pu_real' | 'persentase_pu' | 'nilai_kontrak' | 'progress_fisik'
  | 'project_name' | 'bk_rkap' | 'bk_real' | 'laba_rkap' | 'laba_real'
  | 'deviasi_pu' | 'deviasi_laba' | 'bk_pu_ratio';

export type SortDir = 'asc' | 'desc';

export interface Filters {
  tahun: number | null;
  bulan: number | null;
  segmentasi: string | null;
}

export type OverlayPhase = 'covering' | 'covered' | 'uncovering' | 'done';