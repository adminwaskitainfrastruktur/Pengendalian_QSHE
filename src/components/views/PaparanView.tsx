import React, { useMemo, useState } from 'react';
import {
  Download, Loader2, Plus, Trash2, ChevronUp, ChevronDown, X,
  Columns3, Rows3, LayoutGrid, Copy, RotateCcw, SlidersHorizontal, Settings2, AlertTriangle, Lightbulb,
} from 'lucide-react';
import { THEME, MONTH_LABELS } from '../../constants';
import type { Theme } from '../../constants';
import type { UnifiedProjectData, Filters, AllProyekRow, NkbTrendPoint, YoyDataPoint } from '../../types';
import { fShort, fNum } from '../../utils';
import {
  saringBaris, hitungKumulatif, totalPerProyek, hitungTren, hitungMatrix,
  hitungProvinsi, hitungAnalitik, hitungQsheUnit, hitungQsheTren, hitungNkb, hitungYoy, hitungYoyBulanan,
  pctOf, fPct, type PaparanFilter,
} from './paparanData';
import PaparanCapture, { SECTION_POTRET, idPotret } from './PaparanCapture';
import {
  SECTIONS, SECTION_MAP, GRUP, bagiArea, periksaRuang, KPI_ITEMS, QSHE_ITEMS,
  type SectionKey, type SectionOpt, type Ctx, type Area,
} from './paparanSections';

interface Props {
  // Paparan menyaring datanya sendiri dari allRows agar rentang bulan &
  // segmentasi di sini bisa berbeda dari filter dashboard
  allRows: UnifiedProjectData[];
  allProyek: AllProyekRow[];
  nkbKumulatif: NkbTrendPoint[];
  yoyData: YoyDataPoint[];
  filters: Filters;
  dark: boolean;
}

type TataLetak = 'kolom' | 'baris' | 'grid';

/** Satu section di dalam slide, lengkap dengan opsi tampilannya */
interface SectionCfg extends SectionOpt {
  key: SectionKey;
}

interface SlideCfg {
  id: string;
  judul: string;
  sections: SectionCfg[];
  tataLetak: TataLetak;
  catatan: string;      // '' = pakai catatan otomatis
  /** 'kop' = pita gelap biasa; 'papan' = gaya papan ikhtisar berlatar terang */
  gaya?: 'kop' | 'papan';
}

const SLATE_LIGHT_UI = '94A3B8';
const idBaru = () => Math.random().toString(36).slice(2, 9);
// Section berbasis daftar default-nya menampilkan seluruh data lewat slide lanjutan
const sec = (key: SectionKey, extra: SectionOpt = {}): SectionCfg => ({ key, ...extra });

// Susunan awal: contoh slide gabungan supaya pola penggunaannya langsung terlihat
// Kartu KPI & gauge QSHE butuh ruang tinggi, jadi susunan bawaan memberi
// mereka slide sendiri; sisanya digabung berpasangan
const susunanAwal = (): SlideCfg[] => [
  {
    id: idBaru(), judul: 'Dashboard Pengendalian & QSHE', gaya: 'papan', tataLetak: 'grid', catatan: '',
    sections: [sec('eval-revenue'), sec('eval-gpm'), sec('yoy-revenue'), sec('yoy-gpm')],
  },
  { id: idBaru(), judul: 'Ringkasan Kinerja', sections: [sec('kpi')], tataLetak: 'baris', catatan: '' },
  { id: idBaru(), judul: 'Kinerja & Tren', sections: [sec('kinerja'), sec('tren-kum')], tataLetak: 'kolom', catatan: '' },
  { id: idBaru(), judul: 'Tren Kinerja', sections: [sec('tren-kum'), sec('tren-bln')], tataLetak: 'kolom', catatan: '' },
  { id: idBaru(), judul: 'Sorotan Proyek', sections: [sec('top5'), sec('matrix')], tataLetak: 'kolom', catatan: '' },
  { id: idBaru(), judul: 'Breakdown per Proyek', sections: [sec('breakdown')], tataLetak: 'baris', catatan: '' },
  { id: idBaru(), judul: 'Kinerja QSHE', sections: [sec('qshe-kartu'), sec('qshe-tren')], tataLetak: 'kolom', catatan: '' },
  { id: idBaru(), judul: 'Kinerja QSHE per Unit', sections: [sec('qshe-unit-kartu')], tataLetak: 'baris', catatan: '' },
  { id: idBaru(), judul: 'Analitik Database', sections: [sec('db-historis'), sec('db-inteks')], tataLetak: 'kolom', catatan: '' },
  { id: idBaru(), judul: 'Top Pemberi Kerja', sections: [sec('db-pemberi')], tataLetak: 'baris', catatan: '' },
  { id: idBaru(), judul: 'Persebaran per Provinsi', sections: [sec('peta-tabel')], tataLetak: 'baris', catatan: '' },
  { id: idBaru(), judul: 'Database All Proyek', sections: [sec('db-tabel')], tataLetak: 'baris', catatan: '' },
];

