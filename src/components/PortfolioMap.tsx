import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import { ProjectInfo, UserAccount } from '../types';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Layers, 
  Building2, 
  TrendingUp, 
  Box,
  Compass,
  FolderPlus,
  Eye,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface PortfolioMapProps {
  projects: ProjectInfo[];
  currentUser: UserAccount;
  onOpenProject: (projectId: string, targetTab?: string) => void;
  onOpenAddProject: () => void;
}

// Helper: Infrastructure details & SVG icons tailored to project type
export const getInfrastructureDetails = (type: string) => {
  const t = (type || '').toLowerCase();
  
  if (t.includes('jembatan') || t.includes('bridge') || t.includes('viaduct') || t.includes('flyover')) {
    return {
      category: 'Jembatan',
      color: '#0284c7', // Sky blue
      badgeBg: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 19h20"/>
          <path d="M5 19V7"/>
          <path d="M19 19V7"/>
          <path d="M5 10h14"/>
          <path d="M5 7c4 4 7 5 7 5s3-1 7-5"/>
          <path d="M9 10v9"/>
          <path d="M12 12v7"/>
          <path d="M15 10v9"/>
        </svg>
      `
    };
  }

  if (t.includes('jalan') || t.includes('tol') || t.includes('highway') || t.includes('road')) {
    return {
      category: 'Jalan & Tol',
      color: '#f59e0b', // Amber
      badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19L9 5"/>
          <path d="M20 19L15 5"/>
          <line x1="12" y1="6" x2="12" y2="8"/>
          <line x1="12" y1="12" x2="12" y2="14"/>
          <line x1="12" y1="18" x2="12" y2="20"/>
        </svg>
      `
    };
  }

  if (t.includes('bendungan') || t.includes('waduk') || t.includes('air') || t.includes('dam') || t.includes('irigasi')) {
    return {
      category: 'Bendungan & Air',
      color: '#06b6d4', // Cyan
      badgeBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 7h20"/>
          <path d="M4 7l2 11h12l2-11"/>
          <path d="M2 21c3-1 6 1 10 0s7 1 10 0"/>
          <path d="M9 7v11"/>
          <path d="M15 7v11"/>
        </svg>
      `
    };
  }

  if (t.includes('bandara') || t.includes('airport') || t.includes('udara')) {
    return {
      category: 'Bandara',
      color: '#8b5cf6', // Purple
      badgeBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.8-.2-1.6.3-1.8 1.1l-.1.4 5.3 4.2-2.9 2.9-2.3-.5c-.4-.1-.8.1-1 .5l-.3.6 2.7 1.8 1.8 2.7.6-.3c.4-.2.6-.6.5-1l-.5-2.3 2.9-2.9 4.2 5.3.4-.1c.8-.2 1.3-1 1.1-1.8z"/>
        </svg>
      `
    };
  }

  if (t.includes('pelabuhan') || t.includes('port') || t.includes('dermaga') || t.includes('marine')) {
    return {
      category: 'Pelabuhan',
      color: '#3b82f6', // Blue
      badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="5" r="3"/>
          <line x1="12" y1="22" x2="12" y2="8"/>
          <path d="M5 12H2a10 10 0 0 0 20 0h-3"/>
        </svg>
      `
    };
  }

  if (t.includes('ikn') || t.includes('fasilitas') || t.includes('kawasan') || t.includes('terpadu') || t.includes('monumen')) {
    return {
      category: 'Fasilitas Terpadu',
      color: '#10b981', // Emerald
      badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      iconSvg: `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 21h18"/>
          <path d="M5 21V9l7-5 7 5v12"/>
          <path d="M9 13h6"/>
          <path d="M9 17h6"/>
        </svg>
      `
    };
  }

  // Gedung Pemerintahan, Perkantoran, dsb. (Default)
  return {
    category: 'Gedung',
    color: '#2e6bf0', // NKE Corporate Blue
    badgeBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    iconSvg: `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/>
        <path d="M9 22v-4h6v4"/>
        <path d="M8 6h.01"/>
        <path d="M16 6h.01"/>
        <path d="M12 6h.01"/>
        <path d="M12 10h.01"/>
        <path d="M12 14h.01"/>
        <path d="M16 10h.01"/>
        <path d="M16 14h.01"/>
        <path d="M8 10h.01"/>
        <path d="M8 14h.01"/>
      </svg>
    `
  };
};

export const PortfolioMap: React.FC<PortfolioMapProps> = ({
  projects,
  currentUser,
  onOpenProject,
  onOpenAddProject
}) => {
  const isViewer = currentUser.role === 'viewer';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [baseMap, setBaseMap] = useState<'osm' | 'terrain'>('osm');
  const [kpiMode, setKpiMode] = useState<string>('all');

  // Host element living INSIDE Leaflet's map pane (between tiles and markers)
  const [kpiHost, setKpiHost] = useState<HTMLDivElement | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const baseTileRef = useRef<L.TileLayer | null>(null);

  // Status helper (for admin/user)
  const getProjectStatus = (p: ProjectInfo): 'done' | 'ok' | 'warn' | 'bad' => {
    if (p.actual >= 100) return 'done';
    const dev = p.actual - p.plan;
    if (dev >= -5) return 'ok';
    if (dev >= -15) return 'warn';
    return 'bad';
  };

  const statusColors = {
    done: '#2e6bf0', // blue
    ok: '#1ea64c',   // green
    warn: '#ffb81c', // orange
    bad: '#e2705f'   // red
  };

  const statusBgClasses = {
    done: 'bg-blue-600',
    ok: 'bg-[#1ea64c]',
    warn: 'bg-[#ffb81c]',
    bad: 'bg-[#e2705f]'
  };

  const statusTextClasses = {
    done: 'text-blue-400',
    ok: 'text-[#1ea64c]',
    warn: 'text-[#ffb81c]',
    bad: 'text-[#e2705f]'
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery = !q || (p.name + ' ' + p.location + ' ' + p.client + ' ' + p.type).toLowerCase().includes(q);
    const matchType = !filterType || p.type === filterType;
    const matchYear = !filterYear || String(p.year) === filterYear;
    const st = getProjectStatus(p);
    const matchStatus = isViewer || !filterStatus || st === filterStatus;
    return matchQuery && matchType && matchYear && matchStatus;
  });

  // Sort based on KPI (or default)
  const displayProjects = [...filteredProjects].sort((a, b) => {
    if (!isViewer) {
      if (kpiMode === 'progress') return b.actual - a.actual;
      if (kpiMode === 'issues') return b.openIssues - a.openIssues;
      if (kpiMode === 'attention') {
        const isBadA = ['warn', 'bad'].includes(getProjectStatus(a)) ? 1 : 0;
        const isBadB = ['warn', 'bad'].includes(getProjectStatus(b)) ? 1 : 0;
        return isBadB - isBadA;
      }
    } else {
      if (kpiMode === 'gedung') return a.type.localeCompare(b.type);
      if (kpiMode === 'jembatan') return b.type.localeCompare(a.type);
    }
    return 0;
  });

  // Calculate KPIs
  const totalProjects = projects.length;
  const avgProgress = totalProjects > 0 ? Math.round(projects.reduce((acc, p) => acc + p.actual, 0) / totalProjects) : 0;
  const attentionCount = projects.filter((p) => ['warn', 'bad'].includes(getProjectStatus(p))).length;
  const totalOpenIssues = projects.reduce((acc, p) => acc + p.openIssues, 0);

  // Viewer specific counts
  const gedungCount = projects.filter((p) => (p.type || '').toLowerCase().includes('gedung')).length;
  const jembatanCount = projects.filter((p) => (p.type || '').toLowerCase().includes('jembatan')).length;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [-2.5, 118.0],
      zoom: 5,
      zoomControl: false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const baseTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    // Label size follows zoom level so names stay readable zooming in/out
    const applyZoomClass = () => {
      const z = map.getZoom();
      const el = map.getContainer();
      el.classList.remove('nke-zoom-low', 'nke-zoom-mid', 'nke-zoom-high');
      el.classList.add(z <= 5 ? 'nke-zoom-low' : z <= 7 ? 'nke-zoom-mid' : 'nke-zoom-high');
    };
    applyZoomClass();
    map.on('zoomend', applyZoomClass);

    // KPI overlay host inside the map pane: z-index 450 sits above the tiles (200)
    // but below markers (600) and popups (700), so pins + names are always in front.
    const host = L.DomUtil.create('div', 'nke-kpi-host', map.getPanes().mapPane) as HTMLDivElement;
    host.style.cssText = 'position:absolute;left:0;top:0;z-index:450;pointer-events:none;';
    L.DomEvent.disableClickPropagation(host);
    L.DomEvent.disableScrollPropagation(host);
    const syncHost = () => {
      const size = map.getSize();
      host.style.width = size.x + 'px';
      host.style.height = size.y + 'px';
      // Cancel the pane's pan offset so the cards stay fixed on screen
      L.DomUtil.setPosition(host, map.containerPointToLayerPoint([0, 0]));
    };
    syncHost();
    map.on('move zoom moveend zoomend viewreset resize', syncHost);
    setKpiHost(host);

    mapInstanceRef.current = map;
    baseTileRef.current = baseTile;
    layerGroupRef.current = layerGroup;

    return () => {
      setKpiHost(null);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update base map layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (baseTileRef.current) {
      mapInstanceRef.current.removeLayer(baseTileRef.current);
    }
    const tileUrl = baseMap === 'terrain'
      ? 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution = baseMap === 'terrain'
      ? '&copy; OpenStreetMap, SRTM | OpenTopoMap'
      : '&copy; OpenStreetMap contributors';

    baseTileRef.current = L.tileLayer(tileUrl, { attribution, maxZoom: 17 }).addTo(mapInstanceRef.current);
  }, [baseMap]);

  // Helper: strip the generic prefix; truncation is handled in CSS depending on zoom level
  const getNeatShortName = (name: string): string => {
    return name.replace(/^Proyek\s+(Pembangunan\s+)?/i, '').trim() || name;
  };

  // Stable key: markers are rebuilt only when what they display actually changes
  // (previously the effect re-ran on every render and re-fitted the map each time)
  const displayKey =
    displayProjects
      .map((p) => [p.id, p.name, p.lat, p.lng, p.type, p.phase, p.actual, p.plan, p.openIssues, p.client, p.location, p.year, p.period, p.statusApproval].join('~'))
      .join('|') +
    `|${currentUser.role}|${currentUser.id}`;

  // Update markers on the map with INFRASTRUCTURE ICONS and NEAT LABELS
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    displayProjects.forEach((p) => {
      const infra = getInfrastructureDetails(p.type);
      const st = getProjectStatus(p);
      const pinColor = isViewer ? infra.color : statusColors[st];
      const dev = p.actual - p.plan;
      const neatName = getNeatShortName(p.name);

      // Custom marker HTML: Neat label directly on map + infrastructure-specific SVG icon
      const markerHtml = `
        <div class="nke-marker-anchor"><div class="nke-marker-container">
          <!-- Neat Project Name Badge Directly on Map -->
          <div class="nke-marker-label" title="${p.name.replace(/"/g, '&quot;')}">
            <span class="badge-type">${infra.category}</span>
            ${p.statusApproval === 'Menunggu' ? '<span class="badge-pending">Menunggu</span>' : ''}
            ${p.statusApproval === 'Ditolak' ? '<span class="badge-pending badge-rejected">Ditolak</span>' : ''}
            <span class="nke-marker-name">${neatName}</span>
          </div>

          <!-- Pin with Infrastructure Icon -->
          <div class="nke-marker-pin" style="background: ${pinColor};">
            <div class="nke-marker-pin-inner">
              ${infra.iconSvg}
            </div>
          </div>
          
          <div class="nke-marker-pulse" style="background: ${pinColor}; box-shadow: 0 0 10px ${pinColor};"></div>
        </div></div>
      `;

      const customIcon = L.divIcon({
        className: 'nke-custom-marker',
        html: markerHtml,
        // 0x0 icon box: the label sizes itself to the text (no more clipped names)
        iconSize: [0, 0],
        iconAnchor: [0, 0],
        popupAnchor: [0, -52]
      });

      const marker = L.marker([p.lat, p.lng], { icon: customIcon, riseOnHover: true, riseOffset: 2000 });
      marker.on('popupopen', () => marker.setZIndexOffset(3000));
      marker.on('popupclose', () => marker.setZIndexOffset(0));

      // Create Custom Popup Content
      const popupDiv = document.createElement('div');
      popupDiv.style.padding = '14px 16px';
      popupDiv.style.fontFamily = 'inherit';
      popupDiv.style.color = '#ffffff';

      if (isViewer) {
        // =====================================================================
        // VIEWER POPUP: NO DASHBOARD, NO PROGRESS! DIRECT TO 3D MODEL
        // =====================================================================
        popupDiv.innerHTML = `
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
            <span style="
              display:inline-flex;
              align-items:center;
              gap:4px;
              font-size:10.5px;
              font-weight:700;
              padding:2px 8px;
              border-radius:999px;
              background:rgba(46,107,240,0.2);
              color:#60a5fa;
              border:1px solid rgba(59,130,246,0.35);
            ">
              ${infra.iconSvg}
              <span>${p.type}</span>
            </span>
            <span style="font-size:10.5px;color:#9fb0c8;background:#102544;padding:2px 6px;border-radius:4px;border:1px solid #1e3454;">
              Fase: ${p.phase}
            </span>
          </div>

          <div style="font-size:13.5px;font-weight:700;line-height:1.35;margin-bottom:6px;color:#ffffff;">
            ${p.name}
          </div>

          <div style="font-size:11.5px;color:#9fb0c8;margin-bottom:12px;line-height:1.4;">
            <div>📍 <b>Lokasi:</b> ${p.location}</div>
            <div>🏢 <b>Klien:</b> ${p.client}</div>
            <div>📅 <b>Tahun:</b> ${p.year} (${p.period || '2025-2026'})</div>
          </div>

          <button id="btn-popup-viewer-${p.id}" style="
            width: 100%;
            background: linear-gradient(135deg, #2e6bf0 0%, #1d4ed8 100%);
            color: #ffffff;
            border: none;
            border-radius: 8px;
            padding: 9px 12px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            box-shadow: 0 4px 14px rgba(46,107,240,0.4);
            transition: all 0.2s ease;
          ">
            <span>Buka Proyek</span>
            <span>&rarr;</span>
          </button>
        `;

        const btn = popupDiv.querySelector(`#btn-popup-viewer-${p.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            onOpenProject(p.id, 'model3d');
          });
        }
      } else {
        // =====================================================================
        // ADMIN / USER POPUP: Full Dashboard & 3D Model Option
        // =====================================================================
        popupDiv.innerHTML = `
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
            <span style="
              display:inline-flex;
              align-items:center;
              gap:4px;
              font-size:10.5px;
              font-weight:700;
              padding:2px 8px;
              border-radius:999px;
              background:rgba(46,107,240,0.2);
              color:#60a5fa;
              border:1px solid rgba(59,130,246,0.35);
            ">
              ${infra.iconSvg}
              <span>${p.type}</span>
            </span>
            <span style="font-size:10.5px;color:${pinColor};font-weight:700;">
              ${p.actual >= 100 ? 'Selesai' : `Deviasi: ${dev > 0 ? '+' : ''}${dev}%`}
            </span>
          </div>

          <div style="font-size:13.5px;font-weight:700;line-height:1.35;margin-bottom:6px;color:#ffffff;">
            ${p.name}
          </div>

          <div style="font-size:11.5px;color:#9fb0c8;margin-bottom:10px;line-height:1.4;">
            <div>📍 <b>Lokasi:</b> ${p.location} · <b>Klien:</b> ${p.client}</div>
            <div style="margin-top:4px;">
              <b>Progres:</b> Aktual ${p.actual}% / Rencana ${p.plan}%
            </div>
            <div style="margin-top:2px;"><b>Issue Terbuka:</b> ${p.openIssues} issue</div>
          </div>

          <div style="display:grid;grid-cols:2;display:flex;gap:8px;">
            <button id="btn-popup-dash-${p.id}" style="
              flex: 1;
              background: #2e6bf0;
              color: #ffffff;
              border: none;
              border-radius: 6px;
              padding: 7px 10px;
              font-size: 11.5px;
              font-weight: 700;
              cursor: pointer;
            ">Buka Dashboard</button>
            <button id="btn-popup-3d-${p.id}" style="
              flex: 1;
              background: #102544;
              color: #60a5fa;
              border: 1px solid #1e3454;
              border-radius: 6px;
              padding: 7px 10px;
              font-size: 11.5px;
              font-weight: 700;
              cursor: pointer;
            ">3D Model</button>
          </div>
        `;

        const btnDash = popupDiv.querySelector(`#btn-popup-dash-${p.id}`);
        if (btnDash) {
          btnDash.addEventListener('click', () => {
            onOpenProject(p.id, 'dashboard');
          });
        }

        const btn3d = popupDiv.querySelector(`#btn-popup-3d-${p.id}`);
        if (btn3d) {
          btn3d.addEventListener('click', () => {
            onOpenProject(p.id, 'model3d');
          });
        }
      }

      marker.bindPopup(popupDiv, { maxWidth: 320, autoPanPaddingTopLeft: [24, 150], autoPanPaddingBottomRight: [24, 24] });
      marker.addTo(layerGroupRef.current!);
    });

    // Fit bounds if markers exist
    if (displayProjects.length > 0) {
      const bounds = L.latLngBounds(displayProjects.map((p) => [p.lat, p.lng]));
      // Extra top padding so pins + name labels stay clear of the KPI cards overlay
      mapInstanceRef.current.fitBounds(bounds, {
        paddingTopLeft: [80, 150],
        paddingBottomRight: [80, 70],
        maxZoom: 7
      });
    }
  }, [displayKey]);

  // Invalidate map size on sidebar collapse toggle
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 260);
  };

  // Check if current user has no projects
  const isUserWithoutProjects = currentUser.role === 'user' && currentUser.projects.length === 0;

  const kpiOverlay = (
        <div className={`absolute top-3 left-12 right-4 grid grid-cols-2 ${isViewer ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-2.5 pointer-events-none`}>
          
          {isViewer ? (
            /* ================= VIEWER KPI CARDS (NO PROGRESS, CATEGORY FOCUSED) ================= */
            <>
              <div
                onClick={() => setKpiMode('all')}
                className={`pointer-events-auto p-2.5 md:p-3 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                  kpiMode === 'all'
                    ? 'bg-[#132c52]/95 border-blue-500 shadow-lg'
                    : 'bg-[#102544]/90 border-[#1e3454] hover:border-blue-400'
                }`}
              >
                <div className="text-[10px] md:text-[11px] text-[#9fb0c8] font-medium uppercase tracking-wider">
                  Total Model 3D Proyek
                </div>
                <div className="text-lg md:text-2xl font-bold text-white mt-0.5">
                  {totalProjects}
                </div>
                <div className="text-[10px] text-[#9fb0c8]">Semua proyek di peta</div>
              </div>

              <div
                onClick={() => setKpiMode('gedung')}
                className={`pointer-events-auto p-2.5 md:p-3 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                  kpiMode === 'gedung'
                    ? 'bg-[#132c52]/95 border-blue-500 shadow-lg'
                    : 'bg-[#102544]/90 border-[#1e3454] hover:border-blue-400'
                }`}
              >
                <div className="text-[10px] md:text-[11px] text-[#9fb0c8] font-medium uppercase tracking-wider">
                  Proyek Gedung
                </div>
                <div className="text-lg md:text-2xl font-bold text-blue-400 mt-0.5">
                  {gedungCount}
                </div>
                <div className="text-[10px] text-[#9fb0c8]">Pemerintahan & Perkantoran</div>
              </div>

              <div
                onClick={() => setKpiMode('jembatan')}
                className={`pointer-events-auto p-2.5 md:p-3 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                  kpiMode === 'jembatan'
                    ? 'bg-[#132c52]/95 border-sky-500 shadow-lg'
                    : 'bg-[#102544]/90 border-[#1e3454] hover:border-sky-400'
                }`}
              >
                <div className="text-[10px] md:text-[11px] text-[#9fb0c8] font-medium uppercase tracking-wider">
                  Proyek Jembatan
                </div>
                <div className="text-lg md:text-2xl font-bold text-sky-400 mt-0.5">
                  {jembatanCount}
                </div>
                <div className="text-[10px] text-[#9fb0c8]">Jembatan & Flyover</div>
              </div>

            </>
          ) : (
            /* ================= ADMIN & USER KPI CARDS (INCLUDES PROGRESS & DEV) ================= */
            <>
              <div
                onClick={() => setKpiMode('all')}
                className={`pointer-events-auto p-2.5 md:p-3 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                  kpiMode === 'all'
                    ? 'bg-[#132c52]/95 border-blue-500 shadow-lg'
                    : 'bg-[#102544]/90 border-[#1e3454] hover:border-blue-400'
                }`}
              >
                <div className="text-[10px] md:text-[11px] text-[#9fb0c8] font-medium uppercase tracking-wider">
                  Total Proyek
                </div>
                <div className="text-lg md:text-2xl font-bold text-white mt-0.5">
                  {totalProjects}
                </div>
                <div className="text-[10px] text-[#9fb0c8]">Klik untuk semua proyek</div>
              </div>

              <div
                onClick={() => setKpiMode('progress')}
                className={`pointer-events-auto p-2.5 md:p-3 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                  kpiMode === 'progress'
                    ? 'bg-[#132c52]/95 border-blue-500 shadow-lg'
                    : 'bg-[#102544]/90 border-[#1e3454] hover:border-blue-400'
                }`}
              >
                <div className="text-[10px] md:text-[11px] text-[#9fb0c8] font-medium uppercase tracking-wider">
                  Rata-rata Progres
                </div>
                <div className="text-lg md:text-2xl font-bold text-blue-400 mt-0.5">
                  {avgProgress}%
                </div>
                <div className="text-[10px] text-[#9fb0c8]">Urutkan progres tertinggi</div>
              </div>

              <div
                onClick={() => setKpiMode('attention')}
                className={`pointer-events-auto p-2.5 md:p-3 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                  kpiMode === 'attention'
                    ? 'bg-[#132c52]/95 border-orange-500 shadow-lg'
                    : 'bg-[#102544]/90 border-[#1e3454] hover:border-orange-400'
                }`}
              >
                <div className="text-[10px] md:text-[11px] text-[#9fb0c8] font-medium uppercase tracking-wider">
                  Perlu Perhatian
                </div>
                <div className="text-lg md:text-2xl font-bold text-[#ffb81c] mt-0.5">
                  {attentionCount}
                </div>
                <div className="text-[10px] text-[#9fb0c8]">Deviasi terlambat</div>
              </div>

              <div
                onClick={() => setKpiMode('issues')}
                className={`pointer-events-auto p-2.5 md:p-3 rounded-lg border backdrop-blur-md transition-all cursor-pointer ${
                  kpiMode === 'issues'
                    ? 'bg-[#132c52]/95 border-red-500 shadow-lg'
                    : 'bg-[#102544]/90 border-[#1e3454] hover:border-red-400'
                }`}
              >
                <div className="text-[10px] md:text-[11px] text-[#9fb0c8] font-medium uppercase tracking-wider">
                  Total Isu Terbuka
                </div>
                <div className="text-lg md:text-2xl font-bold text-[#e2705f] mt-0.5">
                  {totalOpenIssues}
                </div>
                <div className="text-[10px] text-[#9fb0c8]">Clash &amp; koordinasi</div>
              </div>
            </>
          )}

        </div>
  );

  return (
    <div className="relative flex flex-col md:flex-row h-[calc(100vh-66px)] w-full overflow-hidden bg-[#0b1526]">
      
      {/* SIDEBAR DAFTAR PROYEK */}
      <aside
        className={`bg-[#0f2444] border-r border-[#1e3454] transition-all duration-300 z-30 flex flex-col shrink-0 ${
          isSidebarCollapsed
            ? '-ml-96 md:-ml-96 w-96'
            : 'w-full md:w-96'
        }`}
      >
        <div className="p-4 md:p-5 flex flex-col gap-3.5 border-b border-[#1e3454]">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-bold text-white tracking-wide">
              {isViewer ? 'Katalog Model 3D Proyek' : 'Daftar Semua Proyek'}
            </h2>
            <span className="text-xs bg-[#102544] px-2.5 py-0.5 rounded-full border border-[#1e3454] text-blue-400 font-semibold">
              {displayProjects.length} Proyek
            </span>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9fb0c8]" />
            <input
              type="text"
              placeholder="Cari Proyek, Lokasi, Klien..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#102544] border border-[#1e3454] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <div className={`grid ${isViewer ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#102544] border border-[#1e3454] rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Semua Jenis</option>
              {Array.from(new Set(projects.map((p) => p.type))).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-[#102544] border border-[#1e3454] rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Semua Tahun</option>
              {Array.from(new Set(projects.map((p) => p.year))).sort((a,b)=>b-a).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {!isViewer && (
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#102544] border border-[#1e3454] rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Status</option>
                <option value="ok">Sesuai</option>
                <option value="warn">Terlambat ringan</option>
                <option value="bad">Terlambat</option>
                <option value="done">Selesai</option>
              </select>
            )}
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Callout if user has 0 projects */}
          {isUserWithoutProjects && (
            <div className="p-4 rounded-xl bg-blue-600/15 border border-blue-500/40 text-white space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                <FolderPlus className="w-4 h-4" />
                <span>Belum Ada Proyek Terdaftar</span>
              </div>
              <p className="text-[11.5px] text-[#d7e3ec] leading-relaxed">
                Akun Anda belum memiliki proyek. Silakan klik tombol <b>(+) Tambah Proyek</b> di pojok kiri bawah untuk mendaftarkan proyek baru beserta informasi dan titik lokasinya.
              </p>
              <button
                type="button"
                onClick={onOpenAddProject}
                className="w-full mt-2 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Daftarkan Proyek Sekarang
              </button>
            </div>
          )}

          {displayProjects.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#9fb0c8]">
              {projects.length === 0
                ? 'Belum ada data proyek.'
                : 'Tidak ada proyek yang sesuai filter pencarian.'}
            </div>
          ) : (
            displayProjects.map((p) => {
              const infra = getInfrastructureDetails(p.type);
              const st = getProjectStatus(p);
              const dev = p.actual - p.plan;
              
              return (
                <div
                  key={p.id}
                  onClick={() => onOpenProject(p.id, isViewer ? 'model3d' : 'dashboard')}
                  style={{ borderLeftColor: isViewer ? infra.color : statusColors[st] }}
                  className="bg-[#102544] border border-[#1e3454] border-l-4 rounded-lg p-3.5 hover:border-blue-500 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs md:text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {p.name}
                    </h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold shrink-0 ${infra.badgeBg}`}>
                      {infra.category}
                    </span>
                  </div>

                  {p.statusApproval === 'Menunggu' && (
                    <div className="mt-1.5 text-[10.5px] font-semibold text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 rounded px-2 py-1">
                      ⏳ Menunggu persetujuan Admin (belum tampil untuk Viewer)
                    </div>
                  )}
                  {p.statusApproval === 'Ditolak' && (
                    <div className="mt-1.5 text-[10.5px] font-semibold text-red-300 bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
                      ✕ Ditolak Admin{p.note ? `: ${p.note}` : ''}
                    </div>
                  )}

                  <div className="text-[11px] text-[#9fb0c8] mt-1.5 flex items-center gap-1.5">
                    <span>📍 {p.location}</span>
                    <span>·</span>
                    <span>{p.client}</span>
                  </div>

                  {/* 
                    ============================================================
                    VIEWER REQUIREMENT:
                    "kalo viewer itu gaada dashboard lanjutan, dia klik langsung 
                    masuk menuju area gambar 1. ketika di klik juga hilangkan 
                    buka dashboard dan progressnya."
                    ============================================================
                  */}
                  {isViewer ? (
                    <div className="mt-3 pt-2.5 border-t border-[#1e3454]/60 flex items-center">
                      <span className="text-[10.5px] text-[#9fb0c8] bg-[#0b1526] px-2 py-0.5 rounded border border-[#1e3454]">
                        Fase: {p.phase}
                      </span>
                    </div>
                  ) : (
                    /* Progress Bar for Admin & User */
                    <>
                      <div className="mt-3">
                        <div className="h-2 w-full bg-[#0b1526] rounded-full overflow-hidden relative">
                          <div
                            className={`h-full rounded-full ${statusBgClasses[st]}`}
                            style={{ width: `${Math.min(p.actual, 100)}%` }}
                          />
                          <div
                            className="absolute top-0 bottom-0 w-0.5 bg-white opacity-70"
                            style={{ left: `${Math.min(p.plan, 100)}%` }}
                            title={`Rencana: ${p.plan}%`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#d7e3ec] mt-2 font-medium">
                        <span>Aktual {p.actual}% / Rencana {p.plan}%</span>
                        <span className={statusTextClasses[st]}>
                          {st === 'done' ? 'Selesai' : `${dev > 0 ? '+' : ''}${dev}%`}
                        </span>
                        <span className="text-[#ffb81c]">Isu: {p.openIssues}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* MAP WRAPPER */}
      <div className="relative flex-1 h-full min-h-[400px]">
        
        {/* Toggle Sidebar Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-[400] bg-blue-600 hover:bg-blue-500 text-white rounded-r-lg w-7 h-12 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
          title={isSidebarCollapsed ? 'Buka daftar proyek' : 'Sembunyikan daftar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* KPI cards are portaled into the map pane (see kpiHost) so markers stay in front */}
        {kpiHost && createPortal(kpiOverlay, kpiHost)}

        {/* LEAFLET MAP ELEMENT */}
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* BASEMAP SELECTOR (Bottom Left over Map) */}
        <div className="absolute left-4 bottom-5 z-[400]">
          <select
            value={baseMap}
            onChange={(e) => setBaseMap(e.target.value as 'osm' | 'terrain')}
            className="bg-[#102544]/90 backdrop-blur-md border border-[#1e3454] text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 shadow-md"
          >
            <option value="osm">Basemap Standar (OSM)</option>
            <option value="terrain">Basemap Terrain (Topografi)</option>
          </select>
        </div>

      </div>

      {/* Button Plus for users with 0 projects */}
      {isUserWithoutProjects && (
        <div className="fixed bottom-6 left-6 z-[2000] flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAddProject}
            className="group relative flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-full shadow-[0_10px_25px_rgba(46,107,240,0.5)] border-2 border-blue-300 font-bold text-sm tracking-wide transition-all transform hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
            title="Tambah Proyek Baru"
          >
            <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center font-black text-lg">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="font-bold text-sm">Tambah Proyek Baru</span>
            <span className="absolute -top-2.5 -right-2 bg-yellow-400 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow">
              Mulai Di Sini!
            </span>
          </button>
        </div>
      )}

      {/* Button Plus shortcut for logged-in non-viewers */}
      {!isUserWithoutProjects && !isViewer && (
        <div className="fixed bottom-6 left-6 z-[2000]">
          <button
            type="button"
            onClick={onOpenAddProject}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-2xl border-2 border-blue-400 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 cursor-pointer group"
            title="Tambah Proyek Baru (Informasi & Lokasi)"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
      )}

    </div>
  );
};
