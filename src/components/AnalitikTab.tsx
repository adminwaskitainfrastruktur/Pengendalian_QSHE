import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface AnalitikTabProps {
  pieData: any[];
  PIE_COLORS: string[];
  totalProyek: number;
  performaProyek: Record<string, number>;
  persentaseTotal: string;
  CustomTooltip: React.ComponentType<any>;
}

export const AnalitikTab: React.FC<AnalitikTabProps> = ({
  pieData,
  PIE_COLORS,
  totalProyek,
  performaProyek,
  persentaseTotal,
  CustomTooltip
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 animate-in fade-in duration-200">
      <div className="rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
          <PieChartIcon className="w-5 h-5 text-slate-500"/>
          <h3 className="font-semibold leading-none tracking-tight">Distribusi Kinerja</h3>
        </div>
        <div className="h-[300px] w-full flex justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="value">
                {pieData.map((index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-50 shadow-sm p-8 flex flex-col justify-center">
        <h3 className="text-2xl font-bold mb-2">Ringkasan Analitik</h3>
        <p className="text-slate-400 mb-6 leading-relaxed">
          Dari total {totalProyek} proyek yang ditemukan, sebanyak {performaProyek['Sangat Baik (≥100%)'] + performaProyek['Baik (80% - 99%)']} proyek memenuhi standar realisasi.
        </p>
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
          <div className="text-sm font-medium text-slate-400 mb-1">Capaian Agregat Filtered</div>
          <div className="text-4xl font-bold text-white">{persentaseTotal}%</div>
        </div>
      </div>
    </div>
  );
};