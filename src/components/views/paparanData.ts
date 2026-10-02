// Perhitungan data untuk Paparan (PPT). Dipisah dari komponen supaya
// PaparanView fokus ke penyusunan slide, dan filter khusus paparan
// (segmentasi + rentang bulan) dihitung ulang di sini — tidak memakai
// hasil filter global dashboard.
import { MONTH_LABELS } from '../../constants';
import type { UnifiedProjectData, AllProyekRow, NkbTrendPoint, YoyDataPoint } from '../../types';
import { fShort, fNum } from '../../utils';

export const pctOf = (real: number, rkap: number) => rkap !== 0 ? (real / rkap) * 100 : 0;
export const fPct = (n: number) => n !== 0 ? `${n.toFixed(2)}%` : '—';

export interface PaparanFilter {
  tahun: number;
  bulanDari: number;
  bulanSampai: number;
  segmentasi: string;      // '' = semua segmentasi
}

const SEG_QSHE_ONLY = ['AMP', 'Workshop'];

/** Baris proyek yang lolos filter segmentasi paparan */
export const saringBaris = (rows: UnifiedProjectData[], f: PaparanFilter) =>
  f.segmentasi ? rows.filter(d => d.segmentasi === f.segmentasi) : rows;

/** Agregasi keuangan pada rentang bulan yang dipilih */
export const hitungKumulatif = (rows: UnifiedProjectData[], f: PaparanFilter) => {
  let puRkap = 0, puReal = 0, bkRkap = 0, bkReal = 0, labaRkap = 0, labaReal = 0;
  let puRkapTotal = 0, bkRkapTotal = 0, labaRkapTotal = 0;
  const proyek = new Set<string>();
  const qsheSkor: number[] = [], sheSkor: number[] = [], qualitySkor: number[] = [];
  const targetSkor: number[] = [];

  rows.forEach(d => {
    let adaBaris = false;
    // Skor QSHE = kondisi bulan terakhir yang terisi dalam rentang
    let qsheKini = 0, sheKini = 0, qualityKini = 0, blnQshe = -1, blnShe = -1, blnQual = -1;
    d.histori_bulanan.forEach(h => {
      if (h.tahun !== f.tahun) return;
      if (h.qsheTarget > 0) targetSkor.push(h.qsheTarget);
      puRkapTotal += h.rkap; bkRkapTotal += h.bkRkap; labaRkapTotal += h.labaRkap;
      if (h.bulanIndex < f.bulanDari || h.bulanIndex > f.bulanSampai) return;
      adaBaris = true;
      puRkap += h.rkap; puReal += h.real;
      bkRkap += h.bkRkap; bkReal += h.bkReal;
      labaRkap += h.labaRkap; labaReal += h.labaReal;
      if (h.qshe > 0 && h.bulanIndex > blnQshe) { qsheKini = h.qshe; blnQshe = h.bulanIndex; }
      if (h.she > 0 && h.bulanIndex > blnShe) { sheKini = h.she; blnShe = h.bulanIndex; }
      if (h.quality > 0 && h.bulanIndex > blnQual) { qualityKini = h.quality; blnQual = h.bulanIndex; }
    });
    if (adaBaris && !d.is_overhead) proyek.add(d.id_project);
    if (qsheKini > 0) qsheSkor.push(qsheKini);
    if (sheKini > 0) sheSkor.push(sheKini);
    if (qualityKini > 0) qualitySkor.push(qualityKini);
  });

  const rata = (a: number[]) => a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0;
  return {
    puRkap, puReal, bkRkap, bkReal, labaRkap, labaReal,
    puRkapTotal, bkRkapTotal, labaRkapTotal,
    bkPuRealPct: puReal > 0 ? (bkReal / puReal) * 100 : 0,
    bkPuRkapSd: puRkap > 0 ? (bkRkap / puRkap) * 100 : 0,
    bkPuRkapAll: puRkapTotal > 0 ? (bkRkapTotal / puRkapTotal) * 100 : 0,
    projectCount: proyek.size,
    qsheRataRata: rata(qsheSkor), sheRataRata: rata(sheSkor), qualityRataRata: rata(qualitySkor),
    qsheTarget: rata(targetSkor), qsheProyekCount: qsheSkor.length,
  };
};

export type Kumulatif = ReturnType<typeof hitungKumulatif>;

