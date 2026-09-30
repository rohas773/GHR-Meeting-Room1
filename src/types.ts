export interface Room {
  id: string;
  name: string;
  code: string;
  floor: string;
  wing: string;
  capacity: number;
  image: string;
  amenities: string[];
  description: string;
  statusText: string;
  isAvailableToday: boolean;
  availableSlotsCount: number;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  location: string;
  date: string; // e.g. "Today, 24 Oct 2024" or "Monday, 28 Oct 2024"
  dateString: string; // "2024-10-24"
  startTime: string; // "02:00 PM"
  endTime: string; // "03:00 PM"
  duration: string; // "1 Hour Duration"
  purpose: string;
  bookedBy: string;
  department: string;
  status: 'CONFIRMED' | 'UPCOMING' | 'IN_SESSION' | 'CANCELLED';
  urgencyBadge: string; // "Starts in 2 hours" or "Next Monday"
  lockType: string; // "Active Slot Locked" or "Advanced Lock"
  amenities: string[];
  image: string;
  notes?: string;
  attendeesCount?: number;
  userId?: string;
  userEmail?: string;
  googleCalendarEventId?: string;
  googleCalendarLink?: string;
  isSyncedToGoogle?: boolean;
}

export interface HistoricalSession {
  id: string;
  date: string;
  dateString: string;
  time: string;
  roomId: string;
  roomName: string;
  purpose: string;
  host: string;
  duration: string;
  status: 'Completed' | 'Archived';
}

export interface UserProfile {
  id: string;
  name: string;
  department: string;
  role?: string;
  email?: string;
  avatar?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface SystemLink {
  id: string;
  title: string;
  url: string;
  category: 'App' | 'Shared' | 'Calendar' | 'Resource' | 'Portal';
  description?: string;
  isCurrent?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type?: 'success' | 'info' | 'error';
}

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr_budi_santoso',
    name: 'Budi Santoso',
    department: 'People & Operations',
    role: 'Lead Operations Executive',
    email: 'rohas@mediaprima.com.my',
    avatar: 'BS',
    createdAt: '2024-10-01T08:00:00Z',
    lastLoginAt: '2024-10-24T09:00:00Z'
  },
  {
    id: 'usr_siti_aisyah',
    name: 'Siti Aisyah',
    department: 'Engineering & Technology',
    role: 'Senior Software Engineer',
    email: 'siti.aisyah@mediaprima.com.my',
    avatar: 'SA',
    createdAt: '2024-10-05T08:00:00Z',
    lastLoginAt: '2024-10-24T10:15:00Z'
  },
  {
    id: 'usr_ahmad_razak',
    name: 'Ahmad Razak',
    department: 'Finance & Procurement',
    role: 'Finance Manager',
    email: 'ahmad.razak@mediaprima.com.my',
    avatar: 'AR',
    createdAt: '2024-10-10T08:00:00Z',
    lastLoginAt: '2024-10-23T14:30:00Z'
  },
  {
    id: 'usr_farid_kamil',
    name: 'Farid Kamil',
    department: 'Corporate Strategy',
    role: 'Strategy Analyst',
    email: 'farid.kamil@mediaprima.com.my',
    avatar: 'FK',
    createdAt: '2024-10-12T08:00:00Z',
    lastLoginAt: '2024-10-24T11:00:00Z'
  }
];

export const INITIAL_SYSTEM_LINKS: SystemLink[] = [
  {
    id: 'link_dev_app',
    title: 'Development App URL',
    url: 'https://ais-dev-6uq7gwyj2bbjg7ehgbxd77-183154733016.asia-southeast1.run.app',
    category: 'App',
    description: 'Active live development environment with real-time dev server.',
    isCurrent: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'link_shared_app',
    title: 'Shared Production Preview URL',
    url: 'https://ais-pre-6uq7gwyj2bbjg7ehgbxd77-183154733016.asia-southeast1.run.app',
    category: 'Shared',
    description: 'Public preview deployment URL for stakeholder & room tablet usage.',
    isCurrent: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'link_calendar_feed',
    title: 'Exchange / iCal Calendar Feed',
    url: 'https://workspaces.ghr-corp.internal/v2/cal/feed-budi.santoso@ghr.corp.ics',
    category: 'Calendar',
    description: 'RFC 5545 auto-updating iCalendar subscription feed for Microsoft 365.',
    isCurrent: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'link_corp_portal',
    title: 'Corporate Employee Portal',
    url: 'https://portal.mediaprima.com.my',
    category: 'Portal',
    description: 'Main enterprise intranet & SSO identity directory.',
    isCurrent: false,
    createdAt: new Date().toISOString()
  }
];


