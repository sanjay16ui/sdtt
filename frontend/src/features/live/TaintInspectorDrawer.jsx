import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { Badge } from '@/components';
import { cn } from '@/utils/cn';

export function TaintInspectorDrawer({ selectedEvent, onClose }) {
  if (!selectedEvent) return null;

  return (
    <motion.div 
      initial={{ x: 420 }}
      animate={{ x: 0 }}
      exit={{ x: 420 }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="fixed top-14 right-0 bottom-0 w-[420px] bg-[#0b0c10] border-l border-[#1e2330] z-20 flex flex-col shadow-2xl overflow-y-auto"
    >
      <div className="p-4 border-b border-[#1e2330] flex items-center justify-between bg-[#0d0f14]">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-mono font-semibold">Taint Inspection</span>
          <h3 className="text-base font-bold text-white font-mono">{selectedEvent.id}</h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#1e2330]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-5 text-xs">
        {/* Decision Banner */}
        <div className={cn("p-3 rounded-lg border flex items-center justify-between",
          selectedEvent.decision === 'ALLOWED' ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-300" :
          selectedEvent.decision === 'TRANSFORMED' ? "bg-amber-950/30 border-amber-900/50 text-amber-300" :
          "bg-rose-950/30 border-rose-900/50 text-rose-300"
        )}>
          <div>
            <div className="font-bold text-sm">{selectedEvent.decision}</div>
            <div className="text-[11px] opacity-80">Enforced by {selectedEvent.policyVersion}</div>
          </div>
          <div className="text-right font-mono font-bold text-lg">
            {selectedEvent.riskScore}%
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Context Metadata</div>
          <div className="bg-[#14161f] border border-[#1e2330] rounded-lg p-3 space-y-2 font-mono text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-400">Subject ID:</span>
              <span className="text-cyan-400">{selectedEvent.subjectId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Principal:</span>
              <span className="text-slate-200">{selectedEvent.principal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Recipient:</span>
              <span className="text-slate-200">{selectedEvent.recipient}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Channel:</span>
              <span className="text-slate-200">{selectedEvent.channel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimator:</span>
              <span className="text-slate-200">{selectedEvent.estimatorVersion}</span>
            </div>
          </div>
        </div>

        {/* Detected Info */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold text-slate-500 uppercase">Detected Sensitive Attributes</div>
          <div className="space-y-2">
            {selectedEvent.detectedInfo?.map((info, idx) => (
              <div key={idx} className="bg-[#14161f] border border-[#1e2330] rounded-lg p-3 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-cyan-400 font-bold">{info.label}</span>
                  <Badge variant={info.sensitivity === 'Critical' ? 'danger' : 'warning'}>{info.sensitivity}</Badge>
                </div>
                <div className="text-[11px] text-slate-400">
                  Raw: <span className="line-through text-rose-400">{info.value}</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  Redacted: {info.maskedValue}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature */}
        <div className="space-y-1 pt-2 border-t border-[#1e2330]">
          <div className="text-[10px] text-slate-500 uppercase font-mono">Ledger Signature</div>
          <div className="p-2 rounded bg-[#08090c] border border-[#1e2330] font-mono text-[10px] text-slate-400 break-all">
            {selectedEvent.transformationSignature}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default TaintInspectorDrawer;
