# GHR Workspaces — Room Booking System

> Enterprise scheduling desk, room reservation portal, and live facility availability matrix for corporate meeting rooms, war rooms, and executive suites. Powered by **Firebase Cloud Firestore & Authentication**.

![GHR Workspaces](https://lh3.googleusercontent.com/aida-public/AB6AXuCThCf87nBWS8Q1Yy2HtUqYeGcs0MwcGa6ann0le8Pni9A44Ize7xCGJBsmCVkAavZp1TFbnq733YF61_SfD7kLZFjGUqD-F0wsre4r8D0jAMN_bl_LsuCAZx9iVbQLeIWTLhA465kNaVBYWF51kiSwC1dpRehaicv5uYMuPbx2Si4NYDjMdcUQxs5JhZKLgbxsqHdSTyeUwGSJZLaiKq4yokckqOuz-RxC4LV1RETUdELloNVXdnVL)

[![Version](https://img.shields.io/badge/version-2.5.0-emerald.svg)](https://github.com)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-amber.svg)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-teal.svg)](https://tailwindcss.com/)

---

## 🌟 Overview

**GHR Workspaces** is a production-grade corporate workspace management application designed for enterprise teams. It provides frictionless multi-user scheduling, live room inventory management, synchronized digital door panel integration, interactive timeline grids, and instant conflict-free room reservations backed by **Google Cloud & Firebase Firestore**.

### 🔗 Live Environments & Saved Links (Firebase Stored)

All system endpoints are permanently stored and managed in the Firebase `/system_links` collection:

| Endpoint Type | Description | URL |
| :--- | :--- | :--- |
| **Development App** | Active real-time development environment | `https://ais-dev-6uq7gwyj2bbjg7ehgbxd77-183154733016.asia-southeast1.run.app` |
| **Shared Preview** | Public stakeholder preview deployment | `https://ais-pre-6uq7gwyj2bbjg7ehgbxd77-183154733016.asia-southeast1.run.app` |
| **Calendar iCal Feed** | RFC 5545 auto-updating iCalendar subscription feed | `https://workspaces.ghr-corp.internal/v2/cal/feed-budi.santoso@ghr.corp.ics` |
| **Corporate Portal** | Enterprise intranet & SSO portal | `https://portal.mediaprima.com.my` |

---

## ✨ Key Features (Latest v2.5.0)

### 1. 👥 Multi-User Sign Up & Log In (Nama & Jabatan)
- **Setiap Pengguna Baharu Terus Masuk ke Firebase:** Sebaik sahaja pengguna mengisi borang **Sign Up (Daftar Pengguna Baharu)** dengan Nama, Jabatan, dan Peranan, profil tersebut terus dicipta sebagai dokumen baharu dalam koleksi `/users` di Cloud Firestore.
- **Penyegerakan Berbilang Peranti (Real-Time Sync):** Semua peranti dan staf lain akan serta-merta melihat staf baharu tersebut dalam senarai direktori staf Firestore secara langsung tanpa perlu menyegar semula halaman.
- **Frictionless Authentication:** Staf boleh log masuk atau mendaftar akaun baharu serta-merta hanya dengan memasukkan **Nama Penuh** dan **Jabatan** (contoh: *Budi Santoso*, *Siti Aisyah*, *Ahmad Razak* dari *People & Operations*, *Engineering & Technology*, dsb.).
- **Cloud Persistence (`/users`):** Profil setiap staf disimpan secara automatik dalam pangkalan data Cloud Firestore lengkap dengan peranan, avatar, dan rekod masa log masuk terkini.
- **Pilih Pantas Profil (1-Click Switch):** Modal interaktif membolehkan pertukaran antara profil staf yang telah berdaftar dengan satu klik sahaja.
- **Sokongan Tempahan Berbilang Staf:** Tempahan bilik baharu secara automatik dikaitkan dengan profil staf aktif.
- **Penapis Skop Tempahan:** Pilihan togol antara **"Tempahan Saya"** (paparan peribadi) dan **"Semua Staf"** (paparan keseluruhan organisasi).

### 2. 🔗 Pengurusan Semua Pautan dalam Firebase (`/system_links`)
- **Penyimpanan Berpusat:** Semua pautan sistem, pautan pratonton, portal intranet, dan suapan kalendar disimpan kekal di Firestore.
- **Antara Muka Pengurusan Pautan (Links Modal):** 
  - Butang akses pantas **"Pautan Firebase"** pada bar navigasi atas.
  - Tambah pautan baharu dengan Tajuk, URL, Kategori (*App, Shared, Calendar, Portal, Resource*), dan Penerangan.
  - Salin pautan ke papan klip (*One-click copy*) atau buka terus ke tab baharu (*Direct open*).
  - Padam pautan lapuk secara masa nyata (*Real-time deletion*).

### 3. 📅 Enterprise Scheduling Desk ("My Bookings")
- **Active Reservations:** Monitor upcoming sessions with real-time countdown badges and automated room lock indicators.
- **KPI Dashboards:** Live tracking of reserved slots, completed sessions this month, and optimal floor utilization ratings (dynamically updated upon cancellations).
- **Instant Search & Filter:** Search by meeting purpose, host, room name, department, or reservation ID, with segmented room pills (*All Rooms*, *GHR Meeting Room*, *GHR War Room*) and sorting (*Upcoming first / Latest first*).
- **Calendar Integration (.ics):** Download valid RFC 5545 `.ics` calendar invitation files directly compatible with Microsoft Outlook, Apple Calendar, and Google Calendar.
- **Reschedule & Modify:** Seamlessly reschedule sessions to available time slots or update meeting notes, reserved amenities, and attendee counts.
- **One-Click Cancellation:** Safety warning dialog with instant automatic slot release back into the live facility matrix.
- **Historical Session Archive:** Re-book previous recurring sessions with a single click.

### 4. 🏢 Room Reservation Catalog ("Book a Room")
- **Katalog Bilik Eksklusif (Level 3, Anjung Riong):**
  - **GHR Meeting Room:** Kapasiti 10 pax, dilengkapi Projektor, Video Bar 4K, Enterprise Mesh, dan Papan Putih. Lokasi: *Level 3, Anjung Riong*.
  - **GHR War Room:** Kapasiti 18 pax, dilengkapi Skrin Digital Berkembar (Dual Smart Display), Panel Akustik Kayu, Polycom Studio, dan Enterprise Mesh. Lokasi: *Level 3, Anjung Riong*.
- **Instant Booking Wizard:** Borang tempahan pantas menyokong pemilihan masa mula, tempoh mesyuarat (30 minit hingga 2 jam), butiran staf, keperluan AV khas, dan nota persediaan.

### 5. 📊 Live Room Availability Matrix ("Room Availability Matrix")
- **Facility Time Grid:** Hourly schedule matrix from 08:00 AM to 06:00 PM for all conference suites.
- **Date Navigation:** Jump between today, yesterday, tomorrow, or select any custom date.
- **Click-to-Book:** Click any open matrix slot to pre-fill and launch the reservation flow for that specific room and time slot.
- **Status Coding:** Distinguishes confirmed user locks, department sessions, and vacant slots.

### 6. 📅 Google Calendar API & Workspace Integration
- **OAuth 2.0 Google Workspace:** Kebenaran OAuth Google Calendar telah diprovisikan untuk projek Cloud `gen-lang-client-0787684666`.
- **1-Click Google Calendar Sync:** Segerakkan mana-mana tempahan bilik mesyuarat terus ke akaun Google Calendar pengguna secara langsung.
- **Pautan Terus ke Acara Google:** Setiap tempahan yang disegerakkan menerima pautan unik `htmlLink` yang boleh dibuka serta-merta di `calendar.google.com`.
- **Segerak Pukal (*Sync All*):** Butang "Segerak Semua" memasukkan semua tempahan yang aktif ke kalendar Google pengguna sekali gus.
- **Pratonton Acara Masa Nyata:** Memuatkan senarai acara Google Calendar pengguna secara langsung dari API untuk mengelakkan sebarang pertembungan waktu.
- **Perlindungan Data & Pengesahan:** Tindakan memadam acara dari Google Calendar memerlukan dialog pengesahan eksplisit pengguna per panduan keselamatan Google Workspace.
- **Pilihan Tradisional (.ics & iCal Feed):** Sokongan fail `.ics` dan suapan langganan iCal masih disediakan untuk pengguna Microsoft Outlook dan Apple Calendar.

---

## ☁️ Firebase Architecture & Cloud Configuration

The application is fully integrated with Google Cloud Firebase:

```
Firebase Project ID:     gen-lang-client-0787684666
Firestore Region:        asia-southeast1
Firestore Database ID:   ai-studio-ghrworkspaces-8fd2a727-5be0-480e-939c-fc60fc862d57
```

### Firestore Collections Structure:
- `/users/{userId}`: Staff profiles (Name, Department, Role, Email, Avatar, Login timestamps).
- `/system_links/{linkId}`: System endpoints, deployment URLs, calendar feeds, and custom links.
- `/bookings/{bookingId}`: Live meeting room reservations, host metadata, locked time slots, and amenities.
- `/historical_sessions/{sessionId}`: Completed and archived meeting sessions for analytical logging.

---

## 🛠️ Tech Stack

- **Frontend Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Backend & Cloud Persistence:** [Firebase v12+](https://firebase.google.com/) (Cloud Firestore & Firebase Authentication)
- **Build Tool:** [Vite 8](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- **Typography:** [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Headlines) & [Inter](https://fonts.google.com/specimen/Inter) (Body & Data)
- **Icons:** [Google Material Symbols Outlined](https://fonts.google.com/icons) & [Lucide Icons](https://lucide.dev/)

---

## 📁 Project Structure

```
├── firebase-applet-config.json  # Firebase client connection credentials
├── firebase-blueprint.json      # Firestore schema blueprint definitions
├── firestore.rules              # Production Cloud Firestore security rules
├── index.html                   # HTML entry point with Google Fonts & metadata
├── metadata.json                # AI Studio application metadata
├── package.json                 # Project dependencies and npm scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS v4
├── src/
│   ├── main.tsx                 # React DOM root entry
│   ├── App.tsx                  # Main state coordinator & real-time Firestore listeners
│   ├── firebase.ts              # Firebase initialization, auth handlers, and Firestore CRUD operations
│   ├── index.css                # Tailwind CSS v4 @theme design tokens
│   ├── types.ts                 # Data models, interfaces, and initial datasets
│   ├── utils/
│   │   └── ics.ts               # RFC 5545 iCalendar (.ics) generator and downloader
│   └── components/
│       ├── Header.tsx           # Enterprise top bar with multi-user info & links trigger
│       ├── Footer.tsx           # Portal footer with cloud readiness indicator
│       ├── AuthModal.tsx        # Multi-user Sign In / Sign Up modal (Nama & Jabatan)
│       ├── LinksModal.tsx       # Firebase System Links manager (Add, Copy, Open, Delete)
│       ├── MyBookingsView.tsx   # Enterprise scheduling desk screen with scope toggle
│       ├── BookRoomView.tsx     # Workspace inventory catalog & reservation screen
│       ├── MatrixView.tsx       # Live facility timeline matrix grid (08:00 AM - 06:00 PM)
│       ├── CancellationModal.tsx # Cancellation confirmation modal
│       ├── RescheduleModal.tsx  # Reschedule session modal
│       ├── ModifyDetailsModal.tsx # Booking details editor modal
│       ├── NewReservationModal.tsx # Workspace reservation modal
│       ├── SyncCalendarModal.tsx # Outlook & corporate calendar sync modal
│       └── Toast.tsx            # Synchronized action toast notifications
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have Node.js (v18 or higher) and npm installed.

```bash
node -v
npm -v
```

### Installation

1. Clone your repository:
   ```bash
   git clone https://github.com/your-username/ghr-workspaces.git
   cd ghr-workspaces
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

Build the optimized production assets:
```bash
npm run build
```

The compiled output will be generated in the `dist/` directory.

### Code Linting & Validation

Run TypeScript type-checking and lint validation:
```bash
npm run lint
```

---

## 📄 License

Distributed under the Apache-2.0 License.
