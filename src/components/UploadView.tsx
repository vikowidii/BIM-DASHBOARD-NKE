import React, { useState } from 'react';
import { ProjectInfo, Submission } from '../types';
import { DATA_CATEGORIES, PERIODS } from '../data/initialData';
import { UploadCloud, CheckCircle2, Trash2, Clock, AlertCircle } from 'lucide-react';

interface UploadViewProps {
  projects: ProjectInfo[];
  currentProjectId: string;
  userName: string;
  submissions: Submission[];
  onSubmitFile: (sub: Omit<Submission, 'id' | 'at' | 'status'>) => void;
  onDeleteSubmission: (id: string) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  projects,
  currentProjectId,
  userName,
  submissions,
  onSubmitFile,
  onDeleteSubmission
}) => {
  const [selectedCatId, setSelectedCatId] = useState('proyek');
  const [selectedProjId, setSelectedProjId] = useState(currentProjectId || projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [period, setPeriod] = useState(PERIODS[8]);
  const [version, setVersion] = useState('');
  const [location, setLocation] = useState('');
  const [msg, setMsg] = useState<{ type: 'ok' | 'bad'; text: string } | null>(null);

  const selectedCat = DATA_CATEGORIES.find((c) => c.id === selectedCatId) || DATA_CATEGORIES[0];
  const myUploads = submissions.filter((s) => s.by === userName);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      setMsg({ type: 'bad', text: 'Judul dan berkas file wajib diisi.' });
      return;
    }

    const ext = (file.name.match(/\.[^.]+$/) || [''])[0].toLowerCase();
    if (!selectedCat.ext.includes(ext)) {
      setMsg({
        type: 'bad',
        text: `Format file tidak sesuai untuk kategori ini. Gunakan: ${selectedCat.ext.join(', ')}.`
      });
      return;
    }

    onSubmitFile({
      project: selectedProjId,
      cat: selectedCat.name,
      catId: selectedCat.id,
      title: title.trim(),
      file: file.name,
      size: file.size,
      by: userName,
      per: selectedCat.extra.includes('per') ? period : undefined,
      ver: selectedCat.extra.includes('ver') && version.trim() ? version.trim() : undefined,
      loc: selectedCat.extra.includes('loc') && location.trim() ? location.trim() : undefined
    });

    setTitle('');
    setVersion('');
    setLocation('');
    setFile(null);
    setMsg({ type: 'ok', text: 'Data berhasil diunggah. Menunggu verifikasi dan persetujuan Admin.' });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      
      {/* DATA CATALOG GRID */}
      <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase">
            Data Yang Perlu Diunggah Sesuai Modul BIM
          </h2>
          <span className="text-xs text-[#9fb0c8]">Klik kategori untuk mengisi formulir di bawah</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DATA_CATEGORIES.map((c) => {
            const isSelected = c.id === selectedCatId;
            const subs = submissions.filter((s) => s.catId === c.id && s.project === selectedProjId);
            const isApproved = subs.some((s) => s.status === 'Disetujui');
            const isPending = subs.some((s) => s.status === 'Menunggu');

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCatId(c.id)}
                className={`text-left p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-[#132c52] border-blue-500 shadow-md'
                    : 'bg-[#0b1526] border-[#1e3454] hover:border-blue-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#9fb0c8] mb-1">
                    <span>{c.mod}</span>
                    <span className={`px-2 py-0.2 rounded-full font-semibold ${
                      c.req === 'Wajib' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {c.req}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white">{c.name}</h3>
                  <p className="text-[11px] text-[#9fb0c8] mt-1 line-clamp-2">{c.desc}</p>
                </div>

                <div className="text-[11px] font-semibold pt-1 border-t border-[#1e3454]/40 flex items-center justify-between">
                  <span className="text-[#9fb0c8] font-mono text-[10px]">{c.ext.join(' · ')}</span>
                  {isApproved ? (
                    <span className="text-green-400">● Disetujui</span>
                  ) : isPending ? (
                    <span className="text-yellow-400">● Menunggu</span>
                  ) : (
                    <span className="text-[#9fb0c8]">● Belum ada data</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FORM UNGGAH & RIWAYAT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* FORM */}
        <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
          <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase mb-4">
            Unggah Berkas Proyek Baru
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#9fb0c8] mb-1 font-medium">Target Proyek</label>
              <select
                value={selectedProjId}
                onChange={(e) => setSelectedProjId(e.target.value)}
                className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#9fb0c8] mb-1 font-medium">Jenis Kategori Data</label>
              <select
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                {DATA_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-[#9fb0c8] mt-1">{selectedCat.desc} ({selectedCat.ext.join(', ')})</p>
            </div>

            {selectedCat.extra.includes('per') && (
              <div>
                <label className="block text-[#9fb0c8] mb-1 font-medium">Periode Progres</label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  {PERIODS.map((p) => (
                    <option key={p} value={p}>Periode: {p}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedCat.extra.includes('ver') && (
              <div>
                <label className="block text-[#9fb0c8] mb-1 font-medium">Versi / Revisi</label>
                <input
                  type="text"
                  placeholder="Contoh: Rev.02"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {selectedCat.extra.includes('loc') && (
              <div>
                <label className="block text-[#9fb0c8] mb-1 font-medium">Lokasi / Elemen Model</label>
                <input
                  type="text"
                  placeholder="Contoh: Lt 2 · Balok B4-12"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[#9fb0c8] mb-1 font-medium">Judul Berkas</label>
              <input
                type="text"
                placeholder={selectedCat.ph}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[#9fb0c8] mb-1 font-medium">File Dokumen / Model</label>
              <input
                type="file"
                accept={selectedCat.ext.join(',')}
                onChange={handleFileChange}
                className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                required
              />
            </div>

            {msg && (
              <p className={`text-xs ${msg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                {msg.text}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <UploadCloud className="w-4 h-4" /> Kirim Berkas Untuk Persetujuan
            </button>
          </form>
        </div>

        {/* UNGGAHAN SAYA */}
        <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
          <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase mb-4">
            Riwayat Unggahan Saya ({myUploads.length})
          </h2>

          <div className="space-y-3 max-h-[460px] overflow-y-auto divide-y divide-[#1e3454]/60">
            {myUploads.length === 0 ? (
              <p className="text-xs text-[#9fb0c8] py-8 text-center">Belum ada berkas yang Anda unggah.</p>
            ) : (
              myUploads.map((sub) => (
                <div key={sub.id} className="pt-3 pb-2 flex items-start justify-between gap-3 text-xs text-[#d7e3ec]">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-xs truncate">{sub.title}</h3>
                    <div className="text-[11px] text-[#9fb0c8] mt-0.5">
                      {sub.cat} · {sub.file} ({formatSize(sub.size)})
                    </div>
                    <div className="text-[11px] mt-1 flex items-center gap-2">
                      <span className={`font-semibold ${
                        sub.status === 'Disetujui' ? 'text-green-400' : sub.status === 'Menunggu' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        ● {sub.status}
                      </span>
                      {sub.decidedBy && <span>oleh {sub.decidedBy}</span>}
                    </div>
                    {sub.note && (
                      <div className="text-[10px] text-[#9fb0c8] mt-1 bg-white/5 p-1 rounded">
                        Catatan: {sub.note}
                      </div>
                    )}
                  </div>

                  {sub.status === 'Menunggu' && (
                    <button
                      type="button"
                      onClick={() => onDeleteSubmission(sub.id)}
                      className="p-1.5 rounded border border-red-500/40 text-red-400 hover:bg-red-600/20 text-xs transition-colors cursor-pointer shrink-0"
                      title="Batalkan dan Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
