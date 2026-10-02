import React, { useState, useRef, useEffect } from 'react';
import { ProjectInfo, UserAccount } from '../types';
import { ProjectInfoCard } from './ProjectInfoCard';
import {
  Box,
  Maximize2,
  RotateCcw,
  Eye,
  Compass,
  Grid3X3,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Minimize2
} from 'lucide-react';

interface Project3DModelProps {
  project?: ProjectInfo;
  currentUser?: UserAccount;
}

interface BimElement {
  id: string;
  name: string;
  category: 'Struktur' | 'Arsitektur' | 'MEP';
  floor: string;
  material: string;
  status: 'Selesai' | 'Dalam Proses' | 'Rencana';
  volume: string;
  elevation: string;
  coordinates: [number, number, number]; // [x, y, z]
  size: [number, number, number]; // [width, height, depth]
}

interface CameraState {
  rotX: number;
  rotY: number;
  zoom: number;
  panX: number;
  panY: number;
}

const buildElements = (isBridge: boolean): BimElement[] => {
  if (isBridge) {
    return [
      {
        id: 'PYLON-01',
        name: 'Pylon Menara Utama Barat',
        category: 'Struktur',
        floor: 'Pondasi / Pier P1',
        material: 'Beton Bertulang Mutu Tinggi fc 45 MPa',
        status: 'Selesai',
        volume: '245.5 m³',
        elevation: '+35.00 m',
        coordinates: [-120, -40, 0],
        size: [24, 180, 24]
      },
      {
        id: 'PYLON-02',
        name: 'Pylon Menara Utama Timur',
        category: 'Struktur',
        floor: 'Pondasi / Pier P2',
        material: 'Beton Bertulang Mutu Tinggi fc 45 MPa',
        status: 'Selesai',
        volume: '245.5 m³',
        elevation: '+35.00 m',
        coordinates: [120, -40, 0],
        size: [24, 180, 24]
      },
      {
        id: 'DECK-01',
        name: 'Girder Baja Box Girder Bentang Utama',
        category: 'Struktur',
        floor: 'Lantai Jembatan',
        material: 'Baja Struktural SM490YB',
        status: 'Dalam Proses',
        volume: '580.0 Ton',
        elevation: '+12.50 m',
        coordinates: [0, 10, 0],
        size: [360, 16, 80]
      },
      {
        id: 'CABLE-STAY-W',
        name: 'Sistem Kabel Stay Fan Arrangement Barat',
        category: 'Struktur',
        floor: 'Stay Cables',
        material: 'High Tensile Galvanized Strand',
        status: 'Dalam Proses',
        volume: '18 Pasang Kabel',
        elevation: '+24.00 m',
        coordinates: [-60, -15, 0],
        size: [100, 70, 4]
      },
      {
        id: 'CABLE-STAY-E',
        name: 'Sistem Kabel Stay Fan Arrangement Timur',
        category: 'Struktur',
        floor: 'Stay Cables',
        material: 'High Tensile Galvanized Strand',
        status: 'Dalam Proses',
        volume: '18 Pasang Kabel',
        elevation: '+24.00 m',
        coordinates: [60, -15, 0],
        size: [100, 70, 4]
      },
      {
        id: 'PIER-01',
        name: 'Pilar Jembatan Pendekat Barat',
        category: 'Struktur',
        floor: 'Substructure',
        material: 'Beton Bertulang fc 35 MPa',
        status: 'Selesai',
        volume: '95.0 m³',
        elevation: '+0.00 m',
        coordinates: [-180, 50, 0],
        size: [20, 65, 40]
      },
      {
        id: 'PIER-02',
        name: 'Pilar Jembatan Pendekat Timur',
        category: 'Struktur',
        floor: 'Substructure',
        material: 'Beton Bertulang fc 35 MPa',
        status: 'Selesai',
        volume: '95.0 m³',
        elevation: '+0.00 m',
        coordinates: [180, 50, 0],
        size: [20, 65, 40]
      },
      {
        id: 'ASPHALT-ROAD',
        name: 'Perkerasan Aspal AC-WC & Marka',
        category: 'Arsitektur',
        floor: 'Lantai Jembatan',
        material: 'Asphalt Concrete Wearing Course',
        status: 'Rencana',
        volume: '1,450 m²',
        elevation: '+13.20 m',
        coordinates: [0, 2, 0],
        size: [360, 4, 72]
      },
      {
        id: 'LIGHTING-MEP',
        name: 'Penerangan Jalan PJU & Lampu Arsitektural',
        category: 'MEP',
        floor: 'Lantai Jembatan',
        material: 'LED Smart Lighting IP67',
        status: 'Rencana',
        volume: '48 Titik Lampu',
        elevation: '+16.00 m',
        coordinates: [0, -6, 42],
        size: [340, 18, 4]
      }
    ];
  }

  // Default Gedung (Building / High-rise / Pemerintahan)
  return [
    // Basemen & Pondasi
    {
      id: 'FND-RAFT',
      name: 'Raft Foundation & Tiang Pancang Spun Pile',
      category: 'Struktur',
      floor: 'Pondasi',
      material: 'Beton K-350 & Rebar BJTS 420',
      status: 'Selesai',
      volume: '420.0 m³',
      elevation: '-4.50 m',
      coordinates: [0, 85, 0],
      size: [180, 20, 140]
    },
    // Lantai 1
    {
      id: 'COL-L1-A',
      name: 'Kolom Utama K1 Lantai 1',
      category: 'Struktur',
      floor: 'Lantai 1',
      material: 'Beton Mutu fc 35 MPa (60x60 cm)',
      status: 'Selesai',
      volume: '18.4 m³',
      elevation: '+0.00 m',
      coordinates: [-60, 55, -45],
      size: [18, 40, 18]
    },
    {
      id: 'COL-L1-B',
      name: 'Kolom Utama K1 Lantai 1 Timur',
      category: 'Struktur',
      floor: 'Lantai 1',
      material: 'Beton Mutu fc 35 MPa (60x60 cm)',
      status: 'Selesai',
      volume: '18.4 m³',
      elevation: '+0.00 m',
      coordinates: [60, 55, 45],
      size: [18, 40, 18]
    },
    {
      id: 'SLAB-L1',
      name: 'Pelat Lantai 1 & Balok Girder B1',
      category: 'Struktur',
      floor: 'Lantai 1',
      material: 'Beton Pelat Tebal 15 cm fc 30 MPa',
      status: 'Selesai',
      volume: '110.0 m³',
      elevation: '+4.00 m',
      coordinates: [0, 35, 0],
      size: [170, 10, 130]
    },
    {
      id: 'WALL-L1',
      name: 'Fasad Dinding Panel & Kaca Lobi',
      category: 'Arsitektur',
      floor: 'Lantai 1',
      material: 'Curtain Wall DGU Tempered 10mm',
      status: 'Selesai',
      volume: '340 m²',
      elevation: '+2.00 m',
      coordinates: [0, 55, 66],
      size: [160, 30, 4]
    },
    // Lantai 2
    {
      id: 'COL-L2',
      name: 'Kolom Struktur Lantai 2',
      category: 'Struktur',
      floor: 'Lantai 2',
      material: 'Beton Mutu fc 35 MPa',
      status: 'Selesai',
      volume: '17.2 m³',
      elevation: '+4.00 m',
      coordinates: [0, 15, 0],
      size: [160, 35, 120]
    },
    {
      id: 'SLAB-L2',
      name: 'Pelat Lantai 2 Mezzanine',
      category: 'Struktur',
      floor: 'Lantai 2',
      material: 'Pelat Beton Pracetak & Wiremesh',
      status: 'Selesai',
      volume: '105.0 m³',
      elevation: '+8.00 m',
      coordinates: [0, -2, 0],
      size: [165, 10, 125]
    },
    {
      id: 'MEP-L2',
      name: 'Ducting HVAC Central & Chiller Line',
      category: 'MEP',
      floor: 'Lantai 2',
      material: 'Galvanized Steel & Isolasi Rockwool',
      status: 'Dalam Proses',
      volume: '210 m',
      elevation: '+7.20 m',
      coordinates: [0, 5, 20],
      size: [140, 8, 14]
    },
    // Lantai 3
    {
      id: 'COL-L3',
      name: 'Kolom & Corewall Lift Lantai 3',
      category: 'Struktur',
      floor: 'Lantai 3',
      material: 'Beton Bertulang Mutu fc 35 MPa',
      status: 'Dalam Proses',
      volume: '16.8 m³',
      elevation: '+8.00 m',
      coordinates: [0, -25, 0],
      size: [150, 36, 110]
    },
    {
      id: 'SLAB-L3',
      name: 'Pelat Lantai 3 & Balok Induk',
      category: 'Struktur',
      floor: 'Lantai 3',
      material: 'Beton Bertulang fc 30 MPa',
      status: 'Dalam Proses',
      volume: '98.0 m³',
      elevation: '+12.00 m',
      coordinates: [0, -43, 0],
      size: [155, 10, 115]
    },
    // Lantai 4 / Rooftop
    {
      id: 'ROOF-STRUCTURE',
      name: 'Rangka Atap Baja & Ruang Mesin Lift',
      category: 'Struktur',
      floor: 'Rooftop',
      material: 'Baja WF 300x150 & Bondek Atap',
      status: 'Rencana',
      volume: '28.5 Ton',
      elevation: '+16.00 m',
      coordinates: [0, -65, 0],
      size: [140, 32, 100]
    },
    {
      id: 'ROOF-MEP',
      name: 'Sistem Pompa Hydrant & Tangki Air Atas',
      category: 'MEP',
      floor: 'Rooftop',
      material: 'Pipa Seamless Sch 40 & Tangki FRP',
      status: 'Rencana',
      volume: '2 Unit Tangki 10m³',
      elevation: '+18.50 m',
      coordinates: [0, -75, -20],
      size: [60, 24, 40]
    }
  ];
};
// ============================================================================
// BimCanvas: satu viewport 3D. Dipakai sekali (viewer: Plan saja) atau dua kali
// (admin/user: Plan vs Actual) dengan kamera yang disinkronkan oleh parent.
// ============================================================================
interface BimCanvasProps {
  elements: BimElement[];
  mode: 'plan' | 'actual';
  camera: CameraState;
  isBridge: boolean;
  showWireframe: boolean;
  showXRay: boolean;
  onOrbit: (dx: number, dy: number) => void;
  onPan: (dx: number, dy: number) => void;
  onZoomBy: (factor: number) => void;
  onInteractStart: () => void;
}

