/**
 * SentinelX — Electron Main Process
 * Creates the desktop window and manages the application lifecycle.
 */

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let pythonProcess;

// ─── Window Creation ──────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'SentinelX — Security System',
    backgroundColor: '#050a14',
    frame: true,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false, // Allow API calls to localhost in dev
    },
    icon: path.join(__dirname, 'icon.png'),
  });

  // Load the React app
  if (isDev) {
    // Development: load from React dev server
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load built React files
    mainWindow.loadFile(path.join(__dirname, '../frontend/build/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });

  // Show window when ready (prevents white flash)
  mainWindow.once('ready-to-show', () => mainWindow.show());
}


// ─── Python Backend ───────────────────────────────────────────────────────────

function startPythonBackend() {
  const backendPath = path.join(__dirname, '../backend');
  const python = process.platform === 'win32' ? 'python' : 'python3';

  console.log('[Electron] Starting Python backend...');

  pythonProcess = spawn(python, ['-m', 'uvicorn', 'main:app', '--host', '0.0.0.0', '--port', '8000'], {
    cwd: backendPath,
    stdio: 'pipe',
    env: { ...process.env },
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[Backend] ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`[Backend] Process exited with code ${code}`);
  });

  pythonProcess.on('error', (err) => {
    console.error('[Backend] Failed to start:', err.message);
    dialog.showErrorBox(
      'Backend Error',
      'Failed to start the Python backend.\n\nMake sure Python is installed and dependencies are set up:\n\n  pip install -r requirements.txt\n  cd backend && uvicorn main:app --port 8000'
    );
  });
}


// ─── App Lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  // Start Python backend before creating window
  startPythonBackend();

  // Small delay to allow backend to start
  setTimeout(createWindow, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  // Kill Python process on exit
  if (pythonProcess) {
    console.log('[Electron] Killing Python backend...');
    pythonProcess.kill();
  }
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (pythonProcess) pythonProcess.kill();
});


// ─── IPC Handlers ─────────────────────────────────────────────────────────────

ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
});

ipcMain.handle('show-save-dialog', async () => {
  return dialog.showSaveDialog(mainWindow, {
    defaultPath: 'sentinel_report.json',
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
});
