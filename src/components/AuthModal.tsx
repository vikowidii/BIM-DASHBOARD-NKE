import React, { useState } from 'react';
import { UserAccount, UserRegistration } from '../types';
import { X, ShieldCheck, Mail, Lock, User, Briefcase, Building } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userKey: string, pw: string) => { success: boolean; msg: string };
  onRegister: (reg: Omit<UserRegistration, 'id' | 'at' | 'status'>) => { success: boolean; msg: string };
  onGuestLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  onGuestLogin
}) => {
  const [mode, setMode] = useState<'login' | 'reg'>('login');
  
  // Login form
  const [loginUser, setLoginUser] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [loginMsg, setLoginMsg] = useState<{ type: 'ok' | 'bad'; text: string } | null>(null);

  // Register form
  const [regName, setRegName] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regPos, setRegPos] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPw, setRegPw] = useState('');
  const [regPw2, setRegPw2] = useState('');
  const [regMsg, setRegMsg] = useState<{ type: 'ok' | 'bad'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = onLogin(loginUser.trim(), loginPw);
    if (!res.success) {
      setLoginMsg({ type: 'bad', text: res.msg });
    } else {
      setLoginMsg(null);
      onClose();
    }
  };

  const handleRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = regEmail.trim().toLowerCase();

    if (!regName.trim() || !regTitle.trim() || !regPos.trim() || !cleanEmail) {
      setRegMsg({ type: 'bad', text: 'Semua kolom formulir pendaftaran wajib diisi.' });
      return;
    }

    // Security validation: Only valid @gmail.com accounts allowed
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(cleanEmail)) {
      setRegMsg({ 
        type: 'bad', 
        text: 'Keamanan Akses: Hanya email berdomain @gmail.com yang diizinkan untuk mendaftar (contoh: namaanda@gmail.com).' 
      });
      return;
    }

    if (regPw.length < 8) {
      setRegMsg({ type: 'bad', text: 'Password minimal 8 karakter.' });
      return;
    }
    if (regPw !== regPw2) {
      setRegMsg({ type: 'bad', text: 'Konfirmasi password tidak cocok.' });
      return;
    }

    const res = onRegister({
      name: regName.trim(),
      title: regTitle.trim(),
      pos: regPos.trim(),
      email: cleanEmail,
      pw: regPw
    });

    if (res.success) {
      setRegMsg(null);
      setMode('login');
      setLoginUser(cleanEmail);
      setLoginPw('');
      setLoginMsg({ type: 'ok', text: res.msg });
    } else {
      setRegMsg({ type: 'bad', text: res.msg });
    }
  };

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/80 p-4 overflow-y-auto backdrop-blur-xs">
      <div className="bg-[#102544] border border-[#1e3454] rounded-xl w-full max-w-md p-6 shadow-2xl text-white relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9fb0c8] hover:text-white transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Banner with Official NKE Logo */}
        <div className="text-center mb-6">
          <div className="inline-block bg-white px-4 py-2 rounded-lg shadow-md border border-slate-200/20 mb-2.5">
            <img 
              src="/logo_nke.svg" 
              alt="PT Nusa Konstruksi Enjiniring" 
              className="h-9 w-auto mx-auto object-contain"
            />
          </div>
          <h1 className="text-lg font-bold tracking-wider text-white">NKE BIM DASHBOARD</h1>
          <p className="text-[11px] text-[#9fb0c8]">PT Nusa Konstruksi Enjiniring · Sistem Manajemen Terpadu</p>
        </div>

        {/* Tabs: Masuk / Daftar */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <button
            type="button"
            onClick={() => { setMode('login'); setLoginMsg(null); }}
            className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-[#132c52] border-blue-500 text-white'
                : 'bg-[#0b1526] border-[#1e3454] text-[#9fb0c8] hover:text-white'
            }`}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => { setMode('reg'); setRegMsg(null); }}
            className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              mode === 'reg'
                ? 'bg-[#132c52] border-blue-500 text-white'
                : 'bg-[#0b1526] border-[#1e3454] text-[#9fb0c8] hover:text-white'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#9fb0c8] mb-1 font-medium flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email atau Username</span>
              </label>
              <input
                type="text"
                placeholder="Masukkan email terdaftar (@gmail.com) atau username..."
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[#9fb0c8] mb-1 font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>Password</span>
              </label>
              <input
                type="password"
                placeholder="Password akun Anda"
                value={loginPw}
                onChange={(e) => setLoginPw(e.target.value)}
                className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
                required
              />
            </div>

            {loginMsg && (
              <p className={`text-xs p-2.5 rounded-lg border ${
                loginMsg.type === 'ok' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {loginMsg.text}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md"
            >
              Masuk
            </button>

            <button
              type="button"
              onClick={() => { onGuestLogin(); onClose(); }}
              className="w-full py-2 rounded-lg border border-[#1e3454] hover:bg-[#1a355a] text-[#9fb0c8] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Masuk Sebagai Tamu / Viewer
            </button>

            {/* Security Notice */}
            <div className="pt-3 border-t border-[#1e3454]/60">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#0b1526] border border-[#1e3454] text-[11px] text-[#9fb0c8]">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Autentikasi terenkripsi & terkontrol izin akses per proyek.</span>
              </div>
            </div>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegSubmit} className="space-y-3 text-xs">
            {/* Security Badge for Gmail Domain Policy */}
            <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/40 text-[11px] text-blue-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                <b>Kebijakan Keamanan:</b> Pendaftaran akun hanya diperbolehkan menggunakan alamat email valid berdomain <b>@gmail.com</b>.
              </span>
            </div>

            <div>
              <label className="block text-[#9fb0c8] mb-1 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Nama Lengkap</span>
              </label>
              <input
                type="text"
                placeholder="Nama lengkap Anda"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#9fb0c8] mb-1 font-medium flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-blue-400" />
                  <span>Jabatan</span>
                </label>
                <input
                  type="text"
                  placeholder="BIM / Site Engineer"
                  value={regTitle}
                  onChange={(e) => setRegTitle(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[#9fb0c8] mb-1 font-medium flex items-center gap-1">
                  <Building className="w-3 h-3 text-blue-400" />
                  <span>Posisi / Divisi</span>
                </label>
                <input
                  type="text"
                  placeholder="Divisi Operasi"
                  value={regPos}
                  onChange={(e) => setRegPos(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#9fb0c8] mb-1 font-medium flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Email Gmail (@gmail.com)</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">Wajib @gmail.com</span>
              </label>
              <input
                type="email"
                placeholder="namaanda@gmail.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#9fb0c8] mb-1 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-blue-400" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Min. 8 karakter"
                  value={regPw}
                  onChange={(e) => setRegPw(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-[#9fb0c8] mb-1 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-blue-400" />
                  <span>Ulangi Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Konfirmasi"
                  value={regPw2}
                  onChange={(e) => setRegPw2(e.target.value)}
                  className="w-full bg-[#0b1526] border border-[#1e3454] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {regMsg && (
              <p className={`text-xs p-2.5 rounded-lg border ${
                regMsg.type === 'ok' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {regMsg.text}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer shadow-md"
            >
              Kirim Pendaftaran Akun
            </button>
            <p className="text-[11px] text-[#9fb0c8] text-center">
              Pendaftaran Anda diverifikasi dan disetujui melalui lonceng notifikasi Admin.
            </p>
          </form>
        )}

      </div>
    </div>
  );
};
