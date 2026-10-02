import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { DataRKAP } from '../types/dashboard';

interface OverviewTabProps {
  chartData: any[];
  filteredData: DataRKAP[];
  CustomTooltip: React.ComponentType<any>;
  getInitials: (name: string) => string;
  formatRupiah: (angka: number) => string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  chartData,
  filteredData,
  CustomTooltip,
  getInitials,
  formatRupiah
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 animate-in fade-in duration-200">
      <div className="col-span-4 rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
        <div className="p-6 pb-0 flex flex-col space-y-1.5">
          <h3 className="font-semibold leading-none tracking-tight">Overview</h3>
        </div>
        <div className="p-6 pl-2">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${(value / 1000000000).toFixed(0)}M`} dx={-10} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
                <Bar dataKey="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Realisasi" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="col-span-3 rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm">
        <div className="p-6 flex flex-col space-y-1.5 border-b border-slate-100">
          <h3 className="font-semibold leading-none tracking-tight">Performa Proyek</h3>
          <p className="text-sm text-slate-500">Proyek teratas berdasarkan pencarian.</p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {filteredData.slice(0, 6).map((item, index) => {
              const isGood = item.persentase >= 80;
              return (
                <div key={index} className="flex items-center">
                  <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-slate-600">{getInitials(item.project_name)}</span>
                  </span>
                  <div className="ml-4 space-y-1 w-full max-w-[150px] md:max-w-[180px]">
                    <p className="text-sm font-medium leading-none truncate">{item.project_name}</p>
                    <p className="text-xs text-slate-500 truncate">ID: {item.id_project}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <div className="font-medium text-sm">{formatRupiah(item.pu_real)}</div>
                    <div className={`text-xs font-semibold flex items-center justify-end gap-1 ${isGood ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {isGood ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {item.persentase.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredData.length === 0 && <div className="text-sm text-slate-500 text-center py-4">Data tidak ditemukan.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};