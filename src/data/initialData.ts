import { ProjectInfo, WorkItem, FloorItem, IssueItem, UserAccount, Submission, UserRegistration } from '../types';

export const INITIAL_PROJECTS: ProjectInfo[] = [
  {
    id: "menara-kemang",
    name: "Proyek Pembangunan Gedung Kementrian PU Timor Leste",
    location: "Dili, Timor Leste",
    lat: -8.5569,
    lng: 125.5603,
    client: "Kementerian PU Timor Leste",
    phase: "Konstruksi",
    type: "Gedung Pemerintahan",
    year: 2026,
    contractor: "PT Nusa Konstruksi Enjiniring",
    fund: "Hibah",
    period: "Jan 2026 – Mar 2027",
    actual: 63,
    plan: 76,
    openIssues: 7,
    statusApproval: 'Disetujui'
  },
  {
    id: "proyek-jakarta",
    name: "Proyek Pembangunan Gedung Kantor Pusat NKE",
    location: "Jakarta, Indonesia",
    lat: -6.2088,
    lng: 106.8456,
    client: "PT Nusa Konstruksi Enjiniring Tbk",
    phase: "Konstruksi",
    type: "Gedung Perkantoran",
    year: 2025,
    contractor: "PT Nusa Konstruksi Enjiniring",
    fund: "Swasta",
    period: "Mar 2025 – Des 2026",
    actual: 45,
    plan: 47,
    openIssues: 3,
    statusApproval: 'Disetujui'
  },
  {
    id: "proyek-jembatan",
    name: "Proyek Pembangunan Jembatan Suramadu Akses II",
    location: "Surabaya, Indonesia",
    lat: -7.2575,
    lng: 112.7521,
    client: "Kementerian PUPR Ditjen Bina Marga",
    phase: "Struktur",
    type: "Jembatan",
    year: 2026,
    contractor: "PT Nusa Konstruksi Enjiniring",
    fund: "APBN",
    period: "Feb 2026 – Nov 2026",
    actual: 82,
    plan: 80,
    openIssues: 1,
    statusApproval: 'Disetujui'
  },
  {
    id: "proyek-ikn",
    name: "Proyek Fasilitas Layanan Gedung Terpadu IKN",
    location: "Sepaku, Penajam Paser Utara, Nusantara",
    lat: -0.9632,
    lng: 116.7024,
    client: "Otorita Ibu Kota Nusantara",
    phase: "Selesai",
    type: "Gedung Pemerintahan",
    year: 2024,
    contractor: "PT Nusa Konstruksi Enjiniring",
    fund: "APBN",
    period: "Jan 2024 – Des 2024",
    actual: 100,
    plan: 100,
    openIssues: 0,
    statusApproval: 'Disetujui'
  }
];

export const INITIAL_USERS: Record<string, UserAccount> = {
  admin: {
    id: 'admin',
    email: 'admin@nke.co.id',
    name: 'Administrator BIM',
    title: 'BIM Manager & Lead Coordinator',
    pos: 'Head Office',
    role: 'admin',
    pw: 'admin123',
    projects: ['menara-kemang', 'proyek-jakarta', 'proyek-jembatan', 'proyek-ikn']
  },
  user: {
    id: 'user',
    email: 'staf.kemang@nke.co.id',
    name: 'Staf Proyek (Ada Proyek)',
    title: 'BIM Modeler & Field Engineer',
    pos: 'Proyek Lapangan (Dili)',
    role: 'user',
    pw: 'user123',
    projects: ['menara-kemang']
  },
  userbaru: {
    id: 'userbaru',
    email: 'staf.baru@nke.co.id',
    name: 'Staf Proyek Baru (Belum Ada Proyek)',
    title: 'Site Engineer',
    pos: 'Divisi Operasional Lapangan',
    role: 'user',
    pw: 'user123',
    projects: [] // Intentionally empty so button plus is immediately visible!
  }
};

export const INITIAL_WORKS: WorkItem[] = [
  { name: "Pekerjaan Struktur",   start: 1, end: 10, plan: 90, actual: 82 },
  { name: "Pekerjaan Arsitektur", start: 3, end: 11, plan: 70, actual: 58 },
  { name: "Pekerjaan MEP",        start: 4, end: 12, plan: 65, actual: 48 },
  { name: "Pekerjaan Fasad",      start: 5, end: 11, plan: 50, actual: 41 },
  { name: "Pekerjaan Finishing",  start: 8, end: 12, plan: 30, actual: 18 }
];

export const INITIAL_FLOORS: FloorItem[] = [
  { name: "Lt 4", value: 58, status: "bad" },
  { name: "Lt 3", value: 78, status: "warn" },
  { name: "Lt 2", value: 92, status: "ok" },
  { name: "Lt 1", value: 100, status: "ok" }
];

export const INITIAL_ISSUES: IssueItem[] = [
  {
    id: "ISSUE-014",
    title: "Clash: Duct AC vs Balok B4-12",
    location: "Lt 4 · Zona B",
    source: "Clash Detection (Navisworks)",
    category: "MEP vs Struktur",
    status: "Belum ditindaklanjuti",
    severity: "bad",
    pic: "Tim MEP",
    due: "2 Okt 2026",
    pin: { floorIndex: 0, zoneIndex: 1 }
  },
  {
    id: "ISSUE-013",
    title: "Kerataan lantai Lt 4 di luar toleransi",
    location: "Lt 4 · Zona A",
    source: "Manual (QC lapangan)",
    category: "Arsitektur",
    status: "Ditindaklanjuti",
    severity: "warn",
    pic: "Pelaksana",
    due: "3 Okt 2026",
    pin: { floorIndex: 0, zoneIndex: 0 }
  },
  {
    id: "ISSUE-012",
    title: "Angkur curtain wall Lt 2 perlu perbaikan",
    location: "Lt 2 · Zona A",
    source: "Manual",
    category: "Fasad",
    status: "Ditindaklanjuti",
    severity: "warn",
    pic: "Tim Fasad",
    due: "1 Okt 2026",
    pin: { floorIndex: 2, zoneIndex: 0 }
  }
];

