import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield, AlertTriangle, Lock, RefreshCw, Cpu,
  MapPin, Activity, Image, FileText, Trash2,
  ShieldOff, Key, Database, Wifi
} from 'lucide-react';
import {
  getStatus, getLocation, getLogs, getImages,
  lockDevice, encryptFiles, decryptFiles, wipeFiles, clearLogs,
  IMAGE_BASE
} from '../api';

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color = 'blue', pulse = false }) {
  const colorMap = {
    blue: 'text-sentinel-blue border-sentinel-blue/30',
    red: 'text-sentinel-red border-sentinel-red/30',
    green: 'text-sentinel-green border-sentinel-green/30',
    yellow: 'text-yellow-400 border-yellow-400/30',
  };
  return (
    <div className={`sentinel-card rounded-xl p-5 border ${colorMap[color]}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-sentinel-text-dim tracking-widest mb-1">{label}</p>
          <p className={`font-display text-2xl font-bold ${colorMap[color].split(' ')[0]} ${pulse ? 'threat-high' : ''}`}>
            {value}
          </p>
        </div>
        <Icon className={`w-8 h-8 opacity-60 ${colorMap[color].split(' ')[0]}`} />
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title, color = 'blue' }) {
  const c = color === 'red' ? 'text-sentinel-red' : 'text-sentinel-blue';
  return (
    <div className={`flex items-center gap-2 mb-4 font-display text-sm tracking-widest ${c}`}>
      <Icon className="w-4 h-4" />
      <span>{title}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-current to-transparent opacity-30" />
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success: 'border-sentinel-green text-sentinel-green bg-green-900/20',
    error: 'border-sentinel-red text-sentinel-red bg-red-900/20',
    info: 'border-sentinel-blue text-sentinel-blue bg-blue-900/20',
    warning: 'border-yellow-400 text-yellow-400 bg-yellow-900/20',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 sentinel-card border rounded-lg px-5 py-4 
                     font-mono text-sm max-w-sm shadow-lg ${styles[type]}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{message}</span>
        <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">✕</button>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function Dashboard({ onLock, threatAlert, setThreatAlert }) {
  const [status, setStatus] = useState(null);
  const [location, setLocation] = useState(null);
  const [logs, setLogs] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState({});
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState(null);

  const showToast = (message, type = 'info') => setToast({ message, type });

  const setLoad = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

  const fetchAll = useCallback(async () => {
    try {
      const [s, l, loc, img] = await Promise.all([
        getStatus(), getLogs(), getLocation(), getImages()
      ]);
      setStatus(s);
      setLogs(l.logs || []);
      setLocation(loc);
      setImages(img.images || []);
      setLastRefresh(new Date());
    } catch {
      showToast('Backend offline — start the FastAPI server', 'error');
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Show threat alert from login
  useEffect(() => {
    if (threatAlert) {
      showToast(`🚨 INTRUSION DETECTED — ${threatAlert.message}`, 'error');
    }
  }, [threatAlert]);

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleLock = async () => {
    setLoad('lock', true);
    try {
      await lockDevice();
      showToast('Device locked successfully', 'warning');
      onLock();
    } catch { showToast('Lock failed — backend offline', 'error'); }
    setLoad('lock', false);
  };

  const handleEncrypt = async () => {
    setLoad('encrypt', true);
    try {
      const r = await encryptFiles();
      showToast(`✓ Encrypted ${r.details?.total || 0} file(s)`, 'success');
      fetchAll();
    } catch (e) {
      showToast(e.response?.data?.detail || 'Encryption failed', 'error');
    }
    setLoad('encrypt', false);
  };

  const handleDecrypt = async () => {
    setLoad('decrypt', true);
    try {
      const r = await decryptFiles();
      showToast(`✓ Decrypted ${r.details?.total || 0} file(s)`, 'success');
      fetchAll();
    } catch (e) {
      showToast(e.response?.data?.detail || 'Decryption failed', 'error');
    }
    setLoad('decrypt', false);
  };

  const handleWipe = async () => {
    if (!window.confirm('⚠ This will permanently destroy demo files. Continue?')) return;
    setLoad('wipe', true);
    try {
      const r = await wipeFiles();
      showToast(`🗑 Wiped ${r.details?.total || 0} file(s) securely`, 'warning');
      fetchAll();
    } catch (e) {
      showToast('Wipe failed', 'error');
    }
    setLoad('wipe', false);
  };

  const handleClearLogs = async () => {
    await clearLogs().catch(() => {});
    setLogs([]);
    showToast('Logs cleared', 'info');
  };

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const threatLevel = status?.threat_level || 'LOW';

  const logTypeColor = (type) => {
    const map = {
      INTRUSION_DETECTED: 'text-sentinel-red',
      FAILED_LOGIN: 'text-yellow-400',
      DEVICE_LOCKED: 'text-sentinel-blue',
      FILES_ENCRYPTED: 'text-sentinel-blue',
      FILES_DECRYPTED: 'text-sentinel-green',
      FILES_WIPED: 'text-sentinel-red',
    };
    return map[type] || 'text-sentinel-text-dim';
  };

  const tabs = ['overview', 'logs', 'images', 'location'];

  return (
    <div className="min-h-screen flex flex-col">

      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="border-b border-sentinel-border bg-sentinel-panel/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Shield className="w-8 h-8 text-sentinel-blue" />
              {threatLevel === 'HIGH' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-sentinel-red rounded-full animate-ping-slow" />
              )}
            </div>
            <div>
              <h1 className="font-display font-black text-xl text-neon-blue tracking-widest">SENTINELX</h1>
              <p className="font-mono text-xs text-sentinel-text-dim">Security Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Threat level badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-xs ${
              threatLevel === 'HIGH'
                ? 'border-sentinel-red text-sentinel-red bg-red-900/20 threat-high'
                : 'border-sentinel-green text-sentinel-green bg-green-900/20'
            }`}>
              <div className={`w-2 h-2 rounded-full ${threatLevel === 'HIGH' ? 'bg-sentinel-red' : 'bg-sentinel-green'} animate-pulse`} />
              THREAT: {threatLevel}
            </div>

            <button
              onClick={fetchAll}
              className="btn-neon-blue rounded-lg px-3 py-2 flex items-center gap-2 text-sm"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="max-w-7xl mx-auto px-6 flex gap-1 pb-0">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-widest transition-all
                          border-b-2 ${
                activeTab === tab
                  ? 'border-sentinel-blue text-sentinel-blue'
                  : 'border-transparent text-sentinel-text-dim hover:text-sentinel-text'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard icon={AlertTriangle} label="INTRUSIONS" value={status?.total_intrusions ?? '—'} color={status?.total_intrusions > 0 ? 'red' : 'green'} pulse={status?.total_intrusions > 0} />
              <StatCard icon={FileText} label="TOTAL EVENTS" value={status?.total_logs ?? '—'} color="blue" />
              <StatCard icon={Image} label="IMAGES CAPTURED" value={images.length} color="yellow" />
              <StatCard icon={Activity} label="SYSTEM STATUS" value={status?.locked ? 'LOCKED' : 'ONLINE'} color={status?.locked ? 'red' : 'green'} />
            </div>

            {/* Control panel */}
            <div className="sentinel-card rounded-xl p-6">
              <SectionHeader icon={Cpu} title="THREAT RESPONSE CONTROLS" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={handleLock}
                  disabled={loading.lock}
                  className="btn-neon-red rounded-xl p-5 flex flex-col items-center gap-3 disabled:opacity-40"
                >
                  <Lock className="w-8 h-8" />
                  <div>
                    <div className="font-display text-sm font-bold tracking-widest">LOCK DEVICE</div>
                    <div className="font-mono text-xs opacity-60 mt-0.5">Remote lockdown</div>
                  </div>
                </button>

                <button
                  onClick={handleEncrypt}
                  disabled={loading.encrypt}
                  className="btn-neon-blue rounded-xl p-5 flex flex-col items-center gap-3 disabled:opacity-40"
                >
                  <Key className="w-8 h-8" />
                  <div>
                    <div className="font-display text-sm font-bold tracking-widest">ENCRYPT</div>
                    <div className="font-mono text-xs opacity-60 mt-0.5">AES-128 Fernet</div>
                  </div>
                </button>

                <button
                  onClick={handleDecrypt}
                  disabled={loading.decrypt}
                  className="btn-neon-green rounded-xl p-5 flex flex-col items-center gap-3 disabled:opacity-40"
                >
                  <ShieldOff className="w-8 h-8" />
                  <div>
                    <div className="font-display text-sm font-bold tracking-widest">DECRYPT</div>
                    <div className="font-mono text-xs opacity-60 mt-0.5">Restore files</div>
                  </div>
                </button>

                <button
                  onClick={handleWipe}
                  disabled={loading.wipe}
                  className="btn-neon-red rounded-xl p-5 flex flex-col items-center gap-3 disabled:opacity-40 border-sentinel-red/60"
                  style={{ borderStyle: 'dashed' }}
                >
                  <Trash2 className="w-8 h-8" />
                  <div>
                    <div className="font-display text-sm font-bold tracking-widest">WIPE FILES</div>
                    <div className="font-mono text-xs opacity-60 mt-0.5">3-pass overwrite</div>
                  </div>
                </button>
              </div>

              {/* Loading indicators */}
              {Object.entries(loading).some(([, v]) => v) && (
                <div className="mt-4 flex items-center gap-2 font-mono text-xs text-sentinel-blue">
                  <div className="scanning-bar h-1 flex-1 rounded-full" />
                  <span>PROCESSING...</span>
                </div>
              )}
            </div>

            {/* Recent logs + location side by side */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Recent Events */}
              <div className="sentinel-card rounded-xl p-6">
                <SectionHeader icon={Activity} title="RECENT EVENTS" />
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logs.length === 0 ? (
                    <p className="font-mono text-xs text-sentinel-text-dim text-center py-8">
                      No events logged
                    </p>
                  ) : (
                    [...logs].reverse().slice(0, 10).map((log, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-sentinel-border/30">
                        <div className={`font-mono text-xs font-bold ${logTypeColor(log.type)} flex-shrink-0`}>
                          {log.type}
                        </div>
                        <div className="font-mono text-xs text-sentinel-text-dim ml-auto">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="sentinel-card rounded-xl p-6">
                <SectionHeader icon={MapPin} title="DEVICE LOCATION" />
                {location ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-sentinel-panel rounded-lg border border-sentinel-border">
                      <Wifi className="w-5 h-5 text-sentinel-blue flex-shrink-0" />
                      <div>
                        <div className="font-mono text-xs text-sentinel-text-dim">IP ADDRESS</div>
                        <div className="font-mono text-sm text-sentinel-blue font-bold">{location.ip}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'CITY', value: location.city },
                        { label: 'COUNTRY', value: location.country },
                        { label: 'REGION', value: location.region },
                        { label: 'TIMEZONE', value: location.timezone },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-sentinel-panel rounded-lg p-3 border border-sentinel-border">
                          <div className="font-mono text-xs text-sentinel-text-dim">{label}</div>
                          <div className="font-body text-sm text-sentinel-text font-semibold mt-0.5">{value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="font-mono text-xs text-sentinel-text-dim">
                      ISP: {location.isp}
                    </div>

                    {!location.success && (
                      <div className="font-mono text-xs text-yellow-400">
                        ⚠ Using mock data: {location.note}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-sentinel-blue border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="sentinel-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <SectionHeader icon={FileText} title="INTRUSION LOGS" />
              <button onClick={handleClearLogs} className="btn-neon-red rounded-lg px-3 py-1.5 font-mono text-xs flex items-center gap-2">
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>

            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-16 font-mono text-sentinel-text-dim">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No security events logged</p>
                </div>
              ) : (
                [...logs].reverse().map((log, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${
                    log.type === 'INTRUSION_DETECTED' ? 'border-sentinel-red/40 bg-red-900/10' : 'border-sentinel-border bg-sentinel-panel'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${logTypeColor(log.type)} border border-current/30`}>
                          {log.type}
                        </span>
                        {log.attempts && (
                          <span className="font-mono text-xs text-sentinel-text-dim">
                            Attempts: {log.attempts}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-sentinel-text-dim">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {log.image && (
                      <div className="mt-2 font-mono text-xs text-sentinel-blue">
                        📸 Image: {log.image}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* IMAGES TAB */}
        {activeTab === 'images' && (
          <div className="sentinel-card rounded-xl p-6">
            <SectionHeader icon={Image} title="INTRUDER CAPTURES" color="red" />

            {images.length === 0 ? (
              <div className="text-center py-16 font-mono text-sentinel-text-dim">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No intruder images captured yet</p>
                <p className="text-xs mt-2 opacity-60">Images appear after 3 failed login attempts</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="sentinel-card rounded-xl overflow-hidden border border-sentinel-red/30">
                    <div className="relative">
                      <img
                        src={`${IMAGE_BASE}${img.url}`}
                        alt={`Intruder ${i + 1}`}
                        className="w-full aspect-video object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="hidden w-full aspect-video bg-sentinel-panel items-center justify-center">
                        <div className="text-center text-sentinel-text-dim font-mono text-xs">
                          <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          Image unavailable
                        </div>
                      </div>
                      <div className="absolute top-2 left-2 bg-sentinel-red text-white font-mono text-xs px-2 py-0.5 rounded">
                        INTRUDER #{i + 1}
                      </div>
                    </div>
                    <div className="p-3 font-mono text-xs text-sentinel-text-dim">
                      <div className="text-sentinel-text">{img.filename}</div>
                      <div>{new Date(img.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* LOCATION TAB */}
        {activeTab === 'location' && (
          <div className="sentinel-card rounded-xl p-6">
            <SectionHeader icon={MapPin} title="IP GEOLOCATION TRACKING" />
            {location ? (
              <div className="space-y-4 max-w-xl">
                {Object.entries({
                  'IP Address': location.ip,
                  'City': location.city,
                  'Region': location.region,
                  'Country': `${location.country} (${location.country_code})`,
                  'Latitude': location.latitude,
                  'Longitude': location.longitude,
                  'ISP / Organization': location.isp,
                  'Timezone': location.timezone,
                }).map(([label, value]) => (
                  <div key={label} className="flex items-center gap-4 py-3 border-b border-sentinel-border">
                    <div className="font-mono text-xs text-sentinel-text-dim w-40 flex-shrink-0">{label}</div>
                    <div className="font-mono text-sm text-sentinel-text font-bold">{String(value)}</div>
                  </div>
                ))}
                {!location.success && (
                  <div className="mt-4 p-3 border border-yellow-400/30 rounded-lg bg-yellow-900/10 font-mono text-xs text-yellow-400">
                    ⚠ API unavailable: {location.note}. Showing demo data.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-sentinel-blue border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between font-mono text-xs text-sentinel-text-dim">
          <span>SentinelX v1.0.0 — Academic Prototype</span>
          {lastRefresh && <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>}
        </div>
      </main>

      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
