// Registry section paparan: metadata + fungsi render ke PowerPoint.
// Setiap render menerima "area" (kotak dalam inci) sehingga beberapa section
// bisa ditempatkan dalam satu slide dengan tata letak apa pun.
import {
  pctOf, fPct, fShort, fNum,
  type Kumulatif, type BarisProyek, type BarisMatrix, type UnitQshe,
} from './paparanData';

// ── Palet (hex tanpa #, format pptxgenjs) ──
export const NAVY = '1E293B';
export const NAVY_DARK = '0F172A';
export const BLUE = '3B82F6';
export const DARKBLUE = '1E3A8A';
export const SKY = '93C5FD';
export const SLATE = '64748B';
export const SLATE_LIGHT = '94A3B8';
export const BORDER = 'CBD5E1';
export const GREEN = '16A34A';
export const RED = 'DC2626';
export const AMBER = 'D97706';
export const PURPLE = '8B5CF6';
export const EMERALD = '10B981';
export const CARD_BG = 'F8FAFC';

export interface Area { x: number; y: number; w: number; h: number }

export interface Ctx {
  kum: Kumulatif;
  nkb: { rkap: number; realisasi: number; rkapSetahun: number };
  proyek: BarisProyek[];
  matrix: BarisMatrix[];
  tren: {
    bulanIndex: number[]; labels: string[];
    rkap: number[]; real: number[]; labaRkap: number[]; labaReal: number[];
    kumRkap: number[]; kumReal: number[]; kumLabaRkap: number[]; kumLabaReal: number[];
  };
  trenYoy: { pu: number[]; laba: number[] };
  provinsi: { nama: string; count: number; pu: number; bk: number; bkPu: number }[];
  analitik: {
    tahunLabels: string[]; tahunPu: number[]; tahunLaba: number[];
    intPu: number; eksPu: number; intN: number; eksN: number;
    topPk: { nama: string; pu: number; n: number }[];
  };
  qsheUnit: UnitQshe[];
  qsheTren: { labels: string[]; qshe: number[]; she: number[]; quality: number[] };
  yoy: { pu: number; bk: number; laba: number; bkPu: number };
  dbProyek: {
    no: number; idProject: string; nama: string; seg: string; pemberiKerja: string;
    nk: number; progress: number; pu: number; bk: number; bkPu: number;
    status: string; kota: string; intEks: string; piutang: number;
  }[];
  labelBulan: string;
  labelPeriode: string;
  tahun: number;
  CT: any;
}

// ── Pembantu gaya ──
const axisOpts = {
  catAxisLabelColor: SLATE, valAxisLabelColor: SLATE, catAxisLabelFontSize: 8, valAxisLabelFontSize: 8,
  valGridLine: { color: 'E2E8F0', style: 'solid', size: 0.5 }, catGridLine: { style: 'none' },
  legendFontSize: 8, chartColorsOpacity: 100,
};

/**
 * Sumbu & legenda yang menyesuaikan tinggi area. Pada kotak pendek, legenda
 * bawah memakan porsi besar sehingga grafiknya gepeng dan label sumbu bertindih —
 * di situ legenda dilepas dan huruf sumbu dikecilkan.
 */
const axisMuat = (a: Area, jumlahTitik = 0) => {
  const sempit = a.h < 1.45;
  const padat = jumlahTitik > 8;
  return {
    ...axisOpts,
    catAxisLabelFontSize: sempit || padat ? 6 : 8,
    valAxisLabelFontSize: sempit ? 6 : 8,
    catAxisLabelRotate: padat && a.w < 5 ? -45 : 0,
    showLegend: !sempit,
    legendPos: 'b',
    legendFontSize: a.h < 1.9 ? 6.5 : 8,
  };
};
const warnaCapai = (n: number, inverse = false) =>
  n === 0 ? SLATE : (inverse ? n <= 100 : n >= 100) ? GREEN : RED;

/** Opsi per section yang bisa diatur pengguna dari penyusun slide */
export interface SectionOpt {
  judul?: string;        // ganti judul section
  sembunyikanJudul?: boolean;
  kartu?: string[];      // khusus KPI & kartu QSHE: kunci kartu yang ditampilkan
  maksBaris?: number;    // khusus tabel: 0/undefined = sebanyak yang muat
  /** Lanjutkan sisa baris ke slide berikutnya sampai seluruh data tampil */
  semuaData?: boolean;
  /** Baris awal yang dirender — diisi mesin ekspor saat membuat slide lanjutan */
  offsetBaris?: number;
  /** Potret komponen web asli menjadi gambar agar slide identik dengan layar */
  potret?: boolean;
}

/** Judul kecil di atas sebuah section dalam slide gabungan */
const judulSection = (s: any, a: Area, teks: string, opt: SectionOpt) => {
  if (opt.sembunyikanJudul) return;
  s.addText(opt.judul?.trim() || teks, {
    x: a.x, y: a.y, w: a.w, h: 0.24, fontSize: 10.5, bold: true,
    color: NAVY_DARK, fontFace: 'Calibri',
  });
  s.addShape('rect', { x: a.x, y: a.y + 0.24, w: Math.min(0.55, a.w), h: 0.028, fill: { color: BLUE } });
};
/** Area isi setelah dikurangi judul section */
const isi = (a: Area, opt: SectionOpt): Area => opt.sembunyikanJudul
  ? a
  : { x: a.x, y: a.y + 0.34, w: a.w, h: a.h - 0.34 };

/** Daftar kartu KPI yang tersedia — dipakai UI & render */
export const KPI_ITEMS = [
  { key: 'nkb', label: 'Nilai Kontrak Baru' },
  { key: 'pu', label: 'Pendapatan Usaha' },
  { key: 'bkpu', label: 'BK/PU' },
  { key: 'laba', label: 'Laba Bruto' },
  { key: 'qshe', label: 'Kinerja QSHE' },
] as const;

export const QSHE_ITEMS = [
  { key: 'qshe', label: 'QSHE' },
  { key: 'she', label: 'SHE' },
  { key: 'quality', label: 'Quality' },
] as const;

const th = (t: string, align: 'left' | 'right' | 'center' = 'right', fs = 8.5) =>
  ({ text: t, options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, fontSize: fs, align } });
const td = (t: string, align: 'left' | 'right' | 'center' = 'right', opts: any = {}) =>
  ({ text: t, options: { fontSize: 8, align, color: '334155', ...opts } });

/**
 * Berapa baris data yang muat di sebuah area.
 * rowH pada pptxgenjs hanyalah tinggi MINIMUM — PowerPoint melebarkan baris
 * bila teks terlipat, jadi kapasitas dihitung dengan margin aman agar tabel
 * tidak tumbuh melewati area dan menabrak kotak catatan.
 */
const FAKTOR_AMAN = 1.18;
export const barisMuat = (a: Area, rowH: number) =>
  Math.max(1, Math.floor((a.h - rowH * FAKTOR_AMAN) / (rowH * FAKTOR_AMAN)));

/**
 * Tabel yang memangkas baris agar muat di area. Bila `opt.semuaData` aktif,
 * mesin ekspor memanggil ulang section ini dengan `offsetBaris` berikutnya
 * sehingga sisa baris berlanjut ke slide baru, bukan dibuang.
 */
const tabelMuat = (
  s: any, a: Area, header: any[], baris: any[][], colW: number[],
  rowH = 0.26, opt: SectionOpt = {},
) => {
  const muat = barisMuat(a, rowH);
  const batas = opt.maksBaris && opt.maksBaris > 0 ? Math.min(opt.maksBaris, muat) : muat;
  const mulai = opt.offsetBaris ?? 0;
  const tampil = baris.slice(mulai, mulai + batas);
  const skala = a.w / colW.reduce((x, y) => x + y, 0);
  s.addTable([header, ...tampil] as any, {
    x: a.x, y: a.y, w: a.w, colW: colW.map(w => w * skala), rowH,
    border: { pt: 0.5, color: BORDER }, fontFace: 'Calibri',
    autoPage: false, fill: { color: 'FFFFFF' },
    // Margin sel dipersempit agar lebar efektif kolom maksimal — pada tabel
    // berkolom banyak, margin bawaan cukup untuk memaksa teks terlipat
    margin: [1, 2, 1, 2], valign: 'middle',
  });
  const sisa = baris.length - (mulai + tampil.length);
  if (sisa > 0 && !opt.semuaData) {
    s.addText(`+${sisa} baris lainnya`, {
      x: a.x, y: a.y + (tampil.length + 1) * rowH + 0.02, w: a.w, h: 0.18,
      fontSize: 7, italic: true, color: SLATE_LIGHT, fontFace: 'Calibri', align: 'right',
    });
  }
};

