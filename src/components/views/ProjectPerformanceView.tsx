import React, { useMemo, useState, useEffect } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis,
  Tooltip as RechartsTip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { Target } from 'lucide-react';
import { THEME } from '../../constants';
import type { Theme } from '../../constants';
import type { UnifiedProjectData } from '../../types';
import { fNum } from '../../utils';
import DetailMatrixView from './DetailMatrixView';
import ProjectPpiDetail from './ProjectPpiDetail';
import {
  hitungPpi, KUADRAN_INFO, AMBANG_PROSES, AMBANG_OUTPUT, type Kuadran,
} from './ppiData';

interface Props {
  data: UnifiedProjectData[];
  dark: boolean;
  /** Filter kuadran dikendalikan FilterBar di atas halaman */
  kuadranFilter: Kuadran | null;
  /** Pencarian dari FilterBar (nama proyek / kota) */
  search: string;
  /** Melaporkan jumlah proyek per kuadran agar bisa ditampilkan di FilterBar */
  onStatKuadran?: (stat: Record<Kuadran, number>) => void;
}

interface TitikPpi {
  x: number; y: number; z: number;
  nama: string; id: string; kuadran: Kuadran; seg: string;
}

/** Tooltip titik kuadran — di level modul agar tidak dibuat ulang tiap render.
    Bentuk props Recharts jauh lebih luas dari yang dipakai, jadi hanya field
    yang benar-benar dibaca yang diketik ketat. */
interface TooltipProps {
  active?: boolean;
  payload?: readonly { payload?: unknown }[];
  c: Theme;
}
const TooltipTitik: React.FC<TooltipProps> = ({ active, payload, c }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as TitikPpi | undefined;
  if (!p) return null;
  const info = KUADRAN_INFO[p.kuadran];
  return (
    <div style={{
      background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-md)',
      padding: '10px 12px', boxShadow: 'var(--shadow-lg)', maxWidth: '260px',
    }}>
      <div style={{ fontSize: '12px', fontWeight: 800, color: c.text, marginBottom: '2px' }}>{p.nama}</div>
      <div style={{ fontSize: '10px', color: c.textSubtle, marginBottom: '6px' }}>{p.seg}</div>
      <div style={{ fontSize: '11px', color: c.textMuted, lineHeight: 1.6 }}>
        Proses <b style={{ color: c.text }}>{p.x.toFixed(2)}%</b><br />
        Output <b style={{ color: c.text }}>{p.y.toFixed(2)}%</b>
      </div>
      <div style={{
        marginTop: '6px', fontSize: '10px', fontWeight: 800, padding: '3px 8px',
        borderRadius: 'var(--radius-full)', display: 'inline-block',
        background: `${info.warna}1a`, color: info.warna, border: `1px solid ${info.warna}55`,
      }}>
        {info.roman} · {info.nama}
      </div>
    </div>
  );
};