export const INITIAL_ROOMS: Room[] = [
  {
    id: 'meeting',
    name: 'GHR Meeting Room',
    code: 'MR-301',
    floor: 'Level 3, Anjung Riong',
    wing: 'Anjung Riong',
    capacity: 10,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCThCf87nBWS8Q1Yy2HtUqYeGcs0MwcGa6ann0le8Pni9A44Ize7xCGJBsmCVkAavZp1TFbnq733YF61_SfD7kLZFjGUqD-F0wsre4r8D0jAMN_bl_LsuCAZx9iVbQLeIWTLhA465kNaVBYWF51kiSwC1dpRehaicv5uYMuPbx2Si4NYDjMdcUQxs5JhZKLgbxsqHdSTyeUwGSJZLaiKq4yokckqOuz-RxC4LV1RETUdELloNVXdnVL',
    amenities: ['Projector', 'Video Bar 4K', 'Enterprise Mesh', 'Whiteboard'],
    description: 'Corporate meeting room at Level 3, Anjung Riong featuring glass partitions, mahogany oval conference table, black ergonomic mesh chairs, and 4K video conferencing.',
    statusText: '1 Available Slot',
    isAvailableToday: true,
    availableSlotsCount: 1,
  },
  {
    id: 'warroom',
    name: 'GHR War Room',
    code: 'WR-302',
    floor: 'Level 3, Anjung Riong',
    wing: 'Anjung Riong',
    capacity: 18,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhg_6H0wnnWoJVo8Nv9U9QdAhsf1tz2-5H5zzkQx_KJB90ul3fL7xEXnlwNCeXVC9a3_53p8clPTlhnABnV6fToKJ4JjjTpQEza68LK8PX710uQO5JHiM8ghJHSliDs5-qeY10L1mCaQqR_xWBxSLbrIi1hOO0USLqPCkbRns6vfzfWX72pbaPJECly1zHt644Ri5CDeuOzNyxYcxJbPFXUvRwJOgi8n-Dn5OcXKUWCnRC6Osq7qMU',
    amenities: ['Dual Smart Display', 'Acoustic Wall Panel', 'Polycom Studio', 'Enterprise Mesh'],
    description: 'Strategic operations command center at Level 3, Anjung Riong equipped with dual digital presentation displays, acoustic wood paneling, and high-performance conferencing audio.',
    statusText: 'Fully Booked Today',
    isAvailableToday: false,
    availableSlotsCount: 0,
  }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'BK-90214',
    roomId: 'meeting',
    roomName: 'GHR Meeting Room',
    location: 'Level 3, Anjung Riong • Capacity 10 pax',
    date: 'Today, 24 Oct 2024',
    dateString: '2024-10-24',
    startTime: '02:00 PM',
    endTime: '03:00 PM',
    duration: '1 Hour Duration',
    purpose: 'Sprint Planning & Q4 OKR Review',
    bookedBy: 'Budi Santoso',
    department: 'People & Operations',
    userId: 'usr_budi_santoso',
    status: 'CONFIRMED',
    urgencyBadge: 'Starts in 2 hours',
    lockType: 'Active Slot Locked',
    amenities: ['Projector', 'Video Bar 4K', 'Enterprise Mesh'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCThCf87nBWS8Q1Yy2HtUqYeGcs0MwcGa6ann0le8Pni9A44Ize7xCGJBsmCVkAavZp1TFbnq733YF61_SfD7kLZFjGUqD-F0wsre4r8D0jAMN_bl_LsuCAZx9iVbQLeIWTLhA465kNaVBYWF51kiSwC1dpRehaicv5uYMuPbx2Si4NYDjMdcUQxs5JhZKLgbxsqHdSTyeUwGSJZLaiKq4yokckqOuz-RxC4LV1RETUdELloNVXdnVL',
    notes: 'Please ensure HDMI dongles and presentation clicker are available.',
    attendeesCount: 8,
  },
  {
    id: 'BK-90248',
    roomId: 'warroom',
    roomName: 'GHR War Room',
    location: 'Level 3, Anjung Riong • Capacity 18 pax',
    date: 'Monday, 28 Oct 2024',
    dateString: '2024-10-28',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    duration: '1.5 Hours Duration',
    purpose: 'Cross-Department Alignment with Engineering',
    bookedBy: 'Budi Santoso',
    department: 'People & Operations',
    userId: 'usr_budi_santoso',
    status: 'UPCOMING',
    urgencyBadge: 'Next Monday',
    lockType: 'Advanced Lock',
    amenities: ['Dual Smart Display', 'Acoustic Wall Panel', 'Polycom Studio'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhg_6H0wnnWoJVo8Nv9U9QdAhsf1tz2-5H5zzkQx_KJB90ul3fL7xEXnlwNCeXVC9a3_53p8clPTlhnABnV6fToKJ4JjjTpQEza68LK8PX710uQO5JHiM8ghJHSliDs5-qeY10L1mCaQqR_xWBxSLbrIi1hOO0USLqPCkbRns6vfzfWX72pbaPJECly1zHt644Ri5CDeuOzNyxYcxJbPFXUvRwJOgi8n-Dn5OcXKUWCnRC6Osq7qMU',
    notes: 'Sync with Lead Engineers and HR business partners for technical hiring roadmap.',
    attendeesCount: 14,
  },
  {
    id: 'BK-90301',
    roomId: 'meeting',
    roomName: 'GHR Meeting Room',
    location: 'Level 3, Anjung Riong • Capacity 10 pax',
    date: 'Today, 24 Oct 2024',
    dateString: '2024-10-24',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    duration: '1 Hour Duration',
    purpose: 'Engineering Standup & Mobile App Architecture',
    bookedBy: 'Siti Aisyah',
    department: 'Engineering & Technology',
    userId: 'usr_siti_aisyah',
    status: 'CONFIRMED',
    urgencyBadge: 'Today',
    lockType: 'Active Slot Locked',
    amenities: ['Projector', 'Video Bar 4K', 'Whiteboard'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCThCf87nBWS8Q1Yy2HtUqYeGcs0MwcGa6ann0le8Pni9A44Ize7xCGJBsmCVkAavZp1TFbnq733YF61_SfD7kLZFjGUqD-F0wsre4r8D0jAMN_bl_LsuCAZx9iVbQLeIWTLhA465kNaVBYWF51kiSwC1dpRehaicv5uYMuPbx2Si4NYDjMdcUQxs5JhZKLgbxsqHdSTyeUwGSJZLaiKq4yokckqOuz-RxC4LV1RETUdELloNVXdnVL',
    notes: 'New system architecture discussion with backend development team.',
    attendeesCount: 6,
  },
  {
    id: 'BK-90302',
    roomId: 'warroom',
    roomName: 'GHR War Room',
    location: 'Level 3, Anjung Riong • Capacity 18 pax',
    date: 'Today, 24 Oct 2024',
    dateString: '2024-10-24',
    startTime: '01:00 PM',
    endTime: '03:00 PM',
    duration: '2 Hours Duration',
    purpose: 'Q4 Budget & Procurement Review',
    bookedBy: 'Ahmad Razak',
    department: 'Finance & Procurement',
    userId: 'usr_ahmad_razak',
    status: 'CONFIRMED',
    urgencyBadge: 'Today',
    lockType: 'Active Slot Locked',
    amenities: ['Dual Smart Display', 'Acoustic Wall Panel', 'Polycom Studio'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhg_6H0wnnWoJVo8Nv9U9QdAhsf1tz2-5H5zzkQx_KJB90ul3fL7xEXnlwNCeXVC9a3_53p8clPTlhnABnV6fToKJ4JjjTpQEza68LK8PX710uQO5JHiM8ghJHSliDs5-qeY10L1mCaQqR_xWBxSLbrIi1hOO0USLqPCkbRns6vfzfWX72pbaPJECly1zHt644Ri5CDeuOzNyxYcxJbPFXUvRwJOgi8n-Dn5OcXKUWCnRC6Osq7qMU',
    notes: 'Annual budget review meeting with department leads.',
    attendeesCount: 12,
  },
  {
    id: 'BK-90305',
    roomId: 'meeting',
    roomName: 'GHR Meeting Room',
    location: 'Level 3, Anjung Riong • Capacity 10 pax',
    date: 'Friday, 25 Oct 2024',
    dateString: '2024-10-25',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    duration: '1.5 Hours Duration',
    purpose: 'Digital Transformation & Strategic Planning',
    bookedBy: 'Farid Kamil',
    department: 'Corporate Strategy',
    userId: 'usr_farid_kamil',
    status: 'UPCOMING',
    urgencyBadge: 'Tomorrow',
    lockType: 'Advanced Lock',
    amenities: ['Projector', 'Video Bar 4K', 'Enterprise Mesh'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCThCf87nBWS8Q1Yy2HtUqYeGcs0MwcGa6ann0le8Pni9A44Ize7xCGJBsmCVkAavZp1TFbnq733YF61_SfD7kLZFjGUqD-F0wsre4r8D0jAMN_bl_LsuCAZx9iVbQLeIWTLhA465kNaVBYWF51kiSwC1dpRehaicv5uYMuPbx2Si4NYDjMdcUQxs5JhZKLgbxsqHdSTyeUwGSJZLaiKq4yokckqOuz-RxC4LV1RETUdELloNVXdnVL',
    notes: 'Presentation of 2025 digital transformation roadmap and milestones.',
    attendeesCount: 7,
  }
];

export const INITIAL_HISTORICAL: HistoricalSession[] = [
  {
    id: 'BK-89012',
    date: '18 Oct 2024',
    dateString: '2024-10-18',
    time: '11:00 AM - 12:00 PM',
    roomId: 'meeting',
    roomName: 'GHR Meeting Room',
    purpose: 'Monthly All-Hands 1-on-1',
    host: 'Budi Santoso',
    duration: '60 mins',
    status: 'Completed'
  }
];
