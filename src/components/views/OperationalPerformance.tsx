import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTip,
  ResponsiveContainer,
} from 'recharts';
import { THEME, MONTH_LABELS } from '../../constants';
import type { Theme } from '../../constants';
import type { UnifiedProjectData, Filters } from '../../types';
import { fShort, fFull } from '../../utils';
import AnimatedNumber from './../AnimatedNumber';

interface Props {
  data: UnifiedProjectData[];
  filters: Filters;
  dark: boolean;
}

type RankTab = 'pu' | 'bkpu' | 'laba';

const RANK_TABS: { key: RankTab; label: string; judul: string; sub: string }[] = [
  { key: 'pu', label: 'PU', judul: 'Top 5 PU Tidak Tercapai', sub: '' },
  { key: 'bkpu', label: 'BK/PU', judul: 'Top 5 BK/PU Tertinggi', sub: '' },
  { key: 'laba', label: 'Laba Bruto', judul: 'Top 5 Laba Tidak Tercapai', sub: '' },
];

const OperationalPerformance: React.FC<Props> = ({ data, filters, dark }) => {
  const c: Theme = dark ? THEME.dark : THEME.light;
  const [rankTab, setRankTab] = useState<RankTab>('pu');
  const rankInfo = RANK_TABS.find(t => t.key === rankTab)!;
  const metrikLabel = rankTab === 'laba' ? 'Laba Bruto' : rankTab === 'bkpu' ? 'BK/PU' : 'PU';

  // Jumlah mentah per bulan; rasio BK/PU dihitung dari agregat (ΣBK/ΣPU)
  const monthlyRaw = useMemo(() => {
    const bulanBatas = filters.bulan ?? 12;
    const acc = new Map<number, { rkap: number; real: number; labaRkap: number; labaReal: number; bkRkap: number; bkReal: number }>();
    data.forEach(d => d.histori_bulanan.forEach(h => {
      if (filters.tahun !== null && h.tahun !== filters.tahun) return;
      if (h.bulanIndex > bulanBatas) return;
      if (!acc.has(h.bulanIndex)) acc.set(h.bulanIndex, { rkap: 0, real: 0, labaRkap: 0, labaReal: 0, bkRkap: 0, bkReal: 0 });
      const a = acc.get(h.bulanIndex)!;
      a.rkap += h.rkap; a.real += h.real;
      a.labaRkap += h.labaRkap; a.labaReal += h.labaReal;
      a.bkRkap += h.bkRkap; a.bkReal += h.bkReal;
    }));
    return Array.from(acc.entries()).sort((a, b) => a[0] - b[0]);
  }, [data, filters.tahun, filters.bulan]);

  const toMetric = (a: { rkap: number; real: number; labaRkap: number; labaReal: number; bkRkap: number; bkReal: number }) => {
    if (rankTab === 'laba') return { RKAP: a.labaRkap, Realisasi: a.labaReal };
    if (rankTab === 'bkpu') return {
      RKAP: a.rkap > 0 ? (a.bkRkap / a.rkap) * 100 : 0,
      Realisasi: a.real > 0 ? (a.bkReal / a.real) * 100 : 0,
    };
    return { RKAP: a.rkap, Realisasi: a.real };
  };

  const monthly = useMemo(() =>
    monthlyRaw.map(([m, a]) => ({ month: MONTH_LABELS[m] ?? String(m), ...toMetric(a) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [monthlyRaw, rankTab]);

  // Versi kumulatif: akumulasi jumlah mentah dulu, baru dihitung metriknya
  const monthlyKumulatif = useMemo(() => {
    const acc = { rkap: 0, real: 0, labaRkap: 0, labaReal: 0, bkRkap: 0, bkReal: 0 };
    return monthlyRaw.map(([m, a]) => {
      acc.rkap += a.rkap; acc.real += a.real;
      acc.labaRkap += a.labaRkap; acc.labaReal += a.labaReal;
      acc.bkRkap += a.bkRkap; acc.bkReal += a.bkReal;
      return { month: MONTH_LABELS[m] ?? String(m), ...toMetric(acc) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthlyRaw, rankTab]);

  const top5 = useMemo(() => {
    const rows = data.map(d => ({
      id: d.id_project,
      nama: d.project_name,
      rkap: rankTab === 'laba' ? d.laba_rkap : d.pu_rkap,
      real: rankTab === 'laba' ? d.laba_real : d.pu_real,
      deviasi: rankTab === 'laba' ? d.deviasi_laba : d.deviasi_pu,
      // BK/PU realisasi (kolom W = U/T) & target RKAP (kolom S = Q/P)
      ratioReal: d.pu_real > 0 ? (d.bk_real / d.pu_real) * 100 : 0,
      ratioRkap: d.pu_rkap > 0 ? (d.bk_rkap / d.pu_rkap) * 100 : 0,
    }));
    if (rankTab === 'bkpu')
      return rows.filter(r => r.ratioReal > 0).sort((a, b) => b.ratioReal - a.ratioReal).slice(0, 5);
    return rows.filter(r => r.deviasi < 0).sort((a, b) => a.deviasi - b.deviasi).slice(0, 5);
  }, [data, rankTab]);

  const tipStyle = {
    contentStyle: {
      background: c.card,
      border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-md)',
      fontSize: '12px',
      color: c.text,
      boxShadow: 'var(--shadow-lg)',
    },
    formatter: (v: any) => fFull(Number(v)),
  };

  const trendChart = (chartData: typeof monthly) => (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
        <XAxis dataKey="month" stroke={c.textSubtle} fontSize={10} tickLine={false} axisLine={false} />
        <YAxis stroke={c.textSubtle} fontSize={10} tickLine={false} axisLine={false}
          tickFormatter={v => rankTab === 'bkpu' ? `${Number(v).toFixed(0)}%` : `${(v / 1e9).toFixed(0)}M`} />
        <RechartsTip contentStyle={tipStyle.contentStyle}
          formatter={(v: any) => rankTab === 'bkpu' ? `${Number(v).toFixed(1)}%` : fFull(Number(v))} />
        <Line type="monotone" dataKey="RKAP" stroke={c.borderStrong} strokeWidth={1.5} strokeDasharray="4 4" dot={false}
          animationDuration={600} animationEasing="ease-out" />
        <Line type="monotone" dataKey="Realisasi" name={metrikLabel} stroke="#1e3a8a" strokeWidth={2.5} dot={{ r: 4, fill: '#1e3a8a', strokeWidth: 0 }} activeDot={{ r: 6 }}
          animationDuration={600} animationEasing="ease-out" />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div
      className="sn-card sn-slide-up"
      style={{
        background: c.card,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: c.text,
              letterSpacing: '-0.02em',
              marginBottom: '3px',
            }}
          >
            Operational Performance
          </h3>
          <p style={{ fontSize: '12px', color: c.textMuted }}>
            Komparasi RKAP vs Realisasi {metrikLabel}
          </p>
        </div>
        {/* Filter metrik: memengaruhi tren kumulatif, tren bulanan, dan Top 5 */}
        <div className="sn-pill-scroll" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: 'var(--radius-md)', background: c.bgMuted, border: `1px solid ${c.border}` }}>
          {RANK_TABS.map(tab => (
            <button
              key={tab.key}
              className="sn-btn"
              onClick={() => setRankTab(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: rankTab === tab.key ? '#1e293b' : 'transparent',
                color: rankTab === tab.key ? '#ffffff' : c.textMuted,
                transition: 'all 0.25s var(--ease-out)',
                transform: rankTab === tab.key ? 'scale(1.04)' : 'scale(1)',
                boxShadow: rankTab === tab.key ? '0 2px 8px rgba(15,23,42,0.25)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rg-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
        <div>
          <h4
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: c.text,
              marginBottom: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            Tren Kinerja Kumulatif
          </h4>
          <p style={{ fontSize: '11px', color: c.textMuted, marginBottom: '10px' }}>
            Akumulasi RKAP vs Realisasi {metrikLabel} s.d {monthly[monthly.length - 1]?.month ?? '-'}
          </p>
          <div style={{ height: '190px' }}>
            {trendChart(monthlyKumulatif)}
          </div>
        </div>

        <div>
          <h4
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: c.text,
              marginBottom: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            Tren Kinerja Bulanan
          </h4>
          <p style={{ fontSize: '11px', color: c.textMuted, marginBottom: '10px' }}>
            Komparasi RKAP vs Realisasi {metrikLabel}
          </p>
          <div style={{ height: '190px' }}>
            {trendChart(monthly)}
          </div>
        </div>

        <div>
          <h4
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: c.text,
              marginBottom: '2px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            ⚠ {rankInfo.judul}
          </h4>
          <p style={{ fontSize: '11px', color: c.textMuted, marginBottom: '10px' }}>
            {rankInfo.sub}
          </p>
          <div key={`top-${rankTab}`} className="sn-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {top5.map(d => (
              <div
                key={d.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: c.kritis.bg,
                  border: `1px solid ${c.kritis.border}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: c.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '140px',
                    }}
                    title={d.nama}
                  >
                    {d.nama}
                  </span>
                  <span
                    style={{ fontSize: '12px', fontWeight: 800, color: c.kritis.text, flexShrink: 0 }}
                    title={rankTab === 'bkpu' ? 'BK/PU realisasi' : rankTab === 'laba' ? 'Deviasi laba terhadap RKAP' : 'Deviasi PU terhadap RKAP'}
                  >
                    {rankTab === 'bkpu'
                      ? <AnimatedNumber value={d.ratioReal} format={n => `${n.toFixed(2)}%`} />
                      : <AnimatedNumber value={d.deviasi} format={fShort} />}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: c.textMuted, flexWrap: 'wrap' }}>
                  {rankTab === 'bkpu' ? (
                    <span>BK/PU RKAP <b style={{ color: c.text }}>{d.ratioRkap > 0 ? `${d.ratioRkap.toFixed(2)}%` : '—'}</b></span>
                  ) : (
                    <>
                      <span>{metrikLabel} RKAP <b style={{ color: c.text }}>{fShort(d.rkap)}</b></span>
                      <span>{metrikLabel} Real <b style={{ color: d.real < 0 ? c.kritis.text : c.text }}>{fShort(d.real)}</b></span>
                    </>
                  )}
                </div>
              </div>
            ))}
            {top5.length === 0 && (
              <div
                style={{
                  fontSize: '11px',
                  color: c.textMuted,
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                Tidak ada proyek bermasalah pada kategori ini
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default React.memo(OperationalPerformance);
