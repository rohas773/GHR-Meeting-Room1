import React, { useState, useEffect } from 'react';
import { Booking } from '../types';

interface RescheduleModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingId: string, newDate: string, newDateString: string, newSlot: { startTime: string; endTime: string; duration: string }) => void;
}

const AVAILABLE_SLOTS = [
  { startTime: '09:00 AM', endTime: '10:00 AM', duration: '1 Hour Duration', label: '09:00 AM - 10:00 AM' },
  { startTime: '11:30 AM', endTime: '12:30 PM', duration: '1 Hour Duration', label: '11:30 AM - 12:30 PM' },
  { startTime: '02:00 PM', endTime: '03:00 PM', duration: '1 Hour Duration', label: '02:00 PM - 03:00 PM' },
  { startTime: '04:30 PM', endTime: '05:30 PM', duration: '1 Hour Duration', label: '04:30 PM - 05:30 PM' },
];

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  booking,
  isOpen,
  onClose,
  onSave
}) => {
  const [selectedDate, setSelectedDate] = useState('2024-10-25');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  useEffect(() => {
    if (booking) {
      setSelectedDate(booking.dateString || '2024-10-25');
    }
  }, [booking]);

  if (!isOpen || !booking) return null;

  const handleSave = () => {
    const slot = AVAILABLE_SLOTS[selectedSlotIndex];
    // Format friendly date
    const d = new Date(selectedDate + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const friendlyDate = `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;

    onSave(booking.id, friendlyDate, selectedDate, {
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 flex flex-col gap-5 border border-[#e2e8f0]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#eff4ff] flex items-center justify-center text-[#006a61]">
              <span className="material-symbols-outlined text-[20px]">edit_calendar</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
                Reschedule Session
              </h3>
              <span className="text-[12px] text-[#45464d]">
                {booking.roomName} • Current: {booking.startTime} - {booking.endTime}
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

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-semibold text-[#0b1c30]">
            New Date Selection
          </label>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61] transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-[#0b1c30]">
              Select Available Slot
            </label>
            <span className="text-[11px] text-[#006a61] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
              Live Matrix verified
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[13px]">
            {AVAILABLE_SLOTS.map((slot, index) => {
              const isSelected = selectedSlotIndex === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedSlotIndex(index)}
                  className={`p-2.5 rounded-lg text-center font-medium transition-all ${
                    isSelected
                      ? 'bg-[#006a61] text-white shadow-sm font-semibold'
                      : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff]/70 border border-[#dce9ff]'
                  }`}
                >
                  {slot.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-[#000000] text-white hover:bg-[#131b2e] rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">done</span>
            <span>Save New Slot</span>
          </button>
        </div>
      </div>
    </div>
  );
};
