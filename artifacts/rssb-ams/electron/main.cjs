'use strict';
const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// ── Silence Electron security warnings in production ─────────────────────────
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

// ── Prevent blank/black screen on some Windows GPU configurations ─────────────
// Must be called BEFORE app.whenReady()
app.disableHardwareAcceleration();

// ── Single-instance lock ─────────────────────────────────────────────────────
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  let mainWindow = null;

  function createWindow() {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.focus();
      return;
    }

    mainWindow = new BrowserWindow({
      width: 1280,
      height: 800,
      minWidth: 1024,
      minHeight: 700,
      title: 'RSSB SNE Accommodation Management System',
      icon: path.join(__dirname, 'icon.ico'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.cjs'),
        webSecurity: false,
        spellcheck: false,
      },
      show: false,
      backgroundColor: '#f5f0eb',
    });

    if (isDev) {
      mainWindow.loadURL('http://localhost:24949');
      mainWindow.webContents.openDevTools();
    } else {
      const indexPath = path.join(__dirname, '..', 'dist', 'public', 'index.html');

      mainWindow.loadFile(indexPath).catch((err) => {
        console.error('[RSSB AMS] Failed to load index.html:', err.message);
        console.error('[RSSB AMS] Tried path:', indexPath);
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.loadFile(indexPath).catch((e) => {
              console.error('[RSSB AMS] Retry failed:', e.message);
              mainWindow.loadURL(
                `data:text/html,<h2 style="font-family:sans-serif;color:red;padding:40px">` +
                `Failed to load app.<br><small>${e.message}</small></h2>`
              );
            });
          }
        }, 500);
      });
    }

    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      mainWindow.maximize();
    });

    mainWindow.webContents.on('render-process-gone', (_event, details) => {
      console.error('[RSSB AMS] Renderer gone:', details.reason, details.exitCode);
      if (mainWindow && !mainWindow.isDestroyed()) {
        setTimeout(() => mainWindow.reload(), 300);
      }
    });

    mainWindow.on('unresponsive', () => {
      console.warn('[RSSB AMS] Window unresponsive — reloading');
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.reload();
      }
    });

    mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
      console.error('[RSSB AMS] did-fail-load:', errorCode, errorDescription, validatedURL);
      if (errorCode !== -3 && !isDev) {
        const indexPath = path.join(__dirname, '..', 'dist', 'public', 'index.html');
        setTimeout(() => {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.loadFile(indexPath).catch(console.error);
          }
        }, 1000);
      }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  process.on('uncaughtException', (err) => {
    console.error('[RSSB AMS] Uncaught exception:', err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[RSSB AMS] Unhandled rejection:', reason);
  });

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
