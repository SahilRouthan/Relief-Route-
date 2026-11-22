// =============================================================================
// RELIEFROUTE: Command Center Sidebar Navigation (13 Modules)
// =============================================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  AlertOctagon,
  LifeBuoy,
  Cpu,
  MapPin,
  Building2,
  Boxes,
  Scale,
  Truck,
  Sliders,
  BarChart3,
  Users,
  Settings,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  allowedRoles: ('ADMINISTRATOR' | 'VOLUNTEER' | 'CITIZEN')[];
}

const NAV_ITEMS: NavItem[] = [
  {
    name: 'Overview Dashboard',
    path: '/',
    icon: LayoutDashboard,
    allowedRoles: ['ADMINISTRATOR', 'VOLUNTEER', 'CITIZEN']
  },
  {
    name: 'Disaster Management',
    path: '/disasters',
    icon: AlertOctagon,
    badge: '5 Active',
    badgeColor: 'bg-rose-950 text-rose-300 border border-rose-800',
    allowedRoles: ['ADMINISTRATOR', 'VOLUNTEER']
  },
  {
    name: 'Emergency Requests',
    path: '/requests',
    icon: LifeBuoy,
    badge: '18 Reports',
    badgeColor: 'bg-blue-950 text-blue-300 border border-blue-800',
    allowedRoles: ['ADMINISTRATOR', 'VOLUNTEER', 'CITIZEN']
  },
  {
    name: 'Priority Assessment',
    path: '/priority',
    icon: Cpu,
    badge: 'AI ML',
    badgeColor: 'bg-cyan-950 text-cyan-300 border border-cyan-800',
    allowedRoles: ['ADMINISTRATOR', 'VOLUNTEER']
  },
  {
    name: 'Disaster Map',
    path: '/map',
    icon: MapPin,
    badge: 'Live GIS',
    badgeColor: 'bg-emerald-950 text-emerald-300 border border-emerald-800',
    allowedRoles: ['ADMINISTRATOR', 'VOLUNTEER', 'CITIZEN']
  },
  {
    name: 'Relief Centres',
    path: '/relief-centres',
    icon: Building2,
    badge: '5 Hubs',
    allowedRoles: ['ADMINISTRATOR', 'VOLUNTEER', 'CITIZEN']
  },
  {
    name: 'Inventory Management',
    path: '/inventory',
    icon: Boxes,
    allowedRoles: ['ADMINISTRATOR', 'VOLUNTEER']
  },
  {
    name: 'Resource Allocation',
    path: '/allocation',
    icon: Scale,
    badge: 'Core LP',
    badgeColor: 'bg-purple-950 text-purple-300 border border-purple-800',
    allowedRoles: ['ADMINISTRATOR']
  },
  {
    name: 'Delivery Tracking',
    path: '/deliveries',
    icon: Truck,
    badge: 'Fleet',
    allowedRoles: ['ADMINISTRATOR', 'VOLUNTEER']
  },
  {
    name: 'Scenario Simulation',
    path: '/simulation',
    icon: Sliders,
    badge: 'What-If',
    badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800',
    allowedRoles: ['ADMINISTRATOR']
  },
  {
    name: 'Analytics & Reports',
    path: '/analytics',
    icon: BarChart3,
    allowedRoles: ['ADMINISTRATOR', 'VOLUNTEER']
  },
  {
    name: 'User Management',
    path: '/users',
    icon: Users,
    allowedRoles: ['ADMINISTRATOR']
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    allowedRoles: ['ADMINISTRATOR']
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[57px] left-0 z-50 h-screen lg:h-[calc(100vh-57px)] w-64 bg-[#0A0E17] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Command Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const hasAccess = item.allowedRoles.includes(role);
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    !hasAccess
                      ? 'opacity-40 pointer-events-none'
                      : isActive
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm shadow-blue-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className="w-4 h-4 flex-shrink-0 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  <span className="truncate">{item.name}</span>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        item.badgeColor || 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="bg-[#111827] rounded-xl p-3 border border-slate-800 text-[11px]">
            <div className="flex items-center justify-between font-mono text-slate-400 mb-1">
              <span>TARGET REGION</span>
              <span className="text-cyan-400 font-bold">UTTARAKHAND</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Dehradun • Rishikesh • Joshimath • Chamoli • Haridwar
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
