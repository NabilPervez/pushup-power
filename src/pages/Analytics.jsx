import React from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const logs = useLiveQuery(() => db.workout_logs.toArray());

  if (!logs) return null;

  const todayDateString = new Date().toISOString().split('T')[0];
  
  const todayLogs = logs.filter(l => l.date === todayDateString);
  const todayPushups = todayLogs.reduce((acc, log) => acc + (log.pushups_completed || 0), 0);
  const todaySquats = todayLogs.reduce((acc, log) => acc + (log.squats_completed || 0), 0);
  const todaySteps = todayLogs.reduce((acc, log) => acc + (log.steps_logged || 0), 0);
  const todayWater = todayLogs.reduce((acc, log) => acc + (log.water_oz || 0), 0);


  const dailyAggregates = {};
  logs.forEach(log => {
    if (!dailyAggregates[log.date]) {
      dailyAggregates[log.date] = { pushups: 0, squats: 0, steps: 0, water: 0, date: log.date };
    }
    dailyAggregates[log.date].pushups += (log.pushups_completed || 0);
    dailyAggregates[log.date].squats += (log.squats_completed || 0);
    dailyAggregates[log.date].steps += (log.steps_logged || 0);
    dailyAggregates[log.date].water += (log.water_oz || 0);
  });

  const dailyAggregatesList = Object.values(dailyAggregates).sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalDays = dailyAggregatesList.length || 1;
  const avgPushups = Math.round(dailyAggregatesList.reduce((acc, val) => acc + val.pushups, 0) / totalDays);
  const avgSquats = Math.round(dailyAggregatesList.reduce((acc, val) => acc + val.squats, 0) / totalDays);
  const avgSteps = Math.round(dailyAggregatesList.reduce((acc, val) => acc + val.steps, 0) / totalDays);

  const maxPushups = dailyAggregatesList.reduce((max, val) => Math.max(max, val.pushups), 0);
  const maxSquats = dailyAggregatesList.reduce((max, val) => Math.max(max, val.squats), 0);
  const maxSteps = dailyAggregatesList.reduce((max, val) => Math.max(max, val.steps), 0);

  const getHeatmapData = () => {
    const data = {};
    dailyAggregatesList.forEach(log => {
      data[log.date] = log.pushups + log.squats;
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

  const generateChartData = () => {
    const byDate = {};
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      days.push(dateStr);
      byDate[dateStr] = {
        name: d.toLocaleDateString('en-US', { weekday: 'short' }),
        pushups: 0,
        squats: 0,
        steps: 0
      };
    }

    logs.forEach(l => {
      if (byDate[l.date]) {
        byDate[l.date].pushups += (l.pushups_completed || 0);
        byDate[l.date].squats += (l.squats_completed || 0);
        byDate[l.date].steps += (l.steps_logged || 0);
      }
    });

    return days.map(d => byDate[d]);
  };

  const chartData = generateChartData();

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

            <section className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_20px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5 flex flex-col items-center text-center">
                    <h4 className="font-extrabold text-on-surface-variant text-xs uppercase tracking-wider mb-4">Daily Averages</h4>
                    <div className="space-y-3 w-full">
                        <div className="flex justify-between items-center bg-surface-container-low px-3 py-2 rounded-xl">
                            <span className="text-xs font-bold text-on-surface-variant uppercase">Pushups</span>
                            <span className="text-lg font-black text-[#00675d]">{avgPushups}</span>
                        </div>
                        <div className="flex justify-between items-center bg-surface-container-low px-3 py-2 rounded-xl">
                            <span className="text-xs font-bold text-on-surface-variant uppercase">Squats</span>
                            <span className="text-lg font-black text-secondary">{avgSquats}</span>
                        </div>
                        <div className="flex justify-between items-center bg-surface-container-low px-3 py-2 rounded-xl">
                            <span className="text-xs font-bold text-on-surface-variant uppercase">Steps</span>
                            <span className="text-lg font-black text-[#a03a0f]">{avgSteps}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_20px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5 flex flex-col items-center text-center">
                    <h4 className="font-extrabold text-on-surface-variant text-xs uppercase tracking-wider mb-4">Personal Bests</h4>
                    <div className="space-y-3 w-full">
                        <div className="flex justify-between items-center bg-surface-container-low px-3 py-2 rounded-xl">
                            <span className="text-xs font-bold text-on-surface-variant uppercase">Pushups</span>
                            <span className="text-lg font-black text-[#00675d]">{maxPushups}</span>
                        </div>
                        <div className="flex justify-between items-center bg-surface-container-low px-3 py-2 rounded-xl">
                            <span className="text-xs font-bold text-on-surface-variant uppercase">Squats</span>
                            <span className="text-lg font-black text-secondary">{maxSquats}</span>
                        </div>
                        <div className="flex justify-between items-center bg-surface-container-low px-3 py-2 rounded-xl">
                            <span className="text-xs font-bold text-on-surface-variant uppercase">Steps</span>
                            <span className="text-lg font-black text-[#a03a0f]">{maxSteps}</span>
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
                    <div className="h-48 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="pushups" stroke="#00675d" strokeWidth={4} dot={{ r: 4, fill: '#00675d', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_20px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-extrabold text-on-surface-variant text-sm uppercase tracking-wider">7-Day Squats</h4>
                            <div className="text-3xl font-black mt-1 text-on-surface">{totalSquats} <span className="text-sm font-bold text-on-surface-variant tracking-normal">historical total</span></div>
                        </div>
                    </div>
                    <div className="h-48 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="squats" stroke="#0f172a" strokeWidth={4} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_20px_40px_rgba(0,0,0,0.04)] ring-1 ring-black/5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-extrabold text-on-surface-variant text-sm uppercase tracking-wider">7-Day Walking</h4>
                            <div className="text-3xl font-black mt-1 text-on-surface"><span className="text-sm font-bold text-on-surface-variant tracking-normal">Steps over time</span></div>
                        </div>
                    </div>
                    <div className="h-48 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Line type="monotone" dataKey="steps" stroke="#a03a0f" strokeWidth={4} dot={{ r: 4, fill: '#a03a0f', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </section>
        </main>
    </div>
  );
}
