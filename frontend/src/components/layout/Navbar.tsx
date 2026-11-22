// =============================================================================
// RELIEFROUTE: Command Center Navbar
// =============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import {
  ShieldAlert,
  RotateCcw,
  UserCheck,
  Radio,
  Menu,
  Clock,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, role, switchRole } = useAuth();
  const { showToast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo records back to the pristine Uttarakhand demonstration dataset?')) return;
    setIsResetting(true);
    try {
      const res = await api.resetDemoData();
      showToast('success', 'Database Reset Complete', res.message);
      setTimeout(() => window.location.reload(), 600);
    } catch (err: any) {
      showToast('error', 'Reset Failed', err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0D1322]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center space-x-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-500 shadow-lg shadow-blue-500/25">
              <ShieldAlert className="w-5 h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-white text-base">RELIEF<span className="text-cyan-400">ROUTE</span></span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-800">
                  EOC v1.0
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-slate-400 tracking-wider uppercase font-mono">
                Uttarakhand Disaster Operations Hub
              </p>
            </div>
          </div>
        </div>

        {/* Center: System Status & Simulated Data Notice */}
        <div className="hidden xl:flex items-center space-x-3 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800/80 text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>GRID LIVE</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
            <Clock className="w-3.5 h-3.5" />
            <span>IST UTC+5:30</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center space-x-1 text-amber-400 font-medium text-[11px]">
            <Sparkles className="w-3 h-3" />
            <span>DEMO / SIMULATED ENVIRONMENT</span>
          </div>
        </div>

        {/* Right: Quick Role Switcher + Reset Demo + User */}
        <div className="flex items-center space-x-3">
          {/* Quick 1-Click Role Switcher */}
          <div className="flex items-center bg-slate-900/90 rounded-lg p-1 border border-slate-800">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 px-2 hidden sm:inline">
              Role:
            </span>
            {(['ADMINISTRATOR', 'VOLUNTEER', 'CITIZEN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  if (role !== r) {
                    switchRole(r);
                    showToast('info', 'Active Role Changed', `Switched to ${r} mode`);
                  }
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  role === r
                    ? r === 'ADMINISTRATOR'
                      ? 'bg-blue-600 text-white shadow-md'
                      : r === 'VOLUNTEER'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {r === 'ADMINISTRATOR' ? 'Admin' : r === 'VOLUNTEER' ? 'Volunteer' : 'Citizen'}
              </button>
            ))}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleResetDemo}
            disabled={isResetting}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700/60 transition disabled:opacity-50"
            title="Reset data store back to pristine demo state"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
            <span className="hidden md:inline">Reset Demo</span>
          </button>

          {/* Active User Avatar */}
          <div className="flex items-center space-x-2 pl-1 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-900 border border-blue-500/50 flex items-center justify-center text-xs font-bold text-blue-200 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <UserCheck className="w-4 h-4 text-blue-300" />
              )}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-none truncate max-w-[130px]">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
