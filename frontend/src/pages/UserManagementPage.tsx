// =============================================================================
// RELIEFROUTE: User Management & RBAC Permissions Matrix
// =============================================================================

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Lock,
  Check,
  X as XIcon,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { user: currentUser, switchRole } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await api.getUsers();
        setUsers(res);
      } catch (err: any) {
        showToast('error', 'Error loading users', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const rolePermissions = [
    { module: 'Overview Command Dashboard', admin: true, volunteer: true, citizen: true },
    { module: 'Disaster Incident Management', admin: true, volunteer: true, citizen: false },
    { module: 'Submit Citizen Emergency Report', admin: true, volunteer: true, citizen: true },
    { module: 'Verify & Reject Requests', admin: true, volunteer: true, citizen: false },
    { module: 'AI-Based Priority Assessment', admin: true, volunteer: true, citizen: false },
    { module: 'Interactive Leaflet GIS Map', admin: true, volunteer: true, citizen: true },
    { module: 'Relief Logistics Centres', admin: true, volunteer: true, citizen: true },
    { module: 'Depot Inventory Management', admin: true, volunteer: true, citizen: false },
    { module: 'Run Resource Allocation Engine', admin: true, volunteer: false, citizen: false },
    { module: 'Approve Dispatches & Deduct Stock', admin: true, volunteer: false, citizen: false },
    { module: 'Update Fleet Delivery Status', admin: true, volunteer: true, citizen: false },
    { module: 'Scenario Simulation Sandbox', admin: true, volunteer: false, citizen: false },
    { module: 'Operational Analytics & Reports', admin: true, volunteer: true, citizen: false },
    { module: 'System Configurations & Reset', admin: true, volunteer: false, citizen: false }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>ROLE-BASED ACCESS CONTROL (RBAC)</span>
          </div>
          <h1 className="text-2xl font-black text-white">User Accounts & Roles</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage authenticated actors, view role permission boundaries, and switch demo accounts for faculty inspection.
          </p>
        </div>
      </div>

      {/* Demo Credentials Cards for 1-Click Faculty Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {users.map((u) => {
          const isCurrent = currentUser?.id === u.id;

          return (
            <div
              key={u.id}
              className={`bg-[#111827] border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition ${
                isCurrent
                  ? 'border-blue-500/80 bg-gradient-to-b from-blue-950/20 via-[#111827] to-[#111827] ring-2 ring-blue-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded ${
                      u.role === 'ADMINISTRATOR'
                        ? 'bg-blue-950 text-blue-300 border border-blue-800'
                        : u.role === 'VOLUNTEER'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {u.role}
                  </span>

                  {isCurrent && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
                      CURRENT ACTIVE
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0">
                    <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{u.name}</h3>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-3">{u.organization}</p>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div>Login Email: <strong className="text-white">{u.email}</strong></div>
                  <div>Password: <strong className="text-cyan-400">{u.role === 'ADMINISTRATOR' ? 'admin' : u.role === 'VOLUNTEER' ? 'volunteer' : 'citizen'}</strong></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    switchRole(u.role);
                    showToast('info', 'Active Account Switched', `Logged in as ${u.name} (${u.role})`);
                  }}
                  disabled={isCurrent}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                  }`}
                >
                  {isCurrent ? 'Active Persona' : `Switch to ${u.role}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* RBAC Permission Matrix Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Role-Based Access Control (RBAC) Matrix</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Formal Authorization Specs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Feature / Operation Module</th>
                <th className="py-3 px-4 text-center text-blue-300">Administrator</th>
                <th className="py-3 px-4 text-center text-emerald-300">Volunteer / Field Worker</th>
                <th className="py-3 px-4 text-center text-amber-300">Citizen / Reporter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {rolePermissions.map((row, i) => (
                <tr key={i} className="hover:bg-slate-850 transition">
                  <td className="py-3 px-4 font-medium text-slate-200">{row.module}</td>
                  <td className="py-3 px-4 text-center">
                    {row.admin ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XIcon className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.volunteer ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XIcon className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.citizen ? (
                      <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                    ) : (
                      <XIcon className="w-4 h-4 text-slate-600 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
