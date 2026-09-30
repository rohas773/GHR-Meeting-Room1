import React, { useState, useMemo } from 'react';
import { Booking, HistoricalSession, Room, UserProfile } from '../types';
import { downloadIcsFile } from '../utils/ics';

interface MyBookingsViewProps {
  bookings: Booking[];
  historical: HistoricalSession[];
  rooms: Room[];
  cancellationsCount: number;
  staffUser?: UserProfile | null;
  onOpenAuth?: () => void;
  onOpenLinks?: () => void;
  onOpenNewReservation: () => void;
  onOpenSyncCalendar: () => void;
  onCancelBooking: (booking: Booking) => void;
  onRescheduleBooking: (booking: Booking) => void;
  onModifyBooking: (booking: Booking) => void;
  onRebookHistorical: (item: HistoricalSession) => void;
  onNavigateToMatrix: () => void;
  onToast: (msg: string) => void;
}

export const MyBookingsView: React.FC<MyBookingsViewProps> = ({
  bookings,
  historical,
  rooms,
  cancellationsCount,
  staffUser,
  onOpenAuth,
  onOpenLinks,
  onOpenNewReservation,
  onOpenSyncCalendar,
  onCancelBooking,
  onRescheduleBooking,
  onModifyBooking,
  onRebookHistorical,
  onNavigateToMatrix,
  onToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<'all' | 'meeting' | 'warroom'>('all');
  const [sortOrder, setSortOrder] = useState<'upcoming' | 'recent'>('upcoming');
  const [scopeFilter, setScopeFilter] = useState<'my' | 'all'>('my');

  // Filter and sort bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // User scope filter (if 'my', show user's bookings; if 'all', show company-wide)
      if (scopeFilter === 'my' && staffUser) {
        const isOwner = b.bookedBy.toLowerCase() === staffUser.name.toLowerCase() ||
                        b.userId === staffUser.id ||
                        b.department.toLowerCase() === staffUser.department.toLowerCase();
        // If no match found under 'my', but total bookings is small, let user switch easily
        if (!isOwner) return false;
      }

      // Room match
      if (selectedRoomFilter !== 'all') {
        if (b.roomId !== selectedRoomFilter) return false;
      }

      // Query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPurpose = b.purpose.toLowerCase().includes(q);
        const matchRoom = b.roomName.toLowerCase().includes(q);
        const matchDept = b.department.toLowerCase().includes(q);
        const matchId = b.id.toLowerCase().includes(q);
        const matchUser = b.bookedBy.toLowerCase().includes(q);
        if (!matchPurpose && !matchRoom && !matchDept && !matchId && !matchUser) return false;
      }

      return true;
    });
  }, [bookings, selectedRoomFilter, searchQuery, scopeFilter, staffUser]);


  const handleDownloadIcs = (booking: Booking) => {
    downloadIcsFile(booking);
    onToast(`Calendar event downloaded (.ics) for ${booking.roomName}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-1.5 max-w-2xl">
          <div className="flex items-center gap-1.5 text-[#006a61]">
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span className="text-[11px] uppercase tracking-wider font-semibold">
              Enterprise Scheduling Desk
            </span>
          </div>
          <h1 className="font-['Plus_Jakarta_Sans'] text-2xl sm:text-[28px] font-semibold text-[#0b1c30] tracking-tight leading-tight">
            My Bookings
          </h1>
          <p className="text-[15px] sm:text-[16px] text-[#45464d] leading-relaxed">
            Manage your active reservations or cancel slots to make them available for other staff.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={onOpenSyncCalendar}
            className="px-4 py-2.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#1a73e8] rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-colors shadow-xs border border-[#dce9ff]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
            </svg>
            <span>Sync Google Calendar</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewReservation}
            className="px-4 py-2.5 bg-[#000000] text-white hover:bg-[#131b2e] rounded-xl text-[13px] font-semibold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Multi-user Staff Notice & Scope Bar */}
      <div className="bg-[#eff4ff] p-3.5 rounded-xl border border-[#dce9ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {staffUser?.avatar || 'BS'}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-[#0b1c30]">
                {staffUser?.name || 'Budi Santoso'}
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white text-[#006a61] border border-[#dce9ff]">
                {staffUser?.department || 'People & Operations'}
              </span>
            </div>
            <span className="text-[11px] text-[#45464d]">
              Sesi staf aktif &bull; Semua tempahan disegerakkan ke akaun ini
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Scope Toggle: My Bookings vs All Staff */}
          <div className="flex items-center bg-white p-1 rounded-lg border border-[#dce9ff] shadow-2xs">
            <button
              type="button"
              onClick={() => setScopeFilter('my')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                scopeFilter === 'my'
                  ? 'bg-[#006a61] text-white shadow-2xs'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              Tempahan Saya
            </button>
            <button
              type="button"
              onClick={() => setScopeFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                scopeFilter === 'all'
                  ? 'bg-[#006a61] text-white shadow-2xs'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              Semua Staf ({bookings.length})
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenAuth}
            className="px-3 py-1.5 bg-white hover:bg-[#dce9ff] text-[#006a61] rounded-lg text-xs font-semibold border border-[#dce9ff] transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
            <span>Tukar Staf</span>
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Active Reservations */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]/80 flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-[#45464d] font-medium">
              Active Reservations
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Plus_Jakarta_Sans'] text-4xl text-[#0b1c30] font-bold tabular-nums">
                {bookings.length}
              </span>
              <span className="text-[12px] text-[#006a61] font-semibold">
                Slots reserved
              </span>
            </div>
            <span className="text-[11px] text-[#45464d]">
              {bookings.length > 0 ? 'Next event starts in 2 hours' : 'No upcoming sessions'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#86f2e4]/40 text-[#006f66] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">event_available</span>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-[#006a61]/5 blur-xl pointer-events-none"></div>
        </div>

        {/* Completed This Month */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]/80 flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-[#45464d] font-medium">
              Completed This Month
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Plus_Jakarta_Sans'] text-4xl text-[#0b1c30] font-bold tabular-nums">
                {historical.length}
              </span>
              <span className="text-[12px] text-[#45464d] font-medium">
                Recorded session
              </span>
            </div>
            <span className="text-[11px] text-[#45464d]">
              Last held on Oct 18
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#dce9ff] text-[#0b1c30] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
          </div>
        </div>

        {/* Monthly Cancellations */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]/80 flex items-center justify-between relative overflow-hidden">
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-[#45464d] font-medium">
              Monthly Cancellations
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-['Plus_Jakarta_Sans'] text-4xl text-[#0b1c30] font-bold tabular-nums">
                {cancellationsCount}
              </span>
              <span className="text-[12px] text-[#006a61] font-semibold">
                {cancellationsCount === 0 ? 'Optimal utilization' : 'Released back to matrix'}
              </span>
            </div>
            <span className="text-[11px] text-[#45464d]">
              {cancellationsCount === 0 ? '100% floor attendance rating' : 'Slots instantly reused by staff'}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#89f5e7] text-[#00201d] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">trending_up</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-[#e2e8f0]/80 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#45464d] text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by purpose, keyword, or room..."
            className="w-full pl-10 pr-4 py-2 bg-[#eff4ff] rounded-lg text-sm text-[#0b1c30] placeholder:text-[#45464d] focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#006a61] border border-[#dce9ff]/60 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45464d] hover:text-[#0b1c30]"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-[#eff4ff] p-1 rounded-lg border border-[#dce9ff]/50">
            <button
              type="button"
              onClick={() => setSelectedRoomFilter('all')}
              className={`px-3 py-1 rounded-md text-[13px] transition-all ${
                selectedRoomFilter === 'all'
                  ? 'bg-white shadow-sm text-[#0b1c30] font-semibold'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              All Rooms
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoomFilter('meeting')}
              className={`px-3 py-1 rounded-md text-[13px] transition-all ${
                selectedRoomFilter === 'meeting'
                  ? 'bg-white shadow-sm text-[#0b1c30] font-semibold'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              GHR Meeting Room
            </button>
            <button
              type="button"
              onClick={() => setSelectedRoomFilter('warroom')}
              className={`px-3 py-1 rounded-md text-[13px] transition-all ${
                selectedRoomFilter === 'warroom'
                  ? 'bg-white shadow-sm text-[#0b1c30] font-semibold'
                  : 'text-[#45464d] hover:text-[#0b1c30]'
              }`}
            >
              GHR War Room
            </button>
          </div>

          <div className="h-6 w-px bg-[#d3e4fe] hidden sm:block"></div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'upcoming' ? 'recent' : 'upcoming')}
            className="flex items-center gap-1.5 bg-[#eff4ff] hover:bg-[#dce9ff]/70 px-3 py-1.5 rounded-lg text-[#45464d] text-[13px] border border-[#dce9ff]/50 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">swap_vert</span>
            <span className="text-[#0b1c30] font-medium">
              {sortOrder === 'upcoming' ? 'Upcoming first' : 'Latest first'}
            </span>
          </button>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Bookings & History */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30] flex items-center gap-2">
              <span>Upcoming Sessions</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#e5eeff] text-[#0b1c30]">
                {filteredBookings.length}
              </span>
            </h2>
            <span className="text-[11px] text-[#45464d] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006a61] animate-pulse"></span>
              Live updates enabled
            </span>
          </div>

          {/* Booking Cards */}
          {filteredBookings.map((booking) => {
            const isMeetingRoom = booking.roomId === 'meeting';
            const topBarColor = isMeetingRoom ? 'bg-[#006a61]' : 'bg-[#d3e4fe]';
            const badgeBg = isMeetingRoom ? 'bg-[#86f2e4] text-[#006f66]' : 'bg-[#dce9ff] text-[#0b1c30]';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl shadow-md border border-[#e2e8f0]/90 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg"
              >
                {/* Top Colored Accent Stripe */}
                <div className={`h-1.5 w-full ${topBarColor}`}></div>

                <div className="p-6 flex flex-col gap-4">
                  {/* Top info and room thumbnail */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${badgeBg}`}>
                          {booking.status}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#dce9ff] text-[#0b1c30] text-[11px] font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-[#006a61]">
                            {isMeetingRoom ? 'schedule' : 'event_repeat'}
                          </span>
                          {booking.urgencyBadge}
                        </span>
                        <span className="text-[#45464d] text-[11px] font-medium">
                          #{booking.id}
                        </span>
                      </div>

                      <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30] mt-1">
                        {booking.roomName}
                      </h3>
                      <span className="text-[13px] text-[#45464d] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-[#006a61]">
                          location_on
                        </span>
                        {booking.location}
                      </span>
                    </div>

                    <div className="hidden sm:block w-28 h-20 rounded-lg overflow-hidden relative shadow-inner shrink-0 border border-[#e2e8f0]">
                      <img
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                        src={booking.image}
                        alt={booking.roomName}
                      />
                    </div>
                  </div>

                  {/* Scheduled Time Banner */}
                  <div className="bg-[#eff4ff] p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-[#dce9ff]/70">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#006a61] shadow-sm shrink-0">
                        <span className="material-symbols-outlined text-[22px]">
                          {isMeetingRoom ? 'calendar_today' : 'calendar_month'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-[#0b1c30]">
                          {booking.date}
                        </span>
                        <span className="text-[13px] text-[#45464d]">
                          {booking.startTime} – {booking.endTime} ({booking.duration})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-md text-[#0b1c30] text-[11px] font-medium border border-[#dce9ff] shadow-2xs">
                      <span className={`w-2 h-2 rounded-full ${isMeetingRoom ? 'bg-[#006a61]' : 'bg-[#45464d]'}`}></span>
                      <span>{booking.lockType}</span>
                    </div>
                  </div>

                  {/* Meeting Details: Purpose & Host */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-[#45464d]">
                      Purpose / Subject
                    </span>
                    <p className="text-[15px] font-semibold text-[#0b1c30]">
                      {booking.purpose}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#45464d] text-[12px]">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">person</span>
                        <span>
                          Booked by {booking.bookedBy} ({booking.department})
                        </span>
                      </div>
                      {booking.attendeesCount && (
                        <div className="flex items-center gap-1 text-[#45464d]">
                          <span className="material-symbols-outlined text-[16px]">group</span>
                          <span>{booking.attendeesCount} pax</span>
                        </div>
                      )}
                      {booking.notes && (
                        <div className="flex items-center gap-1 text-[#45464d]">
                          <span className="material-symbols-outlined text-[16px]">notes</span>
                          <span className="italic">{booking.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 mt-1 bg-[#eff4ff]/60 -mx-6 -mb-6 p-4 border-t border-[#dce9ff]/60">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Google Calendar Direct Sync/View Button */}
                      {booking.googleCalendarLink ? (
                        <a
                          href={booking.googleCalendarLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-[#e6f4ea] hover:bg-[#ceead6] text-[#137333] rounded-lg text-[13px] font-medium flex items-center gap-1.5 shadow-2xs border border-[#ceead6] transition-colors"
                          title="Buka dalam Google Calendar"
                        >
                          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                          <span>Google Cal ↗</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={onOpenSyncCalendar}
                          className="px-3 py-1.5 bg-white hover:bg-[#eff4ff] text-[#1a73e8] rounded-lg text-[13px] font-medium flex items-center gap-1.5 shadow-2xs border border-[#dce9ff] transition-colors"
                          title="Segerakkan ke Google Calendar"
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                            <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"/>
                            <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
                            <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
                          </svg>
                          <span>Google Cal</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDownloadIcs(booking)}
                        className="px-3.5 py-1.5 bg-white hover:bg-[#e5eeff] text-[#0b1c30] rounded-lg text-[13px] font-medium flex items-center gap-1.5 shadow-2xs border border-[#dce9ff] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">file_download</span>
                        <span>.ics</span>
                      </button>

                      {isMeetingRoom ? (
                        <button
                          type="button"
                          onClick={() => onRescheduleBooking(booking)}
                          className="px-3.5 py-1.5 bg-white hover:bg-[#e5eeff] text-[#0b1c30] rounded-lg text-[13px] font-medium flex items-center gap-1.5 shadow-2xs border border-[#dce9ff] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                          <span>Reschedule</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onModifyBooking(booking)}
                          className="px-3.5 py-1.5 bg-white hover:bg-[#e5eeff] text-[#0b1c30] rounded-lg text-[13px] font-medium flex items-center gap-1.5 shadow-2xs border border-[#dce9ff] transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit_note</span>
                          <span>Modify Details</span>
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onCancelBooking(booking)}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-[13px] font-medium flex items-center gap-1.5 border border-[#ffdad6] transition-colors shadow-2xs"
                    >
                      <span className="material-symbols-outlined text-[18px]">cancel</span>
                      <span>Cancel Booking</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Empty state when no bookings match filter */}
          {filteredBookings.length === 0 && (
            <div className="bg-white p-10 rounded-xl border border-[#e2e8f0] text-center flex flex-col items-center justify-center gap-2.5 shadow-sm">
              <span className="material-symbols-outlined text-[48px] text-[#76777d]">
                search_off
              </span>
              <h4 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
                No reservations match your filter
              </h4>
              <p className="text-sm text-[#45464d] max-w-sm">
                Try resetting your room filter or checking different keywords.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedRoomFilter('all');
                  }}
                  className="px-4 py-2 bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] rounded-lg text-[13px] font-medium transition-colors"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={onOpenNewReservation}
                  className="px-4 py-2 bg-[#000000] text-white rounded-lg text-[13px] font-semibold hover:bg-[#131b2e] transition-colors"
                >
                  + Create New Reservation
                </button>
              </div>
            </div>
          )}

          {/* Historical Log & Completed Sessions */}
          <div className="flex flex-col gap-3.5 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30] flex items-center gap-2">
                <span>Historical Log & Completed Sessions</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#e5eeff] text-[#0b1c30]">
                  {historical.length}
                </span>
              </h2>
              <span className="text-[11px] text-[#45464d]">
                Archived 30 days
              </span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0]/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#eff4ff] text-[#45464d] text-[11px] uppercase tracking-wider font-semibold border-b border-[#dce9ff]">
                    <tr>
                      <th className="py-2.5 px-4">Date & Time</th>
                      <th className="py-2.5 px-4">Room Venue</th>
                      <th className="py-2.5 px-4">Meeting Purpose</th>
                      <th className="py-2.5 px-4">Duration</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0]/60 text-[#0b1c30]">
                    {historical.map((item) => (
                      <tr key={item.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                        <td className="py-3 px-4 font-semibold whitespace-nowrap">
                          {item.date}
                          <span className="block text-[11px] text-[#45464d] font-normal">
                            {item.time}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#006a61]"></span>
                            <span className="font-medium">{item.roomName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-[#0b1c30]">{item.purpose}</span>
                          <span className="block text-[11px] text-[#45464d]">
                            Host: {item.host}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[13px] text-[#45464d] whitespace-nowrap">
                          {item.duration}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#e5eeff] text-[#45464d] text-[11px] font-semibold">
                            <span className="material-symbols-outlined text-[13px] text-[#006a61]">
                              done_all
                            </span>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onRebookHistorical(item)}
                            className="p-1.5 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-[#0b1c30] transition-colors"
                            title="Re-book session"
                          >
                            <span className="material-symbols-outlined text-[18px]">replay</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Sticky Room Matrix Quick Guide */}
        <div className="lg:col-span-4 flex flex-col gap-6 sticky top-24">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#e2e8f0]/80 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-[#45464d] tracking-wider">
                Room Matrix Quick Guide
              </span>
              <span 
                className="material-symbols-outlined text-[#45464d] text-[18px] cursor-help"
                title="Live snapshot of room availability across corporate wings"
              >
                help_outline
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Meeting Room item */}
              <div className="flex items-center justify-between p-3 bg-[#eff4ff] rounded-lg border border-[#dce9ff]/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006a61]"></span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-[#0b1c30]">
                      GHR Meeting Room
                    </span>
                    <span className="text-[10px] text-[#45464d]">
                      Level 3, Anjung Riong &bull; 10 pax
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#006a61] font-bold">
                  1 Available Slot
                </span>
              </div>

              {/* War Room item */}
              <div className="flex items-center justify-between p-3 bg-[#eff4ff] rounded-lg border border-[#dce9ff]/60">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#131b2e]"></span>
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-[#0b1c30]">
                      GHR War Room
                    </span>
                    <span className="text-[10px] text-[#45464d]">
                      Level 3, Anjung Riong &bull; 18 pax
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-[#45464d] font-medium">
                  Fully Booked Today
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onNavigateToMatrix}
              className="w-full py-2.5 bg-[#e5eeff] text-[#0b1c30] hover:bg-[#dce9ff] rounded-lg text-[13px] font-semibold text-center transition-colors shadow-2xs"
            >
              View Live Availability Matrix
            </button>
          </div>

          {/* Quick Desk Support Info Box */}
          <div className="bg-[#eff4ff] p-5 rounded-xl border border-[#dce9ff] flex flex-col gap-2 text-[12px] text-[#45464d]">
            <div className="flex items-center gap-2 text-[#006a61] font-semibold">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Autonomous Check-in Active</span>
            </div>
            <p className="leading-relaxed">
              Tempahan anda akan diiktiraf secara automatik pada pad sesentuh pintu masuk di Level 3, Anjung Riong. Hubungi Fasiliti Bangunan untuk sebarang susunan katering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
