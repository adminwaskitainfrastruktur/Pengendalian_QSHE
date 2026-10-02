import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, RotateCcw } from 'lucide-react';
import { THEME, MONTH_LABELS } from '../../constants';
import type { Theme } from '../../constants';
import type { UnifiedProjectData, Filters } from '../../types';
import { fShort } from '../../utils';
import AnimatedNumber from './../AnimatedNumber';
interface Props {
  data: UnifiedProjectData[];
  filters: Filters;
  dark: boolean;
}
// Segmentasi finansial yang ditampilkan sebagai kolom Realisasi
const SEGMENTS = ['Konstruksi', 'Sewa Alat', 'Sewa Produksi'];

// Kolom breakdown yang bisa diurut lewat panah di judulnya
type BdSortKey = 'nama' | 'rkap' | 'pu' | 'bkPu' | 'laba';
const CommercialPerformance: React.FC<Props> = ({ data, filters, dark }) => {
  const c: Theme = dark ? THEME.dark : THEME.light;
  const bulanLabel = MONTH_LABELS[filters.bulan ?? 12] ?? 'Des';
  const tahunLabel = String(filters.tahun ?? data[0]?.tahun ?? '').slice(-2);

  // Ringkasan kinerja s.d bulan terpilih: RKAP total + realisasi dipecah per segmentasi
  const kinerjaRows = useMemo(() => {
    const rkapPu = data.reduce((s, d) => s + d.pu_rkap, 0);
    const rkapBk = data.reduce((s, d) => s + d.bk_rkap, 0);
    const rkapLaba = data.reduce((s, d) => s + d.laba_rkap, 0);
    const bkPuRkapPct = rkapPu > 0 ? (rkapBk / rkapPu) * 100 : 0;

    // RKAP setahun penuh (semua bulan di tahun terpilih), tidak terpengaruh filter bulan
    let puRkapSetahun = 0;
    let bkRkapSetahun = 0;
    let labaRkapSetahun = 0;
    data.forEach(d => d.histori_bulanan.forEach(h => {
      if (filters.tahun !== null && h.tahun !== filters.tahun) return;
      puRkapSetahun += h.rkap;
      bkRkapSetahun += h.bkRkap;
      labaRkapSetahun += h.labaRkap;
    }));
    const bkPuRkapSetahunPct = puRkapSetahun > 0 ? (bkRkapSetahun / puRkapSetahun) * 100 : 0;

    // Realisasi per segmentasi
    const seg = SEGMENTS.map(name => {
      const rows = data.filter(d => d.segmentasi === name);
      const pu = rows.reduce((s, d) => s + d.pu_real, 0);
      const bk = rows.reduce((s, d) => s + d.bk_real, 0);
      const laba = rows.reduce((s, d) => s + d.laba_real, 0);
      const bkPu = pu > 0 ? (bk / pu) * 100 : 0;
      return { pu, bk, laba, bkPu };
    });

    const totalPu = seg.reduce((s, v) => s + v.pu, 0);
    const totalBk = seg.reduce((s, v) => s + v.bk, 0);
    const totalLaba = seg.reduce((s, v) => s + v.laba, 0);
    const totalBkPu = totalPu > 0 ? (totalBk / totalPu) * 100 : 0;

    // % pencapaian: Total realisasi dibanding RKAP s.d bulan
    const capai = (total: number, rkap: number) => rkap !== 0 ? (total / rkap) * 100 : 0;

    return [
      { uraian: 'PU', rkap: rkapPu, real: seg.map(s => s.pu), total: totalPu, capaiPct: capai(totalPu, rkapPu), rkapSetahun: puRkapSetahun, sisa: puRkapSetahun - totalPu },
      { uraian: 'BK', rkap: rkapBk, real: seg.map(s => s.bk), total: totalBk, capaiPct: capai(totalBk, rkapBk), rkapSetahun: bkRkapSetahun, sisa: bkRkapSetahun - totalBk },
      { uraian: 'BK/PU', rkap: bkPuRkapPct, real: seg.map(s => s.bkPu), total: totalBkPu, capaiPct: capai(totalBkPu, bkPuRkapPct), rkapSetahun: bkPuRkapSetahunPct, sisa: bkPuRkapSetahunPct - totalBkPu, isRatio: true },
      { uraian: 'Laba Bruto', rkap: rkapLaba, real: seg.map(s => s.laba), total: totalLaba, capaiPct: capai(totalLaba, rkapLaba), rkapSetahun: labaRkapSetahun, sisa: labaRkapSetahun - totalLaba },
    ];
  }, [data, filters.tahun]);

  // Sortir breakdown: klik panah di judul kolom (default PU terbesar dulu)
  const [bdSort, setBdSort] = useState<BdSortKey>('pu');
  const [bdDir, setBdDir] = useState<'asc' | 'desc'>('desc');
  const toggleBdSort = (k: BdSortKey) => {
    React.startTransition(() => {
      if (bdSort === k) setBdDir(d => d === 'asc' ? 'desc' : 'asc');
      else { setBdSort(k); setBdDir(k === 'nama' ? 'asc' : 'desc'); }
    });
  };

  const breakdownLog = useMemo(() => {
    // Semua baris ditampilkan — proyek maupun non-proyek — asal punya RKAP/realisasi.
    // Sumber kolom sheet Data based RKAP_value: RKAP = P, PU = T, BK/PU = W (U/T), Laba Bruto = V
    const rows = [...data]
      .filter(d => d.pu_real > 0 || d.pu_rkap > 0)
      .map(d => ({
        id: d.id_project,
        nama: d.project_name,
        rkap: d.pu_rkap,
        pu: d.pu_real,
        bkPu: d.bk_pu_ratio * 100,
        laba: d.laba_real,
      }));
    const dir = bdDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => bdSort === 'nama'
      ? a.nama.localeCompare(b.nama) * dir
      : (a[bdSort] - b[bdSort]) * dir);
    return rows;
  }, [data, bdSort, bdDir]);
  return (
    <div
      className="sn-card sn-slide-up"
      style={{
        background: c.card,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
      }}
    >
      {/* Berdampingan di layar lebar, bertumpuk di layar sempit */}
      <div
        className="rg-split"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
        }}
      >
        {/* minWidth 0: tanpa ini grid item memakai min-width:auto, ikut melebar
            mengikuti tabel, lalu terpotong oleh overflow:hidden kartu induk
            sehingga area scroll horizontalnya tidak pernah aktif */}
        <div style={{ padding: '24px', borderRight: `1px solid ${c.border}`, minWidth: 0 }}>
          <div style={{ marginBottom: '14px' }}>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: c.text,
                letterSpacing: '-0.02em',
                marginBottom: '3px',
              }}
            >
              Kinerja S.D. Bulan Ini
            </h3>
            <p style={{ fontSize: '11px', color: c.textMuted }}>
              Periode s.d {bulanLabel} '{tahunLabel}
            </p>
          </div>

          <div
            className="sn-scroll sn-table-wrap"
            style={{
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${c.border}`,
              overflowX: 'auto',
            }}
          >
            <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#1e293b' }}>
                  <th
                    rowSpan={2}
                    style={{ textAlign: 'left', padding: '8px 12px', color: '#fff', fontWeight: 700, verticalAlign: 'middle' }}
                  >
                    Uraian
                  </th>
                  <th
                    rowSpan={2}
                    style={{ textAlign: 'right', padding: '8px 12px', color: '#fff', fontWeight: 700, verticalAlign: 'middle', borderRight: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    RKAP
                  </th>
                  <th
                    colSpan={SEGMENTS.length + 1}
                    style={{ textAlign: 'center', padding: '6px 12px', color: '#fff', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.15)', borderRight: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    Realisasi
                  </th>
                  <th
                    rowSpan={2}
                    style={{ textAlign: 'right', padding: '8px 12px', color: '#fff', fontWeight: 700, verticalAlign: 'middle', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    % Real/RKAP
                  </th>
                  <th
                    rowSpan={2}
                    style={{ textAlign: 'right', padding: '8px 12px', color: '#fff', fontWeight: 700, verticalAlign: 'middle', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    RKAP {filters.tahun ?? 2026}
                  </th>
                  <th
                    rowSpan={2}
                    style={{ textAlign: 'right', padding: '8px 12px', color: '#fff', fontWeight: 700, verticalAlign: 'middle' }}
                  >
                    Sisa
                  </th>
                </tr>
                <tr style={{ background: '#1e293b' }}>
                  {[...SEGMENTS, 'Total'].map(name => (
                    <th
                      key={name}
                      style={{ textAlign: 'right', padding: '6px 12px', color: '#fff', fontWeight: name === 'Total' ? 700 : 600, fontSize: '11px', whiteSpace: 'nowrap', borderRight: name === 'Total' ? '1px solid rgba(255,255,255,0.15)' : undefined }}
                    >
                      {name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kinerjaRows.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom: `1px solid ${c.border}`,
                      background: row.isRatio ? c.bgMuted : c.card,
                    }}
                  >
                    <td style={{ padding: '9px 12px', fontWeight: 600, color: c.text }}>
                      {row.uraian}
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: c.text, borderRight: `1px solid ${c.border}` }}>
                      <AnimatedNumber value={row.rkap} format={row.isRatio ? n => `${n.toFixed(2)}%` : fShort} />
                    </td>
                    {row.real.map((val, j) => (
                      <td
                        key={j}
                        style={{
                          padding: '9px 12px',
                          textAlign: 'right',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          color: val === 0 ? c.textSubtle : c.text,
                        }}
                      >
                        {row.isRatio
                          ? (val > 0 ? `${val.toFixed(2)}%` : '—')
                          : (val !== 0 ? fShort(val) : '—')}
                      </td>
                    ))}
    {/* Total: kolom merah, angka hitam (mengikuti tema) */}
                    <td
                      style={{
                        padding: '9px 12px',
                        textAlign: 'right',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        borderRight: `1px solid ${c.border}`,
                        background: dark ? 'rgba(220,38,38,0.30)' : '#fecaca',
                        color: row.total === 0 ? c.textSubtle : c.text,
                      }}
                    >
                      {row.isRatio
                        ? (row.total > 0 ? `${row.total.toFixed(2)}%` : '—')
                        : (row.total !== 0 ? fShort(row.total) : '—')}
                    </td>
                    {/* % pencapaian Total terhadap RKAP s.d bulan */}
                    <td
                      style={{
                        padding: '9px 12px',
                        textAlign: 'right',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        borderRight: `1px solid ${c.border}`,
                        color: row.capaiPct === 0 ? c.textSubtle : c.text,
                      }}
                    >
                      {row.capaiPct !== 0 ? `${row.capaiPct.toFixed(2)}%` : '—'}
                    </td>
                    {/* RKAP setahun penuh */}
                    <td
                      style={{
                        padding: '9px 12px',
                        textAlign: 'right',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        borderRight: `1px solid ${c.border}`,
                        color: c.text,
                      }}
                    >
                      {row.isRatio
                        ? (row.rkapSetahun > 0 ? `${row.rkapSetahun.toFixed(2)}%` : '—')
                        : (row.rkapSetahun !== 0 ? fShort(row.rkapSetahun) : '—')}
                    </td>
                    {/* Sisa = RKAP setahun - Total realisasi */}
                    <td
                      style={{
                        padding: '9px 12px',
                        textAlign: 'right',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        color: c.text,
                      }}
                    >
                      {row.isRatio
                        ? (row.rkapSetahun > 0 && row.total > 0 ? `${row.sisa.toFixed(2)}%` : '—')
                        : (row.rkapSetahun !== 0 ? fShort(row.sisa) : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '14px',
            }}
          >
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: c.text }}>
              Breakdown per Proyek
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '10px', color: c.textMuted, fontWeight: 600 }}>
                {breakdownLog.length} proyek
              </span>
              {/* Reset urutan panah kolom ke default (PU terbesar dulu) */}
              {(() => {
                const adaFilter = bdSort !== 'pu' || bdDir !== 'desc';
                return (
                  <button className="sn-chip-btn" disabled={!adaFilter} title="Reset urutan kolom"
                    onClick={() => React.startTransition(() => { setBdSort('pu'); setBdDir('desc'); })}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px',
                      borderRadius: 'var(--radius-md)', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap',
                      border: `1.5px solid ${adaFilter ? 'rgba(59,130,246,0.45)' : c.border}`,
                      background: adaFilter ? (dark ? 'rgba(59,130,246,0.12)' : '#eff6ff') : c.card,
                      color: adaFilter ? '#3b82f6' : c.textSubtle,
                      cursor: adaFilter ? 'pointer' : 'not-allowed',
                      transition: 'all 0.25s var(--ease-out)',
                    }}>
                    <RotateCcw style={{ width: '11px', height: '11px' }} />
                    Reset
                  </button>
                );
              })()}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              maxHeight: '340px',
              overflowY: 'auto',
              overflowX: 'auto',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${c.border}`,
            }}
            className="sn-scroll sn-table-wrap"
          >
            <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr
                  style={{
                    position: 'sticky',
                    top: 0,
                    background: c.bgMuted,
                    zIndex: 1,
                  }}
                >
                  {([
                    { label: 'Nama Proyek', key: 'nama', align: 'left' },
                    { label: 'RKAP', key: 'rkap', align: 'right' },
                    { label: 'PU', key: 'pu', align: 'right' },
                    { label: 'BK/PU', key: 'bkPu', align: 'right' },
                    { label: 'Laba Bruto', key: 'laba', align: 'right' },
                  ] as { label: string; key: BdSortKey; align: 'left' | 'right' }[]).map(h => {
                    const active = bdSort === h.key;
                    const Arrow = !active ? ChevronsUpDown : bdDir === 'asc' ? ChevronUp : ChevronDown;
                    return (
                      <th
                        key={h.label}
                        onClick={() => toggleBdSort(h.key)}
                        title="Klik untuk mengurut"
                        style={{
                          textAlign: h.align,
                          padding: '8px 12px',
                          fontWeight: 700,
                          color: active ? '#3b82f6' : c.textMuted,
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          borderBottom: `1px solid ${c.border}`,
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          {h.label}
                          <Arrow style={{ width: '11px', height: '11px', flexShrink: 0 }} />
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {breakdownLog.map(row => (
                  <tr key={row.id} className="sn-row" style={{ borderBottom: `1px solid ${c.border}` }}>
                    <td
                      style={{
                        padding: '9px 12px',
                        color: c.text,
                        fontWeight: 500,
                        maxWidth: '240px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={row.nama}
                    >
                      {row.nama}
                    </td>
                    <td
                      style={{
                        padding: '9px 12px',
                        textAlign: 'right',
                        color: c.text,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fShort(row.rkap)}
                    </td>
                    {/* PU merah bila realisasi belum menyamai RKAP */}
                    <td
                      style={{
                        padding: '9px 12px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: row.pu < row.rkap ? '#dc2626' : '#16a34a',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fShort(row.pu)}
                    </td>
                    <td
                      style={{
                        padding: '9px 12px',
                        textAlign: 'right',
                        color: c.textMuted,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.bkPu > 0 ? `${row.bkPu.toFixed(2)}%` : '—'}
                    </td>
                    <td
                      style={{
                        padding: '9px 12px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: row.laba < 0 ? '#dc2626' : '#16a34a',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fShort(row.laba)}
                    </td>
                  </tr>
                ))}
                {breakdownLog.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{ padding: '20px', textAlign: 'center', color: c.textMuted }}
                    >
                      Belum ada data realisasi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default React.memo(CommercialPerformance);
