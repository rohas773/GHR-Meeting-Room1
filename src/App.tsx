import React, { useState, useEffect } from 'react';
import { 
  Booking, 
  HistoricalSession, 
  Room, 
  ToastMessage, 
  UserProfile,
  SystemLink,
  INITIAL_BOOKINGS, 
  INITIAL_HISTORICAL, 
  INITIAL_ROOMS,
  INITIAL_USERS,
  INITIAL_SYSTEM_LINKS
} from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MyBookingsView } from './components/MyBookingsView';
import { BookRoomView } from './components/BookRoomView';
import { MatrixView } from './components/MatrixView';
import { CancellationModal } from './components/CancellationModal';
import { RescheduleModal } from './components/RescheduleModal';
import { ModifyDetailsModal } from './components/ModifyDetailsModal';
import { NewReservationModal } from './components/NewReservationModal';
import { SyncCalendarModal } from './components/SyncCalendarModal';
import { AuthModal } from './components/AuthModal';
import { LinksModal } from './components/LinksModal';
import { ViewBookingDetailsModal } from './components/ViewBookingDetailsModal';
import { Toast } from './components/Toast';
import { validateBookingConflict } from './utils/bookingValidation';
import { 
  auth, 
  db, 
  testConnection, 
  seedInitialDataIfEmpty,
  signInWithGoogle,
  signOutUser,
  loginOrRegisterStaff,
  signUpNewStaffInFirebase,
  saveSystemLinkInFirestore,
  deleteSystemLinkInFirestore,
  createBookingInFirestore,
  updateBookingInFirestore,
  deleteBookingInFirestore,
  handleFirestoreError,
  OperationType
} from './firebase';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { collection, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<'my-bookings' | 'book-a-room' | 'room-availability-matrix'>('my-bookings');
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [historical, setHistorical] = useState<HistoricalSession[]>(INITIAL_HISTORICAL);
  const [rooms] = useState<Room[]>(INITIAL_ROOMS);
  const [cancellationsCount, setCancellationsCount] = useState<number>(0);

  // Multiuser Staff Profile state (saved in local storage & synced with Firebase)
  const [staffUser, setStaffUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('ghr_active_staff');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Fallback to default Budi Santoso
    }
    return INITIAL_USERS[0];
  });
  const [allStaff, setAllStaff] = useState<UserProfile[]>(INITIAL_USERS);

  // System Links state (stored in Firebase)
  const [systemLinks, setSystemLinks] = useState<SystemLink[]>(INITIAL_SYSTEM_LINKS);

  // Firebase auth & cloud sync status
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLinksModalOpen, setIsLinksModalOpen] = useState(false);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [rescheduleModalBooking, setRescheduleModalBooking] = useState<Booking | null>(null);
  const [modifyModalBooking, setModifyModalBooking] = useState<Booking | null>(null);
  const [isNewReservationOpen, setIsNewReservationOpen] = useState(false);
  const [newReservationDefaults, setNewReservationDefaults] = useState<{ roomId?: string; date?: string; time?: string }>({});
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  // Toast state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (title: string, description: string = 'Changes synchronized across corporate room panels.') => {
    setToast({
      id: Date.now().toString(),
      title,
      description
    });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Firebase initialization: test connection and setup auth listener
  useEffect(() => {
    testConnection();

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await seedInitialDataIfEmpty();
      } else {
        try {
          const anon = await signInAnonymously(auth);
          setCurrentUser(anon.user);
          await seedInitialDataIfEmpty();
        } catch (err) {
          console.warn('Anonymous auth note:', err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore snapshot listeners for bookings, staff users, and system links
  useEffect(() => {
    if (!currentUser) return;

    // 1. Listen to bookings
    const bookingsPath = 'bookings';
    const unsubscribeBookings = onSnapshot(
      collection(db, bookingsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudBookings: Booking[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as Booking;
            cloudBookings.push({
              ...data,
              id: docSnap.id
            });
          });
          cloudBookings.sort((a, b) => a.dateString.localeCompare(b.dateString));
          setBookings(cloudBookings);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, bookingsPath);
      }
    );

    // 2. Listen to historical sessions
    const histPath = 'historical_sessions';
    const unsubscribeHistorical = onSnapshot(
      collection(db, histPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudHist: HistoricalSession[] = [];
          snapshot.forEach((docSnap) => {
            cloudHist.push({
              ...(docSnap.data() as HistoricalSession),
              id: docSnap.id
            });
          });
          setHistorical(cloudHist);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, histPath);
      }
    );

    // 3. Listen to system links (persisted in Firebase)
    const linksPath = 'system_links';
    const unsubscribeLinks = onSnapshot(
      collection(db, linksPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudLinks: SystemLink[] = [];
          snapshot.forEach((docSnap) => {
            cloudLinks.push({
              ...(docSnap.data() as SystemLink),
              id: docSnap.id
            });
          });
          setSystemLinks(cloudLinks);
        }
      },
      (error) => {
        console.warn('Links listener note:', error);
      }
    );

    // 4. Listen to registered staff users (multi-user directory in Firebase)
    const usersPath = 'users';
    const unsubscribeUsers = onSnapshot(
      collection(db, usersPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudUsers: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            cloudUsers.push({
              ...(docSnap.data() as UserProfile),
              id: docSnap.id
            });
          });
          setAllStaff(cloudUsers);
        }
      },
      (error) => {
        console.warn('Users listener note:', error);
      }
    );

    return () => {
      unsubscribeBookings();
      unsubscribeHistorical();
      unsubscribeLinks();
      unsubscribeUsers();
    };
  }, [currentUser]);

  // Multi-user Sign Up (Register new staff directly into Firebase Firestore /users)
  const handleSignUpStaff = async (name: string, department: string, role?: string, email?: string) => {
    try {
      const profile = await signUpNewStaffInFirebase({ name, department, role, email });
      setStaffUser(profile);
      localStorage.setItem('ghr_active_staff', JSON.stringify(profile));
      showToast(`New user ${profile.name} registered to Firebase!`, `Department: ${profile.department} (Saved in Firestore /users)`);
    } catch (err) {
      console.error('Failed to sign up staff to Firebase:', err);
      showToast('Failed to register user to Firebase.');
      throw err;
    }
  };

  // Multi-user Login with Name & Department
  const handleLoginStaff = async (name: string, department: string) => {
    try {
      const profile = await loginOrRegisterStaff(name, department);
      setStaffUser(profile);
      localStorage.setItem('ghr_active_staff', JSON.stringify(profile));
      showToast(`Welcome back, ${profile.name}!`, `Department: ${profile.department} (Multiuser profile synchronized)`);
    } catch (err) {
      console.error('Failed to login staff:', err);
      showToast('Failed to sign in to Firebase.');
      throw err;
    }
  };

  const handleLogoutStaff = () => {
    localStorage.removeItem('ghr_active_staff');
    setIsAuthModalOpen(true);
    showToast('Staff session switched. Please enter your name & department.');
  };

  // System Links Handlers
  const handleAddSystemLink = async (link: SystemLink) => {
    await saveSystemLinkInFirestore(link);
    setSystemLinks((prev) => [link, ...prev]);
  };

  const handleDeleteSystemLink = async (linkId: string) => {
    await deleteSystemLinkInFirestore(linkId);
    setSystemLinks((prev) => prev.filter((l) => l.id !== linkId));
    showToast('Link removed from Firebase.');
  };

  // Cancel Booking
  const handleOpenCancel = (booking: Booking) => {
    setCancelModalBooking(booking);
  };

  const handleConfirmCancel = async (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    setCancellationsCount((prev) => prev + 1);
    setCancelModalBooking(null);
    showToast('Booking cancelled. Slot reopened in availability matrix.');

    try {
      await deleteBookingInFirestore(bookingId);
    } catch (err) {
      console.error('Failed to sync cancellation to Firestore:', err);
    }
  };

  // Reschedule Booking
  const handleOpenReschedule = (booking: Booking) => {
    setRescheduleModalBooking(booking);
  };

  const handleSaveReschedule = async (
    bookingId: string, 
    newDate: string, 
    newDateString: string, 
    slot: { startTime: string; endTime: string; duration: string }
  ) => {
    // REJECTION CHECK: Reject if there is already an existing booking on that date & overlapping time
    const currentBooking = bookings.find((b) => b.id === bookingId);
    if (currentBooking) {
      const conflictCheck = validateBookingConflict(bookings, {
        roomId: currentBooking.roomId,
        dateString: newDateString,
        startTime: slot.startTime,
        endTime: slot.endTime,
        ignoreBookingId: bookingId
      });

      if (conflictCheck.hasConflict && conflictCheck.conflictingBooking) {
        showToast(
          'Reschedule Rejected: Slot Conflict!',
          `Room is already booked by ${conflictCheck.conflictingBooking.bookedBy} (${conflictCheck.conflictingBooking.startTime} - ${conflictCheck.conflictingBooking.endTime}). Please select another slot.`
        );
        return;
      }
    }

    const updates = {
      date: newDate,
      dateString: newDateString,
      startTime: slot.startTime,
      endTime: slot.endTime,
      duration: slot.duration,
      urgencyBadge: 'Rescheduled'
    };

    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b))
    );
    setRescheduleModalBooking(null);
    showToast('Session successfully rescheduled and confirmed.');

    try {
      await updateBookingInFirestore(bookingId, updates);
    } catch (err) {
      console.error('Failed to sync reschedule to Firestore:', err);
    }
  };

  // Modify Details
  const handleOpenModify = (booking: Booking) => {
    setModifyModalBooking(booking);
  };

  const handleSaveModify = async (bookingId: string, updated: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updated } : b))
    );
    setModifyModalBooking(null);
    showToast('Reservation details successfully updated.');

    try {
      await updateBookingInFirestore(bookingId, updated);
    } catch (err) {
      console.error('Failed to sync updates to Firestore:', err);
    }
  };

  // New Reservation Flow (Associated with active Staff Member)
  const handleOpenNewReservation = (roomId?: string, date?: string, time?: string) => {
    setNewReservationDefaults({ roomId, date, time });
    setIsNewReservationOpen(true);
  };

  const handleConfirmNewReservation = async (newBooking: Booking) => {
    // REJECTION CHECK: Reject if there is already an existing booking for the same room on the same date and overlapping time
    const conflictCheck = validateBookingConflict(bookings, {
      roomId: newBooking.roomId,
      dateString: newBooking.dateString,
      startTime: newBooking.startTime,
      endTime: newBooking.endTime
    });

    if (conflictCheck.hasConflict && conflictCheck.conflictingBooking) {
      showToast(
        'Booking Rejected: Slot Conflict!',
        `Room '${newBooking.roomName}' has already been booked by ${conflictCheck.conflictingBooking.bookedBy} (${conflictCheck.conflictingBooking.startTime} - ${conflictCheck.conflictingBooking.endTime}). Please choose another time or room.`
      );
      return;
    }

    // Inject active staff member's info into booking
    const enrichedBooking: Booking = {
      ...newBooking,
      bookedBy: staffUser.name,
      department: staffUser.department,
      userId: staffUser.id
    };

    setBookings((prev) => [enrichedBooking, ...prev]);
    setIsNewReservationOpen(false);
    showToast(`Room booked for ${staffUser.name}!`, `Door display & schedule updated.`);
    setActiveTab('my-bookings');

    try {
      await createBookingInFirestore(enrichedBooking, staffUser);
    } catch (err) {
      console.error('Failed to persist new reservation to Firestore:', err);
    }
  };

  // Re-book historical session
  const handleRebookHistorical = (item: HistoricalSession) => {
    setNewReservationDefaults({
      roomId: item.roomId,
      time: '11:00 AM'
    });
    setIsNewReservationOpen(true);
    showToast(`Re-booking configuration opened for ${item.roomName}`);
  };

  // Book slot from matrix view
  const handleBookFromMatrix = (room: Room, timeSlot: string, dateStr: string) => {
    handleOpenNewReservation(room.id, dateStr, timeSlot);
  };

  // Update booking sync attributes (e.g. Google Calendar event ID / link)
  const handleUpdateBookingSync = async (bookingId: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b))
    );
    try {
      await updateBookingInFirestore(bookingId, updates);
    } catch (err) {
      console.warn('Could not update booking sync in Firestore:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      setCurrentUser(user);
      // Auto-update staff user name and email from Google if available
      const staffName = user.displayName || staffUser.name;
      const profile = await loginOrRegisterStaff(staffName, staffUser.department);
      setStaffUser(profile);
      showToast(`Google Sign-In successful as ${staffName}`);
    }
  };

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    showToast('Signed out of corporate session');
  };

  return (
    <div className="bg-[#f8f9ff] text-[#0b1c30] antialiased min-h-screen flex flex-col font-['Inter'] selection:bg-[#86f2e4] selection:text-[#00201d]">
      {/* Top Header with Multi-user & Links triggers */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookingCount={bookings.length}
        user={currentUser}
        staffUser={staffUser}
        linksCount={systemLinks.length}
        onUserClick={() => setIsProfileModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenLinks={() => setIsLinksModalOpen(true)}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="w-full pt-16 flex-1 bg-[#f8f9ff]">
        {activeTab === 'my-bookings' && (
          <MyBookingsView
            bookings={bookings}
            historical={historical}
            rooms={rooms}
            cancellationsCount={cancellationsCount}
            staffUser={staffUser}
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onOpenLinks={() => setIsLinksModalOpen(true)}
            onOpenNewReservation={() => handleOpenNewReservation()}
            onOpenSyncCalendar={() => setIsSyncModalOpen(true)}
            onCancelBooking={handleOpenCancel}
            onRescheduleBooking={handleOpenReschedule}
            onModifyBooking={handleOpenModify}
            onRebookHistorical={handleRebookHistorical}
            onNavigateToMatrix={() => setActiveTab('room-availability-matrix')}
            onToast={(msg) => showToast(msg)}
            onViewBookingDetails={(b) => setSelectedBookingForDetails(b)}
          />
        )}

        {activeTab === 'book-a-room' && (
          <BookRoomView
            rooms={rooms}
            existingBookings={bookings}
            onSelectRoomToBook={(room, defaultTime, defaultDate) => handleOpenNewReservation(room.id, defaultDate, defaultTime)}
            onNavigateToMatrix={() => setActiveTab('room-availability-matrix')}
          />
        )}

        {activeTab === 'room-availability-matrix' && (
          <MatrixView
            rooms={rooms}
            bookings={bookings}
            staffUser={staffUser}
            onBookSlot={handleBookFromMatrix}
            onViewBooking={(b) => setSelectedBookingForDetails(b)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Multi-user Log In / Sign Up Modal (Nama & Department) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentStaff={staffUser}
        allStaff={allStaff}
        onLogin={handleLoginStaff}
        onSignUp={handleSignUpStaff}
        onLogout={handleLogoutStaff}
      />

      {/* Firebase System Links Management Modal */}
      <LinksModal
        isOpen={isLinksModalOpen}
        onClose={() => setIsLinksModalOpen(false)}
        links={systemLinks}
        onAddLink={handleAddSystemLink}
        onDeleteLink={handleDeleteSystemLink}
        onToast={(msg) => showToast(msg)}
      />

      {/* View Booking Details Modal for Any Staff / Colleague Booking */}
      <ViewBookingDetailsModal
        booking={selectedBookingForDetails}
        isOpen={Boolean(selectedBookingForDetails)}
        staffUser={staffUser}
        onClose={() => setSelectedBookingForDetails(null)}
        onReschedule={(b) => {
          setSelectedBookingForDetails(null);
          handleOpenReschedule(b);
        }}
        onCancel={(b) => {
          setSelectedBookingForDetails(null);
          handleOpenCancel(b);
        }}
        onOpenSyncCalendar={() => setIsSyncModalOpen(true)}
        onToast={(msg) => showToast(msg)}
      />

      {/* Modals & Overlays */}
      <CancellationModal
        booking={cancelModalBooking}
        isOpen={Boolean(cancelModalBooking)}
        onClose={() => setCancelModalBooking(null)}
        onConfirm={handleConfirmCancel}
      />

      <RescheduleModal
        booking={rescheduleModalBooking}
        existingBookings={bookings}
        isOpen={Boolean(rescheduleModalBooking)}
        onClose={() => setRescheduleModalBooking(null)}
        onSave={handleSaveReschedule}
      />

      <ModifyDetailsModal
        booking={modifyModalBooking}
        isOpen={Boolean(modifyModalBooking)}
        onClose={() => setModifyModalBooking(null)}
        onSave={handleSaveModify}
      />

      <NewReservationModal
        rooms={rooms}
        existingBookings={bookings}
        selectedRoomId={newReservationDefaults.roomId}
        defaultDate={newReservationDefaults.date}
        defaultTime={newReservationDefaults.time}
        staffUser={staffUser}
        isOpen={isNewReservationOpen}
        onClose={() => setIsNewReservationOpen(false)}
        onConfirm={handleConfirmNewReservation}
      />

      <SyncCalendarModal
        bookings={bookings}
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onToast={(msg, desc) => showToast(msg, desc)}
        onUpdateBooking={handleUpdateBookingSync}
      />

      {/* User Profile & Firebase Cloud Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 flex flex-col gap-4 border border-[#e2e8f0]">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <span className="font-['Plus_Jakarta_Sans'] text-base font-bold text-[#0b1c30]">
                Staff Profile & Firebase Cloud
              </span>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="p-1 rounded-lg text-[#45464d] hover:bg-[#eff4ff]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#000000] text-white flex items-center justify-center font-bold text-base shadow-sm">
                {staffUser.avatar || staffUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-['Plus_Jakarta_Sans'] font-bold text-[#0b1c30] truncate">
                  {staffUser.name}
                </span>
                <span className="text-xs text-[#006a61] font-semibold truncate">
                  {staffUser.department}
                </span>
                <span className="text-[11px] text-[#45464d] truncate">
                  {staffUser.email || currentUser?.email || 'rohas@mediaprima.com.my'}
                </span>
              </div>
            </div>

            {/* Cloud Status details */}
            <div className="bg-[#eff4ff] p-3 rounded-xl border border-[#dce9ff] flex flex-col gap-1.5 text-xs text-[#45464d]">
              <div className="flex justify-between items-center">
                <span>Multiuser Firestore:</span>
                <span className="font-semibold text-[#006a61] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#006a61] animate-pulse"></span>
                  {allStaff.length} Registered Staff
                </span>
              </div>
              <div className="flex justify-between">
                <span>Stored Links:</span>
                <span className="font-semibold text-[#0b1c30]">{systemLinks.length} Active Links</span>
              </div>
              <div className="flex justify-between">
                <span>Database Region:</span>
                <span className="font-mono text-[10px] text-[#0b1c30]">asia-southeast1</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-[#e2e8f0]">
              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="w-full py-2 bg-[#000000] text-white hover:bg-[#131b2e] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                <span>Switch Staff Account (Sign In)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsProfileModalOpen(false);
                  setIsLinksModalOpen(true);
                }}
                className="w-full py-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006a61] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-[#dce9ff]"
              >
                <span className="material-symbols-outlined text-[16px]">link</span>
                <span>Manage Firebase Links ({systemLinks.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsProfileModalOpen(false)}
                className="w-full py-2 bg-white text-[#45464d] rounded-xl text-xs font-semibold hover:bg-[#eff4ff] transition-colors border border-[#e2e8f0]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Corporate Notification Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
