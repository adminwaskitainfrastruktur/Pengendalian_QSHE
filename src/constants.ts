import type { Filters } from './types';

export const CURRENCY_SCALE = 1_000_000;

export const PIE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316',
];

export const MONTH_LABELS: Record<number, string> = {
  1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec',
};

// Titik tengah provinsi untuk peta persebaran (sheet hanya menyimpan nama provinsi)
export const PROVINCE_GEO: Record<string, { lat: number; lng: number }> = {
  'Aceh':               { lat:  4.695, lng:  96.749 },
  'Sumatra Utara':      { lat:  2.190, lng:  99.381 },
  'Riau':               { lat:  0.293, lng: 101.706 },
  'Kepulauan Riau':     { lat:  0.917, lng: 104.446 },
  'Jambi':              { lat: -1.610, lng: 103.613 },
  'Sumatra Selatan':    { lat: -3.319, lng: 104.914 },
  'Banten':             { lat: -6.445, lng: 106.137 },
  'DKI Jakarta':        { lat: -6.208, lng: 106.845 },
  'Jawa Barat':         { lat: -6.889, lng: 107.640 },
  'Jawa Tengah':        { lat: -7.150, lng: 110.140 },
  'DI Yogyakarta':      { lat: -7.875, lng: 110.426 },
  'Jawa Timur':         { lat: -7.536, lng: 112.238 },
  'Kalimantan Selatan': { lat: -3.093, lng: 115.283 },
  'Kalimantan Timur':   { lat:  0.539, lng: 116.419 },
  'Sulawesi Utara':     { lat:  1.493, lng: 124.841 },
  'Sulawesi Tengah':    { lat: -1.430, lng: 121.446 },
  'Sulawesi Selatan':   { lat: -3.669, lng: 119.974 },
  'Sulawesi Tenggara':  { lat: -4.145, lng: 122.175 },
  'Papua':              { lat: -4.269, lng: 138.080 },
};

export const DEFAULT_FILTERS: Filters = {
  tahun: null,
  bulan: 12,
  segmentasi: null,
};

export const THEME = {
  light: {
    bg: '#f8fafc', bgMuted: '#f1f5f9', bgSubtle: '#fafbfc',
    border: '#e2e8f0', borderStrong: '#cbd5e1',
    text: '#0f172a', textMuted: '#64748b', textSubtle: '#94a3b8',
    card: '#ffffff', sidebar: '#ffffff',
    chartBlue: '#3b82f6', chartArea: '#60a5fa', chartBar: '#e2e8f0',
    sehat:     { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', dot: '#22c55e' },
    perhatian: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', dot: '#f59e0b' },
    kritis:    { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', dot: '#ef4444' },
    scrollThumb: '#cbd5e1', scrollThumbHover: '#94a3b8',
    rowHoverBg: '#f8fafc',
    btnHoverOverlay: 'rgba(0,0,0,0.03)',
    cardHoverShadow: '0 18px 40px rgba(0,0,0,0.10), 0 6px 16px rgba(0,0,0,0.05)',
    cardHoverBorder: '#93c5fd',
    cardAccentLine: 'linear-gradient(90deg, #3b82f6, #6366f1, transparent)',
    popupBorder: '#e2e8f0',
    kpiGradient: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    sidebarActiveBg: '#eff6ff',
    sidebarActiveText: '#3b82f6',
  },
  dark: {
    bg: '#0b1120', bgMuted: '#1a2332', bgSubtle: '#0f1729',
    border: '#1e2d42', borderStrong: '#2d3f56',
    text: '#f1f5f9', textMuted: '#94a3b8', textSubtle: '#475569',
    card: '#111827', sidebar: '#0d1520',
    chartBlue: '#60a5fa', chartArea: '#93c5fd', chartBar: '#1e2d42',
    sehat:     { bg: 'rgba(22,163,74,0.15)',  text: '#4ade80', border: 'rgba(74,222,128,0.3)',  dot: '#22c55e' },
    perhatian: { bg: 'rgba(217,119,6,0.15)',  text: '#fbbf24', border: 'rgba(251,191,36,0.3)', dot: '#f59e0b' },
    kritis:    { bg: 'rgba(220,38,38,0.15)',  text: '#f87171', border: 'rgba(248,113,113,0.3)', dot: '#ef4444' },
    scrollThumb: '#2d3f56', scrollThumbHover: '#3b5570',
    rowHoverBg: 'rgba(255,255,255,0.02)',
    btnHoverOverlay: 'rgba(255,255,255,0.04)',
    cardHoverShadow: '0 18px 40px rgba(0,0,0,0.45), 0 6px 16px rgba(0,0,0,0.3)',
    cardHoverBorder: '#3b82f6',
    cardAccentLine: 'linear-gradient(90deg, #60a5fa, #818cf8, transparent)',
    popupBorder: '#1e2d42',
    kpiGradient: 'linear-gradient(135deg, #111827 0%, #1a2332 100%)',
    sidebarActiveBg: 'rgba(59,130,246,0.15)',
    sidebarActiveText: '#60a5fa',
  },
};

export type Theme = typeof THEME.light;