/** Total PU/BK/Laba per proyek pada rentang bulan terpilih */
export const totalPerProyek = (rows: UnifiedProjectData[], f: PaparanFilter) =>
  rows.map(d => {
    let puRkap = 0, puReal = 0, bkRkap = 0, bkReal = 0, labaRkap = 0, labaReal = 0;
    d.histori_bulanan.forEach(h => {
      if (h.tahun !== f.tahun || h.bulanIndex < f.bulanDari || h.bulanIndex > f.bulanSampai) return;
      puRkap += h.rkap; puReal += h.real;
      bkRkap += h.bkRkap; bkReal += h.bkReal;
      labaRkap += h.labaRkap; labaReal += h.labaReal;
    });
    return {
      d, nama: d.project_name, puRkap, puReal, bkRkap, bkReal, labaRkap, labaReal,
      deviasiPu: puReal - puRkap, deviasiLaba: labaReal - labaRkap,
      bkPu: puReal > 0 ? (bkReal / puReal) * 100 : 0,
      bkPuRkap: puRkap > 0 ? (bkRkap / puRkap) * 100 : 0,
    };
  }).filter(r => r.puRkap !== 0 || r.puReal !== 0);

export type BarisProyek = ReturnType<typeof totalPerProyek>[number];

/** Deret bulanan (parsial & kumulatif) dalam miliar rupiah */
export const hitungTren = (rows: UnifiedProjectData[], f: PaparanFilter) => {
  const acc = new Map<number, { rkap: number; real: number; labaRkap: number; labaReal: number }>();
  rows.forEach(d => d.histori_bulanan.forEach(h => {
    if (h.tahun !== f.tahun || h.bulanIndex < f.bulanDari || h.bulanIndex > f.bulanSampai) return;
    if (!acc.has(h.bulanIndex)) acc.set(h.bulanIndex, { rkap: 0, real: 0, labaRkap: 0, labaReal: 0 });
    const a = acc.get(h.bulanIndex)!;
    a.rkap += h.rkap; a.real += h.real;
    a.labaRkap += h.labaRkap; a.labaReal += h.labaReal;
  }));
  const list = Array.from(acc.entries()).sort((a, b) => a[0] - b[0]);
  const toM = (v: number) => Number((v / 1e9).toFixed(2));
  let akR = 0, akL = 0, akLR = 0, akLL = 0;
  return {
    bulanIndex: list.map(([m]) => m),
    labels: list.map(([m]) => MONTH_LABELS[m] ?? String(m)),
    rkap: list.map(([, a]) => toM(a.rkap)),
    real: list.map(([, a]) => toM(a.real)),
    labaRkap: list.map(([, a]) => toM(a.labaRkap)),
    labaReal: list.map(([, a]) => toM(a.labaReal)),
    kumRkap: list.map(([, a]) => { akR += a.rkap; return toM(akR); }),
    kumReal: list.map(([, a]) => { akL += a.real; return toM(akL); }),
    kumLabaRkap: list.map(([, a]) => { akLR += a.labaRkap; return toM(akLR); }),
    kumLabaReal: list.map(([, a]) => { akLL += a.labaReal; return toM(akLL); }),
  };
};

/** Deret bulanan tahun sebelumnya untuk grafik YoY */
export const hitungYoyBulanan = (yoy: YoyDataPoint[], f: PaparanFilter) => {
  const acc = new Map<number, { pu: number; laba: number }>();
  yoy.forEach(y => {
    if (y.bulanIndex < f.bulanDari || y.bulanIndex > f.bulanSampai) return;
    if (f.segmentasi && y.segmentasi !== f.segmentasi) return;
    if (!acc.has(y.bulanIndex)) acc.set(y.bulanIndex, { pu: 0, laba: 0 });
    const a = acc.get(y.bulanIndex)!;
    a.pu += y.puReal2025; a.laba += y.labaReal2025;
  });
  const toM = (v: number) => Number((v / 1e9).toFixed(2));
  return {
    ambil: (bulan: number[]) => ({
      pu: bulan.map(b => toM(acc.get(b)?.pu ?? 0)),
      laba: bulan.map(b => toM(acc.get(b)?.laba ?? 0)),
    }),
  };
};

