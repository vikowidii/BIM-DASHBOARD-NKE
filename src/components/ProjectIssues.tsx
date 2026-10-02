import React, { useState } from 'react';
import { FloorItem, IssueItem } from '../types';
import { AlertTriangle, Filter, Search, PlusCircle, CheckCircle, Clock } from 'lucide-react';

interface ProjectIssuesProps {
  floors: FloorItem[];
  issues: IssueItem[];
  selectedIssueId?: string;
  onSelectIssue?: (issueId: string) => void;
}

export const ProjectIssues: React.FC<ProjectIssuesProps> = ({
  floors,
  issues,
  selectedIssueId,
  onSelectIssue
}) => {
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSource, setFilterSource] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIssueId, setActiveIssueId] = useState<string>(selectedIssueId || issues[0]?.id || '');
  const [toastMsg, setToastMsg] = useState('');

  const activeIssue = issues.find((i) => i.id === activeIssueId);

  const filteredIssues = issues.filter((i) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || (i.title + ' ' + i.location + ' ' + i.category + ' ' + i.pic).toLowerCase().includes(q);
    const matchStatus = !filterStatus || i.status === filterStatus;
    const matchSource = !filterSource || i.source.toLowerCase().includes(filterSource.toLowerCase());
    return matchQuery && matchStatus && matchSource;
  });

  const getStatusColor = (sev: string) => {
    if (sev === 'bad') return 'bg-red-500';
    if (sev === 'warn') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleAddFollowUp = () => {
    setToastMsg('Fitur pencatatan tindak lanjut lapangan dibuka. Laporan Anda berhasil dicatat.');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-5">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 right-6 z-50 bg-blue-600 text-white text-xs px-4 py-3 rounded-lg shadow-xl border border-blue-400 animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* FILTER BAR */}
      <div className="flex flex-wrap gap-3 items-center bg-[#102544] p-3 rounded-lg border border-[#1e3454]">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Semua Status</option>
          <option value="Belum ditindaklanjuti">Belum ditindaklanjuti</option>
          <option value="Ditindaklanjuti">Ditindaklanjuti</option>
          <option value="Selesai">Selesai</option>
        </select>

        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Semua Sumber</option>
          <option value="Manual">Manual (QC Lapangan)</option>
          <option value="Clash">Clash Detection (Navisworks)</option>
        </select>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9fb0c8]" />
          <input
            type="text"
            placeholder="Cari issue, clash, elemen, lokasi, atau PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* GRID 2 COLUMNS: MODEL FLOOR STACK WITH PINS & DETAIL CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* FLOOR STACK WITH PINS */}
        <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
          <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase mb-4">
            Lokasi Issue Pada Elemen Lantai Model
          </h2>
          
          <div className="flex flex-col-reverse gap-3">
            {floors.map((f, floorIdx) => {
              const floorPins = issues.filter((i) => i.pin.floorIndex === floorIdx);
              const barClass = f.status === 'ok' ? 'bg-green-600' : f.status === 'warn' ? 'bg-yellow-600' : 'bg-red-600';

              return (
                <div key={f.name} className="flex items-center gap-3">
                  <span className="w-10 text-xs text-[#9fb0c8] font-semibold">{f.name}</span>
                  <div className="flex-1 h-9 bg-[#0b1526] rounded-lg relative overflow-hidden flex items-center border border-[#1e3454]/60">
                    <div
                      className={`h-full opacity-40 ${barClass}`}
                      style={{ width: `${Math.max(f.value, 15)}%` }}
                    />
                    <span className="absolute right-3 text-[11px] font-bold text-[#9fb0c8]">
                      {f.value}%
                    </span>

                    {/* Interactive Issue Pins */}
                    {floorPins.map((i) => {
                      const leftPct = 15 + i.pin.zoneIndex * 35;
                      const isSelected = i.id === activeIssueId;
                      return (
                        <button
                          key={i.id}
                          type="button"
                          onClick={() => {
                            setActiveIssueId(i.id);
                            onSelectIssue?.(i.id);
                          }}
                          style={{ left: `${leftPct}%` }}
                          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all cursor-pointer ${
                            getStatusColor(i.severity)
                          } ${isSelected ? 'scale-125 ring-2 ring-yellow-400 z-10' : 'hover:scale-110'}`}
                          title={`${i.id}: ${i.title}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-[#9fb0c8] mt-4">
            💡 Klik pada pin warna di atas untuk menampilkan rincian issue, PIC, dan status tindak lanjut.
          </p>
        </div>

        {/* ISSUE DETAIL CARD */}
        <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5 flex flex-col justify-between border-l-4 border-l-orange-500">
          {activeIssue ? (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold text-orange-400 tracking-wider">
                  {activeIssue.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {activeIssue.title}
                </h3>
              </div>

              <div className="space-y-2.5 text-xs text-[#d7e3ec] border-t border-b border-[#1e3454] py-3">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[#9fb0c8]">Lokasi:</span>
                  <span className="col-span-2 font-medium">{activeIssue.location}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[#9fb0c8]">Sumber:</span>
                  <span className="col-span-2 font-medium">{activeIssue.source}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[#9fb0c8]">Kategori:</span>
                  <span className="col-span-2 font-medium">{activeIssue.category}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[#9fb0c8]">Status:</span>
                  <span className="col-span-2 font-semibold text-yellow-400">{activeIssue.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[#9fb0c8]">PIC:</span>
                  <span className="col-span-2 font-medium">{activeIssue.pic}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-[#9fb0c8]">Tenggat Waktu:</span>
                  <span className="col-span-2 font-medium text-red-400">{activeIssue.due}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddFollowUp}
                className="w-full py-2.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> + Tambah Tindak Lanjut Lapangan
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-[#9fb0c8]">
              <AlertTriangle className="w-10 h-10 text-yellow-400/50 mb-2" />
              <span>Pilih salah satu issue dari daftar atau klik penanda pada model lantai.</span>
            </div>
          )}
        </div>

      </div>

      {/* FULL ISSUE LIST */}
      <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
        <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase mb-4">
          Daftar Lengkap Issue Proyek ({filteredIssues.length})
        </h2>

        <div className="space-y-2 divide-y divide-[#1e3454]/60">
          {filteredIssues.map((i) => {
            const isSelected = i.id === activeIssueId;
            return (
              <div
                key={i.id}
                onClick={() => {
                  setActiveIssueId(i.id);
                  onSelectIssue?.(i.id);
                }}
                className={`pt-3 pb-2 px-3 rounded-lg flex items-start gap-3 transition-colors cursor-pointer ${
                  isSelected ? 'bg-[#132c52]' : 'hover:bg-white/5'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(i.severity)} mt-1 shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-white truncate">{i.title}</p>
                    <span className="text-[11px] text-orange-400 font-mono font-semibold">{i.id}</span>
                  </div>
                  <div className="text-[11px] text-[#9fb0c8] mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span>📍 {i.location}</span>
                    <span>·</span>
                    <span>{i.category}</span>
                    <span>·</span>
                    <span>PIC: {i.pic}</span>
                    <span>·</span>
                    <span className="text-yellow-400">{i.status}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
