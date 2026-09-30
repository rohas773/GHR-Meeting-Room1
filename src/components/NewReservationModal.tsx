import React, { useState, useEffect, useMemo } from 'react';
import { Room, Booking, UserProfile } from '../types';
import { validateBookingConflict } from '../utils/bookingValidation';

interface NewReservationModalProps {
  rooms: Room[];
  existingBookings: Booking[];
  selectedRoomId?: string;
  defaultDate?: string;
  defaultTime?: string;
  staffUser?: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (booking: Booking) => void;
}

const TIME_OPTIONS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

const DURATION_OPTIONS = [
  { label: '30 Mins', value: '30 Mins Duration' },
  { label: '1 Hour', value: '1 Hour Duration' },
  { label: '1.5 Hours', value: '1.5 Hours Duration' },
  { label: '2 Hours', value: '2 Hours Duration' },
];

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  rooms,
  existingBookings,
  selectedRoomId,
  defaultDate,
  defaultTime,
  staffUser,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [roomId, setRoomId] = useState(selectedRoomId || (rooms[0]?.id || 'meeting'));
  const [purpose, setPurpose] = useState('');
  const [dateString, setDateString] = useState(defaultDate || '2024-10-25');
  const [startTime, setStartTime] = useState(defaultTime || '02:00 PM');
  const [duration, setDuration] = useState('1 Hour Duration');
  const [bookedBy, setBookedBy] = useState(staffUser?.name || 'Budi Santoso');
  const [department, setDepartment] = useState(staffUser?.department || 'People & Operations');
  const [attendeesCount, setAttendeesCount] = useState(6);
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (staffUser) {
      setBookedBy(staffUser.name);
      setDepartment(staffUser.department);
    }
  }, [staffUser]);

  useEffect(() => {
    if (selectedRoomId) setRoomId(selectedRoomId);
    if (defaultDate) setDateString(defaultDate);
    if (defaultTime) setStartTime(defaultTime);
    setErrorMessage(null);
  }, [selectedRoomId, defaultDate, defaultTime, isOpen]);

  const currentRoom = rooms.find((r) => r.id === roomId) || rooms[0];

  const calculateEndTime = (start: string, dur: string) => {
    const [time, period] = start.split(' ');
    const [hStr, mStr] = time.split(':');
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    let addMinutes = 60;
    if (dur.includes('30 Mins')) addMinutes = 30;
    if (dur.includes('1.5 Hours')) addMinutes = 90;
    if (dur.includes('2 Hours')) addMinutes = 120;

    const totalMinutes = hours * 60 + minutes + addMinutes;
    let endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    if (endHours > 12) endHours -= 12;
    if (endHours === 0) endHours = 12;

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
  };

  const calculatedEndTime = useMemo(() => {
    return calculateEndTime(startTime, duration);
  }, [startTime, duration]);

  // Real-time conflict validation
  const conflictResult = useMemo(() => {
    return validateBookingConflict(existingBookings, {
      roomId,
      dateString,
      startTime,
      endTime: calculatedEndTime
    });
  }, [existingBookings, roomId, dateString, startTime, calculatedEndTime]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purpose.trim()) {
      setErrorMessage('Please enter the meeting purpose or title.');
      return;
    }

    // STRICT REJECTION: Reject if booking slot conflicts with existing booking
    const check = validateBookingConflict(existingBookings, {
      roomId: currentRoom.id,
      dateString,
      startTime,
      endTime: calculatedEndTime
    });

    if (check.hasConflict && check.conflictingBooking) {
      setErrorMessage(
        `BOOKING REJECTED: Room '${currentRoom.name}' is already booked on ${dateString} (${check.conflictingBooking.startTime} - ${check.conflictingBooking.endTime}) by ${check.conflictingBooking.bookedBy} (${check.conflictingBooking.department}) for "${check.conflictingBooking.purpose}". Please select another time or room.`
      );
      return;
    }

    // Calculate formatted date
    const d = new Date(dateString + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const isToday = dateString === '2024-10-24';
    const friendlyDate = isToday 
      ? `Today, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
      : `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;

    const newBooking: Booking = {
      id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
      roomId: currentRoom.id,
      roomName: currentRoom.name,
      location: `${currentRoom.floor} • Capacity ${currentRoom.capacity} pax`,
      date: friendlyDate,
      dateString: dateString,
      startTime: startTime,
      endTime: calculatedEndTime,
      duration: duration,
      purpose: purpose.trim(),
      bookedBy: bookedBy.trim(),
      department: department.trim(),
      status: 'CONFIRMED',
      urgencyBadge: isToday ? 'Today' : 'Upcoming',
      lockType: 'Active Slot Locked',
      amenities: currentRoom.amenities,
      image: currentRoom.image,
      notes: notes.trim(),
      attendeesCount: attendeesCount
    };

    onConfirm(newBooking);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-[#e2e8f0] max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#006a61]/10 text-[#006a61] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">meeting_room</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30]">
                New Room Reservation
              </h3>
              <span className="text-[12px] text-[#45464d]">
                Automatic availability check & slot conflict prevention
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#45464d] hover:bg-[#eff4ff] transition-colors"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* HIGH-PRIORITY REJECTION BANNER WHEN CONFLICT DETECTED */}
        {conflictResult.hasConflict && conflictResult.conflictingBooking && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3.5 text-red-950 animate-in fade-in duration-200">
            <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">block</span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-red-600 text-white uppercase tracking-wider">
                  Booking Rejected &bull; Slot Overlap
                </span>
                <span className="font-semibold text-red-900">
                  {dateString} ({startTime} – {calculatedEndTime})
                </span>
              </div>
              <p className="text-red-900 text-[13px] leading-snug mt-0.5">
                Room <strong>{currentRoom.name}</strong> is already booked by <strong>{conflictResult.conflictingBooking.bookedBy}</strong> ({conflictResult.conflictingBooking.department}) from <strong>{conflictResult.conflictingBooking.startTime} to {conflictResult.conflictingBooking.endTime}</strong>.
              </p>
              <div className="text-red-800 text-[12px] bg-red-100/70 p-2 rounded-lg mt-1 border border-red-200/80">
                <strong>Existing Meeting Purpose:</strong> "{conflictResult.conflictingBooking.purpose}"
              </div>
              <span className="text-red-700 font-semibold text-[11px] mt-0.5">
                ⚠️ You cannot reserve this slot. Please choose another time or select a different room below.
              </span>
            </div>
          </div>
        )}

        {errorMessage && !conflictResult.hasConflict && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Room Selection */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#0b1c30]">
              Select Meeting Room
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {rooms.map((room) => {
                const isSelected = room.id === roomId;
                // Check if this room has conflict at selected time
                const hasRoomConflict = validateBookingConflict(existingBookings, {
                  roomId: room.id,
                  dateString,
                  startTime,
                  endTime: calculatedEndTime
                }).hasConflict;

                return (
                  <div
                    key={room.id}
                    onClick={() => {
                      setRoomId(room.id);
                      setErrorMessage(null);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? hasRoomConflict
                          ? 'border-red-400 bg-red-50/50 ring-1 ring-red-400'
                          : 'border-[#006a61] bg-[#eff4ff] ring-1 ring-[#006a61]'
                        : 'border-[#e2e8f0] hover:border-[#cbdbf5] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={room.image} 
                        alt={room.name} 
                        className="w-12 h-12 rounded-lg object-cover shadow-sm shrink-0" 
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-semibold text-[#0b1c30] truncate">
                          {room.name}
                        </span>
                        <span className="text-[11px] text-[#45464d]">
                          {room.floor} • Cap: {room.capacity}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {hasRoomConflict ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                          Conflict
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                          Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meeting Purpose */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#0b1c30] flex items-center justify-between">
              <span>Meeting Purpose / Subject</span>
              <span className="text-[11px] text-[#006a61] font-normal">Displayed on room door panels</span>
            </label>
            <input 
              type="text"
              required
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                setErrorMessage(null);
              }}
              placeholder="e.g. Sprint Planning, Q4 Budget Review, Board Meeting"
              className="w-full px-3.5 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61] transition-all"
            />
          </div>

          {/* Date & Time Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#0b1c30]">
                Date
              </label>
              <input 
                type="date"
                required
                value={dateString}
                onChange={(e) => {
                  setDateString(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#0b1c30] flex items-center justify-between">
                <span>Start Time</span>
              </label>
              <select
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61]"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#0b1c30] flex items-center justify-between">
                <span>Duration</span>
                <span className="text-[11px] text-[#45464d] font-normal">Ends: {calculatedEndTime}</span>
              </label>
              <select
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full px-3 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61]"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Host & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#0b1c30]">
                Host Name
              </label>
              <input 
                type="text"
                required
                value={bookedBy}
                onChange={(e) => setBookedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#0b1c30]">
                Department / Division
              </label>
              <input 
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[#0b1c30]">
                Expected Attendees (Pax)
              </label>
              <input 
                type="number"
                min="1"
                max={currentRoom.capacity}
                value={attendeesCount}
                onChange={(e) => setAttendeesCount(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-[#0b1c30]">
              Additional Notes (Optional)
            </label>
            <input 
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need HDMI cable, wireless microphones, whiteboard markers..."
              className="w-full px-3.5 py-2 rounded-lg bg-[#eff4ff] border border-[#dce9ff] text-sm text-[#0b1c30] focus:outline-none focus:bg-white focus:border-[#006a61]"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0]">
            <div className="flex items-center gap-2 text-[12px]">
              {conflictResult.hasConflict ? (
                <span className="flex items-center gap-1.5 text-red-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  Slot unavailable (Conflict detected)
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[#006a61] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#006a61]"></span>
                  Slot verified & available for booking
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={conflictResult.hasConflict}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  conflictResult.hasConflict
                    ? 'bg-red-200 text-red-800 cursor-not-allowed border border-red-300'
                    : 'bg-[#000000] text-white hover:bg-[#131b2e] shadow-md cursor-pointer'
                }`}
                title={conflictResult.hasConflict ? 'Booking rejected due to conflict' : 'Confirm reservation'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {conflictResult.hasConflict ? 'block' : 'check_circle'}
                </span>
                <span>
                  {conflictResult.hasConflict ? 'Slot Conflict (Rejected)' : 'Confirm Booking'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
