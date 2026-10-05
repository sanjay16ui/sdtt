import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, TrendingUp, ShieldAlert, BarChart3, Gauge, Cpu, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components';
import { mockRiskFactors } from '@/mock/data';

export default function RiskIntelligence() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          Differential Risk Intelligence
        </h1>
        <p className="text-xs text-slate-400 mt-1">Multi-factor statistical estimators and cumulative epsilon dissipation models.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total System Epsilon</span>
            <Badge variant="success">IN BOUNDS</Badge>
          </div>
          <div className="text-3xl font-bold text-white font-mono">0.84 <span className="text-sm font-normal text-slate-500">/ 2.0 ε</span></div>
          <div className="h-2 w-full bg-[#1e2330] rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '42%' }}></div>
          </div>
          <p className="text-[11px] text-slate-500">Differential privacy privacy budget usage across all active sessions.</p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Delta Leakage Probability</span>
            <Badge variant="cyan">OPTIMAL</Badge>
          </div>
          <div className="text-3xl font-bold text-white font-mono">1.2 × 10<sup className="text-xs">-6</sup></div>
          <div className="h-2 w-full bg-[#1e2330] rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: '12%' }}></div>
          </div>
          <p className="text-[11px] text-slate-500">Probability of unintended quasi-identifier linkability.</p>
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Model Vulnerability Index</span>
            <Badge variant="warning">MODERATE</Badge>
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono">18.4%</div>
          <div className="h-2 w-full bg-[#1e2330] rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '18.4%' }}></div>
          </div>
          <p className="text-[11px] text-slate-500">Calculated susceptibility against adaptive adversarial reconstruction.</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Differential Risk Factor Attribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockRiskFactors.map(factor => (
            <div key={factor.id} className="space-y-1 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-slate-300">{factor.label}</span>
                <span className="text-cyan-400 font-mono">{factor.contribution}% Impact</span>
              </div>
              <div className="h-2.5 w-full bg-[#14161f] rounded-full overflow-hidden border border-[#1e2330]">
                <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full" style={{ width: `${factor.contribution}%` }}></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
