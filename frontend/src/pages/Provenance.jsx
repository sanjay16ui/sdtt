import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Box, GitCommit, ShieldCheck
} from 'lucide-react';
import { Badge, Button } from '@/components';
import { cn } from '@/utils/cn';
import { DataJourney3D, pipeline3DNodes } from '@/features/provenance';

const dagNodes2D = [
  { id: 'subj-1', type: 'Subject', label: 'SUB-20491', detail: 'Principal Identity Vault', x: 80, y: 220 },
  { id: 'int-1', type: 'Interaction', label: 'Session Ingestion', detail: 'Chat #SESS-812', x: 250, y: 220 },
  { id: 'data-1', type: 'Sensitive Data', label: 'Email + Financials', detail: 'Tainted QID Attributes', x: 440, y: 220 },
  { id: 'trans-1', type: 'Transformation', label: 'Differential Barrier', detail: 'Policy: POL-01 Mask', x: 630, y: 220 },
  { id: 'sys-1', type: 'AI System', label: 'Gemini 2.5 Flash', detail: 'Inference Layer', x: 820, y: 220 },
  { id: 'rec-1', type: 'Recipient', label: 'External Vendor API', detail: 'Controlled Endpoint', x: 1000, y: 220 },
];

const dagEdges2D = [
  { source: 'subj-1', target: 'int-1' },
  { source: 'int-1', target: 'data-1' },
  { source: 'data-1', target: 'trans-1' },
  { source: 'trans-1', target: 'sys-1' },
  { source: 'sys-1', target: 'rec-1' },
];

export default function Provenance() {
  const [viewMode, setViewMode] = useState('3D'); // '3D' | '2D'
  const [selectedNode, setSelectedNode] = useState(pipeline3DNodes[2]); // Default select Sensitive Data
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectNode = (node) => {
    setSelectedNode(node);
  };

  const handleSearch = (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim() !== '') {
      const match = pipeline3DNodes.find(n => 
        n.label.toLowerCase().includes(q.toLowerCase()) || 
        n.type.toLowerCase().includes(q.toLowerCase())
      );
      if (match) setSelectedNode(match);
    }
  };

  return (
    <div className="flex h-full overflow-hidden relative bg-[#050608]">
      {/* Top Search & Mode Switcher Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <div className="bg-[#0b0c10]/90 border border-[#1e2330] rounded-lg shadow-md flex items-center p-1 backdrop-blur-md">
          <Search className="w-3.5 h-3.5 text-slate-500 ml-2" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search 3D pipeline vertex..." 
            className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-44 md:w-56 px-2 py-1"
          />
        </div>

        {/* 3D / 2D View Switcher */}
        <div className="bg-[#0b0c10]/90 border border-[#1e2330] rounded-lg p-1 flex items-center gap-1 backdrop-blur-md shadow-md">
          <Button 
            variant={viewMode === '3D' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('3D')}
            className="gap-1.5 text-xs font-semibold"
          >
            <Box className="w-3.5 h-3.5" /> 3D Model
          </Button>
          <Button 
            variant={viewMode === '2D' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setViewMode('2D')}
            className="gap-1.5 text-xs"
          >
            <GitCommit className="w-3.5 h-3.5" /> 2D DAG
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden flex">
        {viewMode === '3D' ? (
          <DataJourney3D 
            selectedNode={selectedNode} 
            onSelectNode={handleSelectNode} 
          />
        ) : (
          <div className="w-full h-full relative overflow-auto p-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e2330_1px,transparent_1px),linear-gradient(to_bottom,#1e2330_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
            <div className="w-[1100px] h-[550px] relative mx-auto my-auto">
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {dagEdges2D.map((edge, i) => {
                  const src = dagNodes2D.find(n => n.id === edge.source);
                  const tgt = dagNodes2D.find(n => n.id === edge.target);
                  if (!src || !tgt) return null;
                  const isSelectedPath = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);
                  return (
                    <g key={i}>
                      <line 
                        x1={src.x + 80} 
                        y1={src.y + 35} 
                        x2={tgt.x} 
                        y2={tgt.y + 35} 
                        stroke={isSelectedPath ? "#38bdf8" : "#2a3142"} 
                        strokeWidth={isSelectedPath ? 2.5 : 1.5}
                        strokeDasharray={edge.target === 'trans-1' ? "4 4" : undefined}
                      />
                      <circle 
                        cx={(src.x + 80 + tgt.x) / 2} 
                        cy={(src.y + 35 + tgt.y + 35) / 2} 
                        r={3} 
                        fill={isSelectedPath ? "#38bdf8" : "#475569"} 
                      />
                    </g>
                  );
                })}
              </svg>

              {dagNodes2D.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                return (
                  <motion.div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    whileHover={{ scale: 1.05 }}
                    className={cn(
                      "absolute w-[160px] p-3 rounded-lg border bg-[#0b0c10] shadow-xl cursor-pointer transition-all select-none",
                      isSelected 
                        ? "border-cyan-400 ring-2 ring-cyan-500/20 shadow-cyan-900/30" 
                        : "border-[#1e2330] hover:border-slate-600"
                    )}
                    style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">{node.type}</span>
                    </div>
                    <div className="font-bold text-white text-xs truncate">{node.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">{node.detail}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right-Side 3D Vertex Inspector Panel */}
      {selectedNode && (
        <div className="w-[340px] md:w-[380px] border-l border-[#1e2330] bg-[#0b0c10]/95 p-5 flex flex-col z-20 backdrop-blur-md overflow-y-auto">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
              3D Pipeline Vertex Inspector
            </span>
            <Badge variant={selectedNode.status === 'Tainted' ? 'warning' : 'success'}>
              {selectedNode.status || 'Active'}
            </Badge>
          </div>

          <h2 className="text-xl font-bold text-white mt-1 mb-2 font-mono">{selectedNode.label}</h2>
          <p className="text-xs text-slate-400 mb-4">{selectedNode.description || selectedNode.detail}</p>
          
          <div className="space-y-4 text-xs">
            <div className="bg-[#14161f] border border-[#1e2330] rounded-lg p-3 space-y-2.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Vertex ID:</span>
                <span className="text-cyan-400 font-bold">{selectedNode.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pipeline Stage:</span>
                <span className="text-slate-200">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Taint Sensitivity:</span>
                <span className={cn(
                  selectedNode.sensitivity === 'Critical' ? "text-rose-400" :
                  selectedNode.sensitivity === 'Restricted' ? "text-amber-400" : "text-emerald-400"
                )}>
                  {selectedNode.sensitivity || 'Enforced'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cryptographic Proof:</span>
                <span className="text-purple-400">Attested (BLS12-381)</span>
              </div>
            </div>

            {/* Live Differential Bounds */}
            <div className="p-3 rounded-lg bg-[#0e1017] border border-[#1e2330] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Differential Leakage (Δ):</span>
                <span className="font-mono text-emerald-400 font-bold">1.2 × 10⁻⁶</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Privacy Loss Budget (ε):</span>
                <span className="font-mono text-cyan-400 font-bold">0.14 ε / 2.0 ε</span>
              </div>
            </div>

            {/* Quarantine & Verification Controls */}
            <div className="pt-3 border-t border-[#1e2330] space-y-2">
              <Button variant="default" className="w-full gap-2 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" /> Verify Differential Zero-Leakage
              </Button>
              <Button variant="outline" className="w-full text-xs text-slate-400 hover:text-white">
                Export 3D Lineage Proof (JSON-LD)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
