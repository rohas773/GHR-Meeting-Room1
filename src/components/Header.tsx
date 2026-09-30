import React from 'react';
import { User } from 'firebase/auth';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'book-a-room' | 'my-bookings' | 'room-availability-matrix';
  setActiveTab: (tab: 'book-a-room' | 'my-bookings' | 'room-availability-matrix') => void;
  bookingCount: number;
  user?: User | null;
  staffUser?: UserProfile | null;
  linksCount?: number;
  onUserClick?: () => void;
  onOpenAuth?: () => void;
  onOpenLinks?: () => void;
  onSignIn?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  bookingCount,
  user,
  staffUser,
  linksCount = 4,
  onUserClick,
  onOpenAuth,
  onOpenLinks,
  onSignIn,
  onSignOut
}) => {
  const displayName = staffUser?.name || user?.displayName || 'Budi Santoso';
  const displayDepartment = staffUser?.department || 'People & Operations';
  const displayAvatar = staffUser?.avatar || (user?.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'BS');

  return (
    <header className="fixed top-0 w-full z-50 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#e2e8f0]/80">
      <div className="h-16 w-full max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-3">
        {/* Brand Lockup */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActiveTab('my-bookings')}
          >
            <img 
              alt="GHR Workspaces Logo" 
              className="h-8 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida/AEtjO1Uf1oQFrb59DzkSdSvLRZ7Mn_htJjCAwvCA3Af918CqIg4VSrmTi2lsTpATz4TDhvfMg4GKY8kr5Dm_chd0sRdOH9VCMNLy-6jAiml87I8-B81C5j9CziP_xEgMkHhzvEAgrf3f43bcN0rfcjxd8BEljIKSQ0HSbFU1U5NP7aZ0HkWkqCYVmQ1bQLgg38bmTIz6SJJa1vd-w1X6lA66xa7241i72yBhwze3Q3Oiv_rPP8OOKj5Cn6SPsBA" 
            />
            <div className="flex flex-col">
              <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[16px] text-[#0b1c30] leading-none tracking-tight">
                GHR Workspaces
              </span>
              <span className="font-['Inter'] text-[11px] text-[#45464d] leading-tight mt-0.5">
                Room Booking System
              </span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#eff4ff] border border-[#dce9ff]/60">
            <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
            <span className="text-[11px] font-semibold text-[#006a61] tracking-wide">
              Firebase Cloud Connected
            </span>
          </div>
        </div>

        {/* Central Nav Tabs */}
        <nav className="hidden md:flex items-center gap-1 p-1 bg-[#eff4ff] rounded-xl border border-[#dce9ff]/50">
          <button
            onClick={() => setActiveTab('book-a-room')}
            className={`px-3.5 py-1.5 text-[13px] font-medium transition-all rounded-lg ${
              activeTab === 'book-a-room'
                ? 'bg-[#131b2e] text-white font-semibold shadow-sm'
                : 'text-[#45464d] hover:text-[#0b1c30] hover:bg-[#dce9ff]/50'
            }`}
          >
            Book a Room
          </button>
          <button
            onClick={() => setActiveTab('my-bookings')}
            className={`px-3.5 py-1.5 text-[13px] font-medium transition-all rounded-lg flex items-center gap-1.5 ${
              activeTab === 'my-bookings'
                ? 'bg-[#131b2e] text-white font-semibold shadow-sm'
                : 'text-[#45464d] hover:text-[#0b1c30] hover:bg-[#dce9ff]/50'
            }`}
          >
            <span>Bookings & Schedule</span>
            {bookingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === 'my-bookings' 
                  ? 'bg-[#89f5e7] text-[#00201d]' 
                  : 'bg-[#dce9ff] text-[#0b1c30]'
              }`}>
                {bookingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('room-availability-matrix')}
            className={`px-3.5 py-1.5 text-[13px] font-medium transition-all rounded-lg ${
              activeTab === 'room-availability-matrix'
                ? 'bg-[#131b2e] text-white font-semibold shadow-sm'
                : 'text-[#45464d] hover:text-[#0b1c30] hover:bg-[#dce9ff]/50'
            }`}
          >
            Room Availability Matrix
          </button>
        </nav>

        {/* Right Actions: Firebase Links & Staff Account */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Firebase System Links Button */}
          <button
            type="button"
            onClick={onOpenLinks}
            className="px-2.5 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006a61] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#dce9ff]/70 shadow-2xs"
            title="View & Manage All System Links in Firebase"
          >
            <span className="material-symbols-outlined text-[16px]">link</span>
            <span className="hidden sm:inline">Firebase Links</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#006a61] text-white font-bold">
              {linksCount}
            </span>
          </button>

          {/* User Identity & Switch Button */}
          <div 
            onClick={onOpenAuth || onUserClick}
            className="flex items-center gap-2.5 pl-1 sm:pl-2 cursor-pointer group" 
            title="Click to Switch User or Staff Sign In"
          >
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[13px] text-[#0b1c30] font-semibold leading-tight group-hover:text-[#006a61] transition-colors truncate max-w-[140px]">
                {displayName}
              </span>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#e5eeff] text-[#006a61] leading-none">
                  {displayDepartment}
                </span>
              </div>
            </div>
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={displayName} 
                className="w-8 h-8 rounded-full object-cover border border-[#e2e8f0] shadow-sm"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                {displayAvatar}
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-[#c6c6cd]/40 hidden sm:block"></div>

          <button 
            onClick={onOpenAuth}
            className="p-1.5 rounded-lg text-[#45464d] hover:text-[#006a61] hover:bg-[#eff4ff] transition-colors flex items-center gap-1"
            title="Sign In / Register Staff (Multi-user)"
          >
            <span className="material-symbols-outlined text-[20px]">swap_horiz</span>
            <span className="hidden md:inline text-[11px] font-semibold">Switch</span>
          </button>
        </div>
      </div>
    </header>
  );
};


