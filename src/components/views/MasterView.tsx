import React, { useMemo, useState, useRef } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import { THEME } from '../../constants';
import type { Theme } from '../../constants';
import type { AllProyekRow } from '../../types';
import { fShort, fNum } from '../../utils';

interface Props {
  data: AllProyekRow[];
  dark: boolean;
}

type SortCol = 'no' | 'project_name' | 'nilai_kontrak' | 'pu_sd' | 'bk_sd' | 'bk_pu_pct' | 'progress_pct' | 'piutang';

const MasterView: React.FC<Props> = ({ data, dark }) => {
  const c: Theme = dark ? THEME.dark : THEME.light;
  const [segFilter, setSegFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ieFilter, setIeFilter] = useState('');
  const [sortCol, setSortCol] = useState<SortCol>('no');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Ganti filter/sortir dibungkus transition supaya dropdown & panah tetap
  // responsif meski seluruh tabel dihitung ulang
  const setFilterT = (setter: (v: string) => void) => (v: string) =>
    React.startTransition(() => setter(v));

  // Transisi FLIP: baris yang sama meluncur ke posisi barunya saat urutan/
  // filter berubah — tanpa remount, tidak terasa seperti refresh
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
          el.style.transition = 'transform 0.4s var(--ease-out)';
          el.style.transform = '';
        });
      } else if (prev == null) {
        el.style.opacity = '0';
        el.style.transition = 'none';
        requestAnimationFrame(() => {
          el.style.transition = 'opacity 0.3s var(--ease-out)';
          el.style.opacity = '1';
        });
      }
    });
    prevTops.current = newTops;
  });

  const segOptions = useMemo(() => Array.from(new Set(data.map(d => d.segmentasi))).sort(), [data]);
  const statusOptions = useMemo(() => Array.from(new Set(data.map(d => d.status))).sort(), [data]);

  const filteredData = useMemo(() => {
    let rows = data;
    if (segFilter) rows = rows.filter(d => d.segmentasi === segFilter);
    if (statusFilter) rows = rows.filter(d => d.status === statusFilter);
    if (ieFilter) rows = rows.filter(d => d.internal_eksternal === ieFilter);
    return [...rows].sort((a, b) => {
      const av = a[sortCol]; const bv = b[sortCol];
      if (typeof av === 'string' && typeof bv === 'string')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sortDir === 'asc' ? (Number(av) || 0) - (Number(bv) || 0) : (Number(bv) || 0) - (Number(av) || 0);
    });
  }, [data, segFilter, statusFilter, ieFilter, sortCol, sortDir]);

  // Semua proyek langsung ditampilkan (tanpa pagination) — tabel di-scroll
  const rows = filteredData;

  const summary = useMemo(() => {
    let nk = 0, pu = 0, bk = 0;
    filteredData.forEach(d => { nk += d.nilai_kontrak; pu += d.pu_sd; bk += d.bk_sd; });
    return { nk, pu, bk };
  }, [filteredData]);

  const toggleSort = (col: SortCol) => {
    React.startTransition(() => {
      if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
      else { setSortCol(col); setSortDir(col === 'no' || col === 'project_name' ? 'asc' : 'desc'); }
    });
  };

  const selectStyle: React.CSSProperties = {
    padding: '7px 10px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${c.border}`,
    background: c.card, color: c.text, fontSize: '12px', fontWeight: 600, cursor: 'pointer',
  };

  // Urutan & nama kolom mengikuti sheet "all proyek" di Excel
  const headers: { label: string; col?: SortCol; align: 'left' | 'right' }[] = [
    { label: 'No.', col: 'no', align: 'left' },
    { label: 'No. Profit Center', align: 'left' },
    { label: 'Nama Proyek', col: 'project_name', align: 'left' },
    { label: 'Segmentasi', align: 'left' },
    { label: 'Pemberi Kerja', align: 'left' },
    { label: 'Nilai Kontrak', col: 'nilai_kontrak', align: 'right' },
    { label: 'Progress', col: 'progress_pct', align: 'right' },
    { label: 'PU s.d', col: 'pu_sd', align: 'right' },
    { label: 'BK s.d', col: 'bk_sd', align: 'right' },
    { label: 'BK/PU', col: 'bk_pu_pct', align: 'right' },
    { label: 'Status Proyek', align: 'right' },
    { label: 'Kota', align: 'left' },
    { label: 'Internal/Eksternal', align: 'left' },
    { label: 'Piutang', col: 'piutang', align: 'right' },
  ];

  const sortIcon = (col?: SortCol) => {
    if (!col) return null;
    if (sortCol !== col) return <ArrowUpDown style={{ width: '10px', height: '10px', opacity: 0.5 }} />;
    return sortDir === 'asc'
      ? <ArrowUp style={{ width: '10px', height: '10px' }} />
      : <ArrowDown style={{ width: '10px', height: '10px' }} />;
  };

  return (
    <div className="sn-view-enter sn-card" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ padding: '18px 22px', borderBottom: `1px solid ${c.border}`, background: c.bgMuted, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '14px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: c.text, marginBottom: '2px', letterSpacing: '-0.02em' }}>📋 Database All Proyek 2021–2026</h3>
          <p style={{ fontSize: '12px', color: c.textMuted }}>
            {fNum(filteredData.length)} proyek · Nilai kontrak {fShort(summary.nk)} · PU {fShort(summary.pu)} · BK {fShort(summary.bk)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <select value={segFilter} onChange={e => setFilterT(setSegFilter)(e.target.value)} style={selectStyle}>
            <option value="">Semua Segmentasi</option>
            {segOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setFilterT(setStatusFilter)(e.target.value)} style={selectStyle}>
            <option value="">Semua Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={ieFilter} onChange={e => setFilterT(setIeFilter)(e.target.value)} style={selectStyle}>
            <option value="">Internal & Eksternal</option>
            <option value="Internal">Internal</option>
            <option value="Eksternal">Eksternal</option>
          </select>
          {(() => {
            // Reset mencakup dropdown filter DAN urutan panah di judul kolom
            const adaFilter = segFilter !== '' || statusFilter !== '' || ieFilter !== ''
              || sortCol !== 'no' || sortDir !== 'asc';
            return (
              <button className="sn-chip-btn" disabled={!adaFilter} title="Reset filter & urutan kolom"
                onClick={() => React.startTransition(() => {
                  setSegFilter(''); setStatusFilter(''); setIeFilter('');
                  setSortCol('no'); setSortDir('asc');
                })}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px',
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
      </div>

      <div className="sn-table-wrap sn-scroll" style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h.label} onClick={h.col ? () => toggleSort(h.col!) : undefined}
                  style={{ padding: '11px 12px', textAlign: h.align, fontWeight: 700, color: sortCol === h.col ? c.text : c.textMuted, borderBottom: `2px solid ${c.border}`, background: c.bgSubtle, whiteSpace: 'nowrap', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', cursor: h.col ? 'pointer' : 'default', userSelect: 'none', position: 'sticky', top: 0, zIndex: 1 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{h.label}{sortIcon(h.col)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const bkPuBad = row.bk_pu_pct > 100;
              const bkPuWarn = row.bk_pu_pct > 90 && row.bk_pu_pct <= 100;
              const bkPuColor = row.pu_sd <= 0 ? c.textSubtle : bkPuBad ? c.kritis.text : bkPuWarn ? c.perhatian.text : c.sehat.text;
              const selesai = /selesai/i.test(row.status);
              const badge = selesai ? c.sehat : /annual/i.test(row.status) ? c.perhatian : { bg: c.bgMuted, text: c.textMuted, border: c.border };
              const progW = Math.min(row.progress_pct, 100);
              const progC = row.progress_pct >= 100 ? '#10b981' : row.progress_pct >= 50 ? '#3b82f6' : '#f59e0b';
              return (
                <tr key={`${row.id_project}-${row.no}`} className="sn-row" style={{ borderBottom: `1px solid ${c.border}` }}
                  ref={el => { const k = `${row.id_project}-${row.no}`; if (el) rowRefs.current.set(k, el); else rowRefs.current.delete(k); }}>
                  <td style={{ padding: '10px 12px', color: c.textMuted, fontSize: '11px', fontWeight: 500 }}>{row.no || '–'}</td>
                  <td style={{ padding: '10px 12px', color: c.textMuted, fontFamily: "'JetBrains Mono','Consolas',monospace", fontSize: '10px' }}>{row.id_project}</td>
                  <td style={{ padding: '10px 12px', color: c.text, fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.project_name}>{row.project_name}</td>
                  <td style={{ padding: '10px 12px', color: c.textMuted, whiteSpace: 'nowrap' }}>{row.segmentasi}</td>
                  <td style={{ padding: '10px 12px', color: c.textMuted, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.pemberi_kerja}>{row.pemberi_kerja}</td>
                  <td style={{ padding: '10px 12px', color: c.textMuted, whiteSpace: 'nowrap', textAlign: 'right' }}>{fShort(row.nilai_kontrak)}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      <div style={{ width: '48px', height: '5px', background: c.bgMuted, borderRadius: '3px' }}>
                        <div className="sn-progress-bar" style={{ height: '100%', borderRadius: '3px', width: `${progW}%`, background: progC }} />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: c.text, minWidth: '34px', textAlign: 'right' }}>{row.progress_pct.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', color: c.text, fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>{fShort(row.pu_sd)}</td>
                  <td style={{ padding: '10px 12px', color: c.textMuted, whiteSpace: 'nowrap', textAlign: 'right' }}>{fShort(row.bk_sd)}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', textAlign: 'right', fontWeight: 700, color: bkPuColor }}>
                    {row.pu_sd > 0 ? `${row.bk_pu_pct.toFixed(1)}%` : '–'}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span className="sn-badge" style={{ fontSize: '10px', padding: '3px 8px', borderRadius: 'var(--radius-full)', background: badge.bg, color: badge.text, border: `1px solid ${badge.border}`, fontWeight: 600 }}>{row.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: c.textMuted, whiteSpace: 'nowrap' }}>{row.kota || row.provinsi || '–'}</td>
                  <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: row.internal_eksternal === 'Internal' ? '#3b82f6' : '#10b981' }}>{row.internal_eksternal}</span>
                  </td>
                  <td style={{ padding: '10px 12px', color: c.textMuted, whiteSpace: 'nowrap', textAlign: 'right', fontWeight: 600 }}>
                    {row.piutang !== 0 ? fShort(row.piutang) : '–'}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={14} style={{ padding: '50px', textAlign: 'center', color: c.textMuted, fontSize: '13px' }}>🔍 Tidak ada proyek yang cocok dengan filter saat ini.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info jumlah baris (seluruh proyek langsung ditampilkan) */}
      <div style={{ padding: '10px 18px', borderTop: `1px solid ${c.border}`, background: c.bgMuted }}>
        <span style={{ fontSize: '11px', color: c.textMuted, fontWeight: 500 }}>
          {filteredData.length === 0 ? 'Tidak ada data' : `Menampilkan seluruh ${fNum(filteredData.length)} proyek`}
        </span>
      </div>
    </div>
  );
};

export default React.memo(MasterView);
