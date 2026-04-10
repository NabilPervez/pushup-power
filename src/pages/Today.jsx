import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function Today() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [customWater, setCustomWater] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  
  const settings = useLiveQuery(() => db.user_settings.get('user'));
  const baselines = useLiveQuery(() => db.baselines.orderBy('timestamp').last());
  const todayDateString = currentDate.toISOString().split('T')[0];
  const logs = useLiveQuery(() => db.workout_logs.where('date').equals(todayDateString).toArray());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (!settings || !baselines) return null;

  const currentHour = currentDate.getHours();
  const startHour = parseInt(settings.active_start.split(':')[0], 10);
  const endHour = parseInt(settings.active_end.split(':')[0], 10);
  
  const isActiveWindow = currentHour >= startHour && currentHour < endHour;
  const totalActiveHours = endHour - startHour;
  const hoursPassed = Math.max(0, currentHour - startHour + 1);

  // Compute Targets
  const daysSinceBaseline = Math.floor((currentDate.getTime() - baselines.timestamp) / (1000 * 60 * 60 * 24));
  const weeksSinceBaseline = Math.floor(daysSinceBaseline / 7);
  const multiplier = Math.pow(1.10, weeksSinceBaseline);
  
  const pushupsTarget = Math.floor((baselines.pushups_max * 0.30) * multiplier);
  const squatsTarget = Math.floor((baselines.squats_max * 0.30) * multiplier);

  const [pushups, setPushups] = useState(pushupsTarget);
  const [squats, setSquats] = useState(squatsTarget);

  // Reset inputs when target changes
  useEffect(() => {
    setPushups(pushupsTarget);
    setSquats(squatsTarget);
  }, [pushupsTarget, squatsTarget]);

  const existingLog = logs?.find(l => l.hour_slot === currentHour);

  const handleLogWorkout = async () => {
    await db.workout_logs.put({
      id: `${todayDateString}-${currentHour}`,
      date: todayDateString,
      timestamp: Date.now(),
      hour_slot: currentHour,
      pushups_completed: pushups,
      squats_completed: squats,
      steps_logged: existingLog?.steps_logged || 0,
      water_oz: existingLog?.water_oz || 0,
    });
    setToastMessage('Great job! 💧 Drink 8oz of water and 🚶‍♂️ take 250 steps.');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleLogWater = async (amount) => {
    await db.workout_logs.put({
      id: `${todayDateString}-${currentHour}`,
      date: todayDateString,
      timestamp: Date.now(),
      hour_slot: currentHour,
      pushups_completed: existingLog?.pushups_completed || 0,
      squats_completed: existingLog?.squats_completed || 0,
      steps_logged: existingLog?.steps_logged || 0,
      water_oz: (existingLog?.water_oz || 0) + amount,
    });
    setShowWaterModal(false);
  };

  const totalWater = logs?.reduce((acc, log) => acc + (log.water_oz || 0), 0) || 0;
  const totalSteps = logs?.reduce((acc, log) => Math.max(acc, log.steps_logged || 0), 0) || 0; // Steps are usually cumulative for the day in this basic schema

  if (!isActiveWindow) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col">
        <header className="bg-surface sticky top-0 z-50 flex justify-between items-center w-full px-6 py-4">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#14B8A6]">calendar_today</span>
                <h1 className="text-xl font-extrabold text-[#14B8A6] tracking-tight">Pushup Power</h1>
            </div>
            <div className="bg-surface-container-low rounded-full px-4 py-1.5">
                <span className="text-on-surface-variant font-semibold text-sm">{currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-8 pt-24 pb-32">
            <div className="relative w-full max-w-md flex flex-col items-center text-center">
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#6af2de]/30 blur-[80px] rounded-full"></div>
                <div className="bg-surface-container-lowest shadow-[0px_20px_40px_rgba(44,47,48,0.06)] rounded-xl p-12 mb-10 border border-white/50 backdrop-blur-sm">
                    <div className="relative">
                        <span className="material-symbols-outlined text-[120px] text-[#00675d]/80" style={{ fontVariationSettings: "'FILL' 1" }}>dark_mode</span>
                        <span className="material-symbols-outlined absolute -top-4 -right-4 text-[#efc900] text-4xl">auto_awesome</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-4xl font-extrabold tracking-tight text-on-surface leading-tight">Rest up!</h2>
                    <p className="text-lg text-on-surface-variant leading-relaxed font-medium px-4">
                        Your next session begins tomorrow at <span className="text-[#00675d] font-bold">{settings.active_start}</span>.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mt-12">
                    <div className="bg-surface-container-low rounded-lg p-6 flex flex-col items-start gap-2">
                        <span className="material-symbols-outlined text-[#00675d]">battery_charging_80</span>
                        <span className="text-xs uppercase tracking-widest font-bold text-outline">Recovery</span>
                        <span className="text-2xl font-bold text-on-surface">100%</span>
                    </div>
                    <div className="bg-surface-container-low rounded-lg p-6 flex flex-col items-start gap-2">
                        <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                        <span className="text-xs uppercase tracking-widest font-bold text-outline">Streak</span>
                        <span className="text-2xl font-bold text-on-surface">Active</span>
                    </div>
                </div>

                <div className="mt-4 w-full bg-surface-container-lowest border border-white/40 shadow-sm rounded-lg p-6 text-left flex items-center gap-5">
                    <div className="bg-[#6af2de]/20 p-3 rounded-full">
                        <span className="material-symbols-outlined text-[#00675d]">insights</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-on-surface">Did you know?</p>
                        <p className="text-xs text-on-surface-variant">Muscle growth happens while you sleep, not while you train.</p>
                    </div>
                </div>
            </div>
        </main>
      </div>
    );
  }

  const arcLength = 264;
  const progressRatio = hoursPassed / totalActiveHours;
  const strokeDashoffset = arcLength - (arcLength * progressRatio);

  return (
    <div className="bg-background text-on-background min-h-screen pb-32">
        <header className="bg-[#f5f6f7] sticky top-0 z-40">
            <div className="flex justify-between items-center w-full px-6 py-4">
                 <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#14B8A6]">calendar_today</span>
                    <h1 className="text-xl font-extrabold text-[#14B8A6] tracking-tight">Pushup Power</h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500">person</span>
                </div>
            </div>
        </header>

        <main className="px-6 space-y-10 max-w-lg mx-auto">
            <section className="mt-4">
                <h2 className="text-on-surface-variant font-semibold tracking-wider text-xs uppercase opacity-70">CURRENT PROGRESS</h2>
                <p className="text-on-surface text-3xl font-extrabold tracking-tight">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
            </section>

            <section className="relative flex justify-center items-center py-4">
                <div className="relative w-72 h-72">
                    <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                        <circle className="text-surface-container-high stroke-current" cx="50" cy="50" fill="transparent" r="42" strokeWidth="8"></circle>
                        <circle className="text-[#00675d] stroke-current transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="42" strokeDasharray="264" strokeDashoffset={strokeDashoffset} strokeLinecap="round" strokeWidth="8"></circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-5xl font-black text-on-surface tracking-tighter">{hoursPassed} <span className="text-2xl text-on-surface-variant font-medium">of {totalActiveHours}</span></span>
                        <span className="text-sm font-bold text-[#00675d] mt-1 tracking-widest uppercase">Hours Active</span>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-2 gap-4">
                {settings.exercises_enabled.includes('pushups') && (
                    <div className="bg-[#ffc4b1] rounded-xl p-6 flex flex-col items-center justify-center gap-2 aspect-[4/5] shadow-sm">
                        <div className="w-12 h-12 rounded-full bg-[#832800]/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#832800] text-3xl">fitness_center</span>
                        </div>
                        <div className="text-center">
                            <p className="text-[#832800] text-2xl font-black">{pushupsTarget}</p>
                            <p className="text-[#832800] font-bold text-sm">Pushups</p>
                        </div>
                    </div>
                )}
                
                {settings.exercises_enabled.includes('squats') && (
                    <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center justify-center gap-2 aspect-[4/5] shadow-sm border border-outline-variant/10">
                        <div className="w-12 h-12 rounded-full bg-[#ffd709]/30 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#6c5a00] text-3xl">accessibility_new</span>
                        </div>
                        <div className="text-center">
                            <p className="text-on-surface text-2xl font-black">{squatsTarget}</p>
                            <p className="text-on-surface-variant font-bold text-sm">Squats</p>
                        </div>
                    </div>
                )}
            </section>

            <section className="space-y-6">
                <h3 className="text-on-surface font-extrabold text-xl">{existingLog?.pushups_completed > 0 || existingLog?.squats_completed > 0 ? 'Update Your Set' : 'Log Your Set'}</h3>
                <div className="space-y-4">
                    {settings.exercises_enabled.includes('pushups') && (
                        <div className="bg-surface-container-low rounded-full p-2 flex items-center justify-between border border-transparent focus-within:border-[#00675d]/20 focus-within:bg-surface-container-lowest transition-all">
                            <button onClick={() => setPushups(Math.max(0, pushups - 1))} className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface active:scale-90 duration-150">
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black">{pushups}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Pushups</span>
                            </div>
                            <button onClick={() => setPushups(pushups + 1)} className="w-12 h-12 rounded-full bg-[#6af2de] text-[#00594f] flex items-center justify-center active:scale-90 duration-150">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    )}

                    {settings.exercises_enabled.includes('squats') && (
                        <div className="bg-surface-container-low rounded-full p-2 flex items-center justify-between border border-transparent focus-within:border-[#00675d]/20 focus-within:bg-surface-container-lowest transition-all">
                            <button onClick={() => setSquats(Math.max(0, squats - 1))} className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface active:scale-90 duration-150">
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black">{squats}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Squats</span>
                            </div>
                            <button onClick={() => setSquats(squats + 1)} className="w-12 h-12 rounded-full bg-[#6af2de] text-[#00594f] flex items-center justify-center active:scale-90 duration-150">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                        </div>
                    )}
                </div>
            </section>

            <section className="space-y-6 pt-4">
                <button onClick={handleLogWorkout} className="w-full kinetic-pulse-gradient text-white h-16 rounded-full font-black text-lg shadow-[0px_20px_40px_rgba(0,103,93,0.15)] active:scale-95 transition-all">
                    Log Workout
                </button>
                {toastMessage && (
                    <div className="bg-[#00675d]/5 rounded-xl p-5 border border-[#00675d]/10 flex gap-4 items-start animate-in slide-in-from-bottom">
                        <span className="material-symbols-outlined text-[#00675d] mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                        <p className="text-[#00594f]/80 text-sm font-semibold leading-relaxed">
                            {toastMessage}
                        </p>
                    </div>
                )}
            </section>

            <section className="pb-8">
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowWaterModal(true)} className="bg-surface-container-low rounded-lg p-4 flex items-center gap-3 text-left active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-blue-500">water_drop</span>
                        <div>
                            <p className="text-xl font-bold">{totalWater}oz</p>
                            <p className="text-[10px] uppercase font-bold text-on-surface-variant">Hydration</p>
                        </div>
                    </button>
                    <div className="bg-surface-container-low rounded-lg p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-[#a03a0f]">footprint</span>
                        <div>
                            <p className="text-xl font-bold">{totalSteps}</p>
                            <p className="text-[10px] uppercase font-bold text-on-surface-variant">Steps</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        {showWaterModal && (
            <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-on-background/40 backdrop-blur-sm transition-opacity" onClick={() => setShowWaterModal(false)}></div>
                <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
                    <div className="w-12 h-1.5 bg-outline-variant/30 rounded-full mx-auto mb-6 sm:hidden"></div>
                    <button className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant hover:bg-[#6af2de] hover:text-[#00594f] transition-colors" onClick={() => setShowWaterModal(false)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    
                    <div className="text-center space-y-2 mb-8">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-blue-500 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                        </div>
                        <h3 className="text-2xl font-extrabold tracking-tight">Log Water Intake</h3>
                        <p className="text-on-surface-variant font-medium text-sm">Stay hydrated, stay strong!</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <button onClick={() => handleLogWater(8)} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-container-low border-2 border-transparent hover:border-[#00675d] hover:bg-[#00675d]/5 transition-all active:scale-95">
                            <span className="text-lg font-black">8</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">oz</span>
                        </button>
                        <button onClick={() => handleLogWater(12)} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#6af2de] border-2 border-[#00675d]/20 transition-all active:scale-95 text-[#00594f]">
                            <span className="text-lg font-black">12</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00594f]">oz</span>
                        </button>
                        <button onClick={() => handleLogWater(16)} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-container-low border-2 border-transparent hover:border-[#00675d] hover:bg-[#00675d]/5 transition-all active:scale-95">
                            <span className="text-lg font-black">16</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">oz</span>
                        </button>
                    </div>

                    <div className="mb-8">
                        <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-on-surface-variant mb-2 ml-1">Other Amount</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={customWater} 
                                onChange={(e) => setCustomWater(e.target.value)}
                                className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-[#00675d] font-bold text-lg placeholder:text-on-surface-variant/30" 
                                placeholder="Enter amount" />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-on-surface-variant/50">oz</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => { if(customWater) handleLogWater(parseInt(customWater, 10)) }}
                        className="w-full h-16 bg-[#00675d] text-white font-black text-lg rounded-full shadow-lg shadow-[#00675d]/20 active:scale-[0.98] transition-all">
                        Log Water
                    </button>
                </div>
            </div>
        )}
    </div>
  );
}
