import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Search, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ChevronsUpDown, RotateCcw } from 'lucide-react';
import { THEME } from '../../constants';
import type { Theme } from '../../constants';
import type { UnifiedProjectData } from '../../types';
import { fShort, fNum } from '../../utils';
import { KUADRAN_INFO, type Kuadran } from './ppiData';

interface Props {
  data: UnifiedProjectData[];
  dark: boolean;
  /** Bila diisi, kolom Status memakai kuadran PPI proyek, bukan tingkat perhatian */
  kuadranMap?: Map<string, Kuadran>;
  /** Sembunyikan kotak cari milik tabel — dipakai bila filter sudah disediakan di atas halaman */
  sembunyikanCari?: boolean;
}

const PAGE_SIZE = 15;
const SEG_NON_FINANSIAL = ['AMP', 'Workshop'];

// Kolom yang bisa diurut lewat panah di judulnya
type SortKey = 'rank' | 'behind' | 'overrun' | 'stok' | 'bkd' | 'wip' | 'tagihan' | 'status';
type SortDir = 'asc' | 'desc';

interface MatrixRow {
  d: UnifiedProjectData;
  rank: number;
  // Progress (fraksi): Ra = rencana (AB), Ri = realisasi (AC), deviasi = AD
  planProg: number;
  actProg: number;
  deviasiProgress: number;
  behind: boolean;
  // BK/PU (fraksi): App = BK/PU MAPP (AE), Real = BK/PU kumulatif (AF), deviasi = AG
  mappPct: number;
  realPct: number;
  deviasiBkPu: number;
  overrun: boolean;
  status: 'Extra Attention' | 'Attention' | 'Normal';
  /** Kuadran PPI proyek — hanya terisi bila induk memasok kuadranMap */
  kuadran?: Kuadran;
  // Daftar alasan yang memicu status — ditampilkan saat kursor menyentuh badge
  alasan: string[];
  skor: number;
}

// Pemetaan kolom sheet "Data based RKAP_value":
// Behind Schedule = AD (Deviasi Progress), Ra = AB (Progress Rencana), Real = AC (Progress Realisasi)
// Cost Overrun = AG (Deviasi BK/PU), App = AE (BK/PU MAPP), Real = AF (BK/PU Realisasi Kumulatif)
const hitungBaris = (d: UnifiedProjectData): Omit<MatrixRow, 'rank'> => {
  const planProg = d.progress_rencana;
  const deviasiProgress = d.deviasi_progress;
  const actProg = d.progress_fisik;
  const behind = deviasiProgress < -0.0005;

  const mappPct = d.bk_pu_mapp;
  const realPct = d.bk_pu_real_kumulatif;
  const deviasiBkPu = d.deviasi_bk_pu_baseline;
  // Deviasi BK/PU positif = realisasi melampaui baseline = boros (merah)
  const overrun = deviasiBkPu > 0.0005;

  // ── Kriteria penyimpangan (ambang mengecil seiring progress naik) ──
  const riPct = actProg * 100;                       // progress realisasi dalam %
  const lagPct = Math.max(-deviasiProgress, 0) * 100; // ketinggalan terhadap rencana dalam %
  // Progress: Ri < 90% → toleransi [10 - Ri/9]%; Ri ≥ 90% → deviasi > 0 langsung menyimpang
  const simpangProgress = riPct < 90 ? lagPct > (10 - riPct / 9) : lagPct > 0;
  // BK/PU: Ri < 85% → toleransi [8.5 - Ri/10]%; Ri ≥ 85% → deviasi > 0 langsung menyimpang
  const overPct = deviasiBkPu * 100;                 // kelebihan BK/PU terhadap APP dalam pp
  const simpangBkPu = riPct < 85 ? overPct > (8.5 - riPct / 10) : overPct > 0;

  const agingRatio = d.tagihan_bruto > 0
    ? Math.min((d.tagihan_bruto_90 + d.tagihan_bruto_180) / d.tagihan_bruto, 1) : 0;
  const skor =
    (simpangProgress ? Math.min(Math.abs(deviasiProgress), 1) : 0) * 40 +
    (simpangBkPu ? Math.min(Math.abs(deviasiBkPu), 1) : 0) * 40 +
    agingRatio * 20;

  // Extra Attention: penyimpangan progress/BK-PU, tagihan berumur, atau stock >180 hari
  // Attention: ada stock >90 hari, ada BKD, atau ada WIP BK
  const alasanExtra: string[] = [];
  if (simpangProgress) {
    const batas = riPct < 90 ? (10 - riPct / 9) : 0;
    alasanExtra.push(`Progress tertinggal ${lagPct.toFixed(1)}% (batas ${batas.toFixed(1)}%)`);
  }
  if (simpangBkPu) {
    const batas = riPct < 85 ? (8.5 - riPct / 10) : 0;
    alasanExtra.push(`BK/PU lebih ${overPct.toFixed(1)}% dari APP (batas ${batas.toFixed(1)}%)`);
  }
  if (d.tagihan_bruto_90 > 0) alasanExtra.push('Ada tagihan bruto >90 hari');
  if (d.tagihan_bruto_180 > 0) alasanExtra.push('Ada tagihan bruto >180 hari');
  if (d.stock_180 > 0) alasanExtra.push('Ada stok >180 hari');

  // WIP BK tetap memicu status Attention, tapi tidak ditulis sebagai keterangan —
  // baris yang hanya dipicu WIP BK akan tampil tanpa alasan, dan itu disengaja
  const adaAttention = d.stock_90 > 0 || d.bkd !== 0 || d.wip_bk !== 0;
  const alasanAttention: string[] = [];
  if (d.stock_90 > 0) alasanAttention.push('Ada stok >90 hari');
  if (d.bkd !== 0) alasanAttention.push('Terdapat BKD');

  const status: MatrixRow['status'] = alasanExtra.length > 0
    ? 'Extra Attention'
    : adaAttention ? 'Attention' : 'Normal';
  const alasan = status === 'Extra Attention'
    ? [...alasanExtra, ...alasanAttention]
    : status === 'Attention' ? alasanAttention : [];

  return { d, planProg, actProg, deviasiProgress, behind, mappPct, realPct, deviasiBkPu, overrun, status, alasan, skor };
};