export type SectionKey =
  | 'kpi' | 'kinerja' | 'tren-kum' | 'tren-bln' | 'top5' | 'matrix' | 'breakdown'
  | 'peta' | 'peta-tabel' | 'db-historis' | 'db-inteks' | 'db-pemberi' | 'db-tabel'
  | 'qshe-kartu' | 'qshe-tren' | 'qshe-unit' | 'qshe-unit-kartu'
  | 'eval-revenue' | 'eval-gpm' | 'yoy-revenue' | 'yoy-gpm';

/** Panel evaluasi bergaya papan ikhtisar: latar abu, ikon bulat, judul tengah */
const panelEvaluasi = (s: any, a: Area, judul: string, warnaIkon: string): Area => {
  s.addShape('roundRect', { x: a.x, y: a.y, w: a.w, h: a.h, rectRadius: 0.05, fill: { color: 'EEF2F6' } });
  const d = 0.4;
  s.addShape('ellipse', { x: a.x + 0.12, y: a.y + 0.1, w: d, h: d, fill: { color: warnaIkon } });
  s.addText(judul, {
    x: a.x + 0.12 + d, y: a.y + 0.1, w: a.w - 0.24 - d, h: 0.4,
    fontSize: a.w > 4 ? 13 : 10.5, bold: true, color: NAVY, align: 'center',
    valign: 'middle', fontFace: 'Calibri', charSpacing: 0.5,
  });
  return { x: a.x + 0.1, y: a.y + 0.56, w: a.w - 0.2, h: a.h - 0.66 };
};

// Label angka pada grafik hanya dipasang bila titiknya sedikit — pada 12 bulan
// angka-angka itu justru saling menimpa, jadi lebih baik dilepas dan dibaca
// dari sumbu. Ukuran huruf juga mengecil mengikuti kepadatan.
const labelAngka = (jumlahTitik: number, posisi: 'outEnd' | 't') =>
  jumlahTitik > 8 ? {} : {
    showValue: true,
    dataLabelFontSize: jumlahTitik > 6 ? 5.5 : 7,
    dataLabelColor: '1E293B',
    dataLabelFormatCode: '#,##0.0',
    dataLabelPosition: posisi,
  };

export interface SectionDef {
  key: SectionKey;
  label: string;
  grup: 'Dashboard Kinerja' | 'Kinerja QSHE' | 'Database All Proyek';
  /** Perkiraan tinggi minimum yang nyaman (inci) — dipakai untuk peringatan tata letak */
  minTinggi: number;
  /** Jenis opsi tambahan yang relevan untuk section ini */
  opsi: ('kartu-kpi' | 'kartu-qshe' | 'maks-baris')[];
  /** Section berbasis daftar: bisa dilanjutkan ke slide berikutnya */
  paginasi?: { total: (ctx: Ctx) => number; perHalaman: (a: Area) => number };
  render: (s: any, a: Area, ctx: Ctx, opt: SectionOpt) => void;
  /** Ringkasan otomatis untuk catatan slide */
  catatan: (ctx: Ctx) => string;
}

