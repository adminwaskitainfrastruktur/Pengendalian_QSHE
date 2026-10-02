import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTip, ResponsiveContainer, Legend,
} from 'recharts';
import { CalendarClock, Wallet, Stethoscope, ChevronDown, Gauge } from 'lucide-react';
import type { Theme } from '../../constants';
import { trenBulananPpi, KUADRAN_INFO, type BarisPpi, type Indikator } from './ppiData';

interface Props {
  baris: BarisPpi;
  daftar: BarisPpi[];
  onPilih: (id: string) => void;
  c: Theme;
  dark: boolean;
}

/** Kartu skor 0–5 bergaya papan indikator */
const KartuSkor: React.FC<{ i: Indikator; c: Theme; dark: boolean }> = ({ i, c, dark }) => {
  const warna = !i.adaData ? c.textSubtle
    : i.skor >= 4 ? '#16a34a' : i.skor >= 2 ? '#d97706' : '#dc2626';
  return (
    <div className="sn-card" style={{
      background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-lg)',
      padding: '11px 12px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      opacity: i.adaData ? 1 : 0.5, minWidth: 0,
    }}>
      {/* Pita warna tipis di atas kartu sebagai penanda cepat */}
      <div style={{ position: 'absolute', inset: '0 0 auto 0', height: '3px', background: warna, opacity: i.adaData ? 1 : 0.35 }} />
      <div style={{
        fontSize: '8.5px', fontWeight: 800, color: c.textMuted, textTransform: 'uppercase',
        letterSpacing: '0.04em', lineHeight: 1.35, minHeight: '23px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '3px',
      }}>
        {i.label}
      </div>
      <div style={{
        fontSize: '30px', fontWeight: 800, color: warna, lineHeight: 1.05,
        textShadow: i.adaData ? `0 2px 14px ${warna}33` : 'none',
      }}>
        {i.adaData ? i.skor : '–'}
      </div>
      {/* Deret titik sebagai meteran skor 0–5 */}
      <div style={{ display: 'flex', gap: '2.5px', justifyContent: 'center', margin: '5px 0 6px' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <span key={n} style={{
            width: '10px', height: '3px', borderRadius: '2px',
            background: i.adaData && n <= i.skor ? warna : (dark ? 'rgba(255,255,255,0.13)' : '#e2e8f0'),
          }} />
        ))}
      </div>
      <div style={{ fontSize: '8.5px', color: c.textSubtle, lineHeight: 1.4, minHeight: '23px' }}>
        {i.keterangan}
      </div>
    </div>
  );
};

