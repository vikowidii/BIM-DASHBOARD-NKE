import React, { useState } from 'react';
import { WorkItem } from '../types';
import { Calendar, Play, Pause } from 'lucide-react';

interface ProjectProgressProps {
  works: WorkItem[];
  sCurve: { plan: number[]; actual: (number | null)[] };
}

export const ProjectProgress: React.FC<ProjectProgressProps> = ({ works, sCurve }) => {
  const [week, setWeek] = useState(9);
  const [isPlaying, setIsPlaying] = useState(false);

  // SVG S-Curve
  const W = 480, H = 160, PAD = 10;
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

  const N = 12;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 4D Simulation */}
        <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5 flex flex-col">
          <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase mb-3">
            4D Simulation — Timeline Tahapan Pekerjaan
          </h2>
          <div className="flex-1 min-h-[240px] bg-[#0b1526] border border-[#1e3454] rounded-lg flex items-center justify-center text-xs text-[#9fb0c8]">
            <div className="text-center space-y-2">
              <Calendar className="w-10 h-10 mx-auto text-blue-500/50" />
              <div>Simulasi Tahapan Konstruksi — Minggu {week} (M-{week})</div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3 text-xs text-[#9fb0c8]">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded border border-[#1e3454] hover:border-blue-500 text-white cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={1}
              max={12}
              value={week}
              onChange={(e) => setWeek(Number(e.target.value))}
              className="flex-1 accent-blue-600 cursor-pointer"
            />
            <span className="font-bold text-white font-mono">M-{week}</span>
          </div>
        </div>

        {/* Kurva S */}
        <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase mb-3">
              Kurva S — Rencana vs Aktual
            </h2>
            <div className="w-full">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
                <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#1e3454" strokeWidth={1} />
                <path d={makePath(planData)} fill="none" stroke="#2e6bf0" strokeWidth={2.5} strokeDasharray="6 4" />
                <path d={makePath(actualData)} fill="none" stroke="#1ea64c" strokeWidth={3} />
                <line x1={getX(week)} y1={PAD} x2={getX(week)} y2={H - PAD} stroke="#ffb81c" strokeWidth={2} />
              </svg>
            </div>
          </div>
          <div className="flex gap-4 text-xs text-[#9fb0c8] mt-2 justify-end">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-1 bg-blue-500 rounded"></span> Rencana
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3.5 h-1 bg-green-500 rounded"></span> Aktual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-3 bg-yellow-400 rounded"></span> Minggu Terpilih (M-{week})
            </span>
          </div>
        </div>
      </div>

      {/* GANTT CHART */}
      <div className="bg-[#102544] border border-[#1e3454] rounded-lg p-5">
        <h2 className="text-xs font-bold tracking-wider text-blue-400 uppercase mb-4">
          Progress Pekerjaan Konstruksi — Gantt Chart (12 Minggu)
        </h2>

        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header Timeline */}
            <div className="flex items-center border-b border-[#1e3454] pb-2 text-[11px] text-[#9fb0c8] font-mono">
              <div className="w-48 shrink-0 font-sans font-semibold text-white">Item Pekerjaan</div>
              <div className="flex-1 grid grid-cols-12 text-center">
                {Array.from({ length: N }, (_, i) => (
                  <span key={i} className={i + 1 === week ? 'text-yellow-400 font-bold' : ''}>
                    M-{i + 1}
                  </span>
                ))}
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-[#1e3454]/50">
              {works.map((w) => {
                const left = ((w.start - 1) / N) * 100;
                const width = ((w.end - w.start + 1) / N) * 100;
                const dev = w.actual - w.plan;
                const fillClass = dev >= -5 ? 'bg-green-600' : dev >= -15 ? 'bg-yellow-600' : 'bg-red-600';

                return (
                  <div key={w.name} className="flex items-center py-3">
                    <div className="w-48 shrink-0 text-xs font-medium text-white truncate pr-2">
                      {w.name}
                    </div>
                    <div className="flex-1 relative h-7 bg-[#0b1526]/50 rounded border border-[#1e3454]/40">
                      {/* Plan duration bar */}
                      <div
                        style={{ left: `${left}%`, width: `${width}%` }}
                        className="absolute top-1 bottom-1 bg-blue-600/30 border border-blue-500 rounded overflow-hidden flex items-center justify-end px-2"
                      >
                        {/* Actual progress inside bar */}
                        <div
                          style={{ width: `${w.actual}%` }}
                          className={`absolute top-0 bottom-0 left-0 ${fillClass} opacity-85`}
                        />
                        <span className="relative z-10 text-[10px] font-bold text-white font-mono shadow-xs">
                          {w.actual}%
                        </span>
                      </div>

                      {/* Current week indicator line */}
                      <div
                        style={{ left: `${(week / N) * 100}%` }}
                        className="absolute top-0 bottom-0 w-0.5 bg-yellow-400 z-20 pointer-events-none"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