// ═══════════ Definisi tiap section ═══════════
export const SECTIONS: SectionDef[] = [
  {
    key: 'kpi', label: 'Kartu Ringkasan KPI', grup: 'Dashboard Kinerja', minTinggi: 2.3, opsi: ['kartu-kpi'],
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Ringkasan Kinerja', opt);
      const a = isi(area, opt);
      const k = ctx.kum;
      const semua: Record<string, {
        label: string; nilai: string; pct: number; inverse: boolean; qshe?: boolean;
        bar2?: { label: string; pct: number };
        rows: [string, string][];
        yoy?: { nilai: string; delta: number; baik: boolean };
      }> = {
        nkb: {
          label: 'NILAI KONTRAK BARU', nilai: fShort(ctx.nkb.realisasi),
          pct: pctOf(ctx.nkb.realisasi, ctx.nkb.rkap), inverse: false,
          bar2: { label: `Real / RKAP ${ctx.tahun}`, pct: pctOf(ctx.nkb.realisasi, ctx.nkb.rkapSetahun) },
          rows: [[`Target RKAP ${ctx.labelBulan}`, fShort(ctx.nkb.rkap)], [`Target RKAP ${ctx.tahun}`, fShort(ctx.nkb.rkapSetahun)]],
        },
        pu: {
          label: 'PENDAPATAN USAHA', nilai: fShort(k.puReal),
          pct: pctOf(k.puReal, k.puRkap), inverse: false,
          bar2: { label: `Real / RKAP ${ctx.tahun}`, pct: pctOf(k.puReal, k.puRkapTotal) },
          rows: [[`Target RKAP ${ctx.labelBulan}`, fShort(k.puRkap)], [`Target RKAP ${ctx.tahun}`, fShort(k.puRkapTotal)]],
          yoy: ctx.yoy.pu > 0 ? { nilai: fShort(ctx.yoy.pu), delta: ((k.puReal - ctx.yoy.pu) / ctx.yoy.pu) * 100, baik: k.puReal >= ctx.yoy.pu } : undefined,
        },
        bkpu: {
          label: 'BK/PU', nilai: fPct(k.bkPuRealPct),
          pct: pctOf(k.bkPuRealPct, k.bkPuRkapSd), inverse: true,
          bar2: { label: `Real / RKAP ${ctx.tahun}`, pct: pctOf(k.bkPuRealPct, k.bkPuRkapAll) },
          rows: [[`Target RKAP ${ctx.labelBulan}`, fPct(k.bkPuRkapSd)], [`Target RKAP ${ctx.tahun}`, fPct(k.bkPuRkapAll)]],
          yoy: ctx.yoy.bkPu > 0 ? { nilai: fPct(ctx.yoy.bkPu), delta: ((k.bkPuRealPct - ctx.yoy.bkPu) / ctx.yoy.bkPu) * 100, baik: k.bkPuRealPct <= ctx.yoy.bkPu } : undefined,
        },
        laba: {
          label: 'LABA BRUTO', nilai: fShort(k.labaReal),
          pct: pctOf(k.labaReal, k.labaRkap), inverse: false,
          bar2: { label: `Real / RKAP ${ctx.tahun}`, pct: pctOf(k.labaReal, k.labaRkapTotal) },
          rows: [[`Target RKAP ${ctx.labelBulan}`, fShort(k.labaRkap)], [`Target RKAP ${ctx.tahun}`, fShort(k.labaRkapTotal)]],
          yoy: ctx.yoy.laba !== 0 ? { nilai: fShort(ctx.yoy.laba), delta: ((k.labaReal - ctx.yoy.laba) / Math.abs(ctx.yoy.laba)) * 100, baik: k.labaReal >= ctx.yoy.laba } : undefined,
        },
        qshe: {
          label: 'KINERJA QSHE', nilai: k.qsheRataRata > 0 ? k.qsheRataRata.toFixed(1) : '—',
          pct: k.qsheTarget > 0 ? pctOf(k.qsheRataRata, k.qsheTarget) : k.qsheRataRata,
          inverse: false, qshe: true,
          rows: [[`Target RKAP ${ctx.tahun}`, k.qsheTarget > 0 ? k.qsheTarget.toFixed(1) : '—'], ['Penilaian', `${fNum(k.qsheProyekCount)}x`]],
        },
      };
      const dipilih = (opt.kartu?.length ? opt.kartu : KPI_ITEMS.map(kk => kk.key)) as string[];
      const kartu = dipilih.map(kk => semua[kk]).filter(Boolean);
      if (kartu.length === 0) return;

      // Kalau area terlalu sempit untuk sederet kartu, susun jadi beberapa baris
      const gap = 0.09;
      const perBaris = Math.max(1, Math.min(kartu.length, Math.floor((a.w + gap) / (1.05 + gap))));
      const jmlBaris = Math.ceil(kartu.length / perBaris);
      const w = (a.w - gap * (perBaris - 1)) / perBaris;
      // Isi kartu (judul, nilai, 2 bar, 2 chip, YoY) menghabiskan ±2,3" —
      // dibatasi agar kartu tidak meregang tinggi dengan ruang kosong di bawah
      const h = Math.min((a.h - gap * (jmlBaris - 1)) / jmlBaris, 2.45);
      const kecil = w < 1.35;

      // Kartu diletakkan di tengah area bila tingginya dibatasi
      const sisaTinggi = a.h - (h * jmlBaris + gap * (jmlBaris - 1));
      const yAwal = a.y + Math.max(0, sisaTinggi / 2);
      kartu.forEach((kk, i) => {
        const kol = i % perBaris, brs = Math.floor(i / perBaris);
        const x = a.x + kol * (w + gap);
        const y = yAwal + brs * (h + gap);
        const warna = kk.qshe
          ? (ctx.kum.qsheTarget > 0 ? (ctx.kum.qsheRataRata >= ctx.kum.qsheTarget ? EMERALD : RED) : SLATE)
          : warnaCapai(kk.pct, kk.inverse);
        const pad = kecil ? 0.06 : 0.09;
        const dalam = w - pad * 2;

        s.addShape('roundRect', { x, y, w, h, rectRadius: 0.06, fill: { color: 'FFFFFF' }, line: { color: BORDER, width: 0.75 } });
        s.addShape('rect', { x, y, w, h: 0.06, fill: { color: warna } });

        // Judul + nilai besar
        s.addText(kk.label, { x: x + pad, y: y + 0.11, w: dalam, h: 0.2, fontSize: kecil ? 5.8 : 6.8, bold: true, color: SLATE, fontFace: 'Calibri', charSpacing: 0.4 });
        s.addText(kk.nilai, { x: x + pad, y: y + 0.3, w: dalam, h: 0.38, fontSize: kecil ? 12 : 15, bold: true, color: NAVY_DARK, fontFace: 'Calibri' });

        // Dua bar pencapaian bergaya dashboard
        let cur = y + 0.72;
        const bar = (label: string, pct: number, col: string) => {
          if (cur + 0.26 > y + h - 0.06) return;
          s.addText(label, { x: x + pad, y: cur, w: dalam - 0.42, h: 0.16, fontSize: 5.6, color: SLATE, fontFace: 'Calibri' });
          s.addText(fPct(pct), { x: x + pad + dalam - 0.44, y: cur, w: 0.44, h: 0.16, fontSize: 5.9, bold: true, color: col, align: 'right', fontFace: 'Calibri' });
          s.addShape('roundRect', { x: x + pad, y: cur + 0.16, w: dalam, h: 0.055, rectRadius: 0.027, fill: { color: 'E2E8F0' } });
          if (pct > 0) s.addShape('roundRect', { x: x + pad, y: cur + 0.16, w: Math.max(0.05, dalam * Math.min(pct, 100) / 100), h: 0.055, rectRadius: 0.027, fill: { color: col } });
          cur += 0.3;
        };
        bar(kk.qshe ? 'Pencapaian' : `Real / RKAP ${ctx.labelBulan}`, kk.pct, warna);
        if (kk.bar2) bar(kk.bar2.label, kk.bar2.pct, BLUE);

        // Baris target bergaya chip
        kk.rows.forEach(([rk, rv]) => {
          if (cur + 0.28 > y + h - 0.04) return;
          s.addShape('roundRect', { x: x + pad, y: cur, w: dalam, h: 0.26, rectRadius: 0.04, fill: { color: 'F1F5F9' } });
          s.addText(rk, { x: x + pad + 0.05, y: cur + 0.02, w: dalam - 0.1, h: 0.11, fontSize: 5.2, color: SLATE, fontFace: 'Calibri' });
          s.addText(rv, { x: x + pad + 0.05, y: cur + 0.12, w: dalam - 0.1, h: 0.13, fontSize: 7, bold: true, color: NAVY_DARK, fontFace: 'Calibri' });
          cur += 0.3;
        });

        // Pembanding YoY
        if (kk.yoy && cur + 0.18 <= y + h - 0.02) {
          const warnaYoy = kk.yoy.baik ? GREEN : RED;
          s.addText(`YoY ${ctx.tahun - 1}`, { x: x + pad, y: cur, w: dalam * 0.42, h: 0.16, fontSize: 5.4, color: SLATE, fontFace: 'Calibri' });
          s.addText(`${kk.yoy.nilai}  ${kk.yoy.baik ? '▲' : '▼'} ${Math.abs(kk.yoy.delta).toFixed(1)}%`, {
            x: x + pad + dalam * 0.42, y: cur, w: dalam * 0.58, h: 0.16,
            fontSize: 5.6, bold: true, color: warnaYoy, align: 'right', fontFace: 'Calibri',
          });
        }
      });
    },
    catatan: ctx => `Realisasi PU ${fShort(ctx.kum.puReal)} (${fPct(pctOf(ctx.kum.puReal, ctx.kum.puRkap))} dari RKAP ${ctx.labelPeriode}), BK/PU ${fPct(ctx.kum.bkPuRealPct)} terhadap target ${fPct(ctx.kum.bkPuRkapSd)}, laba bruto ${fShort(ctx.kum.labaReal)}.`,
  },
  {
    key: 'kinerja', label: 'Tabel Kinerja RKAP vs Realisasi', grup: 'Dashboard Kinerja', minTinggi: 1.3, opsi: ['maks-baris'],
    render: (s, area, ctx, opt) => {
      judulSection(s, area, `Kinerja ${ctx.labelPeriode}`, opt);
      const a = isi(area, opt);
      const k = ctx.kum;
      const baris = [
        { u: 'PU', rkap: fShort(k.puRkap), real: fShort(k.puReal), capai: pctOf(k.puReal, k.puRkap), setahun: fShort(k.puRkapTotal), inv: false },
        { u: 'BK', rkap: fShort(k.bkRkap), real: fShort(k.bkReal), capai: pctOf(k.bkReal, k.bkRkap), setahun: fShort(k.bkRkapTotal), inv: false },
        { u: 'BK/PU', rkap: fPct(k.bkPuRkapSd), real: fPct(k.bkPuRealPct), capai: pctOf(k.bkPuRealPct, k.bkPuRkapSd), setahun: fPct(k.bkPuRkapAll), inv: true },
        { u: 'Laba Bruto', rkap: fShort(k.labaRkap), real: fShort(k.labaReal), capai: pctOf(k.labaReal, k.labaRkap), setahun: fShort(k.labaRkapTotal), inv: false },
      ];
      tabelMuat(s, a,
        [th('Uraian', 'left'), th('RKAP'), th('Realisasi'), th('%'), th(`RKAP ${ctx.tahun}`)],
        baris.map(r => [
          td(r.u, 'left', { bold: true }), td(r.rkap), td(r.real, 'right', { bold: true }),
          td(fPct(r.capai), 'right', { bold: true, color: warnaCapai(r.capai, r.inv) }), td(r.setahun, 'right', { color: SLATE }),
        ]),
        [1.5, 1.2, 1.2, 0.8, 1.2], Math.min(0.42, (a.h - 0.1) / 5), opt);
    },
    catatan: ctx => `Pencapaian PU ${fPct(pctOf(ctx.kum.puReal, ctx.kum.puRkap))} terhadap RKAP ${ctx.labelPeriode}; sisa target ${ctx.tahun} sebesar ${fShort(ctx.kum.puRkapTotal - ctx.kum.puReal)}.`,
  },
  {
    key: 'tren-kum', label: 'Grafik Tren Kumulatif', grup: 'Dashboard Kinerja', minTinggi: 1.8, opsi: [],
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Tren Kinerja Kumulatif', opt);
      const a = isi(area, opt);
      if (ctx.tren.labels.length === 0) return;
      s.addChart([
        { type: ctx.CT.line, data: [{ name: 'RKAP', labels: ctx.tren.labels, values: ctx.tren.kumRkap }], options: { chartColors: [SLATE_LIGHT], lineSize: 1.5, lineSmooth: true, lineDash: 'dash', lineDataSymbol: 'none' } },
        { type: ctx.CT.line, data: [{ name: 'Realisasi', labels: ctx.tren.labels, values: ctx.tren.kumReal }], options: { chartColors: [DARKBLUE], lineSize: 2.5, lineSmooth: true, lineDataSymbol: 'circle', lineDataSymbolSize: 5 } },
      ] as any, { ...a, ...axisMuat(a, ctx.tren.labels.length) });
    },
    catatan: ctx => `Tren kumulatif PU ${ctx.labelPeriode} dalam miliar rupiah; garis putus abu adalah RKAP.`,
  },
  {
    key: 'tren-bln', label: 'Grafik Tren Bulanan', grup: 'Dashboard Kinerja', minTinggi: 1.8, opsi: [],
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Tren Kinerja Bulanan', opt);
      const a = isi(area, opt);
      if (ctx.tren.labels.length === 0) return;
      s.addChart([
        { type: ctx.CT.line, data: [{ name: 'RKAP', labels: ctx.tren.labels, values: ctx.tren.rkap }], options: { chartColors: [SLATE_LIGHT], lineSize: 1.5, lineSmooth: true, lineDash: 'dash', lineDataSymbol: 'none' } },
        { type: ctx.CT.line, data: [{ name: 'Realisasi', labels: ctx.tren.labels, values: ctx.tren.real }], options: { chartColors: [DARKBLUE], lineSize: 2.5, lineSmooth: true, lineDataSymbol: 'circle', lineDataSymbolSize: 5 } },
      ] as any, { ...a, ...axisMuat(a, ctx.tren.labels.length) });
    },
    catatan: () => 'Realisasi PU per bulan dibanding RKAP bulan tersebut (miliar rupiah).',
  },
  {
    key: 'top5', label: 'Top 5 PU Tidak Tercapai', grup: 'Dashboard Kinerja', minTinggi: 1.3, opsi: ['maks-baris'],
    paginasi: { total: c => c.proyek.filter(p => p.deviasiPu < 0).length, perHalaman: a => barisMuat({ ...a, h: a.h - 0.34 }, 0.34) },
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Top 5 PU Tidak Tercapai', opt);
      const a = isi(area, opt);
      const top = [...ctx.proyek].filter(p => p.deviasiPu < 0).sort((x, y) => x.deviasiPu - y.deviasiPu).slice(0, 5);
      if (top.length === 0) {
        s.addText('Tidak ada deviasi PU negatif pada periode ini.', { x: a.x, y: a.y + 0.2, w: a.w, h: 0.4, fontSize: 11, color: GREEN, fontFace: 'Calibri' });
        return;
      }
      tabelMuat(s, a,
        [th('Proyek', 'left'), th('RKAP'), th('Realisasi'), th('Deviasi')],
        top.map(r => [
          td(r.nama, 'left'), td(fShort(r.puRkap)), td(fShort(r.puReal)),
          td(fShort(r.deviasiPu), 'right', { bold: true, color: RED }),
        ]),
        [3.0, 1.1, 1.1, 1.1], Math.min(0.34, (a.h - 0.05) / 6), opt);
    },
    catatan: ctx => {
      const top = [...ctx.proyek].filter(p => p.deviasiPu < 0).sort((x, y) => x.deviasiPu - y.deviasiPu)[0];
      return top ? `Deviasi PU terdalam pada ${top.nama} sebesar ${fShort(top.deviasiPu)}.` : 'Seluruh proyek mencapai target PU.';
    },
  },
  {
    key: 'matrix', label: 'Performance Detail Matrix', grup: 'Dashboard Kinerja', minTinggi: 2.0, opsi: ['maks-baris'],
    paginasi: { total: c => c.matrix.length, perHalaman: a => barisMuat({ ...a, h: a.h - 0.34 }, 0.38) },
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Project Performance Detail Matrix', opt);
      const a = isi(area, opt);
      const mulai = opt.offsetBaris ?? 0;
      // Seluruh kolom seperti di layar: nilai utama + rincian kecil di bawahnya
      tabelMuat(s, a,
        [
          th('No', 'center', 6.5), th('Nama Proyek', 'left', 6.5), th('Progress', 'center', 6.5), th('BK/PU', 'center', 6.5),
          th('Stok (90/180)', 'center', 6), th('BKD', 'center', 6.5), th('WIP BK', 'center', 6.5),
          th('Tagihan (90/180)', 'center', 6), th('Status', 'center', 6.5),
        ],
        ctx.matrix.map((r, i) => [
          td(String(mulai + i + 1), 'center', { fontSize: 6.5, color: SLATE }),
          { text: [
            { text: r.nama.length > 24 ? r.nama.slice(0, 24) + '…' : r.nama, options: { fontSize: 6.4, bold: true, color: '0F172A', breakLine: true } },
            { text: r.segmentasi || '-', options: { fontSize: 5.4, color: SLATE_LIGHT } },
          ], options: { align: 'left' } },
          { text: [
            { text: `${r.deviasiProgress >= 0 ? '+' : ''}${r.deviasiProgress.toFixed(2)}%`, options: { fontSize: 7.2, bold: true, color: r.deviasiProgress < 0 ? RED : GREEN, breakLine: true } },
            { text: `Ra ${r.progressRa.toFixed(0)}% · Ri ${r.progressRi.toFixed(0)}%`, options: { fontSize: 5, color: SLATE_LIGHT } },
          ], options: { align: 'center' } },
          { text: [
            { text: `${r.deviasiBkPu > 0 ? '+' : ''}${r.deviasiBkPu.toFixed(2)}%`, options: { fontSize: 7.2, bold: true, color: r.deviasiBkPu > 0 ? RED : GREEN, breakLine: true } },
            { text: `App ${r.bkPuApp.toFixed(0)}% · Rl ${r.bkPuReal.toFixed(0)}%`, options: { fontSize: 5, color: SLATE_LIGHT } },
          ], options: { align: 'center' } },
          { text: [
            { text: r.stok !== 0 ? fShort(r.stok) : '–', options: { fontSize: 7, bold: true, color: '0F172A', breakLine: true } },
            { text: `${r.stok90 !== 0 ? fShort(r.stok90) : '0'} / ${r.stok180 !== 0 ? fShort(r.stok180) : '0'}`, options: { fontSize: 4.8, color: SLATE_LIGHT } },
          ], options: { align: 'center' } },
          td(r.bkd !== 0 ? fShort(r.bkd) : '–', 'center', { fontSize: 7, bold: true, color: '0F172A' }),
          td(r.wip !== 0 ? fShort(r.wip) : '–', 'center', { fontSize: 7, bold: true, color: '0F172A' }),
          { text: [
            { text: r.tagihan !== 0 ? fShort(r.tagihan) : '–', options: { fontSize: 7, bold: true, color: '0F172A', breakLine: true } },
            { text: `${r.tagihan90 !== 0 ? fShort(r.tagihan90) : '0'} / ${r.tagihan180 !== 0 ? fShort(r.tagihan180) : '0'}`, options: { fontSize: 4.8, color: SLATE_LIGHT } },
          ], options: { align: 'center' } },
          td(r.status === 'Extra Attention' ? 'EXTRA ATT.' : r.status, 'center', {
            fontSize: 5.8, bold: true,
            color: r.status === 'Extra Attention' ? RED : r.status === 'Attention' ? AMBER : GREEN,
          }),
        ]),
        [0.28, 1.85, 1.12, 1.18, 1.0, 0.72, 0.72, 1.0, 0.75], 0.38, opt);
    },
    catatan: ctx => {
      const extra = ctx.matrix.filter(m => m.status === 'Extra Attention').length;
      const att = ctx.matrix.filter(m => m.status === 'Attention').length;
      return `${extra} proyek berstatus Extra Attention dan ${att} Attention dari ${ctx.matrix.length} proyek dinilai.`;
    },
  },
  {
    key: 'breakdown', label: 'Breakdown per Proyek', grup: 'Dashboard Kinerja', minTinggi: 1.5, opsi: ['maks-baris'],
    paginasi: { total: c => c.proyek.length, perHalaman: a => barisMuat({ ...a, h: a.h - 0.34 }, 0.24) },
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Breakdown per Proyek', opt);
      const a = isi(area, opt);
      const rows = [...ctx.proyek].sort((x, y) => y.puReal - x.puReal);
      tabelMuat(s, a,
        [th('Proyek', 'left'), th('RKAP'), th('PU'), th('BK/PU'), th('Laba Bruto')],
        rows.map(r => [
          td(r.nama, 'left', { fontSize: 7.5 }),
          td(fShort(r.puRkap), 'right', { fontSize: 7.5 }),
          td(fShort(r.puReal), 'right', { fontSize: 7.5, bold: true, color: r.puReal < r.puRkap ? RED : GREEN }),
          td(r.bkPu > 0 ? `${r.bkPu.toFixed(1)}%` : '—', 'right', { fontSize: 7.5 }),
          td(fShort(r.labaReal), 'right', { fontSize: 7.5, bold: true, color: r.labaReal < 0 ? RED : GREEN }),
        ]),
        [2.7, 1.0, 1.0, 0.8, 1.0], 0.24, opt);
    },
    catatan: ctx => `Dari ${fNum(ctx.proyek.length)} baris, ${fNum(ctx.proyek.filter(r => r.puReal < r.puRkap).length)} realisasi PU-nya masih di bawah RKAP.`,
  },
  {
    key: 'peta', label: 'Grafik Persebaran per Provinsi', grup: 'Database All Proyek', minTinggi: 1.6, opsi: [],
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Persebaran Proyek per Provinsi', opt);
      const a = isi(area, opt);
      const top = ctx.provinsi.slice(0, 8);
      if (top.length === 0) return;
      s.addChart(ctx.CT.bar, [
        { name: 'PU', labels: top.map(p => p.nama), values: top.map(p => Number((p.pu / 1e9).toFixed(2))) },
      ], { ...a, barDir: 'bar', chartColors: [BLUE], ...axisMuat(a), showLegend: false });
    },
    catatan: ctx => ctx.provinsi[0]
      ? `Kontribusi PU terbesar dari ${ctx.provinsi[0].nama} (${fShort(ctx.provinsi[0].pu)}, ${ctx.provinsi[0].count} proyek).`
      : 'Belum ada data provinsi.',
  },
  {
    key: 'peta-tabel', label: 'Tabel Persebaran per Provinsi', grup: 'Database All Proyek', minTinggi: 1.5, opsi: ['maks-baris'],
    paginasi: { total: c => c.provinsi.length, perHalaman: a => barisMuat({ ...a, h: a.h - 0.34 }, 0.26) },
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Persebaran Proyek per Provinsi', opt);
      const a = isi(area, opt);
      tabelMuat(s, a,
        [th('Provinsi', 'left'), th('Proyek'), th('Total PU'), th('Total BK'), th('BK/PU')],
        ctx.provinsi.map(p => [
          td(p.nama, 'left', { fontSize: 7.5 }),
          td(String(p.count), 'right', { fontSize: 7.5 }),
          td(fShort(p.pu), 'right', { fontSize: 7.5, bold: true }),
          td(fShort(p.bk), 'right', { fontSize: 7.5 }),
          td(fPct(p.bkPu), 'right', { fontSize: 7.5, bold: true, color: p.bkPu === 0 ? SLATE : p.bkPu <= 100 ? GREEN : RED }),
        ]),
        [2.4, 0.8, 1.2, 1.2, 0.9], 0.26, opt);
    },
    catatan: ctx => `Rekap ${fNum(ctx.provinsi.length)} provinsi dengan total PU ${fShort(ctx.provinsi.reduce((s, p) => s + p.pu, 0))}.`,
  },
  {
    key: 'db-historis', label: 'Kinerja Historis Tahunan', grup: 'Database All Proyek', minTinggi: 1.7, opsi: [],
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Kinerja Historis Tahunan', opt);
      const a = isi(area, opt);
      if (ctx.analitik.tahunLabels.length === 0) return;
      s.addChart([
        { type: ctx.CT.bar, data: [{ name: 'Pendapatan Usaha', labels: ctx.analitik.tahunLabels, values: ctx.analitik.tahunPu }], options: { chartColors: [BLUE], barGapWidthPct: 60 } },
        { type: ctx.CT.line, data: [{ name: 'Laba Bruto', labels: ctx.analitik.tahunLabels, values: ctx.analitik.tahunLaba }], options: { chartColors: [EMERALD], lineSize: 2.5, lineSmooth: true, lineDataSymbol: 'circle', lineDataSymbolSize: 5 } },
      ] as any, { ...a, ...axisMuat(a, ctx.tren.labels.length) });
    },
    catatan: () => 'PU dan laba bruto per tahun dari seluruh database proyek (miliar rupiah).',
  },
  {
    key: 'db-inteks', label: 'Internal vs Eksternal', grup: 'Database All Proyek', minTinggi: 1.6, opsi: [],
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Internal vs Eksternal', opt);
      const a = isi(area, opt);
      const { intPu, eksPu, intN, eksN } = ctx.analitik;
      if (intPu + eksPu <= 0) return;
      s.addChart(ctx.CT.doughnut, [
        { name: 'PU', labels: [`Internal (${intN})`, `Eksternal (${eksN})`], values: [Number((intPu / 1e9).toFixed(2)), Number((eksPu / 1e9).toFixed(2))] },
      ], {
        ...a, chartColors: [BLUE, EMERALD], holeSize: 58,
        showLegend: a.h > 1.3, legendPos: 'b', legendFontSize: a.h < 1.9 ? 6.5 : 8,
        showPercent: true, dataLabelFontSize: 8, dataLabelColor: 'FFFFFF',
      });
    },
    catatan: ctx => `Porsi PU internal ${fPct(pctOf(ctx.analitik.intPu, ctx.analitik.intPu + ctx.analitik.eksPu))} dari total nilai PU database.`,
  },
  {
    key: 'db-pemberi', label: 'Top Pemberi Kerja', grup: 'Database All Proyek', minTinggi: 1.3, opsi: ['maks-baris'],
    paginasi: { total: c => c.analitik.topPk.length, perHalaman: a => barisMuat({ ...a, h: a.h - 0.34 }, 0.26) },
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Top Pemberi Kerja', opt);
      const a = isi(area, opt);
      tabelMuat(s, a,
        [th('Pemberi Kerja', 'left'), th('Proyek'), th('Total PU')],
        ctx.analitik.topPk.map(p => [
          td(p.nama.length > 34 ? p.nama.slice(0, 34) + '…' : p.nama, 'left', { fontSize: 7.5 }),
          td(String(p.n), 'right', { fontSize: 7.5 }),
          td(fShort(p.pu), 'right', { fontSize: 7.5, bold: true }),
        ]),
        [3.0, 0.8, 1.2], 0.26, opt);
    },
    catatan: ctx => ctx.analitik.topPk[0]
      ? `Pemberi kerja terbesar ${ctx.analitik.topPk[0].nama} dengan total PU ${fShort(ctx.analitik.topPk[0].pu)}.`
      : 'Belum ada data pemberi kerja.',
  },
  {
    key: 'db-tabel', label: 'Tabel Database All Proyek (14 kolom)', grup: 'Database All Proyek', minTinggi: 2.0, opsi: ['maks-baris'],
    paginasi: { total: c => c.dbProyek.length, perHalaman: a => barisMuat({ ...a, h: a.h - 0.34 }, 0.22) },
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Database All Proyek', opt);
      const a = isi(area, opt);
      // Seluruh kolom sheet "all proyek" seperti pada menu Database All Proyek
      tabelMuat(s, a,
        // Header disingkat: pada kolom selebar 0,3–0,7" judul panjang pasti
        // terlipat dua baris dan membuat seluruh tabel tumbuh ke bawah
        [
          th('No', 'center', 5.5), th('PC', 'center', 5.5), th('Nama Proyek', 'left', 5.5),
          th('Segmen', 'left', 5.5), th('Pemberi Kerja', 'left', 5.5), th('NK', 'right', 5.5),
          th('Prog', 'right', 5.5), th('PU', 'right', 5.5), th('BK', 'right', 5.5), th('BK/PU', 'right', 5.5),
          th('Status', 'center', 5.5), th('Kota', 'left', 5.5), th('I/E', 'center', 5.5), th('Piutang', 'right', 5.5),
        ],
        ctx.dbProyek.map(p => [
          td(String(p.no), 'center', { fontSize: 5.6, color: SLATE }),
          td(p.idProject, 'center', { fontSize: 5.6, color: SLATE }),
          td(p.nama.length > 26 ? p.nama.slice(0, 26) + '…' : p.nama, 'left', { fontSize: 5.6, bold: true, color: '0F172A' }),
          td(p.seg.length > 10 ? p.seg.slice(0, 10) + '…' : p.seg, 'left', { fontSize: 5.4 }),
          td(p.pemberiKerja.length > 18 ? p.pemberiKerja.slice(0, 18) + '…' : p.pemberiKerja, 'left', { fontSize: 5.4 }),
          td(fShort(p.nk), 'right', { fontSize: 5.8 }),
          td(`${p.progress.toFixed(0)}%`, 'right', { fontSize: 5.8, bold: true, color: p.progress >= 100 ? GREEN : p.progress >= 50 ? BLUE : AMBER }),
          td(fShort(p.pu), 'right', { fontSize: 5.8, bold: true, color: '0F172A' }),
          td(fShort(p.bk), 'right', { fontSize: 5.8 }),
          td(p.bkPu > 0 ? `${p.bkPu.toFixed(1)}%` : '—', 'right', { fontSize: 5.8, bold: true, color: p.bkPu === 0 ? SLATE : p.bkPu <= 100 ? GREEN : RED }),
          td(p.status.length > 9 ? p.status.slice(0, 9) + '…' : p.status, 'center', { fontSize: 5.2, bold: true, color: /selesai/i.test(p.status) ? GREEN : /annual/i.test(p.status) ? AMBER : SLATE }),
          td(p.kota.length > 8 ? p.kota.slice(0, 8) + '…' : p.kota, 'left', { fontSize: 5.4 }),
          td(/internal/i.test(p.intEks) ? 'Int' : /eksternal|external/i.test(p.intEks) ? 'Eks' : '–', 'center', { fontSize: 5.4, bold: true, color: /internal/i.test(p.intEks) ? BLUE : EMERALD }),
          td(p.piutang !== 0 ? fShort(p.piutang) : '–', 'right', { fontSize: 5.6 }),
        ]),
        [0.26, 0.52, 1.62, 0.62, 1.18, 0.66, 0.42, 0.66, 0.66, 0.5, 0.72, 0.52, 0.32, 0.62], 0.22, opt);
    },
    catatan: ctx => `Database berisi ${fNum(ctx.dbProyek.length)} proyek dengan total PU ${fShort(ctx.dbProyek.reduce((s, p) => s + p.pu, 0))}.`,
  },
  {
    key: 'qshe-kartu', label: 'Ikhtisar Skor QSHE (gauge)', grup: 'Kinerja QSHE', minTinggi: 1.6, opsi: ['kartu-qshe'],
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Kinerja QSHE', opt);
      const a = isi(area, opt);
      const k = ctx.kum;
      const target = k.qsheTarget;
      const warnaSkor = (v: number) => v <= 0 ? SLATE
        : target > 0 ? (v >= target ? EMERALD : RED) : (v >= 85 ? EMERALD : v >= 70 ? AMBER : RED);

      const dipilih = opt.kartu?.length ? opt.kartu : QSHE_ITEMS.map(kk => kk.key);
      const pakaiGauge = dipilih.includes('qshe');
      const bar = (['she', 'quality'] as const)
        .filter(kk => dipilih.includes(kk))
        .map(kk => kk === 'she'
          ? { label: 'KINERJA SHE', val: k.sheRataRata }
          : { label: 'KINERJA QUALITY', val: k.qualityRataRata });

      s.addShape('roundRect', { x: a.x, y: a.y, w: a.w, h: a.h, rectRadius: 0.06, fill: { color: 'FFFFFF' }, line: { color: BORDER, width: 0.75 } });

      // Gauge donat: porsi tercapai vs sisa, angka besar di tengah
      const sisiGauge = Math.min(a.h - 0.2, a.w * 0.42, 1.75);
      const gx = a.x + 0.12, gy = a.y + (a.h - sisiGauge) / 2;
      if (pakaiGauge && sisiGauge > 0.6) {
        const skor = Math.max(0, Math.min(k.qsheRataRata, 100));
        s.addChart(ctx.CT.doughnut, [
          { name: 'QSHE', labels: ['Tercapai', 'Sisa'], values: [Number(skor.toFixed(1)), Number((100 - skor).toFixed(1))] },
        ], {
          x: gx, y: gy, w: sisiGauge, h: sisiGauge,
          chartColors: [warnaSkor(k.qsheRataRata), 'E2E8F0'], holeSize: 72,
          showLegend: false, showValue: false, showPercent: false,
          dataBorder: { pt: 0, color: 'FFFFFF' },
        });
        s.addText(k.qsheRataRata > 0 ? k.qsheRataRata.toFixed(1) : '—', {
          x: gx, y: gy + sisiGauge / 2 - 0.26, w: sisiGauge, h: 0.34,
          fontSize: sisiGauge > 1.3 ? 20 : 15, bold: true, color: warnaSkor(k.qsheRataRata),
          align: 'center', fontFace: 'Calibri',
        });
        s.addText(target > 0 && k.qsheRataRata >= target ? 'Capai Target' : 'Di Bawah Target', {
          x: gx, y: gy + sisiGauge / 2 + 0.06, w: sisiGauge, h: 0.2,
          fontSize: 6.5, color: SLATE, align: 'center', fontFace: 'Calibri',
        });
      }

      // Bar SHE & Quality di sebelah gauge
      const bx = pakaiGauge ? gx + sisiGauge + 0.16 : a.x + 0.14;
      const bw = a.x + a.w - 0.14 - bx;
      if (bar.length > 0 && bw > 0.8) {
        const tinggiBlok = 0.5;
        let by = a.y + (a.h - (bar.length * tinggiBlok + 0.34)) / 2;
        bar.forEach(b => {
          const col = warnaSkor(b.val);
          s.addText(b.label, { x: bx, y: by, w: bw - 0.6, h: 0.2, fontSize: 7.5, bold: true, color: SLATE, fontFace: 'Calibri', charSpacing: 0.3 });
          s.addText(b.val > 0 ? b.val.toFixed(1) : '—', { x: bx + bw - 0.6, y: by - 0.03, w: 0.6, h: 0.26, fontSize: 13, bold: true, color: col, align: 'right', fontFace: 'Calibri' });
          s.addShape('roundRect', { x: bx, y: by + 0.24, w: bw, h: 0.085, rectRadius: 0.042, fill: { color: 'E2E8F0' } });
          if (b.val > 0) s.addShape('roundRect', { x: bx, y: by + 0.24, w: Math.max(0.08, bw * Math.min(b.val, 100) / 100), h: 0.085, rectRadius: 0.042, fill: { color: col } });
          by += tinggiBlok;
        });
        s.addText(
          `Target RKAP: ${target > 0 ? target.toFixed(1) : '—'}  ·  Penilaian terakhir: ${ctx.labelBulan}  ·  ${fNum(ctx.qsheUnit.length)} unit`,
          { x: bx, y: by + 0.02, w: bw, h: 0.2, fontSize: 6.8, color: SLATE_LIGHT, fontFace: 'Calibri' });
      }
    },
    catatan: ctx => ctx.kum.qsheTarget > 0
      ? `Rata-rata QSHE ${ctx.kum.qsheRataRata.toFixed(1)} terhadap target ${ctx.kum.qsheTarget.toFixed(1)}.`
      : `Rata-rata QSHE ${ctx.kum.qsheRataRata > 0 ? ctx.kum.qsheRataRata.toFixed(1) : '—'} dari ${ctx.qsheUnit.length} unit ternilai.`,
  },
  {
    key: 'qshe-tren', label: 'Grafik Tren QSHE', grup: 'Kinerja QSHE', minTinggi: 1.7, opsi: [],
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Tren Skor QSHE', opt);
      const a = isi(area, opt);
      if (ctx.qsheTren.labels.length < 2) return;
      s.addChart([
        { type: ctx.CT.line, data: [{ name: 'QSHE', labels: ctx.qsheTren.labels, values: ctx.qsheTren.qshe }], options: { chartColors: [PURPLE], lineSize: 2.5, lineSmooth: true, lineDataSymbol: 'circle', lineDataSymbolSize: 5 } },
        { type: ctx.CT.line, data: [{ name: 'SHE', labels: ctx.qsheTren.labels, values: ctx.qsheTren.she }], options: { chartColors: [AMBER], lineSize: 1.75, lineSmooth: true, lineDash: 'dash', lineDataSymbol: 'none' } },
        { type: ctx.CT.line, data: [{ name: 'Quality', labels: ctx.qsheTren.labels, values: ctx.qsheTren.quality }], options: { chartColors: [BLUE], lineSize: 1.75, lineSmooth: true, lineDash: 'dash', lineDataSymbol: 'none' } },
      ] as any, { ...a, ...axisMuat(a, ctx.tren.labels.length) });
    },
    catatan: () => 'Rata-rata skor QSHE, SHE, dan Quality per bulan pada rentang terpilih.',
  },
  {
    key: 'qshe-unit', label: 'Tabel Unit QSHE', grup: 'Kinerja QSHE', minTinggi: 1.4, opsi: ['maks-baris'],
    paginasi: { total: c => c.qsheUnit.length, perHalaman: a => barisMuat({ ...a, h: a.h - 0.34 }, 0.24) },
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Kinerja QSHE per Unit', opt);
      const a = isi(area, opt);
      tabelMuat(s, a,
        [th('Unit / Proyek', 'left'), th('SHE'), th('Quality'), th('QSHE')],
        ctx.qsheUnit.map(u => {
          const col = ctx.kum.qsheTarget > 0 ? (u.qshe >= ctx.kum.qsheTarget ? GREEN : RED) : (u.qshe >= 85 ? GREEN : AMBER);
          return [
            td(u.nama, 'left', { fontSize: 7.5 }),
            td(u.she > 0 ? u.she.toFixed(1) : '—', 'right', { fontSize: 7.5 }),
            td(u.quality > 0 ? u.quality.toFixed(1) : '—', 'right', { fontSize: 7.5 }),
            td(u.qshe.toFixed(1), 'right', { fontSize: 7.5, bold: true, color: col }),
          ];
        }),
        [3.0, 0.9, 0.9, 0.9], 0.24, opt);
    },
    catatan: ctx => {
      const bawah = ctx.kum.qsheTarget > 0 ? ctx.qsheUnit.filter(u => u.qshe < ctx.kum.qsheTarget).length : 0;
      return `${ctx.qsheUnit.length} unit ternilai${ctx.kum.qsheTarget > 0 ? `, ${bawah} di antaranya masih di bawah target` : ''}.`;
    },
  },
  {
    key: 'qshe-unit-kartu', label: 'Kartu Unit QSHE (visual)', grup: 'Kinerja QSHE', minTinggi: 1.5, opsi: ['maks-baris'],
    render: (s, area, ctx, opt) => {
      judulSection(s, area, 'Kinerja QSHE per Unit', opt);
      const a = isi(area, opt);
      const target = ctx.kum.qsheTarget;
      const warnaSkor = (v: number) => target > 0 ? (v >= target ? EMERALD : RED) : (v >= 85 ? EMERALD : v >= 70 ? AMBER : RED);

      // Kartu 3 kolom; jumlah baris menyesuaikan tinggi area.
      // Bagian atas kartu untuk nama + lingkaran skor, bagian bawah untuk bar —
      // dipisah baris agar angka SHE/Quality tidak menabrak lingkaran skor.
      const gap = 0.13, kolom = a.w > 5 ? 3 : a.w > 3.2 ? 2 : 1;
      const w = (a.w - gap * (kolom - 1)) / kolom;
      const h = 1.02;
      const barisMuat = Math.max(1, Math.floor((a.h + gap) / (h + gap)));
      const batas = opt.maksBaris && opt.maksBaris > 0
        ? Math.min(opt.maksBaris, barisMuat * kolom) : barisMuat * kolom;
      const unit = ctx.qsheUnit.slice(0, batas);

      unit.forEach((u, i) => {
        const x = a.x + (i % kolom) * (w + gap);
        const y = a.y + Math.floor(i / kolom) * (h + gap);
        const col = warnaSkor(u.qshe);
        const dSkor = 0.5;                       // diameter lingkaran skor
        const kiri = x + 0.1, lebarTeks = w - dSkor - 0.28;

        s.addShape('roundRect', { x, y, w, h, rectRadius: 0.07, fill: { color: 'FFFFFF' }, line: { color: BORDER, width: 0.75 } });
        s.addShape('rect', { x, y: y + 0.06, w: 0.045, h: h - 0.12, fill: { color: col } });

        // Baris atas: nama unit di kiri, lingkaran skor di kanan
        s.addText(u.nama.length > 24 ? u.nama.slice(0, 24) + '…' : u.nama, {
          x: kiri + 0.04, y: y + 0.08, w: lebarTeks, h: 0.2, fontSize: 7.8, bold: true, color: NAVY_DARK, fontFace: 'Calibri',
        });
        s.addText(`Penilaian ${ctx.labelBulan}`, {
          x: kiri + 0.04, y: y + 0.27, w: lebarTeks, h: 0.15, fontSize: 5.8, color: SLATE_LIGHT, fontFace: 'Calibri',
        });
        s.addShape('ellipse', { x: x + w - dSkor - 0.11, y: y + 0.08, w: dSkor, h: dSkor, fill: { color: 'FFFFFF' }, line: { color: col, width: 2.25 } });
        s.addText(u.qshe.toFixed(1), {
          x: x + w - dSkor - 0.11, y: y + 0.19, w: dSkor, h: 0.26, fontSize: 9.5, bold: true, color: col, align: 'center', fontFace: 'Calibri',
        });

        // Baris bawah: bar melebar penuh, angka di ujung kanan bar sendiri
        const bx = kiri + 0.04;
        const lebarPenuh = w - 0.28;
        const wLabel = 0.44, wAngka = 0.34;
        const wBar = lebarPenuh - wLabel - wAngka - 0.1;
        ([['SHE', u.she], ['QUALITY', u.quality]] as const).forEach(([lbl, val], j) => {
          const by = y + 0.58 + j * 0.2;
          s.addText(lbl, { x: bx, y: by, w: wLabel, h: 0.14, fontSize: 5.4, bold: true, color: SLATE, fontFace: 'Calibri' });
          s.addShape('roundRect', { x: bx + wLabel, y: by + 0.038, w: Math.max(0.1, wBar), h: 0.065, rectRadius: 0.032, fill: { color: 'E2E8F0' } });
          if (val > 0) s.addShape('roundRect', { x: bx + wLabel, y: by + 0.038, w: Math.max(0.05, wBar * Math.min(val, 100) / 100), h: 0.065, rectRadius: 0.032, fill: { color: warnaSkor(val) } });
          s.addText(val > 0 ? val.toFixed(1) : '—', {
            x: bx + wLabel + wBar + 0.05, y: by, w: wAngka, h: 0.14,
            fontSize: 5.8, bold: true, color: SLATE, align: 'right', fontFace: 'Calibri',
          });
        });
      });

      if (ctx.qsheUnit.length > unit.length) {
        s.addText(`+${ctx.qsheUnit.length - unit.length} unit lainnya`, {
          x: a.x, y: a.y + a.h - 0.16, w: a.w, h: 0.16,
          fontSize: 6.5, italic: true, color: SLATE_LIGHT, align: 'right', fontFace: 'Calibri',
        });
      }
    },
    catatan: ctx => {
      const bawah = ctx.kum.qsheTarget > 0 ? ctx.qsheUnit.filter(u => u.qshe < ctx.kum.qsheTarget).length : 0;
      return `${ctx.qsheUnit.length} unit ternilai${ctx.kum.qsheTarget > 0 ? `, ${bawah} di antaranya masih di bawah target ${ctx.kum.qsheTarget.toFixed(1)}` : ''}.`;
    },
  },

  // ── Panel evaluasi bergaya papan ikhtisar ──
  {
    key: 'eval-revenue', label: 'Revenue Evaluation (RKAP vs PU)', grup: 'Dashboard Kinerja', minTinggi: 1.9, opsi: [],
    render: (s, area, ctx, opt) => {
      const kotak = panelEvaluasi(s, opt.sembunyikanJudul ? area : area,
        opt.judul?.trim() || 'REVENUE EVALUATION', 'F97316');
      if (ctx.tren.labels.length === 0) return;
      s.addChart(ctx.CT.bar, [
        { name: `RKAP ${ctx.tahun}`, labels: ctx.tren.labels, values: ctx.tren.rkap },
        { name: `PU ${ctx.tahun}`, labels: ctx.tren.labels, values: ctx.tren.real },
      ], {
        ...kotak, chartColors: ['F97316', '1E3A8A'], barGapWidthPct: 45,
        ...axisMuat(kotak, ctx.tren.labels.length),
        ...labelAngka(ctx.tren.labels.length, 'outEnd'),
      });
    },
    catatan: ctx => `Perbandingan RKAP dan realisasi PU per bulan ${ctx.labelPeriode} dalam miliar rupiah.`,
  },
  {
    key: 'eval-gpm', label: 'GPM Evaluation (Laba Kotor)', grup: 'Dashboard Kinerja', minTinggi: 1.9, opsi: [],
    render: (s, area, ctx, opt) => {
      const kotak = panelEvaluasi(s, area, opt.judul?.trim() || 'GPM EVALUATION', 'F97316');
      if (ctx.tren.labels.length === 0) return;
      s.addChart([
        {
          type: ctx.CT.line,
          data: [{ name: `Laba Kotor RKAP ${ctx.tahun}`, labels: ctx.tren.labels, values: ctx.tren.kumLabaRkap }],
          options: { chartColors: ['F97316'], lineSize: 2.25, lineSmooth: true, lineDataSymbol: 'circle', lineDataSymbolSize: 5 },
        },
        {
          type: ctx.CT.line,
          data: [{ name: `Laba Kotor ${ctx.tahun}`, labels: ctx.tren.labels, values: ctx.tren.kumLabaReal }],
          options: { chartColors: ['1E3A8A'], lineSize: 2.25, lineSmooth: true, lineDataSymbol: 'circle', lineDataSymbolSize: 5 },
        },
      ] as any, {
        ...kotak, ...axisMuat(kotak, ctx.tren.labels.length),
        ...labelAngka(ctx.tren.labels.length, 't'),
      });
    },
    catatan: ctx => `Akumulasi laba kotor RKAP dibanding realisasi ${ctx.labelPeriode} dalam miliar rupiah.`,
  },
  {
    key: 'yoy-revenue', label: 'Revenue YoY (tahun lalu vs kini)', grup: 'Dashboard Kinerja', minTinggi: 1.9, opsi: [],
    render: (s, area, ctx, opt) => {
      const kotak = panelEvaluasi(s, area,
        opt.judul?.trim() || `REVENUE YoY ${ctx.tahun - 1} – ${ctx.tahun}`, '0EA5E9');
      if (ctx.tren.labels.length === 0) return;
      s.addChart(ctx.CT.bar, [
        { name: `Pendapatan ${ctx.tahun - 1}`, labels: ctx.tren.labels, values: ctx.trenYoy.pu },
        { name: `Pendapatan ${ctx.tahun}`, labels: ctx.tren.labels, values: ctx.tren.real },
      ], {
        ...kotak, chartColors: ['DC2626', '1E3A8A'], barGapWidthPct: 45,
        ...axisMuat(kotak, ctx.tren.labels.length),
        ...labelAngka(ctx.tren.labels.length, 'outEnd'),
      });
    },
    catatan: ctx => `Realisasi pendapatan ${ctx.tahun} dibanding periode sama ${ctx.tahun - 1} (miliar rupiah).`,
  },
  {
    key: 'yoy-gpm', label: 'GPM YoY (tahun lalu vs kini)', grup: 'Dashboard Kinerja', minTinggi: 1.9, opsi: [],
    render: (s, area, ctx, opt) => {
      const kotak = panelEvaluasi(s, area,
        opt.judul?.trim() || `GPM YoY ${ctx.tahun - 1} – ${ctx.tahun}`, '64748B');
      if (ctx.tren.labels.length === 0) return;
      s.addChart([
        {
          type: ctx.CT.line,
          data: [{ name: `Laba Kotor ${ctx.tahun - 1}`, labels: ctx.tren.labels, values: ctx.trenYoy.laba }],
          options: { chartColors: ['DC2626'], lineSize: 2.25, lineSmooth: true, lineDataSymbol: 'circle', lineDataSymbolSize: 5 },
        },
        {
          type: ctx.CT.line,
          data: [{ name: `Laba Kotor ${ctx.tahun}`, labels: ctx.tren.labels, values: ctx.tren.labaReal }],
          options: { chartColors: ['1E3A8A'], lineSize: 2.25, lineSmooth: true, lineDataSymbol: 'circle', lineDataSymbolSize: 5 },
        },
      ] as any, {
        ...kotak, ...axisMuat(kotak, ctx.tren.labels.length),
        ...labelAngka(ctx.tren.labels.length, 't'),
      });
    },
    catatan: ctx => `Laba kotor bulanan ${ctx.tahun} dibanding ${ctx.tahun - 1} (miliar rupiah).`,
  },
];

