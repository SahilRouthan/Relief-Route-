// =============================================================================
// RELIEFROUTE: System Configuration & Algorithm Parameters
// =============================================================================

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import {
  Settings,
  Sliders,
  Scale,
  Cpu,
  RotateCcw,
  CheckCircle2,
  Save,
  Radio,
  Server
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const [config, setConfig] = useState<any>({
    priorityWeights: {
      disasterSeverity: 0.25,
      medicalUrgency: 0.25,
      essentialSupplyShortage: 0.20,
      affectedPopulation: 0.15,
      accessibilityDifficulty: 0.10,
      timeSinceReport: 0.05
    },
    fairnessAlpha: 0.65,
    usePythonMlService: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await api.getSystemConfig();
        setConfig(res);
      } catch (err: any) {
        showToast('error', 'Error loading system configuration', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleWeightChange = (key: string, val: number) => {
    setConfig({
      ...config,
      priorityWeights: {
        ...config.priorityWeights,
        [key]: val
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateSystemConfig(config);
      showToast('success', 'Configuration Saved', 'System weights and fairness parameters updated successfully.');
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset all demo databases to the pristine seed demonstration dataset?')) return;
    try {
      setResetting(true);
      const res = await api.resetDemoData();
      showToast('success', 'Demo Reset Successful', res.message);
      setTimeout(() => window.location.reload(), 600);
    } catch (err: any) {
      showToast('error', 'Reset Failed', err.message);
    } finally {
      setResetting(false);
    }
  };

  // Compute sum of weights
  const weightsSum = Math.round(
    (Object.values(config.priorityWeights || {}) as number[]).reduce((a: number, b: number) => a + Number(b), 0) * 100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <Settings className="w-4 h-4 text-cyan-400" />
            <span>ALGORITHM HYPERPARAMETERS & SYSTEM CONTROLS</span>
          </div>
          <h1 className="text-2xl font-black text-white">System Settings & Weights</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrate weighted priority decision indicators, tune fairness vs efficiency alpha, and manage environment data.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Weights Sliders */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Multi-Criteria Priority Weights</span>
            </h3>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                weightsSum === 100
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              Total Sum: {weightsSum}%
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Adjust the normalized weight distribution applied by the AI Priority Assessment Engine.
          </p>

          <div className="space-y-4 pt-2">
            {[
              { key: 'disasterSeverity', label: 'Disaster Severity Rating', default: 25 },
              { key: 'medicalUrgency', label: 'Medical Urgency & Trauma', default: 25 },
              { key: 'essentialSupplyShortage', label: 'Essential Supply Shortage', default: 20 },
              { key: 'affectedPopulation', label: 'Displaced Population Density', default: 15 },
              { key: 'accessibilityDifficulty', label: 'Accessibility / Terrain Risk', default: 10 },
              { key: 'timeSinceReport', label: 'Elapsed Time Since Report', default: 5 }
            ].map(({ key, label }) => {
              const currentVal = Math.round((config.priorityWeights[key] || 0) * 100);

              return (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{label}</span>
                    <span className="font-mono font-bold text-cyan-400">{currentVal}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={currentVal}
                    onChange={(e) => handleWeightChange(key, parseFloat(e.target.value) / 100)}
                    className="w-full accent-blue-500 bg-slate-800 rounded-lg cursor-pointer h-1.5"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Fairness Parameter & Microservice Status */}
        <div className="space-y-6">
          {/* Fairness Parameter */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Scale className="w-4 h-4 text-purple-400" />
              <span>Fairness-Efficiency Trade-off Alpha (α)</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tunes the optimization objective balance between pure proximity efficiency (α = 0.0) and strict equitable minimum baseline guarantee (α = 1.0).
            </p>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                <span className="text-slate-400">0.0 (Proximity First)</span>
                <span className="font-bold text-purple-400 text-sm">{config.fairnessAlpha}</span>
                <span className="text-slate-400">1.0 (Strict Equity)</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={config.fairnessAlpha}
                onChange={(e) => setConfig({ ...config, fairnessAlpha: parseFloat(e.target.value) })}
                className="w-full accent-purple-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>
          </div>

          {/* Microservice Live Status */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>AI Service Architecture Connection</span>
            </h3>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Node.js Express Backend:</span>
                <span className="text-emerald-400 font-bold">● Active (Port 5000)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Python FastAPI ML Service:</span>
                <span className="text-emerald-400 font-bold">● Active (Port 8000)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Active ML Classifiers:</span>
                <span className="text-cyan-400">RandomForest, DecisionTree, LogisticRegression</span>
              </div>
            </div>
          </div>

          {/* Reset Demo Data Card */}
          <div className="bg-rose-950/20 border border-rose-900/50 rounded-2xl p-5 shadow-xl">
            <h3 className="font-bold text-sm text-rose-300 flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Reset Demo State</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Wipes any experimental changes and restores the complete seed dataset (18 emergency reports across Uttarakhand, 5 relief centres, 7 vehicles, and 5 disasters).
            </p>

            <button
              onClick={handleResetDemo}
              disabled={resetting}
              className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl text-xs shadow-md transition disabled:opacity-50"
            >
              {resetting ? 'Resetting Database...' : 'Reset All Demo Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
