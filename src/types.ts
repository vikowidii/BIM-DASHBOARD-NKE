export type Role = 'admin' | 'user' | 'viewer';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  title: string;
  pos: string;
  role: Role;
  pw?: string;
  projects: string[]; // project IDs assigned to this user
}

export interface UserRegistration {
  id: string;
  email: string;
  name: string;
  title: string;
  pos: string;
  pw: string;
  at: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  decidedBy?: string;
  note?: string;
}

export interface ProjectInfo {
  id: string;
  name: string;
  location: string;
  lat: number;
  lng: number;
  client: string;
  phase: string;
  type: string;
  year: number;
  contractor: string;
  fund: string;
  period: string;
  actual: number;
  plan: number;
  openIssues: number;
  createdBy?: string;
  createdById?: string;
  statusApproval?: 'Menunggu' | 'Disetujui' | 'Ditolak';
  decidedBy?: string;
  note?: string;
}

export interface WorkItem {
  name: string;
  start: number;
  end: number;
  plan: number;
  actual: number;
}

export interface FloorItem {
  name: string;
  value: number;
  status: 'ok' | 'warn' | 'bad' | 'done';
}

export interface IssueItem {
  id: string;
  title: string;
  location: string;
  source: string;
  category: string;
  status: 'Belum ditindaklanjuti' | 'Ditindaklanjuti' | 'Selesai';
  severity: 'ok' | 'warn' | 'bad';
  pic: string;
  due: string;
  pin: { floorIndex: number; zoneIndex: number };
}

export interface Submission {
  id: string;
  project: string;
  cat: string;
  catId: string;
  title: string;
  file: string;
  size: number;
  by: string;
  at: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  decidedBy?: string;
  note?: string;
  per?: string;
  ver?: string;
  loc?: string;
}

export interface AppNotification {
  id: string;
  type: 'registration' | 'submission' | 'project' | 'change' | 'info';
  title: string;
  subtitle: string;
  at: string;
  read: boolean;
  targetId?: string; // registration ID, submission ID, or project ID
  actionRole?: Role;
  status?: 'Menunggu' | 'Disetujui' | 'Ditolak';
}

// Permintaan perubahan data akun/profil dari User. Baru berlaku setelah disetujui Admin.
export interface ChangeRequest {
  id: string;
  userId: string;
  userName: string;
  kind: 'profile' | 'account';
  // profile: name/title/pos | account: email dan/atau pw baru
  payload: { name?: string; title?: string; pos?: string; email?: string; pw?: string };
  at: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  decidedBy?: string;
  note?: string;
}
