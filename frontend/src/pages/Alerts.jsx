import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bell, AlertTriangle, ShieldAlert, CheckCircle2, Search, Filter, ArrowRight, Eye, ShieldCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components';
import { cn } from '@/utils/cn';
import { mockAlerts } from '@/mock/data';

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [selectedAlert, setSelectedAlert] = useState(mockAlerts[0]);
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filtered = alerts.filter(a => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  const resolveAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'RESOLVED' } : a));
    if (selectedAlert?.id === id) {
      setSelectedAlert(prev => ({ ...prev, status: 'RESOLVED' }));
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-400" /> Security Incidents & Privacy Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-1">High-priority policy violations, exfiltration alerts, and epsilon budget anomalies.</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-[#14161f] border border-[#2a3142] text-xs text-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH">High Only</option>
            <option value="MEDIUM">Medium Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              onClick={() => setSelectedAlert(alert)}
              className={cn(
                "p-4 rounded-lg border bg-[#0b0c10] cursor-pointer transition-all duration-150 hover:border-slate-600",
                selectedAlert?.id === alert.id ? "border-blue-500/80 bg-blue-950/10 shadow-lg shadow-blue-950/20" : "border-[#1e2330]"
              )}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2.5">
                  <Badge variant={
                    alert.severity === 'CRITICAL' ? 'danger' :
                    alert.severity === 'HIGH' ? 'warning' : 'info'
                  }>
                    {alert.severity}
                  </Badge>
                  <span className="font-mono text-xs text-slate-400 font-semibold">{alert.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">{alert.timestamp}</span>
                  <Badge variant={alert.status === 'RESOLVED' ? 'success' : 'outline'}>
                    {alert.status}
                  </Badge>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">{alert.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{alert.detail}</p>
              <div className="mt-3 flex items-center gap-4 text-[11px] font-mono text-slate-500">
                <span>Subject: <strong className="text-cyan-400">{alert.subject}</strong></span>
                <span>Source: <strong className="text-slate-300">{alert.source}</strong></span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Alert Details */}
        {selectedAlert && (
          <Card className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Incident Deep-Dive</span>
                <Badge variant={selectedAlert.status === 'RESOLVED' ? 'success' : 'danger'}>
                  {selectedAlert.status}
                </Badge>
              </div>
              <CardTitle className="mt-1">{selectedAlert.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="p-3 rounded bg-[#14161f] border border-[#1e2330] space-y-2 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Alert ID:</span>
                  <span className="text-white">{selectedAlert.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject:</span>
                  <span className="text-cyan-400">{selectedAlert.subject}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Source Channel:</span>
                  <span className="text-slate-300">{selectedAlert.source}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Logged:</span>
                  <span className="text-slate-300">{selectedAlert.timestamp}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-500">Investigation Details</span>
                <p className="mt-1 text-slate-300 leading-relaxed bg-[#0e1017] p-3 rounded border border-[#1e2330]">
                  {selectedAlert.detail}
                </p>
              </div>

              <div className="pt-2 border-t border-[#1e2330] flex gap-2">
                {selectedAlert.status !== 'RESOLVED' ? (
                  <Button 
                    onClick={() => resolveAlert(selectedAlert.id)}
                    variant="success" 
                    className="w-full gap-2 text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                  </Button>
                ) : (
                  <div className="w-full text-center py-2 text-emerald-400 font-mono text-xs bg-emerald-950/20 rounded border border-emerald-900/40">
                    Incident Closed & Audited
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
