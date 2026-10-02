import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, AppNotification, UserRegistration, Submission, ProjectInfo, ChangeRequest } from '../types';
import { 
  Bell, 
  User, 
  Check, 
  X, 
  FileUp, 
  UserCheck, 
  Building2, 
  LogOut, 
  LogIn, 
  Settings, 
  Info,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserAccount;
  notifications: AppNotification[];
  pendingRegistrations: UserRegistration[];
  pendingSubmissions: Submission[];
  pendingProjects: ProjectInfo[];
  pendingChanges: ChangeRequest[];
  onApproveProject: (id: string) => void;
  onRejectProject: (id: string, note?: string) => void;
  onApproveChange: (id: string) => void;
  onRejectChange: (id: string, note?: string) => void;
  onApproveRegistration: (id: string) => void;
  onRejectRegistration: (id: string, note?: string) => void;
  onApproveSubmission: (id: string) => void;
  onRejectSubmission: (id: string, note?: string) => void;
  onMarkNotificationsRead: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onNavigateToTab?: (tab: string) => void;
  onOpenProject?: (projectId: string) => void;
  onUpdateProfile: (name: string, title: string, pos: string) => { msg: string };
  onUpdateAccountSettings: (email: string, oldPw?: string, newPw?: string) => { success: boolean; msg: string };
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  notifications,
  pendingRegistrations,
  pendingSubmissions,
  pendingProjects,
  pendingChanges,
  onApproveProject,
  onRejectProject,
  onApproveChange,
  onRejectChange,
  onApproveRegistration,
  onRejectRegistration,
  onApproveSubmission,
  onRejectSubmission,
  onMarkNotificationsRead,
  onOpenLogin,
  onLogout,
  onNavigateToTab,
  onOpenProject,
  onUpdateProfile,
  onUpdateAccountSettings
}) => {
  // Clock state
  const [clockText, setClockText] = useState('');

  // Dropdown states
  const [isBellOpen, setIsBellOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenuTab, setActiveMenuTab] = useState<'profil' | 'akun'>('profil');

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editTitle, setEditTitle] = useState(currentUser.title);
  const [editPos, setEditPos] = useState(currentUser.pos);
  const [profileMsg, setProfileMsg] = useState('');

  // Account settings state
  const [accEmail, setAccEmail] = useState(currentUser.email);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [newPwConfirm, setNewPwConfirm] = useState('');
  const [accMsg, setAccMsg] = useState<{ type: 'ok' | 'bad'; text: string } | null>(null);

  const bellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync edit form on user change
  useEffect(() => {
    setEditName(currentUser.name);
    setEditTitle(currentUser.title);
    setEditPos(currentUser.pos);
    setAccEmail(currentUser.email);
  }, [currentUser]);

  // Real-time clock with Indonesian locale and Timezone (WIB/WITA/WIT)
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const pad = (n: number) => String(n).padStart(2, '0');
      const off = -d.getTimezoneOffset() / 60;
      const tzMap: Record<number, string> = { 7: 'WIB', 8: 'WITA', 9: 'WIT' };
      const tz = tzMap[off] || `GMT${off >= 0 ? '+' : ''}${off}`;
      setClockText(`${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} | ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${tz}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsBellOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Combine notifications
  // For Admin: include pending registrations & pending submissions as active notification items
  const adminPendingNotifs = currentUser.role === 'admin' ? [
    ...pendingRegistrations.map((r) => ({
      id: `reg-${r.id}`,
      type: 'registration' as const,
      title: `Pendaftaran Akun Baru: ${r.name}`,
      subtitle: `${r.title} · ${r.pos} · ${r.email}`,
      at: r.at,
      read: false,
      targetId: r.id,
      status: r.status
    })),
    ...pendingSubmissions.map((s) => ({
      id: `sub-${s.id}`,
      type: 'submission' as const,
      title: `Data Menunggu Persetujuan: ${s.title}`,
      subtitle: `${s.cat} (${s.file}) · Oleh ${s.by}`,
      at: s.at,
      read: false,
      targetId: s.id,
      status: s.status
    })),
    ...pendingProjects.map((p) => ({
      id: `proj-${p.id}`,
      type: 'project' as const,
      title: `Proyek Baru Menunggu Persetujuan: ${p.name}`,
      subtitle: `${p.type} · ${p.location} · Oleh ${p.createdBy || '-'}`,
      at: 'Menunggu',
      read: false,
      targetId: p.id,
      status: 'Menunggu' as const
    })),
    ...pendingChanges.map((c) => ({
      id: `chg-${c.id}`,
      type: 'change' as const,
      title: `Perubahan ${c.kind === 'profile' ? 'Profil' : 'Akun'} Menunggu Persetujuan: ${c.userName}`,
      subtitle:
        c.kind === 'profile'
          ? `Nama: ${c.payload.name} · Jabatan: ${c.payload.title} · Posisi: ${c.payload.pos}`
          : `${c.payload.email ? 'Email baru: ' + c.payload.email : ''}${c.payload.email && c.payload.pw ? ' · ' : ''}${c.payload.pw ? 'Ganti password' : ''}`,
      at: c.at,
      read: false,
      targetId: c.id,
      status: c.status
    }))
  ] : [];

  const allDisplayNotifs = [...adminPendingNotifs, ...notifications];
  const unreadCount = allDisplayNotifs.filter((n) => !n.read).length;

  const handleToggleBell = () => {
    setIsMenuOpen(false);
    const nextState = !isBellOpen;
    setIsBellOpen(nextState);
    if (nextState) {
      onMarkNotificationsRead();
    }
  };

  const handleToggleMenu = () => {
    setIsBellOpen(false);
    setIsMenuOpen(!isMenuOpen);
    setIsEditingProfile(false);
    setProfileMsg('');
    setAccMsg(null);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setProfileMsg('Nama lengkap tidak boleh kosong');
      return;
    }
    const res = onUpdateProfile(editName.trim(), editTitle.trim(), editPos.trim());
    setIsEditingProfile(false);
    setProfileMsg(res.msg);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw && newPw.length < 8) {
      setAccMsg({ type: 'bad', text: 'Password baru minimal 8 karakter.' });
      return;
    }
    if (newPw && newPw !== newPwConfirm) {
      setAccMsg({ type: 'bad', text: 'Konfirmasi password baru tidak cocok.' });
      return;
    }
    const res = onUpdateAccountSettings(accEmail.trim(), currentPw, newPw);
    setAccMsg({ type: res.success ? 'ok' : 'bad', text: res.msg });
    if (res.success) {
      setCurrentPw('');
      setNewPw('');
      setNewPwConfirm('');
    }
  };

  const roleLabels: Record<string, { label: string; desc: string }> = {
    admin: { label: 'Admin', desc: 'Menyetujui pendaftaran akun & data unggahan, mengelola seluruh portofolio.' },
    user: { label: 'User', desc: 'Mengunggah dan memantau progres proyek serta mendaftarkan proyek baru.' },
    viewer: { label: 'Viewer / Tamu', desc: 'Melihat peta portofolio, model 3D, dan informasi proyek publik.' }
  };

  return (
    <header className="flex justify-between items-center px-4 md:px-7 py-2.5 bg-[#0f2444] border-b border-[#1e3454] relative z-40">
      
      {/* Brand & Logo */}
      <div 
        onClick={() => onNavigateToTab?.('portfolio')}
        className="flex items-center gap-3.5 cursor-pointer select-none group"
      >
        {/* Official NKE Corporate Logo */}
        <div className="bg-white px-2.5 py-1 rounded-md shadow-sm border border-slate-200/30 flex items-center justify-center shrink-0 group-hover:scale-102 transition-transform">
          <img 
            src="/logo_nke.svg" 
            alt="Logo PT Nusa Konstruksi Enjiniring" 
            className="h-7 md:h-8 w-auto object-contain"
          />
        </div>
        
        <div className="flex flex-col">
          <span className="text-lg md:text-xl font-bold tracking-wider text-white group-hover:text-blue-400 transition-colors">
            NKE BIM DASHBOARD
          </span>
          <span className="text-[10px] text-[#9fb0c8] font-medium tracking-wider uppercase">
            PT Nusa Konstruksi Enjiniring
          </span>
        </div>
      </div>

      {/* Topbar Right (Clock, Bell Notifications, User Profile) */}
      <div className="flex items-center gap-4">
        
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#102544]/60 border border-[#1e3454] text-xs text-[#d7e3ec] font-mono tabular-nums">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>{clockText}</span>
        </div>

        {/* LONCENG hanya untuk akun User & Admin (tidak tampil untuk Tamu/Viewer) */}
        {currentUser.role !== 'viewer' && (
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={handleToggleBell}
              className={`relative p-2 rounded-lg border transition-all cursor-pointer ${
                isBellOpen 
                  ? 'bg-[#132c52] border-blue-500 text-white' 
                  : 'bg-[#102544] border-[#1e3454] text-[#9fb0c8] hover:text-white hover:border-blue-500'
              }`}
              title="Notifikasi & Persetujuan"
              aria-label="Notifikasi"
              aria-expanded={isBellOpen}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#0f2444] animate-bounce">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Bell Notification Panel */}
            {isBellOpen && (
              <div className="absolute right-0 mt-2.5 w-80 md:w-96 max-w-[calc(100vw-24px)] bg-[#102544] border border-[#1e3454] rounded-xl shadow-2xl overflow-hidden z-50 text-white animate-in fade-in slide-in-from-top-2 duration-150">
              
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e3454] bg-[#0d203d]">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold tracking-wide">Pusat Notifikasi</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
                      {unreadCount} baru
                    </span>
                  )}
                </div>

                {/* Notification List */}
                <div className="max-h-96 overflow-y-auto divide-y divide-[#1e3454]/60">
                  {allDisplayNotifs.length === 0 ? (
                    <div className="py-8 px-4 text-center text-xs text-[#9fb0c8] flex flex-col items-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-[#9fb0c8]/40" />
                      <span>Tidak ada notifikasi saat ini</span>
                    </div>
                  ) : (
                    allDisplayNotifs.map((item) => (
                      <div
                        key={item.id}
                        className={`p-3.5 transition-colors ${
                          !item.read ? 'bg-blue-600/10 hover:bg-blue-600/15' : 'hover:bg-[#132c52]/60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 w-7 h-7 rounded-full bg-[#132c52] border border-[#1e3454] flex items-center justify-center shrink-0">
                            {item.type === 'registration' && <UserCheck className="w-3.5 h-3.5 text-blue-400" />}
                            {item.type === 'submission' && <FileUp className="w-3.5 h-3.5 text-orange-400" />}
                            {item.type === 'project' && <Building2 className="w-3.5 h-3.5 text-green-400" />}
                            {item.type === 'change' && <Settings className="w-3.5 h-3.5 text-purple-400" />}
                            {item.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-400" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white leading-snug">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-[#9fb0c8] mt-0.5 line-clamp-2">
                              {item.subtitle}
                            </p>
                            <span className="text-[10px] text-[#9fb0c8]/70 mt-1 block">
                              {item.at}
                            </span>

                            {/* Aksi cepat Admin: hanya untuk item yang masih MENUNGGU persetujuan */}
                            {currentUser.role === 'admin' && item.status === 'Menunggu' && item.targetId && (() => {
                              const handlers = {
                                registration: { approve: onApproveRegistration, reject: onRejectRegistration },
                                submission: { approve: onApproveSubmission, reject: onRejectSubmission },
                                project: { approve: onApproveProject, reject: onRejectProject },
                                change: { approve: onApproveChange, reject: onRejectChange }
                              } as const;
                              const h = (handlers as any)[item.type] as
                                | { approve: (id: string) => void; reject: (id: string, note?: string) => void }
                                | undefined;
                              if (!h) return null;
                              return (
                                <div className="flex items-center gap-2 mt-2 pt-1 border-t border-[#1e3454]/50">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      h.approve(item.targetId!);
                                    }}
                                    className="px-2.5 py-1 rounded bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Check className="w-3 h-3" /> Setujui
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const reason = prompt('Alasan penolakan (opsional):') || undefined;
                                      h.reject(item.targetId!, reason);
                                    }}
                                    className="px-2.5 py-1 rounded bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <X className="w-3 h-3" /> Tolak
                                  </button>
                                  {item.type !== 'registration' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setIsBellOpen(false);
                                        onNavigateToTab?.('approval');
                                      }}
                                      className="text-[11px] text-blue-400 hover:underline ml-auto"
                                    >
                                      Lihat detail &rarr;
                                    </button>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bell Footer */}
                <div className="px-4 py-2 border-t border-[#1e3454] bg-[#0d203d] text-center">
                  <span className="text-[11px] text-[#9fb0c8]">
                    Pendaftaran akun, proyek, unggahan data, dan perubahan akun diproses Admin melalui lonceng ini.
                  </span>
                </div>

              </div>
            )}
          </div>
        )}

        {/* MENU AKUN PENGGUNA (Tab Persetujuan Akun Dihilangkan Sesuai Instruksi) */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={handleToggleMenu}
            className={`flex items-center gap-2 p-1.5 md:px-3 md:py-1.5 rounded-lg border transition-all cursor-pointer ${
              isMenuOpen 
                ? 'bg-[#132c52] border-blue-500 text-white' 
                : 'bg-[#102544] border-[#1e3454] text-[#9fb0c8] hover:text-white hover:border-blue-500'
            }`}
            aria-label="Menu Akun"
            aria-expanded={isMenuOpen}
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center border border-blue-400">
              {currentUser.name.trim().charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="hidden md:inline-block text-xs font-semibold text-white max-w-[130px] truncate">
              {currentUser.name}
            </span>
          </button>

          {/* Menu Panel */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2.5 w-80 md:w-96 max-w-[calc(100vw-24px)] bg-[#102544] border border-[#1e3454] rounded-xl shadow-2xl overflow-hidden z-50 text-white animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Profile Card Header */}
              <div className="flex items-center gap-3.5 p-4 border-b border-[#1e3454] bg-[#0d203d]">
                <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center shrink-0 border-2 border-blue-400">
                  {currentUser.name.trim().charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-white truncate">{currentUser.name}</div>
                  <div className="text-xs text-[#9fb0c8] truncate">{currentUser.email || 'Tanpa email terdaftar'}</div>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                    {roleLabels[currentUser.role]?.label || currentUser.role}
                  </span>
                </div>
              </div>

              {currentUser.role !== 'viewer' ? (
                <div>
                  {/* Menu Tabs: PROFIL & PENGATURAN AKUN (TIDAK ADA TAB PERSETUJUAN AKUN) */}
                  <div className="grid grid-cols-2 border-b border-[#1e3454]">
                    <button
                      type="button"
                      onClick={() => setActiveMenuTab('profil')}
                      className={`py-2.5 text-xs font-semibold text-center transition-colors border-b-2 cursor-pointer ${
                        activeMenuTab === 'profil'
                          ? 'border-blue-500 text-white bg-[#132c52]/40'
                          : 'border-transparent text-[#9fb0c8] hover:text-white'
                      }`}
                    >
                      Profil
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMenuTab('akun')}
                      className={`py-2.5 text-xs font-semibold text-center transition-colors border-b-2 cursor-pointer ${
                        activeMenuTab === 'akun'
                          ? 'border-blue-500 text-white bg-[#132c52]/40'
                          : 'border-transparent text-[#9fb0c8] hover:text-white'
                      }`}
                    >
                      Pengaturan Akun
                    </button>
                  </div>

                  {/* TAB 1: PROFIL */}
                  {activeMenuTab === 'profil' && (
                    <div className="p-4 text-xs space-y-3">
                      {!isEditingProfile ? (
                        <>
                          <div className="space-y-2 text-[#d7e3ec]">
                            <div className="grid grid-cols-3 gap-2 py-1 border-b border-[#1e3454]/40">
                              <span className="text-[#9fb0c8]">Jabatan:</span>
                              <span className="col-span-2 font-medium">{currentUser.title || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-1 border-b border-[#1e3454]/40">
                              <span className="text-[#9fb0c8]">Posisi:</span>
                              <span className="col-span-2 font-medium">{currentUser.pos || '-'}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 py-1">
                              <span className="text-[#9fb0c8]">Akses Proyek:</span>
                              <span className="col-span-2 font-medium text-blue-400">
                                {currentUser.role === 'admin'
                                  ? 'Semua Proyek (Admin)'
                                  : currentUser.projects.length > 0
                                  ? `${currentUser.projects.length} Proyek Terdaftar`
                                  : 'Belum Ada Proyek'}
                              </span>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-lg bg-blue-600/10 border border-blue-500/20 text-[#9fb0c8] text-[11px] leading-relaxed">
                            <b className="text-white">Hak Akses · {roleLabels[currentUser.role]?.label}</b>
                            <p className="mt-0.5">{roleLabels[currentUser.role]?.desc}</p>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(true)}
                            className="w-full py-2 rounded-lg border border-blue-500/50 text-blue-400 hover:bg-blue-600/15 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            ✎ Edit Profil
                          </button>
                        </>
                      ) : (
                        <form onSubmit={handleSaveProfile} className="space-y-3">
                          <div>
                            <label className="block text-[11px] text-[#9fb0c8] mb-1">Nama Lengkap</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-[#0b1526] border border-[#1e3454] rounded px-3 py-1.5 text-xs text-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#9fb0c8] mb-1">Jabatan</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full bg-[#0b1526] border border-[#1e3454] rounded px-3 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-[#9fb0c8] mb-1">Posisi</label>
                            <input
                              type="text"
                              value={editPos}
                              onChange={(e) => setEditPos(e.target.value)}
                              className="w-full bg-[#0b1526] border border-[#1e3454] rounded px-3 py-1.5 text-xs text-white"
                            />
                          </div>

                          {profileMsg && (
                            <p className="text-[11px] text-green-400">{profileMsg}</p>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setIsEditingProfile(false)}
                              className="py-1.5 rounded border border-[#1e3454] text-[#9fb0c8] hover:text-white"
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                            >
                              {currentUser.role === 'admin' ? 'Simpan' : 'Ajukan ke Admin'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* TAB 2: PENGATURAN AKUN */}
                  {activeMenuTab === 'akun' && (
                    <form onSubmit={handleSaveAccount} className="p-4 space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-[#9fb0c8] mb-1">Email Perusahaan</label>
                        <input
                          type="email"
                          value={accEmail}
                          onChange={(e) => setAccEmail(e.target.value)}
                          className="w-full bg-[#0b1526] border border-[#1e3454] rounded px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#9fb0c8] mb-1">Password Saat Ini</label>
                        <input
                          type="password"
                          placeholder="Masukkan password lama"
                          value={currentPw}
                          onChange={(e) => setCurrentPw(e.target.value)}
                          className="w-full bg-[#0b1526] border border-[#1e3454] rounded px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#9fb0c8] mb-1">Password Baru (min. 8 karakter)</label>
                        <input
                          type="password"
                          placeholder="Password baru"
                          value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                          className="w-full bg-[#0b1526] border border-[#1e3454] rounded px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#9fb0c8] mb-1">Ulangi Password Baru</label>
                        <input
                          type="password"
                          placeholder="Ulangi password baru"
                          value={newPwConfirm}
                          onChange={(e) => setNewPwConfirm(e.target.value)}
                          className="w-full bg-[#0b1526] border border-[#1e3454] rounded px-3 py-1.5 text-xs text-white"
                        />
                      </div>

                      {accMsg && (
                        <p className={`text-[11px] ${accMsg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                          {accMsg.text}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        {currentUser.role === 'admin' ? 'Simpan Perubahan' : 'Ajukan Perubahan ke Admin'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="p-4 text-xs text-[#9fb0c8] space-y-2">
                  <p>Anda sedang mengakses sebagai Tamu / Viewer.</p>
                  <p className="text-[11px] text-[#d7e3ec]">
                    Silakan masuk dengan akun terdaftar untuk mengunggah dokumen, mengajukan proyek, atau mengelola persetujuan.
                  </p>
                </div>
              )}

              {/* Footer: Keluar / Masuk */}
              <div className="p-3 border-t border-[#1e3454] bg-[#0d203d]">
                {currentUser.role === 'viewer' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onOpenLogin();
                    }}
                    className="w-full py-2 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-600/15 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" /> Masuk Akun
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2 rounded-lg border border-red-500/60 text-red-400 hover:bg-red-600/15 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Keluar
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
};
