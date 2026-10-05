import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, ShieldCheck, AlertTriangle, ArrowRight, RefreshCw, 
  Sparkles, CheckCircle2, Lock, Copy, Check, Sliders
} from 'lucide-react';
import { Badge, Button, Card, CardHeader, CardTitle, CardContent } from '@/components';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';

const SAMPLE_PRESETS = [
  {
    name: "Aadhaar & PAN Identity",
    text: "Employee Rajesh Sharma (Aadhaar: 8492 1204 9912, PAN: ABCDE1234F) requested access to payroll with email rajesh.sharma@enterprise.com and phone +91 98241 12049."
  },
  {
    name: "Financial Transaction",
    text: "Wire transfer approval of $4.2M Million USD from account holder with Aadhaar 9912 8841 2234 and phone +91 99887 66554. Contact CFO at finance-lead@corp.in."
  },
  {
    name: "Customer Support Query",
    text: "Customer reports lost card. Card number 4532 8912 3456 7890. User Aadhaar reference 7741 2309 8812. Email address user.support@gmail.com."
  }
];

export function TextMaskingStudio() {
  const { addEvent } = useStore();
  const [inputText, setInputText] = useState(SAMPLE_PRESETS[0].text);
  const [maskingMode, setMaskingMode] = useState("UIDAI_STANDARD");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleProcess = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('/api/process/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          subject_id: "SUB-20491",
          policy_id: "POL-01 (UIDAI Safe Harbor)",
          masking_mode: maskingMode
        })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setResult(data);

      // Emit to global governance audit feed
      if (data.detected_entities?.length > 0) {
        addEvent({
          id: data.transformation_signature || `REL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          subjectId: "SUB-20491",
          timestamp: new Date().toISOString(),
          principal: "Text-Masking-Studio",
          recipient: "LLM Model Ingress",
          channel: "model_output",
          modality: "TEXT",
          policyVersion: "POL-01",
          estimatorVersion: "RES-v4.1",
          riskScore: data.risk_score,
          credibleInterval: data.credible_interval,
          decision: data.decision,
          transformationSignature: data.transformation_signature,
          retentionHorizon: "7 days",
          detectedInfo: data.detected_entities.map(e => ({
            type: e.type,
            label: e.label,
            value: e.raw_value,
            maskedValue: e.masked_value,
            sensitivity: e.sensitivity
          }))
        });
      }
    } catch (error) {
      console.error("Processing failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result?.masked_text) {
      navigator.clipboard.writeText(result.masked_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Preset Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#0b0c10] border border-[#1e2330]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-slate-500 font-semibold uppercase">Load Sample PII:</span>
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setInputText(preset.text)}
              className="px-2.5 py-1 rounded text-xs bg-[#14161f] border border-[#2a3142] text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">UIDAI Mask Mode:</span>
          <select
            value={maskingMode}
            onChange={(e) => setMaskingMode(e.target.value)}
            className="bg-[#14161f] border border-[#2a3142] text-xs text-cyan-400 rounded px-2.5 py-1 outline-none font-mono"
          >
            <option value="UIDAI_STANDARD">UIDAI Standard (XXXX-XXXX-1234)</option>
            <option value="HARD_REDACT">Hard Redact ([REDACTED])</option>
            <option value="SURROGATE">Surrogate Tokenization</option>
          </select>
        </div>
      </div>

      {/* Input & Output Dual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Raw Ingress Panel */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Raw Ingress Text (Tainted)
            </CardTitle>
            <Badge variant="danger">UNSANITIZED</Badge>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-3 space-y-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw text containing Aadhaar numbers, PAN, emails, or phone numbers..."
              rows={6}
              className="w-full bg-[#14161f] border border-[#2a3142] rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500 font-mono leading-relaxed resize-none"
            />
            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-slate-500 font-mono">
                Payload Size: {inputText.length} chars
              </span>
              <Button 
                onClick={handleProcess} 
                disabled={loading || !inputText.trim()}
                className="gap-2 text-xs font-semibold px-5"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {loading ? 'Processing Differential Masking...' : 'Execute Real Masking'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sanitized Egress Panel */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sanitized Egress Text (Protected)
            </CardTitle>
            <div className="flex items-center gap-2">
              {result && (
                <button
                  onClick={copyToClipboard}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#1e2330] transition-colors"
                  title="Copy Masked Text"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
              <Badge variant={result ? "success" : "outline"}>
                {result ? result.decision : "WAITING"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col pt-3 space-y-4">
            <div className="w-full h-full min-h-[140px] bg-[#0e1017] border border-[#1e2330] rounded-lg p-3 text-xs text-emerald-400 font-mono leading-relaxed overflow-auto select-text">
              {result ? (
                result.masked_text
              ) : (
                <span className="text-slate-600 italic">
                  Click 'Execute Real Masking' to process and see sanitized text with UIDAI masked Aadhaar and redacted attributes.
                </span>
              )}
            </div>

            {result && (
              <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] font-mono border-t border-[#1e2330]">
                <div className="p-2 rounded bg-[#14161f] border border-[#1e2330]">
                  <span className="text-slate-500 block text-[9px] uppercase">Risk Score</span>
                  <span className="text-amber-400 font-bold text-sm">{result.risk_score}%</span>
                </div>
                <div className="p-2 rounded bg-[#14161f] border border-[#1e2330]">
                  <span className="text-slate-500 block text-[9px] uppercase">Latency</span>
                  <span className="text-cyan-400 font-bold text-sm">{result.execution_time_ms} ms</span>
                </div>
                <div className="p-2 rounded bg-[#14161f] border border-[#1e2330]">
                  <span className="text-slate-500 block text-[9px] uppercase">Entities</span>
                  <span className="text-purple-400 font-bold text-sm">{result.detected_entities.length} Detected</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detected Entities Deep-Dive */}
      {result && result.detected_entities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Detected PII Entities & Quasi-Identifiers ({result.detected_entities.length})
            </CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-[#0e1017] text-slate-400 border-b border-[#1e2330]">
                <tr>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Label</th>
                  <th className="px-4 py-3 font-medium">Raw Value (Tainted)</th>
                  <th className="px-4 py-3 font-medium">Masked Output</th>
                  <th className="px-4 py-3 font-medium">Sensitivity</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2330]/50 font-mono">
                {result.detected_entities.map((entity, idx) => (
                  <tr key={idx} className="hover:bg-[#14161f] transition-colors">
                    <td className="px-4 py-3 font-bold text-cyan-400">{entity.type}</td>
                    <td className="px-4 py-3 text-slate-300">{entity.label}</td>
                    <td className="px-4 py-3 text-rose-400 line-through">{entity.raw_value}</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">{entity.masked_value}</td>
                    <td className="px-4 py-3">
                      <Badge variant={entity.sensitivity === 'Critical' ? 'danger' : 'warning'}>
                        {entity.sensitivity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {(entity.confidence * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default TextMaskingStudio;
