import React, { useState, useEffect, useMemo } from 'react';
import { Booking } from '../types';
import { validateBookingConflict } from '../utils/bookingValidation';

interface RescheduleModalProps {
  booking: Booking | null;
  existingBookings: Booking[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookingId: string, newDate: string, newDateString: string, newSlot: { startTime: string; endTime: string; duration: string }) => void;
}

const AVAILABLE_SLOTS = [
  { startTime: '09:00 AM', endTime: '10:00 AM', duration: '1 Hour Duration', label: '09:00 AM - 10:00 AM' },
  { startTime: '10:00 AM', endTime: '11:00 AM', duration: '1 Hour Duration', label: '10:00 AM - 11:00 AM' },
  { startTime: '11:30 AM', endTime: '12:30 PM', duration: '1 Hour Duration', label: '11:30 AM - 12:30 PM' },
  { startTime: '01:00 PM', endTime: '02:00 PM', duration: '1 Hour Duration', label: '01:00 PM - 02:00 PM' },
  { startTime: '02:00 PM', endTime: '03:00 PM', duration: '1 Hour Duration', label: '02:00 PM - 03:00 PM' },
  { startTime: '03:30 PM', endTime: '04:30 PM', duration: '1 Hour Duration', label: '03:30 PM - 04:30 PM' },
  { startTime: '04:30 PM', endTime: '05:30 PM', duration: '1 Hour Duration', label: '04:30 PM - 05:30 PM' },
];

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  booking,
  existingBookings,
  isOpen,
  onClose,
  onSave
}) => {
  const [selectedDate, setSelectedDate] = useState('2024-10-25');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (booking) {
      setSelectedDate(booking.dateString || '2024-10-25');
      setErrorMessage(null);
    }
  }, [booking, isOpen]);

  // Check conflicts for each slot
  const slotConflictMap = useMemo(() => {
    if (!booking) return [];
    return AVAILABLE_SLOTS.map((slot) => {
      return validateBookingConflict(existingBookings, {
        roomId: booking.roomId,
        dateString: selectedDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        ignoreBookingId: booking.id
      });
    });
  }, [booking, existingBookings, selectedDate]);

  if (!isOpen || !booking) return null;

  const currentSlot = AVAILABLE_SLOTS[selectedSlotIndex];
  const currentSlotConflict = slotConflictMap[selectedSlotIndex];

  const handleSave = () => {
    // REJECTION CHECK: Reject if slot conflicts with an existing booking
    const check = validateBookingConflict(existingBookings, {
      roomId: booking.roomId,
      dateString: selectedDate,
      startTime: currentSlot.startTime,
      endTime: currentSlot.endTime,
      ignoreBookingId: booking.id
    });

    if (check.hasConflict && check.conflictingBooking) {
      setErrorMessage(
        `RESCHEDULE REJECTED: This slot has already been taken by ${check.conflictingBooking.bookedBy} (${check.conflictingBooking.department}) for "${check.conflictingBooking.purpose}". Please select another slot.`
      );
      return;
    }

    // Format friendly date
    const d = new Date(selectedDate + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const friendlyDate = `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;

    onSave(booking.id, friendlyDate, selectedDate, {
      startTime: currentSlot.startTime,
      endTime: currentSlot.endTime,
      duration: currentSlot.duration
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-[#e2e8f0]"
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
                {booking.roomName} &bull; Current Session: {booking.startTime} - {booking.endTime}
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

        {/* Warning banner when selected slot has conflict */}
        {currentSlotConflict?.hasConflict && currentSlotConflict.conflictingBooking && (
          <div className="p-3 bg-red-50 border border-red-300 rounded-xl flex items-start gap-2.5 text-xs text-red-950">
            <span className="material-symbols-outlined text-red-600 text-[18px] shrink-0 mt-0.5">block</span>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-red-700">Slot Conflict &bull; Rescheduling Rejected</span>
              <span>
                Slot {currentSlot.startTime} – {currentSlot.endTime} is already booked by <strong>{currentSlotConflict.conflictingBooking.bookedBy}</strong> ({currentSlotConflict.conflictingBooking.department}) for "{currentSlotConflict.conflictingBooking.purpose}".
              </span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-[#0b1c30]">
            Select New Date
          </label>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full px-3.5 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61] transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-[13px] font-semibold text-[#0b1c30]">
              Select Available Time Slot
            </label>
            <span className="text-[11px] text-[#006a61] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006a61]"></span>
              Active slot validation
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[13px]">
            {AVAILABLE_SLOTS.map((slot, index) => {
              const isSelected = selectedSlotIndex === index;
              const conflict = slotConflictMap[index];
              const isOccupied = conflict?.hasConflict;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setSelectedSlotIndex(index);
                    setErrorMessage(null);
                  }}
                  className={`p-2.5 rounded-lg text-center font-medium transition-all relative flex flex-col items-center justify-center gap-0.5 ${
                    isOccupied
                      ? isSelected
                        ? 'bg-red-100 border-2 border-red-400 text-red-900'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                      : isSelected
                        ? 'bg-[#006a61] text-white shadow-sm font-semibold'
                        : 'bg-[#eff4ff] text-[#0b1c30] hover:bg-[#dce9ff]/70 border border-[#dce9ff]'
                  }`}
                >
                  <span className="text-xs font-semibold">{slot.label}</span>
                  {isOccupied && (
                    <span className="text-[10px] text-red-600 font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">lock</span>
                      <span>Booked ({conflict.conflictingBooking?.bookedBy.split(' ')[0]})</span>
                    </span>
                  )}
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
            disabled={currentSlotConflict?.hasConflict}
            onClick={handleSave}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
              currentSlotConflict?.hasConflict
                ? 'bg-red-200 text-red-800 cursor-not-allowed border border-red-300'
                : 'bg-[#000000] text-white hover:bg-[#131b2e] shadow-sm cursor-pointer'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {currentSlotConflict?.hasConflict ? 'block' : 'done'}
            </span>
            <span>
              {currentSlotConflict?.hasConflict ? 'Slot Conflict' : 'Save Date & Time'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
