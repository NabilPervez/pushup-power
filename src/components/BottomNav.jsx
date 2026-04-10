import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (route) => path === route || (path === '/' && route === '/today');

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-8 pb-8 pt-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-t-[3rem] shadow-[0px_-10px_30px_rgba(0,0,0,0.04)]">
      
      <Link 
        to="/today" 
        className={`flex flex-col items-center justify-center transition-opacity active:scale-90 duration-200 ease-out group ${isActive('/today') ? 'text-[#14B8A6] dark:text-[#2dd4bf] bg-[#14B8A6]/10 rounded-full px-5 py-2' : 'text-slate-400 dark:text-slate-500 hover:text-[#14B8A6]'}`}
      >
        <span className="material-symbols-outlined mb-1" style={isActive('/today') ? { fontVariationSettings: "'FILL' 1" } : {}}>target</span>
        <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold tracking-wide uppercase mt-1">Today</span>
      </Link>

      <Link 
        to="/analytics" 
        className={`flex flex-col items-center justify-center transition-opacity active:scale-90 duration-200 ease-out group ${isActive('/analytics') ? 'text-[#14B8A6] dark:text-[#2dd4bf] bg-[#14B8A6]/10 rounded-full px-5 py-2' : 'text-slate-400 dark:text-slate-500 hover:text-[#14B8A6]'}`}
      >
        <span className="material-symbols-outlined mb-1" style={isActive('/analytics') ? { fontVariationSettings: "'FILL' 1" } : {}}>bar_chart</span>
        <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold tracking-wide uppercase mt-1">Analytics</span>
      </Link>

      <Link 
        to="/settings" 
        className={`flex flex-col items-center justify-center transition-opacity active:scale-90 duration-200 ease-out group ${isActive('/settings') ? 'text-[#14B8A6] dark:text-[#2dd4bf] bg-[#14B8A6]/10 rounded-full px-5 py-2' : 'text-slate-400 dark:text-slate-500 hover:text-[#14B8A6]'}`}
      >
        <span className="material-symbols-outlined mb-1" style={isActive('/settings') ? { fontVariationSettings: "'FILL' 1" } : {}}>settings</span>
        <span className="font-['Plus_Jakarta_Sans'] text-[11px] font-semibold tracking-wide uppercase mt-1">Settings</span>
      </Link>

    </nav>
  );
}
