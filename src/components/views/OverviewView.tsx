import React, { useMemo, lazy, Suspense } from 'react';
import { TrendingUp, TrendingDown, ShieldCheck, ArrowUpDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { THEME, PIE_COLORS, MONTH_LABELS } from '../../constants';
import type { Theme } from '../../constants';
import type {
  UnifiedProjectData, NkbTrendPoint,
  KumulatifFinancials, Filters, AllProyekRow,
} from '../../types';
import { fShort } from '../../utils';
import AnimatedNumber from './../AnimatedNumber';
import CommercialPerformance from './CommercialPerformance';
import OperationalPerformance from './OperationalPerformance';
import PortfolioAnalytics from './PortfolioAnalytics';
import QshePanel from './QshePanel';

// Lazy: leaflet (peta) dipisah dari bundle utama supaya load awal lebih ringan
const MapPanel = lazy(() => import('./MapPanel'));

interface NkbTerpilih {
  rkap: number;
  realisasi: number;
  bulanLabel: string;
}

interface Props {
  data: UnifiedProjectData[];
  allRows: UnifiedProjectData[];
  allProyek: AllProyekRow[];
  nkbKumulatif: NkbTrendPoint[];
  kumulatif: KumulatifFinancials;
  nkbTerpilih: NkbTerpilih | null;
  filters: Filters;
  isQsheOnlySeg: boolean;
  dark: boolean;
  // Pencarian proyek aktif: NKB & YoY (angka level perusahaan) disembunyikan
  // karena tidak relevan untuk subset proyek hasil pencarian
  searchAktif: boolean;
}

// Persen ditampilkan 2 desimal (mis. 78.89%) supaya akurat, tidak dibulatkan
const fmtPct = (n: number) => `${n.toFixed(2)}%`;
const fmtScore = (n: number) => n > 0 ? `${n.toFixed(1)}` : '—';

// Sparkline mini di dalam kartu KPI
const Sparkline: React.FC<{ data: any[]; dataKey: string; color: string; id: string }> = ({ data, dataKey, color, id }) => (
  <div style={{ height: '32px', margin: '2px 0 6px', pointerEvents: 'none' }}>
    {data.length > 1 && (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 0, left: 2 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.8} fill={`url(#${id})`} dot={false} animationDuration={450} animationEasing="ease-out" />
        </AreaChart>
      </ResponsiveContainer>
    )}
  </div>
);

