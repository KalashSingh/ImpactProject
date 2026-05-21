import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import LockScreen from './components/LockScreen';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [deviceLocked, setDeviceLocked] = useState(false);
  const [threatAlert, setThreatAlert] = useState(null);

  const handleLogin = () => setAuthenticated(true);

  const handleLock = () => setDeviceLocked(true);
  const handleUnlock = () => setDeviceLocked(false);

  return (
    <div className="scanlines min-h-screen bg-sentinel-bg grid-bg">
      {/* Lock Screen Overlay */}
      {deviceLocked && (
        <LockScreen onUnlock={handleUnlock} />
      )}

      {/* Login or Dashboard */}
      {!authenticated ? (
        <LoginScreen
          onLogin={handleLogin}
          onThreat={(alert) => setThreatAlert(alert)}
        />
      ) : (
        <Dashboard
          onLock={handleLock}
          threatAlert={threatAlert}
          setThreatAlert={setThreatAlert}
        />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
