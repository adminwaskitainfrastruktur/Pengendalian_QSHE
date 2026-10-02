import React, { useState, useEffect, useMemo, startTransition, lazy, Suspense } from 'react';
import * as XLSX from 'xlsx';
import { useMsal } from '@azure/msal-react';
import {
  Search, LayoutDashboard, FileSpreadsheet, ChevronRight,
  Sun, Moon, Menu, X, AlertCircle, LogOut, ShieldCheck, Target,
  RefreshCw, Briefcase, Mail, Building2, MapPin, Phone, ChevronUp,
} from 'lucide-react';
import { THEME, DEFAULT_FILTERS, CURRENCY_SCALE } from '../constants';
import type { Theme } from '../constants';
import type {
  UnifiedProjectData, NkbTrendPoint, YoyDataPoint,
  KumulatifFinancials, View, Filters, SortKey, SortDir,
  AllProyekRow, AnnualFinancialPoint, HistoriBulanan,
} from '../types';
import {
  parseCoordinate, validateAndFixLatLng, isOverheadId,
  normalizeProvinsi, parseMappPct, isValidCityText, isDikecualikan,
} from '../utils';
import { useSharePointFile } from '../useSharePointFile';
import { loginRequest, graphConfig } from './Auth';
import FilterBar from './FilterBar';
import OverviewView from './views/OverviewView';
import ProjectPerformanceView from './views/ProjectPerformanceView';
import { KUADRAN_INFO } from './views/ppiData';
import type { Kuadran } from './views/ppiData';
import QshePanel from './views/QshePanel';

// Lazy: tabel database & paparan hanya dimuat saat menunya dibuka (kurangi bundle awal)
const MasterView = lazy(() => import('./views/MasterView'));
const PaparanView = lazy(() => import('./views/PaparanView'));

const NAV_ITEMS = [
  { id: 'overview', Icon: LayoutDashboard, label: 'Dashboard Kinerja', color: '#3b82f6' },
  { id: 'project_performance', Icon: Target, label: 'Project Performance', color: '#0ea5e9' },
  { id: 'qshe', Icon: ShieldCheck, label: 'Kinerja QSHE', color: '#8b5cf6' },
  { id: 'master_data', Icon: FileSpreadsheet, label: 'Database All Proyek', color: '#6366f1' },
  // Menu Paparan (PPT) disembunyikan sementara — view & kodenya tetap ada,
  // tinggal buka kembali baris ini bila sudah siap dirilis
  // { id: 'paparan', Icon: Presentation, label: 'Paparan (PPT)', color: '#f59e0b' },
] as const;

const MONTH_ORDER = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const SEG_QSHE_ONLY = ['AMP', 'Workshop'];

interface Props {
  setIsLoading: (v: boolean) => void;
  triggerTransition: (cb: () => void, color?: string) => void;
  dashboardKey: number;
}

interface GraphProfile {
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  mobilePhone?: string;
  businessPhones?: string[];
}

