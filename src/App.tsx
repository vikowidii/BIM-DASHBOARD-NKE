import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ProjectInfo, 
  UserAccount, 
  UserRegistration, 
  Submission, 
  AppNotification,
  WorkItem,
  FloorItem,
  IssueItem,
  ChangeRequest
} from './types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_USERS, 
  INITIAL_WORKS, 
  INITIAL_FLOORS, 
  INITIAL_ISSUES, 
  SCURVE_DATA, 
  PERIODS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_REGISTRATIONS 
} from './data/initialData';
import { Header } from './components/Header';
import { PortfolioMap } from './components/PortfolioMap';
import { ProjectDashboard } from './components/ProjectDashboard';
import { Project3DModel } from './components/Project3DModel';
import { ProjectIssues } from './components/ProjectIssues';
import { ProjectProgress } from './components/ProjectProgress';
import { ProjectDocuments } from './components/ProjectDocuments';
import { UploadView } from './components/UploadView';
import { ApprovalView } from './components/ApprovalView';
import { AddProjectModal } from './components/AddProjectModal';
import { AuthModal } from './components/AuthModal';
import { 
  LayoutDashboard, 
  Box, 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  UploadCloud, 
  CheckSquare, 
  ArrowLeft,
  Plus
} from 'lucide-react';

// Tampilan pertama setiap website dibuka selalu sebagai Tamu / Viewer
const GUEST_USER: UserAccount = {
  id: 'guest',
  email: '',
  name: 'Tamu / Viewer',
  title: 'Publik / Peninjau',
  pos: 'Tamu',
  role: 'viewer',
  projects: []
};

