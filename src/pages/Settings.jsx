import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const settings = useLiveQuery(() => db.user_settings.get('user'));
  const [showConfirm, setShowConfirm] = useState(false);

  if (!settings) return null;

  const handleUpdateSetting = async (key, value) => {
    await db.user_settings.update('user', { [key]: value });
  };

  const toggleExercise = async (type) => {
    const enabled = settings.exercises_enabled.includes(type);
    let newEnabled;
    if (enabled) {
      newEnabled = settings.exercises_enabled.filter(e => e !== type);
      if (newEnabled.length === 0) return; // Prevent disabling all
    } else {
      newEnabled = [...settings.exercises_enabled, type];
    }
    await handleUpdateSetting('exercises_enabled', newEnabled);
  };

  const exportData = async () => {
    const userSettings = await db.user_settings.toArray();
    const baselines = await db.baselines.toArray();
    const logs = await db.workout_logs.toArray();
    
    const data = { userSettings, baselines, logs };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pushup_power_backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.userSettings) await db.user_settings.bulkPut(data.userSettings);
        if (data.baselines) await db.baselines.bulkPut(data.baselines);
        if (data.logs) await db.workout_logs.bulkPut(data.logs);
        alert('Data imported successfully!');
      } catch (err) {
        alert('Failed to import data: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const wipeData = async () => {
    await db.delete();
    window.location.href = '/';
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
        <header className="bg-surface sticky top-0 z-40">
            <div className="flex justify-between items-center w-full px-6 py-4">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#14B8A6]">calendar_today</span>
                    <h1 className="text-xl font-extrabold text-[#14B8A6] tracking-tight">Pushup Power</h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden">
                    <span className="material-symbols-outlined">person</span>
                </div>
            </div>
        </header>

        <main className="px-6 py-4 max-w-2xl mx-auto space-y-10">
            <section className="mt-4">
                <h2 className="text-4xl font-extrabold tracking-tight text-on-surface">Settings</h2>
                <p className="text-on-surface-variant mt-2 font-medium">Fine-tune your performance and data.</p>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#00675d]">schedule</span>
                    <h3 className="text-lg font-bold tracking-tight uppercase text-on-surface-variant text-[11px]">Schedule</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface-container-lowest p-6 rounded-xl ambient-glow flex flex-col gap-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Active Start</label>
                        <input 
                            type="time" 
                            value={settings.active_start} 
                            onChange={(e) => handleUpdateSetting('active_start', e.target.value)}
                            className="bg-surface-container-low border-none rounded-full px-6 py-3 font-bold text-lg focus:ring-2 focus:ring-[#6af2de] transition-all text-on-surface" 
                        />
                    </div>
                    <div className="bg-surface-container-lowest p-6 rounded-xl ambient-glow flex flex-col gap-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Active End</label>
                        <input 
                            type="time" 
                            value={settings.active_end} 
                            onChange={(e) => handleUpdateSetting('active_end', e.target.value)}
                            className="bg-surface-container-low border-none rounded-full px-6 py-3 font-bold text-lg focus:ring-2 focus:ring-[#6af2de] transition-all text-on-surface" 
                        />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#00675d]">fitness_center</span>
                    <h3 className="text-lg font-bold tracking-tight uppercase text-on-surface-variant text-[11px]">Exercises</h3>
                </div>
                <div className="bg-surface-container-low rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between p-6 bg-surface-container-lowest border-b border-surface-container-low/10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#6af2de]/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#00675d]">fitness_center</span>
                            </div>
                            <span className="font-bold text-lg">Pushups</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={settings.exercises_enabled.includes('pushups')}
                                onChange={() => toggleExercise('pushups')}
                            />
                            <div className={`w-14 h-8 rounded-full peer transition-all duration-300 relative ${settings.exercises_enabled.includes('pushups') ? 'bg-[#00675d]' : 'bg-surface-container-highest'}`}>
                                <div className={`absolute top-[4px] left-[4px] bg-white rounded-full h-6 w-6 transition-all duration-300 ${settings.exercises_enabled.includes('pushups') ? 'translate-x-6' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between p-6 bg-surface-container-lowest">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#ffc4b1]/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-secondary">accessibility_new</span>
                            </div>
                            <span className="font-bold text-lg">Squats</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={settings.exercises_enabled.includes('squats')}
                                onChange={() => toggleExercise('squats')}
                            />
                            <div className={`w-14 h-8 rounded-full peer transition-all duration-300 relative ${settings.exercises_enabled.includes('squats') ? 'bg-[#00675d]' : 'bg-surface-container-highest'}`}>
                                <div className={`absolute top-[4px] left-[4px] bg-white rounded-full h-6 w-6 transition-all duration-300 ${settings.exercises_enabled.includes('squats') ? 'translate-x-6' : ''}`}></div>
                            </div>
                        </label>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#00675d]">rebase_edit</span>
                    <h3 className="text-lg font-bold tracking-tight uppercase text-on-surface-variant text-[11px]">Performance</h3>
                </div>
                <button 
                  onClick={() => navigate('/onboarding')}
                  className="w-full power-pill-gradient text-white py-5 rounded-full font-extrabold text-lg flex items-center justify-center gap-3 active:scale-95 transition-transform ambient-glow"
                >
                    <span className="material-symbols-outlined">refresh</span>
                    Recalibrate Baseline
                </button>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[#00675d]">database</span>
                    <h3 className="text-lg font-bold tracking-tight uppercase text-on-surface-variant text-[11px]">Data Management</h3>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={exportData} className="bg-surface-container-lowest text-on-surface font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-surface-container-low">
                            <span className="material-symbols-outlined text-[#00675d]">download</span>
                            Export Data
                        </button>
                        <label className="bg-surface-container-lowest text-on-surface font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-surface-container-low cursor-pointer">
                            <span className="material-symbols-outlined text-[#00675d]">upload</span>
                            Import Data
                            <input type="file" accept=".json" className="hidden" onChange={importData} />
                        </label>
                    </div>
                    
                    {!showConfirm ? (
                       <button onClick={() => setShowConfirm(true)} className="w-full bg-[#b31b25] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all mt-2">
                           <span className="material-symbols-outlined">delete_forever</span>
                           Wipe All Data
                       </button>
                    ) : (
                       <div className="w-full bg-[#fb5151]/10 border border-[#b31b25] p-4 rounded-xl flex flex-col gap-3 mt-2">
                           <span className="text-sm font-bold text-[#b31b25] text-center">Are you absolutely sure? This cannot be undone.</span>
                           <div className="flex gap-2">
                               <button onClick={() => setShowConfirm(false)} className="flex-1 bg-surface-container-highest py-3 rounded-xl font-bold text-on-surface">Cancel</button>
                               <button onClick={wipeData} className="flex-1 bg-[#b31b25] text-white py-3 rounded-xl font-bold">Yes, Wipe Data</button>
                           </div>
                       </div>
                    )}
                </div>
            </section>
        </main>
    </div>
  );
}
