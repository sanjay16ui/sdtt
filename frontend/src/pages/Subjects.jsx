import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Search, Filter, ShieldCheck, AlertTriangle, ArrowUpRight, Eye } from 'lucide-react';
import { Card, Badge, Button } from '@/components';
import { cn } from '@/utils/cn';
import { mockSubjects } from '@/mock/data';

export default function Subjects() {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockSubjects.filter(s => 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <Users className="w-6 h-6 text-cyan-400" />
            Subject Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">One persistent privacy state across every channel, model, and modality.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Subject ID..." 
              className="w-full bg-[#14161f] border border-[#2a3142] rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <Button variant="outline" className="px-3">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="text-slate-400 uppercase bg-[#0e1017] border-b border-[#1e2330]">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Subject ID</th>
                <th className="px-6 py-4 font-medium tracking-wider">Risk Score</th>
                <th className="px-6 py-4 font-medium tracking-wider">Active Sessions</th>
                <th className="px-6 py-4 font-medium tracking-wider">Channels</th>
                <th className="px-6 py-4 font-medium tracking-wider">Tainted QIDs</th>
                <th className="px-6 py-4 font-medium tracking-wider">Last Activity</th>
                <th className="px-6 py-4 font-medium tracking-wider">Retention Window</th>
                <th className="px-6 py-4 font-medium tracking-wider">Governance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2330]/60">
              {filtered.map((subject, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  key={subject.id} 
                  className="hover:bg-[#14161f] transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-mono text-cyan-400 font-semibold group-hover:text-cyan-300">
                    {subject.id}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      subject.risk === 'CRITICAL' ? 'danger' :
                      subject.risk === 'HIGH' ? 'danger' :
                      subject.risk === 'MEDIUM' ? 'warning' : 'success'
                    }>
                      {subject.risk}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-300">{subject.sessions}</td>
                  <td className="px-6 py-4 text-slate-300">{subject.channels} active</td>
                  <td className="px-6 py-4 font-mono text-amber-400">{subject.qids}</td>
                  <td className="px-6 py-4 text-slate-400">{subject.lastSeen}</td>
                  <td className="px-6 py-4 font-mono text-slate-400">{subject.retention}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs">
                      <ShieldCheck className="w-4 h-4" /> {subject.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
