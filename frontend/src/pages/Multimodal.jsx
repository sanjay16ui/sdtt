import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Layers, FileText, Image as ImageIcon, Mic, ShieldCheck, 
  Cpu, Sparkles, AlertTriangle, ArrowRight 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components';
import { TextMaskingStudio, DocumentMaskingStudio } from '@/features/multimodal';
import { cn } from '@/utils/cn';

export default function Multimodal() {
  const [activeTab, setActiveTab] = useState('document'); // 'document' | 'text' | 'voice'

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Subtitle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <Layers className="w-6 h-6 text-cyan-400" />
            Multimodal Real-Time Masking & Governance Gateway
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Phase 1: Real computer-vision & text differential masking for Aadhaar cards, identity documents, and sensitive PII.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="cyan" className="text-xs px-2 py-1 font-mono">
            FastAPI Backend: Online (:8000)
          </Badge>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1e2330] pb-2">
        <button
          onClick={() => setActiveTab('document')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            activeTab === 'document'
              ? "bg-cyan-950/40 text-cyan-400 border border-cyan-800/60 shadow-lg shadow-cyan-950/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#14161f]"
          )}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Aadhaar & Document Masking (Phase 1)</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            activeTab === 'text'
              ? "bg-blue-950/40 text-blue-400 border border-blue-800/60 shadow-lg shadow-blue-950/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#14161f]"
          )}
        >
          <FileText className="w-4 h-4" />
          <span>Text & PII Sanitization (Phase 1)</span>
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer opacity-75",
            activeTab === 'voice'
              ? "bg-purple-950/40 text-purple-400 border border-purple-800/60 shadow-lg shadow-purple-950/20"
              : "text-slate-400 hover:text-slate-200 hover:bg-[#14161f]"
          )}
        >
          <Mic className="w-4 h-4" />
          <span>Voice-to-Voice Streaming (Phase 2)</span>
          <span className="text-[9px] font-mono px-1 rounded bg-purple-950 text-purple-300 border border-purple-800/50">NEXT</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'document' && (
        <DocumentMaskingStudio />
      )}

      {activeTab === 'text' && (
        <TextMaskingStudio />
      )}

      {activeTab === 'voice' && (
        <Card className="p-8 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-purple-950/40 border border-purple-800/60 flex items-center justify-center text-purple-400">
            <Mic className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Voice-to-Voice Real-Time Transaction Studio</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Phase 1 (Text & Documents) is active! In Phase 2, we will integrate Web Audio API microphone streaming and acoustic voiceprint de-correlation.
            </p>
          </div>
          <Button 
            onClick={() => setActiveTab('document')} 
            variant="outline" 
            className="text-xs gap-2"
          >
            Explore Phase 1 Document Masking <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Card>
      )}
    </div>
  );
}
