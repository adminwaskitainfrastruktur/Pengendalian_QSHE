import React from 'react';
import { Activity, FileSpreadsheet } from 'lucide-react';

interface SummaryCardsProps {
  totalTargetPU: number;
  totalRealPU: number;
  persentaseTotal: string;
  totalProyek: number;
  formatRupiah: (angka: number) => string;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalTargetPU,
  totalRealPU,
  persentaseTotal,
  totalProyek,
  formatRupiah
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm p-6">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="tracking-tight text-sm font-medium">Total Target (RKAP)</h3>
          <span className="text-slate-500 font-serif">$</span>
        </div>
        <div className="text-2xl font-bold">{formatRupiah(totalTargetPU)}</div>
        <p className="text-xs text-slate-500 mt-1">Berdasarkan data tersaring</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm p-6">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="tracking-tight text-sm font-medium">Total Realisasi</h3>
          <Activity className="h-4 w-4 text-slate-500" />
        </div>
        <div className="text-2xl font-bold">{formatRupiah(totalRealPU)}</div>
        <p className="text-xs text-slate-500 mt-1">Pendapatan berjalan</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm p-6">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="tracking-tight text-sm font-medium">Pencapaian</h3>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-slate-500"><rect width="20" height="14" x="2" y="5" rx="2"></rect><path d="M2 10h20"></path></svg>
        </div>
        <div className="text-2xl font-bold">{persentaseTotal}%</div>
        <p className="text-xs text-slate-500 mt-1">Rasio kesuksesan</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm p-6">
        <div className="flex flex-row items-center justify-between pb-2">
          <h3 className="tracking-tight text-sm font-medium">Total Proyek</h3>
          <FileSpreadsheet className="h-4 w-4 text-slate-500" />
        </div>
        <div className="text-2xl font-bold">{totalProyek}</div>
        <p className="text-xs text-slate-500 mt-1">Jumlah proyek ditemukan</p>
      </div>
    </div>
  );
};