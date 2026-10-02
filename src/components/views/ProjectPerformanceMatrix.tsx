import React, { useMemo } from 'react';
import { THEME } from '../../constants';
import type { Theme } from '../../constants';
import type { UnifiedProjectData } from '../../types';
import { fShort } from '../../utils';
interface Props {
  data: UnifiedProjectData[];
  dark: boolean;
}
const ProjectPerformanceMatrix: React.FC<Props> = ({ data, dark }) => {
  const c: Theme = dark ? THEME.dark : THEME.light;

  const rows = useMemo(() => {
    // Semua baris ikut (proyek & non-proyek), asal punya nilai RKAP/realisasi
    return data
      .filter(d => d.pu_rkap > 0 || d.pu_real > 0)
      .map(d => {
        // Behind schedule: % deviasi realisasi PU terhadap RKAP (negatif = tertinggal)
        const schedulePct = d.pu_rkap > 0 ? ((d.pu_real - d.pu_rkap) / d.pu_rkap) * 100 : 0;
        // Cost overrun: BK/PU RKAP (kolom S) vs BK/PU Realisasi (kolom W).
        // Realisasi > RKAP = boros (Jelek); Realisasi < RKAP = Lebih Bagus.
        const bkPuReal = d.pu_real > 0 ? (d.bk_real / d.pu_real) * 100 : 0;
        const bkPuRkap = d.pu_rkap > 0 ? (d.bk_rkap / d.pu_rkap) * 100 : 0;
        const costOverrunPp = bkPuReal > 0 && bkPuRkap > 0 ? bkPuReal - bkPuRkap : 0;
        const behind = schedulePct < 0;
        const jelek = costOverrunPp > 0;
        // Extra Attention bila tertinggal jadwal ATAU biaya membengkak
        const extraAttention = behind || jelek;
        // Skor severity untuk ranking: makin tertinggal & makin boros = makin atas
        const severity = Math.min(schedulePct, 0) * -1 + Math.max(costOverrunPp, 0) * 2;
        return {
          nama: d.project_name,
          extraAttention,
          deviasiPu: d.deviasi_pu,
          schedulePct,
          costOverrunPp,
          bkPuReal,
          bkPuRkap,
          severity,
        };
      })
      .sort((a, b) => b.severity - a.severity)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [data]);

  const statusBadge = (extraAttention: boolean) => {
    const s = extraAttention ? c.perhatian : c.sehat;
    return (
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          padding: '3px 10px',
          borderRadius: 'var(--radius-full)',
          background: s.bg,
          color: s.text,
          border: `1px solid ${s.border}`,
          whiteSpace: 'nowrap',
        }}
      >
        {extraAttention ? 'Extra Attention' : 'Normal'}
      </span>
    );
  };

  const thStyle: React.CSSProperties = {
    padding: '8px 12px',
    color: '#fff',
    fontWeight: 700,
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    whiteSpace: 'nowrap',
  };

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
          marginBottom: '14px',
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
            Project Performance Detail Matrix
          </h3>
          <p style={{ fontSize: '12px', color: c.textMuted }}>
            Diurutkan dari proyek paling bermasalah (keterlambatan & pembengkakan biaya)
          </p>
        </div>
        <span style={{ fontSize: '10px', color: c.textMuted, fontWeight: 600 }}>
          {rows.length} proyek
        </span>
      </div>

      <div
        className="sn-scroll"
        style={{
          maxHeight: '360px',
          overflowY: 'auto',
          overflowX: 'auto',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${c.border}`,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#1e293b', position: 'sticky', top: 0, zIndex: 1 }}>
              <th style={{ ...thStyle, textAlign: 'center', width: '52px' }}>Rank</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>Nama Proyek</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Behind Schedule</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Cost Overrun</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const behind = row.schedulePct < 0;
              const overrun = row.costOverrunPp > 0;
              const adaCost = row.bkPuReal > 0 && row.bkPuRkap > 0;
              return (
                <tr
                  key={row.rank}
                  className="sn-row"
                  style={{ borderBottom: `1px solid ${c.border}` }}
                >
                  <td
                    style={{
                      padding: '9px 12px',
                      textAlign: 'center',
                      fontWeight: 800,
                      color: row.rank <= 3 ? '#dc2626' : c.textMuted,
                    }}
                  >
                    {row.rank}
                  </td>
                  <td
                    style={{
                      padding: '9px 12px',
                      color: c.text,
                      fontWeight: 600,
                      maxWidth: '260px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={row.nama}
                  >
                    {row.nama}
                  </td>
                  <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                    {statusBadge(row.extraAttention)}
                  </td>
                  <td
                    style={{
                      padding: '9px 12px',
                      textAlign: 'right',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      color: behind ? '#dc2626' : '#16a34a',
                    }}
                    title={`Deviasi PU: ${fShort(row.deviasiPu)}`}
                  >
                    {behind
                      ? `- ${Math.abs(row.schedulePct).toFixed(1)}%`
                      : row.schedulePct > 0
                        ? `+ ${row.schedulePct.toFixed(1)}%`
                        : '0%'}
                  </td>
                  <td
                    style={{
                      padding: '9px 12px',
                      textAlign: 'right',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      color: overrun ? '#dc2626' : '#16a34a',
                    }}
                    title={adaCost ? `BK/PU RKAP ${row.bkPuRkap.toFixed(1)}% → Realisasi ${row.bkPuReal.toFixed(1)}%` : undefined}
                  >
                    {adaCost
                      ? `${overrun ? '+' : ''}${row.costOverrunPp.toFixed(1)}%`
                      : '—'}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: c.textMuted }}>
                  Belum ada data proyek
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default React.memo(ProjectPerformanceMatrix);
