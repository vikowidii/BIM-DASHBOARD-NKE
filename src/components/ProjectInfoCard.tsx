import React from 'react';
import { ProjectInfo } from '../types';
import {
  Building2,
  Calendar,
  MapPin,
  Compass,
  Briefcase,
  Coins,
  HardHat
} from 'lucide-react';

interface ProjectInfoCardProps {
  project: ProjectInfo;
}

/**
 * Kartu informasi proyek umum (tipe, tahap, nama, lokasi, koordinat,
 * klien, kontraktor, sumber dana, masa pelaksanaan).
 * Dipakai bersama oleh Dashboard (admin/user) dan tampilan Viewer.
 */
export const ProjectInfoCard: React.FC<ProjectInfoCardProps> = ({ project }) => {
  return (
    <div className="bg-[#102544] border border-[#1e3454] rounded-xl p-5 md:p-6 shadow-xl relative overflow-hidden">
      <div className="flex flex-col space-y-4">
        
        {/* Header Baris 1: Tags & Nama Proyek */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {project.type}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
              Tahap: {project.phase}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 font-mono">
              TA {project.year}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide leading-snug">
            {project.name}
          </h1>

          {/* Titik Lokasi & Koordinat */}
          <div className="mt-2.5 flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs">
            <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{project.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-300 bg-[#0b1526] px-2.5 py-1 rounded border border-[#1e3454] font-mono text-[11px]">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Lat: <b>{project.lat.toFixed(5)}</b></span>
              <span className="text-[#1e3454]">|</span>
              <span>Lng: <b>{project.lng.toFixed(5)}</b></span>
            </div>
          </div>
        </div>

        {/* Grid Detail Metadata Proyek Full-Width */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3.5 border-t border-[#1e3454]/60 text-xs">
          <div className="space-y-0.5">
            <span className="text-[11px] text-[#9fb0c8] flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-blue-400" /> Pemilik / Klien:
            </span>
            <p className="font-semibold text-white truncate" title={project.client}>
              {project.client}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-[#9fb0c8] flex items-center gap-1">
              <HardHat className="w-3 h-3 text-green-400" /> Kontraktor:
            </span>
            <p className="font-semibold text-white truncate" title={project.contractor}>
              {project.contractor}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-[#9fb0c8] flex items-center gap-1">
              <Coins className="w-3 h-3 text-yellow-400" /> Sumber Dana:
            </span>
            <p className="font-semibold text-white">
              {project.fund}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] text-[#9fb0c8] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" /> Masa Pelaksanaan:
            </span>
            <p className="font-semibold text-white truncate" title={project.period}>
              {project.period}
            </p>
          </div>
        </div>

      </div>
    </div>

  );
};
