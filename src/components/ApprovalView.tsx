import React from 'react';
import { Submission, ProjectInfo, ChangeRequest } from '../types';
import { Check, X, CheckCircle2, Clock, FileText } from 'lucide-react';

interface ApprovalViewProps {
  submissions: Submission[];
  projects: ProjectInfo[];
  changeRequests: ChangeRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string, note?: string) => void;
  onApproveProject: (id: string) => void;
  onRejectProject: (id: string, note?: string) => void;
  onApproveChange: (id: string) => void;
  onRejectChange: (id: string, note?: string) => void;
}

export const ApprovalView: React.FC<ApprovalViewProps> = ({
  submissions,
  projects,
  changeRequests,
  onApprove,
  onReject,
  onApproveProject,
  onRejectProject,
  onApproveChange,
  onRejectChange
}) => {
  const pendingProjects = projects.filter((p) => p.statusApproval === 'Menunggu');
  const pendingChanges = changeRequests.filter((c) => c.status === 'Menunggu');
  const pending = submissions.filter((s) => s.status === 'Menunggu');
  const history = submissions.filter((s) => s.status !== 'Menunggu');

  const getProjName = (id: string) => {
    return projects.find((p) => p.id === id)?.name || id;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      
      {/* PROYEK BARU MENUNGGU PERSETUJUAN */}
      <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 border-b border-[#1e3454] pb-3">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-orange-400 uppercase">
              Proyek Baru Menunggu Persetujuan ({pendingProjects.length})
            </h2>
            <p className="text-xs text-[#9fb0c8]">
              Proyek yang didaftarkan User baru tampil untuk Viewer setelah disetujui
            </p>
          </div>
        </div>
        <div className="space-y-3 divide-y divide-[#1e3454]/60">
          {pendingProjects.length === 0 ? (
            <p className="text-xs text-[#9fb0c8] py-6 text-center">Tidak ada proyek yang menunggu persetujuan.</p>
          ) : (
            pendingProjects.map((p) => (
              <div key={p.id} className="pt-3 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#d7e3ec]">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <h3 className="font-bold text-white text-xs">{p.name}</h3>
                  </div>
                  <div className="text-[11px] text-[#9fb0c8] mt-1 space-y-0.5">
                    <p><b>Jenis:</b> {p.type} · <b>Tahun:</b> {p.year} · <b>Periode:</b> {p.period}</p>
                    <p><b>Lokasi:</b> {p.location} ({p.lat.toFixed(5)}, {p.lng.toFixed(5)})</p>
                    <p><b>Klien:</b> {p.client} · <b>Kontraktor:</b> {p.contractor} · <b>Dana:</b> {p.fund}</p>
                    <p><b>Diajukan oleh:</b> {p.createdBy || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onApproveProject(p.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Setujui Proyek
                  </button>
                  <button
                    type="button"
                    onClick={() => onRejectProject(p.id, prompt('Alasan penolakan (opsional):') || undefined)}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Tolak
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* PERUBAHAN PROFIL / AKUN MENUNGGU PERSETUJUAN */}
      <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 border-b border-[#1e3454] pb-3">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-orange-400 uppercase">
              Perubahan Profil &amp; Akun ({pendingChanges.length})
            </h2>
            <p className="text-xs text-[#9fb0c8]">Perubahan data oleh User baru berlaku setelah disetujui Admin</p>
          </div>
        </div>
        <div className="space-y-3 divide-y divide-[#1e3454]/60">
          {pendingChanges.length === 0 ? (
            <p className="text-xs text-[#9fb0c8] py-6 text-center">Tidak ada perubahan yang menunggu persetujuan.</p>
          ) : (
            pendingChanges.map((c) => (
              <div key={c.id} className="pt-3 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#d7e3ec]">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <h3 className="font-bold text-white text-xs">
                      {c.kind === 'profile' ? 'Ubah Profil' : 'Ubah Pengaturan Akun'} · {c.userName}
                    </h3>
                  </div>
                  <div className="text-[11px] text-[#9fb0c8] mt-1 space-y-0.5">
                    {c.kind === 'profile' ? (
                      <>
                        <p><b>Nama:</b> {c.payload.name}</p>
                        <p><b>Jabatan:</b> {c.payload.title} · <b>Posisi:</b> {c.payload.pos}</p>
                      </>
                    ) : (
                      <>
                        {c.payload.email && <p><b>Email baru:</b> {c.payload.email}</p>}
                        {c.payload.pw && <p><b>Password:</b> diganti (tidak ditampilkan)</p>}
                      </>
                    )}
                    <p><b>Diajukan:</b> {c.at}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onApproveChange(c.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => onRejectChange(c.id, prompt('Alasan penolakan (opsional):') || undefined)}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Tolak
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MENUNGGU PERSETUJUAN */}
      <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 border-b border-[#1e3454] pb-3">
          <div>
            <h2 className="text-sm font-bold tracking-wider text-orange-400 uppercase">
              Menunggu Persetujuan Data ({pending.length})
            </h2>
            <p className="text-xs text-[#9fb0c8]">
              Berkas yang diunggah staf proyek yang memerlukan verifikasi Admin BIM
            </p>
          </div>
          {pending.length > 0 && (
            <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full font-semibold">
              Perlu Tindakan
            </span>
          )}
        </div>

        <div className="space-y-3 divide-y divide-[#1e3454]/60">
          {pending.length === 0 ? (
            <p className="text-xs text-[#9fb0c8] py-8 text-center">
              Semua berkas telah diverifikasi. Tidak ada data yang menunggu persetujuan.
            </p>
          ) : (
            pending.map((sub) => (
              <div key={sub.id} className="pt-3 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#d7e3ec]">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                    <h3 className="font-bold text-white text-xs">{sub.title}</h3>
                  </div>
                  <div className="text-[11px] text-[#9fb0c8] mt-1 space-y-0.5">
                    <p><b>Proyek:</b> {getProjName(sub.project)}</p>
                    <p><b>Kategori:</b> {sub.cat} · <b>File:</b> {sub.file} ({formatSize(sub.size)})</p>
                    <p><b>Diupload oleh:</b> {sub.by} pada {sub.at}</p>
                    {sub.per && <p><b>Periode:</b> {sub.per}</p>}
                    {sub.ver && <p><b>Versi:</b> {sub.ver}</p>}
                    {sub.loc && <p><b>Lokasi:</b> {sub.loc}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onApprove(sub.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Setujui Data
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const note = prompt('Alasan penolakan (opsional):') || undefined;
                      onReject(sub.id, note);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Tolak
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIWAYAT KEPUTUSAN */}
      <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
        <h2 className="text-sm font-bold tracking-wider text-blue-400 uppercase mb-4 border-b border-[#1e3454] pb-3">
          Riwayat Keputusan Admin ({history.length})
        </h2>

        <div className="space-y-3 max-h-[400px] overflow-y-auto divide-y divide-[#1e3454]/60">
          {history.length === 0 ? (
            <p className="text-xs text-[#9fb0c8] py-8 text-center">Belum ada riwayat persetujuan data.</p>
          ) : (
            history.map((sub) => (
              <div key={sub.id} className="pt-3 pb-2 flex items-start justify-between gap-3 text-xs text-[#d7e3ec]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${sub.status === 'Disetujui' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <h3 className="font-bold text-white text-xs">{sub.title}</h3>
                  </div>
                  <div className="text-[11px] text-[#9fb0c8] mt-1">
                    {getProjName(sub.project)} · {sub.cat} · {sub.file} ({formatSize(sub.size)})
                  </div>
                  <div className="text-[11px] mt-1 flex flex-wrap gap-x-2 text-[#9fb0c8]">
                    <span className={sub.status === 'Disetujui' ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                      ● {sub.status}
                    </span>
                    <span>oleh {sub.decidedBy || 'Admin'}</span>
                    {sub.note && <span>· Alasan: {sub.note}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