/** Baris matrix: penyimpangan progress & BK/PU dengan ambang dinamis */
export const hitungMatrix = (rows: UnifiedProjectData[]) =>
  rows
    .filter(d => !d.is_overhead && !SEG_QSHE_ONLY.includes(d.segmentasi))
    .map(d => {
      const riPct = d.progress_fisik * 100;
      const lagPct = Math.max(-d.deviasi_progress, 0) * 100;
      const overPct = d.deviasi_bk_pu_baseline * 100;
      const simpangProgress = riPct < 90 ? lagPct > (10 - riPct / 9) : lagPct > 0;
      const simpangBkPu = riPct < 85 ? overPct > (8.5 - riPct / 10) : overPct > 0;
      const extra = simpangProgress || simpangBkPu
        || d.tagihan_bruto_90 > 0 || d.tagihan_bruto_180 > 0 || d.stock_180 > 0;
      const attention = d.stock_90 > 0 || d.bkd !== 0 || d.wip_bk !== 0;
      const aging = d.tagihan_bruto > 0
        ? Math.min((d.tagihan_bruto_90 + d.tagihan_bruto_180) / d.tagihan_bruto, 1) : 0;
      return {
        nama: d.project_name,
        segmentasi: d.segmentasi,
        // Progress: Ra = rencana, Ri = realisasi
        progressRa: d.progress_rencana * 100,
        progressRi: riPct,
        deviasiProgress: d.deviasi_progress * 100,
        // BK/PU: App = baseline MAPP, Real = realisasi kumulatif
        bkPuApp: d.bk_pu_mapp * 100,
        bkPuReal: d.bk_pu_real_kumulatif * 100,
        deviasiBkPu: overPct,
        status: extra ? 'Extra Attention' : attention ? 'Attention' : 'Normal',
        stok: d.stock, stok90: d.stock_90, stok180: d.stock_180,
        bkd: d.bkd, wip: d.wip_bk,
        tagihan: d.tagihan_bruto, tagihan90: d.tagihan_bruto_90, tagihan180: d.tagihan_bruto_180,
        skor: (simpangProgress ? Math.min(lagPct / 100, 1) : 0) * 40
          + (simpangBkPu ? Math.min(Math.abs(overPct) / 100, 1) : 0) * 40 + aging * 20,
      };
    })
    .sort((a, b) => b.skor - a.skor);

export type BarisMatrix = ReturnType<typeof hitungMatrix>[number];

/** Rekap per provinsi dari database all proyek */
export const hitungProvinsi = (list: AllProyekRow[]) => {
  const map = new Map<string, { count: number; pu: number; bk: number }>();
  list.forEach(p => {
    if (!p.provinsi) return;
    if (!map.has(p.provinsi)) map.set(p.provinsi, { count: 0, pu: 0, bk: 0 });
    const a = map.get(p.provinsi)!;
    a.count += 1; a.pu += p.pu_sd; a.bk += p.bk_sd;
  });
  return Array.from(map.entries())
    .map(([nama, v]) => ({ nama, ...v, bkPu: pctOf(v.bk, v.pu) }))
    .sort((a, b) => b.pu - a.pu);
};

/** Analitik database: historis tahunan, internal/eksternal, top pemberi kerja */
export const hitungAnalitik = (list: AllProyekRow[]) => {
  const byYear = new Map<number, { pu: number; bk: number }>();
  let intPu = 0, eksPu = 0, intN = 0, eksN = 0;
  const pk = new Map<string, { pu: number; n: number }>();
  list.forEach(p => {
    p.annual.forEach(a => {
      if (!byYear.has(a.tahun)) byYear.set(a.tahun, { pu: 0, bk: 0 });
      const y = byYear.get(a.tahun)!;
      y.pu += a.pu; y.bk += a.bk;
    });
    if (/internal/i.test(p.internal_eksternal)) { intPu += p.pu_sd; intN++; }
    else if (/eksternal|external/i.test(p.internal_eksternal)) { eksPu += p.pu_sd; eksN++; }
    if (p.pemberi_kerja && p.pemberi_kerja !== 'Tidak Diketahui' && p.pemberi_kerja !== '0') {
      const cur = pk.get(p.pemberi_kerja) ?? { pu: 0, n: 0 };
      pk.set(p.pemberi_kerja, { pu: cur.pu + p.pu_sd, n: cur.n + 1 });
    }
  });
  const tahunan = Array.from(byYear.entries())
    .filter(([, v]) => v.pu !== 0 || v.bk !== 0)
    .sort((a, b) => a[0] - b[0]);
  const toM = (v: number) => Number((v / 1e9).toFixed(2));
  return {
    tahunLabels: tahunan.map(([t]) => String(t)),
    tahunPu: tahunan.map(([, v]) => toM(v.pu)),
    tahunLaba: tahunan.map(([, v]) => toM(v.pu - v.bk)),
    intPu, eksPu, intN, eksN,
    topPk: Array.from(pk.entries())
      .map(([nama, v]) => ({ nama, pu: v.pu, n: v.n }))
      .sort((a, b) => b.pu - a.pu),
  };
};

