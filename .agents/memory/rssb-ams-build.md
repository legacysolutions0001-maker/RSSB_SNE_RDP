---
name: RSSB AMS Windows Build
description: Critical fixes and build approach for the RSSB SNE AMS Electron + React + Firebase desktop app
---

## ESM/CJS conflict — the #1 crash cause
- package.json has `"type": "module"` but Electron main/preload must be CJS
- Fix: rename to `.cjs` extension (`main.cjs`, `preload.cjs`)
- Also add `"type": "commonjs"` to `extraMetadata` in electron-builder config so the packaged asar doesn't override it

**Why:** Node.js treats `.cjs` as CommonJS regardless of `package.json` type field. Without this, Electron crashes before showing any window.

## Building Windows EXE from Replit Linux
- NSIS installer requires Wine on Linux — Wine is NOT available on Replit
- `signAndEditExecutable: false` skips rcedit/Wine for PE resource editing (icon embedding, version info) but NSIS itself still needs Wine
- Solution: GitHub Actions workflow (`.github/workflows/build-windows.yml`) — auto-builds on `windows-latest` runner, publishes to GitHub Releases on every push to main

## pnpm workspace Windows incompatibility
- `pnpm-workspace.yaml` `overrides` section excludes all `win32` native binaries (esbuild, rollup, lightningcss, tailwindcss/oxide)
- Cannot run `pnpm install` on Windows with this workspace config
- Fix: GitHub Actions workflow uses `npm install --legacy-peer-deps` directly in `artifacts/rssb-ams/` and removes `@workspace/api-client-react` workspace dep (never imported in source)

## electron-builder v25 config changes
- `allowDirChange` renamed to `allowToChangeInstallationDirectory`
- `author` field required in package.json
- `signAndEditExecutable: false` skips Wine requirement for rcedit on Linux
- `onlyBuiltDependencies` in pnpm-workspace.yaml must include `electron` for binary download

## Firebase embedded credentials
- Firebase config hardcoded as fallbacks in `src/lib/firebase.ts`
- Also baked via `define` in `vite.config.ts` → `loadEnv` + `import.meta.env.VITE_*`
- EXE works with no `.env` file on the build machine

## GitHub Release URL
- Repo: https://github.com/legacysolutions0001-maker/RSSB_SNE_RDP
- Releases page: https://github.com/legacysolutions0001-maker/RSSB_SNE_RDP/releases
- Tag: `windows-latest` (overwritten on each push)