const OverviewView: React.FC<Props> = ({
  data, allRows, allProyek, nkbKumulatif,
  kumulatif, nkbTerpilih, filters, isQsheOnlySeg, dark, searchAktif,
}) => {
  const c: Theme = dark ? THEME.dark : THEME.light;

  const allProyekFiltered = useMemo(() =>
    filters.segmentasi ? allProyek.filter(p => p.segmentasi === filters.segmentasi) : allProyek,
    [allProyek, filters.segmentasi]);

  // Ganti filter TIDAK memicu animasi masuk ulang — kartu tetap di tempat,
  // hanya angkanya yang beranimasi (count-up), progress bar & chart ber-tween
  // Deret bulanan realisasi untuk sparkline kartu KPI
  const monthlySeries = useMemo(() => {
    const acc = new Map<number, { pu: number; bk: number; laba: number; qshe: number[] }>();
    data.forEach(d => d.histori_bulanan.forEach(h => {
      if (filters.tahun !== null && h.tahun !== filters.tahun) return;
      if (h.bulanIndex > (filters.bulan ?? 12)) return;
      if (!acc.has(h.bulanIndex)) acc.set(h.bulanIndex, { pu: 0, bk: 0, laba: 0, qshe: [] });
      const a = acc.get(h.bulanIndex)!;
      a.pu += h.real; a.bk += h.bkReal; a.laba += h.labaReal;
      if (h.qshe > 0) a.qshe.push(h.qshe);
    }));
    return Array.from(acc.entries())
      .map(([m, a]) => ({
        m, pu: a.pu, bk: a.bk, laba: a.laba,
        bkpu: a.pu > 0 ? (a.bk / a.pu) * 100 : 0,
        qshe: a.qshe.length ? a.qshe.reduce((s, v) => s + v, 0) / a.qshe.length : 0,
      }))
      .sort((a, b) => a.m - b.m);
  }, [data, filters.tahun, filters.bulan]);

  // RKAP NKB setahun penuh (= kumulatif Desember), tidak terpengaruh filter bulan
  const nkbRkapSetahun = useMemo(() => {
    const des = nkbKumulatif.find(p => p.month_index === 12);
    return des?.rkap ?? (nkbKumulatif.length ? nkbKumulatif[nkbKumulatif.length - 1].rkap : 0);
  }, [nkbKumulatif]);

  const nkbSpark = useMemo(() =>
    nkbKumulatif
      .filter(p => p.month_index <= (filters.bulan ?? 12))
      .map(p => ({ m: p.month_index, v: p.realisasi })),
    [nkbKumulatif, filters.bulan]);

  // Baris segmentasi QSHE-only (AMP/Workshop) diambil dari seluruh data,
  // karena unit-unit ini bukan proyek finansial dan tak masuk daftar proyek
  const qsheRows = useMemo(() =>
    filters.segmentasi ? allRows.filter(d => d.segmentasi === filters.segmentasi) : [],
    [allRows, filters.segmentasi]);

  const bulanLabel = MONTH_LABELS[filters.bulan ?? 12] ?? 'Des';
  const tahunLabel = filters.tahun ? String(filters.tahun).slice(-2) : '';
  const periodeLabel = filters.segmentasi
    ? `${filters.segmentasi} · S.D ${bulanLabel} '${tahunLabel}`
    : `S.D ${bulanLabel} '${tahunLabel}`;

  const nkbPct = nkbTerpilih && nkbTerpilih.rkap > 0
    ? (nkbTerpilih.realisasi / nkbTerpilih.rkap) * 100 : 0;
  const puPct = kumulatif.puRkap > 0 ? (kumulatif.puReal / kumulatif.puRkap) * 100 : 0;
  const labaPct = kumulatif.labaRkap !== 0 ? (kumulatif.labaReal / kumulatif.labaRkap) * 100 : 0;

  const achievement = (pct: number) => pct >= 100
    ? { color: '#10b981', Icon: TrendingUp }
    : { color: '#ef4444', Icon: TrendingDown };
  const achievementBkPu = (pct: number) => pct > 100
    ? { color: '#ef4444', Icon: TrendingUp }
    : { color: '#10b981', Icon: TrendingDown };
  const nkbAch = achievement(nkbPct);
  const puAch = achievement(puPct);
  const labaAch = achievement(labaPct);

  const bkPuRkapSdPct = kumulatif.puRkap > 0 ? (kumulatif.bkRkap / kumulatif.puRkap) * 100 : 0;
  const bkPuRkapAllPct = kumulatif.puRkapTotal > 0 ? (kumulatif.bkRkapTotal / kumulatif.puRkapTotal) * 100 : 0;

  const nkbTargetPct = nkbRkapSetahun > 0 ? ((nkbTerpilih?.realisasi ?? 0) / nkbRkapSetahun) * 100 : 0;
  const puTargetPct = kumulatif.puRkapTotal > 0 ? (kumulatif.puReal / kumulatif.puRkapTotal) * 100 : 0;
  const labaTargetPct = kumulatif.labaRkapTotal !== 0 ? (kumulatif.labaReal / kumulatif.labaRkapTotal) * 100 : 0;
  const bkPuAchPct = bkPuRkapSdPct > 0 ? (kumulatif.bkPuRealPct / bkPuRkapSdPct) * 100 : 0;
  const bkPuTargetPct = bkPuRkapAllPct > 0 ? (kumulatif.bkPuRealPct / bkPuRkapAllPct) * 100 : 0;
  // Merah/hijau BK/PU dibanding Target RKAP S.D bulan: realisasi di bawah target = hijau
  const bkPuAch = achievementBkPu(bkPuAchPct);
  const bkPu2025 = kumulatif.puReal2025 > 0 ? (kumulatif.bkReal2025 / kumulatif.puReal2025) * 100 : 0;
  const qsheColor = kumulatif.qsheRataRata <= 0 ? '#ef4444'
    : kumulatif.qsheTarget > 0
      ? (kumulatif.qsheRataRata >= kumulatif.qsheTarget ? '#10b981' : '#ef4444')
      : (kumulatif.qsheRataRata >= 85 ? '#10b981' : kumulatif.qsheRataRata >= 70 ? '#f59e0b' : '#ef4444');

  const cardStyle = (_color: string) => ({
    background: c.kpiGradient,
    border: `1px solid ${c.border}`,
    borderRadius: 'var(--radius-xl)',
    padding: '22px 24px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0px',
  });

  const cardHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
    position: 'relative' as const,
    zIndex: 1,
  };

  const labelStyle = {
    fontSize: '11px', fontWeight: 700 as const,
    color: c.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.04em',
  };

  const bigNumStyle = (neg: boolean) => ({
    fontSize: '26px', fontWeight: 800 as const,
    color: neg ? c.kritis.text : c.text,
    letterSpacing: '-0.03em', lineHeight: 1.1,
    position: 'relative' as const, zIndex: 1, marginBottom: '8px',
  });

  const infoRowStyle = {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '7px 10px',
    borderRadius: 'var(--radius-sm)',
    background: c.bgMuted, marginBottom: '5px',
    fontSize: '11px',
  };

  const dividerStyle = {
    height: '1px', background: c.border,
    margin: '10px 0',
  };

  const progressBar = (pct: number, color?: string, label = 'Pencapaian') => {
    // Warna default mengikuti aturan pencapaian: 0-39 merah, 40-69 kuning, 70-100 hijau, >100 biru
    const barColor = color ?? (pct >= 100 ? '#10b981' : '#ef4444');
    return (
      <div style={{ marginBottom: '7px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: c.textMuted, marginBottom: '3px' }}>
          <span>{label}</span>
          <span style={{ fontWeight: 700, color: barColor }}>{fmtPct(pct)}</span>
        </div>
        <div style={{ height: '4px', borderRadius: '2px', background: c.chartBar, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(Math.max(pct, 0), 100)}%`, background: barColor, borderRadius: '2px', transition: 'width 0.8s ease' }} />
        </div>
      </div>
    );
  };

  if (isQsheOnlySeg) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: c.textMuted, padding: '4px 10px', background: c.bgMuted, borderRadius: 'var(--radius-full)', border: `1px solid ${c.border}`, alignSelf: 'flex-start' }}>
          📅 {periodeLabel}
        </div>
        <QshePanel rows={qsheRows} segment={filters.segmentasi ?? ''} filters={filters} dark={dark} />
      </div>
    );
  }

  return (
    <div className="sn-view-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <div style={{ fontSize: '11px', fontWeight: 600, color: c.textMuted, padding: '4px 10px', background: c.bgMuted, borderRadius: 'var(--radius-full)', border: `1px solid ${c.border}`, alignSelf: 'flex-start' }}>
        📅 {periodeLabel}
      </div>

      {/* 5 KPI Cards — satu baris di desktop (QSHE sejajar kanan Laba Bruto), melebur di layar sempit */}
      <div className="rg-kpi" style={{ display: 'grid', gridTemplateColumns: `repeat(${searchAktif ? 4 : 5}, minmax(0, 1fr))`, gap: '16px' }}>

        {/* Card 1: NILAI KONTRAK BARU (NKB) — disembunyikan saat pencarian aktif */}
        {!searchAktif && (
        <div className="sn-card sn-slide-up stagger-1" style={cardStyle(PIE_COLORS[0])}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${PIE_COLORS[0]}18, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={cardHeaderStyle}>
            <span style={labelStyle}>NILAI KONTRAK BARU</span>
            <div className="sn-kpi-icon" title={`Real/RKAP: ${nkbPct.toFixed(2)}%`} style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', background: `${nkbAch.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <nkbAch.Icon style={{ width: '14px', height: '14px', color: nkbAch.color }} />
            </div>
          </div>
          <div style={bigNumStyle((nkbTerpilih?.realisasi ?? 0) < 0)}>
            <AnimatedNumber value={nkbTerpilih?.realisasi ?? 0} format={fShort} />
          </div>
          <Sparkline data={nkbSpark} dataKey="v" color={nkbAch.color} id="spkNkb" />
          {nkbTerpilih && progressBar(nkbPct, undefined, `Real / RKAP ${bulanLabel}`)}
          {nkbTargetPct > 0 && progressBar(nkbTargetPct, '#3b82f6', `Real s.d ${bulanLabel} / RKAP ${filters.tahun ?? 2026}`)}
          <div style={dividerStyle} />
          <div style={infoRowStyle}>
            <span style={{ color: c.textMuted }}>Target RKAP S.D {bulanLabel}</span>
            <span style={{ fontWeight: 700, color: c.text }}>{fShort(nkbTerpilih?.rkap ?? 0)}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={{ color: c.textMuted }}>Target RKAP {filters.tahun ?? 2026}</span>
            <span style={{ fontWeight: 700, color: c.text }}>{fShort(nkbRkapSetahun)}</span>
          </div>
        </div>
        )}

        {/* Card 2: PENDAPATAN USAHA (PU) */}
        <div className="sn-card sn-slide-up stagger-2" style={cardStyle(PIE_COLORS[1])}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${PIE_COLORS[1]}18, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={cardHeaderStyle}>
            <span style={labelStyle}>PENDAPATAN USAHA</span>
            <div className="sn-kpi-icon" title={`Real/RKAP: ${puPct.toFixed(2)}%`} style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', background: `${puAch.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <puAch.Icon style={{ width: '14px', height: '14px', color: puAch.color }} />
            </div>
          </div>
          <div style={bigNumStyle(kumulatif.puReal < 0)}>
            <AnimatedNumber value={kumulatif.puReal} format={fShort} />
          </div>
          <Sparkline data={monthlySeries} dataKey="pu" color={puAch.color} id="spkPu" />
          {progressBar(puPct, undefined, `Real / RKAP ${bulanLabel}`)}
          {puTargetPct > 0 && progressBar(puTargetPct, '#3b82f6', `Real s.d ${bulanLabel} / RKAP ${filters.tahun ?? 2026}`)}
          <div style={dividerStyle} />
          <div style={infoRowStyle}>
            <span style={{ color: c.textMuted }}>Target RKAP S.D {bulanLabel}</span>
            <span style={{ fontWeight: 700, color: c.text }}>{fShort(kumulatif.puRkap)}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={{ color: c.textMuted }}>Target RKAP {filters.tahun ?? 2026}</span>
            <span style={{ fontWeight: 700, color: c.text }}>{fShort(kumulatif.puRkapTotal)}</span>
          </div>
          {!searchAktif && (
          <div style={{ ...infoRowStyle, marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown style={{ width: '9px', height: '9px', color: c.textSubtle }} />
              <span style={{ color: c.textMuted }}>YoY 2025</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ color: c.textSubtle }}>{fShort(kumulatif.puReal2025)}</span>
              {kumulatif.puReal2025 > 0 && (
                <span style={{
                  fontSize: '9px', fontWeight: 700,
                  color: kumulatif.puReal >= kumulatif.puReal2025 ? '#16a34a' : '#dc2626',
                  background: kumulatif.puReal >= kumulatif.puReal2025 ? '#f0fdf4' : '#fef2f2',
                  padding: '1px 5px', borderRadius: 'var(--radius-full)',
                }}>
                  {kumulatif.puReal >= kumulatif.puReal2025 ? '▲' : '▼'}{' '}
                  {Math.abs(((kumulatif.puReal - kumulatif.puReal2025) / kumulatif.puReal2025) * 100).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Card 3: BK */}
        <div className="sn-card sn-slide-up stagger-3" style={cardStyle(PIE_COLORS[2])}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${PIE_COLORS[2]}18, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={cardHeaderStyle}>
            <span style={labelStyle}>BK/PU</span>
            <div className="sn-kpi-icon" title={`Real/RKAP: ${bkPuAchPct.toFixed(2)}%`} style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', background: `${bkPuAch.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <bkPuAch.Icon style={{ width: '14px', height: '14px', color: bkPuAch.color }} />
            </div>
          </div>
          <div style={{ ...bigNumStyle(false), color: kumulatif.bkPuRealPct > 0 ? c.text : c.textSubtle }}>
            {kumulatif.bkPuRealPct > 0
              ? <AnimatedNumber value={kumulatif.bkPuRealPct} format={n => `${n.toFixed(2)}%`} />
              : '—'}
          </div>
          <Sparkline data={monthlySeries.filter(m => m.bkpu > 0)} dataKey="bkpu" color={bkPuAch.color} id="spkBkPu" />
          {bkPuAchPct > 0 && progressBar(bkPuAchPct, bkPuAch.color, `Real / RKAP ${bulanLabel}`)}
          {bkPuTargetPct > 0 && progressBar(bkPuTargetPct, '#3b82f6', `Real s.d ${bulanLabel} / RKAP ${filters.tahun ?? 2026}`)}
          <div style={dividerStyle} />
          <div style={infoRowStyle}>
            <span style={{ color: c.textMuted }}>Target RKAP S.D {bulanLabel}</span>
            <span style={{ fontWeight: 700, color: c.text }}>{bkPuRkapSdPct > 0 ? `${bkPuRkapSdPct.toFixed(2)}%` : '—'}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={{ color: c.textMuted }}>Target RKAP {filters.tahun ?? 2026}</span>
            <span style={{ fontWeight: 700, color: c.text }}>{bkPuRkapAllPct > 0 ? `${bkPuRkapAllPct.toFixed(2)}%` : '—'}</span>
          </div>
          {!searchAktif && (
          <div style={{ ...infoRowStyle, marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown style={{ width: '9px', height: '9px', color: c.textSubtle }} />
              <span style={{ color: c.textMuted }}>YoY 2025</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ color: c.textSubtle }}>{bkPu2025 > 0 ? `${bkPu2025.toFixed(2)}%` : '—'}</span>
              {bkPu2025 > 0 && kumulatif.bkPuRealPct > 0 && (
                <span style={{
                  fontSize: '9px', fontWeight: 700,
                  color: kumulatif.bkPuRealPct <= bkPu2025 ? '#16a34a' : '#dc2626',
                  background: kumulatif.bkPuRealPct <= bkPu2025 ? '#f0fdf4' : '#fef2f2',
                  padding: '1px 5px', borderRadius: 'var(--radius-full)',
                }}>
                  {kumulatif.bkPuRealPct <= bkPu2025 ? '▼' : '▲'}{' '}
                  {Math.abs(((kumulatif.bkPuRealPct - bkPu2025) / bkPu2025) * 100).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Card 4: LABA KOTOR */}
        <div className="sn-card sn-slide-up stagger-4" style={cardStyle(PIE_COLORS[3])}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${PIE_COLORS[3]}18, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={cardHeaderStyle}>
            <span style={labelStyle}>LABA BRUTO</span>
            <div className="sn-kpi-icon" title={`Real/RKAP: ${labaPct.toFixed(2)}%`} style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', background: `${labaAch.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <labaAch.Icon style={{ width: '14px', height: '14px', color: labaAch.color }} />
            </div>
          </div>
          <div style={bigNumStyle(kumulatif.labaReal < 0)}>
            <AnimatedNumber value={kumulatif.labaReal} format={fShort} />
          </div>
          <Sparkline data={monthlySeries} dataKey="laba" color={labaAch.color} id="spkLaba" />
          {kumulatif.labaRkap !== 0 && progressBar(labaPct, undefined, `Real / RKAP ${bulanLabel}`)}
          {labaTargetPct !== 0 && progressBar(labaTargetPct, '#3b82f6', `Real s.d ${bulanLabel} / RKAP ${filters.tahun ?? 2026}`)}
          <div style={dividerStyle} />
          <div style={infoRowStyle}>
            <span style={{ color: c.textMuted }}>Target RKAP S.D {bulanLabel}</span>
            <span style={{ fontWeight: 700, color: c.text }}>{fShort(kumulatif.labaRkap)}</span>
          </div>
          <div style={infoRowStyle}>
            <span style={{ color: c.textMuted }}>Target RKAP {filters.tahun ?? 2026}</span>
            <span style={{ fontWeight: 700, color: c.text }}>{fShort(kumulatif.labaRkapTotal)}</span>
          </div>
          {!searchAktif && (
          <div style={{ ...infoRowStyle, marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown style={{ width: '9px', height: '9px', color: c.textSubtle }} />
              <span style={{ color: c.textMuted }}>YoY 2025</span>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{ color: c.textSubtle }}>{fShort(kumulatif.labaReal2025)}</span>
              {kumulatif.labaReal2025 !== 0 && (
                <span style={{
                  fontSize: '9px', fontWeight: 700,
                  color: kumulatif.labaReal >= kumulatif.labaReal2025 ? '#16a34a' : '#dc2626',
                  background: kumulatif.labaReal >= kumulatif.labaReal2025 ? '#f0fdf4' : '#fef2f2',
                  padding: '1px 5px', borderRadius: 'var(--radius-full)',
                }}>
                  {kumulatif.labaReal >= kumulatif.labaReal2025 ? '▲' : '▼'}{' '}
                  {kumulatif.labaReal2025 !== 0
                    ? `${Math.abs(((kumulatif.labaReal - kumulatif.labaReal2025) / Math.abs(kumulatif.labaReal2025)) * 100).toFixed(2)}%`
                    : ''}
                </span>
              )}
            </div>
          </div>
          )}
        </div>

        {/* Card 5: KINERJA QSHE */}
        <div className="sn-card sn-slide-up stagger-5" style={cardStyle(PIE_COLORS[4])}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: `radial-gradient(circle, ${PIE_COLORS[4]}18, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={cardHeaderStyle}>
            <span style={labelStyle}>KINERJA QSHE</span>
            <div className="sn-kpi-icon" style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-md)', background: `${qsheColor}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldCheck style={{ width: '14px', height: '14px', color: qsheColor }} />
            </div>
          </div>
          <div style={{ ...bigNumStyle(false), color: kumulatif.qsheRataRata > 0 ? qsheColor : c.textSubtle }}>
            <AnimatedNumber value={kumulatif.qsheRataRata} format={fmtScore} />
          </div>
          <Sparkline data={monthlySeries.filter(m => m.qshe > 0)} dataKey="qshe" color={qsheColor} id="spkQshe" />
          {kumulatif.qsheRataRata > 0 && progressBar(kumulatif.qsheRataRata, qsheColor)}
          <div style={dividerStyle} />
          <div style={infoRowStyle}>
            <span style={{ color: c.textMuted }}>Target RKAP {filters.tahun ?? 2026}</span>
            <span style={{ fontWeight: 700, color: c.text }}>
              {kumulatif.qsheTarget > 0 ? kumulatif.qsheTarget.toFixed(1) : '—'}
            </span>
          </div>
          <div style={infoRowStyle}>
            <span style={{
              fontWeight: 700,
              color: kumulatif.qsheRataRata >= 85 ? '#16a34a' : kumulatif.qsheRataRata >= 70 ? '#d97706' : '#dc2626',
            }}>
            </span>
          </div>
        </div>
      </div>

      <CommercialPerformance data={data} filters={filters} dark={dark} />
      <OperationalPerformance data={data} filters={filters} dark={dark} />

      {/* Matriks detail kinerja proyek dipindah ke menu Project Performance */}

      {/* Peta persebaran (gabungan dari menu Peta Persebaran) */}
      <Suspense fallback={
        <div className="sn-card" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textMuted, fontSize: '13px', gap: '10px' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${c.border}`, borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite' }} />
          Memuat peta persebaran…
        </div>
      }>
        <MapPanel allProyek={allProyekFiltered} dark={dark} />
      </Suspense>

      {/* Analitik dari database all proyek 2021-2026 */}
      <PortfolioAnalytics allProyek={allProyekFiltered} dark={dark} />
    </div>
  );
};

// Memo: buka/tutup sidebar atau ketikan pencarian tidak boleh me-render ulang
// belasan chart di dalam view ini selama datanya tidak berubah
export default React.memo(OverviewView);