const BimCanvas: React.FC<BimCanvasProps> = ({
  elements,
  mode,
  camera,
  isBridge,
  showWireframe,
  showXRay,
  onOrbit,
  onPan,
  onZoomBy,
  onInteractStart
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const lastRef = useRef({ x: 0, y: 0 });
  const [sizeTick, setSizeTick] = useState(0);

  // Redraw when the container is resized (split view, fullscreen, window resize)
  useEffect(() => {
    if (!wrapRef.current || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setSizeTick((t) => t + 1));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  // Wheel zoom needs a non-passive native listener to be able to preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      onZoomBy(e.deltaY < 0 ? 1.08 : 0.92);
    };
    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', onWheel);
  }, [onZoomBy]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || 800;
    const height = canvas.clientHeight || 550;
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const { rotX, rotY, zoom, panX, panY } = camera;
    const cx0 = width / 2 + panX;
    const cy0 = height / 2 + panY + 20;
    // Scale scene to the viewport so the narrower split panels still fit the model
    const fit = Math.min(1, width / 760);

    // Background vignette
    const radGrad = ctx.createRadialGradient(cx0, cy0, 50, cx0, cy0, Math.max(width, 300) * 0.7);
    radGrad.addColorStop(0, '#10223d');
    radGrad.addColorStop(1, '#07101e');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, width, height);

    const radY = (rotY * Math.PI) / 180;
    const radX = (rotX * Math.PI) / 180;
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);

    const project3D = (x: number, y: number, z: number) => {
      const x1 = x * cosY - z * sinY;
      const z1 = z * cosY + x * sinY;
      const y2 = y * cosX - z1 * sinX;
      const z2 = z1 * cosX + y * sinX;
      const cameraDist = 800;
      const scale = (cameraDist / (cameraDist + z2)) * zoom * fit;
      return { x: cx0 + x1 * scale, y: cy0 + y2 * scale, depth: z2 };
    };

    // Ground grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(46, 107, 240, 0.15)';
    ctx.lineWidth = 1;
    const gridSize = 450;
    const step = 45;
    for (let i = -gridSize; i <= gridSize; i += step) {
      const p1 = project3D(i, 95, -gridSize);
      const p2 = project3D(i, 95, gridSize);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      const p3 = project3D(-gridSize, 95, i);
      const p4 = project3D(gridSize, 95, i);
      ctx.moveTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
    }
    ctx.stroke();

    // North datum
    const compassP = project3D(-240, 95, -240);
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#60a5fa';
    ctx.fillText('N (UTARA)', compassP.x, compassP.y);

    // Colour per mode.
    //  plan   -> everything in baseline blue
    //  actual -> green (selesai), orange (dalam proses), ghost (belum dikerjakan)
    const getColor = (el: BimElement, isFront: boolean, isTop: boolean) => {
      const lightBase = isTop ? 0 : isFront ? -10 : -20;
      let hue = 217;
      let sat = 70;
      let light = 58 + lightBase;
      let alpha = showXRay ? 0.35 : el.category === 'Arsitektur' ? 0.65 : 0.9;

      if (mode === 'actual') {
        if (el.status === 'Selesai') {
          hue = 152;
          light = 50 + lightBase;
        } else if (el.status === 'Dalam Proses') {
          hue = 38;
          light = 58 + lightBase;
        } else {
          // Not yet built: faint ghost of the planned geometry
          hue = 217;
          sat = 30;
          alpha = 0.07;
        }
      }
      return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
    };

    const sorted = elements
      .map((el) => ({ el, depth: project3D(el.coordinates[0], el.coordinates[1], el.coordinates[2]).depth }))
      .sort((a, b) => b.depth - a.depth);

    sorted.forEach(({ el }) => {
      const [ex, ey, ez] = el.coordinates;
      const [w, h, d] = el.size;
      const hw = w / 2;
      const hh = h / 2;
      const hd = d / 2;
      const isGhost = mode === 'actual' && el.status === 'Rencana';

      const v000 = project3D(ex - hw, ey - hh, ez - hd);
      const v100 = project3D(ex + hw, ey - hh, ez - hd);
      const v110 = project3D(ex + hw, ey + hh, ez - hd);
      const v010 = project3D(ex - hw, ey + hh, ez - hd);
      const v001 = project3D(ex - hw, ey - hh, ez + hd);
      const v101 = project3D(ex + hw, ey - hh, ez + hd);
      const v111 = project3D(ex + hw, ey + hh, ez + hd);
      const v011 = project3D(ex - hw, ey + hh, ez + hd);

      const drawFace = (pts: { x: number; y: number }[], color: string, stroke: string) => {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
        ctx.closePath();
        if (!showWireframe) {
          ctx.fillStyle = color;
          ctx.fill();
        }
        ctx.setLineDash(isGhost ? [4, 4] : []);
        ctx.strokeStyle = isGhost ? 'rgba(96,165,250,0.45)' : stroke;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      };

      drawFace([v000, v100, v101, v001], getColor(el, false, true), '#ffffff55');
      drawFace([v001, v101, v111, v011], getColor(el, true, false), '#ffffff44');
      drawFace([v100, v101, v111, v110], getColor(el, false, false), '#ffffff33');
      drawFace([v000, v001, v011, v010], getColor(el, false, false), '#ffffff22');
      drawFace([v010, v110, v111, v011], getColor(el, false, false), '#ffffff11');

      if (isBridge && el.id.startsWith('CABLE') && !isGhost) {
        ctx.beginPath();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.moveTo(v000.x, v000.y);
        ctx.lineTo(v111.x, v111.y);
        ctx.stroke();
      }
    });
  }, [camera, elements, mode, isBridge, showWireframe, showXRay, sizeTick]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    lastRef.current = { x: e.clientX, y: e.clientY };
    onInteractStart();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastRef.current.x;
    const dy = e.clientY - lastRef.current.y;
    lastRef.current = { x: e.clientX, y: e.clientY };
    if (e.buttons === 1 && !e.shiftKey) onOrbit(dx, dy);
    else if (e.buttons === 2 || e.buttons === 4 || e.shiftKey) onPan(dx, dy);
  };

  const stopDrag = () => {
    draggingRef.current = false;
  };

  return (
    <div ref={wrapRef} className="relative flex-1 bg-[#07101e] select-none overflow-hidden cursor-grab active:cursor-grabbing min-h-[420px]">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onContextMenu={(e) => e.preventDefault()}
        className="absolute inset-0 w-full h-full block"
      />
    </div>
  );
};

