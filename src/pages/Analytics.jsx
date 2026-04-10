import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function Analytics() {
  const [stepsInput, setStepsInput] = useState('');
  
  const logs = useLiveQuery(() => db.workout_logs.toArray());

  if (!logs) return null;

  const todayDateString = new Date().toISOString().split('T')[0];
  
  const handleSaveSteps = async () => {
    if (!stepsInput) return;
    const currentHour = new Date().getHours();
    const id = `${todayDateString}-${currentHour}`;
    
    const existing = await db.workout_logs.get(id);
    await db.workout_logs.put({
      id: id,
      date: todayDateString,
      timestamp: Date.now(),
      hour_slot: currentHour,
      pushups_completed: existing?.pushups_completed || 0,
      squats_completed: existing?.squats_completed || 0,
      steps_logged: parseInt(stepsInput, 10),
      water_oz: existing?.water_oz || 0,
    });
    setStepsInput('');
  };

  const getHeatmapData = () => {
    const data = {};
    logs.forEach(log => {
      const total = (log.pushups_completed || 0) + (log.squats_completed || 0);
      data[log.date] = (data[log.date] || 0) + total;
    });
    return data;
  };

  const heatmapData = getHeatmapData();
  const maxIntensity = Math.max(...Object.values(heatmapData), 1);
  
  // Create 98 cells for heatmap (14 cols x 7 rows)
  const cells = Array.from({ length: 98 }).map((_, i) => {
    // Just mock dates for visual purpose backwards from today
    const d = new Date();
    d.setDate(d.getDate() - (97 - i));
    const ds = d.toISOString().split('T')[0];
    const val = heatmapData[ds] || 0;
    
    let intensityClass = 'bg-surface-container-highest';
    if (val > 0) {
      const ratio = val / maxIntensity;
      if (ratio > 0.75) intensityClass = 'bg-[#00675d]';
      else if (ratio > 0.5) intensityClass = 'bg-[#00675d]/80';
      else if (ratio > 0.25) intensityClass = 'bg-[#00675d]/50';
      else intensityClass = 'bg-[#00675d]/20';
    }
    
    return <div key={i} className={`w-full aspect-square rounded-[4px] ${intensityClass}`}></div>;
  });

  const totalPushups = logs.reduce((acc, log) => acc + (log.pushups_completed || 0), 0);
  const totalSquats = logs.reduce((acc, log) => acc + (log.squats_completed || 0), 0);

  return (
    <div className="bg-background text-on-surface min-h-screen pb-32">
        <header className="bg-surface sticky top-0 z-40 transition-all">
            <div className="flex justify-between items-center w-full px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#14B8A6]">calendar_today</span>
                    <h1 className="text-xl font-extrabold text-[#14B8A6] tracking-tight">Pushup Power</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-500">notifications</span>
                </div>
            </div>
        </header>

        <main className="px-6 space-y-8 max-w-2xl mx-auto pt-4">
            <section className="flex justify-between items-end">
                <div>
                    <span className="text-[#00675d] font-bold uppercase tracking-widest text-xs mb-1 block">Performance Hub</span>
                    <h2 className="text-4xl font-extrabold text-on-surface tracking-tighter">Analytics</h2>
                </div>
            </section>

            <section className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_20px_40px_rgba(0,0,0,0.04)] relative overflow-hidden group">
                <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#00675d]/5 rounded-full blur-3xl group-hover:bg-[#00675d]/10 transition-colors"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-[#ffc4b1] flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#832800]">directions_run</span>
                        </div>
                        <h3 className="font-bold text-lg">Steps Today</h3>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative w-full">
                            <input 
                                type="number" 
                                value={stepsInput}
                                onChange={e => setStepsInput(e.target.value)}
                                className="w-full bg-surface-container-low border-none rounded-full px-8 py-4 text-2xl font-bold focus:ring-2 focus:ring-[#6af2de] focus:bg-surface-container-lowest transition-all placeholder:text-surface-container-highest" 
                                placeholder="0" 
                            />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant uppercase text-xs tracking-widest">Steps</span>
                        </div>
                        <button onClick={handleSaveSteps} className="w-full md:w-auto kinetic-pulse-gradient text-white px-10 py-4 rounded-full font-bold shadow-lg active:scale-95 transition-transform">
                            Save
                        </button>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#00675d]">grid_view</span>
                    <h3 className="font-bold text-xl tracking-tight text-on-surface">Activity Heatmap</h3>
                </div>
                <div className="bg-surface-container-low rounded-xl p-6">
                    <div className="heatmap-grid mb-4">
                        {cells}
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">
                        <span>Less Activity</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-[2px] bg-surface-container-highest"></div>
                            <div className="w-3 h-3 rounded-[2px] bg-[#00675d]/30"></div>
                            <div className="w-3 h-3 rounded-[2px] bg-[#00675d]/60"></div>
                            <div className="w-3 h-3 rounded-[2px] bg-[#00675d]"></div>
                        </div>
                        <span>Pushup Power</span>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.04)] space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-on-surface-variant text-sm uppercase tracking-wide">Pushups Trend</h4>
                            <div className="text-3xl font-extrabold mt-1">{totalPushups} <span className="text-sm font-medium text-on-surface-variant">total</span></div>
                        </div>
                        <span className="material-symbols-outlined text-[#00675d] bg-[#00675d]/10 p-2 rounded-full">auto_graph</span>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0px_20px_40px_rgba(0,0,0,0.04)] space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-on-surface-variant text-sm uppercase tracking-wide">Squats Trend</h4>
                            <div className="text-3xl font-extrabold mt-1">{totalSquats} <span className="text-sm font-medium text-on-surface-variant">total</span></div>
                        </div>
                        <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-full">stacked_line_chart</span>
                    </div>
                </div>
            </section>

            <section className="bg-[#2c2f30] text-[#f5f6f7] rounded-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <span className="material-symbols-outlined text-8xl">insights</span>
                </div>
                <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-bold tracking-tight">Weekly Focus</h3>
                    <p className="text-[#d1d5d7] font-medium leading-relaxed max-w-sm">
                        You're doing great! Keep building that habit, one hour at a time.
                    </p>
                </div>
            </section>
        </main>
    </div>
  );
}
