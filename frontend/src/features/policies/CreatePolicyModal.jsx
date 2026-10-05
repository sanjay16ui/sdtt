import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Sliders, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components';

export function CreatePolicyModal({ isOpen, onClose, onCreatePolicy }) {
  const [policyName, setPolicyName] = useState('');
  const [mode, setMode] = useState('UIDAI_STANDARD');
  const [threshold, setThreshold] = useState('0.25');
  const [channel, setChannel] = useState('REST_API / Web Application');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!policyName.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newPolicy = {
        id: `POL-0${Math.floor(Math.random() * 90 + 10)}`,
        name: policyName.trim(),
        mode,
        threshold: `ε=${threshold}`,
        channel,
        status: 'Active',
        updated: 'Just now'
      };

      onCreatePolicy(newPolicy);
      setIsSubmitting(false);
      onClose();
      setPolicyName('');
    }, 300);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0b0c10] border border-[#1e2330] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1e2330] flex items-center justify-between bg-[#0d0f14]">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Create Governance Policy</h3>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#1e2330] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Policy Name</label>
              <input 
                type="text"
                required
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="e.g., DPDP 2023 Identity Boundary Policy"
                className="w-full bg-[#14161f] border border-[#2a3142] rounded-md px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Enforcement Mode</label>
                <select 
                  value={mode}
                  onChange={(e) => setMode(e.target.value)}
                  className="w-full bg-[#14161f] border border-[#2a3142] rounded-md px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="UIDAI_STANDARD">UIDAI Standard (XXXX-XXXX-1234)</option>
                  <option value="GAUSSIAN_BLUR">Gaussian Blur Redaction</option>
                  <option value="HARD_REDACTION">Hard Blackout Redaction</option>
                  <option value="DIFFERENTIAL_NOISE">Differential Privacy Noise</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">Epsilon Privacy Threshold ($\varepsilon$)</label>
                <select 
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full bg-[#14161f] border border-[#2a3142] rounded-md px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none font-mono"
                >
                  <option value="0.10">0.10 (Strict Privacy)</option>
                  <option value="0.25">0.25 (Balanced Protection)</option>
                  <option value="0.50">0.50 (Standard Audit)</option>
                  <option value="1.00">1.00 (High Utility)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Target Pipeline Modality</label>
              <select 
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-[#14161f] border border-[#2a3142] rounded-md px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="REST_API / Web Application">REST_API / Web Application</option>
                <option value="DOCUMENT_IMAGE_STUDIO">Document Image OCR Studio</option>
                <option value="DEVSECOPS_SECRETS_SCANNER">DevSecOps Secrets Scanner</option>
                <option value="LLM_EGRESS_GATEWAY">LLM Egress Gateway</option>
              </select>
            </div>

            <div className="bg-[#12151e] border border-[#1e2330] rounded-lg p-3 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero-Trust Real-time Policy Rule
              </div>
              <p>Policies are automatically enforced across Presidio NLP, OpenCV Vision, and SMTP Alert Gateways instantly upon creation.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1e2330]">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="text-xs gap-1.5">
                {isSubmitting ? "Enforcing..." : "Enforce Policy"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CreatePolicyModal;
