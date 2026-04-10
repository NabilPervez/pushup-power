import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, initializeSettings } from './db';
import Onboarding from './pages/Onboarding';
import Today from './pages/Today';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import BottomNav from './components/BottomNav';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [initDone, setInitDone] = useState(false);

  const settings = useLiveQuery(() => db.user_settings.get('user'));
  const baselines = useLiveQuery(() => db.baselines.orderBy('timestamp').last());

  useEffect(() => {
    initializeSettings().then(() => setInitDone(true));
  }, []);

  useEffect(() => {
    if (initDone && settings) {
      if (!baselines && location.pathname !== '/onboarding') {
         navigate('/onboarding');
      } else if (baselines && location.pathname === '/onboarding') {
         navigate('/today');
      }
    }
  }, [initDone, settings, baselines, navigate, location.pathname]);

  if (!initDone) return <div className="min-h-screen flex items-center justify-center bg-surface">Loading...</div>;

  const showNav = location.pathname !== '/onboarding';

  return (
    <div className="relative min-h-screen pb-32">
        <Routes>
          <Route path="/" element={baselines ? <Today /> : <Onboarding />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/today" element={<Today />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        {showNav && <BottomNav />}
    </div>
  );
}

export default App;
