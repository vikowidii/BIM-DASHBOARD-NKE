import React from 'react';
import { Submission } from '../types';
import { FileText, Download, CheckCircle, Clock } from 'lucide-react';

interface ProjectDocumentsProps {
  documents: Submission[];
}

export const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ documents }) => {
  const approvedDocs = documents.filter((d) => d.status === 'Disetujui');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-[#1e3454] pb-3">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">
            Data &amp; Dokumen Resmi Proyek
          </h2>
          <p className="text-xs text-[#9fb0c8]">
            Seluruh berkas model BIM, gambar kerja, jadwal, dan progres yang telah disetujui Admin
          </p>
        </div>
        <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-semibold">
          {approvedDocs.length} Dokumen Aktif
        </span>
      </div>

      {approvedDocs.length === 0 ? (
        <div className="py-14 text-center text-xs text-[#9fb0c8] space-y-2">
          <FileText className="w-10 h-10 mx-auto text-[#9fb0c8]/40" />
          <p>Belum ada dokumen yang disetujui untuk proyek ini.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#1e3454]/60">
          {approvedDocs.map((doc) => (
            <div key={doc.id} className="py-3 flex items-center justify-between gap-4 text-xs text-[#d7e3ec] hover:bg-white/5 px-2 rounded-lg transition-colors">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-xs truncate">{doc.title}</h3>
                  <div className="text-[11px] text-[#9fb0c8] mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                    <span>{doc.cat}</span>
                    <span>·</span>
                    <span>{doc.file} ({formatSize(doc.size)})</span>
                    <span>·</span>
                    <span>Diupload: {doc.by}</span>
                    <span>·</span>
                    <span>Disetujui: {doc.decidedBy || 'Admin'}</span>
                  </div>
                  {doc.note && (
                    <p className="text-[11px] text-green-400 mt-1">
                      Catatan: {doc.note}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert(`Mengunduh file: ${doc.file}`)}
                className="px-3 py-1.5 rounded bg-[#0b1526] hover:bg-blue-600 border border-[#1e3454] hover:border-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Unduh
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