// Nilai pembanding per kolom sortir
const nilaiSort = (r: MatrixRow, key: SortKey): number => {
  switch (key) {
    case 'behind': return r.deviasiProgress;
    case 'overrun': return r.deviasiBkPu;
    case 'stok': return r.d.stock;
    case 'bkd': return r.d.bkd;
    case 'wip': return r.d.wip_bk;
    case 'tagihan': return r.d.tagihan_bruto;
    // Bila kuadran tersedia, kolom Status diurut menurut kuadran PPI
    case 'status': return r.kuadran ?? (r.status === 'Extra Attention' ? 2 : r.status === 'Attention' ? 1 : 0);
    default: return -r.rank; // rank kecil = paling bermasalah = paling atas saat desc
  }
};

const fPct = (v: number, dec = 2) => `${(v * 100).toFixed(dec)}%`;

const DetailMatrixView: React.FC<Props> = ({ data, dark, kuadranMap, sembunyikanCari }) => {
  const c: Theme = dark ? THEME.dark : THEME.light;
  const [page, setPage] = useState(0);
  const [q, setQ] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Ketikan di kotak cari langsung tampil, tapi penyaringan tabel menyusul
  // di prioritas rendah — mengetik cepat tidak pernah bikin UI tersendat
  const dq = React.useDeferredValue(q);

  // Sortir dibungkus transition supaya klik panah tetap responsif meski
  // tabel besar sedang dihitung ulang
  const toggleSort = (key: SortKey) => {
    React.startTransition(() => {
      if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
      else { setSortKey(key); setSortDir(key === 'behind' || key === 'overrun' ? 'asc' : 'desc'); }
    });
  };

  // Transisi FLIP: saat urutan berubah, baris yang sama meluncur dari posisi
  // lama ke posisi barunya (bukan hilang-muncul), baris baru cukup fade-in
  const rowRefs = useRef(new Map<string, HTMLTableRowElement>());
  const prevTops = useRef(new Map<string, number>());
  React.useLayoutEffect(() => {
    const newTops = new Map<string, number>();
    rowRefs.current.forEach((el, id) => { if (el?.isConnected) newTops.set(id, el.getBoundingClientRect().top); });
    rowRefs.current.forEach((el, id) => {
      if (!el?.isConnected) return;
      const prev = prevTops.current.get(id);
      const now = newTops.get(id)!;
      if (prev != null && Math.abs(prev - now) > 1) {
        el.style.transition = 'none';
        el.style.transform = `translateY(${prev - now}px)`;
        requestAnimationFrame(() => {
          el.style.transition = 'transform 0.45s var(--ease-out)';
          el.style.transform = '';
        });
      } else if (prev == null) {
        el.style.opacity = '0';
        el.style.transition = 'none';
        requestAnimationFrame(() => {
          el.style.transition = 'opacity 0.35s var(--ease-out)';
          el.style.opacity = '1';
        });
      }
    });
    prevTops.current = newTops;
  });

  // Peringkat eksekutif dihitung dari seluruh proyek finansial supaya nomor
  // RANK stabil; panah sortir hanya mengubah urutan tampil
  const ranked: MatrixRow[] = useMemo(() => {
    const rows = data
      .filter(d => !d.is_overhead && !SEG_NON_FINANSIAL.includes(d.segmentasi))
      .map(hitungBaris);
    rows.sort((a, b) => b.skor - a.skor || b.d.pu_rkap - a.d.pu_rkap);
    return rows.map((r, i) => ({ ...r, rank: i + 1, kuadran: kuadranMap?.get(r.d.id_project) }));
  }, [data, kuadranMap]);

  const sorted = useMemo(() => {
    const rows = [...ranked];
    const dir = sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => (nilaiSort(a, sortKey) - nilaiSort(b, sortKey)) * dir);
    return rows;
  }, [ranked, sortKey, sortDir]);

  const filtered = useMemo(() => {
    const query = dq.trim().toLowerCase();
    if (!query) return sorted;
    return sorted.filter(r =>
      r.d.project_name.toLowerCase().includes(query) || r.d.id_project.toLowerCase().includes(query));
  }, [sorted, dq]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = useMemo(() => filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [filtered, page]);
  useEffect(() => { setPage(0); }, [filtered.length, sortKey, sortDir]);

  const thStyle = (align: 'left' | 'right' | 'center' = 'center'): React.CSSProperties => ({
    padding: '12px 14px', textAlign: align, fontWeight: 700, color: c.textMuted,
    borderBottom: `2px solid ${c.border}`, background: c.bgSubtle, whiteSpace: 'nowrap',
    fontSize: '11px', letterSpacing: '0.02em',
  });
  const subStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 600, color: c.textSubtle, marginTop: '3px',
    fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap',
  };
  const numCell: React.CSSProperties = {
    padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap',
    color: c.textMuted, fontWeight: 600,
  };

  // Judul kolom yang bisa diklik untuk mengurut — panah menunjukkan arah aktif
  const SortTh: React.FC<{ k: SortKey; align?: 'left' | 'right' | 'center'; children: React.ReactNode }> = ({ k, align = 'center', children }) => {
    const active = sortKey === k;
    const Arrow = !active ? ChevronsUpDown : sortDir === 'asc' ? ChevronUp : ChevronDown;
    return (
      <th onClick={() => toggleSort(k)} className="sn-btn"
        style={{ ...thStyle(align), cursor: 'pointer', userSelect: 'none', color: active ? '#3b82f6' : c.textMuted }}
        title="Klik untuk mengurut">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: align === 'right' ? 'flex-end' : 'center' }}>
          {children}
          <Arrow style={{ width: '13px', height: '13px', flexShrink: 0, transition: 'transform 0.25s var(--ease-out)' }} />
        </span>
      </th>
    );
  };

  return (
    <div className="sn-view-enter sn-card" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
      {/* Header: judul + search di tengah */}
      <div className="dm-head" style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: c.text, letterSpacing: '0.01em', textTransform: 'uppercase', marginBottom: '2px' }}>
            Project Performance Detail Matrix
          </h3>
          <p style={{ fontSize: '12px', color: c.textMuted }}>
            Rincian poin deviasi seluruh proyek yang aktif · {fNum(filtered.length)} proyek
          </p>
        </div>

        {/* Search: mengisi ruang setelah judul, kotaknya di tengah ruang itu —
            saat fokus melebar simetris (tetap di tengah, tak menggeser lain) */}
        {!sembunyikanCari && (
        <div className="dm-search" style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: '190px' }}>
          <div style={{
            position: 'relative',
            width: searchFocus ? 'min(340px, 100%)' : '180px',
            transition: 'width 0.35s var(--ease-out)',
          }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: c.textMuted, pointerEvents: 'none' }} />
            <input type="text" placeholder="Cari Nama" value={q} onChange={e => setQ(e.target.value)}
              onFocus={() => setSearchFocus(true)} onBlur={() => setSearchFocus(false)} className="sn-input"
              style={{
                width: '100%', padding: '9px 28px 9px 34px', borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${searchFocus ? '#3b82f6' : c.border}`, background: c.card,
                color: c.text, fontSize: '13px', fontWeight: 600,
                boxShadow: searchFocus ? '0 4px 14px rgba(59,130,246,0.18)' : 'none',
                transition: 'border-color 0.3s, box-shadow 0.3s',
              }} />
            {q && (
              <button onClick={() => setQ('')} className="sn-btn" title="Bersihkan"
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, display: 'flex', padding: '2px' }}>
                <X style={{ width: '12px', height: '12px' }} />
              </button>
            )}
          </div>
        </div>
        )}

        {/* Reset: bersihkan pencarian sekaligus urutan panah di judul kolom */}
        {(() => {
          const adaFilter = q !== '' || sortKey !== 'rank' || sortDir !== 'desc';
          return (
            <button className="sn-chip-btn" onClick={() => {
              React.startTransition(() => { setQ(''); setSortKey('rank'); setSortDir('desc'); setPage(0); });
            }}
              disabled={!adaFilter} title="Reset filter & urutan kolom"
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px',
                borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap',
                border: `1.5px solid ${adaFilter ? 'rgba(59,130,246,0.45)' : c.border}`,
                background: adaFilter ? (dark ? 'rgba(59,130,246,0.12)' : '#eff6ff') : c.card,
                color: adaFilter ? '#3b82f6' : c.textSubtle,
                cursor: adaFilter ? 'pointer' : 'not-allowed',
                transition: 'all 0.25s var(--ease-out)',
              }}>
              <RotateCcw style={{ width: '13px', height: '13px' }} />
              Reset
            </button>
          );
        })()}
      </div>

      <div className="sn-table-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr>
              <th style={{ ...thStyle('center'), width: '54px' }}>No</th>
              <th style={thStyle('left')}>Nama Proyek</th>
              <SortTh k="behind">Progress</SortTh>
              <SortTh k="overrun">BK/PU</SortTh>
              <SortTh k="stok">
                <span>
                  Stok
                  <div style={{ fontSize: '9.5px', fontWeight: 600, color: c.textSubtle, textTransform: 'none' }}>(&gt;90 Hari | &gt;180 Hari)</div>
                </span>
              </SortTh>
              <SortTh k="bkd" align="right">BKD</SortTh>
              <SortTh k="wip" align="right">WIP BK</SortTh>
              <SortTh k="tagihan">
                <span>
                  Tagihan Bruto
                  <div style={{ fontSize: '9.5px', fontWeight: 600, color: c.textSubtle, textTransform: 'none' }}>(&gt;90 Hari | &gt;180 Hari)</div>
                </span>
              </SortTh>
              <SortTh k="status">Status</SortTh>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.d.id_project} className="sn-row" style={{ borderBottom: `1px solid ${c.border}` }}
                ref={el => { if (el) rowRefs.current.set(r.d.id_project, el); else rowRefs.current.delete(r.d.id_project); }}>
                {/* No: nomor urut polos, seragam tanpa highlight */}
                <td style={{ padding: '12px 14px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: c.textMuted }}>
                  {r.rank}
                </td>

                {/* Nama proyek + segmentasi */}
                <td style={{ padding: '12px 14px', maxWidth: '220px' }} title={`${r.d.project_name} (${r.d.id_project})`}>
                  <div style={{ color: c.text, fontWeight: 800, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.d.project_name}</div>
                  <div style={{ fontSize: '10.5px', fontWeight: 500, color: c.textSubtle }}>{r.d.segmentasi || '-'}</div>
                </td>

                {/* Progress: deviasi% + Ra|Ri */}
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: r.behind ? '#dc2626' : '#16a34a' }}>
                    {r.behind ? fPct(r.deviasiProgress) : r.deviasiProgress > 0 ? `+${fPct(r.deviasiProgress)}` : '0%'}
                  </div>
                  <div style={subStyle}>Ra: {fPct(r.planProg)} | Ri: {fPct(r.actProg)}</div>
                </td>

                {/* BK/PU: deviasi (+) merah, (-) hijau + App|Real */}
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: r.deviasiBkPu > 0 ? '#dc2626' : '#16a34a' }}>
                    {r.deviasiBkPu > 0 ? `+${fPct(r.deviasiBkPu)}` : r.deviasiBkPu < 0 ? fPct(r.deviasiBkPu) : '0%'}
                  </div>
                  <div style={subStyle}>App: {fPct(r.mappPct, 1)} | Real: {fPct(r.realPct, 1)}</div>
                </td>

                {/* Stok: angka tebal + rincian umur (seperti tagihan bruto) */}
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: c.text }}>
                    {r.d.stock !== 0 ? fShort(r.d.stock) : '–'}
                  </div>
                  <div style={{ ...subStyle, display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: c.bgMuted }}>
                    &gt;90: {r.d.stock_90 !== 0 ? fShort(r.d.stock_90) : '0'} | &gt;180: {r.d.stock_180 !== 0 ? fShort(r.d.stock_180) : '0'}
                  </div>
                </td>
                <td style={{ ...numCell, fontSize: '14px', fontWeight: 800, color: c.text }}>{r.d.bkd !== 0 ? fShort(r.d.bkd) : '–'}</td>
                <td style={{ ...numCell, fontSize: '14px', fontWeight: 800, color: c.text }}>{r.d.wip_bk !== 0 ? fShort(r.d.wip_bk) : '–'}</td>

                {/* Tagihan bruto: total + rincian umur */}
                <td style={{ padding: '12px 14px', textAlign: 'center', background: c.bgSubtle }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: c.text }}>
                    {r.d.tagihan_bruto !== 0 ? fShort(r.d.tagihan_bruto) : '–'}
                  </div>
                  <div style={{ ...subStyle, display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: c.bgMuted }}>
                    &gt;90: {r.d.tagihan_bruto_90 !== 0 ? fShort(r.d.tagihan_bruto_90) : '0'} | &gt;180: {r.d.tagihan_bruto_180 !== 0 ? fShort(r.d.tagihan_bruto_180) : '0'}
                  </div>
                </td>

                {/* Status: kuadran PPI bila induk memasoknya, selain itu tingkat perhatian */}
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                  {(() => {
                    if (r.kuadran) {
                      const info = KUADRAN_INFO[r.kuadran];
                      const rincian = r.alasan.length > 0 ? `\n${r.alasan.join('\n')}` : '';
                      return (
                        <span
                          title={`Kuadran ${info.roman} — ${info.ket}${rincian}`}
                          style={{
                            display: 'inline-block', fontSize: '9.5px', fontWeight: 800, letterSpacing: '0.03em',
                            padding: '5px 10px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase',
                            background: `${info.warna}1a`, color: info.warna,
                            border: `1px solid ${info.warna}55`, whiteSpace: 'nowrap', cursor: 'help',
                          }}>{info.roman} · {info.nama}</span>
                      );
                    }
                    const tone = r.status === 'Extra Attention' ? c.kritis
                      : r.status === 'Attention' ? c.perhatian : c.sehat;
                    return (
                      <span
                        title={r.alasan.length > 0
                          ? r.alasan.join('\n')
                          : r.status === 'Normal'
                            ? 'Progress & BK/PU dalam batas toleransi, tanpa stok menua atau tagihan >90 hari'
                            : undefined}
                        style={{
                          display: 'inline-block', fontSize: '10px', fontWeight: 800, letterSpacing: '0.04em',
                          padding: '5px 10px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase',
                          background: tone.bg, color: tone.text, border: `1px solid ${tone.border}`, whiteSpace: 'nowrap',
                          cursor: 'help',
                        }}>{r.status}</span>
                    );
                  })()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '50px', textAlign: 'center', color: c.textMuted, fontSize: '13px' }}>🔍 Tidak ada proyek yang cocok dengan filter saat ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ padding: '12px 18px', borderTop: `1px solid ${c.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: c.bgMuted }}>
        <span style={{ fontSize: '11px', color: c.textMuted, fontWeight: 500 }}>
          {filtered.length === 0 ? 'Tidak ada data' : `Baris ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, filtered.length)} dari ${fNum(filtered.length)}`}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: c.textMuted, fontWeight: 500 }}>Hal {page + 1} / {pages}</span>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="sn-chip-btn"
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: `1px solid ${c.border}`, background: c.card, color: page === 0 ? c.textSubtle : c.text, cursor: page === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
          </button>
          <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1} className="sn-chip-btn"
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: `1px solid ${c.border}`, background: c.card, color: page >= pages - 1 ? c.textSubtle : c.text, cursor: page >= pages - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default React.memo(DetailMatrixView);