export default function App() {
  // Storage Keys
  const S_USERS = 'nke_bim_users_v2';
  const S_CHANGES = 'nke_bim_changes_v2';
  const S_PROJECTS = 'nke_bim_projects_v2';
  const S_SUBS = 'nke_bim_submissions_v2';
  const S_REGS = 'nke_bim_registrations_v2';
  const S_NOTIFS = 'nke_bim_notifs_v2';

  // State: Users & Session
  const [users, setUsers] = useState<Record<string, UserAccount>>(() => {
    try {
      const saved = localStorage.getItem(S_USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  // Sesi TIDAK dipulihkan: setiap website dibuka selalu mulai sebagai Viewer
  const [currentUser, setCurrentUser] = useState<UserAccount>(GUEST_USER);

  // State: permintaan perubahan akun/profil (menunggu persetujuan Admin)
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>(() => {
    try {
      const saved = localStorage.getItem(S_CHANGES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State: Projects
  const [projects, setProjects] = useState<ProjectInfo[]>(() => {
    try {
      const saved = localStorage.getItem(S_PROJECTS);
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  // State: Submissions
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const saved = localStorage.getItem(S_SUBS);
      return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  // State: Account Registrations
  const [registrations, setRegistrations] = useState<UserRegistration[]>(() => {
    try {
      const saved = localStorage.getItem(S_REGS);
      return saved ? JSON.parse(saved) : INITIAL_REGISTRATIONS;
    } catch {
      return INITIAL_REGISTRATIONS;
    }
  });

  // State: Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(S_NOTIFS);
      return saved ? JSON.parse(saved) : [
        {
          id: 'notif-1',
          type: 'info',
          title: 'Selamat Datang di NKE BIM Dashboard',
          subtitle: 'Sistem manajemen model 3D, Kurva S, dan pemantauan konstruksi proyek terpadu.',
          at: 'Hari ini',
          read: false
        }
      ];
    } catch {
      return [];
    }
  });

  // Navigation State
  const [activeView, setActiveView] = useState<'portfolio' | 'project'>('portfolio');
  const [activeProjectId, setActiveProjectId] = useState<string>('menara-kemang');
  const [activeProjectTab, setActiveProjectTab] = useState<string>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('M-9');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('ISSUE-014');

  // Modals & Feedback
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  // Persist State to localStorage
  useEffect(() => {
    try { localStorage.setItem(S_USERS, JSON.stringify(users)); } catch {}
  }, [users]);

  useEffect(() => {
    try { localStorage.setItem(S_CHANGES, JSON.stringify(changeRequests)); } catch {}
  }, [changeRequests]);

  useEffect(() => {
    try { localStorage.setItem(S_PROJECTS, JSON.stringify(projects)); } catch {}
  }, [projects]);

  useEffect(() => {
    try { localStorage.setItem(S_SUBS, JSON.stringify(submissions)); } catch {}
  }, [submissions]);

  useEffect(() => {
    try { localStorage.setItem(S_REGS, JSON.stringify(registrations)); } catch {}
  }, [registrations]);

  useEffect(() => {
    try { localStorage.setItem(S_NOTIFS, JSON.stringify(notifications)); } catch {}
  }, [notifications]);

  // Fallback for viewer role: never allow dashboard or progress
  useEffect(() => {
    if (currentUser.role === 'viewer' && (activeProjectTab === 'dashboard' || activeProjectTab === 'progres')) {
      setActiveProjectTab('model3d');
    }
  }, [currentUser.role, activeProjectTab]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3200);
  };

  // Proyek yang belum disetujui Admin hanya terlihat oleh Admin dan pembuatnya.
  // Viewer / Tamu hanya melihat proyek yang sudah disetujui.
  const accessibleProjects = projects.filter((p) => {
    const st = p.statusApproval ?? 'Disetujui';
    if (st !== 'Disetujui') {
      return currentUser.role === 'admin' || (!!p.createdById && p.createdById === currentUser.id);
    }
    if (currentUser.role === 'admin' || currentUser.role === 'viewer') return true;
    return currentUser.projects.includes(p.id);
  });

  const currentProject =
    accessibleProjects.find((p) => p.id === activeProjectId) ||
    accessibleProjects[0] ||
    projects.find((p) => (p.statusApproval ?? 'Disetujui') === 'Disetujui') ||
    projects[0];

  // Jika proyek aktif tidak lagi boleh diakses (mis. setelah keluar akun), kembali ke peta
  useEffect(() => {
    if (activeView === 'project' && !accessibleProjects.some((p) => p.id === activeProjectId)) {
      setActiveView('portfolio');
    }
  }, [activeView, activeProjectId, currentUser, projects]);

  // Helper: Open project view
  const handleOpenProject = (id: string, targetTab: string = 'dashboard') => {
    const targetP = accessibleProjects.find((p) => p.id === id);
    if (!targetP) return;

    if (currentUser.role === 'user' && !currentUser.projects.includes(id)) {
      showToast('Anda belum memiliki hak akses untuk proyek ini.');
      return;
    }

    // Viewer requirement: langsung masuk menuju area gambar 1 (3D Model), tanpa dashboard lanjutan
    const initialTab = currentUser.role === 'viewer' ? 'model3d' : targetTab;
    setActiveProjectId(id);
    setActiveProjectTab(initialTab);
    setActiveView('project');
  };

  // Helper: Add Project. User -> menunggu persetujuan Admin. Admin -> langsung aktif.
  const handleAddProject = (newProject: ProjectInfo) => {
    if (currentUser.role === 'viewer') return;
    const isAdmin = currentUser.role === 'admin';

    const project: ProjectInfo = {
      ...newProject,
      createdBy: currentUser.name,
      createdById: currentUser.id,
      statusApproval: isAdmin ? 'Disetujui' : 'Menunggu'
    };

    setProjects((prev) => [project, ...prev]);

    if (currentUser.role === 'user') {
      const updatedUser = { ...currentUser, projects: [...currentUser.projects, project.id] };
      setCurrentUser(updatedUser);
      setUsers((prev) => ({ ...prev, [currentUser.id]: updatedUser }));
    }

    if (isAdmin) {
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'project',
          title: `Proyek Baru Terdaftar: ${project.name}`,
          subtitle: `Lokasi: ${project.location} · Klien: ${project.client}`,
          at: 'Baru saja',
          read: false
        },
        ...prev
      ]);
    }

    setActiveProjectId(project.id);
    setActiveProjectTab('dashboard');
    setActiveView('project');
    showToast(
      isAdmin
        ? `Proyek ${project.name} berhasil ditambahkan!`
        : `Proyek ${project.name} dikirim dan menunggu persetujuan Admin.`
    );
  };

  // Helper: Approve / Reject Project (Admin)
  const handleApproveProject = (id: string) => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, statusApproval: 'Disetujui', decidedBy: currentUser.name, note: undefined } : p))
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'project',
        title: `Proyek Disetujui: ${proj.name}`,
        subtitle: `Disetujui oleh ${currentUser.name}. Proyek kini tampil di peta publik.`,
        at: 'Baru saja',
        read: false,
        targetId: id
      },
      ...prev
    ]);
    showToast(`Proyek "${proj.name}" disetujui.`);
  };

  const handleRejectProject = (id: string, note?: string) => {
    const proj = projects.find((p) => p.id === id);
    if (!proj) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, statusApproval: 'Ditolak', decidedBy: currentUser.name, note } : p))
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'project',
        title: `Proyek Ditolak: ${proj.name}`,
        subtitle: note ? `Alasan: ${note}` : 'Proyek ditolak oleh Admin.',
        at: 'Baru saja',
        read: false
      },
      ...prev
    ]);
    showToast(`Proyek "${proj.name}" ditolak.`);
  };

  // Helper: Approve / Reject perubahan akun & profil (Admin)
  const handleApproveChange = (id: string) => {
    const req = changeRequests.find((r) => r.id === id);
    if (!req) return;
    setUsers((prev) => {
      const u = prev[req.userId];
      if (!u) return prev;
      const updated: UserAccount =
        req.kind === 'profile'
          ? { ...u, name: req.payload.name ?? u.name, title: req.payload.title ?? u.title, pos: req.payload.pos ?? u.pos }
          : { ...u, email: req.payload.email || u.email, pw: req.payload.pw || u.pw };
      return { ...prev, [req.userId]: updated };
    });
    setChangeRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Disetujui', decidedBy: currentUser.name } : r))
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'change',
        title: `Perubahan ${req.kind === 'profile' ? 'Profil' : 'Akun'} Disetujui: ${req.userName}`,
        subtitle: `Disetujui oleh ${currentUser.name}. Berlaku pada login berikutnya.`,
        at: 'Baru saja',
        read: false
      },
      ...prev
    ]);
    showToast(`Perubahan ${req.userName} disetujui.`);
  };

  const handleRejectChange = (id: string, note?: string) => {
    const req = changeRequests.find((r) => r.id === id);
    if (!req) return;
    setChangeRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Ditolak', decidedBy: currentUser.name, note } : r))
    );
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'change',
        title: `Perubahan ${req.kind === 'profile' ? 'Profil' : 'Akun'} Ditolak: ${req.userName}`,
        subtitle: note ? `Alasan: ${note}` : 'Perubahan ditolak oleh Admin.',
        at: 'Baru saja',
        read: false
      },
      ...prev
    ]);
    showToast(`Perubahan ${req.userName} ditolak.`);
  };

  // Helper: Approve Registration from Bell
  const handleApproveRegistration = (id: string) => {
    const reg = registrations.find((r) => r.id === id);
    if (!reg) return;

    // Create user account
    const newUser: UserAccount = {
      id: reg.email,
      email: reg.email,
      name: reg.name,
      title: reg.title,
      pos: reg.pos,
      role: 'user',
      pw: reg.pw,
      projects: [] // initially empty, so they can use the (+) button to add projects!
    };

    setUsers((prev) => ({
      ...prev,
      [newUser.id]: newUser
    }));

    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Disetujui', decidedBy: currentUser.name } : r))
    );

    // Add notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'registration',
        title: `Pendaftaran Disetujui: ${reg.name}`,
        subtitle: `Akun aktif dengan peran User (${reg.email}).`,
        at: 'Baru saja',
        read: false
      },
      ...prev
    ]);

    showToast(`Akun ${reg.name} berhasil disetujui.`);
  };

  // Helper: Reject Registration from Bell
  const handleRejectRegistration = (id: string, note?: string) => {
    const reg = registrations.find((r) => r.id === id);
    if (!reg) return;

    setRegistrations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Ditolak', decidedBy: currentUser.name, note } : r))
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'registration',
        title: `Pendaftaran Ditolak: ${reg.name}`,
        subtitle: note ? `Alasan: ${note}` : 'Pendaftaran ditolak oleh Admin.',
        at: 'Baru saja',
        read: false
      },
      ...prev
    ]);

    showToast(`Pendaftaran ${reg.name} ditolak.`);
  };

  // Helper: Approve Submission
  const handleApproveSubmission = (id: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Disetujui', decidedBy: currentUser.name } : s))
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'submission',
        title: `Data Disetujui: ${sub.title}`,
        subtitle: `Disetujui oleh ${currentUser.name}. Berkas telah masuk ke dokumen resmi proyek.`,
        at: 'Baru saja',
        read: false
      },
      ...prev
    ]);

    showToast(`Data "${sub.title}" disetujui.`);
  };

  // Helper: Reject Submission
  const handleRejectSubmission = (id: string, note?: string) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Ditolak', decidedBy: currentUser.name, note } : s))
    );

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'submission',
        title: `Data Ditolak: ${sub.title}`,
        subtitle: note ? `Alasan penolakan: ${note}` : 'Data ditolak oleh Admin.',
        at: 'Baru saja',
        read: false
      },
      ...prev
    ]);

    showToast(`Data "${sub.title}" ditolak.`);
  };

  // Helper: Upload file submission
  const handleSubmitFile = (subData: Omit<Submission, 'id' | 'at' | 'status'>) => {
    const newSub: Submission = {
      ...subData,
      id: `u${Date.now()}`,
      at: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Menunggu'
    };

    setSubmissions((prev) => [newSub, ...prev]);

    showToast('Berkas dikirim dan menunggu persetujuan Admin.');
  };

  // Helper: Delete submission
  const handleDeleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
    showToast('Unggahan berhasil dihapus.');
  };

  // Helper: Register new user
  const handleRegisterUser = (regData: Omit<UserRegistration, 'id' | 'at' | 'status'>) => {
    const email = regData.email.trim().toLowerCase();
    
    // Security policy: Valid @gmail.com email required
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      return { 
        success: false, 
        msg: 'Kebijakan Keamanan: Pendaftaran sementara hanya diizinkan untuk akun email valid berdomain @gmail.com.' 
      };
    }

    // Check if email already registered
    const exists = Object.values(users).some((u) => u.email.toLowerCase() === email);
    if (exists) {
      return { success: false, msg: 'Email ini sudah terdaftar. Silakan masuk.' };
    }

    const newReg: UserRegistration = {
      ...regData,
      id: `r${Date.now()}`,
      at: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Menunggu'
    };

    setRegistrations((prev) => [newReg, ...prev]);

    return { success: true, msg: 'Pendaftaran berhasil dikirim. Akun aktif setelah disetujui Admin pada lonceng notifikasi.' };
  };

  // Helper: Login
  const handleLogin = (userKey: string, pw: string) => {
    const key = userKey.toLowerCase().trim();
    // Search by key or email
    const foundUser = Object.values(users).find(
      (u) => u.id.toLowerCase() === key || u.email.toLowerCase() === key
    );

    if (!foundUser || foundUser.pw !== pw) {
      // Check if registration is still pending
      const pendingReg = registrations.find((r) => r.email.toLowerCase() === key && r.pw === pw);
      if (pendingReg && pendingReg.status === 'Menunggu') {
        return { success: false, msg: 'Akun Anda masih menunggu persetujuan Admin pada lonceng notifikasi.' };
      }
      if (pendingReg && pendingReg.status === 'Ditolak') {
        return { success: false, msg: `Pendaftaran Anda ditolak: ${pendingReg.note || 'Hubungi Admin'}` };
      }
      return { success: false, msg: 'Username/email atau password salah.' };
    }

    setCurrentUser(foundUser);
    showToast(`Selamat datang kembali, ${foundUser.name}!`);
    return { success: true, msg: 'Login berhasil.' };
  };

  // Helper: Guest Login
  const handleGuestLogin = () => {
    setCurrentUser(GUEST_USER);
    showToast('Masuk dalam mode Tamu / Viewer.');
  };

  // Helper: Logout
  const handleLogout = () => {
    handleGuestLogin();
    setIsAuthOpen(true);
  };

  // Helper: Update Profile. Admin langsung berlaku; User harus menunggu persetujuan Admin.
  const submitChangeRequest = (kind: ChangeRequest['kind'], payload: ChangeRequest['payload']) => {
    const req: ChangeRequest = {
      id: `c${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      kind,
      payload,
      at: new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }),
      status: 'Menunggu'
    };
    // Satu permintaan aktif per jenis: yang lama yang masih menunggu digantikan
    setChangeRequests((prev) => [
      req,
      ...prev.filter((r) => !(r.userId === currentUser.id && r.kind === kind && r.status === 'Menunggu'))
    ]);
  };

  const handleUpdateProfile = (name: string, title: string, pos: string): { msg: string } => {
    if (currentUser.role === 'viewer') return { msg: 'Masuk dengan akun terdaftar untuk mengubah profil.' };
    if (currentUser.role === 'admin') {
      const updated = { ...currentUser, name, title, pos };
      setCurrentUser(updated);
      setUsers((prev) => ({ ...prev, [currentUser.id]: updated }));
      showToast('Profil berhasil disimpan.');
      return { msg: 'Profil berhasil diperbarui.' };
    }
    submitChangeRequest('profile', { name, title, pos });
    showToast('Perubahan profil dikirim dan menunggu persetujuan Admin.');
    return { msg: 'Perubahan profil dikirim. Berlaku setelah disetujui Admin.' };
  };

  // Helper: Update Account Settings (email / password)
  const handleUpdateAccountSettings = (email: string, oldPw?: string, newPw?: string) => {
    if (currentUser.role === 'viewer') {
      return { success: false, msg: 'Masuk dengan akun terdaftar untuk mengubah pengaturan akun.' };
    }
    if (newPw && oldPw !== currentUser.pw) {
      return { success: false, msg: 'Password saat ini tidak cocok.' };
    }
    const newEmail = (email || '').trim();
    const emailChanged = !!newEmail && newEmail.toLowerCase() !== currentUser.email.toLowerCase();
    if (!emailChanged && !newPw) {
      return { success: false, msg: 'Tidak ada perubahan untuk disimpan.' };
    }
    if (emailChanged) {
      const taken = Object.values(users).some(
        (u) => u.id !== currentUser.id && u.email.toLowerCase() === newEmail.toLowerCase()
      );
      if (taken) return { success: false, msg: 'Email sudah dipakai akun lain.' };
    }

    if (currentUser.role === 'admin') {
      const updated: UserAccount = {
        ...currentUser,
        email: emailChanged ? newEmail : currentUser.email,
        pw: newPw || currentUser.pw
      };
      setCurrentUser(updated);
      setUsers((prev) => ({ ...prev, [currentUser.id]: updated }));
      return { success: true, msg: 'Pengaturan akun berhasil diperbarui.' };
    }

    submitChangeRequest('account', {
      email: emailChanged ? newEmail : undefined,
      pw: newPw || undefined
    });
    showToast('Perubahan akun dikirim dan menunggu persetujuan Admin.');
    return { success: true, msg: 'Perubahan akun dikirim. Berlaku setelah disetujui Admin.' };
  };

  return (
    <div className="min-h-screen bg-[#0b1526] text-white flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notification Popup */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[8000] bg-blue-600 text-white text-xs px-4 py-2.5 rounded-lg shadow-2xl border border-blue-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOPBAR HEADER (DENGAN LONCENG NOTIFIKASI SEMUA PERSETUJUAN & TANPA TAB PERSETUJUAN AKUN DI MENU) */}
      <Header
        currentUser={currentUser}
        notifications={notifications}
        pendingRegistrations={registrations.filter((r) => r.status === 'Menunggu')}
        pendingSubmissions={submissions.filter((s) => s.status === 'Menunggu')}
        pendingProjects={projects.filter((p) => p.statusApproval === 'Menunggu')}
        pendingChanges={changeRequests.filter((r) => r.status === 'Menunggu')}
        onApproveProject={handleApproveProject}
        onRejectProject={handleRejectProject}
        onApproveChange={handleApproveChange}
        onRejectChange={handleRejectChange}
        onApproveRegistration={handleApproveRegistration}
        onRejectRegistration={handleRejectRegistration}
        onApproveSubmission={handleApproveSubmission}
        onRejectSubmission={handleRejectSubmission}
        onMarkNotificationsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onOpenLogin={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onNavigateToTab={(tab) => {
          if (tab === 'portfolio') {
            setActiveView('portfolio');
          } else {
            setActiveView('project');
            setActiveProjectTab(tab);
          }
        }}
        onOpenProject={handleOpenProject}
        onUpdateProfile={handleUpdateProfile}
        onUpdateAccountSettings={handleUpdateAccountSettings}
      />

      {/* MAIN VIEW: PORTFOLIO MAP OR PROJECT DETAIL */}
      {activeView === 'portfolio' ? (
        <PortfolioMap
          projects={accessibleProjects}
          currentUser={currentUser}
          onOpenProject={handleOpenProject}
          onOpenAddProject={() => setIsAddProjectOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-66px)]">
          
          {/* SIDEBAR NAVIGATION (HANYA UNTUK NON-VIEWER) */}
          {currentUser.role !== 'viewer' && (
            <nav className="w-full md:w-56 bg-[#0f2444] border-r border-[#1e3454] p-3 md:py-5 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0 z-20">
              {[
                { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, iconColor: 'text-blue-400' },
                { id: 'model3d', label: '3D MODEL', icon: Box, iconColor: 'text-green-400' },
                { id: 'isu', label: 'ISSUE & CLASH', icon: AlertTriangle, iconColor: 'text-yellow-400' },
                { id: 'progres', label: 'PROGRESS', icon: TrendingUp, iconColor: 'text-purple-400' },
                { id: 'dokumen', label: 'DOKUMEN', icon: FileText, iconColor: 'text-blue-400' },
                ...(currentUser.role === 'user' ? [{ id: 'upload', label: 'UPLOAD DATA', icon: UploadCloud, iconColor: 'text-orange-400' }] : []),
                ...(currentUser.role === 'admin' ? [{ id: 'approval', label: 'PERSETUJUAN', icon: CheckSquare, iconColor: 'text-green-400' }] : [])
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeProjectTab === tab.id;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveProjectTab(tab.id)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wider text-left transition-colors duration-200 cursor-pointer overflow-hidden ${
                      isActive
                        ? 'text-white'
                        : 'text-[#9fb0c8] hover:text-white hover:bg-[#102544]/60'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebarIndicator"
                        className="absolute inset-0 bg-[#102544] border-l-4 border-l-blue-500 rounded-lg shadow-sm"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <Icon className={`w-4 h-4 ${tab.iconColor} relative z-10 shrink-0`} />
                    <span className="relative z-10">{tab.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          )}

          {/* PROJECT CONTENT AREA */}
          <main className="flex-1 p-4 md:p-7 overflow-y-auto">
            
            {/* CONTEXT BAR (Back Button, Project Selector, Period Selector) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-[#1e3454]">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveView('portfolio')}
                  className="px-3 py-2 rounded-lg bg-[#102544] hover:bg-[#1a355a] border border-[#1e3454] hover:border-blue-500 text-xs text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Kembali ke Peta Portofolio"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Semua Proyek</span>
                </button>

                <select
                  value={activeProjectId}
                  onChange={(e) => setActiveProjectId(e.target.value)}
                  className="bg-[#102544] border border-[#1e3454] rounded-lg px-3 py-2 text-xs md:text-sm text-white font-semibold max-w-xs md:max-w-md focus:outline-none focus:border-blue-500 truncate"
                >
                  {accessibleProjects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                {currentUser.role === 'viewer' ? (
                  <span className="px-3 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 text-xs font-semibold flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5" />
                    <span>Mode Peninjau</span>
                  </span>
                ) : (
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="bg-[#102544] border border-[#1e3454] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {PERIODS.map((p) => (
                      <option key={p} value={p}>Periode: {p}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* 
              REQUIREMENT UTAMA:
              "kalo viewer gabisa buka dashboard proyek hanya tampilan 3d view beserta 
              informasi proyek tanpa ada dokumen dan clash dll"
            */}
            {currentUser.role === 'viewer' ? (
              <Project3DModel project={currentProject} currentUser={currentUser} />
            ) : (
              /* SUBPAGES UNTUK PENGGUNA TEROTENTIKASI (ADMIN & USER) */
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeProjectTab}
                  initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(2px)' }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="w-full"
                >
                  {activeProjectTab === 'dashboard' && (
                    <ProjectDashboard
                      project={currentProject}
                      works={INITIAL_WORKS}
                      floors={INITIAL_FLOORS}
                      issues={INITIAL_ISSUES}
                      sCurve={SCURVE_DATA}
                      userRole={currentUser.role}
                      onNavigateToTab={(tab) => setActiveProjectTab(tab)}
                      onSelectIssue={(issueId) => setSelectedIssueId(issueId)}
                    />
                  )}

                  {activeProjectTab === 'model3d' && (
                    <Project3DModel project={currentProject} currentUser={currentUser} />
                  )}

                  {activeProjectTab === 'isu' && (
                    <ProjectIssues
                      floors={INITIAL_FLOORS}
                      issues={INITIAL_ISSUES}
                      selectedIssueId={selectedIssueId}
                      onSelectIssue={(id) => setSelectedIssueId(id)}
                    />
                  )}

                  {activeProjectTab === 'progres' && (
                    <ProjectProgress
                      works={INITIAL_WORKS}
                      sCurve={SCURVE_DATA}
                    />
                  )}

                  {activeProjectTab === 'dokumen' && (
                    <ProjectDocuments
                      documents={submissions.filter((s) => s.project === activeProjectId)}
                    />
                  )}

                  {activeProjectTab === 'upload' && (
                    <UploadView
                      projects={accessibleProjects}
                      currentProjectId={activeProjectId}
                      userName={currentUser.name}
                      submissions={submissions}
                      onSubmitFile={handleSubmitFile}
                      onDeleteSubmission={handleDeleteSubmission}
                    />
                  )}

                  {activeProjectTab === 'approval' && (
                    <ApprovalView
                      submissions={submissions}
                      projects={projects}
                      changeRequests={changeRequests}
                      onApprove={handleApproveSubmission}
                      onReject={handleRejectSubmission}
                      onApproveProject={handleApproveProject}
                      onRejectProject={handleRejectProject}
                      onApproveChange={handleApproveChange}
                      onRejectChange={handleRejectChange}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}

          </main>

        </div>
      )}

      {/* 
        ========================================================================
        REQUIREMENT UTAMA:
        "diakun user yang belum punya proyek tambahkan button plus untuk tambah 
        proyek di pojok kiri bawah, tampilan awalnya berisikan informasi proyek 
        terlebih dahulu jangan lupa titik lokasi proyeknya"
        ========================================================================
      */}
      <AddProjectModal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        onAddProject={handleAddProject}
        userName={currentUser.name}
      />

      {/* LOGIN & REGISTRATION MODAL */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegisterUser}
        onGuestLogin={handleGuestLogin}
      />

    </div>
  );
}
