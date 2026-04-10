import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import { Settings } from 'lucide-react';

export default function Onboarding() {
  const [slide, setSlide] = useState(0);
  const [showBaseline, setShowBaseline] = useState(false);
  const [pushups, setPushups] = useState(24);
  const [squats, setSquats] = useState(32);
  const navigate = useNavigate();

  const handleNext = () => {
    if (slide < 2) setSlide(slide + 1);
    else setShowBaseline(true);
  };

  const handleSaveBaseline = async () => {
    await db.baselines.add({
      timestamp: Date.now(),
      pushups_max: pushups,
      squats_max: squats,
      is_active: true
    });
    
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }
    }
    
    navigate('/today');
  };

  if (showBaseline) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col">
          <header className="flex justify-between items-center w-full px-6 py-4">
            <h1 className="text-xl font-extrabold text-[#14B8A6] tracking-tight">Pushup Power</h1>
          </header>
          <main className="flex-grow flex flex-col px-6 pt-8 pb-32 max-w-lg mx-auto w-full">
            <section className="mb-10 text-center md:text-left">
                <h2 className="text-5xl font-extrabold tracking-tight text-on-background mb-4 leading-tight">
                    Set Your <span className="text-primary italic">Baseline</span>
                </h2>
                <p className="text-on-surface-variant text-lg font-medium leading-relaxed max-w-xs md:max-w-none">
                    Do one set of pushups and squats to comfortable failure right now.
                </p>
            </section>

            <div className="space-y-6">
                <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0px_20px_40px_rgba(44,47,48,0.06)] relative overflow-hidden group">
                  <div className="flex justify-between items-end relative z-10">
                    <div className="flex flex-col">
                        <span className="text-primary font-bold tracking-widest uppercase text-xs mb-1">Max Exercise</span>
                        <h3 className="text-2xl font-bold text-on-surface">Max Pushups</h3>
                    </div>
                    <div className="flex items-center bg-surface-container-low rounded-full p-2 gap-4">
                        <button onClick={() => setPushups(Math.max(0, pushups - 1))} className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm active:scale-90 transition-transform">
                            <span className="material-symbols-outlined font-bold">remove</span>
                        </button>
                        <span className="text-5xl font-extrabold tracking-tighter text-on-surface w-20 text-center">{pushups}</span>
                        <button onClick={() => setPushups(pushups + 1)} className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-white shadow-sm active:scale-90 transition-transform">
                            <span className="material-symbols-outlined font-bold">add</span>
                        </button>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-8 relative group">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                        <span className="text-secondary font-bold tracking-widest uppercase text-xs mb-1">Lower Body</span>
                        <h3 className="text-2xl font-bold text-on-surface">Max Squats</h3>
                    </div>
                    <div className="flex items-center bg-surface-container-highest rounded-full p-2 gap-4">
                        <button onClick={() => setSquats(Math.max(0, squats - 1))} className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-sm active:scale-90 transition-transform">
                            <span className="material-symbols-outlined font-bold">remove</span>
                        </button>
                        <span className="text-5xl font-extrabold tracking-tighter text-on-surface w-20 text-center">{squats}</span>
                        <button onClick={() => setSquats(squats + 1)} className="w-12 h-12 flex items-center justify-center rounded-full bg-on-surface text-white shadow-sm active:scale-90 transition-transform">
                            <span className="material-symbols-outlined font-bold">add</span>
                        </button>
                    </div>
                  </div>
                </div>
            </div>

            <div className="mt-10 p-6 bg-tertiary-container/20 rounded-xl flex gap-4 items-start border border-tertiary-container/10">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                <p className="text-on-tertiary-container text-sm font-semibold leading-snug">
                    Pro Tip: Don't push to absolute pain. Stop when you can't maintain perfect form anymore!
                </p>
            </div>

            <div className="mt-auto pt-10">
                <button onClick={handleSaveBaseline} className="w-full h-16 kinetic-pulse-gradient text-white rounded-full font-extrabold text-xl tracking-tight shadow-[0px_20px_40px_rgba(0,103,93,0.2)] active:scale-95 transition-all flex items-center justify-center gap-3">
                    Save Baseline
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>
          </main>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col overflow-hidden">
        <header className="flex justify-between items-center w-full px-8 py-6 bg-surface z-10">
            <div className="text-xl font-extrabold text-[#14B8A6] tracking-tight">Pushup Power</div>
            <button onClick={() => setShowBaseline(true)} className="text-on-surface-variant font-semibold text-sm hover:opacity-80 transition-opacity">Skip</button>
        </header>
        <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden w-full">
            <div className="flex-1 w-full overflow-hidden flex flex-col justify-center">
                
                {slide === 0 && (
                    <section className="px-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-500 w-full">
                        <div className="relative mb-12">
                            <div className="w-72 h-72 bg-surface-container-lowest rounded-xl flex items-center justify-center shadow-[0px_20px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-[#00675d]/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-9xl text-[#00675d]">fitness_center</span>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-4">Move Every Hour</h1>
                        <p className="text-on-surface-variant text-lg leading-relaxed max-w-xs mx-auto">
                            Build a sustainable habit by moving just a little, every hour.
                        </p>
                    </section>
                )}

                {slide === 1 && (
                    <section className="px-8 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right duration-500 w-full">
                        <div className="relative mb-12">
                            <div className="w-72 h-72 bg-surface-container-lowest rounded-xl flex items-center justify-center shadow-[0px_20px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-[#a03a0f]/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-9xl text-[#a03a0f]">trending_up</span>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-4">Safe Progression</h1>
                        <p className="text-on-surface-variant text-lg leading-relaxed max-w-xs mx-auto">
                            We calculate your safe target and increase it by 10% every week.
                        </p>
                    </section>
                )}

                {slide === 2 && (
                    <section className="px-8 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right duration-500 w-full">
                        <div className="relative mb-12">
                            <div className="w-72 h-72 bg-surface-container-lowest rounded-xl flex items-center justify-center shadow-[0px_20px_40px_rgba(0,0,0,0.06)] relative overflow-hidden">
                                 <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-9xl text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>water_drop</span>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-4">Drink Water</h1>
                        <p className="text-on-surface-variant text-lg leading-relaxed max-w-xs mx-auto">
                            Log your movement and get reminders to stay hydrated.
                        </p>
                    </section>
                )}

            </div>
            
            <div className="flex gap-2 pb-12">
                <div className={`w-2 h-2 rounded-full ${slide === 0 ? 'bg-[#00675d] w-8' : 'bg-surface-container-highest transition-all duration-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${slide === 1 ? 'bg-[#00675d] w-8' : 'bg-surface-container-highest transition-all duration-300'}`}></div>
                <div className={`w-2 h-2 rounded-full ${slide === 2 ? 'bg-[#00675d] w-8' : 'bg-surface-container-highest transition-all duration-300'}`}></div>
            </div>
        </main>
        
        <footer className="p-8 pb-12 flex flex-col items-center bg-surface">
            <button onClick={handleNext} className="w-full max-w-md h-16 rounded-full kinetic-pulse-gradient text-white font-extrabold text-lg flex items-center justify-center gap-3 shadow-[0px_20px_40px_rgba(0,103,93,0.15)] active:scale-95 transition-transform duration-150">
                Next <span className="material-symbols-outlined">arrow_forward</span>
            </button>
        </footer>
    </div>
  );
}
