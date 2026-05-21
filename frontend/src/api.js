/**
 * SentinelX API Service
 * Centralized axios-based API calls to the FastAPI backend.
 */

import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});

// ─── Auth ────────────────────────────────────────────────────────────────────

export const attemptLogin = async (password, image_b64 = null) => {
  const res = await api.post('/api/login', { password, user_id: 'default', image_b64 });
  return res.data;
};

// ─── Status ──────────────────────────────────────────────────────────────────

export const getStatus = async () => {
  const res = await api.get('/api/status');
  return res.data;
};

// ─── Device Control ──────────────────────────────────────────────────────────

export const lockDevice = async () => {
  const res = await api.post('/api/lock');
  return res.data;
};

export const unlockDevice = async () => {
  const res = await api.post('/api/unlock');
  return res.data;
};

// ─── Files ───────────────────────────────────────────────────────────────────

export const encryptFiles = async () => {
  const res = await api.post('/api/encrypt');
  return res.data;
};

export const decryptFiles = async () => {
  const res = await api.post('/api/decrypt');
  return res.data;
};

export const wipeFiles = async () => {
  const res = await api.post('/api/wipe');
  return res.data;
};

// ─── Tracking ────────────────────────────────────────────────────────────────

export const getLocation = async () => {
  const res = await api.get('/api/location');
  return res.data;
};

// ─── Logs & Images ───────────────────────────────────────────────────────────

export const getLogs = async () => {
  const res = await api.get('/api/logs');
  return res.data;
};

export const getImages = async () => {
  const res = await api.get('/api/images');
  return res.data;
};

export const clearLogs = async () => {
  const res = await api.delete('/api/logs/clear');
  return res.data;
};

export const IMAGE_BASE = API_BASE;
