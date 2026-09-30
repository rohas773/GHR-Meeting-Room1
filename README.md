# GHR Workspaces — Room Booking System

> Enterprise room booking system, staff scheduling desk, and live facility availability matrix for corporate meeting rooms, war rooms, and executive workspaces. Powered by **Firebase Cloud Firestore & Authentication**.

![GHR Workspaces](https://lh3.googleusercontent.com/aida-public/AB6AXuCThCf87nBWS8Q1Yy2HtUqYeGcs0MwcGa6ann0le8Pni9A44Ize7xCGJBsmCVkAavZp1TFbnq733YF61_SfD7kLZFjGUqD-F0wsre4r8D0jAMN_bl_LsuCAZx9iVbQLeIWTLhA465kNaVBYWF51kiSwC1dpRehaicv5uYMuPbx2Si4NYDjMdcUQxs5JhZKLgbxsqHdSTyeUwGSJZLaiKq4yokckqOuz-RxC4LV1RETUdELloNVXdnVL)

[![Version](https://img.shields.io/badge/version-2.6.0-emerald.svg)](https://github.com/rohas773/GHR-Meeting-Room1)
[![GitHub Repository](https://img.shields.io/badge/GitHub-rohas773%2FGHR--Meeting--Room1-181717?logo=github)](https://github.com/rohas773/GHR-Meeting-Room1)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-amber.svg)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-teal.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-Apache--2.0-lightgrey.svg)](LICENSE)

---

## 🌟 Overview

**GHR Workspaces** is a production-ready meeting room and facility management portal built for enterprise corporate teams. It enables multi-user scheduling, real-time availability matrices, digital door panel synchronization, instant collision prevention, and direct calendar integrations backed by **Google Cloud & Firebase Firestore**.

The entire application interface, error handling, notifications, and documentation are designed in professional corporate English.

### 🔗 Live Environments & Endpoints

All live endpoints are persisted and managed directly within the Firebase `/system_links` Firestore collection:

| Endpoint Type | Description | URL |
| :--- | :--- | :--- |
| **GitHub Repository** | Official project source code repository | [`https://github.com/rohas773/GHR-Meeting-Room1`](https://github.com/rohas773/GHR-Meeting-Room1) |
| **Development App** | Real-time containerized development environment | `https://ais-dev-7l757wx7zep4bz7dzis4ri-367744798312.asia-southeast1.run.app` |
| **Shared Preview** | Public stakeholder preview deployment | `https://ais-pre-7l757wx7zep4bz7dzis4ri-367744798312.asia-southeast1.run.app` |
| **Calendar iCal Feed** | RFC 5545 auto-updating iCalendar subscription feed | `https://workspaces.ghr-corp.internal/v2/cal/feed-budi.santoso@ghr.corp.ics` |
| **Corporate Portal** | Enterprise intranet identity directory | `https://portal.mediaprima.com.my` |

---

## ✨ Key Features (Latest Version)

### 1. 👥 Multi-User Staff Profile & Authentication
- **Instant Firestore Registration (`/users`):** When a user registers a new account with their Full Name, Department, and Role, the profile is immediately saved as a document in Cloud Firestore.
- **Real-Time Cross-Device Sync:** Any new colleague registration or active session update is synced to all connected devices without page refreshes.
- **Frictionless Sign In:** Staff can sign in or switch profiles by providing their Full Name and Department (e.g., *Budi Santoso*, *Siti Aisyah*, *Ahmad Razak*, *Farid Kamil* across *People & Operations*, *Engineering & Technology*, *Finance & Procurement*, *Corporate Strategy*, etc.).
- **Quick-Switch Directory:** An interactive staff selector modal enables switching between registered corporate profiles with one click.
- **Google Account Linking:** Automatic synchronization of profile details with Google accounts via Google Workspace OAuth.

### 2. 🛡️ Overlapping Booking Prevention & Conflict Rejection
- **Zero Double-Booking Guarantee:** The system automatically inspects all confirmed reservations for the selected room, date, and time span (start time to end time).
- **Instant Pre-Validation:** As users choose a room, date, start time, or duration in the New Reservation wizard, conflicts are detected and highlighted in real-time.
- **Authoritative Submission Rejection:** If an overlapping slot is requested, the booking is rejected immediately with a descriptive alert identifying who has already reserved the slot, their department, time slot, and meeting purpose.
- **Reschedule Conflict Guard:** The reschedule modal validates all alternative time slots against existing reservations, disabling occupied intervals and showing the host who locked the slot.

### 3. 👥 Colleagues' Bookings Inspector & 3-Way Scope Switcher
- **3-Way Scope Filter:**
  - 🌟 **All Bookings:** Complete organizational overview of all active reservations across all departments.
  - 👤 **My Bookings:** Focused view of sessions hosted by the currently active staff user.
  - 👥 **Colleagues' Bookings:** Clear view of reservations made by teammates and other divisions.
- **Visual Distinction:** Distinct color coding across booking cards and availability matrices:
  - **Teal / Emerald:** User's own reservations.
  - **Indigo / Slate:** Colleagues' reservations with department tags.
- **Interactive Details Inspector (`ViewBookingDetailsModal`):** Click any card or occupied block in the matrix to view host details, department, room equipment, notes, attendance count, and calendar shortcuts.
- **Ownership Protection:** Non-owners can view detailed reservation information while edit, reschedule, and cancellation controls remain securely restricted to the booking owner.

### 4. 📅 Enterprise Scheduling Desk ("Bookings & Schedule")
- **Active Reservations:** Monitor upcoming sessions with dynamic time indicators and automated lock statuses.
- **Real-Time Search & Filters:** Filter by meeting purpose, staff name, department, room venue (*All Rooms*, *GHR Meeting Room*, *GHR War Room*), or reservation ID.
- **KPI Metrics:** Track total active bookings, colleagues' sessions, and monthly completed archives.
- **Export & Calendar Support:** Download valid RFC 5545 `.ics` calendar files directly compatible with Microsoft Outlook, Apple Calendar, and Google Calendar.
- **30-Day Historical Archive:** View completed meetings and re-book recurring sessions in one click.

### 5. 🏢 Meeting Room Catalog ("Book a Room")
- **Facility Inventory (Level 3, Anjung Riong):**
  - **GHR Meeting Room (`MR-301`):** Capacity 10 pax. Features 4K Video Bar, High-Definition Projector, Enterprise Mesh Wi-Fi, and Whiteboard.
  - **GHR War Room (`WR-302`):** Capacity 18 pax. Features Dual Smart Displays, Acoustic Wood Wall Panels, Polycom Studio Audio, and Enterprise Mesh Wi-Fi.
- **Live Availability Badges:** Each room card displays whether the venue is **Available** or **Booked** for the selected date and time, showing conflict details directly on the card.
- **Filter by Capacity & Amenities:** Filter rooms by size (*Small 1-6*, *Medium 7-12*, *Large 13+*), floor, and required equipment.

### 6. 📊 Room Availability Matrix ("Room Availability Matrix")
- **Hourly Timeline Grid:** Interactive facility grid from 08:00 AM to 06:00 PM for all rooms.
- **Day-by-Day Navigation:** Seamlessly browse yesterday, today, tomorrow, or any chosen calendar date.
- **Click-to-Book:** Click any open slot to open the booking wizard pre-populated with the chosen room and time.
- **Occupied Slot Preview:** Hover or click occupied blocks to inspect the meeting purpose and host details.

### 7. 🗓️ Google Calendar API & Google Workspace Integration
- **Google Workspace OAuth 2.0:** Verified OAuth scopes (`calendar`, `calendar.events`, `calendar.readonly`).
- **1-Click Google Calendar Sync:** Push reservations directly into your personal Google Calendar account.
- **Direct Event Links:** Each synced booking receives a direct `htmlLink` opening the event in `calendar.google.com`.
- **Bulk Sync ("Sync All"):** Sync all confirmed reservations to Google Calendar in a single operation.
- **Live Event Inspection:** Fetches live events from Google Calendar to prevent scheduling overlap with personal meetings.
- **Explicit Deletion Confirmation:** Removing events requires user confirmation per Google Workspace security standards.
- **iCal Subscription Feed:** Auto-updating subscription link for Microsoft Outlook and Apple Calendar.

### 8. 🔗 Firebase System Links Manager (`/system_links`)
- **Centralized Links Storage:** System URLs, development environments, shared links, and internal portals are stored in Firestore.
- **Interactive Management Modal:** View, add, copy, open in a new tab, or delete stored links with real-time synchronization.

---

## ☁️ Firebase Architecture & Cloud Configuration

The application is connected to Google Cloud Firebase:

```
Firebase Project ID:     gen-lang-client-0787684666
Firestore Region:        asia-southeast1
Firestore Database ID:   ai-studio-ghrworkspaces-8fd2a727-5be0-480e-939c-fc60fc862d57
```

### Firestore Collections Structure

- `/users/{userId}`: Staff user profiles (Full Name, Department, Role, Corporate Email, Avatar, Timestamps).
- `/bookings/{bookingId}`: Room bookings, host profile, room ID, start/end time, duration, purpose, lock type, amenities, and Google Calendar links.
- `/system_links/{linkId}`: Deployment endpoints, calendar feeds, and corporate URLs.
- `/historical_sessions/{sessionId}`: Archived completed meeting logs.

---

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Backend & Cloud Persistence:** [Firebase v12+](https://firebase.google.com/) (Cloud Firestore & Authentication)
- **Bundler & Build Tool:** [Vite 8](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- **Typography:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) & [Inter](https://fonts.google.com/specimen/Inter)
- **Icons:** [Google Material Symbols Outlined](https://fonts.google.com/icons) & [Lucide Icons](https://lucide.dev/)

---

## 📁 Project Structure

```
├── firebase-applet-config.json    # Firebase client configuration
├── firebase-blueprint.json        # Database schema specifications
├── firestore.rules                # Production Cloud Firestore security rules
├── index.html                     # HTML entry point with meta tags & fonts
├── metadata.json                  # AI Studio project metadata
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript compiler settings
├── vite.config.ts                 # Vite bundler & Tailwind CSS v4 setup
├── src/
│   ├── main.tsx                   # React root entry point
│   ├── App.tsx                    # Core state coordinator & Firestore listeners
│   ├── firebase.ts                # Firebase SDK initialization, auth & CRUD operations
│   ├── index.css                  # Tailwind CSS v4 directives & theme styles
│   ├── types.ts                   # Data models, interfaces & seed datasets
│   ├── utils/
│   │   ├── bookingValidation.ts   # Overlap detection & conflict validation engine
│   │   └── ics.ts                 # RFC 5545 iCalendar (.ics) export generator
│   └── components/
│       ├── Header.tsx             # Navigation bar with staff profile & links indicator
│       ├── Footer.tsx             # Application footer with cloud status
│       ├── AuthModal.tsx          # Multi-user Sign In / Sign Up modal
│       ├── LinksModal.tsx         # Firebase System Links manager
│       ├── MyBookingsView.tsx     # Reservations desk with 3-way scope switcher
│       ├── BookRoomView.tsx       # Room inventory catalog with live availability badges
│       ├── MatrixView.tsx         # Interactive facility availability schedule grid
│       ├── ViewBookingDetailsModal.tsx # Detailed reservation inspector modal
│       ├── NewReservationModal.tsx # Booking wizard with instant conflict rejection
│       ├── RescheduleModal.tsx    # Reschedule modal with slot overlap prevention
│       ├── ModifyDetailsModal.tsx # Meeting details & amenities editor
│       ├── CancellationModal.tsx  # Cancellation confirmation modal
│       ├── SyncCalendarModal.tsx  # Google Calendar OAuth & iCal sync modal
│       └── Toast.tsx              # Action feedback toast notification
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

```bash
node -v
npm -v
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/rohas773/GHR-Meeting-Room1.git
   cd GHR-Meeting-Room1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

Compile optimized production assets:
```bash
npm run build
```

Production build artifacts will be placed in the `dist/` folder.

### Code Linting & Validation

Verify TypeScript types and codebase integrity:
```bash
npm run lint
```

---

## 📄 License

This project is licensed under the Apache-2.0 License.
