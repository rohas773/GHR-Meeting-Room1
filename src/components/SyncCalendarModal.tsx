import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { downloadIcsFile } from '../utils/ics';
import { 
  signInWithGoogleCalendar, 
  getCalendarAccessToken, 
  setCalendarAccessToken,
  createGoogleCalendarEvent, 
  deleteGoogleCalendarEvent,
  listGoogleCalendarEvents,
  auth 
} from '../firebase';

interface SyncCalendarModalProps {
  bookings: Booking[];
  isOpen: boolean;
  onClose: () => void;
  onToast: (msg: string, desc?: string) => void;
  onUpdateBooking?: (bookingId: string, updates: Partial<Booking>) => void;
}

export const SyncCalendarModal: React.FC<SyncCalendarModalProps> = ({
  bookings,
  isOpen,
  onClose,
  onToast,
  onUpdateBooking
}) => {
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncedEvents, setSyncedEvents] = useState<Record<string, { eventId: string; htmlLink: string }>>({});
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [activeTab, setActiveTab] = useState<'google' | 'ical'>('google');

  const feedUrl = 'https://workspaces.ghr-corp.internal/v2/cal/feed-budi.santoso@ghr.corp.ics';

  // Check token availability on mount / open
  useEffect(() => {
    if (isOpen) {
      checkGoogleAuth();
    }
  }, [isOpen]);

  const checkGoogleAuth = async () => {
    const token = await getCalendarAccessToken();
    if (token) {
      setIsConnected(true);
      loadLiveGoogleEvents(token);
    } else {
      setIsConnected(false);
    }
  };

  const loadLiveGoogleEvents = async (token?: string) => {
    setIsLoadingEvents(true);
    try {
      const events = await listGoogleCalendarEvents(token);
      setGoogleCalendarEvents(events);
    } catch (err) {
      console.warn('Could not load live events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  if (!isOpen) return null;

  // Handle Google Sign-in to connect Google Calendar
  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const result = await signInWithGoogleCalendar();
      if (result?.accessToken) {
        setIsConnected(true);
        onToast('Google Calendar Disambungkan!', `Akaun: ${result.user.email || result.user.displayName}`);
        await loadLiveGoogleEvents(result.accessToken);
      }
    } catch (err: any) {
      console.error('Google Calendar connect error:', err);
      onToast('Gagal menyambung ke Google Calendar', err.message || 'Sila cuba lagi');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setCalendarAccessToken(null);
    setIsConnected(false);
    setGoogleCalendarEvents([]);
    onToast('Google Calendar diputuskan sambungan.');
  };

  // Sync a single booking into Google Calendar
  const handleSyncSingleBooking = async (booking: Booking) => {
    let token = await getCalendarAccessToken();
    if (!token) {
      try {
        const res = await signInWithGoogleCalendar();
        token = res?.accessToken || null;
        if (!token) return;
        setIsConnected(true);
      } catch (e: any) {
        onToast('Kebenaran Google Calendar diperlukan', e.message);
        return;
      }
    }

    setSyncingId(booking.id);
    try {
      const result = await createGoogleCalendarEvent(booking, token);
      setSyncedEvents((prev) => ({
        ...prev,
        [booking.id]: { eventId: result.eventId, htmlLink: result.htmlLink }
      }));

      if (onUpdateBooking) {
        onUpdateBooking(booking.id, {
          googleCalendarEventId: result.eventId,
          googleCalendarLink: result.htmlLink,
          isSyncedToGoogle: true
        });
      }

      onToast('Tempahan Berjaya Dimasukkan ke Google Calendar!', `${booking.purpose} (${booking.roomName})`);
      loadLiveGoogleEvents(token);
    } catch (err: any) {
      console.error('Sync failed:', err);
      onToast('Gagal menyegerak ke Google Calendar', err.message);
    } finally {
      setSyncingId(null);
    }
  };

  // Sync all bookings into Google Calendar
  const handleSyncAllToGoogle = async () => {
    let token = await getCalendarAccessToken();
    if (!token) {
      try {
        const res = await signInWithGoogleCalendar();
        token = res?.accessToken || null;
        if (!token) return;
        setIsConnected(true);
      } catch (e: any) {
        onToast('Kebenaran Google Calendar diperlukan', e.message);
        return;
      }
    }

    setIsSyncingAll(true);
    let successCount = 0;
    try {
      for (const booking of bookings) {
        if (booking.status !== 'CANCELLED') {
          try {
            const result = await createGoogleCalendarEvent(booking, token);
            setSyncedEvents((prev) => ({
              ...prev,
              [booking.id]: { eventId: result.eventId, htmlLink: result.htmlLink }
            }));
            if (onUpdateBooking) {
              onUpdateBooking(booking.id, {
                googleCalendarEventId: result.eventId,
                googleCalendarLink: result.htmlLink,
                isSyncedToGoogle: true
              });
            }
            successCount++;
          } catch (e) {
            console.error('Item sync error:', e);
          }
        }
      }
      onToast(`${successCount} tempahan berjaya disegerakkan ke Google Calendar!`);
      loadLiveGoogleEvents(token);
    } catch (err: any) {
      onToast('Ralat semasa menyegerakkan semua tempahan', err.message);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Delete event with explicit confirmation dialog (per Google Workspace API guidelines)
  const handleDeleteFromGoogleCalendar = async (booking: Booking) => {
    const eventInfo = syncedEvents[booking.id];
    const eventId = eventInfo?.eventId || booking.googleCalendarEventId;
    if (!eventId) return;

    const confirmed = window.confirm(
      `Padamkan acara "${booking.purpose}" daripada Google Calendar anda?\nTindakan ini akan membuang acara dari kalendar peribadi Google anda.`
    );
    if (!confirmed) return;

    try {
      await deleteGoogleCalendarEvent(eventId);
      setSyncedEvents((prev) => {
        const copy = { ...prev };
        delete copy[booking.id];
        return copy;
      });
      if (onUpdateBooking) {
        onUpdateBooking(booking.id, {
          googleCalendarEventId: undefined,
          googleCalendarLink: undefined,
          isSyncedToGoogle: false
        });
      }
      onToast('Acara telah dipadamkan daripada Google Calendar.');
      const token = await getCalendarAccessToken();
      if (token) loadLiveGoogleEvents(token);
    } catch (err: any) {
      onToast('Gagal memadam acara daripada Google Calendar', err.message);
    }
  };

  const handleCopyIcal = () => {
    navigator.clipboard?.writeText(feedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    onToast('Pautan iCal Feed disalin ke papan klip');
  };

  const handleDownloadAllIcs = () => {
    bookings.forEach((b) => {
      downloadIcsFile(b);
    });
    onToast(`Mengeksport ${bookings.length} tempahan ke fail .ics`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border border-[#e2e8f0] max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">calendar_month</span>
            </div>
            <div className="flex flex-col">
              <h3 className="font-['Plus_Jakarta_Sans'] text-lg font-bold text-[#0b1c30]">
                Integrasi Google Calendar
              </h3>
              <span className="text-[12px] text-[#45464d]">
                Segerakkan tempahan bilik mesyuarat secara terus ke akaun Google anda
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

        {/* Tab Selection: Google Calendar vs iCal/Outlook */}
        <div className="flex items-center p-1 bg-[#eff4ff] rounded-xl border border-[#dce9ff]/60">
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'google'
                ? 'bg-white text-[#1a73e8] shadow-xs'
                : 'text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            {/* Google "G" Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
            </svg>
            <span>Google Calendar API</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ical')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ical'
                ? 'bg-white text-[#0b1c30] shadow-xs'
                : 'text-[#45464d] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">feed</span>
            <span>Outlook / Fail .ics</span>
          </button>
        </div>

        {/* Tab 1: Real Google Calendar API Integration */}
        {activeTab === 'google' && (
          <div className="flex flex-col gap-4">
            {/* Connection Banner */}
            {!isConnected ? (
              <div className="bg-[#eff4ff] p-4 rounded-xl border border-[#dce9ff] flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-[#0b1c30]">
                      Sambungkan Google Calendar Anda
                    </span>
                    <span className="text-xs text-[#45464d] leading-relaxed mt-0.5">
                      Segerakkan semua tempahan bilik mesyuarat terus ke Google Calendar rasmi anda secara automatik dengan kebenaran OAuth Google Workspace.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={isConnecting}
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-[#1f1f1f] rounded-xl text-xs font-semibold border border-[#c6c6cd] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
                  </svg>
                  <span>{isConnecting ? 'Menyambung ke Google...' : 'Sign in with Google / Sambung Google Calendar'}</span>
                </button>
              </div>
            ) : (
              <div className="bg-[#e6f4ea] p-4 rounded-xl border border-[#ceead6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#188038] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[22px]">calendar_month</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#0d652d]">Google Calendar Disambung</span>
                      <span className="w-2 h-2 rounded-full bg-[#188038] animate-pulse"></span>
                    </div>
                    <span className="text-xs text-[#3c4043] font-medium truncate">
                      {auth.currentUser?.email || auth.currentUser?.displayName || 'Google Account Active'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSyncAllToGoogle}
                    disabled={isSyncingAll}
                    className="px-3.5 py-1.5 bg-[#188038] hover:bg-[#137333] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                    <span>{isSyncingAll ? 'Menyegerak...' : 'Segerak Semua'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#d93025]/30"
                    title="Putuskan sambungan kalendar"
                  >
                    <span className="material-symbols-outlined text-[18px]">link_off</span>
                  </button>
                </div>
              </div>
            )}

            {/* List of Bookings to Sync */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                  Tempahan Anda ({bookings.length})
                </span>
                <span className="text-[11px] text-[#1a73e8] font-semibold">
                  Google Calendar Real-Time Sync
                </span>
              </div>

              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {bookings.map((booking) => {
                  const syncInfo = syncedEvents[booking.id];
                  const isSynced = Boolean(syncInfo?.htmlLink || booking.googleCalendarLink);
                  const calendarLink = syncInfo?.htmlLink || booking.googleCalendarLink;
                  const isSyncingThis = syncingId === booking.id;

                  return (
                    <div 
                      key={booking.id}
                      className="p-3 bg-white rounded-xl border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#cbdbf5] transition-all shadow-2xs"
                    >
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0b1c30] truncate">
                            {booking.purpose}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#eff4ff] text-[#006a61] shrink-0">
                            {booking.roomName}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#45464d] mt-0.5">
                          {booking.date} &bull; {booking.startTime} – {booking.endTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isSynced ? (
                          <>
                            <a
                              href={calendarLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-[#e6f4ea] hover:bg-[#ceead6] text-[#137333] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Buka dalam Google Calendar"
                            >
                              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                              <span>Buka Google Calendar</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteFromGoogleCalendar(booking)}
                              className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-md transition-colors"
                              title="Padam dari Google Calendar"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSyncSingleBooking(booking)}
                            disabled={isSyncingThis}
                            className="px-3 py-1 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isSyncingThis ? 'hourglass_top' : 'add'}
                            </span>
                            <span>{isSyncingThis ? 'Menyegerak...' : 'Masuk Google Cal'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Google Calendar Events Preview (If Connected) */}
            {isConnected && (
              <div className="flex flex-col gap-2 pt-2 border-t border-[#e2e8f0]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#45464d]">
                    Acara Semasa Dalam Google Calendar Anda
                  </span>
                  <button
                    type="button"
                    onClick={() => loadLiveGoogleEvents()}
                    className="text-[11px] text-[#1a73e8] hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">refresh</span>
                    <span>Muat Semula</span>
                  </button>
                </div>

                {isLoadingEvents ? (
                  <div className="p-3 text-center text-xs text-[#45464d]">
                    Memuatkan acara dari Google Calendar...
                  </div>
                ) : googleCalendarEvents.length === 0 ? (
                  <div className="p-3 bg-[#eff4ff] rounded-lg text-center text-xs text-[#45464d]">
                    Tiada acara bertindih ditemui dalam Google Calendar.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto">
                    {googleCalendarEvents.slice(0, 4).map((event: any) => (
                      <div 
                        key={event.id}
                        className="p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs flex items-center justify-between"
                      >
                        <div className="flex flex-col truncate">
                          <span className="font-semibold text-[#0b1c30] truncate">
                            {event.summary || 'Acara Tanpa Tajuk'}
                          </span>
                          <span className="text-[10px] text-[#5f6368]">
                            {event.start?.dateTime ? new Date(event.start.dateTime).toLocaleString('ms-MY') : event.start?.date}
                          </span>
                        </div>
                        {event.htmlLink && (
                          <a 
                            href={event.htmlLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#1a73e8] hover:underline text-[11px] shrink-0 ml-2"
                          >
                            Buka ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: iCal Subscription & File Download */}
        {activeTab === 'ical' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#0b1c30]">
                Pautan Langganan iCal Peribadi (Auto-Update)
              </label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={feedUrl}
                  className="w-full px-3 py-2 text-[12px] font-mono bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-[#0b1c30] select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyIcal}
                  className="px-3 py-2 bg-white hover:bg-[#eff4ff] border border-[#dce9ff] rounded-lg text-[12px] font-medium text-[#0b1c30] whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {copied ? 'check' : 'content_copy'}
                  </span>
                  <span>{copied ? 'Disalin' : 'Salin'}</span>
                </button>
              </div>
              <span className="text-[11px] text-[#45464d]">
                Boleh ditampal ke dalam Microsoft Outlook "Add from Internet" atau Apple Calendar.
              </span>
            </div>

            <div className="p-3 bg-[#eff4ff] rounded-xl border border-[#dce9ff] flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-[#0b1c30]">Muat Turun Fail Kalendar (.ics)</span>
                <span className="text-[11px] text-[#45464d]">Eksport semua tempahan sebagai fail .ics</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadAllIcs}
                className="px-3 py-1.5 bg-[#000000] text-white rounded-lg text-xs font-semibold hover:bg-[#131b2e] transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">download</span>
                <span>Muat Turun Semua</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-[#e2e8f0] mt-1">
          <span className="text-[11px] text-[#006a61] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            Google Workspace OAuth API Ready
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#000000] text-white rounded-xl text-sm font-semibold hover:bg-[#131b2e] transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
