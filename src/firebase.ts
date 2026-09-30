import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDocs 
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  Booking, 
  HistoricalSession, 
  UserProfile, 
  SystemLink, 
  INITIAL_BOOKINGS, 
  INITIAL_HISTORICAL, 
  INITIAL_USERS, 
  INITIAL_SYSTEM_LINKS 
} from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-ghrworkspaces-8fd2a727-5be0-480e-939c-fc60fc862d57'); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google Calendar Workspace Scopes
export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly'
];

CALENDAR_SCOPES.forEach((scope) => {
  googleProvider.addScope(scope);
});

// Cache the access token in memory (never localStorage per guidelines)
let isSigningInCalendar = false;
let cachedCalendarToken: string | null = null;

export const getCalendarAccessToken = async (): Promise<string | null> => {
  return cachedCalendarToken;
};

export const setCalendarAccessToken = (token: string | null) => {
  cachedCalendarToken = token;
};

// Sign in with Google to get Google Calendar OAuth token
export async function signInWithGoogleCalendar(): Promise<{ user: User; accessToken: string } | null> {
  try {
    isSigningInCalendar = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Could not obtain Google Calendar access token from sign-in result');
    }
    cachedCalendarToken = credential.accessToken;
    return { user: result.user, accessToken: cachedCalendarToken };
  } catch (error) {
    console.error('Google Calendar Sign In failed:', error);
    throw error;
  } finally {
    isSigningInCalendar = false;
  }
}

// Clear token on sign out
onAuthStateChanged(auth, (user) => {
  if (!user && !isSigningInCalendar) {
    cachedCalendarToken = null;
  }
});

// Helper to convert date ("YYYY-MM-DD") & time ("02:00 PM") to ISO string
export function formatToIsoDateTime(dateStr: string, timeStr: string): string {
  try {
    const parts = timeStr.trim().split(' ');
    const [hStr, mStr] = parts[0].split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10) || 0;
    const period = parts[1]?.toUpperCase() || 'AM';
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${dateStr}T${pad(h)}:${pad(m)}:00+08:00`;
  } catch (e) {
    return new Date().toISOString();
  }
}

// Google Calendar API: Create / Sync Event
export async function createGoogleCalendarEvent(
  booking: Booking,
  token?: string
): Promise<{ eventId: string; htmlLink: string }> {
  const accessToken = token || cachedCalendarToken;
  if (!accessToken) {
    throw new Error('Google Calendar access token is missing. Please connect Google Calendar first.');
  }

  const startIso = formatToIsoDateTime(booking.dateString, booking.startTime);
  const endIso = formatToIsoDateTime(booking.dateString, booking.endTime);

  const eventPayload = {
    summary: `${booking.purpose} [${booking.roomName}]`,
    description: `🏢 GHR Workspaces Meeting Room Reservation\n📍 Room: ${booking.roomName}\n📌 Location: ${booking.location}\n👤 Host: ${booking.bookedBy} (${booking.department})\n👥 Attendees: ${booking.attendeesCount || 1} pax\n📋 Booking ID: ${booking.id}\n📝 Notes: ${booking.notes || 'No additional notes'}`,
    location: booking.location,
    start: {
      dateTime: startIso,
      timeZone: 'Asia/Kuala_Lumpur'
    },
    end: {
      dateTime: endIso,
      timeZone: 'Asia/Kuala_Lumpur'
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 10 }
      ]
    }
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(eventPayload)
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Google Calendar API Error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  return {
    eventId: data.id,
    htmlLink: data.htmlLink
  };
}

// Google Calendar API: Delete Event (with user confirmation requirement in UI)
export async function deleteGoogleCalendarEvent(
  eventId: string,
  token?: string
): Promise<boolean> {
  const accessToken = token || cachedCalendarToken;
  if (!accessToken) {
    throw new Error('Google Calendar access token is missing.');
  }

  const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok && response.status !== 404) {
    const errBody = await response.text();
    throw new Error(`Google Calendar API Delete Error (${response.status}): ${errBody}`);
  }

  return true;
}

// Google Calendar API: List upcoming events from Google Calendar
export async function listGoogleCalendarEvents(
  token?: string
): Promise<any[]> {
  const accessToken = token || cachedCalendarToken;
  if (!accessToken) return [];

  try {
    const timeMin = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(timeMin)}`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      console.warn('Failed to fetch calendar events:', response.status);
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (err) {
    console.warn('Could not list Google Calendar events:', err);
    return [];
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
    return false;
  }
}

// Ensure an authenticated session exists (anonymous if no Google session)
export async function ensureAuthSession(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (err) {
    console.warn('Anonymous session could not be created:', err);
    return null;
  }
}

