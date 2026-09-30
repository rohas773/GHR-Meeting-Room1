import React, { useState, useMemo } from 'react';
import { Room, Booking } from '../types';
import { validateBookingConflict } from '../utils/bookingValidation';

interface BookRoomViewProps {
  rooms: Room[];
  existingBookings: Booking[];
  onSelectRoomToBook: (room: Room, defaultTime?: string, defaultDate?: string) => void;
  onNavigateToMatrix: () => void;
}

const AMENITY_FILTERS = [
  'Video Bar 4K',
  'Projector',
  'Dual Smart Display',
  'Polycom Studio',
  'Enterprise Mesh',
  'Acoustic Wall Panel',
  'Whiteboard'
];

export const BookRoomView: React.FC<BookRoomViewProps> = ({
  rooms,
  existingBookings,
  onSelectRoomToBook,
  onNavigateToMatrix
}) => {
  const [selectedCapacity, setSelectedCapacity] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('2024-10-24');
  const [preferredTime, setPreferredTime] = useState('02:00 PM');

  // Compute 1 hour duration end time for quick availability checking
  const calculateQuickEndTime = (start: string) => {
    const [time, period] = start.split(' ');
    const [hStr, mStr] = time.split(':');
    let hours = parseInt(hStr, 10);
    const minutes = parseInt(mStr, 10);
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const totalMinutes = hours * 60 + minutes + 60;
    let endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endPeriod = endHours >= 12 ? 'PM' : 'AM';
    if (endHours > 12) endHours -= 12;
    if (endHours === 0) endHours = 12;

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')} ${endPeriod}`;
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Capacity filter
      if (selectedCapacity === 'small' && room.capacity > 6) return false;
      if (selectedCapacity === 'medium' && (room.capacity < 7 || room.capacity > 12)) return false;
      if (selectedCapacity === 'large' && room.capacity < 13) return false;

      // Floor filter
      if (selectedFloor !== 'all' && !room.floor.includes(selectedFloor)) return false;

      // Amenity filter
      if (selectedAmenity !== 'all' && !room.amenities.includes(selectedAmenity)) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = room.name.toLowerCase().includes(q);
        const matchFloor = room.floor.toLowerCase().includes(q);
        const matchDesc = room.description.toLowerCase().includes(q);
        if (!matchName && !matchFloor && !matchDesc) return false;
      }

      return true;
    });
  }, [rooms, selectedCapacity, selectedFloor, selectedAmenity, searchQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-1.5 text-[#006a61]">
            <span className="material-symbols-outlined text-[18px]">meeting_room</span>
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              GHR Workspace & Meeting Rooms Catalog
            </span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-[28px] font-semibold text-[#0b1c30] tracking-tight leading-tight">
            Book a Meeting Room
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#45464d] leading-relaxed">
            Select a meeting room, inspect real-time availability, and automatically prevent overlapping reservations with other team members.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNavigateToMatrix}
            className="px-4 py-2.5 bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[18px]">view_timeline</span>
            <span>View Room Schedule Matrix</span>
          </button>
        </div>
      </div>

      {/* Date & Time Selector Bar */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e2e8f0]/80 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
              Selected Date
            </label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-1.5 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-sm text-[#0b1c30] font-medium focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-[#45464d] uppercase tracking-wider">
              Preferred Time
            </label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="px-3.5 py-1.5 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-sm text-[#0b1c30] font-medium focus:outline-none focus:bg-white"
            >
              <option value="08:00 AM">08:00 AM</option>
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="11:30 AM">11:30 AM</option>
              <option value="01:00 PM">01:00 PM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="03:00 PM">03:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
              <option value="05:00 PM">05:00 PM</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#45464d] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by room name or features..."
            className="w-full pl-10 pr-4 py-2 bg-[#eff4ff] rounded-lg text-sm text-[#0b1c30] placeholder:text-[#45464d] focus:outline-none focus:bg-white border border-[#dce9ff]"
          />
        </div>
      </div>

      {/* Filter Tabs (Capacity & Amenities) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#e2e8f0]/80 shadow-2xs">
        {/* Capacity pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#45464d] mr-2">
            Capacity:
          </span>
          <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg">
            <button
              onClick={() => setSelectedCapacity('all')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                selectedCapacity === 'all'
                  ? 'bg-white text-[#0b1c30] font-semibold shadow-xs'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCapacity('small')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                selectedCapacity === 'small'
                  ? 'bg-white text-[#0b1c30] font-semibold shadow-xs'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              Small (1-6)
            </button>
            <button
              onClick={() => setSelectedCapacity('medium')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                selectedCapacity === 'medium'
                  ? 'bg-white text-[#0b1c30] font-semibold shadow-xs'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              Medium (7-12)
            </button>
            <button
              onClick={() => setSelectedCapacity('large')}
              className={`px-3 py-1 rounded-md text-[12px] font-medium transition-all ${
                selectedCapacity === 'large'
                  ? 'bg-white text-[#0b1c30] font-semibold shadow-xs'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              Large (13+)
            </button>
          </div>
        </div>

        {/* Floor selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#45464d]">
            Floor:
          </span>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="px-3 py-1 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-xs font-medium text-[#0b1c30] focus:outline-none"
          >
            <option value="all">All Locations</option>
            <option value="Level 3">Level 3, Anjung Riong</option>
          </select>
        </div>

        {/* Equipment selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#45464d]">
            Key Amenities:
          </span>
          <select
            value={selectedAmenity}
            onChange={(e) => setSelectedAmenity(e.target.value)}
            className="px-3 py-1 bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-xs font-medium text-[#0b1c30] focus:outline-none"
          >
            <option value="all">All Amenities</option>
            {AMENITY_FILTERS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Cards Grid with Live Conflict / Availability Badge */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => {
          const quickEndTime = calculateQuickEndTime(preferredTime);
          const conflictCheck = validateBookingConflict(existingBookings, {
            roomId: room.id,
            dateString: selectedDate,
            startTime: preferredTime,
            endTime: quickEndTime
          });

          const isConflict = conflictCheck.hasConflict;

          return (
            <div
              key={room.id}
              className={`bg-white rounded-xl shadow-md border overflow-hidden flex flex-col hover:shadow-lg transition-all ${
                isConflict ? 'border-red-200' : 'border-[#e2e8f0]/90'
              }`}
            >
              {/* Image banner with badges */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  referrerPolicy="no-referrer"
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-[#0b1c30] backdrop-blur-sm shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-[#006a61]">group</span>
                    <span>{room.capacity} Pax</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-[#0b1c30] backdrop-blur-sm shadow-sm">
                    {room.code}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  {isConflict ? (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-600 text-white shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">block</span>
                      <span>Booked ({preferredTime})</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#006a61] text-white shadow-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                      <span>Available ({preferredTime})</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Room Body */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
                      {room.name}
                    </h3>
                  </div>
                  <span className="text-[12px] text-[#45464d] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-[#006a61]">location_on</span>
                    {room.floor} ({room.wing})
                  </span>
                  <p className="text-[13px] text-[#45464d] line-clamp-2 mt-1 leading-relaxed">
                    {room.description}
                  </p>

                  {/* Conflict indicator callout */}
                  {isConflict && conflictCheck.conflictingBooking && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2 mt-1">
                      <span className="material-symbols-outlined text-red-600 text-[16px] shrink-0 mt-0.5">info</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-red-700">This slot is already reserved:</span>
                        <span>
                          Booked by <strong>{conflictCheck.conflictingBooking.bookedBy}</strong> ({conflictCheck.conflictingBooking.startTime} – {conflictCheck.conflictingBooking.endTime}) for "{conflictCheck.conflictingBooking.purpose}".
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amenities pills */}
                <div className="flex flex-wrap gap-1.5">
                  {room.amenities.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#eff4ff] text-[#0b1c30] border border-[#dce9ff]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                {/* Action footer */}
                <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between gap-2 mt-2">
                  <button
                    type="button"
                    onClick={onNavigateToMatrix}
                    className="text-[12px] font-medium text-[#45464d] hover:text-[#006a61] transition-colors"
                  >
                    Full Schedule
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectRoomToBook(room, preferredTime, selectedDate)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                      isConflict
                        ? 'bg-amber-700 hover:bg-amber-800 text-white'
                        : 'bg-[#000000] hover:bg-[#131b2e] text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {isConflict ? 'schedule' : 'add_circle'}
                    </span>
                    <span>{isConflict ? 'Select Other Time' : 'Book Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
