import React from 'react';
import { Booking, UserProfile } from '../types';
import { downloadIcsFile } from '../utils/ics';

interface ViewBookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  staffUser?: UserProfile | null;
  onClose: () => void;
  onReschedule?: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  onOpenSyncCalendar?: () => void;
  onToast: (msg: string) => void;
}

export const ViewBookingDetailsModal: React.FC<ViewBookingDetailsModalProps> = ({
  booking,
  isOpen,
  staffUser,
  onClose,
  onReschedule,
  onCancel,
  onOpenSyncCalendar,
  onToast
}) => {
  if (!isOpen || !booking) return null;

  const isOwner = staffUser
    ? booking.bookedBy.toLowerCase() === staffUser.name.toLowerCase() ||
      booking.userId === staffUser.id ||
      booking.department.toLowerCase() === staffUser.department.toLowerCase()
    : false;

  const handleDownloadIcs = () => {
    downloadIcsFile(booking);
    onToast(`Calendar (.ics) downloaded for room ${booking.roomName}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-[#e2e8f0] flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header stripe based on ownership */}
        <div className={`h-2 w-full ${isOwner ? 'bg-[#006a61]' : 'bg-[#131b2e]'}`} />

        <div className="p-6 flex flex-col gap-5 overflow-y-auto">
          {/* Top header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
                  isOwner ? 'bg-[#86f2e4] text-[#006f66]' : 'bg-[#dce9ff] text-[#0b1c30]'
                }`}>
                  {isOwner ? '👤 Your Booking' : '👥 Colleague\'s Booking'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff4ff] text-[#45464d] border border-[#dce9ff]">
                  #{booking.id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#e6f4ea] text-[#137333]">
                  {booking.status}
                </span>
              </div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-xl font-bold text-[#0b1c30] mt-0.5">
                {booking.purpose}
              </h3>
              <span className="text-[13px] text-[#45464d] flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#006a61]">location_on</span>
                {booking.roomName} &bull; {booking.location}
              </span>
            </div>

            <button 
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-[#45464d] hover:bg-[#eff4ff] transition-colors shrink-0"
              title="Close"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* Date & Time Highlight */}
          <div className="p-4 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#006a61] shadow-2xs shrink-0">
              <span className="material-symbols-outlined text-[26px]">calendar_clock</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#45464d]">
                Session Date & Time
              </span>
              <span className="text-[15px] font-bold text-[#0b1c30]">
                {booking.date}
              </span>
              <span className="text-xs text-[#006a61] font-semibold">
                {booking.startTime} – {booking.endTime} ({booking.duration})
              </span>
            </div>
          </div>

          {/* Host & Department Details */}
          <div className="p-4 rounded-xl border border-[#e2e8f0] bg-white flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#45464d]">
              Host & Organizer Details
            </span>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#131b2e] text-white flex items-center justify-center font-bold text-sm shrink-0">
                {booking.bookedBy.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-[#0b1c30]">
                  {booking.bookedBy}
                </span>
                <span className="text-xs text-[#45464d]">
                  Department: <strong>{booking.department}</strong>
                </span>
                {booking.userEmail && (
                  <span className="text-xs text-[#1a73e8] mt-0.5">
                    {booking.userEmail}
                  </span>
                )}
              </div>
            </div>

            {booking.attendeesCount && (
              <div className="flex items-center gap-1.5 text-xs text-[#45464d] pt-1 border-t border-[#e2e8f0]/60">
                <span className="material-symbols-outlined text-[16px] text-[#006a61]">group</span>
                <span>Expected Attendees: <strong>{booking.attendeesCount} pax</strong></span>
              </div>
            )}

            {booking.notes && (
              <div className="flex items-start gap-1.5 text-xs text-[#45464d] pt-1">
                <span className="material-symbols-outlined text-[16px] text-[#006a61] shrink-0 mt-0.5">notes</span>
                <span className="italic">"{booking.notes}"</span>
              </div>
            )}
          </div>

          {/* Room Amenities */}
          {booking.amenities && booking.amenities.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#45464d]">
                Equipped Room Amenities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {booking.amenities.map((item) => (
                  <span 
                    key={item}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#eff4ff] text-[#0b1c30] border border-[#dce9ff]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Calendar integration links */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="px-3 py-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#dce9ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Download .ics Calendar</span>
            </button>

            {booking.googleCalendarLink ? (
              <a
                href={booking.googleCalendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-[#e6f4ea] hover:bg-[#ceead6] text-[#137333] rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#ceead6] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                <span>Open in Google Calendar ↗</span>
              </a>
            ) : onOpenSyncCalendar ? (
              <button
                type="button"
                onClick={onOpenSyncCalendar}
                className="px-3 py-2 bg-white hover:bg-[#eff4ff] text-[#1a73e8] rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-[#dce9ff] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                <span>Sync with Google Calendar</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#f8f9ff] border-t border-[#e2e8f0] flex items-center justify-between gap-3">
          {isOwner ? (
            <div className="flex items-center gap-2">
              {onReschedule && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onReschedule(booking);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-[#eff4ff] text-[#0b1c30] rounded-lg text-xs font-semibold border border-[#dce9ff] transition-colors"
                >
                  Reschedule
                </button>
              )}
              {onCancel && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onCancel(booking);
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-[#ffdad6] text-[#ba1a1a] rounded-lg text-xs font-semibold border border-[#ffdad6] transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[#45464d]">
              <span className="material-symbols-outlined text-[16px] text-amber-600">lock</span>
              <span>This booking belongs to <strong>{booking.bookedBy}</strong> ({booking.department})</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#0b1c30] hover:bg-[#131b2e] text-white rounded-xl text-xs font-semibold transition-colors ml-auto"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
