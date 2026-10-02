import React, { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Layers3, Hash, Landmark } from 'lucide-react';
import { THEME, PROVINCE_GEO } from '../../constants';
import type { Theme } from '../../constants';
import type { AllProyekRow } from '../../types';
import { fShort, fNum } from '../../utils';

interface Props {
  allProyek: AllProyekRow[];
  dark: boolean;
}

interface ProvAgg {
  provinsi: string;
  lat: number;
  lng: number;
  hasGeo: boolean;
  count: number;
  pu: number;
  bk: number;
  nilaiKontrak: number;
  internal: number;
  eksternal: number;
  selesai: number;
  berjalan: number;
  topProyek: { name: string; pu: number }[];
}

type Metric = 'pu' | 'count' | 'nk';

const MapCtrl: React.FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 350);
    return () => clearTimeout(t);
  }, [map]);
  useEffect(() => {
    if (center) map.flyTo(center, 7, { duration: 1.4 });
  }, [center, map]);
  return null;
};

const bkPuColor = (pu: number, bk: number): string => {
  if (pu <= 0) return '#64748b';
  const r = bk / pu;
  if (r < 0.9) return '#10b981';
  if (r <= 1) return '#f59e0b';
  return '#ef4444';
};

const STATUS_OPTIONS = ['Selesai', 'Kontribusi Annual'] as const;

