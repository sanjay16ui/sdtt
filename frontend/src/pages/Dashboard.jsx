import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Filter, Download, Activity, AlertTriangle, Flame
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components';
import { MetricsGrid, RiskChart } from '@/features/dashboard';
import { useStore } from '@/store';
import { mockMetrics, mockRiskFactors } from '@/mock/data';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { cn } from '@/utils/cn';

export default function Dashboard() {
  const { events } = useStore();
  const [timeRange, setTimeRange] = useState('24h');

  const chartData = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      time: `${String(i).padStart(2, '0')}:00`,
      allowed: Math.floor(Math.random() * 800) + 250,
      transformed: Math.floor(Math.random() * 280) + 60,
      blocked: Math.floor(Math.random() * 60) + 8,
    }));
  }, [timeRange]);

  const recentEvents = events.slice(0, 6);

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            Governance Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time differential taint tracking and privacy boundaries across LLM interactions.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center border border-[#2a3142] rounded bg-[#0b0c10] p-1">
            {['24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "px-3 py-1 rounded transition-colors text-xs font-medium cursor-pointer",
                  timeRange === range ? "bg-[#1e2330] text-blue-400 font-bold" : "text-slate-400 hover:text-slate-200"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <Link to={ROUTES.LIVE}>
            <Button variant="outline" className="gap-2 text-xs">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> Live Stream
            </Button>
          </Link>
          <Button variant="outline" className="gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Export Audit
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <MetricsGrid metrics={mockMetrics} />

      {/* Analytics Chart & Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Release Volume & Transformation Decisions</CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">Aggregate AI release requests categorized by governance decision</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Allowed
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Transformed
              </span>
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Blocked
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <RiskChart data={chartData} />
          </CardContent>
        </Card>

        {/* Risk Breakdown Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Differential Risk Factors
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Top contributors to overall cumulative taint score</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {mockRiskFactors.map((factor) => (
              <div key={factor.id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{factor.label}</span>
                  <span className="font-mono text-cyan-400">{factor.contribution}%</span>
                </div>
                <div className="h-2 w-full bg-[#14161f] rounded-full overflow-hidden border border-[#1e2330]">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" 
                    style={{ width: `${factor.contribution}%` }}
                  />
                </div>
              </div>
            ))}
            
            <div className="mt-6 pt-4 border-t border-[#1e2330] flex items-center justify-between">
              <span className="text-xs text-slate-400">Total System Epsilon Budget:</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
                0.84 / 2.00 ε
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Recent Releases Stream */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Recent Taint Evaluations
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Inspected release events processed across agent channels</p>
          </div>
          <Link to={ROUTES.LIVE} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View Live Stream <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#0e1017] text-slate-400 border-b border-[#1e2330]">
              <tr>
                <th className="px-4 py-3 font-medium">Release ID</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Recipient</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Risk Score</th>
                <th className="px-4 py-3 font-medium">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2330]/60">
              {recentEvents.map((evt) => (
                <tr key={evt.id} className="hover:bg-[#12151e] transition-colors">
                  <td className="px-4 py-3 font-mono text-cyan-400 font-medium">{evt.id}</td>
                  <td className="px-4 py-3 font-mono text-slate-300">{evt.subjectId}</td>
                  <td className="px-4 py-3 text-slate-400">{evt.recipient}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-[#14161f] border border-[#2a3142] text-slate-300 text-[10px]">
                      {evt.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold",
                      evt.riskScore > 70 ? "text-rose-400 bg-rose-950/40" :
                      evt.riskScore > 35 ? "text-amber-400 bg-amber-950/40" :
                      "text-emerald-400 bg-emerald-950/40"
                    )}>
                      {evt.riskScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {evt.decision === 'ALLOWED' && <Badge variant="success">Allowed</Badge>}
                    {evt.decision === 'TRANSFORMED' && <Badge variant="warning">Transformed</Badge>}
                    {evt.decision === 'BLOCKED' && <Badge variant="danger">Blocked</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
