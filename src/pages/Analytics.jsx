import React from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

export default function Analytics() {
  const logs = useLiveQuery(() => db.workout_logs.toArray());

  if (!logs) return null;

  const todayDateString = new Date().toISOString().split('T')[0];
  
  const todayLogs = logs.filter(l => l.date === todayDateString);
  const todayPushups = todayLogs.reduce((acc, log) => acc + (log.pushups_completed || 0), 0);
  const todaySquats = todayLogs.reduce((acc, log) => acc + (log.squats_completed || 0), 0);
  const todaySteps = todayLogs.reduce((acc, log) => Math.max(acc, log.steps_logged || 0), 0);
  const todayWater = todayLogs.reduce((acc, log) => acc + (log.water_oz || 0), 0);


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
  
  // Generate calendar cells
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="w-full aspect-square opacity-0"></div>);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const val = heatmapData[dateString] || 0;
    let bgClass = "bg-surface-container-highest text-on-surface-variant font-medium";
    if (val > 0) bgClass = "bg-[#00675d] text-white font-bold shadow-md shadow-[#00675d]/20";
    cells.push(
      <div key={i} className={`w-full aspect-square rounded-[8px] flex items-center justify-center text-xs ${bgClass}`}>
        {i}
      </div>
    );
  }

  const generateChartPoints = (logs, type) => {
      const byDate = {};
      logs.forEach(l => {
          byDate[l.date] = (byDate[l.date] || 0) + (l[type] || 0);
      });
      const days = [];
      for(let i=6; i>=0; i--) {
          const d = new Date(); d.setDate(d.getDate() - i);
          days.push(d.toISOString().split('T')[0]);
      }
      const max = Math.max(...days.map(d => byDate[d] || 0), 10);
      return days.map((d, index) => {
          const x = (index / 6) * 100;
          const y = 40 - (((byDate[d] || 0) / max) * 40);
          return `${x},${y}`;
      }).join(' ');
  };

  const pushupPoints = generateChartPoints(logs, 'pushups_completed');
  const squatPoints = generateChartPoints(logs, 'squats_completed');

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
                <Link to="/settings" className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden flex items-center justify-center hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-slate-500">settings</span>
                </Link>
            </div>
        </header>

        <main className="px-6 space-y-8 max-w-2xl mx-auto pt-4">
            <section className="flex justify-between items-end">
                <div>
                    <span className="text-[#00675d] font-bold uppercase tracking-widest text-xs mb-1 block">Performance Hub</span>
                    <h2 className="text-4xl font-extrabold text-on-surface tracking-tighter">Analytics</h2>
                </div>
            </section>

            <section className="bg-[#00675d] text-white rounded-[2rem] p-8 shadow-[0px_20px_40px_rgba(0,103,93,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg opacity-90">Today's Grand Total</h3>
                        <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-sm">
                            <span className="block text-3xl font-black">{todayPushups}</span>
                            <span className="block text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Pushups</span>
                        </div>
                        <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-sm">
                            <span className="block text-3xl font-black">{todaySquats}</span>
                            <span className="block text-xs font-bold uppercase tracking-widest opacity-80 mt-1">Squats</span>
                        </div>
                        <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-3">
                            <span className="material-symbols-outlined text-red-300">footprint</span>
                            <div>
                                <span className="block text-xl font-black tracking-tight">{todaySteps}</span>
                                <span className="block text-[10px] font-bold uppercase tracking-widest opacity-80">Steps</span>
                            </div>
                        </div>
                        <div className="bg-black/10 rounded-2xl p-4 backdrop-blur-sm flex items-center gap-3">
                            <span className="material-symbols-outlined text-blue-300">water_drop</span>
                            <div>
                                <span className="block text-xl font-black tracking-tight">{todayWater}<span className="text-xs ml-0.5">oz</span></span>
                                <span className="block text-[10px] font-bold uppercase tracking-widest opacity-80">Water</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#00675d]">calendar_month</span>
                    <h3 className="font-bold text-xl tracking-tight text-on-surface">Activity Calendar</h3>
                    <span className="text-sm font-bold text-on-surface-variant ml-auto bg-surface-container-highest px-3 py-1 rounded-full">{monthName} {year}</span>
                </div>
                <div className="bg-surface-container-low rounded-xl p-6">
                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        <div>Su</div><div>Mo</div><div>Tu</div><div>We</div><div>Th</div><div>Fr</div><div>Sa</div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {cells}
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 gap-6 pb-8">
                <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_20px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-extrabold text-on-surface-variant text-sm uppercase tracking-wider">7-Day Pushups</h4>
                            <div className="text-3xl font-black mt-1 text-on-surface">{totalPushups} <span className="text-sm font-bold text-on-surface-variant tracking-normal">historical total</span></div>
                        </div>
                    </div>
                    <svg viewBox="0 -8 100 50" className="w-full h-16 mt-4 stroke-[#00675d] fill-none overflow-visible">
                        <polyline points={pushupPoints} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_20px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-extrabold text-on-surface-variant text-sm uppercase tracking-wider">7-Day Squats</h4>
                            <div className="text-3xl font-black mt-1 text-on-surface">{totalSquats} <span className="text-sm font-bold text-on-surface-variant tracking-normal">historical total</span></div>
                        </div>
                    </div>
                    <svg viewBox="0 -8 100 50" className="w-full h-16 mt-4 stroke-secondary fill-none overflow-visible">
                        <polyline points={squatPoints} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </section>
        </main>
    </div>
  );
}
