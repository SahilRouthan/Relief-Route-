// =============================================================================
// RELIEFROUTE: Fairness-Aware Resource Allocation Engine (Core Feature)
// Triple Strategy Comparison: Equal vs Nearest-Centre vs Fairness-Optimized
// =============================================================================

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AllocationComparison, AllocationStrategyResult, AllocationItem } from '../types';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import {
  Scale,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Building2,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Package,
  Droplets,
  Activity,
  Boxes,
  Truck,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const AllocationPage: React.FC = () => {
  const { user, role } = useAuth();
  const { showToast } = useToast();
  const [comparison, setComparison] = useState<AllocationComparison | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<'equal' | 'nearest' | 'fairness'>('fairness');
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [approvedSuccess, setApprovedSuccess] = useState(false);

  const fetchAllocation = async () => {
    try {
      setLoading(true);
      const res = await api.calculateAllocation();
      setComparison(res);
    } catch (err: any) {
      showToast('error', 'Calculation Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocation();
  }, []);

  const handleApprove = async () => {
    if (!comparison) return;
    const activeItems = comparison.strategies[selectedStrategy].items;

    if (!window.confirm(`Approve and commit ${comparison.strategies[selectedStrategy].strategyName} plan? This will deduct supplies from relief centre stockpiles and dispatch emergency logistics convoys.`)) {
      return;
    }

    try {
      setApproving(true);
      const res = await api.approveAllocation(activeItems, user?.name || 'Administrator');
      showToast('success', 'Allocation Approved & Dispatched', res.message);
      setApprovedSuccess(true);
      setTimeout(() => {
        fetchAllocation();
      }, 1000);
    } catch (err: any) {
      showToast('error', 'Approval Error', err.message);
    } finally {
      setApproving(false);
    }
  };

  if (loading || !comparison) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
        <p className="text-slate-400 font-mono text-xs">Computing Linear Programming & Fairness Multi-Objective Matrix...</p>
      </div>
    );
  }

  const { strategies, metricsTable, explanation } = comparison;
  const currentStrategyData = strategies[selectedStrategy];

  // Visual comparison chart data
  const chartData = [
    {
      name: 'Fulfillment Rate (%)',
      Equal: strategies.equal.demandFulfillmentPct,
      Nearest: strategies.nearest.demandFulfillmentPct,
      'Fairness-Aware': strategies.fairness.demandFulfillmentPct
    },
    {
      name: "Fairness Index (x100)",
      Equal: Math.round(strategies.equal.fairnessIndex * 100),
      Nearest: Math.round(strategies.nearest.fairnessIndex * 100),
      'Fairness-Aware': Math.round(strategies.fairness.fairnessIndex * 100)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/30 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-purple-400 font-bold mb-1">
            <Scale className="w-4 h-4 text-purple-400" />
            <span>CORE OPTIMIZATION ENGINE • DISASTER RESOURCE EQUITY</span>
          </div>
          <h1 className="text-2xl font-black text-white">Fairness-Aware Resource Allocation Engine</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Compares 3 distinct distribution models to eliminate naive geographic bias and protect vulnerable high-mortality zones.
          </p>
        </div>

        {role === 'ADMINISTRATOR' && (
          <div className="flex items-center space-x-3">
            <button
              onClick={handleApprove}
              disabled={approving}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{approving ? 'Committing Dispatches...' : 'APPROVE ALLOCATION & DISPATCH'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Constraints & Governance Alert */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-start space-x-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-white">Strict Optimization Constraints:</strong>
          <p className="text-slate-400 text-[11px]">
            Stock non-negativity enforced (<code className="text-cyan-400">Allocated ≤ Stock</code>). Demand ceiling respected
            (<code className="text-cyan-400">Allocated ≤ Demanded</code>). Administrative sign-off mandatory before inventory deduction.
          </p>
        </div>
      </div>

      {/* Triple Strategy Comparison Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Strategy Comparison Matrix</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Evaluating 18 emergency sites against 5 regional depot inventories
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 px-2 text-[10px] uppercase font-mono hidden sm:inline">Active View:</span>
            <button
              onClick={() => setSelectedStrategy('equal')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedStrategy === 'equal' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              A. Equal
            </button>
            <button
              onClick={() => setSelectedStrategy('nearest')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedStrategy === 'nearest' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              B. Nearest
            </button>
            <button
              onClick={() => setSelectedStrategy('fairness')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                selectedStrategy === 'fairness' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              C. Fairness-Aware (Recommended)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Evaluation Metric</th>
                <th className="py-3 px-4 text-slate-300">Strategy A: Equal Distribution</th>
                <th className="py-3 px-4 text-amber-300">Strategy B: Nearest Relief Centre</th>
                <th className="py-3 px-4 text-cyan-300 font-bold bg-purple-950/20">
                  Strategy C: Fairness-Aware Optimized ★
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
              {metricsTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-850 transition">
                  <td className="py-3 px-4 font-sans font-semibold text-white">{row.metric}</td>
                  <td className="py-3 px-4 text-slate-400">{row.equal}</td>
                  <td className="py-3 px-4 text-amber-300">{row.nearest}</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold bg-purple-950/10">{row.fairness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Visual Chart & Explanation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Bar Chart */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white">Algorithmic Trade-off Analysis</h3>
            <span className="text-[10px] font-mono text-slate-400">Benchmark Metrics</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#2A364F', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Equal" fill="#64748B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Nearest" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Fairness-Aware" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainability Panel */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>Why the Fairness-Aware Optimizer Selected This Plan</span>
          </h3>

          <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-xl text-xs text-purple-200 leading-relaxed">
            {explanation.whyOptimizedWins}
          </div>

          <div className="space-y-2 pt-1 text-xs">
            <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
              Constraint Verification Checklist
            </span>
            {explanation.constraintsChecked.map((c, i) => (
              <div key={i} className="flex items-start space-x-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Per-Request Allocation Plan Details Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white">
              {currentStrategyData.strategyName} — Site Distribution Ledger
            </h3>
            <p className="text-[11px] text-slate-400">{currentStrategyData.description}</p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            Total Allocated: {currentStrategyData.totalAllocated.toLocaleString()} units
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Request Location</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assigned Centre & Distance</th>
                <th className="py-3 px-4">Food Allocated</th>
                <th className="py-3 px-4">Water Allocated</th>
                <th className="py-3 px-4">Med Kits</th>
                <th className="py-3 px-4">Shelter Kits</th>
                <th className="py-3 px-4">Fulfillment %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-xs">
              {currentStrategyData.items.map((item) => (
                <tr key={item.requestId} className="hover:bg-slate-850 transition">
                  <td className="py-3 px-4 font-sans font-semibold text-white">
                    <div>{item.requestName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.requestId}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        item.priorityCategory === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : item.priorityCategory === 'HIGH'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-yellow-950 text-yellow-300 border border-yellow-800'
                      }`}
                    >
                      {item.priorityCategory} ({item.priorityScore})
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans">
                    <div className="truncate max-w-[170px]">{item.assignedCentreName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{item.distanceKm} km</div>
                  </td>
                  <td className="py-3 px-4 text-slate-200">
                    {item.allocated.foodPackets} <span className="text-slate-500 text-[10px]">/ {item.demanded.foodPackets}</span>
                  </td>
                  <td className="py-3 px-4 text-cyan-400 font-bold">
                    {item.allocated.waterLitres}L <span className="text-slate-500 text-[10px]">/ {item.demanded.waterLitres}L</span>
                  </td>
                  <td className="py-3 px-4 text-rose-300 font-bold">
                    {item.allocated.medicalKits} <span className="text-slate-500 text-[10px]">/ {item.demanded.medicalKits}</span>
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">
                    {item.allocated.shelterKits} <span className="text-slate-500 text-[10px]">/ {item.demanded.shelterKits}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-white">
                    {Math.round(item.fulfillmentRatio * 100)}%
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
