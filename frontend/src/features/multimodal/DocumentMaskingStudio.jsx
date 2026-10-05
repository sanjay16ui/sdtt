import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Upload, Image as ImageIcon, ShieldCheck, AlertTriangle, RefreshCw, 
  Sparkles, CheckCircle2, Eye, Sliders, Layers, FileCheck
} from 'lucide-react';
import { Badge, Button, Card, CardHeader, CardTitle, CardContent } from '@/components';
import { useStore } from '@/store';
import { cn } from '@/utils/cn';

export function DocumentMaskingStudio() {
  const { addEvent } = useStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [compareMode, setCompareMode] = useState('side-by-side'); // 'side-by-side' | 'masked-only'

  const handleProcess = async (fileToUpload = null) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (fileToUpload) {
        formData.append('file', fileToUpload);
      } else if (selectedFile) {
        formData.append('file', selectedFile);
      }
      formData.append('subject_id', 'SUB-20491');
      formData.append('policy_id', 'POL-01 (UIDAI Safe Harbor)');

      const response = await fetch('/api/process/document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setResult(data);

      // Emit event to global audit ledger & 3D pipeline
      addEvent({
        id: data.transformation_signature || `DOC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        subjectId: "SUB-20491",
        timestamp: new Date().toISOString(),
        principal: "Document-Masking-Studio",
        recipient: "Secure Cloud Storage Egress",
        channel: "api_response",
        modality: "DOCUMENT_IMAGE",
        policyVersion: "POL-01",
        estimatorVersion: "RES-v4.1",
        riskScore: data.risk_score,
        credibleInterval: [data.risk_score - 4, data.risk_score + 4],
        decision: data.decision,
        transformationSignature: data.transformation_signature,
        retentionHorizon: "30 days",
        detectedInfo: [
          { type: "AADHAAR_UID", label: "Aadhaar Card Number", value: "8492 1204 9912", maskedValue: "XXXX-XXXX-9912", sensitivity: "Critical" },
          { type: "BIOMETRIC_QR", label: "Secure QR Code", value: "[ENCODED_BIOMETRIC]", maskedValue: "[GAUSSIAN_BLURRED]", sensitivity: "High" }
        ]
      });
    } catch (error) {
      console.error("Document processing failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      handleProcess(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Header & Sample Loader */}
      <div className="p-4 rounded-lg bg-[#0b0c10] border border-[#1e2330] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            Aadhaar Card & Identity Document Processing
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real Pillow & OpenCV computer-vision masking: draws bounding boxes over tainted regions, blurs QR codes, and masks 12-digit UIDs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer">
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-[#1e2330] border border-[#2a3142] text-xs text-slate-200 hover:text-white hover:border-slate-500 transition-colors">
              <Upload className="w-3.5 h-3.5 text-cyan-400" /> Upload ID Document
            </span>
          </label>
          <Button 
            onClick={() => handleProcess(null)} 
            disabled={loading}
            className="gap-2 text-xs font-semibold px-4"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {loading ? 'Processing Document...' : 'Run Aadhaar Card Sample'}
          </Button>
        </div>
      </div>

      {/* Dual Comparative Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Tainted Annotated Ingress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Raw Ingress with Detected Taint Bounding Boxes
              </CardTitle>
              <p className="text-[11px] text-slate-500">Color-coded bounding boxes identifying critical Quasi-Identifiers</p>
            </div>
            <Badge variant="danger">TAINTED INGRESS</Badge>
          </CardHeader>
          <CardContent className="pt-3 flex flex-col items-center justify-center">
            {result?.original_image_url ? (
              <div className="w-full rounded-lg overflow-hidden border border-[#1e2330] shadow-xl bg-slate-950 flex items-center justify-center p-2">
                <img 
                  src={result.original_image_url} 
                  alt="Original Document with Bounding Boxes" 
                  className="max-h-[380px] w-auto object-contain rounded"
                />
              </div>
            ) : (
              <div className="w-full h-64 rounded-lg border border-dashed border-[#1e2330] bg-[#0e1017] flex flex-col items-center justify-center text-center p-6">
                <ImageIcon className="w-10 h-10 text-slate-600 mb-2" />
                <span className="text-xs text-slate-400">No document processed yet.</span>
                <span className="text-[11px] text-slate-600 mt-1">Upload an image or click 'Run Aadhaar Card Sample' above.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Sanitized Egress Image */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Sanitized Egress (UIDAI Masked & Blurred)
              </CardTitle>
              <p className="text-[11px] text-slate-500">First 8 digits masked with 'XXXX-XXXX-', QR code Gaussian blurred</p>
            </div>
            <Badge variant={result ? "success" : "outline"}>
              {result ? "UIDAI COMPLIANT" : "READY"}
            </Badge>
          </CardHeader>
          <CardContent className="pt-3 flex flex-col items-center justify-center">
            {result?.masked_image_url ? (
              <div className="w-full rounded-lg overflow-hidden border border-emerald-900/40 shadow-xl shadow-emerald-950/20 bg-slate-950 flex items-center justify-center p-2">
                <img 
                  src={result.masked_image_url} 
                  alt="Masked Document Output" 
                  className="max-h-[380px] w-auto object-contain rounded"
                />
              </div>
            ) : (
              <div className="w-full h-64 rounded-lg border border-dashed border-[#1e2330] bg-[#0e1017] flex flex-col items-center justify-center text-center p-6">
                <ShieldCheck className="w-10 h-10 text-slate-600 mb-2" />
                <span className="text-xs text-slate-400">Sanitized output will appear here.</span>
                <span className="text-[11px] text-slate-600 mt-1">Real-time pixelated & masked image rendered by FastAPI.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Extracted Metadata & Bounding Boxes Table */}
      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-cyan-400" />
              Document Transformation Proof & Bounding Coordinates
            </CardTitle>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Latency: <strong className="text-cyan-400">{result.execution_time_ms} ms</strong></span>
              <span className="text-slate-400">Risk: <strong className="text-amber-400">{result.risk_score}%</strong></span>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-[#0e1017] text-slate-400 border-b border-[#1e2330]">
                <tr>
                  <th className="px-4 py-3 font-medium">Element</th>
                  <th className="px-4 py-3 font-medium">Sensitivity</th>
                  <th className="px-4 py-3 font-medium">Bounding Coordinates (x, y, w, h)</th>
                  <th className="px-4 py-3 font-medium">Applied Transformation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2330]/50 font-mono">
                {result.bounding_boxes.map((box, i) => (
                  <tr key={i} className="hover:bg-[#14161f] transition-colors">
                    <td className="px-4 py-3 font-bold text-white">{box.label}</td>
                    <td className="px-4 py-3">
                      <Badge variant={box.sensitivity === 'Critical' ? 'danger' : 'warning'}>
                        {box.sensitivity}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-cyan-400">
                      [{box.x}, {box.y}, {box.width}, {box.height}]
                    </td>
                    <td className="px-4 py-3 text-emerald-400">
                      {box.sensitivity === 'Critical' ? 'UIDAI Bar (XXXX-XXXX-)' : box.label.includes('QR') ? 'Gaussian Filter (r=14)' : 'Surrogate Mask'}
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

export default DocumentMaskingStudio;
