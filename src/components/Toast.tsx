import React from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-[#131b2e] text-white rounded-xl px-5 py-3.5 shadow-2xl flex items-center gap-3.5 border border-[#3f465c]/40 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-md">
      <span className="material-symbols-outlined text-[24px] text-[#89f5e7] shrink-0">
        cloud_sync
      </span>
      <div className="flex flex-col min-w-0 pr-2">
        <span className="text-[13px] font-semibold text-white leading-tight">
          {toast.title}
        </span>
        <span className="text-[11px] text-[#7c839b] leading-tight mt-0.5">
          {toast.description}
        </span>
      </div>
      <button 
        type="button"
        onClick={onClose}
        className="ml-auto text-[#7c839b] hover:text-white transition-colors p-1"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};
