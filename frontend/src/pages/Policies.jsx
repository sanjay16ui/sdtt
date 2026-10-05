import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Plus, CheckCircle2, Shield, Sliders, ArrowUpRight, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components';
import { mockPolicies } from '@/mock/data';
import { CreatePolicyModal } from '@/features/policies/CreatePolicyModal';

export default function Policies() {
  const [policies, setPolicies] = useState(mockPolicies);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreatePolicy = (newPolicy) => {
    setPolicies([newPolicy, ...policies]);
  };

  const handleDeletePolicy = (idToDelete) => {
    setPolicies(policies.filter(policy => policy.id !== idToDelete));
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <FileText className="w-6 h-6 text-cyan-400" />
            Governance Policy Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">Define and audit cryptographic privacy boundary rules across all model pipelines.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 text-xs">
          <Plus className="w-4 h-4" /> Create Policy
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {policies.map(policy => (
            <motion.div
              key={policy.id}
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 hover:border-slate-600 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="cyan">{policy.id}</Badge>
                      <h3 className="text-sm font-bold text-white">{policy.name}</h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Enforcement Mode: <strong className="text-slate-200">{policy.mode}</strong></span>
                      <span>Threshold: <strong className="text-amber-400 font-mono">{policy.threshold}</strong></span>
                      <span>Updated: {policy.updated}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="success">{policy.status}</Badge>
                    <Button variant="outline" size="sm" className="text-xs">Configure</Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border-rose-900/40 hover:border-rose-700/60 transition-colors p-2"
                      title="Delete Policy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        {policies.length === 0 && (
          <div className="text-center p-12 bg-[#0b0c10] border border-[#1e2330] rounded-xl text-slate-400 text-xs">
            No active policies defined. Click <strong>Create Policy</strong> above to add your first governance rule.
          </div>
        )}
      </div>

      {/* Create Policy Modal Dialog */}
      <CreatePolicyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreatePolicy={handleCreatePolicy}
      />
    </div>
  );
}