const PaparanView: React.FC<Props> = ({ allRows, allProyek, nkbKumulatif, yoyData, filters, dark }) => {
  const c: Theme = dark ? THEME.dark : THEME.light;
  const [exporting, setExporting] = useState(false);

  // ── Identitas deck (bebas diubah pengguna) ──
  const [judulDeck, setJudulDeck] = useState('LAPORAN KINERJA');
  const [subjudulDeck, setSubjudulDeck] = useState('PT Waskita Karya Infrastruktur');
  const [namaBerkas, setNamaBerkas] = useState('');

  // ── Filter khusus paparan; menu ini tidak mengikuti filter dashboard ──
  // Nilai awal diambil dari data yang benar-benar ada, bukan tebakan tahun,
  // supaya seluruh KPI langsung terisi begitu menu dibuka
  const awal = useMemo(() => {
    let tahunMax = 0, bulanMax = 0;
    allRows.forEach(d => d.histori_bulanan.forEach(h => {
      if (h.real === 0 && h.rkap === 0) return;
      if (h.tahun > tahunMax) { tahunMax = h.tahun; bulanMax = 0; }
      if (h.tahun === tahunMax && h.bulanIndex > bulanMax) bulanMax = h.bulanIndex;
    }));
    return {
      tahun: filters.tahun ?? (tahunMax || new Date().getFullYear()),
      bulan: filters.bulan ?? (bulanMax || 12),
    };
    // Sekali hitung saat komponen dibuka; selanjutnya pengguna yang mengatur
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [segPpt, setSegPpt] = useState('');
  const [bulanDari, setBulanDari] = useState(1);
  const [bulanSampai, setBulanSampai] = useState(awal.bulan);
  const [tahunPpt, setTahunPpt] = useState(awal.tahun);

  const fPpt: PaparanFilter = useMemo(
    () => ({ tahun: tahunPpt, bulanDari, bulanSampai, segmentasi: segPpt }),
    [tahunPpt, bulanDari, bulanSampai, segPpt]);

  const segOptions = useMemo(
    () => Array.from(new Set(allRows.map(d => d.segmentasi).filter(Boolean))).sort(),
    [allRows]);
  const tahunOptions = useMemo(() => {
    const set = new Set<number>();
    allRows.forEach(d => d.histori_bulanan.forEach(h => { if (h.tahun > 0) set.add(h.tahun); }));
    return Array.from(set).sort((a, b) => a - b);
  }, [allRows]);

  // ── Slide ──
  const [slides, setSlides] = useState<SlideCfg[]>(susunanAwal);

  const ubahSlide = (id: string, patch: Partial<SlideCfg>) =>
    setSlides(list => list.map(s => s.id === id ? { ...s, ...patch } : s));
  const hapusSlide = (id: string) => setSlides(list => list.filter(s => s.id !== id));
  const geserSlide = (id: string, arah: -1 | 1) => setSlides(list => {
    const i = list.findIndex(s => s.id === id);
    const j = i + arah;
    if (i < 0 || j < 0 || j >= list.length) return list;
    const salinan = [...list];
    [salinan[i], salinan[j]] = [salinan[j], salinan[i]];
    return salinan;
  });
  const duplikatSlide = (id: string) => setSlides(list => {
    const i = list.findIndex(s => s.id === id);
    if (i < 0) return list;
    const salinan = [...list];
    salinan.splice(i + 1, 0, { ...list[i], id: idBaru(), judul: `${list[i].judul} (salinan)` });
    return salinan;
  });
  const tambahSlide = () => setSlides(list => [...list, { id: idBaru(), judul: `Slide ${list.length + 1}`, sections: [], tataLetak: 'baris', catatan: '' }]);
  const tambahSection = (id: string, key: SectionKey) => setSlides(list => list.map(s =>
    s.id === id && s.sections.length < 4
      ? { ...s, sections: [...s.sections, sec(key)] } : s));
  const hapusSection = (id: string, idx: number) => setSlides(list => list.map(s =>
    s.id === id ? { ...s, sections: s.sections.filter((_, i) => i !== idx) } : s));
  const geserSection = (id: string, idx: number, arah: -1 | 1) => setSlides(list => list.map(s => {
    if (s.id !== id) return s;
    const j = idx + arah;
    if (j < 0 || j >= s.sections.length) return s;
    const daftar = [...s.sections];
    [daftar[idx], daftar[j]] = [daftar[j], daftar[idx]];
    return { ...s, sections: daftar };
  }));
  const ubahSection = (id: string, idx: number, patch: SectionOpt) => setSlides(list => list.map(s =>
    s.id === id ? { ...s, sections: s.sections.map((sc, i) => i === idx ? { ...sc, ...patch } : sc) } : s));

  // ══ Data mengikuti filter paparan ══
  const barisTerfilter = useMemo(() => saringBaris(allRows, fPpt), [allRows, fPpt]);
  const dbTerfilter = useMemo(
    () => fPpt.segmentasi ? allProyek.filter(p => p.segmentasi === fPpt.segmentasi) : allProyek,
    [allProyek, fPpt.segmentasi]);

  const labelBulan = MONTH_LABELS[fPpt.bulanSampai] ?? 'Des';
  const labelPeriode = fPpt.bulanDari === 1
    ? `S.D ${labelBulan} ${fPpt.tahun}`
    : `${MONTH_LABELS[fPpt.bulanDari] ?? ''}–${labelBulan} ${fPpt.tahun}`;
  const periodeLengkap = `${fPpt.segmentasi ? `${fPpt.segmentasi} · ` : ''}${labelPeriode}`;

  const ctx: Ctx = useMemo(() => {
    const kum = hitungKumulatif(barisTerfilter, fPpt);
    return {
      kum,
      nkb: hitungNkb(nkbKumulatif, fPpt),
      proyek: totalPerProyek(barisTerfilter, fPpt),
      matrix: hitungMatrix(barisTerfilter),
      tren: hitungTren(barisTerfilter, fPpt),
      provinsi: hitungProvinsi(dbTerfilter),
      analitik: hitungAnalitik(dbTerfilter),
      qsheUnit: hitungQsheUnit(barisTerfilter, fPpt),
      qsheTren: hitungQsheTren(barisTerfilter, fPpt),
      yoy: hitungYoy(yoyData, fPpt),
      trenYoy: hitungYoyBulanan(yoyData, fPpt).ambil(hitungTren(barisTerfilter, fPpt).bulanIndex),
      dbProyek: dbTerfilter.map(p => ({
        no: p.no, idProject: p.id_project, nama: p.project_name, seg: p.segmentasi,
        pemberiKerja: p.pemberi_kerja, nk: p.nilai_kontrak, progress: p.progress_pct,
        pu: p.pu_sd, bk: p.bk_sd, bkPu: p.bk_pu_pct, status: p.status,
        kota: p.kota || p.provinsi || '–', intEks: p.internal_eksternal, piutang: p.piutang,
      })),
      labelBulan, labelPeriode, tahun: fPpt.tahun,
      CT: null,
    };
  }, [barisTerfilter, dbTerfilter, nkbKumulatif, yoyData, fPpt, labelBulan, labelPeriode]);

  // Ukur ruang tiap section persis seperti saat diekspor, supaya peringatan
  // di layar mencerminkan hasil PPT yang sebenarnya
  const peringatanSlide = (cfg: SlideCfg) => {
    if (cfg.sections.length === 0) return [];
    const atas = cfg.gaya === 'papan' ? 1.02 : 0.95;
    const adaCatatan = cfg.catatan.trim() !== '' || cfg.sections.length > 0;
    const tinggi = (adaCatatan ? 4.57 : 5.25) - atas;
    const kotak = bagiArea(cfg.sections.length, cfg.tataLetak, { x: 0.35, y: atas, w: 9.3, h: tinggi });
    return periksaRuang(cfg.sections.map(sc => sc.key), kotak, cfg.sections.map(sc => !!sc.semuaData));
  };

  const catatanSlide = (s: SlideCfg) => s.catatan.trim() !== ''
    ? s.catatan
    : s.sections.map(sc => SECTION_MAP.get(sc.key)?.catatan(ctx) ?? '').filter(Boolean).join(' ');

  // ── Template sampul & penutup dari public/paparan ──
  const ambilGambar = async (url: string): Promise<string | null> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const blob = await res.blob();
      return await new Promise<string | null>(resolve => {
        const fr = new FileReader();
        fr.onloadend = () => resolve(typeof fr.result === 'string' ? fr.result : null);
        fr.onerror = () => resolve(null);
        fr.readAsDataURL(blob);
      });
    } catch { return null; }
  };

  // Section mana saja yang perlu disiapkan di area potret
  const perluPotret = useMemo(() => {
    const set = new Set<SectionKey>();
    slides.forEach(sl => sl.sections.forEach(sc => { if (sc.potret && SECTION_POTRET[sc.key]) set.add(sc.key); }));
    return Array.from(set);
  }, [slides]);

  /**
   * Memotret komponen web asli menjadi gambar. Tinggi wadah disamakan dengan
   * rasio area slide lebih dulu supaya bagian yang tidak muat terpotong rapi,
   * bukan gambarnya yang menjadi gepeng.
   */
  const potretSection = async (key: SectionKey, area: Area): Promise<string | null> => {
    const el = document.getElementById(idPotret(key));
    if (!el) return null;
    const html2canvas = (await import('html2canvas')).default;
    const tinggiTarget = el.offsetWidth * (area.h / area.w);
    const gayaLama = { height: el.style.height, overflow: el.style.overflow };
    el.style.height = `${tinggiTarget}px`;
    el.style.overflow = 'hidden';
    try {
      const canvas = await html2canvas(el, {
        scale: 2, backgroundColor: '#ffffff', logging: false,
        width: el.offsetWidth, height: tinggiTarget, useCORS: true,
      });
      return canvas.toDataURL('image/png');
    } catch {
      return null;   // gagal memotret: section digambar cara biasa
    } finally {
      el.style.height = gayaLama.height;
      el.style.overflow = gayaLama.overflow;
    }
  };

  // ══ Ekspor ke PowerPoint ══
  const exportPptx = async () => {
    setExporting(true);
    try {
      const [coverImg, closingImg] = await Promise.all([
        ambilGambar(`${import.meta.env.BASE_URL}paparan/cover.jpg`),
        ambilGambar(`${import.meta.env.BASE_URL}paparan/closing.jpg`),
      ]);
      const PptxGenJS = (await import('pptxgenjs')).default;
      const pptx = new PptxGenJS();
      pptx.layout = 'LAYOUT_16x9';
      pptx.author = 'Dashboard QSHE WKI';
      pptx.title = judulDeck;
      const ctxPpt: Ctx = { ...ctx, CT: (pptx as any).ChartType };

      // Sampul
      {
        const s: any = pptx.addSlide();
        if (coverImg) {
          s.addImage({ data: coverImg, x: 0, y: 0, w: 10, h: 5.63 });
          s.addText(judulDeck, { x: 0.7, y: 3.85, w: 8.6, h: 0.5, fontSize: 24, bold: true, color: 'FFFFFF', fontFace: 'Calibri', shadow: { type: 'outer', blur: 4, offset: 1, angle: 45, color: '000000', opacity: 0.55 } });
          s.addText(`${subjudulDeck} · ${periodeLengkap}`, { x: 0.7, y: 4.4, w: 8.6, h: 0.4, fontSize: 13, color: 'FFFFFF', fontFace: 'Calibri', shadow: { type: 'outer', blur: 4, offset: 1, angle: 45, color: '000000', opacity: 0.55 } });
        } else {
          s.background = { color: '0F172A' };
          s.addShape('rect', { x: 0, y: 0, w: 0.18, h: 5.63, fill: { color: '3B82F6' } });
          s.addText(judulDeck, { x: 0.7, y: 1.9, w: 8.8, h: 0.85, fontSize: 38, bold: true, color: 'FFFFFF', fontFace: 'Calibri', charSpacing: 2 });
          s.addText(subjudulDeck, { x: 0.7, y: 2.8, w: 8.6, h: 0.55, fontSize: 20, color: '93C5FD', fontFace: 'Calibri' });
          s.addText(periodeLengkap, { x: 0.7, y: 3.5, w: 8.6, h: 0.45, fontSize: 14, color: 'E2E8F0', fontFace: 'Calibri' });
        }
      }

      // Potret semua section yang diminta lebih dulu (operasi async)
      const petaPotret = new Map<SectionKey, string>();
      for (const sl of slides) {
        const atasP = sl.gaya === 'papan' ? 1.02 : 0.95;
        const cat = catatanSlide(sl).trim();
        const kotakP = bagiArea(sl.sections.length, sl.tataLetak,
          { x: 0.35, y: atasP, w: 9.3, h: (cat ? 4.57 : 5.25) - atasP });
        for (let i = 0; i < sl.sections.length; i++) {
          const sc = sl.sections[i];
          if (!sc.potret || !SECTION_POTRET[sc.key] || petaPotret.has(sc.key)) continue;
          const img = await potretSection(sc.key, kotakP[i]);
          if (img) petaPotret.set(sc.key, img);
        }
      }

      // Slide isi. Satu konfigurasi bisa melahirkan beberapa slide bila ada
      // section berpaginasi yang datanya belum habis (mis. tabel database).
      let no = 1;
      slides.filter(s => s.sections.length > 0).forEach(cfg => {
        const papan = cfg.gaya === 'papan';
        const catatan = catatanSlide(cfg).trim();
        const atas = papan ? 1.02 : 0.95;
        const tinggiKonten = (catatan ? 4.57 : 5.25) - atas;
        const induk: Area = { x: 0.35, y: atas, w: 9.3, h: tinggiKonten };
        const kotak = bagiArea(cfg.sections.length, cfg.tataLetak, induk);

        // Hitung berapa halaman yang dibutuhkan agar seluruh data tampil
        let totalHalaman = 1;
        cfg.sections.forEach((sc, i) => {
          const def = SECTION_MAP.get(sc.key);
          if (!def?.paginasi || !sc.semuaData) return;
          const perHal = Math.max(1, sc.maksBaris && sc.maksBaris > 0
            ? Math.min(sc.maksBaris, def.paginasi.perHalaman(kotak[i]))
            : def.paginasi.perHalaman(kotak[i]));
          totalHalaman = Math.max(totalHalaman, Math.ceil(def.paginasi.total(ctxPpt) / perHal));
        });
        totalHalaman = Math.min(totalHalaman, 40); // pagar pengaman

        for (let hal = 0; hal < totalHalaman; hal++) {
        no += 1;
        const s: any = pptx.addSlide();
        s.background = { color: papan ? 'F8FAFC' : 'FFFFFF' };
        const judulSlide = totalHalaman > 1 ? `${cfg.judul} (${hal + 1}/${totalHalaman})` : cfg.judul;

        if (papan) {
          // Gaya papan ikhtisar: latar terang, judul di tengah, aksen tipis
          s.addShape('rect', { x: 0, y: 0, w: 10, h: 0.82, fill: { color: 'FFFFFF' } });
          // Tiga zona tanpa saling menimpa: identitas kiri, judul tengah, periode kanan
          s.addText(subjudulDeck, {
            x: 0.35, y: 0.2, w: 2.3, h: 0.4, fontSize: 9, bold: true,
            color: SLATE_LIGHT_UI, valign: 'middle', fontFace: 'Calibri',
          });
          s.addText(judulSlide, {
            x: 2.75, y: 0.14, w: 4.5, h: 0.5, fontSize: 19, bold: true,
            color: '155E75', align: 'center', valign: 'middle', fontFace: 'Calibri',
          });
          s.addText(periodeLengkap, {
            x: 7.35, y: 0.2, w: 2.3, h: 0.4, fontSize: 9, bold: true,
            color: SLATE_LIGHT_UI, align: 'right', valign: 'middle', fontFace: 'Calibri',
          });
          s.addShape('rect', { x: 0.35, y: 0.8, w: 9.3, h: 0.02, fill: { color: 'E2E8F0' } });
        } else {
          // Pita gelap dengan sudut lembut & aksen gradasi tipis
          s.addShape('rect', { x: 0, y: 0, w: 10, h: 0.72, fill: { color: '1E293B' } });
          s.addShape('rect', { x: 0, y: 0, w: 0.09, h: 0.72, fill: { color: '3B82F6' } });
          s.addShape('rect', { x: 0, y: 0.72, w: 10, h: 0.035, fill: { color: '3B82F6' } });
          s.addText(judulSlide, { x: 0.35, y: 0.08, w: 6.8, h: 0.42, fontSize: 18, bold: true, color: 'FFFFFF', fontFace: 'Calibri' });
          s.addText(subjudulDeck, { x: 0.35, y: 0.45, w: 6.8, h: 0.22, fontSize: 8.5, color: '93C5FD', fontFace: 'Calibri' });
          s.addText(periodeLengkap, { x: 7.2, y: 0.18, w: 2.45, h: 0.4, fontSize: 10.5, bold: true, color: 'E2E8F0', align: 'right', fontFace: 'Calibri' });
        }

        for (let i = 0; i < cfg.sections.length; i++) {
          const { key, ...opt } = cfg.sections[i];
          const def = SECTION_MAP.get(key);
          if (!def) continue;

          // Potret tampilan web: satu gambar utuh menggantikan render native
          if (opt.potret && SECTION_POTRET[key]) {
            if (hal > 0) continue;
            const gambar = petaPotret.get(key);
            if (gambar) {
              s.addImage({ data: gambar, x: kotak[i].x, y: kotak[i].y, w: kotak[i].w, h: kotak[i].h });
              continue;
            }
          }
          // Section berpaginasi melanjutkan dari baris terakhir halaman sebelumnya
          let offsetBaris = 0;
          if (def.paginasi && opt.semuaData) {
            const perHal = Math.max(1, opt.maksBaris && opt.maksBaris > 0
              ? Math.min(opt.maksBaris, def.paginasi.perHalaman(kotak[i]))
              : def.paginasi.perHalaman(kotak[i]));
            offsetBaris = hal * perHal;
            if (offsetBaris >= def.paginasi.total(ctxPpt)) continue;  // datanya sudah habis
          } else if (hal > 0) {
            continue;  // section tanpa paginasi hanya digambar di halaman pertama
          }
          def.render(s, kotak[i], ctxPpt, { ...opt, offsetBaris });
        }

        if (catatan && hal === 0) {
          s.addShape('roundRect', { x: 0.35, y: 4.66, w: 9.3, h: 0.52, rectRadius: 0.05, fill: { color: 'EFF6FF' }, line: { color: 'BFDBFE', width: 0.75 } });
          s.addText([
            { text: 'Catatan:  ', options: { bold: true, color: '1D4ED8' } },
            { text: catatan, options: { color: '334155' } },
          ], { x: 0.5, y: 4.68, w: 9.0, h: 0.48, fontSize: 9, fontFace: 'Calibri', valign: 'middle' });
          s.addNotes(catatan);
        }
        s.addText(`Dashboard Pengendalian & QSHE WKI  ·  ${no}`, { x: 0.35, y: 5.3, w: 9.3, h: 0.26, fontSize: 8, color: '94A3B8', align: 'right', fontFace: 'Calibri' });
        }
      });

      // Penutup
      {
        const s: any = pptx.addSlide();
        if (closingImg) {
          s.addImage({ data: closingImg, x: 0, y: 0, w: 10, h: 5.63 });
        } else {
          s.background = { color: '0F172A' };
          s.addShape('rect', { x: 0, y: 0, w: 0.18, h: 5.63, fill: { color: '3B82F6' } });
          s.addText('Terima Kasih', { x: 0.7, y: 2.15, w: 8.6, h: 0.8, fontSize: 36, bold: true, color: 'FFFFFF', fontFace: 'Calibri' });
          s.addText(subjudulDeck, { x: 0.7, y: 3.0, w: 8.6, h: 0.4, fontSize: 13, color: '93C5FD', fontFace: 'Calibri' });
        }
      }

      const berkas = namaBerkas.trim() || `${judulDeck} - ${periodeLengkap}`;
      await pptx.writeFile({ fileName: `${berkas.replace(/[\\/:*?"<>|]/g, '-')}.pptx` });
    } finally {
      setExporting(false);
    }
  };

  // ══ Gaya UI ══
  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${c.border}`,
    background: c.card, color: c.text, fontSize: '12px', fontWeight: 600, width: '100%',
  };
  const labelKecil: React.CSSProperties = {
    fontSize: '10px', fontWeight: 700, color: c.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px', display: 'block',
  };
  const kartuStyle: React.CSSProperties = {
    background: c.card, border: `1px solid ${c.border}`,
    borderRadius: 'var(--radius-xl)', padding: '18px',
  };
  const tombolIkon = (aktif = false): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
    padding: '6px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
    border: `1px solid ${aktif ? '#3b82f6' : c.border}`,
    background: aktif ? (dark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : c.card,
    color: aktif ? '#3b82f6' : c.textMuted,
    transition: 'all 0.2s var(--ease-out)',
  });

  // Jumlah slide sebenarnya, termasuk halaman lanjutan dari section berpaginasi
  const halamanSlide = (cfg: SlideCfg) => {
    if (cfg.sections.length === 0) return 0;
    const atas = cfg.gaya === 'papan' ? 1.02 : 0.95;
    const tinggi = 4.57 - atas;
    const kotak = bagiArea(cfg.sections.length, cfg.tataLetak, { x: 0.35, y: atas, w: 9.3, h: tinggi });
    let hal = 1;
    cfg.sections.forEach((sc, i) => {
      const def = SECTION_MAP.get(sc.key);
      if (!def?.paginasi || !sc.semuaData) return;
      const perHal = Math.max(1, sc.maksBaris && sc.maksBaris > 0
        ? Math.min(sc.maksBaris, def.paginasi.perHalaman(kotak[i]))
        : def.paginasi.perHalaman(kotak[i]));
      hal = Math.max(hal, Math.ceil(def.paginasi.total(ctx) / perHal));
    });
    return Math.min(hal, 40);
  };
  const slideAktif = slides.reduce((n, s) => n + halamanSlide(s), 0);

  return (
    <div className="sn-view-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Identitas & ekspor ── */}
      <div className="sn-card" style={kartuStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px', flex: 1, minWidth: '260px' }}>
            <div>
              <label style={labelKecil}>Judul Paparan</label>
              <input value={judulDeck} onChange={e => setJudulDeck(e.target.value)} className="sn-input" style={inputStyle} placeholder="LAPORAN KINERJA" />
            </div>
            <div>
              <label style={labelKecil}>Subjudul</label>
              <input value={subjudulDeck} onChange={e => setSubjudulDeck(e.target.value)} className="sn-input" style={inputStyle} placeholder="PT Waskita Karya Infrastruktur" />
            </div>
            <div>
              <label style={labelKecil}>Nama Berkas (opsional)</label>
              <input value={namaBerkas} onChange={e => setNamaBerkas(e.target.value)} className="sn-input" style={inputStyle} placeholder={`${judulDeck} - ${periodeLengkap}`} />
            </div>
          </div>
          <button onClick={exportPptx} disabled={exporting || slideAktif === 0} className="sn-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px',
              borderRadius: 'var(--radius-md)', border: 'none', fontSize: '13px', fontWeight: 700,
              background: slideAktif === 0 ? c.bgMuted : '#1e293b',
              color: slideAktif === 0 ? c.textSubtle : '#fff',
              cursor: exporting || slideAktif === 0 ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
            }}>
            {exporting
              ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 0.8s linear infinite' }} /> Menyusun PPT…</>
              : <><Download style={{ width: '15px', height: '15px' }} /> Unduh PPT ({slideAktif + 2} slide)</>}
          </button>
        </div>
      </div>

      {/* ── Filter khusus paparan ── */}
      <div className="sn-card" style={kartuStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <SlidersHorizontal style={{ width: '14px', height: '14px', color: c.textMuted }} />
          <h4 style={{ fontSize: '13px', fontWeight: 700, color: c.text }}>Data yang Ditampilkan</h4>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: c.textSubtle }}>Khusus paparan — tidak terpengaruh filter dashboard</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div>
            <label style={labelKecil}>Tahun</label>
            <select value={tahunPpt} onChange={e => setTahunPpt(Number(e.target.value))} style={{ ...inputStyle, cursor: 'pointer' }}>
              {(tahunOptions.length ? tahunOptions : [tahunPpt]).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelKecil}>Bulan Dari</label>
            <select value={bulanDari} onChange={e => setBulanDari(Math.min(Number(e.target.value), bulanSampai))} style={{ ...inputStyle, cursor: 'pointer' }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
            </select>
          </div>
          <div>
            <label style={labelKecil}>Bulan Sampai</label>
            <select value={bulanSampai} onChange={e => setBulanSampai(Math.max(Number(e.target.value), bulanDari))} style={{ ...inputStyle, cursor: 'pointer' }}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{MONTH_LABELS[m]}</option>)}
            </select>
          </div>
          <div>
            <label style={labelKecil}>Segmentasi</label>
            <select value={segPpt} onChange={e => setSegPpt(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Semua Segmentasi</option>
              {segOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <p style={{ fontSize: '11px', color: c.textSubtle, marginTop: '10px' }}>
          Periode aktif: <b style={{ color: c.text }}>{periodeLengkap}</b> · {fNum(ctx.proyek.length)} baris proyek · PU {fShort(ctx.kum.puReal)}
        </p>
      </div>

      {/* ── Panduan menyusun slide ── */}
      <div className="sn-card" style={{
        ...kartuStyle,
        background: dark ? 'rgba(59,130,246,0.07)' : '#f8fbff',
        border: `1px solid ${dark ? 'rgba(59,130,246,0.28)' : '#dbeafe'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <Lightbulb style={{ width: '15px', height: '15px', color: '#3b82f6' }} />
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: c.text }}>Cara Memaksimalkan Slide</h4>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px 18px' }}>
          {[
            ['Ingin semua data tampil utuh?', 'Pakai satu section saja per slide. Section itu dapat tinggi penuh, sehingga tabel menampilkan baris terbanyak dan grafik memakai legenda lengkap.'],
            ['Dua section masih aman', 'Pilih "Berdampingan" untuk dua grafik, atau "Bertumpuk" untuk tabel di atas grafik. Masing-masing masih dapat sekitar separuh tinggi slide.'],
            ['Tiga atau empat section', 'Hanya cocok untuk panel evaluasi dan grafik ringkas. Tabel panjang dan kartu KPI akan terpotong — pindahkan ke slide sendiri.'],
            ['Butuh slide sendiri', 'Kartu Ringkasan KPI, Kartu Unit QSHE, dan gauge QSHE punya banyak elemen bertingkat. Beri mereka satu slide penuh agar bar dan angka tidak menyusut.'],
            ['Tabel terlalu panjang?', 'Buka gerigi pada section, atur "Maksimal Baris" lalu duplikat slide untuk melanjutkan baris berikutnya — lebih rapi daripada memaksakan semuanya dalam satu slide.'],
            ['Grafik ramai angka?', 'Label angka otomatis dilepas bila bulannya lebih dari delapan. Untuk menampilkan angka di tiap titik, persempit rentang bulan di panel Data yang Ditampilkan.'],
            ['Ingin persis seperti web?', 'Matrix, Database All Proyek, dan Kartu Unit QSHE punya opsi "Potret dari tampilan web" di panel gerigi. Slide memakai gambar tampilan web sehingga identik — konsekuensinya teks tidak bisa diedit di PowerPoint dan isinya sebatas satu slide.'],
          ].map(([judul, isi]) => (
            <div key={judul} style={{ display: 'flex', gap: '8px' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3b82f6', flexShrink: 0, marginTop: '6px' }} />
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: 800, color: c.text, marginBottom: '2px' }}>{judul}</div>
                <div style={{ fontSize: '11px', color: c.textMuted, lineHeight: 1.5 }}>{isi}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Area potret di luar layar — hanya ada saat ada section yang memakainya */}
      <PaparanCapture baris={barisTerfilter} dbProyek={dbTerfilter} filters={filters} aktif={perluPotret} />

      {/* ── Penyusun slide ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {slides.map((s, idx) => (
          <SlideEditor
            key={s.id} cfg={s} nomor={idx + 2} c={c} dark={dark} ctx={ctx}
            periodeLengkap={periodeLengkap}
            catatanOtomatis={catatanSlide(s)}
            peringatan={peringatanSlide(s)}
            onUbah={patch => ubahSlide(s.id, patch)}
            onHapus={() => hapusSlide(s.id)}
            onGeser={arah => geserSlide(s.id, arah)}
            onDuplikat={() => duplikatSlide(s.id)}
            onTambahSection={key => tambahSection(s.id, key)}
            onHapusSection={idx => hapusSection(s.id, idx)}
            onGeserSection={(idx, arah) => geserSection(s.id, idx, arah)}
            onUbahSection={(idx, patch) => ubahSection(s.id, idx, patch)}
            bisaNaik={idx > 0} bisaTurun={idx < slides.length - 1}
            inputStyle={inputStyle} labelKecil={labelKecil} tombolIkon={tombolIkon}
          />
        ))}

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={tambahSlide} className="sn-chip-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 18px', borderRadius: 'var(--radius-md)', border: `1.5px dashed ${c.borderStrong}`, background: 'transparent', color: c.text, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            <Plus style={{ width: '15px', height: '15px' }} /> Tambah Slide
          </button>
          <button onClick={() => setSlides(susunanAwal())} className="sn-chip-btn"
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 18px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${c.border}`, background: c.card, color: c.textMuted, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            <RotateCcw style={{ width: '14px', height: '14px' }} /> Kembalikan Susunan Awal
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════ Editor satu slide ═══════════
interface EditorProps {
  cfg: SlideCfg; nomor: number; c: Theme; dark: boolean; ctx: Ctx;
  periodeLengkap: string; catatanOtomatis: string;
  peringatan: { key: SectionKey; label: string; pesan: string; parah: boolean }[];
  onUbah: (patch: Partial<SlideCfg>) => void;
  onHapus: () => void;
  onGeser: (arah: -1 | 1) => void;
  onDuplikat: () => void;
  onTambahSection: (key: SectionKey) => void;
  onHapusSection: (idx: number) => void;
  onGeserSection: (idx: number, arah: -1 | 1) => void;
  onUbahSection: (idx: number, patch: SectionOpt) => void;
  bisaNaik: boolean; bisaTurun: boolean;
  inputStyle: React.CSSProperties;
  labelKecil: React.CSSProperties;
  tombolIkon: (aktif?: boolean) => React.CSSProperties;
}

const SlideEditor: React.FC<EditorProps> = ({
  cfg, nomor, c, dark, ctx, periodeLengkap, catatanOtomatis, peringatan,
  onUbah, onHapus, onGeser, onDuplikat, onTambahSection, onHapusSection, onGeserSection, onUbahSection,
  bisaNaik, bisaTurun, inputStyle, labelKecil, tombolIkon,
}) => {
  const [bukaTambah, setBukaTambah] = useState(false);
  const [bukaOpsi, setBukaOpsi] = useState<number | null>(null);
  const terpakai = cfg.sections.map(s => s.key);
  const tersedia = SECTIONS.filter(s => !terpakai.includes(s.key));
  const penuh = cfg.sections.length >= 4;

  const LAYOUTS: { key: TataLetak; label: string; Icon: React.FC<any> }[] = [
    { key: 'baris', label: 'Bertumpuk', Icon: Rows3 },
    { key: 'kolom', label: 'Berdampingan', Icon: Columns3 },
    { key: 'grid', label: 'Kisi 2 kolom', Icon: LayoutGrid },
  ];

  return (
    <div className="sn-card" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      {/* Kepala slide */}
      <div style={{ padding: '14px 18px', background: c.bgMuted, borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '7px', background: '#1e293b', color: '#fff', fontSize: '12px', fontWeight: 800, flexShrink: 0 }}>
          {nomor}
        </span>
        <input value={cfg.judul} onChange={e => onUbah({ judul: e.target.value })} className="sn-input"
          style={{ ...inputStyle, flex: 1, minWidth: '160px', fontWeight: 700 }} placeholder="Judul slide" />
        <button onClick={() => onUbah({ gaya: cfg.gaya === 'papan' ? 'kop' : 'papan' })} className="sn-btn"
          title={cfg.gaya === 'papan' ? 'Gaya: papan ikhtisar (latar terang)' : 'Gaya: kop gelap'}
          style={{ ...tombolIkon(cfg.gaya === 'papan'), padding: '6px 10px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {cfg.gaya === 'papan' ? 'Papan' : 'Kop'}
        </button>
        <div style={{ display: 'flex', gap: '4px' }}>
          {LAYOUTS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => onUbah({ tataLetak: key })} className="sn-btn" title={label}
              style={tombolIkon(cfg.tataLetak === key)}>
              <Icon style={{ width: '14px', height: '14px' }} />
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => onGeser(-1)} disabled={!bisaNaik} className="sn-btn" title="Naikkan slide"
            style={{ ...tombolIkon(), opacity: bisaNaik ? 1 : 0.4, cursor: bisaNaik ? 'pointer' : 'not-allowed' }}>
            <ChevronUp style={{ width: '14px', height: '14px' }} />
          </button>
          <button onClick={() => onGeser(1)} disabled={!bisaTurun} className="sn-btn" title="Turunkan slide"
            style={{ ...tombolIkon(), opacity: bisaTurun ? 1 : 0.4, cursor: bisaTurun ? 'pointer' : 'not-allowed' }}>
            <ChevronDown style={{ width: '14px', height: '14px' }} />
          </button>
          <button onClick={onDuplikat} className="sn-btn" title="Duplikat slide" style={tombolIkon()}>
            <Copy style={{ width: '14px', height: '14px' }} />
          </button>
          <button onClick={onHapus} className="sn-btn" title="Hapus slide"
            style={{ ...tombolIkon(), color: '#dc2626', borderColor: 'rgba(220,38,38,0.35)' }}>
            <Trash2 style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>

      <div className="rg-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '18px' }}>
        {/* Pratinjau */}
        <div style={{ minWidth: 0 }}>
          <span style={labelKecil}>Pratinjau</span>
          <SlidePreview cfg={cfg} ctx={ctx} c={c} dark={dark} periodeLengkap={periodeLengkap} catatan={catatanOtomatis} />
        </div>

        {/* Daftar section + catatan */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <span style={labelKecil}>Isi Slide ({cfg.sections.length}/4)</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {cfg.sections.map((sc, i) => {
                const def = SECTION_MAP.get(sc.key)!;
                const terbuka = bukaOpsi === i;
                return (
                  <div key={`${sc.key}-${i}`} style={{ borderRadius: 'var(--radius-md)', background: c.bgMuted, border: `1px solid ${terbuka ? '#3b82f6' : c.border}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 10px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sc.judul?.trim() || def.label}
                        </div>
                        <div style={{ fontSize: '10px', color: c.textSubtle }}>{def.grup}</div>
                      </div>
                      <button onClick={() => setBukaOpsi(terbuka ? null : i)} className="sn-btn" title="Atur tampilan section"
                        style={{ ...tombolIkon(terbuka), padding: '4px 5px' }}>
                        <Settings2 style={{ width: '12px', height: '12px' }} />
                      </button>
                      <button onClick={() => onGeserSection(i, -1)} disabled={i === 0} className="sn-btn" title="Naikkan"
                        style={{ ...tombolIkon(), padding: '4px 5px', opacity: i === 0 ? 0.35 : 1 }}>
                        <ChevronUp style={{ width: '12px', height: '12px' }} />
                      </button>
                      <button onClick={() => onGeserSection(i, 1)} disabled={i === cfg.sections.length - 1} className="sn-btn" title="Turunkan"
                        style={{ ...tombolIkon(), padding: '4px 5px', opacity: i === cfg.sections.length - 1 ? 0.35 : 1 }}>
                        <ChevronDown style={{ width: '12px', height: '12px' }} />
                      </button>
                      <button onClick={() => { onHapusSection(i); setBukaOpsi(null); }} className="sn-btn" title="Keluarkan dari slide"
                        style={{ ...tombolIkon(), padding: '4px 5px', color: '#dc2626', borderColor: 'rgba(220,38,38,0.3)' }}>
                        <X style={{ width: '12px', height: '12px' }} />
                      </button>
                    </div>

                    {terbuka && (
                      <div className="sn-fade-in" style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: '9px', borderTop: `1px dashed ${c.border}`, marginTop: '2px', paddingTop: '9px' }}>
                        <div>
                          <span style={{ ...labelKecil, marginBottom: '3px' }}>Judul Section</span>
                          <input value={sc.judul ?? ''} onChange={e => onUbahSection(i, { judul: e.target.value })}
                            placeholder={def.label} className="sn-input" style={{ ...inputStyle, padding: '6px 8px', fontSize: '11.5px' }} />
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', fontWeight: 600, color: c.textMuted, cursor: 'pointer' }}>
                          <input type="checkbox" checked={!!sc.sembunyikanJudul}
                            onChange={e => onUbahSection(i, { sembunyikanJudul: e.target.checked })} style={{ cursor: 'pointer' }} />
                          Sembunyikan judul section di slide
                        </label>

                        {(def.opsi.includes('kartu-kpi') || def.opsi.includes('kartu-qshe')) && (() => {
                          const daftar = def.opsi.includes('kartu-kpi') ? KPI_ITEMS : QSHE_ITEMS;
                          const semuaKunci = daftar.map(d => d.key) as string[];
                          const aktif = sc.kartu?.length ? sc.kartu : semuaKunci;
                          return (
                            <div>
                              <span style={{ ...labelKecil, marginBottom: '4px' }}>Kartu yang Ditampilkan</span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {daftar.map(d => {
                                  const on = aktif.includes(d.key);
                                  return (
                                    <button key={d.key} className="sn-btn"
                                      onClick={() => {
                                        const baru = on ? aktif.filter(k => k !== d.key) : [...aktif, d.key];
                                        onUbahSection(i, { kartu: baru.length === 0 ? [] : baru });
                                      }}
                                      style={{
                                        padding: '4px 9px', borderRadius: 'var(--radius-full)', fontSize: '10.5px', fontWeight: 700,
                                        cursor: 'pointer', whiteSpace: 'nowrap',
                                        border: `1px solid ${on ? '#3b82f6' : c.border}`,
                                        background: on ? (dark ? 'rgba(59,130,246,0.18)' : '#eff6ff') : c.card,
                                        color: on ? '#3b82f6' : c.textSubtle,
                                      }}>
                                      {on ? '✓ ' : ''}{d.label}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {SECTION_POTRET[sc.key] && (
                          <label style={{
                            display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '11.5px',
                            fontWeight: 600, color: c.textMuted, cursor: 'pointer',
                            padding: '8px 9px', borderRadius: 'var(--radius-sm)',
                            background: sc.potret ? (dark ? 'rgba(139,92,246,0.12)' : '#f5f3ff') : 'transparent',
                            border: `1px solid ${sc.potret ? 'rgba(139,92,246,0.4)' : 'transparent'}`,
                          }}>
                            <input type="checkbox" checked={!!sc.potret}
                              onChange={e => onUbahSection(i, { potret: e.target.checked })}
                              style={{ cursor: 'pointer', marginTop: '2px' }} />
                            <span>
                              <b style={{ color: sc.potret ? '#8b5cf6' : c.text }}>Potret dari tampilan web</b>
                              <span style={{ display: 'block', fontSize: '10.5px', color: c.textSubtle, lineHeight: 1.45, marginTop: '2px' }}>
                                Slide memakai gambar tampilan web sehingga persis sama — tapi teksnya tidak bisa diedit di PowerPoint.
                              </span>
                            </span>
                          </label>
                        )}

                        {def.paginasi && !sc.potret && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '11.5px', fontWeight: 600, color: c.textMuted, cursor: 'pointer' }}>
                            <input type="checkbox" checked={!!sc.semuaData}
                              onChange={e => onUbahSection(i, { semuaData: e.target.checked })} style={{ cursor: 'pointer' }} />
                            Tampilkan seluruh data ({fNum(def.paginasi.total(ctx))} baris, lanjut ke slide berikutnya)
                          </label>
                        )}

                        {def.opsi.includes('maks-baris') && !sc.potret && (
                          <div>
                            <span style={{ ...labelKecil, marginBottom: '3px' }}>
                              Maksimal Baris {sc.maksBaris ? `(${sc.maksBaris})` : '(otomatis, sebanyak yang muat)'}
                            </span>
                            <input type="range" min={0} max={20} step={1} value={sc.maksBaris ?? 0}
                              onChange={e => onUbahSection(i, { maksBaris: Number(e.target.value) })}
                              style={{ width: '100%', cursor: 'pointer', accentColor: '#3b82f6' }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {cfg.sections.length === 0 && (
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', border: `1px dashed ${c.borderStrong}`, textAlign: 'center', fontSize: '11.5px', color: c.textMuted }}>
                  Slide masih kosong — tambahkan minimal satu section.
                </div>
              )}
            </div>
          </div>

          {/* Peringatan ruang: muncul begitu section tidak kebagian tempat */}
          {peringatan.length > 0 && (
            <div className="sn-fade-in" style={{
              padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: peringatan.some(p => p.parah)
                ? (dark ? 'rgba(220,38,38,0.10)' : '#fef2f2')
                : (dark ? 'rgba(217,119,6,0.10)' : '#fffbeb'),
              border: `1px solid ${peringatan.some(p => p.parah) ? 'rgba(220,38,38,0.35)' : 'rgba(217,119,6,0.35)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                <AlertTriangle style={{ width: '12px', height: '12px', color: peringatan.some(p => p.parah) ? '#dc2626' : '#d97706' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: peringatan.some(p => p.parah) ? '#dc2626' : '#d97706' }}>
                  {peringatan.some(p => p.parah) ? 'Slide terlalu padat' : 'Ruang pas-pasan'}
                </span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '15px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {peringatan.map(p => (
                  <li key={p.key} style={{ fontSize: '10.5px', color: c.textMuted, lineHeight: 1.45 }}>
                    <b style={{ color: c.text }}>{p.label}</b> {p.pesan}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tambah section */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setBukaTambah(v => !v)} disabled={penuh} className="sn-chip-btn"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center',
                padding: '9px', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700,
                border: `1.5px dashed ${penuh ? c.border : '#3b82f6'}`, background: 'transparent',
                color: penuh ? c.textSubtle : '#3b82f6', cursor: penuh ? 'not-allowed' : 'pointer',
              }}>
              <Plus style={{ width: '13px', height: '13px' }} />
              {penuh ? 'Maksimal 4 section per slide' : 'Tambah Section'}
            </button>
            {bukaTambah && !penuh && (
              <div className="sn-dropdown-enter sn-scroll" style={{
                position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '6px', zIndex: 20,
                maxHeight: '260px', overflowY: 'auto', background: c.card,
                border: `1px solid ${c.border}`, borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xl)', padding: '6px',
              }}>
                {GRUP.map(g => {
                  const item = tersedia.filter(s => s.grup === g);
                  if (item.length === 0) return null;
                  return (
                    <div key={g} style={{ marginBottom: '4px' }}>
                      <div style={{ fontSize: '9.5px', fontWeight: 800, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 8px 3px' }}>{g}</div>
                      {item.map(s => {
                        const muatSendiri = s.minTinggi > 2.2;
                        return (
                          <button key={s.key} className="sn-btn"
                            onClick={() => { onTambahSection(s.key); setBukaTambah(false); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%', textAlign: 'left', padding: '7px 9px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: c.text, fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                            <span style={{ flex: 1 }}>{s.label}</span>
                            <span style={{
                              fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: 'var(--radius-full)',
                              background: muatSendiri ? (dark ? 'rgba(217,119,6,0.16)' : '#fef3c7') : (dark ? 'rgba(16,185,129,0.14)' : '#ecfdf5'),
                              color: muatSendiri ? '#d97706' : '#059669', whiteSpace: 'nowrap',
                            }}>
                              {muatSendiri ? 'butuh slide sendiri' : 'bisa digabung'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Catatan slide */}
          <div>
            <span style={labelKecil}>Catatan (kosong = otomatis)</span>
            <textarea value={cfg.catatan} onChange={e => onUbah({ catatan: e.target.value })} rows={3}
              placeholder={catatanOtomatis || 'Catatan akan muncul di bawah slide dan di speaker notes'}
              className="sn-input" style={{ ...inputStyle, resize: 'vertical', fontWeight: 500, lineHeight: 1.5 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════ Pratinjau slide di layar ═══════════
const SlidePreview: React.FC<{
  cfg: SlideCfg; ctx: Ctx; c: Theme; dark: boolean; periodeLengkap: string; catatan: string;
}> = ({ cfg, ctx, c, periodeLengkap, catatan }) => {
  const gaya: React.CSSProperties = {
    aspectRatio: '16 / 9', background: cfg.gaya === 'papan' ? '#f8fafc' : '#ffffff', borderRadius: 'var(--radius-md)',
    border: `1px solid ${c.border}`, boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
    display: 'flex', flexDirection: 'column', color: '#0f172a',
  };
  const kotak = cfg.sections.length > 0
    ? bagiArea(cfg.sections.length, cfg.tataLetak, { x: 0, y: 0, w: 100, h: 100 })
    : [];

  return (
    <div style={gaya}>
      {cfg.gaya === 'papan' ? (
        <div style={{ background: '#fff', padding: '7px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
          <span style={{ color: '#94a3b8', fontSize: '6.5px', fontWeight: 700, flexShrink: 0 }}>WKI</span>
          <span style={{ color: '#155e75', fontWeight: 800, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cfg.judul || 'Tanpa judul'}</span>
          <span style={{ color: '#94a3b8', fontSize: '6.5px', fontWeight: 700, flexShrink: 0 }}>{periodeLengkap}</span>
        </div>
      ) : (
        <div style={{ background: '#1e293b', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #3b82f6', flexShrink: 0 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cfg.judul || 'Tanpa judul'}</span>
          <span style={{ color: '#cbd5e1', fontSize: '7.5px', flexShrink: 0, marginLeft: '6px' }}>{periodeLengkap}</span>
        </div>
      )}
      <div style={{ flex: 1, position: 'relative', padding: '5px' }}>
        {cfg.sections.length === 0 && (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '10px' }}>
            Slide kosong
          </div>
        )}
        {cfg.sections.map((sc, i) => {
          const a = kotak[i];
          return (
            <div key={`${sc.key}-${i}`} style={{
              position: 'absolute',
              left: `${a.x}%`, top: `${a.y}%`, width: `${a.w}%`, height: `${a.h}%`,
              padding: '4px', overflow: 'hidden',
            }}>
              <PreviewSection cfg={sc} ctx={ctx} />
              {sc.potret && (
                <div style={{
                  position: 'absolute', right: '5px', top: '5px', zIndex: 2,
                  background: '#8b5cf6', color: '#fff', fontSize: '6px', fontWeight: 800,
                  padding: '1px 5px', borderRadius: '999px', letterSpacing: '0.03em',
                }}>POTRET WEB</div>
              )}
            </div>
          );
        })}
      </div>
      {catatan && (
        <div style={{ background: '#eff6ff', borderTop: '1px solid #bfdbfe', padding: '4px 8px', flexShrink: 0 }}>
          <span style={{ fontSize: '7px', color: '#334155', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            <b style={{ color: '#1d4ed8' }}>Catatan: </b>{catatan}
          </span>
        </div>
      )}
    </div>
  );
};

/** Isi ringkas tiap section untuk pratinjau layar */
const PreviewSection: React.FC<{ cfg: SectionCfg; ctx: Ctx }> = ({ cfg, ctx }) => {
  const sectionKey = cfg.key;
  const def = SECTION_MAP.get(sectionKey)!;
  const maks = cfg.maksBaris && cfg.maksBaris > 0 ? Math.min(cfg.maksBaris, 5) : 5;
  const judul = cfg.sembunyikanJudul ? null : (
    <div style={{ fontSize: '7.5px', fontWeight: 800, color: '#0f172a', marginBottom: '2px', borderBottom: '1.5px solid #3b82f6', paddingBottom: '1px', display: 'inline-block' }}>
      {cfg.judul?.trim() || def.label}
    </div>
  );
  const sel: React.CSSProperties = { padding: '1px 3px', fontSize: '6px', borderBottom: '1px solid #e2e8f0' };
  const kepala: React.CSSProperties = { ...sel, background: '#1e293b', color: '#fff', fontWeight: 700 };

  const tabel = (header: string[], baris: (string | { t: string; c?: string })[][], batas = maks) => (
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <thead><tr>{header.map((h, i) => <th key={i} style={{ ...kepala, textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>)}</tr></thead>
      <tbody>
        {baris.slice(0, batas).map((r, i) => (
          <tr key={i}>{r.map((v, j) => {
            const teks = typeof v === 'string' ? v : v.t;
            const warna = typeof v === 'string' ? '#334155' : (v.c ?? '#334155');
            return <td key={j} style={{ ...sel, textAlign: j === 0 ? 'left' : 'right', color: warna, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{teks}</td>;
          })}</tr>
        ))}
      </tbody>
    </table>
  );

  const grafikPalsu = (warna: string[]) => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '2px', padding: '2px 0' }}>
      {[38, 55, 42, 68, 50, 75, 60, 82].map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h}%`, background: warna[i % warna.length], borderRadius: '1px 1px 0 0', opacity: 0.85 }} />
      ))}
    </div>
  );

  const isiSection = () => {
    switch (sectionKey) {
      case 'kpi': {
        const semua: Record<string, [string, string]> = {
          nkb: ['NKB', fShort(ctx.nkb.realisasi)],
          pu: ['PU', fShort(ctx.kum.puReal)],
          bkpu: ['BK/PU', fPct(ctx.kum.bkPuRealPct)],
          laba: ['LABA', fShort(ctx.kum.labaReal)],
          qshe: ['QSHE', ctx.kum.qsheRataRata > 0 ? ctx.kum.qsheRataRata.toFixed(1) : '—'],
        };
        const pilih = cfg.kartu?.length ? cfg.kartu : KPI_ITEMS.map(k => k.key as string);
        const kartu = pilih.map(k => semua[k]).filter(Boolean);
        return (
          <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
            {kartu.map(([l, v]) => (
              <div key={l} style={{ flex: 1, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '2px', padding: '2px', minWidth: 0 }}>
                <div style={{ fontSize: '5px', fontWeight: 700, color: '#64748b' }}>{l}</div>
                <div style={{ fontSize: '7.5px', fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</div>
              </div>
            ))}
          </div>
        );
      }
      case 'kinerja': {
        const k = ctx.kum;
        return tabel(['Uraian', 'RKAP', 'Real', '%'], [
          ['PU', fShort(k.puRkap), fShort(k.puReal), { t: fPct(pctOf(k.puReal, k.puRkap)), c: pctOf(k.puReal, k.puRkap) >= 100 ? '#16a34a' : '#dc2626' }],
          ['BK', fShort(k.bkRkap), fShort(k.bkReal), fPct(pctOf(k.bkReal, k.bkRkap))],
          ['BK/PU', fPct(k.bkPuRkapSd), fPct(k.bkPuRealPct), { t: fPct(pctOf(k.bkPuRealPct, k.bkPuRkapSd)), c: k.bkPuRealPct <= k.bkPuRkapSd ? '#16a34a' : '#dc2626' }],
          ['Laba', fShort(k.labaRkap), fShort(k.labaReal), fPct(pctOf(k.labaReal, k.labaRkap))],
        ]);
      }
      case 'tren-kum': case 'tren-bln': case 'db-historis':
        return grafikPalsu(['#3b82f6']);
      case 'eval-revenue':
        return grafikPalsu(['#f97316', '#1e3a8a']);
      case 'yoy-revenue':
        return grafikPalsu(['#dc2626', '#1e3a8a']);
      case 'eval-gpm': case 'yoy-gpm':
        return grafikPalsu(['#1e3a8a']);
      case 'qshe-tren':
        return grafikPalsu(['#8b5cf6']);
      case 'peta':
        return grafikPalsu(['#3b82f6']);
      case 'db-inteks': {
        const tot = ctx.analitik.intPu + ctx.analitik.eksPu;
        const pct = tot > 0 ? (ctx.analitik.intPu / tot) * 100 : 0;
        return (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `conic-gradient(#3b82f6 0 ${pct}%, #10b981 ${pct}% 100%)`, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '11px', borderRadius: '50%', background: '#fff' }} />
            </div>
            <div style={{ fontSize: '6px', color: '#64748b' }}>Internal {pct.toFixed(0)}%</div>
          </div>
        );
      }
      case 'top5':
        return tabel(['Proyek', 'RKAP', 'Deviasi'],
          [...ctx.proyek].filter(p => p.deviasiPu < 0).sort((a, b) => a.deviasiPu - b.deviasiPu).slice(0, 5)
            .map(r => [r.nama, fShort(r.puRkap), { t: fShort(r.deviasiPu), c: '#dc2626' }]));
      case 'matrix':
        return tabel(['Proyek', 'Progress', 'BK/PU', 'Stok', 'Tagihan', 'Status'],
          ctx.matrix.slice(0, 5).map(r => [
            r.nama,
            { t: `${r.deviasiProgress >= 0 ? '+' : ''}${r.deviasiProgress.toFixed(1)}%`, c: r.deviasiProgress < 0 ? '#dc2626' : '#16a34a' },
            { t: `${r.deviasiBkPu > 0 ? '+' : ''}${r.deviasiBkPu.toFixed(1)}%`, c: r.deviasiBkPu > 0 ? '#dc2626' : '#16a34a' },
            r.stok !== 0 ? fShort(r.stok) : '–',
            r.tagihan !== 0 ? fShort(r.tagihan) : '–',
            { t: r.status === 'Extra Attention' ? 'EXTRA' : r.status, c: r.status === 'Extra Attention' ? '#dc2626' : r.status === 'Attention' ? '#d97706' : '#16a34a' },
          ]));
      case 'breakdown':
        return tabel(['Proyek', 'PU', 'BK/PU', 'Laba'],
          [...ctx.proyek].sort((a, b) => b.puReal - a.puReal).slice(0, 5).map(r => [
            r.nama, fShort(r.puReal), r.bkPu > 0 ? `${r.bkPu.toFixed(1)}%` : '—',
            { t: fShort(r.labaReal), c: r.labaReal < 0 ? '#dc2626' : '#16a34a' },
          ]));
      case 'db-pemberi':
        return tabel(['Pemberi Kerja', 'PU'],
          ctx.analitik.topPk.slice(0, 5).map(p => [p.nama, fShort(p.pu)]));
      case 'db-tabel':
        return tabel(['Proyek', 'Segmen', 'NK', 'PU', 'BK/PU', 'Status'],
          ctx.dbProyek.slice(0, 5).map(p => [
            p.nama, p.seg, fShort(p.nk), fShort(p.pu),
            p.bkPu > 0 ? `${p.bkPu.toFixed(1)}%` : '—', p.status,
          ]));
      case 'peta-tabel':
        return tabel(['Provinsi', 'Proyek', 'PU'],
          ctx.provinsi.slice(0, 5).map(p => [p.nama, String(p.count), fShort(p.pu)]));
      case 'qshe-kartu': {
        const nilai: Record<string, [string, number]> = {
          qshe: ['QSHE', ctx.kum.qsheRataRata], she: ['SHE', ctx.kum.sheRataRata], quality: ['Quality', ctx.kum.qualityRataRata],
        };
        const pilihQ = cfg.kartu?.length ? cfg.kartu : QSHE_ITEMS.map(k => k.key as string);
        const kartu = pilihQ.map(k => nilai[k]).filter(Boolean);
        return (
          <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
            {kartu.map(([l, v]) => (
              <div key={l} style={{ flex: 1, background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '2px', padding: '3px' }}>
                <div style={{ fontSize: '5.5px', fontWeight: 700, color: '#64748b' }}>{l}</div>
                <div style={{ fontSize: '9px', fontWeight: 800, color: v > 0 ? (ctx.kum.qsheTarget > 0 && v >= ctx.kum.qsheTarget ? '#16a34a' : '#dc2626') : '#94a3b8' }}>
                  {v > 0 ? v.toFixed(1) : '—'}
                </div>
              </div>
            ))}
          </div>
        );
      }
      case 'qshe-unit': case 'qshe-unit-kartu':
        return tabel(['Unit', 'SHE', 'Quality', 'QSHE'],
          ctx.qsheUnit.slice(0, 5).map(u => [
            u.nama, u.she > 0 ? u.she.toFixed(1) : '—', u.quality > 0 ? u.quality.toFixed(1) : '—',
            { t: u.qshe.toFixed(1), c: ctx.kum.qsheTarget > 0 && u.qshe < ctx.kum.qsheTarget ? '#dc2626' : '#16a34a' },
          ]));
      default:
        return null;
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {judul}
      {isiSection()}
    </div>
  );
};

export default React.memo(PaparanView);