const ProjectPpiDetail: React.FC<Props> = ({ baris, daftar, onPilih, c, dark }) => {
  const info = KUADRAN_INFO[baris.kuadran];
  const d = baris.d;
  const tren = useMemo(() => trenBulananPpi(d), [d]);

  // Early warning diturunkan dari deviasi yang tersedia
  const terlambat = d.deviasi_progress < -0.0005;
  const boros = d.deviasi_bk_pu_baseline > 0.0005;

  // Diagnosis otomatis sesuai kuadran & indikator yang bermasalah
  const diagnosis = useMemo(() => {
    const sebab: string[] = [];
    if (terlambat) sebab.push('progress tertinggal dari rencana');
    if (boros) sebab.push('BK/PU melampaui baseline APP');
    if (d.tagihan_bruto_180 > 0) sebab.push('tagihan bruto menua di atas 180 hari');
    else if (d.tagihan_bruto_90 > 0) sebab.push('tagihan bruto menua di atas 90 hari');
    if (d.stock_180 > 0) sebab.push('stok mengendap di atas 180 hari');
    const dasar: Record<number, string> = {
      1: 'Proses dan output sama-sama rendah. Perlu pembenahan tata kelola sekaligus pemulihan kinerja.',
      2: 'Output baik meski proses belum tertib. Rapikan pencatatan agar hasil ini berkelanjutan.',
      3: 'Proses sudah tertib namun output belum mengikuti. Aktivitas berjalan tetapi belum bernilai tambah.',
      4: 'Proses tertib dan output tercapai. Pertahankan konsistensi pencatatan dan pengendalian biaya.',
    };
    return sebab.length > 0
      ? `${dasar[baris.kuadran]} Pemicu utama: ${sebab.join(', ')}.`
      : dasar[baris.kuadran];
  }, [baris.kuadran, terlambat, boros, d]);

  const kartuKecil: React.CSSProperties = {
    background: c.card, border: `1px solid ${c.border}`,
    borderRadius: 'var(--radius-lg)', padding: '13px 15px',
  };
  const labelMini: React.CSSProperties = {
    fontSize: '9.5px', fontWeight: 800, color: c.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  const semuaIndikator = [...baris.indikatorOutput, ...baris.indikatorProses];

  return (
    <div className="sn-card sn-slide-up" style={{
      background: c.bgSubtle, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-xl)', overflow: 'hidden',
    }}>
      {/* ── Kepala: pemilih proyek ── */}
      <div style={{
        padding: '14px 18px', background: 'linear-gradient(120deg,#0f172a 0%,#1e3a8a 55%,#2563eb 100%)',
        display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Gauge style={{ width: '17px', height: '17px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
              Project Performance Index
            </div>
            <div style={{ fontSize: '10.5px', color: '#bfdbfe' }}>Rincian penilaian per proyek</div>
          </div>
        </div>

        {/* Pemilih proyek */}
        <div style={{ flex: 1, minWidth: '220px', maxWidth: '460px', position: 'relative' }}>
          <select value={baris.id} onChange={e => onPilih(e.target.value)}
            style={{
              width: '100%', padding: '9px 30px 9px 12px', borderRadius: 'var(--radius-md)',
              border: '1.5px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.13)',
              color: '#fff', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer',
              appearance: 'none', WebkitAppearance: 'none',
            }}>
            {daftar.map(r => (
              <option key={r.id} value={r.id} style={{ color: '#0f172a', background: '#fff' }}>
                {r.nama}
              </option>
            ))}
          </select>
          <ChevronDown style={{
            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
            width: '14px', height: '14px', color: '#bfdbfe', pointerEvents: 'none',
          }} />
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#bfdbfe', letterSpacing: '0.04em' }}>SEGMENTASI</div>
          <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#fff' }}>{baris.segmentasi || '–'}</div>
        </div>
      </div>

      <div className="rg-2" style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: '14px', padding: '16px' }}>

        {/* ── Kiri: papan indikator ── */}
        <div style={{ minWidth: 0 }}>
          <div style={{ ...labelMini, marginBottom: '9px' }}>Papan Indikator Penilaian</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))', gap: '9px' }}>
            {semuaIndikator.map(i => <KartuSkor key={i.key} i={i} c={c} dark={dark} />)}
          </div>
        </div>

        {/* ── Kanan: kuadran, early warning, diagnosis, tren ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>

          {/* Kuadran */}
          <div style={{
            ...kartuKecil, display: 'flex', alignItems: 'center', gap: '14px',
            background: `linear-gradient(120deg, ${info.warna}14, transparent)`,
            border: `1.5px solid ${info.warna}55`,
          }}>
            <div style={{
              width: '62px', height: '62px', borderRadius: 'var(--radius-lg)', flexShrink: 0,
              background: `linear-gradient(140deg, ${info.warna}, ${info.warna}bb)`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 6px 18px ${info.warna}44`,
            }}>
              <span style={{ fontSize: '8.5px', fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em' }}>KUADRAN</span>
              <span style={{ fontSize: '25px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{baris.kuadran}</span>
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: info.warna, letterSpacing: '-0.01em', textTransform: 'uppercase' }}>
                {info.nama}
              </div>
              <div style={{ fontSize: '10.5px', color: c.textMuted, marginBottom: '6px' }}>{info.ket}</div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '10.5px', color: c.textMuted }}>
                <span>Proses <b style={{ color: c.text }}>{baris.prosesPct.toFixed(2)}%</b></span>
                <span>Output <b style={{ color: c.text }}>{baris.outputPct.toFixed(2)}%</b></span>
              </div>
            </div>
          </div>

          {/* Early warning */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              {
                Icon: CalendarClock, judul: 'Early Warning Time',
                nilai: terlambat ? 'Behind Schedule' : 'On Schedule',
                sub: `Deviasi progress ${(d.deviasi_progress * 100).toFixed(2)}%`,
                buruk: terlambat,
              },
              {
                Icon: Wallet, judul: 'Early Warning Cost',
                nilai: boros ? 'Over Budget' : 'On Budget',
                sub: `Deviasi BK/PU ${(d.deviasi_bk_pu_baseline * 100).toFixed(2)}%`,
                buruk: boros,
              },
            ].map(w => (
              <div key={w.judul} style={{
                ...kartuKecil, padding: '11px 13px',
                borderColor: w.buruk ? 'rgba(220,38,38,0.35)' : 'rgba(22,163,74,0.35)',
                background: w.buruk
                  ? (dark ? 'rgba(220,38,38,0.08)' : '#fef2f2')
                  : (dark ? 'rgba(22,163,74,0.08)' : '#f0fdf4'),
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                  <w.Icon style={{ width: '12px', height: '12px', color: w.buruk ? '#dc2626' : '#16a34a' }} />
                  <span style={{ ...labelMini, fontSize: '9px' }}>{w.judul}</span>
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: w.buruk ? '#dc2626' : '#16a34a', lineHeight: 1.2 }}>
                  {w.nilai}
                </div>
                <div style={{ fontSize: '9.5px', color: c.textSubtle, marginTop: '3px' }}>{w.sub}</div>
              </div>
            ))}
          </div>

          {/* Diagnosis */}
          <div style={{ ...kartuKecil, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Stethoscope style={{ width: '12px', height: '12px', color: '#8b5cf6' }} />
              <span style={labelMini}>Diagnosis</span>
            </div>
            <p style={{ fontSize: '11px', color: c.textMuted, lineHeight: 1.55 }}>{diagnosis}</p>
          </div>

          {/* Tren proses vs output */}
          <div style={{ ...kartuKecil, padding: '12px 12px 6px' }}>
            <div style={{ ...labelMini, marginBottom: '4px', paddingLeft: '2px' }}>Tren Proses &amp; Output</div>
            <div style={{ height: '150px' }}>
              {tren.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tren} margin={{ top: 6, right: 8, bottom: 0, left: -22 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={c.border} vertical={false} />
                    <XAxis dataKey="label" stroke={c.textSubtle} fontSize={9} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis domain={[0, 100]} stroke={c.textSubtle} fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                    <RechartsTip
                      contentStyle={{
                        background: c.card, border: `1px solid ${c.border}`,
                        borderRadius: 'var(--radius-md)', fontSize: '11px', color: c.text,
                        boxShadow: 'var(--shadow-lg)',
                      }}
                      formatter={(v, n) => [`${Number(v).toFixed(2)}%`, String(n)]} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} iconSize={8} />
                    <Line type="monotone" dataKey="proses" name="Proses" stroke="#10b981" strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5 }}
                      animationDuration={550} animationEasing="ease-out" />
                    <Line type="monotone" dataKey="output" name="Output" stroke="#1e3a8a" strokeWidth={2.5}
                      dot={{ r: 2.5, fill: '#1e3a8a', strokeWidth: 0 }} activeDot={{ r: 5 }}
                      animationDuration={550} animationEasing="ease-out" animationBegin={80} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: c.textSubtle }}>
                  Belum cukup riwayat bulanan untuk menampilkan tren
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProjectPpiDetail);
