import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Building2 } from 'lucide-react';
import type { DataRKAP } from '../types/dashboard';

// Fix Icon Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const MapController = ({ center }: { center: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => {
    const timer = setTimeout(() => { map.invalidateSize(); }, 300);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (center) map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
};

interface GeospatialTabProps {
  filteredData: DataRKAP[];
  formatRupiah: (angka: number) => string;
}

export const GeospatialTab: React.FC<GeospatialTabProps> = ({ filteredData, formatRupiah }) => {
  const mapData = filteredData.filter(d => d.has_koordinat);
  const defaultCenter: [number, number] = [-2.5489, 118.0149]; // Pusat Indonesia
  const [activeMapCenter, setActiveMapCenter] = useState<[number, number] | null>(null);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-280px)] min-h-[500px] animate-in fade-in duration-200">
      
      {/* Sidebar List Lokasi Peta */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-[300px] lg:h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" /> Navigasi Lokasi Proyek
          </h3>
          <p className="text-xs text-slate-500 mt-1">{mapData.length} koordinat ditemukan.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {mapData.map((item, i) => (
            <div 
              key={i} 
              onClick={() => setActiveMapCenter([item.lat, item.lng])}
              className="p-3 border border-slate-100 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group"
            >
              <h4 className="text-sm font-medium text-slate-900 group-hover:text-blue-600 leading-tight mb-1 truncate">{item.project_name}</h4>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1"><Navigation className="w-3 h-3" /> {item.kota}</span>
                <span className={`text-xs font-bold ${item.persentase >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>{item.persentase.toFixed(0)}%</span>
              </div>
            </div>
          ))}
          {mapData.length === 0 && <div className="text-center text-slate-400 py-10 text-xs">Pencarian tidak memiliki data koordinat.</div>}
        </div>
      </div>

      {/* Kontainer Peta */}
      <div className="w-full lg:w-2/3 h-full rounded-xl border border-slate-200 shadow-sm overflow-hidden relative z-0">
        <MapContainer center={defaultCenter} zoom={5} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController center={activeMapCenter} />
          {mapData.map((item, index) => (
            <Marker key={index} position={[item.lat, item.lng]}>
              <Popup>
                <div className="min-w-[180px]">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{item.kota}</p>
                  <h3 className="text-sm font-bold text-slate-900 mb-2 leading-tight">{item.project_name}</h3>
                  <p className="text-[10px] text-slate-500 mb-2 flex items-center gap-1"><Building2 className="w-3 h-3" /> {item.klien}</p>
                  <div className="space-y-1 text-[11px] border-t border-slate-100 pt-2">
                    <div className="flex justify-between"><span className="text-slate-500">Kontrak Master:</span><span className="font-semibold">{formatRupiah(item.nilai_kontrak)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Realisasi (RKAP):</span><span className="font-semibold text-slate-900">{formatRupiah(item.pu_real)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Capaian RKAP:</span><span className="font-semibold text-emerald-600">{item.persentase.toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Progress Fisik:</span><span className="font-semibold text-blue-600">{item.progress_fisik}%</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <style>{`
        .leaflet-container { z-index: 0 !important; font-family: inherit; }
        .leaflet-popup-content-wrapper { border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border: 1px solid #e2e8f0; }
        .leaflet-popup-tip { box-shadow: none; }
      `}</style>
    </div>
  );
};