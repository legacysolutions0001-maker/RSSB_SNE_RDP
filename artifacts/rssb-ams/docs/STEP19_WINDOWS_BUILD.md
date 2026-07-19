# STEP 19 — Windows EXE Build & Testing Guide

This guide tells you exactly how to build and test the production Windows EXE
on a Windows machine.

---

## Prerequisites (Windows machine)

1. **Node.js v20+** — https://nodejs.org (LTS recommended)
2. **pnpm** — `npm install -g pnpm`
3. **Git** — https://git-scm.com
4. **Windows Build Tools** (for native modules):
   ```
   npm install -g windows-build-tools
   ```
5. An internet connection (Firebase needs it at runtime)

---

## Step-by-Step Build

```bash
# 1. Clone the repository
git clone https://github.com/legacysolutions0001-maker/RSSB_SNE_RDP.git
cd RSSB_SNE_RDP

# 2. Install all dependencies
pnpm install

# 3. Build the Vite production bundle AND the Windows installer in one command
cd artifacts/rssb-ams
pnpm dist
```

The installer will be generated at:
```
artifacts/rssb-ams/release/RSSB SNE Accommodation Management System Setup 1.0.0.exe
```

---

## What `pnpm dist` Does

| Step | Command | What happens |
|------|---------|-------------|
| 1 | `pnpm build` | Vite bundles React + Firebase into `dist/public/` |
| 2 | `electron-builder --win --x64` | Packages the bundle + Electron runtime into an NSIS installer EXE |

---

## Testing the EXE (Step 19 checklist)

After running `pnpm dist`, do the following:

### 1. Install the EXE
Run `release/RSSB SNE Accommodation Management System Setup 1.0.0.exe`

### 2. Launch and log in as Super Admin
- Username: `bhagwan01`
- Password: `Bhagwan_01`

### 3. Verify every page opens
- Dashboard ✓
- Applicants ✓
- Add Applicant ✓
- Reports ✓
- Export ✓
- Backup ✓
- Admins ✓
- Settings ✓
- About ✓

### 4. Create a new Admin
Go to **Admins → Add Admin**, fill every field, submit.

### 5. Log out → Log in as new Admin
Verify dashboard loads with restricted menu (no Admins page).

### 6. Applicant CRUD
Create → Edit → Delete an applicant. Verify Firestore after each step.

### 7. Restart test
Close EXE completely → re-open → log in again → repeat 3× minimum.

### 8. Open Electron DevTools
Press `Ctrl+Shift+I` (or from menu) — check Console for errors.

---

## Fixes applied in this build (blank screen root causes resolved)

| # | Issue | Fix |
|---|-------|-----|
| 1 | Firebase not initialising in EXE | Hardcoded fallback values in `firebase.ts` — credentials are always embedded |
| 2 | Blank screen on GPU-limited Windows machines | `app.disableHardwareAcceleration()` added to `electron/main.js` |
| 3 | `db` was typed `Firestore \| null`, causing runtime crashes | `requireDb()` guard added in `db.ts` |
| 4 | Renderer crash → permanent white screen | `render-process-gone` handler auto-reloads the window |
| 5 | `did-fail-load` not handled | Added handler with 1 s retry + inline error page as last resort |
| 6 | `vite.config.ts` missing `async` keyword | Fixed — build no longer fails |
| 7 | Firebase vars not baked into build | `loadEnv` + `define` in `vite.config.ts` bakes them at compile time |
| 8 | `auth.ts` / `AuthContext.tsx` had unnecessary null checks | Removed now that Firebase is always configured |
