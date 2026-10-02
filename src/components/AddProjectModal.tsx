import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { ProjectInfo } from '../types';
import { X, MapPin, Building2, Calendar, FileText, CheckCircle2, Navigation, Layers } from 'lucide-react';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProject: (project: ProjectInfo) => void;
  userName: string;
}

// Quick city presets for convenience across Indonesia & regional projects
const CITY_PRESETS = [
  { name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { name: 'IKN Nusantara', lat: -0.9632, lng: 116.7024 },
  { name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
  { name: 'Semarang', lat: -6.9932, lng: 110.4203 },
  { name: 'Bandung', lat: -6.9175, lng: 107.6191 },
  { name: 'Medan', lat: 3.5952, lng: 98.6722 },
  { name: 'Makassar', lat: -5.1477, lng: 119.4327 },
  { name: 'Bali (Denpasar)', lat: -8.6705, lng: 115.2126 },
  { name: 'Balikpapan', lat: -1.2379, lng: 116.8529 },
  { name: 'Dili (Timor Leste)', lat: -8.5569, lng: 125.5603 }
];

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onAddProject,
  userName
}) => {
  // Form state - Informasi Proyek
  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [type, setType] = useState('Gedung Pemerintahan');
  const [location, setLocation] = useState('Semarang, Jawa Tengah');
  const [contractor, setContractor] = useState('PT Nusa Konstruksi Enjiniring');
  const [fund, setFund] = useState('APBN');
  const [year, setYear] = useState(2026);
  const [period, setPeriod] = useState('Feb 2026 – Des 2026');
  const [plan, setPlan] = useState(25);
  const [actual, setActual] = useState(18);

  // Titik Lokasi Proyek
  const [lat, setLat] = useState<number>(-6.9932);
  const [lng, setLng] = useState<number>(110.4203);
  const [errorMsg, setErrorMsg] = useState('');

  // Map ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize and update Leaflet picker map
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // Clean up previous map if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Custom icon for the project location picker
      const customPin = L.divIcon({
        className: 'custom-picker-pin',
        html: `
          <div style="
            background: #2e6bf0;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            border: 2.5px solid #ffffff;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: #ffb81c;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 12,
        zoomControl: true
      });

      // Add OpenStreetMap base tile
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      // Add draggable marker
      const marker = L.marker([lat, lng], {
        icon: customPin,
        draggable: true
      }).addTo(map);

      marker.bindPopup(`<b>Titik Lokasi Proyek</b><br>${lat.toFixed(5)}, ${lng.toFixed(5)}`).openPopup();

      // Drag event
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        setLat(Number(pos.lat.toFixed(6)));
        setLng(Number(pos.lng.toFixed(6)));
        marker.setPopupContent(`<b>Titik Lokasi Proyek</b><br>${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`).openPopup();
      });

      // Click on map to move pin
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        setLat(Number(clickLat.toFixed(6)));
        setLng(Number(clickLng.toFixed(6)));
        marker.setLatLng([clickLat, clickLng]);
        marker.setPopupContent(`<b>Titik Lokasi Proyek</b><br>${clickLat.toFixed(5)}, ${clickLng.toFixed(5)}`).openPopup();
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Fix render size
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update marker position when manual Lat/Lng or preset changes
  const handleUpdateCoordinates = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      mapInstanceRef.current.setView([newLat, newLng], 12);
      markerRef.current.setPopupContent(`<b>Titik Lokasi Proyek</b><br>${newLat.toFixed(5)}, ${newLng.toFixed(5)}`).openPopup();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama proyek wajib diisi.');
      return;
    }
    if (!client.trim()) {
      setErrorMsg('Pemilik / Klien proyek wajib diisi.');
      return;
    }
    if (!location.trim()) {
      setErrorMsg('Lokasi wilayah / kota wajib diisi.');
      return;
    }

    const newProject: ProjectInfo = {
      id: 'proj-' + Date.now(),
      name: name.trim(),
      location: location.trim(),
      lat: Number(lat),
      lng: Number(lng),
      client: client.trim(),
      phase: 'Konstruksi',
      type,
      year: Number(year),
      contractor: contractor.trim() || 'PT Nusa Konstruksi Enjiniring',
      fund,
      period: period.trim() || 'Jan 2026 – Des 2026',
      actual: Number(actual),
      plan: Number(plan),
      openIssues: 0,
      createdBy: userName,
      statusApproval: 'Menunggu' // diputuskan final di App (Admin langsung aktif, User menunggu persetujuan)
    };

    onAddProject(newProject);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-black/75 p-3 md:p-6 overflow-y-auto backdrop-blur-xs">
      <div className="bg-[#102544] border border-[#1e3454] rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e3454] bg-[#0f2444]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Pendaftaran &amp; Tambah Proyek Baru</h2>
              <p className="text-xs text-[#9fb0c8]">Lengkapi informasi proyek dan titik lokasinya. Proyek dari User baru tampil untuk Viewer setelah disetujui Admin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#1e3454] text-[#9fb0c8] hover:text-white hover:bg-[#1a355a] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400"></span>
              {errorMsg}
            </div>
          )}

          {/* SECTION 1: INFORMASI PROYEK */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#1e3454]">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                1. Informasi Proyek
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1.5">
                  Nama Proyek <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Proyek Pembangunan Gedung Pusat Vokasi Kemnaker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1.5">
                  Pemilik / Klien <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kementerian Ketenagakerjaan RI"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1.5">
                  Jenis Infrastruktur <span className="text-red-400">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Gedung Pemerintahan">Gedung Pemerintahan</option>
                  <option value="Gedung Perkantoran">Gedung Perkantoran</option>
                  <option value="Jembatan">Jembatan</option>
                  <option value="Jalan & Tol">Jalan &amp; Tol</option>
                  <option value="Bendung & Pengairan">Bendung &amp; Pengairan</option>
                  <option value="Fasilitas Kesehatan / RS">Fasilitas Kesehatan / RS</option>
                  <option value="Fasilitas Pendidikan">Fasilitas Pendidikan</option>
                  <option value="Bandara & Pelabuhan">Bandara &amp; Pelabuhan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1.5">
                  Wilayah / Kota / Daerah <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Semarang, Jawa Tengah"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1.5">
                  Kontraktor Pelaksana
                </label>
                <input
                  type="text"
                  value={contractor}
                  onChange={(e) => setContractor(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1.5">
                  Sumber Dana
                </label>
                <select
                  value={fund}
                  onChange={(e) => setFund(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="APBN">APBN</option>
                  <option value="APBD">APBD</option>
                  <option value="Swasta">Swasta</option>
                  <option value="BUMN">BUMN</option>
                  <option value="Hibah">Hibah Luar Negeri</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1.5">
                  Tahun Anggaran
                </label>
                <input
                  type="number"
                  value={year}
                  min={2020}
                  max={2035}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1.5">
                  Masa Pelaksanaan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jan 2026 – Des 2026 (12 Bulan)"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1.5">
                  Progres Rencana Awal (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={plan}
                  onChange={(e) => setPlan(Number(e.target.value))}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1.5">
                  Progres Aktual Awal (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={actual}
                  onChange={(e) => setActual(Number(e.target.value))}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: TITIK LOKASI PROYEK (PETA INTERAKTIF) */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#1e3454]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">
                  2. Titik Lokasi Proyek (Peta &amp; Koordinat)
                </h3>
              </div>
              <span className="text-xs text-[#9fb0c8] flex items-center gap-1">
                <Navigation className="w-3 h-3 text-blue-400" />
                Klik pada peta atau geser pin untuk menentukan titik
              </span>
            </div>

            {/* Quick city center preset chips */}
            <div>
              <span className="text-xs text-[#9fb0c8] block mb-2 font-medium">
                Pilih Kota Acuan Cepat:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {CITY_PRESETS.map((city) => (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => {
                      handleUpdateCoordinates(city.lat, city.lng);
                      setLocation(city.name);
                    }}
                    className="text-xs px-2.5 py-1 rounded-md bg-[#0f2444] hover:bg-blue-600/30 text-gray-300 hover:text-white border border-[#1e3454] hover:border-blue-500/50 transition-colors cursor-pointer"
                  >
                    📍 {city.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Leaflet Picker Map */}
            <div className="relative border border-[#1e3454] rounded-xl overflow-hidden bg-[#0b1526]">
              <div
                ref={mapContainerRef}
                className="w-full h-72 z-10"
                style={{ minHeight: '280px' }}
              />
              <div className="absolute top-3 right-3 z-[400] bg-[#102544]/90 backdrop-blur-xs border border-[#1e3454] text-xs px-3 py-1.5 rounded-lg text-white font-mono shadow-md">
                Lat: <span className="text-blue-400">{lat}</span> | Lng: <span className="text-blue-400">{lng}</span>
              </div>
            </div>

            {/* Manual Lat & Lng Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0f2444]/60 p-4 rounded-xl border border-[#1e3454]">
              <div>
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1">
                  Latitude (Lintang)
                </label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => handleUpdateCoordinates(Number(e.target.value), lng)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9fb0c8] mb-1">
                  Longitude (Bujur)
                </label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => handleUpdateCoordinates(lat, Number(e.target.value))}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
              <p className="sm:col-span-2 text-xs text-[#9fb0c8]">
                💡 Titik koordinat ini akan digunakan untuk menampilkan marker proyek Anda di Peta Portofolio dan ringkasan lokasi BIM.
              </p>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#1e3454] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-[#1e3454] text-sm text-[#9fb0c8] hover:text-white hover:bg-[#1a355a] transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan &amp; Daftarkan Proyek
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
