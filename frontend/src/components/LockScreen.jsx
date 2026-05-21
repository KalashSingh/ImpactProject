import React, { useState, useEffect } from 'react';
import { Lock, AlertTriangle, Shield } from 'lucide-react';
import { unlockDevice } from '../api';

export default function LockScreen({ onUnlock }) {
  const [unlockCode, setUnlockCode] = useState('');
  const [error, setError] = useState('');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleUnlock = async () => {
    if (unlockCode === 'sentinel123') {
      await unlockDevice().catch(() => {});
      onUnlock();
    } else {
      setError('Invalid unlock code');
      setUnlockCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 lock-overlay flex flex-col items-center justify-center">

      {/* Animated red border */}
      <div className="absolute inset-0 border-4 border-sentinel-red animate-pulse-slow pointer-events-none" />

      {/* Corner alerts */}
      {['-', '+'].map((h, hi) =>
        ['-', '+'].map((v, vi) => (
          <div
            key={`${hi}-${vi}`}
            className={`absolute ${hi === 0 ? 'top-4' : 'bottom-4'} ${vi === 0 ? 'left-4' : 'right-4'}`}
          >
            <AlertTriangle className="w-8 h-8 text-sentinel-red animate-ping-slow" />
          </div>
        ))
      )}

      {/* Main content */}
      <div className="text-center px-8 max-w-lg">

        {/* Lock icon */}
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-2 border-sentinel-red mb-8 relative">
          <Lock className="w-14 h-14 text-sentinel-red" />
          <div className="absolute inset-0 rounded-full bg-sentinel-red opacity-10 animate-pulse" />
          <div className="absolute -inset-4 rounded-full border border-sentinel-red opacity-20 animate-ping-slow" />
        </div>

        {/* Main warning */}
        <div className="font-display text-2xl md:text-4xl font-black text-sentinel-red text-neon-red tracking-widest mb-4 threat-high">
          DEVICE LOCKED
        </div>

        <div className="font-mono text-sentinel-red text-lg mb-2 tracking-wider">
          ⚠ UNAUTHORIZED ACCESS DETECTED ⚠
        </div>

        <div className="font-body text-sentinel-text-dim text-sm mb-8 leading-relaxed">
          This device has been remotely locked by SentinelX security system.<br />
          All activity is being monitored and logged.<br />
          Attempting to bypass this lock may result in data wipe.
        </div>

        {/* Time display */}
        <div className="font-mono text-5xl text-sentinel-blue text-neon-blue mb-8 tracking-widest">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </div>

        {/* Unlock form */}
        <div className="sentinel-card rounded-xl p-6 border border-sentinel-red/30 max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-4 text-sentinel-red font-mono text-xs tracking-widest">
            <Shield className="w-4 h-4" />
            AUTHORIZED PERSONNEL ONLY
          </div>

          <input
            type="password"
            value={unlockCode}
            onChange={(e) => setUnlockCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
            placeholder="Enter unlock code..."
            className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg px-4 py-3
                       font-mono text-sentinel-text text-sm text-center tracking-widest
                       focus:outline-none focus:border-sentinel-red
                       placeholder-sentinel-text-dim mb-3"
          />

          {error && (
            <div className="text-sentinel-red font-mono text-xs mb-3">{error}</div>
          )}

          <button
            onClick={handleUnlock}
            className="w-full btn-neon-red rounded-lg py-3 font-display text-sm tracking-widest font-bold"
          >
            UNLOCK DEVICE
          </button>
        </div>
      </div>
    </div>
  );
}
