import React from 'react';
import { CalendarRange, CalendarDays, Layers, RotateCcw, Search, X, LayoutGrid } from 'lucide-react';
import type { UnifiedProjectData, Filters } from '../types';
import { MONTH_LABELS } from '../constants';
import type { Theme } from '../constants';

interface SingleSelectProps {
  label: string;
  icon: React.ElementType;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  c: Theme;
}

const SingleSelect: React.FC<SingleSelectProps> = ({ label, icon: Icon, value, options, onChange, c }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '10px',
        fontWeight: 700,
        color: c.textMuted,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      <Icon style={{ width: '11px', height: '11px' }} />
      {label}
    </div>
    <select
      className="sn-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        padding: '8px 12px',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${c.border}`,
        background: c.card,
        color: c.text,
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        minWidth: '200px',
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

interface FilterBarProps {
  data: UnifiedProjectData[];
  filters: Filters;
  setFilters: (f: Filters) => void;
  tahunOptions: number[];
  c: Theme;
  dark: boolean;
  search: string;
  setSearch: (v: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
  // Bila diisi, menggantikan daftar segmentasi turunan data (dipakai tab Kinerja QSHE)
  segmentasiOverride?: { value: string; label: string }[];
  // Filter kuadran — hanya dipasang di menu Project Performance
  kuadran?: {
    nilai: number | null;
    setNilai: (v: number | null) => void;
    opsi: { nilai: number; roman: string; nama: string; warna: string; jumlah: number }[];
  };
}

// Segmentasi non-finansial (AMP/Workshop) hanya relevan di tab Kinerja QSHE —
// di dashboard kinerja disembunyikan bersama nilai placeholder lain
const HIDDEN_SEGMENTS = ['-', 'Tidak Diketahui', 'Non-Proyek', 'AMP', 'Workshop'];

const FilterBar: React.FC<FilterBarProps> = ({ data, filters, setFilters, tahunOptions, c, dark, search, setSearch, searchRef, segmentasiOverride, kuadran }) => {
  const segmentasiOptions = React.useMemo(() => {
    if (segmentasiOverride) return segmentasiOverride;
    const set = new Set(data.map(d => d.segmentasi).filter(s => s && !HIDDEN_SEGMENTS.includes(s)));
    return Array.from(set).sort().map(s => ({ value: s, label: s }));
  }, [data, segmentasiOverride]);

  const bulanOptions = Object.entries(MONTH_LABELS).map(([idx, label]) => ({
    value: idx,
    label: `s.d ${label}`,
  }));

  const isDefault = filters.bulan === 12 && filters.segmentasi === null && search === ''
    && (!kuadran || kuadran.nilai === null);

  return (
    <div
      className="sn-fade-in"
      style={{
        background: c.card,
        border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-xl)',
        padding: '16px 20px',
        marginBottom: '6px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <SingleSelect
        label="Tahun"
        icon={CalendarRange}
        value={String(filters.tahun ?? '')}
        options={tahunOptions.map(t => ({ value: String(t), label: String(t) }))}
        onChange={v => setFilters({ ...filters, tahun: Number(v) })}
        c={c}
      />

      <SingleSelect
        label="Bulan (Kumulatif Jan s.d. pilihan)"
        icon={CalendarDays}
        value={String(filters.bulan ?? 12)}
        options={bulanOptions}
        onChange={v => setFilters({ ...filters, bulan: Number(v) })}
        c={c}
      />

      <SingleSelect
        label="Segmentasi"
        icon={Layers}
        value={filters.segmentasi ?? ''}
        options={[
          { value: '', label: 'Semua Segmentasi' },
          ...segmentasiOptions,
        ]}
        onChange={v => setFilters({ ...filters, segmentasi: v === '' ? null : v })}
        c={c}
      />

      {/* Pencarian proyek — bersebelahan dengan tombol Reset */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', flex: 1, minWidth: '220px', maxWidth: '380px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Search style={{ width: '11px', height: '11px' }} />
          Pencarian
        </div>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: c.textMuted, pointerEvents: 'none' }} />
          <input ref={searchRef} type="text" placeholder="Cari proyek atau kota… (Ctrl+K)" value={search} onChange={e => setSearch(e.target.value)} className="sn-input"
            style={{ width: '100%', padding: '8px 32px 8px 32px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${c.border}`, background: c.card, color: c.text, fontSize: '13px', fontWeight: 500 }} />
          {search && (
            <button onClick={() => { setSearch(''); searchRef.current?.focus(); }} className="sn-btn" title="Bersihkan pencarian"
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: c.textMuted, display: 'flex', padding: '3px', borderRadius: '50%' }}>
              <X style={{ width: '12px', height: '12px' }} />
            </button>
          )}
        </div>
      </div>

      {/* Kuadran — hanya tampil di menu yang memasoknya */}
      {kuadran && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <LayoutGrid style={{ width: '11px', height: '11px' }} />
            Kuadran
          </div>
          <div className="sn-pill-scroll" style={{ display: 'flex', gap: '4px' }}>
            {kuadran.opsi.map(o => {
              const aktif = kuadran.nilai === o.nilai;
              return (
                <button key={o.nilai} className="sn-btn" title={o.nama}
                  onClick={() => kuadran.setNilai(aktif ? null : o.nilai)}
                  style={{
                    padding: '8px 11px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap',
                    border: `1.5px solid ${aktif ? o.warna : c.border}`,
                    background: aktif ? `${o.warna}1a` : (dark ? 'transparent' : c.card),
                    color: aktif ? o.warna : c.textMuted,
                    transition: 'all 0.25s var(--ease-out)',
                  }}>
                  {o.roman} · {o.jumlah}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!isDefault && (
        <button
          onClick={() => { setFilters({ ...filters, bulan: 12, segmentasi: null }); setSearch(''); kuadran?.setNilai(null); }}
          className="sn-chip-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: `1.5px solid ${c.border}`,
            background: 'transparent',
            color: c.textMuted,
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: 600,
            marginBottom: '1px',
          }}
        >
          <RotateCcw style={{ width: '12px', height: '12px' }} />
          Reset
        </button>
      )}
    </div>
  );
};

export default React.memo(FilterBar);