import { Booking } from '../types';

export function downloadIcsFile(booking: Booking): void {
  // Parse date and time to format iCal timestamp
  const dateParts = booking.dateString.split('-');
  const year = dateParts[0] || '2024';
  const month = dateParts[1] || '10';
  const day = dateParts[2] || '24';

  function parseTime(timeStr: string) {
    const [time, period] = timeStr.trim().split(' ');
    const [hours, minutes] = time.split(':');
    let hourNum = parseInt(hours, 10);
    if (period === 'PM' && hourNum < 12) hourNum += 12;
    if (period === 'AM' && hourNum === 12) hourNum = 0;
    return `${hourNum.toString().padStart(2, '0')}${minutes.padStart(2, '0')}00`;
  }

  const startFormatted = `${year}${month}${day}T${parseTime(booking.startTime)}`;
  const endFormatted = `${year}${month}${day}T${parseTime(booking.endTime)}`;
  const nowFormatted = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GHR Workspaces//Enterprise Room Reservation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@ghr-workspaces.corp`,
    `DTSTAMP:${nowFormatted}`,
    `DTSTART:${startFormatted}`,
    `DTEND:${endFormatted}`,
    `SUMMARY:${booking.purpose} - ${booking.roomName}`,
    `DESCRIPTION:Reservation: ${booking.purpose}\\nHost: ${booking.bookedBy} (${booking.department})\\nVenue: ${booking.location}\\nAmenities: ${booking.amenities.join(', ')}`,
    `LOCATION:${booking.roomName}, ${booking.location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Room reservation starts in 15 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${booking.id}_${booking.roomName.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