const MapPanel: React.FC<Props> = ({ allProyek, dark }) => {
  const c: Theme = dark ? THEME.dark : THEME.light;
  const [metric, setMetric] = useState<Metric>('pu');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [center, setCenter] = useState<[number, number] | null>(null);
  const [sel, setSel] = useState<string | null>(null);

  const provinsiAgg = useMemo(() => {
    const map = new Map<string, ProvAgg>();
    allProyek.forEach(p => {
      if (!p.provinsi) return;
      if (statusFilter !== 'all' && p.status.trim().toLowerCase() !== statusFilter.toLowerCase()) return;
      if (!map.has(p.provinsi)) {
        const geo = PROVINCE_GEO[p.provinsi];
        map.set(p.provinsi, {
          provinsi: p.provinsi,
          lat: geo?.lat ?? 0, lng: geo?.lng ?? 0, hasGeo: !!geo,
          count: 0, pu: 0, bk: 0, nilaiKontrak: 0,
          internal: 0, eksternal: 0, selesai: 0, berjalan: 0,
          topProyek: [],
        });
      }
      const a = map.get(p.provinsi)!;
      a.count += 1;
      a.pu += p.pu_sd;
      a.bk += p.bk_sd;
      a.nilaiKontrak += p.nilai_kontrak;
      if (/internal/i.test(p.internal_eksternal)) a.internal += 1;
      else if (/eksternal|external/i.test(p.internal_eksternal)) a.eksternal += 1;
      if (/selesai/i.test(p.status)) a.selesai += 1; else a.berjalan += 1;
      a.topProyek.push({ name: p.project_name, pu: p.pu_sd });
    });
    const arr = Array.from(map.values());
    arr.forEach(a => { a.topProyek = a.topProyek.sort((x, y) => y.pu - x.pu).slice(0, 3); });
    const valOf = (a: ProvAgg) => metric === 'pu' ? a.pu : metric === 'nk' ? a.nilaiKontrak : a.count;
    return arr.sort((a, b) => valOf(b) - valOf(a));
  }, [allProyek, metric, statusFilter]);

  const totalProyekTampil = useMemo(() => provinsiAgg.reduce((s, a) => s + a.count, 0), [provinsiAgg]);

  const valFor = (a: ProvAgg) => metric === 'pu' ? a.pu : metric === 'nk' ? a.nilaiKontrak : a.count;

  const maxVal = useMemo(() =>
    Math.max(1, ...provinsiAgg.map(valFor)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [provinsiAgg, metric]);

  const radiusFor = (a: ProvAgg) => 8 + Math.sqrt(Math.max(valFor(a), 0) / maxVal) * 32;

  // Ringkasan nasional untuk strip info di header
  const nasional = useMemo(() => {
    const pu = provinsiAgg.reduce((s, a) => s + a.pu, 0);
    const bk = provinsiAgg.reduce((s, a) => s + a.bk, 0);
    const nk = provinsiAgg.reduce((s, a) => s + a.nilaiKontrak, 0);
    const selesai = provinsiAgg.reduce((s, a) => s + a.selesai, 0);
    const berjalan = provinsiAgg.reduce((s, a) => s + a.berjalan, 0);
    const internal = provinsiAgg.reduce((s, a) => s + a.internal, 0);
    const eksternal = provinsiAgg.reduce((s, a) => s + a.eksternal, 0);
    return { pu, bk, nk, selesai, berjalan, internal, eksternal, bkPu: pu > 0 ? (bk / pu) * 100 : 0 };
  }, [provinsiAgg]);

  const chipBtn = (m: Metric, label: string, Icon: React.ElementType) => (
    <button onClick={() => setMetric(m)} className="sn-chip-btn"
      style={{
        display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px',
        borderRadius: 'var(--radius-full)', border: `1px solid ${metric === m ? '#3b82f6' : c.border}`,
        background: metric === m ? (dark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent',
        color: metric === m ? (dark ? '#60a5fa' : '#2563eb') : c.textMuted,
        fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease',
      }}>
      <Icon style={{ width: '12px', height: '12px' }} /> {label}
    </button>
  );

  const statusChip = (value: string, label: string) => (
    <button key={value} onClick={() => setStatusFilter(value)} className="sn-chip-btn"
      style={{
        padding: '5px 12px', borderRadius: 'var(--radius-full)',
        border: `1px solid ${statusFilter === value ? '#3b82f6' : c.border}`,
        background: statusFilter === value ? (dark ? 'rgba(59,130,246,0.15)' : '#eff6ff') : 'transparent',
        color: statusFilter === value ? (dark ? '#60a5fa' : '#2563eb') : c.textMuted,
        fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
      }}>
      {label}
    </button>
  );

  return (
    <div className="sn-card sn-slide-up" style={{ background: c.card, border: `1px solid ${c.border}`, borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ padding: '18px 22px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: c.text, marginBottom: '3px', letterSpacing: '-0.02em' }}>🗺️ Peta Persebaran Proyek</h3>
          <p style={{ fontSize: '12px', color: c.textMuted }}>
            {fNum(totalProyekTampil)} proyek di {provinsiAgg.length} provinsi{statusFilter !== 'all' ? ` · ${statusFilter}` : ''} · warna = efisiensi BK/PU, ukuran = {metric === 'pu' ? 'nilai PU' : metric === 'nk' ? 'nilai kontrak' : 'jumlah proyek'}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {chipBtn('pu', 'Nilai PU', Layers3)}
            {chipBtn('nk', 'Nilai Kontrak', Landmark)}
            {chipBtn('count', 'Jumlah Proyek', Hash)}
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: c.textSubtle, textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '2px' }}>Status</span>
            {statusChip('all', 'Semua')}
            {STATUS_OPTIONS.map(s => statusChip(s, s))}
          </div>
        </div>
      </div>

      {/* Strip ringkasan nasional */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 22px 14px' }}>
        {[
          ['Total PU', fShort(nasional.pu), c.text],
          ['Total Nilai Kontrak', fShort(nasional.nk), c.text],
          ['BK/PU Keseluruhan', nasional.bkPu > 0 ? `${nasional.bkPu.toFixed(1)}%` : '—',
            nasional.bkPu <= 0 ? c.textMuted : nasional.bkPu < 90 ? '#10b981' : nasional.bkPu <= 100 ? '#f59e0b' : '#ef4444'],
          ['Berjalan / Selesai', `${nasional.berjalan} / ${nasional.selesai}`, c.text],
          ['Internal / Eksternal', `${nasional.internal} / ${nasional.eksternal}`, c.text],
        ].map(([label, val, color]) => (
          <div key={label as string} style={{ padding: '7px 12px', borderRadius: 'var(--radius-md)', background: c.bgMuted, border: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: c.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
            <span style={{ fontSize: '13px', fontWeight: 800, color: color as string }}>{val}</span>
          </div>
        ))}
      </div>

      <div className="rg-map" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, borderTop: `1px solid ${c.border}` }}>
        {/* Ranking provinsi */}
        <div style={{ borderRight: `1px solid ${c.border}`, maxHeight: '440px', overflowY: 'auto' }} className="sn-scroll rg-map-list">
          {provinsiAgg.map((a, i) => {
            const val = metric === 'pu' ? a.pu : a.count;
            const pct = (val / maxVal) * 100;
            const color = bkPuColor(a.pu, a.bk);
            const active = sel === a.provinsi;
            return (
              <div key={`${metric}-${a.provinsi}`} className="sn-row sn-table-row"
                onClick={() => { if (a.hasGeo) { setCenter([a.lat, a.lng]); setSel(a.provinsi); } }}
                style={{
                  padding: '10px 16px', borderBottom: `1px solid ${c.border}`, cursor: a.hasGeo ? 'pointer' : 'default',
                  background: active ? (dark ? 'rgba(59,130,246,0.1)' : '#eff6ff') : 'transparent',
                  borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
                  animationDelay: `${Math.min(i, 12) * 22}ms`,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0 }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: c.textSubtle, width: '16px', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.provinsi}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: c.text, flexShrink: 0 }}>
                    {metric === 'count' ? `${a.count} proyek` : fShort(valFor(a))}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: c.chartBar, overflow: 'hidden' }}>
                    <div className="sn-progress-bar" style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '9px', color: c.textMuted, flexShrink: 0 }}>
                    {metric === 'count' ? fShort(a.pu) : `${a.count} proyek`}
                  </span>
                </div>
                {/* Info tambahan: efisiensi & status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '9px' }}>
                  <span style={{ fontWeight: 700, color }}>
                    {a.pu > 0 ? `BK/PU ${((a.bk / a.pu) * 100).toFixed(1)}%` : 'Belum ada PU'}
                  </span>
                  <span style={{ color: c.textMuted }}>
                    {a.berjalan} berjalan · {a.selesai} selesai
                  </span>
                </div>
              </div>
            );
          })}
          {provinsiAgg.length === 0 && (
            <div style={{ padding: '30px 16px', textAlign: 'center', fontSize: '12px', color: c.textMuted }}>Belum ada data provinsi</div>
          )}
        </div>

        {/* Peta */}
        <div style={{ height: '440px', position: 'relative', zIndex: 0 }}>
          <MapContainer center={[-2.5489, 118.0149]} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false} preferCanvas
            // Kunci tampilan ke wilayah Indonesia: tak bisa zoom-out / geser keluar batas
            minZoom={5}
            maxBounds={[[-13.5, 92], [9.5, 143]]}
            maxBoundsViscosity={1.0}>
            {/* Tile Esri Gray Canvas: gratis tanpa API key, punya varian light & dark asli.
                CARTO ditinggalkan karena sejak 2025 tile gratisnya diberi watermark
                "API KEY REQUIRED". key memaksa ganti tile saat tema berubah. */}
            <TileLayer
              key={dark ? 'dark' : 'light'}
              attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ'
              maxNativeZoom={16}
              maxZoom={18}
              url={dark
                ? 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}'
                : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'}
            />
            <MapCtrl center={center} />
            {provinsiAgg.filter(a => a.hasGeo).map((a, rank) => {
              const color = bkPuColor(a.pu, a.bk);
              const isSel = sel === a.provinsi;
              // 5 provinsi terbesar diberi label angka permanen di atas lingkarannya
              const topFive = rank < 5;
              return (
                <CircleMarker key={a.provinsi} center={[a.lat, a.lng]} radius={radiusFor(a)}
                  pathOptions={{ color, weight: isSel ? 3 : 2, fillColor: color, fillOpacity: isSel ? 0.6 : 0.32 }}
                  eventHandlers={{
                    click: () => setSel(a.provinsi),
                    mouseover: e => e.target.setStyle({ fillOpacity: 0.6, weight: 3 }),
                    mouseout: e => e.target.setStyle({ fillOpacity: isSel ? 0.6 : 0.32, weight: isSel ? 3 : 2 }),
                  }}>
                  <Tooltip
                    direction="top"
                    offset={[0, -4]}
                    opacity={topFive ? 0.9 : 0.95}
                    permanent={topFive}
                  >
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '11px', fontWeight: 700 }}>
                      {a.provinsi}
                    </span>
                    <span style={{ fontFamily: "'Inter',sans-serif", fontSize: '10px', fontWeight: 500, color: '#64748b' }}>
                      {' '}· {metric === 'count' ? `${a.count} proyek` : fShort(valFor(a))}
                    </span>
                  </Tooltip>
                  <Popup>
                    <div style={{ fontFamily: "'Inter',sans-serif", lineHeight: 1.6, minWidth: '190px' }}>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin style={{ width: '10px', height: '10px' }} /> Provinsi
                      </p>
                      <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>{a.provinsi}</h3>
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {[
                          ['Jumlah Proyek', `${a.count} (${a.selesai} selesai)`],
                          ['Total PU', fShort(a.pu)],
                          ['Total BK', fShort(a.bk)],
                          ['BK/PU', a.pu > 0 ? `${((a.bk / a.pu) * 100).toFixed(1)}%` : '–'],
                          ['Internal / Eksternal', `${a.internal} / ${a.eksternal}`],
                          ['Nilai Kontrak', fShort(a.nilaiKontrak)],
                        ].map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', gap: '10px' }}>
                            <span style={{ color: '#64748b', flexShrink: 0 }}>{k}</span>
                            <span style={{ fontWeight: 600, color: '#0f172a', textAlign: 'right' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      {a.topProyek.length > 0 && (
                        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '8px', paddingTop: '6px' }}>
                          <p style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: '0 0 3px' }}>Proyek Terbesar</p>
                          {a.topProyek.map(t => (
                            <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '10px', color: '#334155' }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>• {t.name}</span>
                              <span style={{ fontWeight: 700, flexShrink: 0 }}>{fShort(t.pu)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
          {/* Legenda: kanan-atas supaya tidak menutupi atribusi peta */}
          <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 500, background: dark ? 'rgba(17,24,39,0.92)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', border: `1px solid ${c.border}`, borderRadius: 'var(--radius-md)', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: 'var(--shadow-md)' }}>
            {[
              ['#10b981', 'BK/PU < 90% (efisien)'],
              ['#f59e0b', 'BK/PU 90–100%'],
              ['#ef4444', 'BK/PU > 100% (boros)'],
              ['#64748b', 'Belum ada PU'],
            ].map(([col, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: c.textMuted, fontWeight: 500 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: col, opacity: 0.75, flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MapPanel);
