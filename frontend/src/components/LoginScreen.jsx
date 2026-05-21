import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, AlertTriangle, Lock } from 'lucide-react';
import { attemptLogin } from '../api';

const bootLines = [
  '> SENTINELX SECURITY SYSTEM v1.0.0',
  '> Initializing security protocols...',
  '> Loading threat detection modules...',
  '> Webcam module: READY',
  '> Encryption engine: STANDBY',
  '> Authentication layer: ACTIVE',
  '> System ready. Authenticate to proceed.',
];

export default function LoginScreen({ onLogin, onThreat }) {
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [alert, setAlert] = useState(null);
  const [shake, setShake] = useState(false);
  const [bootText, setBootText] = useState('');

  // Boot animation on mount
  useEffect(() => {
    let i = 0;
    let text = '';
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        text += bootLines[i] + '\n';
        setBootText(text);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');

    try {
      const result = await attemptLogin(password);
      if (result.success) {
        setAlert({ type: 'success', message: 'ACCESS GRANTED' });
        setTimeout(() => onLogin(), 1200);
      } else {
        setAttempts(result.attempts);
        triggerShake();

        if (result.alert) {
          // Intrusion detected — image captured
          setAlert({
            type: 'danger',
            message: 'INTRUSION DETECTED',
            sub: `Image captured and logged. Authorities notified.`,
            image: result.image,
          });
          onThreat({ message: result.message, image: result.image });
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Backend offline — start the Python server.');
    } finally {
      setLoading(false);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">

      {/* Animated background grid */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-sentinel-blue opacity-30" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-sentinel-blue opacity-30" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-sentinel-blue opacity-30" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-sentinel-blue opacity-30" />

      {/* Scanning line */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-sentinel-blue to-transparent opacity-20 pointer-events-none"
        style={{ animation: 'scan 4s linear infinite', top: 0 }}
      />

      <div className="relative z-10 w-full max-w-md px-6">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-sentinel-blue mb-4 animate-glow relative">
            <Shield className="w-10 h-10 text-sentinel-blue" />
            <div className="absolute inset-0 rounded-full bg-sentinel-blue opacity-5 animate-pulse-slow" />
          </div>
          <h1 className="font-display text-3xl font-black text-sentinel-blue tracking-[0.3em] text-neon-blue">
            SENTINELX
          </h1>
          <p className="font-mono text-xs text-sentinel-text-dim mt-1 tracking-widest">
            SMART ANTI-THEFT SECURITY SYSTEM
          </p>
        </div>

        {/* Boot terminal */}
        <div className="sentinel-card rounded-lg p-4 mb-6 font-mono text-xs text-sentinel-blue opacity-70">
          <pre className="whitespace-pre-wrap leading-5">{bootText}<span className="blink">█</span></pre>
        </div>

        {/* Alert Banner */}
        {alert && (
          <div className={`rounded-lg p-4 mb-4 border font-mono text-sm text-center ${
            alert.type === 'success'
              ? 'border-sentinel-green bg-green-900/20 text-sentinel-green'
              : 'border-sentinel-red bg-red-900/20 text-sentinel-red threat-high'
          }`}>
            <div className="font-bold tracking-widest text-base">{alert.message}</div>
            {alert.sub && <div className="text-xs mt-1 opacity-80">{alert.sub}</div>}
          </div>
        )}

        {/* Login Form */}
        <div className={`sentinel-card rounded-xl p-6 ${shake ? 'animate-bounce' : ''}`}>
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-sentinel-blue" />
            <span className="font-display text-sm text-sentinel-blue tracking-widest">
              AUTHENTICATION REQUIRED
            </span>
          </div>

          {/* Attempt counter */}
          {attempts > 0 && (
            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-sentinel-red">
              <AlertTriangle className="w-4 h-4" />
              <span>WARNING: {attempts}/3 failed attempts — Capture armed</span>
            </div>
          )}

          {/* Attempt bars */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
                  n <= attempts ? 'bg-sentinel-red shadow-neon-red' : 'bg-sentinel-border'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <label className="font-mono text-xs text-sentinel-text-dim mb-2 block tracking-widest">
                ACCESS CODE
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full bg-sentinel-panel border border-sentinel-border rounded-lg px-4 py-3 pr-12
                             font-mono text-sentinel-text text-sm
                             focus:outline-none focus:border-sentinel-blue focus:shadow-neon-blue
                             placeholder-sentinel-text-dim transition-all duration-200"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sentinel-text-dim hover:text-sentinel-blue transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="font-mono text-xs text-sentinel-red flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full btn-neon-blue rounded-lg py-3 font-display text-sm tracking-widest
                         font-bold disabled:opacity-40 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2 transition-all duration-200"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-sentinel-blue border-t-transparent rounded-full animate-spin" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>AUTHENTICATE</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-sentinel-border font-mono text-xs text-sentinel-text-dim text-center">
            Demo password: <span className="text-sentinel-yellow">sentinel123</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 font-mono text-xs text-sentinel-text-dim">
          <span className="opacity-50">© 2024 SENTINELX — ACADEMIC PROTOTYPE</span>
        </div>
      </div>
    </div>
  );
}