export const SECTION_MAP = new Map(SECTIONS.map(s => [s.key, s]));
export const GRUP = ['Dashboard Kinerja', 'Kinerja QSHE', 'Database All Proyek'] as const;

/**
 * Menilai apakah tiap section dalam sebuah slide mendapat ruang yang cukup.
 * Mengembalikan peringatan yang bisa ditampilkan langsung di penyusun slide,
 * sehingga pengguna tahu sebelum mengekspor bahwa isinya akan terpotong.
 */
export const periksaRuang = (
  keys: SectionKey[], kotak: Area[], semuaData: boolean[] = [],
): { key: SectionKey; label: string; pesan: string; parah: boolean }[] => {
  const hasil: { key: SectionKey; label: string; pesan: string; parah: boolean }[] = [];
  keys.forEach((k, i) => {
    const def = SECTION_MAP.get(k);
    const a = kotak[i];
    if (!def || !a) return;
    // Section yang datanya dilanjutkan ke slide berikutnya tidak akan terpotong
    if (def.paginasi && semuaData[i]) return;
    const kurang = def.minTinggi - a.h;
    if (kurang > 0.5) {
      hasil.push({
        key: k, label: def.label, parah: true,
        pesan: `hanya kebagian ${a.h.toFixed(1)}" dari ${def.minTinggi.toFixed(1)}" yang dibutuhkan — isinya akan terpotong. Pindahkan ke slide sendiri.`,
      });
    } else if (kurang > 0.05) {
      hasil.push({
        key: k, label: def.label, parah: false,
        pesan: `ruangnya pas-pasan (${a.h.toFixed(1)}" dari ${def.minTinggi.toFixed(1)}") — sebagian detail seperti legenda grafik akan disederhanakan.`,
      });
    }
  });
  return hasil;
};

