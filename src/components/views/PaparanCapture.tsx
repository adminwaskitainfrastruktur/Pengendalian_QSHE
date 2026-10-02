import React from 'react';
import type { UnifiedProjectData, AllProyekRow, Filters } from '../../types';
import DetailMatrixView from './DetailMatrixView';
import MasterView from './MasterView';
import QshePanel from './QshePanel';
import type { SectionKey } from './paparanSections';

/**
 * Area tangkap: me-render komponen web yang asli di luar layar, lalu dipotret
 * html2canvas saat ekspor sehingga slide benar-benar sama dengan tampilan web.
 * Hanya section yang terdaftar di sini yang bisa dipotret.
 */
export const SECTION_POTRET: Partial<Record<SectionKey, { label: string; lebar: number }>> = {
  matrix: { label: 'Project Performance Detail Matrix', lebar: 1500 },
  'db-tabel': { label: 'Database All Proyek', lebar: 1700 },
  'qshe-unit-kartu': { label: 'Kartu Unit QSHE', lebar: 1400 },
};

export const idPotret = (key: SectionKey) => `paparan-potret-${key}`;

interface Props {
  baris: UnifiedProjectData[];
  dbProyek: AllProyekRow[];
  filters: Filters;
  /** Section yang perlu disiapkan untuk dipotret */
  aktif: SectionKey[];
}

/**
 * Dirender di luar viewport (bukan display:none, karena elemen tersembunyi
 * tidak punya ukuran dan html2canvas akan menghasilkan gambar kosong).
 */
const PaparanCapture: React.FC<Props> = ({ baris, dbProyek, filters, aktif }) => {
  if (aktif.length === 0) return null;
  return (
    <div aria-hidden style={{
      position: 'fixed', left: '-20000px', top: 0, zIndex: -1,
      pointerEvents: 'none', background: '#ffffff',
    }}>
      {aktif.includes('matrix') && (
        <div id={idPotret('matrix')} className="paparan-potret" style={{ width: SECTION_POTRET.matrix!.lebar, background: '#fff', padding: '4px' }}>
          <DetailMatrixView data={baris} dark={false} />
        </div>
      )}
      {aktif.includes('db-tabel') && (
        <div id={idPotret('db-tabel')} className="paparan-potret" style={{ width: SECTION_POTRET['db-tabel']!.lebar, background: '#fff', padding: '4px' }}>
          <MasterView data={dbProyek} dark={false} />
        </div>
      )}
      {aktif.includes('qshe-unit-kartu') && (
        <div id={idPotret('qshe-unit-kartu')} className="paparan-potret" style={{ width: SECTION_POTRET['qshe-unit-kartu']!.lebar, background: '#fff', padding: '4px' }}>
          <QshePanel rows={baris} segment="" filters={filters} dark={false} />
        </div>
      )}
    </div>
  );
};

export default React.memo(PaparanCapture);
