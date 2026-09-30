import { Booking } from '../types';

/**
 * Converts a standard 12-hour formatted time string (e.g. "09:00 AM", "02:30 PM")
 * into minutes from midnight (0 to 1439) for precise mathematical comparison.
 */
export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const cleaned = timeStr.trim();
  const parts = cleaned.split(' ');
  const [hStr, mStr] = (parts[0] || '0:0').split(':');
  let h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const period = (parts[1] || 'AM').toUpperCase();
  if (period === 'PM' && h < 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

/**
 * Checks whether two time intervals [startA, endA) and [startB, endB) overlap.
 * Adjacent meetings (e.g. 09:00-10:00 and 10:00-11:00) do NOT overlap.
 */
export function checkTimeOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = parseTimeToMinutes(startA);
  const eA = parseTimeToMinutes(endA);
  const sB = parseTimeToMinutes(startB);
  const eB = parseTimeToMinutes(endB);
  return sA < eB && eA > sB;
}

export interface BookingCandidate {
  roomId: string;
  dateString: string;
  startTime: string;
  endTime: string;
  ignoreBookingId?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  reason?: string;
}

/**
 * Finds if there is an existing confirmed/upcoming booking for the same room on the same date
 * that overlaps with the candidate booking.
 */
export function validateBookingConflict(
  existingBookings: Booking[],
  candidate: BookingCandidate
): ConflictResult {
  const conflict = existingBookings.find((b) => {
    if (candidate.ignoreBookingId && b.id === candidate.ignoreBookingId) {
      return false;
    }
    if (b.status === 'CANCELLED') {
      return false;
    }
    if (b.roomId !== candidate.roomId) {
      return false;
    }
    if (b.dateString !== candidate.dateString) {
      return false;
    }
    return checkTimeOverlap(b.startTime, b.endTime, candidate.startTime, candidate.endTime);
  });

  if (conflict) {
    return {
      hasConflict: true,
      conflictingBooking: conflict,
      reason: `The room slot for '${conflict.roomName}' has already been booked by ${conflict.bookedBy} (${conflict.department}) from ${conflict.startTime} to ${conflict.endTime} for "${conflict.purpose}".`
    };
  }

  return { hasConflict: false };
}

/**
 * Returns all bookings for a given room and date.
 */
export function getBookingsForRoomAndDate(
  bookings: Booking[],
  roomId: string,
  dateString: string
): Booking[] {
  return bookings.filter(
    (b) => b.roomId === roomId && b.dateString === dateString && b.status !== 'CANCELLED'
  );
}
