import type { Unit } from './types'
import { unitContoh } from './units.sample'

export type { Kategori, StatusUnit, Unit, DokumenUnit } from './types'

/**
 * Satu-satunya pintu masuk data unit untuk seluruh situs.
 * Saat sumber data asli sudah diputuskan (SharePoint List atau Google Drive),
 * ganti isi fungsi ini. Komponen lain tidak perlu berubah.
 */
export async function getUnits(): Promise<Unit[]> {
  return unitContoh
}

/** Penanda untuk banner "data contoh". Ubah jadi false saat memakai data asli. */
export const DATA_ADALAH_CONTOH = true
