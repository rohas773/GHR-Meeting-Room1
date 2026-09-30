import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white mt-auto border-t border-[#e2e8f0]/80 shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#45464d]">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="material-symbols-outlined text-[16px] text-[#006a61]">meeting_room</span>
          <span>GHR Workspaces • Room Reservation Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
            <span>Enterprise Cloud Ready</span>
          </span>
          <span className="text-[#76777d]">v2.4.0</span>
        </div>
      </div>
    </footer>
  );
};