const ProjectPerformanceView: React.FC<Props> = ({ data, dark, kuadranFilter, search, onStatKuadran }) => {
  const c: Theme = dark ? THEME.dark : THEME.light;
  const [terpilih, setTerpilih] = useState<string | null>(null);

  // Segmentasi, tahun, dan bulan sudah disaring di Dashboard sebelum data tiba
  const semua = useMemo(() => hitungPpi(data), [data]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return semua.filter(r => {
      if (query && !r.nama.toLowerCase().includes(query) && !r.id.toLowerCase().includes(query)) return false;
      if (kuadranFilter && r.kuadran !== kuadranFilter) return false;
      return true;
    });
  }, [semua, search, kuadranFilter]);

  // Detail tampil tanpa perlu klik: jatuh ke proyek pertama pada daftar terfilter
  const proyekTerpilih = useMemo(
    () => rows.find(r => r.id === terpilih) ?? rows[0] ?? null, [rows, terpilih]);

  // Dihitung sebelum filter kuadran agar angka pada chip tidak ikut menyusut
  const statKuadran = useMemo(() => {
    const n: Record<Kuadran, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    const query = search.trim().toLowerCase();
    semua.forEach(r => {
      if (query && !r.nama.toLowerCase().includes(query) && !r.id.toLowerCase().includes(query)) return;
      n[r.kuadran] += 1;
    });
    return n;
  }, [semua, search]);
  const totalTersaring = statKuadran[1] + statKuadran[2] + statKuadran[3] + statKuadran[4];
  // Kartu persentase mengikuti kuadran yang sedang dipilih; tanpa filter tampil Kuadran IV
  const kuadranSorot: Kuadran = kuadranFilter ?? 4;
  const pctSorot = totalTersaring > 0 ? (statKuadran[kuadranSorot] / totalTersaring) * 100 : 0;

  // Laporkan jumlah per kuadran ke Dashboard untuk chip di FilterBar
  useEffect(() => { onStatKuadran?.(statKuadran); }, [statKuadran, onStatKuadran]);

  // ── Gaya ──
  const kartu: React.CSSProperties = {
    background: c.card, border: `1px solid ${c.border}`,
    borderRadius: 'var(--radius-xl)', padding: '18px',
  };
  // Matrix memakai baris yang sama dengan kuadran agar satu filter menggerakkan semuanya
  const dataTersaring = useMemo(() => rows.map(r => r.d), [rows]);
  const petaKuadran = useMemo(
    () => new Map(rows.map(r => [r.id, r.kuadran])), [rows]);

  // Titik scatter dikelompokkan per kuadran supaya warnanya konsisten
  const titik: TitikPpi[] = rows.map(r => ({
    x: Number(r.prosesPct.toFixed(2)),
    y: Number(r.outputPct.toFixed(2)),
    z: 1, nama: r.nama, id: r.id, kuadran: r.kuadran, seg: r.segmentasi,
  }));

  return (
    <div className="sn-view-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Kuadran + panel samping ── */}
      <div className="rg-2" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', alignItems: 'start' }}>

        {/* Scatter kuadran */}
        <div className="sn-card sn-slide-up" style={{ ...kartu, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: c.text, letterSpacing: '-0.02em', marginBottom: '3px' }}>
                Project Performance Index
              </h3>
              <p style={{ fontSize: '12px', color: c.textMuted }}>
                Titik kuadran dari penilaian proses (sumbu X) dan output (sumbu Y) · klik titik untuk mengganti proyek pada rincian di bawah
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{
                padding: '8px 14px', borderRadius: 'var(--radius-md)', color: '#fff', minWidth: '128px',
                background: `linear-gradient(135deg, ${KUADRAN_INFO[kuadranSorot].warna}, ${KUADRAN_INFO[kuadranSorot].warna}bb)`,
                transition: 'background 0.3s var(--ease-out)',
              }}>
                <div style={{ fontSize: '9px', fontWeight: 700, opacity: 0.9, letterSpacing: '0.04em' }}>
                  % KUADRAN {KUADRAN_INFO[kuadranSorot].roman}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>{pctSorot.toFixed(2)}%</div>
                <div style={{ fontSize: '8.5px', opacity: 0.85, marginTop: '1px' }}>
                  {statKuadran[kuadranSorot]} dari {totalTersaring} proyek
                </div>
              </div>
              <div style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', background: c.bgMuted, border: `1px solid ${c.border}`, minWidth: '90px' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: c.textMuted, letterSpacing: '0.04em' }}>TOTAL PROYEK</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: c.text }}>{fNum(rows.length)}</div>
              </div>
            </div>
          </div>

          <div style={{ height: '420px', position: 'relative' }}>
            {/* Label kuadran di sudut-sudut area grafik */}
            {([
              { k: 2 as Kuadran, pos: { left: '9%', top: '2%' } },
              { k: 4 as Kuadran, pos: { right: '2%', top: '2%' } },
              { k: 1 as Kuadran, pos: { left: '9%', bottom: '12%' } },
              { k: 3 as Kuadran, pos: { right: '2%', bottom: '12%' } },
            ]).map(({ k, pos }) => (
              <div key={k} style={{
                position: 'absolute', ...pos, zIndex: 1, pointerEvents: 'none',
                fontSize: '20px', fontWeight: 800, color: `${KUADRAN_INFO[k].warna}55`,
              }}>{KUADRAN_INFO[k].roman}</div>
            ))}
            <ResponsiveContainer width="100%" height="100%">
              {/* Margin kanan & atas dilebihkan agar label ambang tidak terpotong */}
              <ScatterChart margin={{ top: 20, right: 40, bottom: 16, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.border} />
                <XAxis type="number" dataKey="x" name="Proses" domain={[0, 100]} unit="%"
                  stroke={c.textSubtle} fontSize={11} tickLine={false}
                  label={{ value: 'SCORE PROCESS (%)', position: 'insideBottom', offset: -8, fontSize: 11, fill: c.textMuted, fontWeight: 700 }} />
                <YAxis type="number" dataKey="y" name="Output" domain={[0, 100]} unit="%"
                  stroke={c.textSubtle} fontSize={11} tickLine={false}
                  label={{ value: 'SCORE OUTPUT (%)', angle: -90, position: 'insideLeft', fontSize: 11, fill: c.textMuted, fontWeight: 700 }} />
                <ZAxis type="number" dataKey="z" range={[70, 70]} />
                {/* Garis pembatas kuadran, diberi label ambangnya di ujung garis */}
                <ReferenceLine x={AMBANG_PROSES} stroke="#3b82f6" strokeDasharray="6 4" strokeWidth={1.5}
                  label={{
                    value: `${AMBANG_PROSES}%`, position: 'top', fill: '#3b82f6',
                    fontSize: 11, fontWeight: 800,
                  }} />
                <ReferenceLine y={AMBANG_OUTPUT} stroke="#3b82f6" strokeDasharray="6 4" strokeWidth={1.5}
                  label={{
                    value: `${AMBANG_OUTPUT}%`, position: 'right', fill: '#3b82f6',
                    fontSize: 11, fontWeight: 800,
                  }} />
                <RechartsTip content={props => <TooltipTitik {...props} c={c} />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter data={titik} animationDuration={500} animationEasing="ease-out"
                  onClick={p => setTerpilih((p as unknown as TitikPpi)?.id ?? null)} cursor="pointer">
                  {titik.map(t => (
                    <Cell key={t.id} fill={KUADRAN_INFO[t.kuadran].warna}
                      stroke={terpilih === t.id ? c.text : 'transparent'} strokeWidth={terpilih === t.id ? 2 : 0} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Keterangan sumbu & kuadran */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: 0 }}>
          <div className="sn-card" style={{ ...kartu, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', border: 'none', color: '#fff' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '2px' }}>SUMBU Y (OUTPUT)</div>
            <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '10px' }}>Optimalisasi dan Efisiensi Biaya Operasional</div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: '9px 11px', fontSize: '11px', lineHeight: 1.6 }}>
              <b>Project Control</b><br />BK/PU · Progress · Tagihan Bruto<br />
              <b style={{ display: 'block', marginTop: '6px' }}>Procurement & Inventory</b>Aging Stock
            </div>
          </div>

          <div className="sn-card" style={{ ...kartu, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', border: 'none', color: '#fff' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em', marginBottom: '2px' }}>SUMBU X (PROSES)</div>
            <div style={{ fontSize: '11px', opacity: 0.85, marginBottom: '10px' }}>Penguatan Peran GRC</div>
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: '9px 11px', fontSize: '11px', lineHeight: 1.6 }}>
              <b>Master Schedule, SAP & APP</b><br />Tata Kelola · Akurasi Realtime · Konsistensi<br />
              <b style={{ display: 'block', marginTop: '6px' }}>QSHE</b>Kinerja Quality &amp; SHE
            </div>
          </div>

          <div className="sn-card" style={kartu}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>Keterangan Kuadran</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {([1, 2, 3, 4] as Kuadran[]).map(k => {
                const info = KUADRAN_INFO[k];
                return (
                  <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: c.textMuted, width: '18px' }}>{info.roman}</span>
                    <span style={{
                      fontSize: '10.5px', fontWeight: 800, padding: '3px 9px', borderRadius: 'var(--radius-full)',
                      background: `${info.warna}1a`, color: info.warna, border: `1px solid ${info.warna}55`, whiteSpace: 'nowrap',
                    }}>{info.nama}</span>
                    <span style={{ fontSize: '10px', color: c.textSubtle }}>{info.ket}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Rincian PPI per proyek (di atas Detail Matrix) ── */}
      {proyekTerpilih ? (
        <ProjectPpiDetail baris={proyekTerpilih} daftar={rows} onPilih={setTerpilih} c={c} dark={dark} />
      ) : (
        <div className="sn-card" style={{ ...kartu, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px', padding: '26px', color: c.textMuted, fontSize: '13px', border: `1px dashed ${c.borderStrong}` }}>
          <Target style={{ width: '15px', height: '15px' }} />
          Klik salah satu titik pada kuadran untuk melihat rincian penilaian proyek.
        </div>
      )}

      {/* ── Matrix detail: ikut filter halaman & status memakai kuadran PPI ── */}
      <DetailMatrixView
        data={dataTersaring} dark={dark}
        kuadranMap={petaKuadran} sembunyikanCari
      />
    </div>
  );
};

export default React.memo(ProjectPerformanceView);
