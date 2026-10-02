import React from 'react';
import { 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, Legend, Line, ComposedChart
} from 'recharts';
import { Target, TrendingUp, Briefcase, Layers } from 'lucide-react';
import type { UnifiedProjectData, MonthlyTrend } from './../../types';

interface Props {
  data: UnifiedProjectData[];
  monthlyTrend: MonthlyTrend[];
}

const formatShortRupiah = (angka: number) => {
  if (angka >= 1e12) return `Rp ${(angka / 1e12).toFixed(2)} T`;
  if (angka >= 1e9) return `Rp ${(angka / 1e9).toFixed(2)} M`;
  if (angka >= 1e6) return `Rp ${(angka / 1e6).toFixed(2)} Jt`;
  return `Rp ${angka.toLocaleString('id-ID')}`;
};

export const DashboardOverview: React.FC<Props> = ({ data, monthlyTrend }) => {
  // Hitung KPI Cepat
  const metrics = {
    count: data.length,
    target: data.reduce((sum, i) => sum + i.pu_rkap, 0),
    real: data.reduce((sum, i) => sum + i.pu_real, 0),
    kontrak: data.reduce((sum, i) => sum + i.nilai_kontrak, 0),
    fisik: data.length > 0 ? data.reduce((sum, i) => sum + i.progress_fisik, 0) / data.length : 0
  };
  const persen = metrics.target > 0 ? (metrics.real / metrics.target) * 100 : 0;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
      {/* 4 Kartu KPI Atas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Target (RKAP)', value: formatShortRupiah(metrics.target), sub: `Dari ${metrics.count} proyek`, icon: Target, isDark: false },
          { title: 'Total Realisasi', value: formatShortRupiah(metrics.real), sub: `${persen.toFixed(1)}% Tercapai`, icon: TrendingUp, isDark: false },
          { title: 'Total Nilai Kontrak', value: formatShortRupiah(metrics.kontrak), sub: 'Master Data', icon: Briefcase, isDark: false },
          { title: 'Rata-rata Progress Fisik', value: `${metrics.fisik.toFixed(1)}%`, sub: 'Penyelesaian Proyek', icon: Layers, isDark: true }
        ].map((kpi, i) => (
          <div key={i} className={`p-6 rounded-xl shadow-sm border relative overflow-hidden transition-all hover:shadow-md ${kpi.isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            {!kpi.isDark && <kpi.icon className="absolute -right-2 -top-2 w-16 h-16 opacity-5 text-slate-900" />}
            <p className={`text-sm font-medium mb-2 ${kpi.isDark ? 'text-slate-400' : 'text-slate-500'}`}>{kpi.title}</p>
            <h3 className="text-2xl font-bold tracking-tight mb-1">{kpi.value}</h3>
            <p className={`text-xs ${kpi.isDark ? 'text-slate-500' : 'text-slate-400'}`}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* TATA LETAK REQUEST ATASAN: Tabel Kiri (1 kolom), Grafik Trend Kanan (2 kolom) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* KIRI: Mini Table Proyek */}
        <div className="xl:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[450px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-900">Daftar Proyek Utama</h3>
            <p className="text-xs text-slate-500">Berdasarkan Kontribusi Target RKAP</p>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-white text-slate-500 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold border-b">Nama Proyek</th>
                  <th className="px-4 py-3 font-semibold border-b text-right">Target</th>
                  <th className="px-4 py-3 font-semibold border-b text-right">Achv.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.slice(0, 50).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 truncate max-w-[150px]" title={row.project_name}>
                      {row.project_name}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatShortRupiah(row.pu_rkap)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${row.persentase_pu >= 85 ? 'text-emerald-600' : row.persentase_pu < 60 ? 'text-red-600' : 'text-amber-600'}`}>
                        {row.persentase_pu.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* KANAN: Grafik Trend Bulanan RKAP */}
        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[450px] flex flex-col">
          <div>
            <h3 className="font-bold text-slate-900">Trend RKAP vs Realisasi (Bulanan)</h3>
            <p className="text-sm text-slate-500 mb-6">Akumulasi seluruh proyek berjalan WKI</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10}/>
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${(v/1e9).toFixed(0)}M`} />
                
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  formatter={(value: any) => formatShortRupiah(Number(value))}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                
                {/* Bar untuk Target */}
                <Bar yAxisId="left" dataKey="target" name="Target RKAP" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={40} />
                {/* Bar/Garis untuk Realisasi */}
                <Bar yAxisId="left" dataKey="realisasi" name="Realisasi" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line yAxisId="left" type="monotone" dataKey="realisasi" name="Trend Realisasi" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};