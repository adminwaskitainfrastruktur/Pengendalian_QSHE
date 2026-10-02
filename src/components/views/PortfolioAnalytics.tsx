import React, { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, BarChart,
} from 'recharts';
import { Briefcase, Building2, CheckCircle2, FolderKanban, Wallet } from 'lucide-react';
import { THEME, PIE_COLORS } from '../../constants';
import type { Theme } from '../../constants';
import type { AllProyekRow } from '../../types';
import { fShort, fFull, fNum } from '../../utils';
import AnimatedNumber from './../AnimatedNumber';

interface Props {
  allProyek: AllProyekRow[];
  dark: boolean;
}

const PortfolioAnalytics: React.FC<Props> = ({ allProyek, dark }) => {
  const c: Theme = dark ? THEME.dark : THEME.light;

  const stats = useMemo(() => {
    let selesai = 0, annual = 0, internal = 0, eksternal = 0, nk = 0, pu = 0, bk = 0;
    allProyek.forEach(p => {
      if (/selesai/i.test(p.status)) selesai += 1;
      else if (/annual/i.test(p.status)) annual += 1;
      if (/internal/i.test(p.internal_eksternal)) internal += 1;
      else if (/eksternal|external/i.test(p.internal_eksternal)) eksternal += 1;
      nk += p.nilai_kontrak; pu += p.pu_sd; bk += p.bk_sd;
    });
    return { total: allProyek.length, selesai, annual, internal, eksternal, nk, pu, bk };
  }, [allProyek]);

  const annualTrend = useMemo(() => {
    const byYear = new Map<number, { pu: number; bk: number }>();
    allProyek.forEach(p => p.annual.forEach(a => {
      if (!byYear.has(a.tahun)) byYear.set(a.tahun, { pu: 0, bk: 0 });
      const y = byYear.get(a.tahun)!;
      y.pu += a.pu; y.bk += a.bk;
    }));
    return Array.from(byYear.entries())
      .map(([tahun, v]) => ({ tahun: String(tahun), pu: v.pu, bk: v.bk, laba: v.pu - v.bk }))
      .filter(y => y.pu !== 0 || y.bk !== 0)
      .sort((a, b) => Number(a.tahun) - Number(b.tahun));
  }, [allProyek]);

  const topPemberiKerja = useMemo(() => {
    const map = new Map<string, { pu: number; count: number }>();
    allProyek.forEach(p => {
      const k = p.pemberi_kerja;
      if (!k || k === 'Tidak Diketahui' || k === '0') return;
      if (!map.has(k)) map.set(k, { pu: 0, count: 0 });
      const v = map.get(k)!;
      v.pu += p.pu_sd; v.count += 1;
    });
    return Array.from(map.entries())
      .map(([name, v]) => ({
        name: name.length > 28 ? name.slice(0, 28) + '…' : name,
        fullName: name, pu: v.pu, count: v.count,
      }))
      .sort((a, b) => b.pu - a.pu)
      .slice(0, 8);
  }, [allProyek]);

  const intEksPie = useMemo(() => {
    let intPu = 0, eksPu = 0;
    allProyek.forEach(p => {
      if (/internal/i.test(p.internal_eksternal)) intPu += p.pu_sd;
      else if (/eksternal|external/i.test(p.internal_eksternal)) eksPu += p.pu_sd;
    });
    return [
      { name: 'Internal', value: intPu, count: stats.internal, color: '#3b82f6' },
      { name: 'Eksternal', value: eksPu, count: stats.eksternal, color: '#10b981' },
    ];
  }, [allProyek, stats]);

  const tipStyle = {
    contentStyle: {
      background: c.card, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-md)', fontSize: '12px',
      color: c.text, boxShadow: 'var(--shadow-lg)',
    },
    formatter: (v: any) => fFull(Number(v)),
    cursor: { fill: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' },
  };

  const statChips = [
    { Icon: FolderKanban, label: 'Total Proyek', value: stats.total, fmt: (n: number) => fNum(n), color: '#3b82f6', sub: '2021–2026' },
    { Icon: CheckCircle2, label: 'Selesai', value: stats.selesai, fmt: (n: number) => fNum(n), color: '#10b981', sub: `${stats.annual} kontribusi annual` },
    { Icon: Building2, label: 'Internal · Eksternal', value: stats.internal, fmt: (n: number) => `${fNum(n)} · ${fNum(stats.eksternal)}`, color: '#8b5cf6', sub: 'komposisi pemberi kerja' },
    { Icon: Wallet, label: 'Total Nilai Kontrak', value: stats.nk, fmt: fShort, color: '#f59e0b', sub: 'seluruh proyek' },
    { Icon: Briefcase, label: 'Total PU Direalisasi', value: stats.pu, fmt: fShort, color: '#06b6d4', sub: `BK ${fShort(stats.bk)}` },
  ];

  if (allProyek.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: c.text, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          📁 Analitik Database All Proyek
        </h2>
        <div style={{ flex: 1, height: '1px', background: c.border }} />
        <span style={{ fontSize: '11px', color: c.textMuted, fontWeight: 600, whiteSpace: 'nowrap' }}>Sumber: sheet "all proyek" · {fNum(stats.total)} proyek</span>
      </div>

      {/* Stat chips */}
      <div className="rg-chips" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
        {statChips.map((s, i) => (
          <div key={s.label} className={`sn-card sn-slide-up stagger-${i + 1}`}
            style={{ background: c.kpiGradient, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', padding: '14px 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-16px', right: '-16px', width: '64px', height: '64px', borderRadius: '50%', background: `radial-gradient(circle, ${s.color}16, transparent 70%)`, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div className="sn-kpi-icon" style={{ width: '26px', height: '26px', borderRadius: 'var(--radius-md)', background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.Icon style={{ width: '13px', height: '13px', color: s.color }} />
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: c.text, letterSpacing: '-0.03em', marginBottom: '2px' }}>
              <AnimatedNumber value={s.value} format={s.fmt} />
            </div>
            <div style={{ fontSize: '10px', color: c.textSubtle }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Satu baris: Historis tahunan · Top Pemberi Kerja · Internal/Eksternal */}
      <div className="rg-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
        <div className="sn-card sn-slide-up" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', padding: '24px', minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: c.text, marginBottom: '3px', letterSpacing: '-0.02em' }}>Kinerja Historis Tahunan</h3>
          <p style={{ fontSize: '12px', color: c.textMuted, marginBottom: '18px' }}>PU dan laba kotor per tahun dari seluruh database proyek</p>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={annualTrend} margin={{ top: 8, right: 8, bottom: 0, left: -14 }} barGap={4}>
                <defs>
                  <linearGradient id="gAnnualPu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
                <XAxis dataKey="tahun" stroke={c.textSubtle} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={c.textSubtle} fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1e9).toFixed(0)}M`} />
                <RechartsTip {...tipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                <Bar dataKey="pu" name="Pendapatan Usaha" fill="url(#gAnnualPu)" radius={[5, 5, 0, 0]} maxBarSize={34} animationDuration={450} animationEasing="ease-out" />
                <Line dataKey="laba" name="Laba Kotor" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 3, fill: '#fff' }} animationDuration={450} animationBegin={120} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Pemberi Kerja — di tengah, mengapit historis & internal/eksternal */}
        <div className="sn-card sn-slide-up" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', padding: '24px', minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: c.text, marginBottom: '3px', letterSpacing: '-0.02em' }}>Top Pemberi Kerja</h3>
          <p style={{ fontSize: '12px', color: c.textMuted, marginBottom: '18px' }}>8 klien dengan kontribusi PU terbesar sepanjang database</p>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPemberiKerja} layout="vertical" margin={{ top: 4, right: 20, bottom: 0, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.border} horizontal={false} />
                <XAxis type="number" stroke={c.textSubtle} fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1e9).toFixed(0)}M`} />
                <YAxis type="category" dataKey="name" stroke={c.textSubtle} fontSize={9} tickLine={false} axisLine={false} width={110} />
                <RechartsTip contentStyle={tipStyle.contentStyle} formatter={(v: any, _n: any, entry: any) => [`${fShort(Number(v))} · ${entry?.payload?.count ?? 0} proyek`, entry?.payload?.fullName]} cursor={tipStyle.cursor} />
                <Bar dataKey="pu" name="Total PU" radius={[0, 5, 5, 0]} maxBarSize={16} animationDuration={450} animationEasing="ease-out">
                  {topPemberiKerja.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="sn-card sn-slide-up" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', padding: '24px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: c.text, marginBottom: '3px', letterSpacing: '-0.02em' }}>Internal vs Eksternal</h3>
          <p style={{ fontSize: '12px', color: c.textMuted, marginBottom: '8px' }}>Porsi nilai PU berdasarkan sumber pekerjaan</p>
          <div style={{ flex: 1, minHeight: '190px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={intEksPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={3} animationDuration={450} animationEasing="ease-out">
                  {intEksPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <RechartsTip contentStyle={tipStyle.contentStyle} formatter={(v: any, _n: any, entry: any) => [`${fShort(Number(v))} · ${entry?.payload?.count ?? 0} proyek`, entry?.payload?.name]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: c.text, letterSpacing: '-0.02em' }}>
                {stats.pu > 0 ? `${((intEksPie[0].value / stats.pu) * 100).toFixed(0)}%` : '–'}
              </span>
              <span style={{ fontSize: '10px', color: c.textMuted, fontWeight: 600 }}>Internal</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '6px' }}>
            {intEksPie.map(e => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: c.textMuted, fontWeight: 600 }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: e.color, flexShrink: 0 }} />
                {e.name} · {e.count}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default React.memo(PortfolioAnalytics);
