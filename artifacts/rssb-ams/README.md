# RSSB SNE Accommodation Management System

**Organization:** Radha Swami Satsang Beas  
**Department:** SNE Old Enclosure Accommodation  
**Centre:** Rudrapur, Uttarakhand  
**Helpline:** +91 8923940501  

---

## Overview

A professional desktop application for managing accommodation of pilgrims/satsangis arriving at the RSSB centre. Built with React + Firebase + Electron for Windows.

## Features

- **Authentication** — Super Admin & Admin roles
- **Dashboard** — Real-time statistics (total, today, gender, handicap, couple/single counts)
- **Applicant Management** — Add, Edit, View, Delete, Search, Filter
- **Reports** — Export to Excel / PDF / Print
- **Backup & Restore** — JSON backup of all data
- **Admin Management** — Super Admin can create/edit/disable/delete Admins

## Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Firebase Firestore (NoSQL database)
- **Auth:** Firebase Authentication (Email/Password)
- **Desktop:** Electron 33 (Windows EXE)
- **Export:** xlsx, jsPDF

## Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin | bhagwan01 | Rssb@rdp |
| Admin | bhagwan@sne | rdp@sne01 |

## Firebase Setup

See `docs/FIREBASE_SETUP.md` for complete Firebase configuration guide.

## Installation (Windows)

1. Download `RSSB-SNE-AMS-Setup.exe` from releases
2. Run the installer
3. Follow on-screen instructions
4. Launch from Desktop or Start Menu shortcut

## Development

```bash
pnpm install
pnpm --filter @workspace/rssb-ams run dev
```

## Build Windows EXE

```bash
cd artifacts/rssb-ams
pnpm run build
npx electron-builder --win --x64
```

The installer will be in the `release/` folder.