export const Project3DModel: React.FC<Project3DModelProps> = ({ project, currentUser }) => {
  const isViewer = currentUser?.role === 'viewer';
  const projectName = project?.name || 'Proyek Gedung Kemen PU Timor Leste';
  const projectType = project?.type || 'Gedung Pemerintahan';
  const isBridge = (projectType || '').toLowerCase().includes('jembatan');

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Shared camera: keeps Plan and Actual panels perfectly in sync
  const [camera, setCamera] = useState<CameraState>({ rotX: 25, rotY: 45, zoom: 1, panX: 0, panY: 0 });
  const [isAutoSpin, setIsAutoSpin] = useState(true);
  const isInteractingRef = useRef(false);

  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [showWireframe, setShowWireframe] = useState(false);
  const [showXRay, setShowXRay] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({ struktur: true, arsitektur: true, mep: true });

  const allElements = React.useMemo(() => buildElements(isBridge), [isBridge]);

  const elements = React.useMemo(
    () =>
      allElements.filter((el) => {
        if (selectedFloor !== 'all' && el.floor !== selectedFloor) return false;
        if (el.category === 'Struktur' && !visibleLayers.struktur) return false;
        if (el.category === 'Arsitektur' && !visibleLayers.arsitektur) return false;
        if (el.category === 'MEP' && !visibleLayers.mep) return false;
        return true;
      }),
    [allElements, selectedFloor, visibleLayers]
  );

  // Reset floor filter when switching project type (bridge has no floors)
  useEffect(() => {
    setSelectedFloor('all');
  }, [isBridge]);

  // Auto-spin
  useEffect(() => {
    if (!isAutoSpin) return;
    let id: number;
    const loop = () => {
      if (!isInteractingRef.current) {
        setCamera((c) => ({ ...c, rotY: (c.rotY + 0.35) % 360 }));
      }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [isAutoSpin]);

  // Fullscreen state follows the browser (Esc key etc.)
  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const handleInteractStart = React.useCallback(() => {
    isInteractingRef.current = true;
    setIsAutoSpin(false);
    const release = () => {
      isInteractingRef.current = false;
      window.removeEventListener('mouseup', release);
    };
    window.addEventListener('mouseup', release);
  }, []);

  const handleOrbit = React.useCallback((dx: number, dy: number) => {
    setCamera((c) => ({
      ...c,
      rotY: (c.rotY + dx * 0.6) % 360,
      rotX: Math.max(-85, Math.min(85, c.rotX - dy * 0.5))
    }));
  }, []);

  const handlePan = React.useCallback((dx: number, dy: number) => {
    setCamera((c) => ({ ...c, panX: c.panX + dx, panY: c.panY + dy }));
  }, []);

  const handleZoomBy = React.useCallback((factor: number) => {
    setCamera((c) => ({ ...c, zoom: Math.max(0.4, Math.min(3, c.zoom * factor)) }));
  }, []);

  const handleResetCamera = () => {
    setCamera({ rotX: 25, rotY: 45, zoom: 1, panX: 0, panY: 0 });
    setIsAutoSpin(true);
  };

  const setCameraPreset = (view: 'iso' | 'front' | 'side' | 'top') => {
    setIsAutoSpin(false);
    const presets = {
      iso: { rotX: 25, rotY: 45 },
      front: { rotX: 0, rotY: 0 },
      side: { rotX: 0, rotY: 90 },
      top: { rotX: 85, rotY: 0 }
    };
    setCamera((c) => ({ ...c, ...presets[view] }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const canvasProps = {
    elements,
    camera,
    isBridge,
    showWireframe,
    showXRay,
    onOrbit: handleOrbit,
    onPan: handlePan,
    onZoomBy: handleZoomBy,
    onInteractStart: handleInteractStart
  };

  const zoomButtons = (
    <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
      <button
        type="button"
        onClick={() => handleZoomBy(1.15)}
        className="w-8 h-8 rounded-lg bg-[#102544]/90 hover:bg-blue-600 text-white border border-[#1e3454] flex items-center justify-center shadow-lg transition-colors cursor-pointer"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => handleZoomBy(0.85)}
        className="w-8 h-8 rounded-lg bg-[#102544]/90 hover:bg-blue-600 text-white border border-[#1e3454] flex items-center justify-center shadow-lg transition-colors cursor-pointer"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4" />
      </button>
    </div>
  );

  // Panel = title strip + canvas + legend overlay
  const renderPanel = (mode: 'plan' | 'actual', withZoomButtons: boolean) => (
    <div className="bg-[#0f2444] border border-[#1e3454] rounded-xl overflow-hidden flex flex-col shadow-xl relative min-h-[480px]">
      <div className="bg-[#102544] border-b border-[#1e3454] px-4 py-2.5 flex items-center justify-between gap-2 text-xs z-10">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${mode === 'plan' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
          <span className="font-bold text-white tracking-wide">
            {mode === 'plan' ? 'AS-PLANNED (Rencana / IFC Baseline)' : 'AS-BUILT (Kondisi Aktual Lapangan)'}
          </span>
        </div>
        {!isViewer && project && (
          <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
            mode === 'plan'
              ? 'text-blue-300 border-blue-500/40 bg-blue-500/10'
              : 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'
          }`}>
            {mode === 'plan' ? `Rencana ${project.plan}%` : `Aktual ${project.actual}%`}
          </span>
        )}
      </div>

      <div className="relative flex-1 flex flex-col">
        <BimCanvas {...canvasProps} mode={mode} />

        {/* Legend */}
        <div className="absolute bottom-3 left-3 bg-[#0b1526]/90 backdrop-blur-md border border-[#1e3454] rounded-lg p-2 text-[10.5px] shadow-lg flex flex-col gap-1 pointer-events-none">
          {mode === 'plan' ? (
            <div className="flex items-center gap-2 text-white">
              <span className="w-3 h-3 rounded bg-[#3b82f6]" />
              <span>Model rencana (baseline)</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-white">
                <span className="w-3 h-3 rounded bg-[#10b981]" />
                <span>Selesai terbangun</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="w-3 h-3 rounded bg-[#f59e0b]" />
                <span>Dalam pengerjaan</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <span className="w-3 h-3 rounded border border-dashed border-blue-400/70" />
                <span>Belum dikerjakan</span>
              </div>
            </>
          )}
        </div>

        {withZoomButtons && zoomButtons}
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`space-y-4 ${isFullscreen ? 'bg-[#0b1526] p-4 overflow-auto' : ''}`}
    >
      {/* Viewer: informasi proyek umum di bagian paling atas */}
      {isViewer && project && <ProjectInfoCard project={project} />}

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0f2444] border border-[#1e3454] p-4 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold text-white tracking-wide flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-400" />
              <span>{isViewer ? 'Model 3D As-Planned' : 'Perbandingan 3D: Plan vs Actual'}</span>
            </h1>
            <span className="text-[11px] bg-blue-500/20 text-blue-400 font-bold px-2 py-0.5 rounded-full border border-blue-500/40">
              {projectType}
            </span>
          </div>
          <p className="text-xs text-[#9fb0c8] mt-0.5">
            {projectName}
            {!isViewer && ' · Kamera kedua panel tersinkron'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetCamera}
            className="px-3 py-1.5 rounded-lg bg-[#102544] border border-[#1e3454] text-xs text-white hover:border-blue-500 flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            title="Reset posisi kamera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Kamera</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAutoSpin(!isAutoSpin)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              isAutoSpin
                ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                : 'bg-[#102544] border-[#1e3454] text-[#9fb0c8] hover:text-white'
            }`}
            title="Putar otomatis 360°"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoSpin ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isAutoSpin ? 'Putar Aktif' : 'Putar 360°'}</span>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh'}</span>
          </button>
        </div>
      </div>

      {/* SHARED TOOLBAR */}
      <div className="bg-[#102544] border border-[#1e3454] rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 bg-[#0b1526] p-0.5 rounded-lg border border-[#1e3454]">
          {(['iso', 'front', 'side', 'top'] as const).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setCameraPreset(view)}
              className="px-2 py-0.5 rounded text-[10.5px] font-bold uppercase text-[#9fb0c8] hover:text-white hover:bg-[#102544] transition-colors cursor-pointer"
            >
              {view}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowWireframe(!showWireframe)}
            className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
              showWireframe ? 'bg-blue-500/20 text-blue-400 border-blue-400' : 'bg-[#0b1526] text-[#9fb0c8] border-[#1e3454]'
            }`}
          >
            <Grid3X3 className="w-3 h-3" /> Wireframe
          </button>
          <button
            type="button"
            onClick={() => setShowXRay(!showXRay)}
            className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
              showXRay ? 'bg-purple-500/20 text-purple-300 border-purple-400' : 'bg-[#0b1526] text-[#9fb0c8] border-[#1e3454]'
            }`}
          >
            <Eye className="w-3 h-3" /> X-Ray
          </button>
        </div>

        <div className="flex items-center gap-3">
          {(['struktur', 'arsitektur', 'mep'] as const).map((k) => (
            <label key={k} className="flex items-center gap-1.5 cursor-pointer text-white font-medium capitalize">
              <input
                type="checkbox"
                checked={visibleLayers[k]}
                onChange={(e) => setVisibleLayers({ ...visibleLayers, [k]: e.target.checked })}
                className="rounded border-[#1e3454] text-blue-600 focus:ring-0"
              />
              {k === 'mep' ? 'MEP' : k}
            </label>
          ))}
        </div>

        {!isBridge && (
          <div className="flex items-center gap-2">
            <span className="text-[#9fb0c8] text-[11px] font-semibold">Lantai:</span>
            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
              className="bg-[#0b1526] border border-[#1e3454] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Lantai</option>
              <option value="Pondasi">Pondasi / Basemen</option>
              <option value="Lantai 1">Lantai 1 (Lobi)</option>
              <option value="Lantai 2">Lantai 2 (Mezzanine)</option>
              <option value="Lantai 3">Lantai 3 (Tipikal)</option>
              <option value="Rooftop">Rooftop / Atap</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEWPORT(S) */}
      {isViewer ? (
        renderPanel('plan', true)
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
          {renderPanel('plan', false)}
          {renderPanel('actual', true)}
        </div>
      )}

      <div className="text-[10.5px] text-[#9fb0c8] flex items-center gap-2 px-1">
        <Compass className="w-3.5 h-3.5 text-blue-400" />
        <span><b>Klik Kiri &amp; Seret:</b> Putar 3D · <b>Scroll:</b> Zoom · <b>Shift+Seret / Klik Kanan:</b> Geser (Pan)</span>
      </div>
    </div>
  );
};
