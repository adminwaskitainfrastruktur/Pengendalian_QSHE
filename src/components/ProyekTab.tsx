import React from 'react';
import type { DataRKAP } from '../types/dashboard';

interface ProyekTabProps {
  filteredData: DataRKAP[];
  totalProyek: number;
  formatRupiah: (angka: number) => string;
}

export const ProyekTab: React.FC<ProyekTabProps> = ({
  filteredData,
  totalProyek,
  formatRupiah
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm overflow-hidden animate-in fade-in duration-200">
      <div className="p-6 border-b border-slate-200 bg-slate-50/50">
        <h3 className="font-semibold leading-none tracking-tight">Daftar Lengkap Laporan</h3>
        <p className="text-sm text-slate-500 mt-1">Detail matriks untuk seluruh {totalProyek} proyek tercatat.</p>
      </div>
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 sticky top-0 text-slate-500 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-medium">Nama Proyek</th>
              <th className="px-6 py-4 font-medium">Periode</th>
              <th className="px-6 py-4 font-medium text-right">Target (RKAP)</th>
              <th className="px-6 py-4 font-medium text-right">Realisasi</th>
              <th className="px-6 py-4 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-3">
                  <div className="font-medium text-slate-900">{row.project_name}</div>
                  <div className="text-xs text-slate-500">ID: {row.id_project}</div>
                </td>
                <td className="px-6 py-3 text-slate-600">{row.periode}</td>
                <td className="px-6 py-3 text-right text-slate-600">{formatRupiah(row.pu_rkap)}</td>
                <td className="px-6 py-3 text-right font-medium text-slate-900">{formatRupiah(row.pu_real)}</td>
                <td className="px-6 py-3 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium border ${row.persentase >= 80 ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                    {row.persentase.toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Tidak ada data yang cocok dengan pencarian.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};