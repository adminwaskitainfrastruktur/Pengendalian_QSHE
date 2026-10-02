import React, { useMemo, useState, useEffect } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTip, ResponsiveContainer, Legend,
  AreaChart, Area,
} from 'recharts';
import { ShieldCheck, HardHat, BadgeCheck, Factory } from 'lucide-react';
import { THEME, MONTH_LABELS } from '../../constants';
import type { Theme } from '../../constants';
import type { UnifiedProjectData, Filters } from '../../types';
import AnimatedNumber from './../AnimatedNumber';

interface Props {
  rows: UnifiedProjectData[];   // seluruh baris segmentasi terpilih (AMP / Workshop)
  segment: string;
  filters: Filters;
  dark: boolean;
}

// Skala fallback saat target (kolom AM) belum tersedia
const scoreColorDefault = (n: number) => n >= 85 ? '#10b981' : n >= 70 ? '#f59e0b' : '#ef4444';

// ─── Gauge melingkar dengan animasi stroke ────────────────
const Gauge: React.FC<{ value: number; size: number; stroke: number; track: string; textColor: string; ringColor: string; sub?: string }> =
  ({ value, size, stroke, track, textColor, ringColor, sub }) => {
    const r = (size - stroke) / 2;
    const C = 2 * Math.PI * r;
    const [offset, setOffset] = useState(C);
    const color = ringColor;
    useEffect(() => {
      const t = setTimeout(() => setOffset(C * (1 - Math.min(Math.max(value, 0), 100) / 100)), 80);
      return () => clearTimeout(t);
    }, [value, C]);
    return (
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
          <circle className="sn-gauge-ring" cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={offset} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size > 140 ? '34px' : '20px', fontWeight: 800, color: textColor, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {value > 0 ? <AnimatedNumber value={value} format={n => n.toFixed(1)} /> : '—'}
          </span>
          {sub && <span style={{ fontSize: '10px', fontWeight: 600, color: color, marginTop: '4px' }}>{sub}</span>}
        </div>
      </div>
    );
  };