export const SCURVE_DATA = {
  plan:   [0, 3, 8, 15, 24, 34, 45, 56, 66, 76, 85, 93, 100],
  actual: [0, 2, 6, 12, 20, 29, 38, 47, 55, 63, null, null, null]
};

export const PERIODS = ["M-1","M-2","M-3","M-4","M-5","M-6","M-7","M-8","M-9","M-10","M-11","M-12"];

export const DATA_CATEGORIES = [
  { id: "proyek",  name: "Data & lokasi proyek",  mod: "Portfolio & Peta", req: "Wajib",   ext: [".xlsx", ".csv", ".json"],
    desc: "Nama, klien, jenis infrastruktur, koordinat, kontraktor, sumber dana, tahun, masa pelaksanaan.", extra: [], ph: "Contoh: Data induk proyek" },
  { id: "model",   name: "Model 3D (IFC/GLB)",    mod: "Modul 01 · 02",    req: "Wajib",   ext: [".ifc", ".glb", ".gltf"],
    desc: "Model BIM untuk viewer 3D online di browser.", extra: ["ver"], ph: "Contoh: Model struktur Lt 1–4" },
  { id: "jadwal",  name: "Jadwal proyek",         mod: "Modul 01 · 06",    req: "Wajib",   ext: [".xlsx", ".xls", ".csv", ".mpp", ".xer"],
    desc: "Jadwal dan durasi pekerjaan untuk 4D simulation dan Kurva S rencana.", extra: ["ver"], ph: "Contoh: Jadwal induk Rev.02" },
  { id: "progres", name: "Data progres lapangan", mod: "Modul 01 · 07 · 08", req: "Berkala", ext: [".xlsx", ".xls", ".csv"],
    desc: "Progres rencana vs aktual per periode beserta bobot pekerjaan (dasar KPI dan SPI).", extra: ["per"], ph: "Contoh: Progres mingguan M-9" },
  { id: "dokumen", name: "Dokumen register",      mod: "Modul 03",         req: "Berkala", ext: [".pdf", ".docx", ".xlsx", ".dwg"],
    desc: "Dokumen proyek yang tertaut ke elemen atau lokasi pada model 3D.", extra: ["loc"], ph: "Contoh: Shop drawing balok B4-12" },
  { id: "issue",   name: "Issue (BCF)",           mod: "Modul 04",         req: "Opsional", ext: [".bcf", ".bcfzip"],
    desc: "Impor issue dari Navisworks atau aplikasi BIM lain. Issue manual diinput langsung di menu Issue.", extra: ["loc"], ph: "Contoh: Issue koordinasi MEP" },
  { id: "clash",   name: "Hasil clash detection", mod: "Modul 05",         req: "Berkala", ext: [".xml", ".bcf", ".bcfzip"],
    desc: "Hasil Navisworks Clash Detective (XML atau BCF).", extra: ["ver"], ph: "Contoh: Clash MEP vs Struktur" },
  { id: "foto",    name: "Foto progres",          mod: "Modul 07",         req: "Berkala", ext: [".jpg", ".jpeg", ".png"],
    desc: "Dokumentasi kondisi lapangan per periode.", extra: ["per", "loc"], ph: "Contoh: Pengecoran pelat Lt 4" },
  { id: "laporan", name: "Laporan berkala",       mod: "Modul 07 · 08",    req: "Berkala", ext: [".pdf", ".docx"],
    desc: "Laporan mingguan atau bulanan proyek.", extra: ["per"], ph: "Contoh: Laporan mingguan M-9" }
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: "u1727740001",
    project: "menara-kemang",
    cat: "Data & lokasi proyek",
    catId: "proyek",
    title: "Data Induk Proyek Timor Leste Rev.01",
    file: "master_data_proyek_tl.xlsx",
    size: 245000,
    by: "Staf Proyek (Ada Proyek)",
    at: "28 Sep 2026, 14.30",
    status: "Disetujui",
    decidedBy: "Administrator BIM",
    note: "Data lengkap dan sesuai verifikasi lapangan"
  },
  {
    id: "u1727740002",
    project: "menara-kemang",
    cat: "Model 3D (IFC/GLB)",
    catId: "model",
    title: "Model Struktur Lt 1–4 Final",
    file: "gedung_pu_struktur.ifc",
    size: 14200000,
    by: "Staf Proyek (Ada Proyek)",
    at: "29 Sep 2026, 10.15",
    status: "Disetujui",
    decidedBy: "Administrator BIM",
    note: "Validasi geometri IFC4 lolos",
    ver: "Rev.02"
  },
  {
    id: "u1727740003",
    project: "menara-kemang",
    cat: "Data progres lapangan",
    catId: "progres",
    title: "Laporan Progres Mingguan M-9",
    file: "progres_m9_kemang.xlsx",
    size: 512000,
    by: "Staf Proyek (Ada Proyek)",
    at: "30 Sep 2026, 16.45",
    status: "Menunggu",
    per: "M-9"
  }
];

export const INITIAL_REGISTRATIONS: UserRegistration[] = [
  {
    id: "r1727750001",
    email: "budi.santoso@nke.co.id",
    name: "Budi Santoso",
    title: "MEP Coordinator",
    pos: "Proyek Bendungan Ciawi",
    pw: "budi12345",
    at: "30 Sep 2026, 18.20",
    status: "Menunggu"
  }
];
