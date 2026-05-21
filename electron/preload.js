/**
 * SentinelX — Electron Preload Script
 * Safely exposes Electron APIs to the React renderer via contextBridge.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  platform: process.platform,
});