// Auth Helpers
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign In failed, falling back to anonymous session:', error);
    try {
      const anonResult = await signInAnonymously(auth);
      return anonResult.user;
    } catch (anonErr) {
      console.error('Anonymous sign in error:', anonErr);
      return null;
    }
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// Multi-user: Sign In with Name and Department
export async function loginOrRegisterStaff(name: string, department: string): Promise<UserProfile> {
  await ensureAuthSession();
  const trimmedName = name.trim();
  const trimmedDept = department.trim();
  const cleanName = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 32);
  const cleanDept = trimmedDept.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 32);
  const normalizedId = `usr_${cleanName || 'staff'}_${cleanDept || 'dept'}`;

  const path = `users/${normalizedId}`;
  try {
    // Check if user already exists in Firestore
    const userDocRef = doc(db, 'users', normalizedId);
    let existing;
    try {
      existing = await getDoc(userDocRef);
    } catch (e) {
      // Offline fallback
    }

    if (existing && existing.exists()) {
      const profile = existing.data() as UserProfile;
      const updatedProfile: UserProfile = {
        ...profile,
        lastLoginAt: new Date().toISOString()
      };
      try {
        await updateDoc(userDocRef, {
          lastLoginAt: updatedProfile.lastLoginAt
        });
      } catch (err) {
        console.warn('Could not update lastLoginAt:', err);
      }
      return updatedProfile;
    }

    // If user does not exist, create and save new user document in Firebase Firestore
    const words = trimmedName.split(' ').filter(Boolean);
    const avatar = words.length >= 2 
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : trimmedName.slice(0, 2).toUpperCase();

    const newProfile: UserProfile = {
      id: normalizedId,
      name: trimmedName,
      department: trimmedDept,
      role: 'Staff Member',
      email: auth.currentUser?.email || `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@mediaprima.com.my`,
      avatar: avatar,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    await setDoc(userDocRef, newProfile);
    console.log('New staff profile saved to Firebase Firestore (/users):', newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Multi-user: Sign Up (Daftar Pengguna Baharu ke Firebase)
export async function signUpNewStaffInFirebase(data: {
  name: string;
  department: string;
  role?: string;
  email?: string;
}): Promise<UserProfile> {
  await ensureAuthSession();
  const trimmedName = data.name.trim();
  const trimmedDept = data.department.trim();
  const cleanName = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30);
  const normalizedId = `usr_${cleanName || 'staff'}_${Date.now()}`;

  // Create avatar initials
  const words = trimmedName.split(' ').filter(Boolean);
  const avatar = words.length >= 2 
    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
    : trimmedName.slice(0, 2).toUpperCase();

  const newProfile: UserProfile = {
    id: normalizedId,
    name: trimmedName,
    department: trimmedDept,
    role: data.role?.trim() || 'Staff Member',
    email: data.email?.trim() || `${trimmedName.toLowerCase().replace(/\s+/g, '.')}@mediaprima.com.my`,
    avatar: avatar,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString()
  };

  const path = `users/${normalizedId}`;
  try {
    const userDocRef = doc(db, 'users', normalizedId);
    await setDoc(userDocRef, newProfile);
    console.log('New staff profile successfully registered to Firestore /users:', newProfile);
    return newProfile;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}


// Ensure initial documents exist so screen matches design upon first cloud connection
export async function seedInitialDataIfEmpty(): Promise<void> {
  await ensureAuthSession();

  // 1. Seed System Links (Dev App, Shared App, Calendar Feed, Corporate Portal)
  const linksPath = 'system_links';
  try {
    const snapshot = await getDocs(collection(db, linksPath));
    if (snapshot.empty) {
      for (const link of INITIAL_SYSTEM_LINKS) {
        await setDoc(doc(db, linksPath, link.id), link);
      }
      console.log('Seeded initial system links to Firebase.');
    }
  } catch (error) {
    console.warn('System links seed note:', error);
  }

  // 2. Seed Users
  const usersPath = 'users';
  try {
    const snapshot = await getDocs(collection(db, usersPath));
    if (snapshot.empty) {
      for (const user of INITIAL_USERS) {
        await setDoc(doc(db, usersPath, user.id), user);
      }
      console.log('Seeded initial staff users to Firebase.');
    }
  } catch (error) {
    console.warn('Users seed note:', error);
  }

  // 3. Seed Bookings
  const bookingsPath = 'bookings';
  try {
    const snapshot = await getDocs(collection(db, bookingsPath));
    if (snapshot.empty) {
      for (const booking of INITIAL_BOOKINGS) {
        await setDoc(doc(db, bookingsPath, booking.id), {
          ...booking,
          userId: booking.userId || 'usr_budi_santoso',
          userEmail: booking.userEmail || `${booking.bookedBy.toLowerCase().replace(/\s+/g, '.')}@mediaprima.com.my`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.warn('Initial seed deferred:', error);
  }

  // 4. Seed Historical Sessions
  const histPath = 'historical_sessions';
  try {
    const snapshot = await getDocs(collection(db, histPath));
    if (snapshot.empty) {
      for (const item of INITIAL_HISTORICAL) {
        await setDoc(doc(db, histPath, item.id), {
          ...item,
          userId: 'usr_budi_santoso',
          createdAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.warn('Initial historical seed deferred:', error);
  }
}

// System Links Firestore Operations
export async function saveSystemLinkInFirestore(link: SystemLink): Promise<void> {
  await ensureAuthSession();
  const path = `system_links/${link.id}`;
  try {
    await setDoc(doc(db, 'system_links', link.id), {
      ...link,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSystemLinkInFirestore(linkId: string): Promise<void> {
  await ensureAuthSession();
  const path = `system_links/${linkId}`;
  try {
    await deleteDoc(doc(db, 'system_links', linkId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Firestore Service Operations with standardized Error Handling
export async function createBookingInFirestore(booking: Booking, staffUser?: UserProfile | null): Promise<void> {
  await ensureAuthSession();
  const path = `bookings/${booking.id}`;
  try {
    await setDoc(doc(db, 'bookings', booking.id), {
      ...booking,
      userId: staffUser?.id || auth.currentUser?.uid || 'guest',
      userEmail: staffUser?.email || auth.currentUser?.email || 'rohas@mediaprima.com.my',
      bookedBy: staffUser?.name || booking.bookedBy,
      department: staffUser?.department || booking.department,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBookingInFirestore(bookingId: string, updates: Partial<Booking>): Promise<void> {
  await ensureAuthSession();
  const path = `bookings/${bookingId}`;
  try {
    await updateDoc(doc(db, 'bookings', bookingId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteBookingInFirestore(bookingId: string): Promise<void> {
  await ensureAuthSession();
  const path = `bookings/${bookingId}`;
  try {
    await deleteDoc(doc(db, 'bookings', bookingId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

