import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Filter, Search, ChevronRight, Download, Activity } from 'lucide-react';
import { Badge, Button } from '@/components';
import { TaintInspectorDrawer } from '@/features/live';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';

export default function LiveProtection() {
  const { events, isSimulating, toggleSimulation } = useStore();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterDecision, setFilterDecision] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter((evt) => {
    if (filterDecision !== 'ALL' && evt.decision !== filterDecision) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        evt.id.toLowerCase().includes(q) ||
        evt.subjectId.toLowerCase().includes(q) ||
        evt.recipient.toLowerCase().includes(q) ||
        evt.channel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex h-full overflow-hidden relative">
      <div className={cn("flex-1 flex flex-col transition-all duration-300 min-w-0", selectedEvent ? "mr-[420px]" : "")}>
        {/* Subheader Controls */}
        <div className="p-4 md:p-5 border-b border-[#1e2330] bg-[#0b0c10] flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" /> Live Protection & Release Explorer
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Real-time inspection of active AI release events and taint transformations.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={isSimulating ? "success" : "outline"} 
                onClick={toggleSimulation}
                className="gap-2 text-xs"
              >
                <span className={cn("w-2 h-2 rounded-full", isSimulating ? "bg-emerald-400 animate-pulse" : "bg-slate-500")} />
                {isSimulating ? "Stream Active" : "Stream Paused"}
              </Button>
              <Button variant="outline" className="gap-2 text-xs">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by Release ID, Subject ID, Recipient..." 
                className="w-full bg-[#14161f] border border-[#2a3142] rounded-md py-1.5 pl-8 pr-3 text-xs text-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={filterDecision}
                onChange={(e) => setFilterDecision(e.target.value)}
                className="bg-[#14161f] border border-[#2a3142] text-xs text-slate-300 rounded px-2.5 py-1.5 outline-none focus:border-blue-500"
              >
                <option value="ALL">All Decisions</option>
                <option value="ALLOWED">Allowed</option>
                <option value="TRANSFORMED">Transformed</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Live Events Table */}
        <div className="flex-1 overflow-auto bg-[#050608]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#0b0c10] text-slate-400 sticky top-0 border-b border-[#1e2330] z-10">
              <tr>
                <th className="px-4 py-3 font-medium">Release ID</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Recipient</th>
                <th className="px-4 py-3 font-medium">Channel</th>
                <th className="px-4 py-3 font-medium">Risk Score</th>
                <th className="px-4 py-3 font-medium">Decision</th>
                <th className="px-4 py-3 font-medium text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2330]/50">
              {filteredEvents.map((evt) => {
                const isSelected = selectedEvent?.id === evt.id;
                return (
                  <tr 
                    key={evt.id} 
                    onClick={() => setSelectedEvent(evt)}
                    className={cn(
                      "hover:bg-[#12151e] cursor-pointer transition-colors",
                      isSelected ? "bg-blue-950/20 border-l-2 border-l-blue-500" : ""
                    )}
                  >
                    <td className="px-4 py-3 font-mono text-cyan-400 font-medium">{evt.id}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono">
                      {format(new Date(evt.timestamp), 'HH:mm:ss')}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{evt.subjectId}</td>
                    <td className="px-4 py-3 text-slate-400 max-w-[150px] truncate">{evt.recipient}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-[#14161f] border border-[#2a3142] text-slate-300 text-[10px]">
                        {evt.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold",
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
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-500 inline-block" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Inspection Drawer */}
      <AnimatePresence>
        {selectedEvent && (
          <TaintInspectorDrawer 
            selectedEvent={selectedEvent} 
            onClose={() => setSelectedEvent(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