/** Unit QSHE beserta skor bulan terakhir dalam rentang */
export const hitungQsheUnit = (rows: UnifiedProjectData[], f: PaparanFilter) =>
  rows
    .map(d => {
      const hist = d.histori_bulanan
        .filter(h => h.tahun === f.tahun && h.bulanIndex >= f.bulanDari && h.bulanIndex <= f.bulanSampai && h.qshe > 0)
        .sort((a, b) => a.bulanIndex - b.bulanIndex);
      const last = hist[hist.length - 1];
      return last
        ? { nama: d.project_name, seg: d.segmentasi, she: last.she, quality: last.quality, qshe: last.qshe, target: last.qsheTarget }
        : null;
    })
    .filter((u): u is NonNullable<typeof u> => u !== null)
    .sort((a, b) => b.qshe - a.qshe);

export type UnitQshe = ReturnType<typeof hitungQsheUnit>[number];

/** Deret bulanan rata-rata skor QSHE/SHE/Quality */
export const hitungQsheTren = (rows: UnifiedProjectData[], f: PaparanFilter) => {
  const acc = new Map<number, { qshe: number[]; she: number[]; quality: number[] }>();
  rows.forEach(d => d.histori_bulanan.forEach(h => {
    if (h.tahun !== f.tahun || h.bulanIndex < f.bulanDari || h.bulanIndex > f.bulanSampai || h.qshe <= 0) return;
    if (!acc.has(h.bulanIndex)) acc.set(h.bulanIndex, { qshe: [], she: [], quality: [] });
    const a = acc.get(h.bulanIndex)!;
    a.qshe.push(h.qshe);
    if (h.she > 0) a.she.push(h.she);
    if (h.quality > 0) a.quality.push(h.quality);
  }));
  const list = Array.from(acc.entries()).sort((a, b) => a[0] - b[0]);
  const avg = (arr: number[]) => arr.length ? Number((arr.reduce((s, x) => s + x, 0) / arr.length).toFixed(1)) : 0;
  return {
    labels: list.map(([m]) => MONTH_LABELS[m] ?? String(m)),
    qshe: list.map(([, v]) => avg(v.qshe)),
    she: list.map(([, v]) => avg(v.she)),
    quality: list.map(([, v]) => avg(v.quality)),
  };
};

/** NKB pada bulan akhir rentang */
export const hitungNkb = (nkb: NkbTrendPoint[], f: PaparanFilter) => {
  const titik = nkb.find(p => p.month_index === f.bulanSampai) ?? null;
  const des = nkb.find(p => p.month_index === 12);
  const rkapSetahun = des?.rkap ?? (nkb.length ? nkb[nkb.length - 1].rkap : 0);
  if (!titik) return { rkap: 0, realisasi: 0, rkapSetahun };
  // NKB hanya dipecah untuk Konstruksi, Sewa Alat, & Fabrikasi; segmentasi lain = 0
  if (!f.segmentasi) return { rkap: titik.rkap, realisasi: titik.realisasi, rkapSetahun };
  if (f.segmentasi === 'Konstruksi') return { rkap: titik.rkap, realisasi: titik.realisasiKonstruksi, rkapSetahun };
  if (f.segmentasi === 'Sewa Alat') return { rkap: titik.rkap, realisasi: titik.realisasiSewaAlat, rkapSetahun };
  if (f.segmentasi === 'Fabrikasi') return { rkap: titik.rkap, realisasi: titik.realisasiFabrikasi, rkapSetahun };
  return { rkap: 0, realisasi: 0, rkapSetahun };
};

/** Realisasi tahun sebelumnya untuk pembanding YoY pada kartu KPI */
export const hitungYoy = (yoy: YoyDataPoint[], f: PaparanFilter) => {
  let pu = 0, bk = 0, laba = 0;
  yoy.forEach(y => {
    if (y.bulanIndex < f.bulanDari || y.bulanIndex > f.bulanSampai) return;
    if (f.segmentasi && y.segmentasi !== f.segmentasi) return;
    pu += y.puReal2025; bk += y.bkReal2025; laba += y.labaReal2025;
  });
  return { pu, bk, laba, bkPu: pu > 0 ? (bk / pu) * 100 : 0 };
};

export { fShort, fNum, MONTH_LABELS };
