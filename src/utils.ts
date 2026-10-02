// ─── Currency formatters ───────────────────────────────────
export const fShort = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e12) return `Rp ${sign}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9)  return `Rp ${sign}${(abs / 1e9).toFixed(2)}M`;
  if (abs >= 1e6)  return `Rp ${sign}${(abs / 1e6).toFixed(1)}Jt`;
  return `Rp ${n.toLocaleString('id-ID')}`;
};

export const fFull = (n: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(n);

export const fNum = (n: number): string =>
  new Intl.NumberFormat('id-ID').format(Math.round(n));

// ─── Project ID helpers ────────────────────────────────────
export const isOverheadId = (id: string): boolean => {
  const trimmed = id.trim();
  if (/^\d+$/.test(trimmed)) return false;
  return true;
};

// ─── Status helpers ────────────────────────────────────────
export const extractProgressFromStatus = (statusRaw: string): number | null => {
  if (!statusRaw) return null;
  const s = statusRaw.trim();
  if (/^finished$/i.test(s)) return 100;
  const match = s.match(/(\d+(?:\.\d+)?)\s*%/);
  if (match) return parseFloat(match[1]);
  return null;
};

export const normalizeStatusLabel = (statusRaw: string): string => {
  if (!statusRaw || statusRaw.trim() === '') return 'Belum Dikonfirmasi';
  const s = statusRaw.trim();
  if (/^cari tahu$/i.test(s))   return 'Belum Dikonfirmasi';
  if (/^finished$/i.test(s))    return 'Finished';
  if (/on progress/i.test(s))   return 'On Progress';
  return s;
};

// ─── City / string validators ──────────────────────────────
export const isValidCityText = (raw: any): boolean => {
  if (raw === null || raw === undefined) return false;
  const s = String(raw).trim();
  if (
    s === '' ||
    s.toUpperCase() === '#N/A' ||
    s.startsWith('=') ||
    /^[A-Z]\d+$/i.test(s) ||
    /^cek/i.test(s)
  ) return false;
  return true;
};

export const normalizeCityText = (raw: any): string => {
  if (!isValidCityText(raw)) return '–';
  return String(raw).trim().replace(/^./, c => c.toUpperCase());
};

export const isValidSegment = (raw: any): boolean => {
  if (raw === null || raw === undefined) return false;
  const s = String(raw).trim();
  return s !== '' && s.toUpperCase() !== '#N/A';
};

export const isValidClient = (raw: any): boolean => {
  if (raw === null || raw === undefined) return false;
  const s = String(raw).trim();
  return s !== '' && s.toUpperCase() !== '#N/A';
};

// ─── Sheet "all proyek" helpers ────────────────────────────
// MAPP bisa berupa angka pecahan (0.6789) atau teks '96,84%'
export const parseMappPct = (raw: any): number => {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'number') return raw <= 1.5 ? raw * 100 : raw;
  const s = String(raw).trim().replace('%', '').replace(',', '.');
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  return n <= 1.5 ? n * 100 : n;
};

// Nilai kota di sheet campuran nama provinsi/kota + typo; samakan ke provinsi
const PROVINCE_ALIASES: Record<string, string> = {
  'nad': 'Aceh', 'aceh': 'Aceh',
  'sumut': 'Sumatra Utara', 'sumatra utara': 'Sumatra Utara', 'sumatera utara': 'Sumatra Utara',
  'sumsel': 'Sumatra Selatan', 'sumatra selatan': 'Sumatra Selatan', 'sumatera selatan': 'Sumatra Selatan',
  'riau': 'Riau', 'kepulauan riau': 'Kepulauan Riau',
  'jambi': 'Jambi',
  'banten': 'Banten', 'serang': 'Banten',
  'dki jakarta': 'DKI Jakarta', 'jakarta': 'DKI Jakarta',
  'jawa barat': 'Jawa Barat',
  'jawa tengah': 'Jawa Tengah',
  'di yogyakarta': 'DI Yogyakarta', 'yogyakarta': 'DI Yogyakarta',
  'jawa timur': 'Jawa Timur',
  'kalimantan selatan': 'Kalimantan Selatan',
  'kalimantan timur': 'Kalimantan Timur',
  'sulawesi utara': 'Sulawesi Utara',
  'sulawesi tengah': 'Sulawesi Tengah',
  'sulawesi selatan': 'Sulawesi Selatan',
  'sulawesi tenggara': 'Sulawesi Tenggara',
  'papua': 'Papua',
};

export const normalizeProvinsi = (raw: any): string => {
  if (!isValidCityText(raw)) return '';
  const key = String(raw).trim().toLowerCase().replace(/\s+/g, ' ');
  return PROVINCE_ALIASES[key] ?? String(raw).trim().replace(/\b\w/g, ch => ch.toUpperCase());
};

// ─── Coordinate helpers ────────────────────────────────────
export const parseCoordinate = (
  raw: any,
): { value: number; bermasalah: boolean } => {
  if (raw === null || raw === undefined) return { value: 0, bermasalah: false };
  const s = String(raw).trim();
  if (s === '' || s.toUpperCase() === '#N/A')
    return { value: 0, bermasalah: s.toUpperCase() === '#N/A' };
  const normalized = s.replace(',', '.');
  const num = parseFloat(normalized);
  if (isNaN(num)) return { value: 0, bermasalah: true };
  return { value: num, bermasalah: false };
};

export const validateAndFixLatLng = (
  lat: number, lng: number, latProblem: boolean, lngProblem: boolean,
): { lat: number; lng: number; bermasalah: boolean } => {
  if (lat === 0 && lng === 0)
    return { lat: 0, lng: 0, bermasalah: latProblem || lngProblem };
  const inLatRange = (v: number) => v >= -11 && v <= 6;
  const inLngRange = (v: number) => v >= 95  && v <= 141;
  if (inLatRange(lat) && inLngRange(lng))
    return { lat, lng, bermasalah: latProblem || lngProblem };
  if (inLatRange(lng) && inLngRange(lat))
    return { lat: lng, lng: lat, bermasalah: latProblem || lngProblem };
  return { lat: 0, lng: 0, bermasalah: true };
};
// ─── Data yang dikecualikan dari dashboard ─────────────────
// Proyek Bocimi (ditulis juga "Bochimi") dan seluruh unit segmentasi AMP
// diperlakukan seolah datanya tidak ada: dibuang saat parsing supaya tidak
// ikut ke KPI, grafik, peta, matriks, PPI, QSHE, maupun paparan.
const POLA_DIKECUALIKAN = [/boc+h?imi/i, /\bamp\b/i];

export const isDikecualikan = (...teks: (string | null | undefined)[]): boolean =>
  teks.some(t => !!t && POLA_DIKECUALIKAN.some(p => p.test(t)));