const DashboardApp: React.FC<Props> = ({ triggerTransition, dashboardKey }) => {
  const { instance, accounts } = useMsal();
  const { fetchFile } = useSharePointFile();

  const [db, setDb] = useState<UnifiedProjectData[]>([]);
  const [allProyek, setAllProyek] = useState<AllProyekRow[]>([]);
  const [nkbKumulatif, setNkbKumulatif] = useState<NkbTrendPoint[]>([]);
  const [yoyData, setYoyData] = useState<YoyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadText, setLoadText] = useState('Menghidupkan sistem…');
  const [err, setErr] = useState('');
  const [view, setView] = useState<View>('overview');
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  // Filter & pencarian disimpan PER MENU: pindah menu tidak membawa filter menu
  // sebelumnya. Tiap menu punya salinan sendiri yang tetap tersimpan saat ditinggal.
  const [filterPerView, setFilterPerView] = useState<Record<View, Filters>>(() => ({
    overview: DEFAULT_FILTERS, project_performance: DEFAULT_FILTERS,
    qshe: DEFAULT_FILTERS, master_data: DEFAULT_FILTERS, paparan: DEFAULT_FILTERS,
  }));
  const [searchPerView, setSearchPerView] = useState<Record<View, string>>(() => ({
    overview: '', project_performance: '', qshe: '', master_data: '', paparan: '',
  }));
  const filters = filterPerView[view];
  const search = searchPerView[view];
  const setFilters = React.useCallback((f: Filters | ((p: Filters) => Filters)) =>
    setFilterPerView(prev => ({
      ...prev, [view]: typeof f === 'function' ? (f as (p: Filters) => Filters)(prev[view]) : f,
    })), [view]);
  const setSearch = React.useCallback((v: string) =>
    setSearchPerView(prev => ({ ...prev, [view]: v })), [view]);
  const [searchDebounced, setSearchDebounced] = useState('');

  // Filter kuadran khusus menu Project Performance
  const [kuadranFilter, setKuadranFilter] = useState<Kuadran | null>(null);
  const [statKuadran, setStatKuadran] = useState<Record<Kuadran, number>>({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const [sortKey] = useState<SortKey>('pu_rkap');
  const [sortDir] = useState<SortDir>('desc');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [tahunOptions, setTahunOptions] = useState<number[]>([]);
  const [userOpen, setUserOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<GraphProfile | null>(null);
  const [userProfileLoading, setUserProfileLoading] = useState(false);

  const account = accounts[0];
  const searchRef = React.useRef<HTMLInputElement>(null);

  // Ctrl+K / Cmd+K fokus ke pencarian, Escape mengosongkan lalu keluar fokus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === 'Escape') {
        if (document.activeElement === searchRef.current) {
          setSearch('');
          searchRef.current?.blur();
        } else {
          setOpen(false);
          setUserOpen(false);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Transisi warna hanya diaktifkan sesaat ketika tema diganti — transisi permanen
  // di semua elemen membuat seluruh halaman terasa berat
  const toggleDark = () => {
    document.documentElement.classList.add('theme-transition');
    setDark(d => !d);
    window.setTimeout(() => document.documentElement.classList.remove('theme-transition'), 420);
  };

  // Info lengkap pengguna dari Microsoft Graph /me, diambil sekali saat kartu dibuka
  const toggleUserInfo = () => {
    setUserOpen(o => !o);
    if (userProfile || userProfileLoading || !account) return;
    setUserProfileLoading(true);
    (async () => {
      try {
        const result = await instance.acquireTokenSilent({ ...loginRequest, account });
        const res = await fetch(
          `${graphConfig.graphEndpoint}/me?$select=displayName,mail,userPrincipalName,jobTitle,department,officeLocation,mobilePhone,businessPhones`,
          { headers: { Authorization: `Bearer ${result.accessToken}` } },
        );
        setUserProfile(res.ok ? await res.json() : {});
      } catch {
        setUserProfile({});
      } finally {
        setUserProfileLoading(false);
      }
    })();
  };

  const loadData = async (forceRefresh = false) => {
    try {
      setLoadText('Menghubungkan ke SharePoint…');
      const { buffer, fromCache, lastModifiedDateTime } = await fetchFile(forceRefresh);
      setLastUpdated(lastModifiedDateTime);
      setLoadText(fromCache ? 'Memuat data dari cache…' : 'Membaca data dari SharePoint…');
      const wb = XLSX.read(buffer, { type: 'array' });

      setLoadText('Mining data proyek…');
      if (!wb.SheetNames.includes('Data based RKAP_value'))
        throw new Error('Sheet "Data based RKAP_value" tidak ditemukan.');

      const sheetProyek = wb.Sheets['Data based RKAP_value'];
      const rows = XLSX.utils.sheet_to_json<any[]>(sheetProyek, { header: 1 });
      const headerRowIndex = 2;
      const header = rows[headerRowIndex] || [];
      const getColIdx = (label: string) =>
        header.findIndex(cell => String(cell).trim().toLowerCase() === label.toLowerCase());

      const idx = {
        periode: getColIdx('periode'),
        tahun: getColIdx('tahun'),
        bulan: getColIdx('bulan'),
        bulanIndex: getColIdx('bulan_index'),
        idProject: getColIdx('id_project'),
        snkNkb: getColIdx('SNK_NKB'),
        segmentasi: getColIdx('Segmentasi'),
        projectName: getColIdx('project_name'),
        nkRkap: getColIdx('nk_rkap'),
        puRkapParsial: getColIdx('pu_rkap_parsial'),
        puRealParsial: getColIdx('pu_real_parsial'),
        bkRkapParsial: getColIdx('bk_rkap_parsial'),
        bkRealParsial: getColIdx('bk_real_parsial'),
        labaRkapParsial: getColIdx('Laba_rkap_parsial'),
        labaRealParsial: getColIdx('Laba_real_parsial'),
        deviasiPu: getColIdx('Deviasi_pu'),
        deviasiLaba: getColIdx('Deviasi_laba'),
        bkPuMapp: getColIdx('BK/PU MAPP'),
        deviasiBkPuBaseline: getColIdx('Deviasi BK/PU'),
        progressRealisasi: getColIdx('Progress Realisasi'),
        progressRencana: getColIdx('Progress Rencana'),
        deviasiProgress: getColIdx('Deviasi Progress'),
        stock: getColIdx('Stock'),
        stock90: getColIdx('Stock >90 Hari'),
        stock180: getColIdx('Stock >180 Hari'),
        bkd: getColIdx('BKD'),
        wipBk: getColIdx('WIP BK'),
        tagihanBruto: getColIdx('Total Tagihan Bruto'),
        // Label header umur tagihan pernah berganti (>60 vs >90 hari) — coba keduanya
        tagihanBruto90: (() => {
          const a = getColIdx('Tagihan Bruto >90 Hari');
          return a !== -1 ? a : getColIdx('Tagihan Bruto >60 Hari');
        })(),
        bkPuRealKum: getColIdx('BK/PU Realisasi Kumulatif'),
        tagihanBruto180: getColIdx('Tagihan Bruto >180 Hari'),
        latitude: getColIdx('Latitude'),
        longitude: getColIdx('Longitude'),
        kinerjaQshe: getColIdx('Kinerja QSHE'),
        kinerjaShe: getColIdx('Kinerja SHE'),
        kinerjaQuality: getColIdx('Kinerja Quality'),
        // Target QSHE di kolom AM (index 38): dicari via nama header dulu,
        // fallback ke posisi tetap karena headernya bisa belum diberi nama
        targetQshe: (() => {
          const byName = getColIdx('Target QSHE');
          return byName !== -1 ? byName : 38;
        })(),
      };

      if (idx.idProject === -1 || idx.puRkapParsial === -1 || idx.puRealParsial === -1)
        throw new Error('Kolom penting tidak ditemukan di sheet "Data based RKAP_value".');
      if (idx.tahun === -1 || idx.bulanIndex === -1)
        throw new Error('Kolom "tahun" / "bulan_index" tidak ditemukan.');

      type ProyekAgg = {
        project_name: string; segmentasi: string; snk_nkb: string;
        totalRkap: number; totalReal: number;
        totalBkRkap: number; totalBkReal: number;
        totalLabaRkap: number; totalLabaReal: number;
        totalDeviasiPu: number; totalDeviasiLaba: number;
        nilaiKontrak: number; bkPuMapp: number; deviasiBkPuBaseline: number;
        lat: number; lng: number; coordBermasalah: boolean;
        progressTerakhir: number; bulanTerakhir: number;
        progressRencanaTerakhir: number; deviasiProgressTerakhir: number;
        progTahun: number; progBulan: number;
        stockTerakhir: number; stock90Terakhir: number; stock180Terakhir: number;
        bkdTerakhir: number; wipBkTerakhir: number;
        tagihanTerakhir: number; tagihan90Terakhir: number; tagihan180Terakhir: number;
        neracaTahun: number; neracaBulan: number;
        bkPuRealKumTerakhir: number;
        tahunTerakhir: number; periodeTerakhir: string;
        qsheLatest: number; sheLatest: number; qualityLatest: number;
        historiBulanan: Map<string, HistoriBulanan>;
      };

      const proyekMap: Map<string, ProyekAgg> = new Map();
      const trendMap: Map<string, { tahun: number; bulanIndex: number; target: number; realisasi: number; month: string }> = new Map();
      const tahunSet = new Set<number>();
      const numOrZero = (v: any): number => { const n = Number(v); return isNaN(n) ? 0 : n; };

      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[idx.idProject]) continue;
        const id = String(row[idx.idProject]).trim();
        if (!id) continue;

        const projectName = idx.projectName !== -1 ? String(row[idx.projectName] || id).trim() : id;
        const segmentasi = idx.segmentasi !== -1 ? String(row[idx.segmentasi] || 'Tidak Diketahui').trim() : 'Tidak Diketahui';
        const snkNkb = idx.snkNkb !== -1 ? String(row[idx.snkNkb] || '').trim() : '';
        const tahun = Number(row[idx.tahun]) || 0;
        const bulanIndex = idx.bulanIndex !== -1 ? Number(row[idx.bulanIndex]) || 0 : 0;
        const bulanLabel = idx.bulan !== -1 ? String(row[idx.bulan] || `Bulan ${bulanIndex}`).trim() : `Bulan ${bulanIndex}`;

        const rkap = numOrZero(row[idx.puRkapParsial]) * CURRENCY_SCALE;
        const real = numOrZero(row[idx.puRealParsial]) * CURRENCY_SCALE;
        const bkRkap = idx.bkRkapParsial !== -1 ? numOrZero(row[idx.bkRkapParsial]) * CURRENCY_SCALE : 0;
        const bkReal = idx.bkRealParsial !== -1 ? numOrZero(row[idx.bkRealParsial]) * CURRENCY_SCALE : 0;
        const labaRkap = idx.labaRkapParsial !== -1 ? numOrZero(row[idx.labaRkapParsial]) * CURRENCY_SCALE : 0;
        const labaReal = idx.labaRealParsial !== -1 ? numOrZero(row[idx.labaRealParsial]) * CURRENCY_SCALE : 0;
        const deviasiPuBulan = idx.deviasiPu !== -1 ? numOrZero(row[idx.deviasiPu]) * CURRENCY_SCALE : 0;
        const deviasiLabaBulan = idx.deviasiLaba !== -1 ? numOrZero(row[idx.deviasiLaba]) * CURRENCY_SCALE : 0;
        const qshe = idx.kinerjaQshe !== -1 ? numOrZero(row[idx.kinerjaQshe]) : 0;
        const she = idx.kinerjaShe !== -1 ? numOrZero(row[idx.kinerjaShe]) : 0;
        const quality = idx.kinerjaQuality !== -1 ? numOrZero(row[idx.kinerjaQuality]) : 0;
        const qsheTarget = numOrZero(row[idx.targetQshe]);

        const nkRkapVal = (() => { const v = idx.nkRkap !== -1 ? row[idx.nkRkap] : null; return (v != null && v !== '') ? numOrZero(v) * CURRENCY_SCALE : null; })();
        const bkPuMappVal = (() => { const v = idx.bkPuMapp !== -1 ? row[idx.bkPuMapp] : null; return (v != null && v !== '') ? numOrZero(v) : null; })();
        const deviasiBkPuVal = (() => { const v = idx.deviasiBkPuBaseline !== -1 ? row[idx.deviasiBkPuBaseline] : null; return (v != null && v !== '') ? numOrZero(v) : null; })();

        let lat = 0, lng = 0, coordProblem = false;
        if (idx.latitude !== -1 && idx.longitude !== -1) {
          const { value: latVal, bermasalah: latProb } = parseCoordinate(row[idx.latitude]);
          const { value: lngVal, bermasalah: lngProb } = parseCoordinate(row[idx.longitude]);
          const fixed = validateAndFixLatLng(latVal, lngVal, latProb, lngProb);
          lat = fixed.lat; lng = fixed.lng; coordProblem = fixed.bermasalah;
        }

        let progress = 0;
        if (idx.progressRealisasi !== -1) { const val = Number(row[idx.progressRealisasi]); if (!isNaN(val)) progress = val; }

        const progressRencanaVal = idx.progressRencana !== -1 ? numOrZero(row[idx.progressRencana]) : 0;
        const deviasiProgressVal = idx.deviasiProgress !== -1 ? numOrZero(row[idx.deviasiProgress]) : 0;
        const stockVal = idx.stock !== -1 ? numOrZero(row[idx.stock]) * CURRENCY_SCALE : 0;
        const stock90Val = idx.stock90 !== -1 ? numOrZero(row[idx.stock90]) * CURRENCY_SCALE : 0;
        const stock180Val = idx.stock180 !== -1 ? numOrZero(row[idx.stock180]) * CURRENCY_SCALE : 0;
        const bkdVal = idx.bkd !== -1 ? numOrZero(row[idx.bkd]) * CURRENCY_SCALE : 0;
        const wipBkVal = idx.wipBk !== -1 ? numOrZero(row[idx.wipBk]) * CURRENCY_SCALE : 0;
        const tagihanVal = idx.tagihanBruto !== -1 ? numOrZero(row[idx.tagihanBruto]) * CURRENCY_SCALE : 0;
        const tagihan90Val = idx.tagihanBruto90 !== -1 ? numOrZero(row[idx.tagihanBruto90]) * CURRENCY_SCALE : 0;
        const tagihan180Val = idx.tagihanBruto180 !== -1 ? numOrZero(row[idx.tagihanBruto180]) * CURRENCY_SCALE : 0;
        const bkPuRealKumVal = idx.bkPuRealKum !== -1 ? numOrZero(row[idx.bkPuRealKum]) : 0;

        // Baris RKAP tersedia sampai Desember, tapi kolom progres & neraca hanya
        // terisi s.d. bulan berjalan — deteksi sel benar-benar berisi supaya nilai
        // diambil dari bulan terakhir YANG ADA DATANYA, bukan baris kosong Desember
        const terisi = (ci: number) => ci !== -1 && row[ci] != null && row[ci] !== '';
        const progAda = terisi(idx.progressRencana) || terisi(idx.progressRealisasi) || terisi(idx.deviasiProgress);
        const neracaAda = terisi(idx.stock) || terisi(idx.stock90) || terisi(idx.stock180) || terisi(idx.bkd) || terisi(idx.wipBk)
          || terisi(idx.tagihanBruto) || terisi(idx.tagihanBruto90) || terisi(idx.tagihanBruto180);

        if (tahun > 0) tahunSet.add(tahun);

        if (!proyekMap.has(id)) {
          proyekMap.set(id, {
            project_name: projectName, segmentasi, snk_nkb: snkNkb,
            totalRkap: 0, totalReal: 0, totalBkRkap: 0, totalBkReal: 0,
            totalLabaRkap: 0, totalLabaReal: 0, totalDeviasiPu: 0, totalDeviasiLaba: 0,
            nilaiKontrak: 0, bkPuMapp: 0, deviasiBkPuBaseline: 0,
            lat, lng, coordBermasalah: coordProblem,
            progressTerakhir: 0, bulanTerakhir: bulanIndex,
            progressRencanaTerakhir: 0, deviasiProgressTerakhir: 0,
            progTahun: 0, progBulan: 0,
            stockTerakhir: 0, stock90Terakhir: 0, stock180Terakhir: 0,
            bkdTerakhir: 0, wipBkTerakhir: 0,
            tagihanTerakhir: 0, tagihan90Terakhir: 0, tagihan180Terakhir: 0,
            neracaTahun: 0, neracaBulan: 0,
            bkPuRealKumTerakhir: bkPuRealKumVal,
            tahunTerakhir: tahun,
            periodeTerakhir: idx.periode !== -1 ? String(row[idx.periode] || '') : '',
            qsheLatest: 0, sheLatest: 0, qualityLatest: 0,
            historiBulanan: new Map(),
          });
        }

        const ex = proyekMap.get(id)!;
        ex.totalRkap += rkap; ex.totalReal += real;
        ex.totalBkRkap += bkRkap; ex.totalBkReal += bkReal;
        ex.totalLabaRkap += labaRkap; ex.totalLabaReal += labaReal;
        ex.totalDeviasiPu += deviasiPuBulan; ex.totalDeviasiLaba += deviasiLabaBulan;
        if (ex.nilaiKontrak === 0 && nkRkapVal !== null) ex.nilaiKontrak = nkRkapVal;
        if (ex.bkPuMapp === 0 && bkPuMappVal !== null) ex.bkPuMapp = bkPuMappVal;
        if (ex.deviasiBkPuBaseline === 0 && deviasiBkPuVal !== null) ex.deviasiBkPuBaseline = deviasiBkPuVal;
        if (ex.coordBermasalah && !coordProblem && lat !== 0 && lng !== 0) {
          ex.lat = lat; ex.lng = lng; ex.coordBermasalah = false;
        }
        // Kelompok progres (AB/AC/AD): ambil dari bulan terbaru yang terisi
        if (progAda && (tahun > ex.progTahun || (tahun === ex.progTahun && bulanIndex > ex.progBulan))) {
          ex.progressTerakhir = progress;
          ex.progressRencanaTerakhir = progressRencanaVal; ex.deviasiProgressTerakhir = deviasiProgressVal;
          ex.progTahun = tahun; ex.progBulan = bulanIndex;
        }
        // Kelompok neraca (AN–AS): ambil dari bulan terbaru yang terisi
        if (neracaAda && (tahun > ex.neracaTahun || (tahun === ex.neracaTahun && bulanIndex > ex.neracaBulan))) {
          ex.stockTerakhir = stockVal; ex.stock90Terakhir = stock90Val; ex.stock180Terakhir = stock180Val;
          ex.bkdTerakhir = bkdVal; ex.wipBkTerakhir = wipBkVal;
          ex.tagihanTerakhir = tagihanVal; ex.tagihan90Terakhir = tagihan90Val; ex.tagihan180Terakhir = tagihan180Val;
          ex.neracaTahun = tahun; ex.neracaBulan = bulanIndex;
        }
        const lebihBaru = tahun > ex.tahunTerakhir || (tahun === ex.tahunTerakhir && bulanIndex > ex.bulanTerakhir);
        if (lebihBaru) {
          ex.bulanTerakhir = bulanIndex;
          ex.bkPuRealKumTerakhir = bkPuRealKumVal;
          ex.tahunTerakhir = tahun;
          ex.periodeTerakhir = idx.periode !== -1 ? String(row[idx.periode] || '') : '';
          if (qshe > 0) ex.qsheLatest = qshe;
          if (she > 0) ex.sheLatest = she;
          if (quality > 0) ex.qualityLatest = quality;
        }

        ex.historiBulanan.set(`${tahun}-${bulanIndex}`, {
          tahun, bulanIndex, bulan: bulanLabel, rkap, real, bkRkap, bkReal, labaRkap, labaReal, progress, qshe, she, quality, qsheTarget,
          // Nilai posisi per bulan agar filter bulan/tahun ikut menggerakkan PPI
          progressRencana: progressRencanaVal, deviasiProgress: deviasiProgressVal,
          bkPuMapp: bkPuMappVal ?? 0, bkPuRealKum: bkPuRealKumVal, deviasiBkPu: deviasiBkPuVal ?? 0,
          stock: stockVal, stock90: stock90Val, stock180: stock180Val,
          bkd: bkdVal, wipBk: wipBkVal,
          tagihan: tagihanVal, tagihan90: tagihan90Val, tagihan180: tagihan180Val,
        });

        if (tahun > 0 && bulanIndex > 0) {
          const tk = `${tahun}-${bulanIndex}`;
          if (!trendMap.has(tk)) trendMap.set(tk, { tahun, bulanIndex, target: 0, realisasi: 0, month: bulanLabel });
          const t = trendMap.get(tk)!;
          t.target += rkap; t.realisasi += real;
        }
      }

      const unified: UnifiedProjectData[] = [];
      for (const [id, d] of proyekMap) {
        const pct = d.totalRkap > 0 ? (d.totalReal / d.totalRkap) * 100 : 0;
        const sehat: 'Sehat' | 'Perhatian' | 'Kritis' = pct >= 85 ? 'Sehat' : pct < 60 ? 'Kritis' : 'Perhatian';
        const overhead = isOverheadId(id);
        const fc = validateAndFixLatLng(d.lat, d.lng, d.coordBermasalah, d.coordBermasalah);
        unified.push({
          id_project: id, project_name: d.project_name,
          periode: d.periodeTerakhir || '', tahun: d.tahunTerakhir, bulan_index: d.bulanTerakhir,
          pu_rkap: d.totalRkap, pu_real: d.totalReal,
          segmentasi: d.segmentasi || (overhead ? 'Non-Proyek' : 'Tidak Diketahui'),
          klien: d.snk_nkb || 'Tidak Diketahui',
          nilai_kontrak: d.nilaiKontrak, nilai_proyek: d.nilaiKontrak,
          bk_rkap: d.totalBkRkap, bk_real: d.totalBkReal,
          laba_rkap: d.totalLabaRkap, laba_real: d.totalLabaReal,
          deviasi_pu: d.totalDeviasiPu, deviasi_laba: d.totalDeviasiLaba,
          bk_pu_ratio: d.totalReal > 0 ? d.totalBkReal / d.totalReal : 0,
          bk_pu_ratio_rkap: d.totalRkap > 0 ? d.totalBkRkap / d.totalRkap : 0,
          pct_laba_terhadap_rkap: d.totalLabaRkap !== 0 ? d.totalLabaReal / d.totalLabaRkap : 0,
          bk_pu_mapp: d.bkPuMapp, deviasi_bk_pu_baseline: d.deviasiBkPuBaseline,
          progress_fisik: d.progressTerakhir, has_progress_data: false,
          qshe_score: d.qsheLatest,
          she_score: d.sheLatest,
          quality_score: d.qualityLatest,
          progress_rencana: d.progressRencanaTerakhir, deviasi_progress: d.deviasiProgressTerakhir,
          stock: d.stockTerakhir, stock_90: d.stock90Terakhir, stock_180: d.stock180Terakhir,
          bkd: d.bkdTerakhir, wip_bk: d.wipBkTerakhir,
          tagihan_bruto: d.tagihanTerakhir, tagihan_bruto_90: d.tagihan90Terakhir, tagihan_bruto_180: d.tagihan180Terakhir,
          bk_pu_real_kumulatif: d.bkPuRealKumTerakhir,
          status_proyek: overhead ? 'Non-Proyek' : 'Aktif', status_proyek_raw: '',
          kota: '-', kota_valid: false,
          lat: fc.lat, lng: fc.lng, persentase_pu: pct, status_kesehatan: sehat,
          has_koordinat: !!(fc.lat && fc.lng && !fc.bermasalah),
          koordinat_bermasalah: fc.bermasalah,
          has_master_data: true, is_overhead: overhead,
          histori_bulanan: Array.from(d.historiBulanan.values()),
        });
      }
      unified.sort((a, b) => b.pu_rkap - a.pu_rkap);

      const tahunTersedia = Array.from(tahunSet).sort((a, b) => a - b);

      setLoadText('Mining data NKB…');
      const nkbKumulatifArr: NkbTrendPoint[] = [];
      const nkbPerBulanArr: NkbTrendPoint[] = [];

      if (wb.SheetNames.includes('NKB')) {
        const sheetNkb = wb.Sheets['NKB'];
        const nkbRows = XLSX.utils.sheet_to_json<any[]>(sheetNkb, { header: 1, defval: 0 });

        // Kolom NKB dideteksi lewat nama header, bukan posisi tetap — layout bisa
        // bergeser (mis. A–E vs H–M) antar versi file. Header memuat "Bulan".
        const cariHeader = (mulai: number) => {
          for (let i = mulai; i < nkbRows.length; i++) {
            const row = nkbRows[i];
            if (!row) continue;
            const idxBulan = row.findIndex(c => String(c ?? '').trim().toLowerCase() === 'bulan');
            if (idxBulan !== -1) {
              const cari = (label: string) => row.findIndex(c => String(c ?? '').trim().toLowerCase() === label);
              return {
                headerRow: i,
                bulan: idxBulan,
                rkap: cari('rkap'),
                real: cari('realisasi'),
                konstruksi: cari('konstruksi'),
                sewa: cari('sewa alat'),
                fabrikasi: cari('fabrikasi'),
              };
            }
          }
          return null;
        };

        // Membaca satu blok 12 bulan mulai tepat setelah baris header
        const bacaBlok = (hdr: ReturnType<typeof cariHeader>, keluar: NkbTrendPoint[]) => {
          if (!hdr) return;
          const ambil = (row: any[], ci: number) => ci !== -1 ? (Number(row[ci]) || 0) : 0;
          let count = 0;
          for (let i = hdr.headerRow + 1; i < nkbRows.length && count < 12; i++) {
            const row = nkbRows[i];
            if (!row) continue;
            const bulan = String(row[hdr.bulan] ?? '').trim();
            const bi = MONTH_ORDER.indexOf(bulan) + 1;
            if (bi === 0) continue;
            keluar.push({
              month: bulan,
              month_index: bi,
              rkap: ambil(row, hdr.rkap) * CURRENCY_SCALE,
              realisasi: ambil(row, hdr.real) * CURRENCY_SCALE,
              realisasiKonstruksi: ambil(row, hdr.konstruksi) * CURRENCY_SCALE,
              realisasiSewaAlat: ambil(row, hdr.sewa) * CURRENCY_SCALE,
              realisasiFabrikasi: ambil(row, hdr.fabrikasi) * CURRENCY_SCALE,
            });
            count++;
          }
        };

        const hdrKum = cariHeader(0);
        bacaBlok(hdrKum, nkbKumulatifArr);
        // Blok kedua (per bulan) bila ada — dicari setelah blok pertama
        if (hdrKum) bacaBlok(cariHeader(hdrKum.headerRow + 12), nkbPerBulanArr);
      }

      setLoadText('Mining data YoY 2025…');
      const yoyArr: YoyDataPoint[] = [];
      if (wb.SheetNames.includes('YoY')) {
        const sheetYoy = wb.Sheets['YoY'];
        const yoyRows = XLSX.utils.sheet_to_json<any[]>(sheetYoy, { header: 1 });
        // Struktur sheet YoY (header di baris 2, data mulai baris 3):
        // [0]=periode [1]=tahun [2]=bulan [3]=bulan_index [4]=Segmentasi
        // [5]=pu_real_parsial [6]=bk_real_parsial [7]=Laba_real_parsial [8]=bkpu_real_parsial
        for (let r = 3; r < yoyRows.length; r++) {
          const row = yoyRows[r];
          if (!row) continue;
          const bi = Number(row[3]) || 0;
          const bulanLabel = String(row[2] ?? '').trim();
          const seg = String(row[4] ?? '').trim();
          if (!bi || !seg || !bulanLabel) continue;
          yoyArr.push({
            bulanIndex: bi,
            bulan: bulanLabel,
            segmentasi: seg,
            puReal2025: (Number(row[5]) || 0) * CURRENCY_SCALE,
            bkReal2025: (Number(row[6]) || 0) * CURRENCY_SCALE,
            labaReal2025: (Number(row[7]) || 0) * CURRENCY_SCALE,
          });
        }
      }

      setLoadText('Mining database all proyek…');
      const allProyekArr: AllProyekRow[] = [];
      if (wb.SheetNames.includes('all proyek')) {
        const sheetAp = wb.Sheets['all proyek'];
        const apRows = XLSX.utils.sheet_to_json<any[]>(sheetAp, { header: 1 });

        let apHeaderIdx = -1;
        for (let i = 0; i < Math.min(apRows.length, 20); i++) {
          const r = apRows[i];
          if (r && String(r[3] ?? '').includes('Nama Proyek')) { apHeaderIdx = i; break; }
        }

        // Kolom PU/BK tahunan: baris tahun berisi angka 20xx, PU di kolom itu, BK di kolom berikutnya
        const yearCols: { tahun: number; puCol: number; bkCol: number }[] = [];
        if (apHeaderIdx !== -1) {
          for (let i = 0; i < apHeaderIdx; i++) {
            const r = apRows[i];
            if (!r) continue;
            for (let cIdx = 0; cIdx < r.length; cIdx++) {
              const v = Number(r[cIdx]);
              if (v >= 2015 && v <= 2035) yearCols.push({ tahun: v, puCol: cIdx, bkCol: cIdx + 1 });
            }
            if (yearCols.length > 0) break;
          }
        }

        const numOrZeroAp = (v: any): number => { const n = Number(v); return isNaN(n) ? 0 : n; };
        if (apHeaderIdx !== -1) {
          for (let i = apHeaderIdx + 1; i < apRows.length; i++) {
            const r = apRows[i];
            if (!r) continue;
            const id = String(r[2] ?? '').trim();
            const nama = String(r[3] ?? '').trim();
            if (!id || !nama || /^total$/i.test(nama)) continue;

            const annual: AnnualFinancialPoint[] = yearCols.map(yc => ({
              tahun: yc.tahun,
              pu: numOrZeroAp(r[yc.puCol]) * CURRENCY_SCALE,
              bk: numOrZeroAp(r[yc.bkCol]) * CURRENCY_SCALE,
            }));

            // Posisi kolom sheet "all proyek": 1=NO, 2=Profit Center, 3=Nama, 4=Segmentasi,
            // 5=Pemberi Kerja, 6=NK, 7=Progress, 8=PU s.d, 9=BK s.d, 10=BK/PU,
            // 11=Status, 12=Kota, 13=Internal/Eksternal, 14=MAPP
            const kotaRaw = r[12];
            allProyekArr.push({
              no: numOrZeroAp(r[1]),
              id_project: id,
              project_name: nama,
              segmentasi: String(r[4] ?? 'Tidak Diketahui').trim() || 'Tidak Diketahui',
              pemberi_kerja: String(r[5] ?? '').trim() || 'Tidak Diketahui',
              nilai_kontrak: numOrZeroAp(r[6]) * CURRENCY_SCALE,
              progress_pct: numOrZeroAp(r[7]) * 100,
              pu_sd: numOrZeroAp(r[8]) * CURRENCY_SCALE,
              bk_sd: numOrZeroAp(r[9]) * CURRENCY_SCALE,
              bk_pu_pct: numOrZeroAp(r[10]) * 100,
              status: String(r[11] ?? '').trim() || 'Tidak Diketahui',
              kota: isValidCityText(kotaRaw) ? String(kotaRaw).trim() : '–',
              provinsi: normalizeProvinsi(kotaRaw),
              internal_eksternal: String(r[13] ?? '').trim() || '–',
              mapp_pct: parseMappPct(r[14]),
              piutang: numOrZeroAp(r[15]) * CURRENCY_SCALE,
              annual,
            });
          }
        }
      }

      // Perkaya data bulanan dengan atribut dari database all proyek (kota, klien, status)
      const apById = new Map(allProyekArr.map(p => [p.id_project, p]));
      for (const u of unified) {
        const ap = apById.get(u.id_project);
        if (!ap) { u.has_master_data = false; continue; }
        u.kota = ap.kota;
        u.kota_valid = ap.provinsi !== '';
        u.klien = ap.pemberi_kerja !== 'Tidak Diketahui' ? ap.pemberi_kerja : u.klien;
        u.status_proyek = ap.status;
        u.status_proyek_raw = ap.status;
        // progress_fisik memakai skala fraksi (0–1) seperti sheet RKAP_value,
        // sedangkan progress_pct dari sheet "all proyek" berskala 0–100
        if (u.progress_fisik === 0) u.progress_fisik = ap.progress_pct / 100;
        u.has_progress_data = ap.progress_pct > 0;
        if (u.nilai_kontrak === 0) { u.nilai_kontrak = ap.nilai_kontrak; u.nilai_proyek = ap.nilai_kontrak; }
      }

      const bulanDefaultNkb = nkbKumulatifArr.length > 0
        ? ([...nkbKumulatifArr].reverse().find(p => p.realisasi > 0)?.month_index ?? nkbKumulatifArr[nkbKumulatifArr.length - 1].month_index)
        : 5;

      setDb(unified); setAllProyek(allProyekArr);
      setNkbKumulatif(nkbKumulatifArr);
      void nkbPerBulanArr;
      setYoyData(yoyArr); setTahunOptions(tahunTersedia);
      setFilters(prev => ({
        ...prev,
        tahun: prev.tahun ?? (tahunTersedia.length > 0 ? tahunTersedia[tahunTersedia.length - 1] : null),
        bulan: prev.bulan === 12 ? bulanDefaultNkb : prev.bulan,
      }));
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(false); }, []);
  const handleRefresh = () => { setLoading(true); setErr(''); loadData(true); };

  // Debounce pencarian supaya mengetik tidak memicu render ulang seluruh chart per huruf
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 200);
    return () => clearTimeout(t);
  }, [search]);

  // setFilters terikat pada menu aktif, jadi harus ikut jadi dependensi —
  // tanpa itu perubahan filter selalu jatuh ke menu yang aktif saat render pertama
  const applyFilters = React.useCallback(
    (f: Filters) => startTransition(() => setFilters(f)), [setFilters]);

  const isQsheOnlySeg = useMemo(() =>
    filters.segmentasi !== null && SEG_QSHE_ONLY.includes(filters.segmentasi), [filters.segmentasi]);

  const dataPeriode = useMemo(() => {
    const bulanBatas = filters.bulan ?? 12;
    const tahun = filters.tahun;
    return db.map(d => {
      let rkap = 0, real = 0, bkRkap = 0, bkReal = 0, labaRkap = 0, labaReal = 0;
      let lastBulan = 0, lastProgress = d.progress_fisik, lastQshe = 0;
      // Nilai posisi (progress rencana, baseline BK/PU, stok, tagihan) diambil
      // dari bulan terakhir DALAM periode yang sel-nya benar-benar terisi,
      // supaya filter bulan/tahun ikut menggerakkan skor PPI & matriks
      let posProgress: HistoriBulanan | null = null;
      let posBkPu: HistoriBulanan | null = null;
      let posNeraca: HistoriBulanan | null = null;
      let lastShe = 0, lastQuality = 0;
      d.histori_bulanan.forEach(h => {
        if ((tahun !== null && h.tahun !== tahun) || h.bulanIndex > bulanBatas) return;
        rkap += h.rkap; real += h.real;
        bkRkap += h.bkRkap; bkReal += h.bkReal;
        labaRkap += h.labaRkap; labaReal += h.labaReal;
        if (h.progressRencana !== 0 || h.deviasiProgress !== 0) {
          if (!posProgress || h.bulanIndex > posProgress.bulanIndex) posProgress = h;
        }
        if (h.bkPuMapp !== 0 || h.bkPuRealKum !== 0 || h.deviasiBkPu !== 0) {
          if (!posBkPu || h.bulanIndex > posBkPu.bulanIndex) posBkPu = h;
        }
        if (h.stock !== 0 || h.stock90 !== 0 || h.stock180 !== 0 || h.bkd !== 0
          || h.wipBk !== 0 || h.tagihan !== 0 || h.tagihan90 !== 0 || h.tagihan180 !== 0) {
          if (!posNeraca || h.bulanIndex > posNeraca.bulanIndex) posNeraca = h;
        }
        if (h.bulanIndex > lastBulan) {
          lastBulan = h.bulanIndex;
          if (h.progress > 0) lastProgress = h.progress;
          if (h.qshe > 0) lastQshe = h.qshe;
          if (h.she > 0) lastShe = h.she;
          if (h.quality > 0) lastQuality = h.quality;
        }
      });
      // Cast diperlukan karena TypeScript menyempitkan variabel ini ke null
      // akibat penugasan hanya terjadi di dalam callback forEach
      const pProg = posProgress as HistoriBulanan | null;
      const pBkPu = posBkPu as HistoriBulanan | null;
      const pNeraca = posNeraca as HistoriBulanan | null;
      const pct = rkap > 0 ? (real / rkap) * 100 : 0;
      return {
        ...d,
        pu_rkap: rkap, pu_real: real,
        bk_rkap: bkRkap, bk_real: bkReal,
        laba_rkap: labaRkap, laba_real: labaReal,
        deviasi_pu: real - rkap, deviasi_laba: labaReal - labaRkap,
        bk_pu_ratio: real > 0 ? bkReal / real : 0,
        bk_pu_ratio_rkap: rkap > 0 ? bkRkap / rkap : 0,
        pct_laba_terhadap_rkap: labaRkap !== 0 ? labaReal / labaRkap : 0,
        persentase_pu: pct,
        status_kesehatan: (pct >= 85 ? 'Sehat' : pct < 60 ? 'Kritis' : 'Perhatian') as UnifiedProjectData['status_kesehatan'],
        bulan_index: lastBulan || d.bulan_index,
        progress_fisik: pProg ? pProg.progress : lastProgress,
        qshe_score: lastQshe || d.qshe_score,
        she_score: lastShe || d.she_score,
        quality_score: lastQuality || d.quality_score,
        // Posisi progress, baseline BK/PU, dan neraca pada periode terpilih
        progress_rencana: pProg ? pProg.progressRencana : 0,
        deviasi_progress: pProg ? pProg.deviasiProgress : 0,
        bk_pu_mapp: pBkPu ? pBkPu.bkPuMapp : 0,
        bk_pu_real_kumulatif: pBkPu ? pBkPu.bkPuRealKum : 0,
        deviasi_bk_pu_baseline: pBkPu ? pBkPu.deviasiBkPu : 0,
        stock: pNeraca ? pNeraca.stock : 0,
        stock_90: pNeraca ? pNeraca.stock90 : 0,
        stock_180: pNeraca ? pNeraca.stock180 : 0,
        bkd: pNeraca ? pNeraca.bkd : 0,
        wip_bk: pNeraca ? pNeraca.wipBk : 0,
        tagihan_bruto: pNeraca ? pNeraca.tagihan : 0,
        tagihan_bruto_90: pNeraca ? pNeraca.tagihan90 : 0,
        tagihan_bruto_180: pNeraca ? pNeraca.tagihan180 : 0,
      };
    });
  }, [db, filters.tahun, filters.bulan]);

  const filtered = useMemo(() => {
    const q = searchDebounced.toLowerCase();
    let result = dataPeriode.filter(d => {
      if (q && !(d.project_name.toLowerCase().includes(q) || d.kota.toLowerCase().includes(q))) return false;
      if (filters.segmentasi && d.segmentasi !== filters.segmentasi) return false;
      if (filters.tahun !== null) {
        if (!d.histori_bulanan?.some(h => h.tahun === filters.tahun)) return false;
      }
      return true;
    });
    result = [...result].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? (Number(av) || 0) - (Number(bv) || 0) : (Number(bv) || 0) - (Number(av) || 0);
    });
    return result;
  }, [dataPeriode, searchDebounced, filters, sortKey, sortDir]);


  const kumulatif: KumulatifFinancials = useMemo(() => {
    const bulanBatas = filters.bulan ?? 5;
    const tahunTerpilih = filters.tahun;
    // Kartu KPI ikut menyempit saat pencarian dipakai
    const q = searchDebounced.toLowerCase();
    const cocokSearch = (d: UnifiedProjectData) =>
      !q || d.project_name.toLowerCase().includes(q) || d.kota.toLowerCase().includes(q);
    let puRkap = 0, puReal = 0, puRkapTotal = 0, puRealTotal = 0;
    let bkRkap = 0, bkReal = 0, bkRkapTotal = 0, bkRealTotal = 0;
    let labaRkap = 0, labaReal = 0, labaRkapTotal = 0;
    let puReal2025 = 0, bkReal2025 = 0, labaReal2025 = 0;
    const projectIds = new Set<string>();
    const qsheScores: number[] = [];
    const sheScores: number[] = [];
    const qualityScores: number[] = [];

    // Total RKAP setahun (kolom P/Q/R semua bulan) — ikut filter segmentasi & pencarian,
    // hanya batas bulan yang diabaikan. Tanpa filter aktif, hasilnya = SUM P676/Q676/R676
    db.forEach(d => {
      if (filters.segmentasi && d.segmentasi !== filters.segmentasi) return;
      if (!cocokSearch(d)) return;
      d.histori_bulanan.forEach(h => {
        if (tahunTerpilih !== null && h.tahun !== tahunTerpilih) return;
        puRkapTotal += h.rkap;
        bkRkapTotal += h.bkRkap;
        labaRkapTotal += h.labaRkap;
        puRealTotal += h.real;
        bkRealTotal += h.bkReal;
      });
    });

    // Agregasi s.d bulan dari SEMUA baris (termasuk non-proyek NKB-x/SNK-x/JO-x/Depre),
    // konsisten dengan Total RKAP setahun di atas dan rumus Excel SD MEI (P678=SUM P4:P278).
    // Kalau tidak, "RKAP s.d Des" ≠ "RKAP setahun" padahal cakupannya sama
    db.forEach(d => {
      if (filters.segmentasi && d.segmentasi !== filters.segmentasi) return;
      if (!cocokSearch(d)) return;
      const baris = d.histori_bulanan.filter(
        h => (tahunTerpilih === null || h.tahun === tahunTerpilih) && h.bulanIndex <= bulanBatas,
      );
      if (baris.length === 0) return;
      if (!d.is_overhead) projectIds.add(d.id_project);
      baris.forEach(h => {
        puRkap += h.rkap; puReal += h.real;
        bkRkap += h.bkRkap; bkReal += h.bkReal;
        labaRkap += h.labaRkap; labaReal += h.labaReal;
      });
    });

    // Kinerja QSHE dihitung dari seluruh baris kolom M — termasuk AMP/Workshop
    // yang bukan proyek finansial dan hanya punya nilai QSHE
    const qsheTargetScores: number[] = [];
    db.forEach(d => {
      if (filters.segmentasi && d.segmentasi !== filters.segmentasi) return;
      if (!cocokSearch(d)) return;
      // Skor QSHE/SHE/Quality = KONDISI pada bulan filter: per unit diambil nilai
      // bulan terakhir yang terisi s.d bulan batas (bukan rata-rata semua bulan)
      let qsheKini = 0, sheKini = 0, qualityKini = 0;
      let qsheBln = -1, sheBln = -1, qualityBln = -1;
      d.histori_bulanan.forEach(h => {
        // Target QSHE (kolom AM) = target setahun, tidak dibatasi filter bulan
        if (tahunTerpilih === null || h.tahun === tahunTerpilih) {
          if (h.qsheTarget > 0) qsheTargetScores.push(h.qsheTarget);
        }
        if ((tahunTerpilih !== null && h.tahun !== tahunTerpilih) || h.bulanIndex > bulanBatas) return;
        if (h.qshe > 0 && h.bulanIndex > qsheBln) { qsheKini = h.qshe; qsheBln = h.bulanIndex; }
        if (h.she > 0 && h.bulanIndex > sheBln) { sheKini = h.she; sheBln = h.bulanIndex; }
        if (h.quality > 0 && h.bulanIndex > qualityBln) { qualityKini = h.quality; qualityBln = h.bulanIndex; }
      });
      if (qsheKini > 0) qsheScores.push(qsheKini);
      if (sheKini > 0) sheScores.push(sheKini);
      if (qualityKini > 0) qualityScores.push(qualityKini);
    });

    yoyData.forEach(y => {
      if (y.bulanIndex > bulanBatas) return;
      if (filters.segmentasi && y.segmentasi !== filters.segmentasi) return;
      puReal2025 += y.puReal2025;
      bkReal2025 += y.bkReal2025;
      labaReal2025 += y.labaReal2025;
    });

    return {
      puRkap, puReal, puRkapTotal, puRealTotal,
      bkRkap, bkReal, bkRkapTotal, bkRealTotal,
      labaRkap, labaReal, labaRkapTotal,
      bkPuRealPct: puReal > 0 ? (bkReal / puReal) * 100 : 0,
      projectCount: projectIds.size,
      qsheRataRata: qsheScores.length > 0 ? qsheScores.reduce((a, b) => a + b, 0) / qsheScores.length : 0,
      qsheProyekCount: qsheScores.length,
      sheRataRata: sheScores.length > 0 ? sheScores.reduce((a, b) => a + b, 0) / sheScores.length : 0,
      qualityRataRata: qualityScores.length > 0 ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length : 0,
      qsheTarget: qsheTargetScores.length > 0 ? qsheTargetScores.reduce((a, b) => a + b, 0) / qsheTargetScores.length : 0,
      puReal2025, bkReal2025, labaReal2025,
    };
  }, [db, yoyData, filters, searchDebounced]);

  const nkbTerpilih = useMemo(() => {
    const bulanBatas = filters.bulan ?? 5;
    const titik = nkbKumulatif.find(p => p.month_index === bulanBatas) ?? null;
    if (!titik) return null;
    const seg = filters.segmentasi;
    // NKB di sheet Excel dipecah untuk Konstruksi, Sewa Alat, & Fabrikasi. Tanpa
    // filter = total. Segmentasi lain (Supply Material, AMP, Workshop, dst.) tidak
    // punya kolom NKB → tampil 0, bukan jatuh ke total.
    if (seg === null) return { rkap: titik.rkap, realisasi: titik.realisasi, bulanLabel: titik.month };
    if (seg === 'Konstruksi') return { rkap: titik.rkap, realisasi: titik.realisasiKonstruksi, bulanLabel: titik.month };
    if (seg === 'Sewa Alat') return { rkap: titik.rkap, realisasi: titik.realisasiSewaAlat, bulanLabel: titik.month };
    if (seg === 'Fabrikasi') return { rkap: titik.rkap, realisasi: titik.realisasiFabrikasi, bulanLabel: titik.month };
    return { rkap: 0, realisasi: 0, bulanLabel: titik.month };
  }, [nkbKumulatif, filters.bulan, filters.segmentasi]);

  // Baris untuk tab Kinerja QSHE: ikut segmentasi + pencarian (bulan/tahun di dalam panel).
  // Pilihan "Proyek" = semua segmentasi selain AMP/Workshop.
  // Bocimi & unit AMP dikecualikan KHUSUS di tab ini — menu lain tetap memakainya.
  const qsheViewRows = useMemo(() => {
    const q = searchDebounced.toLowerCase();
    const cocokSeg = (d: UnifiedProjectData) => {
      if (!filters.segmentasi) return true;
      if (filters.segmentasi === 'Proyek') return !SEG_QSHE_ONLY.includes(d.segmentasi);
      return d.segmentasi === filters.segmentasi;
    };
    return db.filter(d =>
      !isDikecualikan(d.project_name, d.segmentasi, d.id_project) &&
      cocokSeg(d) &&
      (!q || d.project_name.toLowerCase().includes(q) || d.kota.toLowerCase().includes(q)),
    );
  }, [db, filters.segmentasi, searchDebounced]);

  const masterRows = useMemo(() => {
    if (!searchDebounced) return allProyek;
    const q = searchDebounced.toLowerCase();
    return allProyek.filter(p =>
      p.project_name.toLowerCase().includes(q) ||
      p.id_project.toLowerCase().includes(q) ||
      p.kota.toLowerCase().includes(q) ||
      p.pemberi_kerja.toLowerCase().includes(q) ||
      p.segmentasi.toLowerCase().includes(q),
    );
  }, [allProyek, searchDebounced]);

  const c: Theme = dark ? THEME.dark : THEME.light;

  const handleLogout = () => {
    triggerTransition(
      () => { instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin }).catch(() => instance.logoutPopup().catch(console.error)); },
      dark ? '#0b1120' : '#1e293b',
    );
  };

  if (err) return (
    <div style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center', background: c.bg, color: '#ef4444', fontFamily: "'Inter',sans-serif", gap: '10px', flexDirection: 'column' }}>
      <AlertCircle style={{ width: '28px', height: '28px' }} />
      <span style={{ fontWeight: 600 }}>Gagal Memuat</span>
      <span style={{ fontSize: '12px', color: c.textMuted }}>{err}</span>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', height: '100dvh', alignItems: 'center', justifyContent: 'center', background: c.bg, flexDirection: 'column', gap: '16px', fontFamily: "'Inter',sans-serif", animation: 'fadeIn 0.6s ease' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '3px solid ' + c.border, borderTopColor: '#3b82f6', animation: 'spin 0.8s cubic-bezier(0.34,1.56,0.64,1) infinite' }} />
      <p style={{ fontSize: '13px', color: c.textMuted, fontWeight: 500, animation: 'pulseText 1.5s ease-in-out infinite' }}>{loadText}</p>
      <p style={{ fontSize: '11px', color: c.textSubtle }}>Mohon tunggu sebentar…</p>
    </div>
  );

  const viewLabel = NAV_ITEMS.find(n => n.id === view)?.label ?? '';
  const viewColor = NAV_ITEMS.find(n => n.id === view)?.color ?? '#3b82f6';

  return (
    <div key={dashboardKey} style={{ display: 'flex', height: '100dvh', background: c.bg, color: c.text, fontFamily: "'Inter',-apple-system,'Segoe UI',sans-serif", overflow: 'hidden', fontSize: '14px', animation: 'fadeIn 0.3s ease both' }}>
      <aside className={`sn-sidebar${open ? ' open' : ''}`} style={{ width: '200px', flexShrink: 0, background: c.sidebar, borderRight: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', height: '100%', zIndex: 50, position: 'relative' }}>
        <div style={{ height: '60px', display: 'flex', alignItems: 'center', padding: '0 18px', borderBottom: `1px solid ${c.border}`, gap: '10px', flexShrink: 0, background: c.bgMuted }}>
          <img src="/logo-wki.png" alt="Logo WKI" style={{ width: '34px', height: '34px', objectFit: 'contain', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: '14px', color: c.text, letterSpacing: '-0.03em', flex: 1 }}>Pengendalian & QSHE</span>
          <button onClick={() => setOpen(false)} className="sn-btn sn-mobile-only" style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, padding: '4px', display: 'flex', borderRadius: 'var(--radius-xs)' }}>
            <X style={{ width: '15px', height: '15px' }} />
          </button>
        </div>
        <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }} className="sn-scroll">
          <p style={{ fontSize: '10px', fontWeight: 700, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px', marginBottom: '6px', marginTop: '4px' }}>Menu</p>
          {NAV_ITEMS.map((item, idx) => {
            const active = view === item.id;
            const badge = 0;
            // Filter tiap menu berdiri sendiri, jadi tak perlu dibersihkan saat
            // berpindah — nilai khas QSHE tidak pernah bocor ke menu lain
            return (
              <button key={item.id} className="sn-btn" onClick={() => {
                setView(item.id as View); setOpen(false);
              }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', background: active ? c.sidebarActiveBg : 'transparent', color: active ? c.sidebarActiveText : c.textMuted, fontSize: '13px', fontWeight: active ? 600 : 400, textAlign: 'left', marginBottom: '2px', transition: 'all 0.2s var(--ease-out)', animation: `featureItemSlide 0.4s cubic-bezier(0.16,1,0.3,1) ${idx * 0.05}s both` }}>
                {active && <span className="sn-scale-in" style={{ position: 'absolute', left: 0, top: '22%', bottom: '22%', width: '3px', borderRadius: '0 3px 3px 0', background: item.color }} />}
                <div className="sn-kpi-icon" style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-md)', background: active ? `${item.color}18` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.Icon style={{ width: '15px', height: '15px', color: active ? item.color : c.textMuted }} />
                </div>
                <span style={{ flex: 1 }}>{item.label}</span>
                {badge > 0 && (
                  <span className="sn-scale-in" style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', flexShrink: 0 }}>{badge}</span>
                )}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: '10px', borderTop: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button onClick={toggleDark} className="sn-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer', background: 'transparent', color: c.textMuted, fontSize: '12px', textAlign: 'left', fontWeight: 500 }}>
            <span style={{ display: 'flex', transition: 'transform 0.4s var(--ease-spring)', transform: dark ? 'rotate(0deg)' : 'rotate(180deg)' }}>
              {dark ? <Moon style={{ width: '15px', height: '15px' }} /> : <Sun style={{ width: '15px', height: '15px' }} />}
            </span>
            <span style={{ flex: 1 }}>{dark ? 'Mode Gelap' : 'Mode Terang'}</span>
            <div style={{ width: '32px', height: '18px', borderRadius: '9px', background: dark ? '#3b82f6' : '#cbd5e1', position: 'relative', transition: 'background 0.3s var(--ease-out)', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '2px', left: dark ? '16px' : '2px', width: '14px', height: '14px', borderRadius: '50%', background: '#fff', transition: 'left 0.4s var(--ease-spring)', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </button>
          <button onClick={handleLogout} className="sn-btn"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '9px 12px', borderRadius: 'var(--radius-md)', border: `1px solid ${c.kritis.border}`, cursor: 'pointer', background: c.kritis.bg, color: c.kritis.text, fontSize: '12px', fontWeight: 700, transition: 'all 0.25s var(--ease-out)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = c.kritis.bg; e.currentTarget.style.color = c.kritis.text; e.currentTarget.style.borderColor = c.kritis.border; }}>
            <LogOut style={{ width: '14px', height: '14px' }} /> Keluar
          </button>
          <div style={{ position: 'relative' }}>
            {userOpen && (
              <div className="sn-dropdown-enter" style={{ position: 'absolute', bottom: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 70, background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: `1px solid ${c.border}` }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: 800, flexShrink: 0 }}>
                    {(account?.name ?? 'U').split(' ').filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {userProfile?.displayName ?? account?.name ?? 'Pengguna'}
                    </div>
                    <div style={{ fontSize: '10px', color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Akun Microsoft 365
                    </div>
                  </div>
                </div>
                {userProfileLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: c.textMuted, padding: '4px 0' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: `2px solid ${c.border}`, borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite' }} />
                    Memuat profil dari Microsoft…
                  </div>
                ) : (
                  [
                    { Icon: Mail, label: 'Email', value: userProfile?.mail ?? userProfile?.userPrincipalName ?? account?.username },
                    { Icon: Briefcase, label: 'Jabatan', value: userProfile?.jobTitle },
                    { Icon: Building2, label: 'Departemen', value: userProfile?.department },
                    { Icon: MapPin, label: 'Lokasi Kantor', value: userProfile?.officeLocation },
                    { Icon: Phone, label: 'Telepon', value: userProfile?.mobilePhone ?? userProfile?.businessPhones?.[0] },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <row.Icon style={{ width: '12px', height: '12px', color: c.textSubtle, flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</div>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: row.value ? c.text : c.textSubtle, wordBreak: 'break-word' }}>{row.value || '—'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            <button onClick={toggleUserInfo} className="sn-btn" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: 'var(--radius-md)', background: userOpen ? (dark ? 'rgba(59,130,246,0.12)' : '#eff6ff') : c.bgMuted, border: 'none', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0 }}>
                {(account?.name ?? 'U').split(' ').filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{account?.name ?? 'Pengguna'}</div>
                <div style={{ fontSize: '10px', color: c.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{account?.username ?? '—'}</div>
              </div>
              <ChevronUp className="sn-chevron" style={{ width: '13px', height: '13px', color: c.textMuted, flexShrink: 0, transform: userOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
          </div>
        </div>
      </aside>

      {open && <div onClick={() => setOpen(false)} className="sn-fade-in sn-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }} />}

      <div className="dashboard-reveal" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        <header className="header-reveal" style={{ height: '60px', background: c.card, borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', padding: '0 22px', gap: '12px', flexShrink: 0, boxShadow: 'var(--shadow-xs)' }}>
          <button onClick={() => setOpen(true)} className="sn-btn sn-mobile-only" style={{ padding: '7px', background: 'none', border: `1px solid ${c.border}`, borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: c.textMuted, display: 'flex', alignItems: 'center' }}>
            <Menu style={{ width: '15px', height: '15px' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
            <span style={{ color: c.textMuted, fontWeight: 500 }}>Dashboard</span>
            <ChevronRight style={{ width: '12px', height: '12px', color: c.textSubtle }} />
            <span key={viewLabel} className="sn-fade-in" style={{ color: viewColor, fontWeight: 600 }}>{viewLabel}</span>
          </div>
          {lastUpdated && (
            <div className="sn-hide-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: 'var(--radius-full)', background: c.bgMuted, border: `1px solid ${c.border}` }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: '11px', color: c.textMuted, fontWeight: 500 }}>
                {new Date(lastUpdated).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
              <button onClick={handleRefresh} title="Muat ulang dari SharePoint" className="sn-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, display: 'flex', alignItems: 'center', padding: '2px' }}>
                <RefreshCw style={{ width: '11px', height: '11px' }} />
              </button>
            </div>
          )}
        </header>

        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', background: c.bgSubtle }} className="sn-scroll sn-main">
          <div style={{ width: '100%' }}>
            <div className="sn-fade-in" style={{ marginBottom: '18px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 800, color: c.text, letterSpacing: '-0.04em', marginBottom: '3px' }}>
                {view === 'overview' ? '✨ Dashboard Kinerja' : view === 'project_performance' ? '🎯 Project Performance' : view === 'qshe' ? '🛡️ Kinerja QSHE' : view === 'paparan' ? '📽️ Paparan Kinerja' : '📊 Database All Proyek'}
              </h1>
            </div>

            {/* Menu Paparan tidak memakai filter dashboard — ia punya panel
                "Data yang Ditampilkan" sendiri di dalam view-nya */}
            {(view === 'overview' || view === 'project_performance' || view === 'qshe') && (
              <div style={{ position: 'relative', zIndex: 100 }}>
                <FilterBar data={db} filters={filters} setFilters={applyFilters} tahunOptions={tahunOptions} c={c} dark={dark}
                  search={search} setSearch={setSearch} searchRef={searchRef}
                  kuadran={view === 'project_performance' ? {
                    nilai: kuadranFilter,
                    setNilai: (v: number | null) => startTransition(() => setKuadranFilter(v as Kuadran | null)),
                    opsi: ([1, 2, 3, 4] as Kuadran[]).map(k => ({
                      nilai: k, roman: KUADRAN_INFO[k].roman, nama: `${KUADRAN_INFO[k].nama} — ${KUADRAN_INFO[k].ket}`,
                      warna: KUADRAN_INFO[k].warna, jumlah: statKuadran[k],
                    })),
                  } : undefined}
                  segmentasiOverride={view === 'qshe' ? [
                    { value: 'Proyek', label: 'Proyek' },
                    { value: 'Workshop', label: 'Workshop' },
                  ] : undefined} />
              </div>
            )}

            <div key={view} style={{ marginTop: '16px', animation: 'viewFadeUp 0.5s var(--ease-out) both' }}>
              {view === 'overview' && (
                <OverviewView
                  data={filtered} allRows={db} allProyek={allProyek}
                  nkbKumulatif={nkbKumulatif}
                  kumulatif={kumulatif} nkbTerpilih={nkbTerpilih}
                  filters={filters} isQsheOnlySeg={isQsheOnlySeg} dark={dark}
                  searchAktif={searchDebounced.trim() !== ''}
                />
              )}
              {view === 'project_performance' && (
                <ProjectPerformanceView
                  data={filtered} dark={dark}
                  kuadranFilter={kuadranFilter} search={searchDebounced}
                  onStatKuadran={setStatKuadran}
                />
              )}
              {view === 'qshe' && (
                <QshePanel rows={qsheViewRows} segment={filters.segmentasi ?? ''} filters={filters} dark={dark} />
              )}
              {view === 'paparan' && (
                <Suspense fallback={
                  <div className="sn-card" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', padding: '60px', textAlign: 'center', color: c.textMuted, fontSize: '13px' }}>
                    Memuat pratinjau paparan…
                  </div>
                }>
                  <PaparanView allRows={db} allProyek={allProyek} nkbKumulatif={nkbKumulatif} yoyData={yoyData} filters={filters} dark={dark} />
                </Suspense>
              )}
              {view === 'master_data' && (
                <div className="sn-search-wrap" style={{ position: 'relative', marginBottom: '12px' }}>
                  <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: c.textMuted, pointerEvents: 'none' }} />
                  <input ref={searchRef} type="text" placeholder="Cari proyek, kota, atau pemberi kerja…" value={search} onChange={e => setSearch(e.target.value)} className="sn-input"
                    style={{ width: '100%', padding: '8px 34px 8px 36px', borderRadius: 'var(--radius-full)', border: `1.5px solid ${c.border}`, background: c.card, color: c.text, fontSize: '12px', fontWeight: 500 }} />
                  {search && (
                    <button onClick={() => setSearch('')} className="sn-btn" title="Bersihkan pencarian"
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, display: 'flex', padding: '3px', borderRadius: '50%' }}>
                      <X style={{ width: '12px', height: '12px' }} />
                    </button>
                  )}
                </div>
              )}
              {view === 'master_data' && (
                <Suspense fallback={
                  <div className="sn-card" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', padding: '60px', textAlign: 'center', color: c.textMuted, fontSize: '13px' }}>
                    Memuat tabel database…
                  </div>
                }>
                  <MasterView data={masterRows} dark={dark} />
                </Suspense>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardApp;