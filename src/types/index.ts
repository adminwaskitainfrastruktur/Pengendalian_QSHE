export interface RawRKAP {
  id_project: string;
  periode: string;
  project_name: string;
  pu_rkap: number;
  pu_real: number;
  pu_rkap_parsial: number;
  pu_real_parsial: number;
}

export interface RawMaster {
  id_project: string;
  segmentasi: string;
  klien: string;
  nilai_kontrak: number;
  progress_fisik: number;
  status_proyek: string;
  kota: string;
  lat: number;
  lng: number;
}

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
}

export interface UnifiedProjectData {
  id_project: string;
  project_name: string;
  periode: string;
  tahun: number;
  bulan_index: number;
  pu_rkap: number;
  pu_real: number;
  bk_rkap: number;
  bk_real: number;
  laba_rkap: number;
  laba_real: number;
  deviasi_pu: number;
  deviasi_laba: number;
  bk_pu_ratio: number;
  bk_pu_ratio_rkap: number;
  pct_laba_terhadap_rkap: number;
  segmentasi: string;
  klien: string;
  nilai_kontrak: number;
  nilai_proyek: number;
  progress_fisik: number;
  has_progress_data: boolean;
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
  bk_pu_mapp: number;
  deviasi_bk_pu_baseline: number;
  histori_bulanan: HistoriBulanan[];
}

export interface NkbTrendPoint {
  month: string;
  month_index: number;
  rkap: number;
  realisasi: number;
}

export interface MonthlyTrend {
  month: string;
  month_index: number;
  tahun: number;
  target: number;
  realisasi: number;
}

export interface KumulatifFinancials {
  puRkap: number;
  puReal: number;
  bkReal: number;
  labaReal: number;
  bkPuRealPct: number;
  projectCount: number;
}

export type View = 'overview' | 'geospatial' | 'master_data' | 'data_issues';

export interface Filters {
  tahun: number[];
  bulan: number[];
  segmentasi: string[];
}

export type SortKey =
  | 'pu_rkap'
  | 'pu_real'
  | 'project_name'
  | 'persentase_pu'
  | 'progress_fisik'
  | 'segmentasi'
  | 'klien'
  | 'status_kesehatan'
  | 'nilai_kontrak'
  | 'bk_rkap'
  | 'bk_real'
  | 'laba_rkap'
  | 'laba_real'
  | 'deviasi_pu'
  | 'deviasi_laba'
  | 'bk_pu_ratio';

export type SortDir = 'asc' | 'desc';