const QshePanel: React.FC<Props> = ({ rows, segment, filters, dark }) => {
  const c: Theme = dark ? THEME.dark : THEME.light;
  const bulanBatas = filters.bulan ?? 12;
  const tahun = filters.tahun;

  // Target QSHE = rata-rata kolom AM dari baris terfilter (setahun, tak dibatasi bulan)
  const targetAvg = useMemo(() => {
    const vals: number[] = [];
    rows.forEach(d => d.histori_bulanan.forEach(h => {
      if (tahun !== null && h.tahun !== tahun) return;
      if (h.qsheTarget > 0) vals.push(h.qsheTarget);
    }));
    return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
  }, [rows, tahun]);

  // Pewarnaan: skor di bawah rata-rata target = merah, di atasnya = hijau.
  // Bila kolom AM belum terisi, pakai skala default 85/70
  const scoreColor = (n: number) => targetAvg > 0
    ? (n >= targetAvg ? '#10b981' : '#ef4444')
    : scoreColorDefault(n);
  const scoreLabel = (n: number) => {
    if (n <= 0) return '—';
    if (targetAvg > 0) return n >= targetAvg ? 'Capai Target' : 'Di Bawah Target';
    return n >= 85 ? 'Baik' : n >= 70 ? 'Cukup' : 'Perlu Perhatian';
  };

  // Rata-rata QSHE/SHE/Quality per bulan untuk tren
  const monthly = useMemo(() => {
    const acc = new Map<number, { qshe: number[]; she: number[]; quality: number[] }>();
    rows.forEach(d => d.histori_bulanan.forEach(h => {
      if (tahun !== null && h.tahun !== tahun) return;
      if (h.bulanIndex > bulanBatas || h.qshe <= 0) return;
      if (!acc.has(h.bulanIndex)) acc.set(h.bulanIndex, { qshe: [], she: [], quality: [] });
      const a = acc.get(h.bulanIndex)!;
      a.qshe.push(h.qshe);
      if (h.she > 0) a.she.push(h.she);
      if (h.quality > 0) a.quality.push(h.quality);
    }));
    const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
    return Array.from(acc.entries())
      .map(([m, a]) => ({ bulanIndex: m, month: MONTH_LABELS[m] ?? String(m), qshe: avg(a.qshe), she: avg(a.she), quality: avg(a.quality) }))
      .sort((a, b) => a.bulanIndex - b.bulanIndex);
  }, [rows, tahun, bulanBatas]);

  const latest = monthly.length > 0 ? monthly[monthly.length - 1] : null;

  // Kinerja QSHE = rata-rata unit HANYA pada bulan terpilih (bukan kumulatif).
  // Sesuai filter bulan: satu bulan saja.
  const overall = useMemo(() => {
    const q: number[] = [], s: number[] = [], ql: number[] = [];
    rows.forEach(d => d.histori_bulanan.forEach(h => {
      if (tahun !== null && h.tahun !== tahun) return;
      if (h.bulanIndex !== bulanBatas || h.qshe <= 0) return;
      q.push(h.qshe);
      if (h.she > 0) s.push(h.she);
      if (h.quality > 0) ql.push(h.quality);
    }));
    const avg = (arr: number[]) => arr.length ? arr.reduce((x, y) => x + y, 0) / arr.length : 0;
    return { qshe: avg(q), she: avg(s), quality: avg(ql), count: q.length };
  }, [rows, tahun, bulanBatas]);

  // Skor terakhir per unit
  const units = useMemo(() =>
    rows.map(d => {
      const hist = d.histori_bulanan
        .filter(h => (tahun === null || h.tahun === tahun) && h.bulanIndex <= bulanBatas && h.qshe > 0)
        .sort((a, b) => a.bulanIndex - b.bulanIndex);
      const last = hist[hist.length - 1];
      return {
        id: d.id_project,
        name: d.project_name,
        qshe: last?.qshe ?? 0, she: last?.she ?? 0, quality: last?.quality ?? 0,
        bulan: last ? (MONTH_LABELS[last.bulanIndex] ?? '') : '',
        spark: hist.map(h => ({ m: h.bulanIndex, qshe: h.qshe })),
      };
    }).filter(u => u.spark.length > 0).sort((a, b) => b.qshe - a.qshe),
    [rows, tahun, bulanBatas]);

  const tipStyle = {
    contentStyle: {
      background: c.card, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-md)', fontSize: '12px',
      color: c.text, boxShadow: 'var(--shadow-lg)',
    },
    formatter: (v: any) => Number(v).toFixed(1),
  };

  const subBar = (label: string, value: number, Icon: React.ElementType) => (
    <div key={label} style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div className="sn-kpi-icon" style={{ width: '24px', height: '24px', borderRadius: 'var(--radius-sm)', background: `${scoreColor(value)}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon style={{ width: '12px', height: '12px', color: scoreColor(value) }} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
        </div>
        <span style={{ fontSize: '15px', fontWeight: 800, color: value > 0 ? scoreColor(value) : c.textSubtle }}>
          {value > 0 ? <AnimatedNumber value={value} format={n => n.toFixed(1)} /> : '—'}
        </span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', background: c.chartBar, overflow: 'hidden' }}>
        <div className="sn-progress-bar" style={{ height: '100%', width: `${Math.min(value, 100)}%`, background: scoreColor(value), borderRadius: '3px' }} />
      </div>
    </div>
  );

  if (units.length === 0) {
    return (
      <div className="sn-view-enter sn-card" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', padding: '60px', textAlign: 'center' }}>
        <ShieldCheck style={{ width: '32px', height: '32px', color: c.textSubtle, margin: '0 auto 10px' }} />
        <p style={{ fontSize: '14px', fontWeight: 600, color: c.text, marginBottom: '4px' }}>Belum ada penilaian QSHE</p>
        <p style={{ fontSize: '12px', color: c.textMuted }}>Data QSHE {segment} untuk periode ini belum tersedia di sumber.</p>
      </div>
    );
  }

  return (
    <div className="sn-view-enter" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Hero: gauge utama + tren */}
      <div className="rg-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '14px' }}>
        <div className="sn-card sn-slide-up stagger-1" style={{ background: c.kpiGradient, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', padding: '26px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: `radial-gradient(circle, ${scoreColor(overall.qshe)}14, transparent 70%)`, pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <div className="sn-kpi-icon" style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-md)', background: `${scoreColor(overall.qshe)}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Factory style={{ width: '15px', height: '15px', color: scoreColor(overall.qshe) }} />
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: c.text, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Kinerja QSHE {segment}</h3>
              <p style={{ fontSize: '10px', color: c.textMuted, fontWeight: 600 }}>
                Rata-rata bulan {MONTH_LABELS[bulanBatas] ?? bulanBatas} · {overall.count} unit
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Gauge value={overall.qshe} size={158} stroke={13} track={c.chartBar} textColor={c.text} ringColor={scoreColor(overall.qshe)} sub={scoreLabel(overall.qshe)} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {subBar('Kinerja SHE', overall.she, HardHat)}
              {subBar('Kinerja Quality', overall.quality, BadgeCheck)}
              <div style={{ fontSize: '10px', color: c.textSubtle }}>
                {targetAvg > 0 && <>Target RKAP: <b style={{ color: c.textMuted }}>{targetAvg.toFixed(1)}</b>{latest ? ' · ' : ''}</>}
                {latest && <>Penilaian terakhir: <b style={{ color: c.textMuted }}>{latest.month}</b> · QSHE {latest.qshe.toFixed(1)}</>}
              </div>
            </div>
          </div>
        </div>

        <div className="sn-card sn-slide-up stagger-2" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: c.text, marginBottom: '3px', letterSpacing: '-0.02em' }}>Tren Penilaian Bulanan</h3>
          <p style={{ fontSize: '12px', color: c.textMuted, marginBottom: '14px' }}>Perkembangan skor QSHE, SHE, dan Quality per bulan</p>
          <div style={{ height: '210px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthly} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
                <XAxis dataKey="month" stroke={c.textSubtle} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke={c.textSubtle} fontSize={11} tickLine={false} axisLine={false} />
                <RechartsTip {...tipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                <Line dataKey="qshe" name="QSHE" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 3, fill: '#fff' }} animationDuration={450} animationEasing="ease-out" />
                <Line dataKey="she" name="SHE" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }} animationDuration={450} animationBegin={60} animationEasing="ease-out" />
                <Line dataKey="quality" name="Quality" stroke="#06b6d4" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: '#06b6d4', strokeWidth: 0 }} animationDuration={450} animationBegin={120} animationEasing="ease-out" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Kartu per unit */}
      <div className="rg-3" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(units.length, 3)}, 1fr)`, gap: '14px' }}>
        {units.map((u, i) => (
          <div key={u.id} className={`sn-card sn-slide-up stagger-${Math.min(i + 1, 5)}`}
            style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '90px', height: '90px', borderRadius: '50%', background: `radial-gradient(circle, ${scoreColor(u.qshe)}12, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: c.text, letterSpacing: '-0.01em', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.name}>{u.name}</h4>
                <span style={{ fontSize: '10px', color: c.textMuted, fontWeight: 600 }}>Penilaian {u.bulan} · skor {scoreLabel(u.qshe).toLowerCase()}</span>
              </div>
              <Gauge value={u.qshe} size={62} stroke={6} track={c.chartBar} textColor={c.text} ringColor={scoreColor(u.qshe)} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {[['SHE', u.she], ['Quality', u.quality]].map(([label, val]) => (
                <div key={String(label)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: c.textMuted, width: '46px', flexShrink: 0, textTransform: 'uppercase' }}>{label}</span>
                  <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: c.chartBar, overflow: 'hidden' }}>
                    <div className="sn-progress-bar" style={{ height: '100%', width: `${Math.min(Number(val), 100)}%`, background: scoreColor(Number(val)), borderRadius: '3px' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: scoreColor(Number(val)), width: '36px', textAlign: 'right', flexShrink: 0 }}>{Number(val) > 0 ? Number(val).toFixed(1) : '—'}</span>
                </div>
              ))}
            </div>
            <div style={{ height: '46px', marginLeft: '-6px', marginRight: '-6px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={u.spark} margin={{ top: 4, right: 6, bottom: 0, left: 6 }}>
                  <defs>
                    <linearGradient id={`gUnit${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={scoreColor(u.qshe)} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={scoreColor(u.qshe)} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={[0, 100]} hide />
                  <Area type="monotone" dataKey="qshe" stroke={scoreColor(u.qshe)} strokeWidth={2} fill={`url(#gUnit${i})`} dot={false} animationDuration={450} animationEasing="ease-out" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(QshePanel);
