import React, { useState } from 'react';
import { Room, Booking, UserProfile } from '../types';
import { checkTimeOverlap } from '../utils/bookingValidation';

interface MatrixViewProps {
  rooms: Room[];
  bookings: Booking[];
  staffUser?: UserProfile | null;
  onBookSlot: (room: Room, timeSlot: string, dateStr: string) => void;
  onViewBooking: (booking: Booking) => void;
}

const TIME_SLOTS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

export const MatrixView: React.FC<MatrixViewProps> = ({
  rooms,
  bookings,
  staffUser,
  onBookSlot,
  onViewBooking
}) => {
  const [selectedDateStr, setSelectedDateStr] = useState('2024-10-24');

  const calculateSlotEnd = (slot: string): string => {
    const [time, period] = slot.split(' ');
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    const totalMinutes = h * 60 + m + 60; // 1 hour per slot
    let endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    if (endHours > 12) endHours -= 12;
    if (endHours === 0) endHours = 12;

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
  };

  // Dynamic slot status checking against real bookings database
  const getSlotStatus = (roomId: string, slotTime: string) => {
    const slotEnd = calculateSlotEnd(slotTime);

    // Check all confirmed bookings for this room on the selected date
    const matchedBooking = bookings.find((b) => {
      if (b.status === 'CANCELLED') return false;
      if (b.roomId !== roomId || b.dateString !== selectedDateStr) return false;
      return checkTimeOverlap(b.startTime, b.endTime, slotTime, slotEnd);
    });

    if (matchedBooking) {
      const isMine = staffUser
        ? matchedBooking.bookedBy.toLowerCase() === staffUser.name.toLowerCase() ||
          matchedBooking.userId === staffUser.id
        : false;

      return {
        type: isMine ? 'mine' : 'other',
        booking: matchedBooking,
        title: matchedBooking.purpose,
        host: matchedBooking.bookedBy,
        department: matchedBooking.department,
        time: `${matchedBooking.startTime} - ${matchedBooking.endTime}`
      };
    }

    return { type: 'free' };
  };

  const handlePrevDay = () => {
    const d = new Date(selectedDateStr + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDateStr(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDateStr + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDateStr(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDateStr('2024-10-24');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-1.5 text-[#006a61]">
            <span className="material-symbols-outlined text-[18px]">view_timeline</span>
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Live Facility Grid &bull; Room Availability Map
            </span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-[28px] font-semibold text-[#0b1c30] tracking-tight leading-tight">
            Room Availability Matrix & Staff Reservations
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#45464d] leading-relaxed">
            Real-time schedule grid across all meeting rooms. Click any occupied block to view details or click an open slot to book.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-[#e2e8f0] shadow-sm">
          <button
            onClick={handlePrevDay}
            className="p-1.5 rounded-lg text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
            title="Previous Day"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] transition-colors"
          >
            Today
          </button>

          <input
            type="date"
            value={selectedDateStr}
            onChange={(e) => setSelectedDateStr(e.target.value)}
            className="px-3 py-1 text-xs font-medium text-[#0b1c30] bg-transparent border-0 focus:outline-none"
          />

          <button
            onClick={handleNextDay}
            className="p-1.5 rounded-lg text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
            title="Next Day"
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Legend & quick indicators */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e2e8f0]/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#006a61]"></span>
            <span className="text-[#0b1c30]">Your Bookings (Owned by You)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#4f46e5]"></span>
            <span className="text-[#0b1c30]">Colleagues' Bookings (Other Staff)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded border border-dashed border-[#006a61] bg-[#86f2e4]/15"></span>
            <span className="text-[#0b1c30]">Open Slot (Click to Book)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#006a61] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
          <span>Overlapping Prevention: Active</span>
        </div>
      </div>

      {/* Schedule Matrix Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0]/90 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#eff4ff] border-b border-[#dce9ff]">
                <th className="py-3 px-4 text-left font-['Plus_Jakarta_Sans'] font-semibold text-[13px] text-[#0b1c30] w-56 min-w-[220px] sticky left-0 bg-[#eff4ff] z-10 border-r border-[#dce9ff]">
                  Meeting Room
                </th>
                {TIME_SLOTS.map((time) => (
                  <th key={time} className="py-3 px-2 text-center text-[11px] font-semibold text-[#45464d] min-w-[115px] border-r border-[#dce9ff]/60">
                    {time}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Left Column: Room info */}
                  <td className="py-4 px-4 sticky left-0 bg-white z-10 border-r border-[#dce9ff] shadow-sm">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-['Plus_Jakarta_Sans'] font-semibold text-[13px] text-[#0b1c30]">
                          {room.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#45464d] mt-0.5">
                        {room.floor} • Capacity: {room.capacity} pax
                      </span>
                      <span className="text-[10px] text-[#006a61] font-medium mt-1">
                        {room.code}
                      </span>
                    </div>
                  </td>

                  {/* Slot Columns */}
                  {TIME_SLOTS.map((slot) => {
                    const status = getSlotStatus(room.id, slot);

                    // User's own booking
                    if (status.type === 'mine' && status.booking) {
                      return (
                        <td key={slot} className="p-1 border-r border-[#e2e8f0]/60">
                          <div
                            onClick={() => onViewBooking(status.booking!)}
                            className="w-full h-18 rounded-lg bg-[#006a61] text-white p-2 flex flex-col justify-between cursor-pointer shadow-sm hover:brightness-110 transition-all text-left"
                            title={`${status.booking.purpose} - Click to view details`}
                          >
                            <span className="text-[11px] font-bold line-clamp-1">
                              {status.booking.purpose}
                            </span>
                            <div className="flex items-center justify-between text-[9px] text-[#89f5e7] font-medium">
                              <span className="flex items-center gap-0.5 truncate">
                                <span className="material-symbols-outlined text-[11px]">person</span>
                                <span>Your Booking</span>
                              </span>
                              <span className="text-white/80">{status.booking.startTime}</span>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    // Other staff member's booking
                    if (status.type === 'other' && status.booking) {
                      return (
                        <td key={slot} className="p-1 border-r border-[#e2e8f0]/60">
                          <div
                            onClick={() => onViewBooking(status.booking!)}
                            className="w-full h-18 rounded-lg bg-[#4f46e5] text-white p-2 flex flex-col justify-between text-left shadow-sm hover:bg-[#4338ca] cursor-pointer transition-all"
                            title={`${status.title} (Booked by: ${status.host} - ${status.department}) - Click to view details`}
                          >
                            <span className="text-[11px] font-semibold line-clamp-1 text-white">
                              {status.title}
                            </span>
                            <div className="flex flex-col text-[9px] text-indigo-100">
                              <span className="truncate font-semibold flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[10px]">group</span>
                                <span>{status.host}</span>
                              </span>
                              <span className="text-indigo-200 truncate text-[8.5px]">
                                {status.department}
                              </span>
                            </div>
                          </div>
                        </td>
                      );
                    }

                    // Free slot (clickable to reserve)
                    return (
                      <td key={slot} className="p-1 border-r border-[#e2e8f0]/60">
                        <button
                          type="button"
                          onClick={() => onBookSlot(room, slot, selectedDateStr)}
                          className="w-full h-18 rounded-lg border border-dashed border-[#cbdbf5] hover:border-[#006a61] hover:bg-[#86f2e4]/15 transition-all flex flex-col items-center justify-center gap-0.5 group text-center"
                          title={`Click to book ${room.name} at ${slot}`}
                        >
                          <span className="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-[#006a61] transition-colors">
                            add
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 group-hover:text-[#006a61] transition-colors">
                            Available
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
