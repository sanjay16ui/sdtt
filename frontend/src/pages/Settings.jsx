import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, Save, Shield, Database, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components';
import { isFirebaseConfigured } from '@/services/firebase';

export default function Settings() {
  const [epsilonBudget, setEpsilonBudget] = useState('2.0');
  const [retentionDays, setRetentionDays] = useState('30');
  const [autoMasking, setAutoMasking] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
            Governance System Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure global differential taint thresholds, cloud sync, and retention horizons.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 text-xs">
          {saved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      {/* Cloud & Firebase Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Cloud Storage & Firebase Sync State
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded bg-[#14161f] border border-[#1e2330]">
            <div>
              <div className="font-semibold text-slate-200">Firebase Firestore Real-Time Sync</div>
              <div className="text-slate-500 mt-0.5">
                {isFirebaseConfigured 
                  ? 'Connected to Firebase project cloud store.' 
                  : 'Running in Local Simulated Mode (Set VITE_FIREBASE_API_KEY to activate cloud sync).'}
              </div>
            </div>
            <Badge variant={isFirebaseConfigured ? 'success' : 'warning'}>
              {isFirebaseConfigured ? 'CLOUD CONNECTED' : 'LOCAL SIMULATED'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Differential Privacy Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            Global Privacy Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Global Session Epsilon Budget (ε)</label>
            <input 
              type="text" 
              value={epsilonBudget}
              onChange={e => setEpsilonBudget(e.target.value)}
              className="w-full bg-[#14161f] border border-[#2a3142] rounded px-3 py-2 text-xs font-mono text-cyan-400 outline-none focus:border-blue-500"
            />
            <p className="text-[11px] text-slate-500">Cumulative differential privacy budget allocated before hard output suppression.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-medium">Subject Session Retention Horizon (Days)</label>
            <input 
              type="text" 
              value={retentionDays}
              onChange={e => setRetentionDays(e.target.value)}
              className="w-full bg-[#14161f] border border-[#2a3142] rounded px-3 py-2 text-xs font-mono text-white outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[#1e2330]">
            <div>
              <span className="text-slate-300 font-medium">Automatic Surrogate Masking</span>
              <p className="text-[11px] text-slate-500">Automatically mask detected high-sensitivity QIDs before egress.</p>
            </div>
            <input 
              type="checkbox" 
              checked={autoMasking} 
              onChange={e => setAutoMasking(e.target.checked)} 
              className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
