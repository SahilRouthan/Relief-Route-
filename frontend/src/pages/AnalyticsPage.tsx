// =============================================================================
// RELIEFROUTE: Analytics & Reports Module
// Dynamic Visualizations + CSV Report Generation
// =============================================================================

import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { AnalyticsSummary, EmergencyRequest, Delivery } from '../types';
import { useToast } from '../context/ToastContext';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  PieChart as PieIcon,
  Navigation
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, reqRes, delRes] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getRequests(),
          api.getDeliveries()
        ]);
        setData(sumRes);
        setRequests(reqRes);
        setDeliveries(delRes);
      } catch (err: any) {
        showToast('error', 'Analytics Loading Failed', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-slate-400 font-mono text-xs">Aggregating State Logistics Analytics...</p>
      </div>
    );
  }

  // Disaster types distribution
  const disasterCounts: { [key: string]: number } = {};
  for (const r of requests) {
    const d = data.disasters.find((item) => item.id === r.disasterId);
    const type = d ? d.type : 'Other';
    disasterCounts[type] = (disasterCounts[type] || 0) + 1;
  }
  const disasterChartData = Object.entries(disasterCounts).map(([type, count]) => ({
    type,
    count
  }));

  // Deliveries status breakdown
  const deliveryStatusData = [
    { name: 'Delivered', value: data.deliveryPerformance.delivered, color: '#10B981' },
    { name: 'In Transit', value: data.deliveryPerformance.inTransit, color: '#8B5CF6' },
    { name: 'Dispatched', value: data.deliveryPerformance.dispatched, color: '#3B82F6' },
    { name: 'Approved', value: data.deliveryPerformance.approved, color: '#F59E0B' }
  ];

  // Average distance
  const totalDist = deliveries.reduce((sum, d) => sum + (d.estimatedDistanceKm || 0), 0);
  const avgDist = deliveries.length > 0 ? (totalDist / deliveries.length).toFixed(1) : '0';

  const handleDownloadCsv = (type: 'requests' | 'deliveries') => {
    const url = api.getReportsDownloadUrl(type);
    window.open(url, '_blank');
    showToast('success', 'Report Exported', `Downloaded dynamic ${type} CSV dataset.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>OPERATIONAL METRICS & ACADEMIC AUDIT</span>
          </div>
          <h1 className="text-2xl font-black text-white">Disaster Analytics & Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical performance evaluation of demand fulfillment, fleet mileage, and disaster type incident trends.
          </p>
        </div>

        {/* CSV Export Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleDownloadCsv('requests')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Requests CSV</span>
          </button>
          <button
            onClick={() => handleDownloadCsv('deliveries')}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-md transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Fleet Deliveries CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-[11px] text-slate-400 font-mono">Average Fleet Transit Distance</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">{avgDist} km</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Per humanitarian relief convoy</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-[11px] text-slate-400 font-mono">Verified Request Ratio</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {Math.round(((requests.length - data.metrics.pendingVerification) / (requests.length || 1)) * 100)}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Triaged by volunteer corps</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-[11px] text-slate-400 font-mono">Critical Priority Share</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {Math.round((data.priorityBreakdown.CRITICAL / (requests.length || 1)) * 100)}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">{data.priorityBreakdown.CRITICAL} critical emergency sites</p>
        </div>

        <div className="bg-[#111827] border border-slate-800 p-4 rounded-xl shadow-md">
          <span className="text-[11px] text-slate-400 font-mono">Fleet Utilization</span>
          <div className="text-2xl font-bold font-mono text-purple-400 mt-1">85.7%</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Active transport assets</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Disaster Type Distribution Bar Chart */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="font-bold text-sm text-white mb-4">Emergency Reports by Disaster Type</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={disasterChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="type" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#2A364F', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Reports" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Delivery Status Donut Chart */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <h3 className="font-bold text-sm text-white mb-4">Fleet Delivery Status Distribution</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deliveryStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deliveryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#2A364F', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-800 text-xs font-mono">
            {deliveryStatusData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-400">{item.name}:</span>
                <strong className="text-white">{item.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
