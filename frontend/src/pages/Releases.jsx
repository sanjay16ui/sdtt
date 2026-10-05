import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FileSearch, Download, Search, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components';
import { cn } from '@/utils/cn';
import { useStore } from '@/store';

export default function Releases() {
  const { events } = useStore();
  const [search, setSearch] = useState('');

  const filtered = events.filter(e => 
    e.id.toLowerCase().includes(search.toLowerCase()) ||
    e.subjectId.toLowerCase().includes(search.toLowerCase()) ||
    e.recipient.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <FileSearch className="w-6 h-6 text-cyan-400" />
            Release Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">Full historical ledger of all data egress and transformed payloads.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search release ledger..." 
              className="w-full bg-[#14161f] border border-[#2a3142] rounded-md py-1.5 pl-8 pr-3 text-xs text-slate-200 outline-none focus:border-blue-500"
            />
          </div>
          <Button variant="outline" className="gap-2 text-xs">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="bg-[#0e1017] text-slate-400 border-b border-[#1e2330]">
              <tr>
                <th className="px-5 py-3 font-medium">Release ID</th>
                <th className="px-5 py-3 font-medium">Subject</th>
                <th className="px-5 py-3 font-medium">Channel</th>
                <th className="px-5 py-3 font-medium">Target Recipient</th>
                <th className="px-5 py-3 font-medium">Risk Score</th>
                <th className="px-5 py-3 font-medium">Policy</th>
                <th className="px-5 py-3 font-medium">Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2330]/50 font-mono">
              {filtered.slice(0, 30).map(evt => (
                <tr key={evt.id} className="hover:bg-[#14161f] transition-colors">
                  <td className="px-5 py-3 text-cyan-400 font-semibold">{evt.id}</td>
                  <td className="px-5 py-3 text-slate-300">{evt.subjectId}</td>
                  <td className="px-5 py-3 text-slate-400 font-sans">{evt.channel}</td>
                  <td className="px-5 py-3 text-slate-300 font-sans">{evt.recipient}</td>
                  <td className="px-5 py-3 text-slate-200">{evt.riskScore}%</td>
                  <td className="px-5 py-3 text-slate-400">{evt.policyVersion}</td>
                  <td className="px-5 py-3 font-sans">
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
