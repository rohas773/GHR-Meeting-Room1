import React, { useState } from 'react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStaff: UserProfile | null;
  allStaff: UserProfile[];
  onLogin: (name: string, department: string) => Promise<void>;
  onSignUp: (name: string, department: string, role?: string, email?: string) => Promise<void>;
  onLogout: () => void;
}

const COMMON_DEPARTMENTS = [
  'People & Operations',
  'Engineering & Technology',
  'Finance & Procurement',
  'Corporate Strategy',
  'Marketing & Communications',
  'News & Editorial',
  'Digital Transformation',
  'Facilities & Admin'
];

const COMMON_ROLES = [
  'Staff Member',
  'Executive',
  'Senior Engineer',
  'Team Lead',
  'Department Manager',
  'Head of Division'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentStaff,
  allStaff,
  onLogin,
  onSignUp,
  onLogout
}) => {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('Staff Member');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!email || email.includes('@mediaprima.com.my')) {
      const cleanSlug = val.trim().toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
      setEmail(cleanSlug ? `${cleanSlug}@mediaprima.com.my` : '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !department.trim()) {
      setErrorMsg('Sila masukkan Nama Penuh dan Jabatan.');
      return;
    }

    setErrorMsg('');
    setIsLoading(true);
    try {
      if (mode === 'signup') {
        await onSignUp(name.trim(), department.trim(), role.trim(), email.trim());
      } else {
        await onLogin(name.trim(), department.trim());
      }
      setName('');
      setDepartment('');
      setEmail('');
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      const detailed = err?.message || 'Sila semak sambungan internet atau tetapan Firebase.';
      setErrorMsg(`Ralat Firebase: ${detailed}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = async (staff: UserProfile) => {
    setIsLoading(true);
    try {
      await onLogin(staff.name, staff.department);
      onClose();
    } catch (err) {
      console.error('Quick login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-[#e2e8f0] max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#006a61]/10 text-[#006a61] flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-[24px]">person_add</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
                {mode === 'signup' ? 'Daftar Pengguna Baharu (Sign Up)' : 'Log Masuk Staf (Sign In)'}
              </h3>
              <span className="text-[12px] text-[#006a61] font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
                Semua pendaftaran dimasukkan terus ke Firebase Firestore (/users)
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#45464d] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Current Active Staff Notice */}
        {currentStaff && (
          <div className="bg-[#eff4ff] p-3.5 rounded-xl border border-[#dce9ff] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#000000] text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                {currentStaff.avatar || currentStaff.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#0b1c30] truncate">
                    {currentStaff.name}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#86f2e4] text-[#006f66]">
                    Sedang Aktif
                  </span>
                </div>
                <span className="text-[11px] text-[#45464d] truncate">
                  {currentStaff.department} &bull; {currentStaff.role || 'Staff Member'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 bg-white hover:bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-[12px] font-semibold border border-[#ffdad6] transition-colors shrink-0 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              <span>Tukar Akaun</span>
            </button>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex items-center p-1 bg-[#eff4ff] rounded-xl border border-[#dce9ff]/60">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-white text-[#006a61] shadow-xs'
                : 'text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>Daftar Pengguna Baharu (Sign Up)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-white text-[#0b1c30] shadow-xs'
                : 'text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>Log Masuk (Nama & Jabatan)</span>
          </button>
        </div>

        {/* Firebase Guarantee Banner */}
        <div className="p-3 bg-[#86f2e4]/20 border border-[#6bd8cb] rounded-xl flex items-start gap-2.5 text-xs text-[#005049]">
          <span className="material-symbols-outlined text-[20px] text-[#006a61] shrink-0 mt-0.5">
            cloud_done
          </span>
          <div className="flex flex-col">
            <span className="font-bold">
              {mode === 'signup' 
                ? 'Pendaftaran Terus ke Firebase Cloud' 
                : 'Penyegerakan Staf Masa Nyata'}
            </span>
            <span className="text-[11px] leading-relaxed">
              {mode === 'signup'
                ? 'Setiap pengguna yang didaftarkan akan terus dicipta sebagai dokumen di koleksi Firestore /users dan boleh diakses merentas semua peranti.'
                : 'Hanya masukkan nama dan jabatan anda untuk menyambung ke rekod Firestore yang sedia ada.'}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 bg-[#ffdad6]/60 border border-[#ffdad6] rounded-lg text-xs text-[#ba1a1a] font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#0b1c30] flex items-center justify-between">
              <span>Nama Penuh Staf (Full Name)</span>
              <span className="text-[11px] text-[#006a61] font-normal">Wajib diisi</span>
            </label>
            <input 
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="cth: Khairul Azman / Nurul Izzah"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61] transition-all"
            />
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#0b1c30] flex items-center justify-between">
              <span>Jabatan / Department</span>
              <span className="text-[11px] text-[#006a61] font-normal">Wajib diisi</span>
            </label>
            <input 
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="cth: Engineering & Technology / Corporate Strategy"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61] transition-all"
            />
            {/* Quick department chip suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {COMMON_DEPARTMENTS.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setDepartment(dept)}
                  className="px-2 py-0.5 rounded text-[11px] bg-[#eff4ff] text-[#45464d] hover:bg-[#dce9ff] border border-[#dce9ff] transition-colors"
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Extra fields for Sign Up mode */}
          {mode === 'signup' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#0b1c30]">
                  Jawatan / Peranan (Role)
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-xs text-[#0b1c30] focus:outline-none"
                >
                  {COMMON_ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#0b1c30]">
                  Emel Korporat
                </label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@mediaprima.com.my"
                  className="w-full px-3 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-xs text-[#0b1c30] focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 bg-[#000000] text-white hover:bg-[#131b2e] rounded-xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              {mode === 'signup' ? 'cloud_upload' : 'login'}
            </span>
            <span>
              {isLoading 
                ? 'Menyimpan ke Firebase...' 
                : mode === 'signup' 
                  ? 'Daftar Pengguna Baharu ke Firebase' 
                  : 'Log Masuk ke Sistem'}
            </span>
          </button>
        </form>

        {/* Real-time Registered Staff List from Firebase */}
        <div className="flex flex-col gap-2 pt-3 border-t border-[#e2e8f0]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-[#45464d] tracking-wider">
              Staf Berdaftar Dalam Firebase ({allStaff.length})
            </span>
            <span className="text-[11px] text-[#006a61] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
              Firestore Live Directory
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
            {allStaff.map((staff) => {
              const isSelected = currentStaff?.name === staff.name;
              return (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => handleQuickSelect(staff)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    isSelected
                      ? 'border-[#006a61] bg-[#86f2e4]/15 ring-1 ring-[#006a61]'
                      : 'border-[#e2e8f0] bg-white hover:bg-[#eff4ff]'
                  }`}
                  title="Klik untuk log masuk sebagai staf ini"
                >
                  <div className="w-8 h-8 rounded-full bg-[#131b2e] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {staff.avatar || staff.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-[#0b1c30] truncate">
                      {staff.name}
                    </span>
                    <span className="text-[10px] text-[#45464d] truncate">
                      {staff.department} &bull; {staff.role || 'Staff'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-[11px] text-[#45464d] text-center pt-1 border-t border-[#e2e8f0]">
          Pangkalan Data Firebase asia-southeast1 &bull; Koleksi: <span className="font-mono text-[#006a61]">/users</span>
        </div>
      </div>
    </div>
  );
};
