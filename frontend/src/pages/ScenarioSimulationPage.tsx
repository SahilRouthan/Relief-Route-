// =============================================================================
// RELIEFROUTE: What-If Disaster Scenario Simulation Module
// Completely Isolated Sandbox Environment
// =============================================================================

import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Sliders,
  Users,
  Droplets,
  AlertTriangle,
  Activity,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  CheckCircle2
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

export const ScenarioSimulationPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeScenario, setActiveScenario] = useState<string>('POPULATION_SURGE');
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const runSimulation = async (scenarioType: string) => {
    setActiveScenario(scenarioType);
    setLoading(true);
    try {
      const res = await api.runSimulation(scenarioType);
      setSimulationResult(res);
      showToast('success', 'Scenario Simulated', `Calculated What-If impacts for ${res.scenarioDescription}`);
    } catch (err: any) {
      showToast('error', 'Simulation Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = simulationResult
    ? [
        {
          metric: 'Total Demand',
          Baseline: simulationResult.before.totalDemand,
          Simulated: simulationResult.after.totalDemand
        },
        {
          metric: 'Allocated Supply',
          Baseline: simulationResult.before.totalAllocated,
          Simulated: simulationResult.after.totalAllocated
        },
        {
          metric: 'Unmet Critical Demand',
          Baseline: simulationResult.before.unmetCriticalDemand,
          Simulated: simulationResult.after.unmetCriticalDemand
        }
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>WHAT-IF SCENARIO STRESS-TESTING LAB</span>
          </div>
          <h1 className="text-2xl font-black text-white">Disaster Scenario Simulation</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Test system resilience against sudden population surges, depot supply shocks, and critical infrastructure cuts.
          </p>
        </div>
      </div>

      {/* Sandbox Isolation Guarantee Alert */}
      <div className="bg-amber-950/30 border border-amber-800/60 p-3.5 rounded-xl flex items-start space-x-3 text-xs text-amber-200">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-white">Strict Sandbox Isolation Active:</strong> Parameter modifications and
          stress calculations executed in this module operate on cloned state buffers. Actual inventory ledgers and
          active emergency request records remain 100% untouched.
        </div>
      </div>

      {/* 4 Interactive Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Scenario 1 */}
        <button
          onClick={() => runSimulation('POPULATION_SURGE')}
          disabled={loading}
          className={`text-left p-4 rounded-2xl border transition-all shadow-xl ${
            activeScenario === 'POPULATION_SURGE'
              ? 'bg-blue-950/40 border-blue-500 shadow-blue-500/20 ring-2 ring-blue-500/30'
              : 'bg-[#111827] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900 text-blue-200 font-bold">
              SCENARIO 1
            </span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="font-bold text-white text-xs">Surge Population (+30%)</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Secondary slope failure triggers unexpected mass displacement into transit camps.
          </p>
        </button>

        {/* Scenario 2 */}
        <button
          onClick={() => runSimulation('WATER_STOCK_DEPLETION')}
          disabled={loading}
          className={`text-left p-4 rounded-2xl border transition-all shadow-xl ${
            activeScenario === 'WATER_STOCK_DEPLETION'
              ? 'bg-cyan-950/40 border-cyan-500 shadow-cyan-500/20 ring-2 ring-cyan-500/30'
              : 'bg-[#111827] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 font-bold">
              SCENARIO 2
            </span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <h3 className="font-bold text-white text-xs">Water Stock Loss (-40%)</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Forward reservoir pipeline breach causes severe drinking water supply deficit.
          </p>
        </button>

        {/* Scenario 3 */}
        <button
          onClick={() => runSimulation('ROAD_CLOSURE')}
          disabled={loading}
          className={`text-left p-4 rounded-2xl border transition-all shadow-xl ${
            activeScenario === 'ROAD_CLOSURE'
              ? 'bg-amber-950/40 border-amber-500 shadow-amber-500/20 ring-2 ring-amber-500/30'
              : 'bg-[#111827] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900 text-amber-200 font-bold">
              SCENARIO 3
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="font-bold text-white text-xs">Total NH-58 Closure</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Severe landslide blocks main Badrinath artery, forcing multi-hour convoy detours.
          </p>
        </button>

        {/* Scenario 4 */}
        <button
          onClick={() => runSimulation('CRITICAL_MEDICAL_EMERGENCY')}
          disabled={loading}
          className={`text-left p-4 rounded-2xl border transition-all shadow-xl ${
            activeScenario === 'CRITICAL_MEDICAL_EMERGENCY'
              ? 'bg-rose-950/40 border-rose-500 shadow-rose-500/20 ring-2 ring-rose-500/30'
              : 'bg-[#111827] border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900 text-rose-200 font-bold">
              SCENARIO 4
            </span>
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <h3 className="font-bold text-white text-xs">Critical Medical Emergency</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Flash cloudburst in high-altitude Chamoli hamlet reports 26 acute trauma casualties.
          </p>
        </button>
      </div>

      {/* Simulation Results Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
          <p className="text-slate-400 font-mono text-xs">Running Multi-Factor What-If Stress Simulation...</p>
        </div>
      ) : simulationResult ? (
        <div className="space-y-6">
          {/* Delta KPI Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
              <span className="text-[11px] text-slate-400 font-mono block mb-1">Total Demand Surge</span>
              <div className="text-xl font-bold font-mono text-white">
                {simulationResult.after.totalDemand.toLocaleString()} units
              </div>
              <div className="flex items-center space-x-1 text-xs font-mono mt-1 text-rose-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+{simulationResult.delta.demandDelta.toLocaleString()} units</span>
              </div>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
              <span className="text-[11px] text-slate-400 font-mono block mb-1">Allocated Resources</span>
              <div className="text-xl font-bold font-mono text-cyan-400">
                {simulationResult.after.totalAllocated.toLocaleString()} units
              </div>
              <div className="flex items-center space-x-1 text-xs font-mono mt-1 text-emerald-400">
                <span>Delta: {simulationResult.delta.allocatedDelta > 0 ? `+${simulationResult.delta.allocatedDelta}` : simulationResult.delta.allocatedDelta}</span>
              </div>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
              <span className="text-[11px] text-slate-400 font-mono block mb-1">Unmet Critical Demand</span>
              <div className="text-xl font-bold font-mono text-rose-400">
                {simulationResult.after.unmetCriticalDemand.toLocaleString()} units
              </div>
              <div className="flex items-center space-x-1 text-xs font-mono mt-1 text-rose-300">
                <span>Deficit Surge: +{simulationResult.delta.unmetCriticalDemandDelta.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
              <span className="text-[11px] text-slate-400 font-mono block mb-1">Fairness Index (Jain's)</span>
              <div className="text-xl font-bold font-mono text-purple-400">
                {simulationResult.after.fairnessIndex}
              </div>
              <div className="text-xs font-mono text-slate-400 mt-1">
                Baseline: {simulationResult.before.fairnessIndex}
              </div>
            </div>
          </div>

          {/* Before vs After Visual Comparison Chart */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-sm text-white mb-4">
              Before vs After Stress Comparison (Baseline vs Simulated Scenario)
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#2A364F', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Baseline" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <Sliders className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-200">Select a Disaster Scenario to Begin Stress-Test</h4>
          <p className="text-xs mt-1">
            Click any scenario above to observe immediate algorithmic recalibration and supply chain impacts.
          </p>
        </div>
      )}
    </div>
  );
};
