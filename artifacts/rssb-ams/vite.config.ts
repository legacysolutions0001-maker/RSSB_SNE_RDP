import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(async ({ mode }) => {
  // Load env vars for the current mode (.env, .env.production, etc.)
  // This makes Firebase credentials available during the build regardless
  // of whether a .env file exists (falls back to process.env).
  const env = loadEnv(mode, process.cwd(), '');

  const rawPort = process.env.PORT;
  const basePath = process.env.BASE_PATH;

  // In the Replit workflow, PORT and BASE_PATH are always injected.
  // For local Electron builds, they may be absent — fall back to safe defaults.
  const port = rawPort ? Number(rawPort) : 3000;

  // For Electron production builds the renderer is loaded via file:// protocol.
  // Assets must use relative paths ('./') or they won't resolve.
  // When BASE_PATH is set (Replit web preview), use it as-is.
  const viteBase = basePath || './';

  // ── Bake Firebase credentials into the production bundle ──────────────────
  // This guarantees credentials are embedded even when there's no .env file
  // at the build machine (e.g. a fresh Windows clone).
  const firebaseDefines: Record<string, string> = {};
  const firebaseKeys = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
    'VITE_FIREBASE_MEASUREMENT_ID',
  ];
  for (const key of firebaseKeys) {
    const value = env[key] || process.env[key] || '';
    if (value) {
      firebaseDefines[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  }

  return {
    base: viteBase,
    plugins: [
      react(),
      tailwindcss(),
      ...(process.env.NODE_ENV !== 'production' &&
      process.env.REPL_ID !== undefined
        ? [
            await import('@replit/vite-plugin-cartographer').then((m) =>
              m.cartographer({
                root: path.resolve(import.meta.dirname, '..'),
              }),
            ),
            await import('@replit/vite-plugin-dev-banner').then((m) =>
              m.devBanner(),
            ),
          ]
        : []),
    ],
    define: {
      // Always define these — even in dev — so the app never accidentally
      // falls through to undefined and shows a misconfigured Firebase error.
      ...firebaseDefines,
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, 'src'),
        '@assets': path.resolve(
          import.meta.dirname,
          '..',
          '..',
          'attached_assets',
        ),
      },
      dedupe: ['react', 'react-dom'],
    },
    root: path.resolve(import.meta.dirname),
    build: {
      outDir: path.resolve(import.meta.dirname, 'dist/public'),
      emptyOutDir: true,
      // Ensure assets are inlined or use relative paths for file:// protocol
      assetsInlineLimit: 10240, // Inline assets < 10KB (covers small icons)
    },
    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
      fs: {
        strict: true,
      },
    },
    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});
