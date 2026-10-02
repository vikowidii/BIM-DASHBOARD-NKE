import React, { useState, useEffect } from 'react';
import { ProjectInfoCard } from './ProjectInfoCard';
import { ProjectInfo, WorkItem, FloorItem, IssueItem, Role } from '../types';
import { 
  Building2, 
  Layers, 
  AlertTriangle, 
  Calendar, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Box, 
  Clock,
  MapPin,
  Compass,
  Briefcase,
  Coins,
  HardHat,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertOctagon,
  Activity,
  ArrowRight,
  X
} from 'lucide-react';

interface ProjectDashboardProps {
  project: ProjectInfo;
  works: WorkItem[];
  floors: FloorItem[];
  issues: IssueItem[];
  sCurve: { plan: number[]; actual: (number | null)[] };
  userRole?: Role;
  onNavigateToTab: (tab: string) => void;
  onSelectIssue?: (issueId: string) => void;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  project,
  works,
  floors,
  issues,
  sCurve,
  userRole,
  onNavigateToTab,
  onSelectIssue
}) => {
  const [isInfoOverlayCollapsed, setIsInfoOverlayCollapsed] = useState(false);
  const [simWeek, setSimWeek] = useState(9);
  const [isPlayingSim, setIsPlayingSim] = useState(false);
  const [infoModalType, setInfoModalType] = useState<'performance' | 'issues' | null>(null);

  // 4D simulation auto play
  useEffect(() => {
    let timer: any = null;
    if (isPlayingSim) {
      timer = setInterval(() => {
        setSimWeek((prev) => (prev >= 12 ? 1 : prev + 1));
      }, 900);
    }
    return () => clearInterval(timer);
  }, [isPlayingSim]);

  const dev = project.actual - project.plan;
  const devStatus = dev >= -5 ? 'ok' : dev >= -15 ? 'warn' : 'bad';

  // Helper for deadline countdown calculation
  const calculateDeadlineInfo = (periodStr: string, projectYear: number, actualProg: number) => {
    const monthMap: Record<string, number> = {
      jan: 0, januari: 0,
      feb: 1, februari: 1,
      mar: 2, maret: 2,
      apr: 3, april: 3,
      mei: 4, may: 4,
      jun: 5, juni: 5,
      jul: 6, juli: 6,
      ags: 7, agustus: 7, aug: 7,
      sep: 8, september: 8,
      okt: 9, oktober: 9, oct: 9,
      nov: 10, november: 10,
      des: 11, desember: 11, dec: 11
    };

    const parts = (periodStr || '').split(/[–—-]/);
    const endPart = (parts.length > 1 ? parts[parts.length - 1] : periodStr || '').trim().toLowerCase();

    const yearMatch = endPart.match(/\b(20\d{2})\b/) || (periodStr || '').match(/\b(20\d{2})\b/);
    let foundMonth = -1;
    for (const [key, idx] of Object.entries(monthMap)) {
      if (endPart.includes(key)) {
        foundMonth = idx;
        break;
      }
    }

    const now = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    let targetDate: Date;
    let targetLabel = '';

    if (yearMatch) {
      const endYear = parseInt(yearMatch[1], 10);
      const m = foundMonth >= 0 ? foundMonth : 11;
      targetDate = new Date(endYear, m + 1, 0, 23, 59, 59);
      targetLabel = `${months[m]} ${endYear}`;
    } else {
      targetDate = new Date(projectYear || 2026, 11, 31, 23, 59, 59);
      targetLabel = `Desember ${projectYear || 2026}`;
    }

    const diffMs = targetDate.getTime() - now.getTime();
    let remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (remainingDays <= 0) {
      remainingDays = Math.max(28, Math.round((100 - actualProg) * 3));
    }

    return {
      remainingDays,
      targetLabel
    };
  };

  const deadlineInfo = calculateDeadlineInfo(project.period, project.year, project.actual);
  const activeIssues = issues ? issues.filter((i) => i.status !== 'Selesai') : [];
  const totalActiveIssues = activeIssues.length > 0 ? activeIssues.length : project.openIssues;

  // Breakdown of active issues by discipline / category
  const issuesByCategory: Record<string, number> = {};
  activeIssues.forEach((item) => {
    const cat = item.category || 'Umum';
    issuesByCategory[cat] = (issuesByCategory[cat] || 0) + 1;
  });

  // Statistical calculations
  const spi = project.plan > 0 ? (project.actual / project.plan).toFixed(2) : '1.00';
  const criticalIssuesCount = issues.filter((i) => i.severity === 'bad' && i.status !== 'Selesai').length;
  const warningIssuesCount = issues.filter((i) => i.severity === 'warn' && i.status !== 'Selesai').length;
  const completedWorksCount = works.filter((w) => w.actual >= 100).length;

  // SVG S-Curve calculation
  const W = 460, H = 160, PAD = 10;
  const planData = sCurve.plan;
  const actualData = sCurve.actual;
  const n = planData.length;

  const getX = (i: number) => PAD + (i * (W - PAD * 2)) / (n - 1);
  const getY = (val: number) => H - PAD - (val / 100) * (H - PAD * 2);

  const makePath = (data: (number | null)[]) => {
    return data
      .map((v, i) => (v === null ? null : `${i === 0 || data[i - 1] === null ? 'M' : 'L'}${getX(i)},${getY(v)}`))
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div className="space-y-5">
      
      {/* 
        ========================================================================
        BARIS 1 (PALING ATAS): INFORMASI PROYEK (TANPA PETA)
        ========================================================================
      */}
      <ProjectInfoCard project={project} />

      {/* 
        ========================================================================
        BARIS 2: SUMMARY CARDS (HIGH-LEVEL PROJECT KPIS)
        1. Total Active Issues
        2. Current Phase Completion Percentage
        3. Remaining Days Until Deadline
        ========================================================================
      */}
      <div className="bg-[#102544] border-2 border-blue-500/40 rounded-2xl p-4 md:p-5 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        {/* Ambient gradient backdrops */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header with Title & Overall Health Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-[#1e3454]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/40">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm font-black uppercase tracking-wider text-white">
                  Ringkasan Kinerja Proyek (Summary Cards)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/50">
                  High-Level KPIs
                </span>
              </div>
              <p className="text-[11px] text-[#9fb0c8]">
                Pantauan cepat kendala aktif, capaian tahap konstruksi, dan sisa batas waktu deadline kontrak
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9fb0c8] hidden sm:inline">Status Kinerja:</span>
            <div className="flex items-center gap-1.5">
              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 ${
                devStatus === 'ok' 
                  ? 'bg-green-500/15 text-green-400 border-green-500/30' 
                  : devStatus === 'warn' 
                  ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' 
                  : 'bg-red-500/15 text-red-400 border-red-500/30'
              }`}>
                {devStatus === 'ok' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Sesuai Jadwal
                  </>
                ) : devStatus === 'warn' ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" /> Perlu Akselerasi
                  </>
                ) : (
                  <>
                    <AlertOctagon className="w-3.5 h-3.5 text-red-400" /> Kritis / Terlambat
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={() => setInfoModalType('performance')}
                title="Informasi Kategori Status Kinerja Proyek"
                className="p-1 rounded-md bg-[#0b1526] hover:bg-[#1e3454] border border-[#1e3454] text-[#9fb0c8] hover:text-white transition-colors cursor-pointer flex items-center justify-center group"
              >
                <Info className="w-3.5 h-3.5 text-yellow-400 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* 3 Prominent Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* KPI 1: TOTAL ACTIVE ISSUES */}
          <div className="bg-gradient-to-br from-[#0c1a30] to-[#122442] border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-4.5 shadow-lg relative overflow-hidden transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Total Active Issues
                    </span>
                    <button
                      type="button"
                      onClick={() => setInfoModalType('issues')}
                      title="Informasi Kategori & Severity Isu"
                      className="text-[#9fb0c8] hover:text-amber-300 transition-colors cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                  <h3 className="text-sm font-semibold text-[#d7e3ec] mt-0.5">
                    Isu &amp; Kendala Lapangan
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shadow-inner">
                  <AlertOctagon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-2.5">
                <span className="text-4xl md:text-5xl font-black text-amber-400 font-mono tracking-tight">
                  {totalActiveIssues}
                </span>
                <span className="text-xs text-[#9fb0c8]">
                  isu aktif perlu tindak lanjut
                </span>
              </div>

              {/* Severity Breakdown Badges & Jump Action */}
              <div className="mt-3.5 pt-3 border-t border-[#1e3454] flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 font-semibold font-mono">
                    {criticalIssuesCount} Kritis/Clash
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold font-mono">
                    {warningIssuesCount} Sedang
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToTab('isu')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                >
                  Detail Isu <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Kategori Isu Aktif (Disiplin/Bidang Pekerjaan) */}
            <div className="mt-3 pt-2.5 border-t border-[#1e3454]/60">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-[#9fb0c8] font-semibold flex items-center gap-1.5 text-[10px] uppercase tracking-wider">
                  <Layers className="w-3 h-3 text-amber-400" /> Kategori Isu:
                </span>
                <button
                  type="button"
                  onClick={() => setInfoModalType('issues')}
                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                >
                  <Info className="w-3 h-3" /> Info Kategori
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(issuesByCategory).length > 0 ? (
                  Object.entries(issuesByCategory).map(([cat, count]) => (
                    <span 
                      key={cat}
                      className="px-2 py-0.5 rounded-md bg-[#0b1526] border border-[#1e3454] text-[#d7e3ec] text-[10px] font-medium flex items-center gap-1.5 hover:border-amber-500/40 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{cat}</span>
                      <b className="text-amber-300 font-mono text-[10px] bg-amber-500/20 px-1 py-0.2 rounded">
                        {count}
                      </b>
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-[#9fb0c8] italic">Tidak ada isu aktif</span>
                )}
              </div>
            </div>
          </div>

          {/* KPI 2: CURRENT PHASE COMPLETION PERCENTAGE */}
          <div className="bg-gradient-to-br from-[#0c1a30] to-[#122442] border border-blue-500/30 hover:border-blue-500/60 rounded-xl p-4.5 shadow-lg relative overflow-hidden transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-blue-400 uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Current Phase Completion
                </span>
                <h3 className="text-sm font-semibold text-[#d7e3ec] mt-0.5 truncate max-w-[210px]" title={project.phase}>
                  Tahap: <b className="text-white">{project.phase}</b>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shadow-inner">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
                {project.actual}%
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                dev >= 0 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {dev >= 0 ? `+${dev}% Cepat` : `${dev}% Terlambat`}
              </span>
            </div>

            {/* Visual Phase Progress Bar */}
            <div className="mt-3.5 pt-3 border-t border-[#1e3454] space-y-1.5">
              <div className="h-2.5 w-full bg-[#0b1526] rounded-full overflow-hidden relative border border-[#1e3454]">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    dev >= 0 ? 'bg-gradient-to-r from-blue-500 to-green-400' : 'bg-gradient-to-r from-blue-600 to-amber-500'
                  }`}
                  style={{ width: `${Math.min(project.actual, 100)}%` }}
                />
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-md z-10"
                  style={{ left: `${Math.min(project.plan, 100)}%` }}
                  title={`Target Rencana: ${project.plan}%`}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#9fb0c8]">
                <span>Realisasi: <b className="text-white">{project.actual}%</b></span>
                <span className="text-yellow-400">Target Rencana: <b>{project.plan}%</b></span>
              </div>
            </div>
          </div>

          {/* KPI 3: REMAINING DAYS UNTIL DEADLINE */}
          <div className="bg-gradient-to-br from-[#0c1a30] to-[#122442] border border-cyan-500/30 hover:border-cyan-500/60 rounded-xl p-4.5 shadow-lg relative overflow-hidden transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Remaining Days to Deadline
                </span>
                <h3 className="text-sm font-semibold text-[#d7e3ec] mt-0.5 truncate max-w-[210px]" title={deadlineInfo.targetLabel}>
                  Deadline: <b className="text-white">{deadlineInfo.targetLabel}</b>
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform shadow-inner">
                <Calendar className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-4xl md:text-5xl font-black text-cyan-300 font-mono tracking-tight">
                {deadlineInfo.remainingDays}
              </span>
              <span className="text-xs text-[#9fb0c8]">
                hari kalender tersisa
              </span>
            </div>

            {/* Contract Period / Time Info */}
            <div className="mt-3.5 pt-3 border-t border-[#1e3454] flex items-center justify-between text-[11px]">
              <span className="text-[#9fb0c8] truncate max-w-[170px]" title={project.period}>
                Masa: <b className="text-white">{project.period}</b>
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold font-mono text-[10px]">
                TA {project.year}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* GRID 2 COLUMNS: VIEWER 3D WITH INFO OVERLAY & S-CURVE / WORK PROGRESS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
        
        {/* PANEL 3D MODEL ACTUAL */}
        <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5 flex flex-col">
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase">
              Actual 3D Model
            </h2>
            <button
              onClick={() => onNavigateToTab('model3d')}
              className="text-xs text-blue-400 hover:underline cursor-pointer"
            >
              Mode Banding Rencana &rarr;
            </button>
          </div>

          <div className="relative flex-1 min-h-[360px] bg-[#0b1526] border border-[#1e3454] rounded-lg overflow-hidden flex items-center justify-center">
            
            {/* Viewer Placeholder Graphic */}
            <div className="text-center p-6 text-[#9fb0c8] space-y-3">
              <Box className="w-16 h-16 mx-auto text-blue-500/40 animate-pulse" />
              <div className="text-sm font-semibold text-white">Viewer Model 3D Aktual</div>
              <p className="text-xs max-w-xs text-[#9fb0c8]">
                Model BIM terpadu (Arsitektur, Struktur, MEP) terhubung dengan progres lapangan {project.actual}%.
              </p>
            </div>

            {/* OVERLAY INFORMASI PROYEK (HANYA DITAMPILKAN UNTUK VIEWER, HILANGKAN UNTUK USER DAN ADMIN) */}
            {userRole === 'viewer' && (
              <div className={`absolute top-3 left-3 w-80 max-w-[calc(100%-24px)] bg-[#0f2444]/95 border border-[#1e3454] rounded-lg shadow-xl overflow-hidden z-20 transition-all ${
                isInfoOverlayCollapsed ? 'max-h-10' : 'max-h-96'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsInfoOverlayCollapsed(!isInfoOverlayCollapsed)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> Informasi Lengkap Proyek
                  </span>
                  <span>{isInfoOverlayCollapsed ? 'Buka ›' : '‹'}</span>
                </button>

                {!isInfoOverlayCollapsed && (
                  <div className="p-3 text-[11.5px] max-h-80 overflow-y-auto space-y-2 text-[#d7e3ec]">
                    <div className="grid grid-cols-5 gap-2 border-b border-white/5 pb-1">
                      <span className="col-span-2 text-[#9fb0c8] font-semibold">Nama Proyek:</span>
                      <span className="col-span-3 font-medium text-white">{project.name}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 border-b border-white/5 pb-1">
                      <span className="col-span-2 text-[#9fb0c8] font-semibold">Pemilik / Klien:</span>
                      <span className="col-span-3">{project.client}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 border-b border-white/5 pb-1">
                      <span className="col-span-2 text-[#9fb0c8] font-semibold">Infrastruktur:</span>
                      <span className="col-span-3">{project.type}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 border-b border-white/5 pb-1">
                      <span className="col-span-2 text-[#9fb0c8] font-semibold">Lokasi:</span>
                      <span className="col-span-3">📍 {project.location}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 border-b border-white/5 pb-1">
                      <span className="col-span-2 text-[#9fb0c8] font-semibold">Koordinat:</span>
                      <span className="col-span-3 font-mono text-[10.5px] text-blue-300">
                        {project.lat.toFixed(5)}, {project.lng.toFixed(5)}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 border-b border-white/5 pb-1">
                      <span className="col-span-2 text-[#9fb0c8] font-semibold">Kontraktor:</span>
                      <span className="col-span-3">{project.contractor}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 border-b border-white/5 pb-1">
                      <span className="col-span-2 text-[#9fb0c8] font-semibold">Sumber Dana:</span>
                      <span className="col-span-3">{project.fund}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 border-b border-white/5 pb-1">
                      <span className="col-span-2 text-[#9fb0c8] font-semibold">Tahun Anggaran:</span>
                      <span className="col-span-3">{project.year}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 border-b border-white/5 pb-1">
                      <span className="col-span-2 text-[#9fb0c8] font-semibold">Masa Proyek:</span>
                      <span className="col-span-3">{project.period}</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      <span className="col-span-2 text-[#9fb0c8] font-semibold">Status:</span>
                      <span className="col-span-3 text-green-400 font-semibold">{project.phase} ({project.actual}%)</span>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* PANEL STACK: KURVA S & PROGRESS PEKERJAAN */}
        <div className="space-y-5 flex flex-col">
          
          {/* Kurva S */}
          <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
            <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase mb-3">
              Kurva S — Rencana vs Aktual
            </h2>
            <div className="w-full">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#1e3454" strokeWidth={1} />
                <path d={makePath(planData)} fill="none" stroke="#2e6bf0" strokeWidth={2.5} strokeDasharray="6 4" />
                <path d={makePath(actualData)} fill="none" stroke="#1ea64c" strokeWidth={3} />
              </svg>
              <div className="flex gap-4 text-xs text-[#9fb0c8] mt-2 justify-end">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3.5 h-1 bg-blue-500 rounded"></span> Rencana
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-3.5 h-1 bg-green-500 rounded"></span> Aktual
                </span>
              </div>
            </div>
          </div>

          {/* Progress Pekerjaan Konstruksi */}
          <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5 flex-1">
            <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase mb-3.5">
              Progress Pekerjaan Konstruksi
            </h2>
            <div className="space-y-3">
              {works.map((w) => {
                const workDev = w.actual - w.plan;
                const stClass = workDev >= -5 ? 'bg-green-500' : workDev >= -15 ? 'bg-yellow-500' : 'bg-red-500';
                return (
                  <div key={w.name} className="space-y-1">
                    <div className="flex justify-between text-xs text-[#d7e3ec]">
                      <span className="font-medium">{w.name}</span>
                      <span>
                        {w.actual}% <small className="text-[#9fb0c8]">/ rencana {w.plan}%</small>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#0b1526] rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full ${stClass}`}
                        style={{ width: `${w.actual}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-white opacity-80"
                        style={{ left: `${w.plan}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* GRID 2 COLUMNS: 4D SIMULATION & ISSUE TERBARU */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 4D Simulation */}
        <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5 flex flex-col">
          <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase mb-3">
            4D Simulation
          </h2>
          <div className="flex-1 min-h-[220px] bg-[#0b1526] border border-[#1e3454] rounded-lg flex items-center justify-center text-xs text-[#9fb0c8]">
            <div className="text-center space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-blue-500/50" />
              <div>Simulasi Tahapan Konstruksi — Minggu {simWeek}</div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-3 text-xs text-[#9fb0c8]">
            <button
              type="button"
              onClick={() => setIsPlayingSim(!isPlayingSim)}
              className="p-1.5 rounded border border-[#1e3454] hover:border-blue-500 text-white cursor-pointer"
            >
              {isPlayingSim ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={1}
              max={12}
              value={simWeek}
              onChange={(e) => setSimWeek(Number(e.target.value))}
              className="flex-1 accent-blue-600 cursor-pointer"
            />
            <span className="font-bold text-white font-mono">M-{simWeek}</span>
          </div>
        </div>

        {/* Issue Terbaru */}
        <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase">
              Issue Terbaru
            </h2>
            <button
              onClick={() => onNavigateToTab('isu')}
              className="text-xs text-blue-400 hover:underline cursor-pointer"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          <ul className="space-y-2.5">
            {issues.slice(0, 4).map((i) => {
              const dotClass = i.severity === 'bad' ? 'bg-red-500' : i.severity === 'warn' ? 'bg-yellow-500' : 'bg-green-500';
              return (
                <li
                  key={i.id}
                  onClick={() => {
                    onSelectIssue?.(i.id);
                    onNavigateToTab('isu');
                  }}
                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-xs text-[#d7e3ec]"
                >
                  <span className={`w-2 h-2 rounded-full ${dotClass} mt-1 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{i.title}</p>
                    <p className="text-[11px] text-[#9fb0c8]">{i.location} · {i.source} · {i.status}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

      </div>

      {/* MODAL INFORMASI KATEGORI (STATUS KINERJA ATAU KATEGORI ISU) */}
      {infoModalType && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setInfoModalType(null)}
        >
          <div 
            className="bg-[#102544] border-2 border-blue-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-center justify-between p-4 md:p-5 border-b border-[#1e3454] bg-[#0c1a30]">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg border ${
                  infoModalType === 'performance' 
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' 
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                }`}>
                  {infoModalType === 'performance' ? <Activity className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {infoModalType === 'performance' 
                      ? 'Informasi Kategori Status Kinerja Proyek' 
                      : 'Informasi Kategori Isu & Tingkat Keparahan'}
                  </h3>
                  <p className="text-xs text-[#9fb0c8]">
                    {infoModalType === 'performance'
                      ? 'Pedoman ambang batas deviasi jadwal dan rekomendasi akselerasi'
                      : 'Klasifikasi kendala lapangan, disiplin pekerjaan, dan prioritas penanganan'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInfoModalType(null)}
                className="p-1.5 rounded-lg bg-[#0b1526] hover:bg-[#1e3454] text-[#9fb0c8] hover:text-white transition-colors cursor-pointer border border-[#1e3454]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-4 md:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {infoModalType === 'performance' ? (
                <>
                  {/* Current Status Highlight */}
                  <div className="p-3.5 rounded-xl bg-[#0a1628] border border-[#1e3454] space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9fb0c8]">
                      Status Kinerja Proyek Saat Ini:
                    </span>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold border flex items-center gap-1.5 ${
                          devStatus === 'ok' 
                            ? 'bg-green-500/15 text-green-400 border-green-500/30' 
                            : devStatus === 'warn' 
                            ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30' 
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}>
                          {devStatus === 'ok' ? '🟢 Sesuai Jadwal' : devStatus === 'warn' ? '🟡 Perlu Akselerasi' : '🔴 Kritis / Terlambat'}
                        </span>
                        <span className="font-mono text-white text-xs">
                          Deviasi: <b className={dev >= 0 ? 'text-green-400' : 'text-amber-400'}>{dev >= 0 ? `+${dev}%` : `${dev}%`}</b>
                        </span>
                      </div>
                      <div className="text-right font-mono text-[11px] text-[#9fb0c8]">
                        SPI: <b className="text-white">{spi}</b>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#9fb0c8] leading-relaxed">
                      {devStatus === 'ok'
                        ? 'Proyek berada dalam batas toleransi aman. Pekerjaan fisik lapangan berjalan selaras dengan master schedule rencana.'
                        : devStatus === 'warn'
                        ? 'Proyek berada di kategori "Perlu Akselerasi" karena deviasi aktual berada di rentang toleransi -5% hingga -15%. Disarankan penambahan kapasitas sumber daya (lembur / alat bantu) untuk mengejar ketertinggalan.'
                        : 'Proyek berada di kategori "Kritis / Terlambat" (deviasi lebih buruk dari -15%). Diperlukan revisi kurva S, penyusunan recovery schedule terpadu, dan rapat koordinasi intensif bersama direksi.'}
                    </p>
                  </div>

                  {/* Kategori Standar Kinerja */}
                  <div className="space-y-2.5">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      3 Kategori Penilaian Kinerja Proyek:
                    </h4>

                    {/* Kategori 1: Sesuai Jadwal */}
                    <div className="p-3 rounded-lg bg-[#0b1526] border border-green-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-400" />
                          1. Sesuai Jadwal (On Track)
                        </span>
                        <span className="font-mono text-[10px] text-green-300 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                          Deviasi ≥ -5.0% · SPI ≥ 0.95
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9fb0c8]">
                        Capaian progres riil mendekati atau melampaui kurva S rencana. Risiko keterlambatan rendah, monitoring berkala mingguan tetap dipertahankan.
                      </p>
                    </div>

                    {/* Kategori 2: Perlu Akselerasi */}
                    <div className="p-3 rounded-lg bg-[#0b1526] border border-yellow-500/40 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-yellow-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-yellow-400" />
                          2. Perlu Akselerasi (Warning)
                        </span>
                        <span className="font-mono text-[10px] text-yellow-300 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                          Deviasi -5.0% s/d -15.0% · SPI 0.85–0.94
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9fb0c8]">
                        Terjadi perlambatan pekerjaan pada paket pekerjaan utama. Tindakan perbaikan: penambahan shift kerja, percepatan pengadaan material, dan koordinasi hambatan lapangan.
                      </p>
                    </div>

                    {/* Kategori 3: Kritis / Terlambat */}
                    <div className="p-3 rounded-lg bg-[#0b1526] border border-red-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          3. Kritis / Terlambat (Critical)
                        </span>
                        <span className="font-mono text-[10px] text-red-300 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                          Deviasi &lt; -15.0% · SPI &lt; 0.85
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9fb0c8]">
                        Keterlambatan berat berisiko denda kontrak (liquidated damages). Wajib dilakukan rapat koordinasi tingkat manajemen, analisis lintasan kritis (CPM), dan penerbitan rencana pemulihan jadwal (catch-up plan).
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Active Categories Summary */}
                  <div className="p-3.5 rounded-xl bg-[#0a1628] border border-[#1e3454] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9fb0c8]">
                        Distribusi Isu Aktif ({totalActiveIssues} Isu):
                      </span>
                      <span className="text-amber-400 font-mono font-bold text-xs">
                        {criticalIssuesCount} Kritis · {warningIssuesCount} Sedang
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(issuesByCategory).map(([cat, count]) => (
                        <div key={cat} className="p-2 rounded-lg bg-[#0c1a30] border border-[#1e3454] flex items-center justify-between">
                          <span className="text-[#d7e3ec] font-medium truncate">{cat}</span>
                          <span className="text-amber-400 font-bold font-mono px-1.5 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-[11px]">
                            {count} isu
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kategori Tingkat Keparahan (Severity) */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                      Kategori Tingkat Keparahan (Severity):
                    </h4>
                    
                    <div className="p-3 rounded-lg bg-[#0b1526] border border-red-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-400">🔴 Kritis / Clash (Bad)</span>
                        <span className="text-[10px] text-red-300 font-mono">Prioritas Utama (1-2 Hari)</span>
                      </div>
                      <p className="text-[11px] text-[#9fb0c8]">
                        Masalah benturan elemen fisik (Navisworks clash detection), ketidaksesuaian struktur bertulang, atau potensi bahaya K3 yang harus diselesaikan sebelum tahapan konstruksi berlanjut.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0b1526] border border-amber-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">🟡 Sedang / Warning (Warn)</span>
                        <span className="text-[10px] text-amber-300 font-mono">Tindak Lanjut (3-7 Hari)</span>
                      </div>
                      <p className="text-[11px] text-[#9fb0c8]">
                        Penyimpangan toleransi dimensi, ketidaksesuaian arsitektural/fasad, atau revisi shop drawing yang membutuhkan koordinasi teknis tim pelaksana di lapangan.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0b1526] border border-green-500/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-400">🟢 Rendah / Minor (OK)</span>
                        <span className="text-[10px] text-green-300 font-mono">Catatan Teknis Biasa</span>
                      </div>
                      <p className="text-[11px] text-[#9fb0c8]">
                        Klarifikasi administrasi teknis, catatan pembersihan area, atau verifikasi dokumentasi as-built tanpa dampak risiko pada jadwal maupun kekuatan struktur.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer Modal */}
            <div className="p-4 border-t border-[#1e3454] bg-[#0c1a30] flex items-center justify-between">
              <span className="text-[11px] text-[#9fb0c8]">
                {infoModalType === 'performance' 
                  ? 'Berdasarkan Standar Pengendalian Proyek & Kurva S' 
                  : 'Berdasarkan Koordinasi BCF & BIM Clash Detection'}
              </span>
              <button
                type="button"
                onClick={() => setInfoModalType(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer transition-colors shadow"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
