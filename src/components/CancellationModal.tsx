import React from 'react';
import { Booking } from '../types';

interface CancellationModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingId: string) => void;
}

export const CancellationModal: React.FC<CancellationModalProps> = ({
  booking,
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-[#e2e8f0] transform scale-100 transition-transform"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
          <span className="material-symbols-outlined text-[28px]">warning</span>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30]">
            Confirm Cancellation?
          </h3>
          <p className="text-sm text-[#45464d] leading-relaxed">
            Are you sure you want to cancel the reservation for{' '}
            <strong className="text-[#0b1c30]">{booking.roomName}</strong> at{' '}
            <strong className="text-[#0b1c30]">
              {booking.date.includes('Today') ? 'Today' : booking.date} at {booking.startTime}
            </strong>?
          </p>
        </div>

        <div className="bg-[#eff4ff] p-3 rounded-lg flex items-start gap-2 border border-[#dce9ff]">
          <span className="material-symbols-outlined text-[#006a61] text-[18px] shrink-0 mt-0.5">
            bolt
          </span>
          <span className="text-[12px] text-[#45464d] leading-snug">
            Cancelling immediately frees up slots in the live matrix for other colleagues.
          </span>
        </div>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={() => onConfirm(booking.id)}
            className="px-4 py-2 bg-[#ba1a1a] text-white hover:bg-[#93000a] rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">cancel</span>
            <span>Yes, Cancel Slot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