/** Bagi area slide menjadi beberapa kotak sesuai tata letak */
export const bagiArea = (jumlah: number, tataLetak: 'kolom' | 'baris' | 'grid', induk: Area): Area[] => {
  const gap = 0.16;
  if (jumlah <= 1) return [induk];
  if (tataLetak === 'kolom') {
    const w = (induk.w - gap * (jumlah - 1)) / jumlah;
    return Array.from({ length: jumlah }, (_, i) => ({ x: induk.x + i * (w + gap), y: induk.y, w, h: induk.h }));
  }
  if (tataLetak === 'baris') {
    const h = (induk.h - gap * (jumlah - 1)) / jumlah;
    return Array.from({ length: jumlah }, (_, i) => ({ x: induk.x, y: induk.y + i * (h + gap), w: induk.w, h }));
  }
  // grid: 2 kolom, baris menyesuaikan
  const kolom = 2;
  const baris = Math.ceil(jumlah / kolom);
  const w = (induk.w - gap) / kolom;
  const h = (induk.h - gap * (baris - 1)) / baris;
  return Array.from({ length: jumlah }, (_, i) => ({
    x: induk.x + (i % kolom) * (w + gap),
    y: induk.y + Math.floor(i / kolom) * (h + gap),
    w, h,
  }));
};
