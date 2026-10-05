import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Server, Cpu, Shield, Activity, Lock, Globe, Plus, 
  CheckCircle2, AlertTriangle, RefreshCw, Key, Settings2, Zap, Radio,
  Copy, Check, Eye, EyeOff
} from 'lucide-react';
import { Card, Badge, Button } from '@/components';

const initialProviders = [
  { 
    id: 'prov-openai',
    name: 'OpenAI Cloud Gateway', 
    type: 'Cloud API',
    status: 'Active', 
    latency: '240ms', 
    health: '100%',
    protocol: 'TLS 1.3 + Egress Presidio Filter', 
    models: ['gpt-4o', 'o3-mini', 'gpt-4-turbo'],
    color: 'text-emerald-400',
    bgGlow: 'from-emerald-500/10 to-teal-500/5',
    borderColor: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    apiKeyMasked: 'sk-proj-••••••••••••39A2',
    endpoint: 'https://api.openai.com/v1',
    interceptionCount: '14,290'
  },
  { 
    id: 'prov-anthropic',
    name: 'Anthropic Claude Proxy', 
    type: 'Cloud API',
    status: 'Active', 
    latency: '210ms', 
    health: '99.9%',
    protocol: 'mTLS + Differential Taint Fence', 
    models: ['claude-3-5-sonnet', 'claude-3-opus'],
    color: 'text-amber-400',
    bgGlow: 'from-amber-500/10 to-orange-500/5',
    borderColor: 'border-amber-500/30',
    iconBg: 'bg-amber-500/10 text-amber-400',
    apiKeyMasked: 'sk-ant-api03-••••••••••••8B19',
    endpoint: 'https://api.anthropic.com/v1',
    interceptionCount: '9,840'
  },
  { 
    id: 'prov-google',
    name: 'Google Gemini Vertex Gateway', 
    type: 'Cloud API',
    status: 'Active', 
    latency: '160ms', 
    health: '100%',
    protocol: 'DP Noise Guard + UIDAI Safe Harbor', 
    models: ['gemini-2.5-flash', 'gemini-1.5-pro'],
    color: 'text-blue-400',
    bgGlow: 'from-blue-500/10 to-cyan-500/5',
    borderColor: 'border-blue-500/30',
    iconBg: 'bg-blue-500/10 text-blue-400',
    apiKeyMasked: 'AIzaSyD-••••••••••••7F42',
    endpoint: 'https://generativelanguage.googleapis.com',
    interceptionCount: '18,520'
  },
  { 
    id: 'prov-vllm',
    name: 'Self-Hosted vLLM / Ollama Cluster', 
    type: 'Air-Gapped VPC',
    status: 'Active', 
    latency: '42ms', 
    health: '100%',
    protocol: 'Zero-Egress Private Subnet', 
    models: ['llama-3.3-70b-instruct', 'deepseek-r1-70b'],
    color: 'text-purple-400',
    bgGlow: 'from-purple-500/10 to-indigo-500/5',
    borderColor: 'border-purple-500/30',
    iconBg: 'bg-purple-500/10 text-purple-400',
    apiKeyMasked: 'Bearer vllm-internal-token-local',
    endpoint: 'http://10.0.4.12:8000/v1',
    interceptionCount: '42,110'
  },
];

export default function ModelProviders() {
  const [providers, setProviders] = useState(initialProviders);
  const [pingingId, setPingingId] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Dedicated Create API Modal State
  const [isCreateApiModalOpen, setIsCreateApiModalOpen] = useState(false);
  const [apiName, setApiName] = useState('');
  const [apiProvider, setApiProvider] = useState('OpenAI');
  const [apiKeySecret, setApiKeySecret] = useState('');
  const [createdKeyData, setCreatedKeyData] = useState(null);
  const [copiedModalKey, setCopiedModalKey] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState({});
  const [copiedCardKey, setCopiedCardKey] = useState(null);

  // New Provider Form State
  const [newProvName, setNewProvName] = useState('');
  const [newProvType, setNewProvType] = useState('Cloud API');
  const [newProvEndpoint, setNewProvEndpoint] = useState('');
  const [newProvModel, setNewProvModel] = useState('');

  // Auto-generate secure API key for selected provider
  const generateNewKeyForProvider = (providerName) => {
    const prefixMap = {
      'OpenAI': 'sk-proj-',
      'Anthropic': 'sk-ant-api03-',
      'Google Gemini': 'AIzaSyD-',
      'Self-Hosted vLLM': 'Bearer vllm-',
      'Custom': 'sk-custom-'
    };
    const prefix = prefixMap[providerName] || 'sk-api-';
    const randomBytes = Array.from({length: 24}, () => Math.floor(Math.random() * 36).toString(36)).join('');
    return `${prefix}${randomBytes}`;
  };

  // Open Create API Modal
  const openCreateApiModal = () => {
    setApiName('');
    setApiProvider('OpenAI');
    setCreatedKeyData(null);
    setIsCreateApiModalOpen(true);
  };

  // Submit Handler for Create API Key
  const handleCreateApi = (e) => {
    e.preventDefault();
    if (!apiName.trim()) return;

    const rawKey = generateNewKeyForProvider(apiProvider);
    const maskedKey = `${rawKey.slice(0, 7)}••••••••••••${rawKey.slice(-4)}`;

    const providerPresetMap = {
      'OpenAI': {
        type: 'Cloud API',
        color: 'text-emerald-400',
        bgGlow: 'from-emerald-500/10 to-teal-500/5',
        borderColor: 'border-emerald-500/30',
        iconBg: 'bg-emerald-500/10 text-emerald-400',
        endpoint: 'https://api.openai.com/v1',
        protocol: 'TLS 1.3 + Egress Presidio Filter',
        models: ['gpt-4o', 'o3-mini']
      },
      'Anthropic': {
        type: 'Cloud API',
        color: 'text-amber-400',
        bgGlow: 'from-amber-500/10 to-orange-500/5',
        borderColor: 'border-amber-500/30',
        iconBg: 'bg-amber-500/10 text-amber-400',
        endpoint: 'https://api.anthropic.com/v1',
        protocol: 'mTLS + Differential Taint Fence',
        models: ['claude-3-5-sonnet', 'claude-3-opus']
      },
      'Google Gemini': {
        type: 'Cloud API',
        color: 'text-blue-400',
        bgGlow: 'from-blue-500/10 to-cyan-500/5',
        borderColor: 'border-blue-500/30',
        iconBg: 'bg-blue-500/10 text-blue-400',
        endpoint: 'https://generativelanguage.googleapis.com',
        protocol: 'DP Noise Guard + UIDAI Safe Harbor',
        models: ['gemini-2.5-flash', 'gemini-1.5-pro']
      },
      'Self-Hosted vLLM': {
        type: 'Air-Gapped VPC',
        color: 'text-purple-400',
        bgGlow: 'from-purple-500/10 to-indigo-500/5',
        borderColor: 'border-purple-500/30',
        iconBg: 'bg-purple-500/10 text-purple-400',
        endpoint: 'http://10.0.4.12:8000/v1',
        protocol: 'Zero-Egress Private Subnet',
        models: ['llama-3.3-70b-instruct', 'deepseek-r1-70b']
      },
      'Custom': {
        type: 'Custom API',
        color: 'text-cyan-400',
        bgGlow: 'from-cyan-500/10 to-blue-500/5',
        borderColor: 'border-cyan-500/30',
        iconBg: 'bg-cyan-500/10 text-cyan-400',
        endpoint: 'https://api.custom-gateway.internal/v1',
        protocol: 'mTLS Presidio Gateway',
        models: ['custom-model-v1']
      }
    };

    const preset = providerPresetMap[apiProvider] || providerPresetMap['Custom'];

    const newEntry = {
      id: `prov-api-${Date.now()}`,
      name: apiName.trim(),
      type: preset.type,
      status: 'Active',
      latency: '38ms',
      health: '100%',
      protocol: preset.protocol,
      models: preset.models,
      color: preset.color,
      bgGlow: preset.bgGlow,
      borderColor: preset.borderColor,
      iconBg: preset.iconBg,
      apiKeyFull: rawKey,
      apiKeyMasked: maskedKey,
      endpoint: preset.endpoint,
      interceptionCount: '0'
    };

    setProviders([newEntry, ...providers]);
    setCreatedKeyData({
      name: apiName.trim(),
      provider: apiProvider,
      key: rawKey
    });
  };

  // Handle connection ping simulation
  const handleTestPing = (id) => {
    setPingingId(id);
    setTimeout(() => {
      setProviders(prev => prev.map(p => {
        if (p.id === id) {
          const randomLatency = Math.floor(Math.random() * 40 + 35);
          return { ...p, latency: `${randomLatency}ms`, health: '100%' };
        }
        return p;
      }));
      setPingingId(null);
    }, 600);
  };

  // Toggle status (Active / Paused)
  const handleToggleStatus = (id) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'Active' ? 'Standby' : 'Active' };
      }
      return p;
    }));
  };

  // Add custom provider
  const handleAddProvider = (e) => {
    e.preventDefault();
    if (!newProvName.trim()) return;

    const newEntry = {
      id: `prov-custom-${Date.now()}`,
      name: newProvName.trim(),
      type: newProvType,
      status: 'Active',
      latency: '45ms',
      health: '100%',
      protocol: 'mTLS Presidio Gateway',
      models: newProvModel ? newProvModel.split(',').map(s => s.trim()) : ['custom-llm'],
      color: 'text-cyan-400',
      bgGlow: 'from-cyan-500/10 to-blue-500/5',
      borderColor: 'border-cyan-500/30',
      iconBg: 'bg-cyan-500/10 text-cyan-400',
      apiKeyMasked: 'sk-custom-••••••••••••99A0',
      endpoint: newProvEndpoint.trim() || 'http://localhost:11434/v1',
      interceptionCount: '0'
    };

    setProviders([newEntry, ...providers]);
    setIsAddModalOpen(false);
    setNewProvName('');
    setNewProvEndpoint('');
    setNewProvModel('');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <Server className="w-6 h-6 text-cyan-400" />
            Model Provider Governance & Proxy Control
          </h1>
          <p className="text-xs text-slate-400 mt-1">Interception proxies and differential taint fences configured across public and private inference endpoints.</p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <Button onClick={openCreateApiModal} className="gap-2 text-xs bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
            <Key className="w-4 h-4" /> Create API
          </Button>
          <Button variant="outline" onClick={() => setIsAddModalOpen(true)} className="gap-2 text-xs border-[#2a3142] hover:border-slate-500">
            <Plus className="w-4 h-4" /> Add Provider Proxy
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0d0f14] border-[#1e2330] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Gateways Active</div>
            <div className="text-lg font-bold text-white font-mono">{providers.length} Proxy Fences</div>
          </div>
        </Card>

        <Card className="p-4 bg-[#0d0f14] border-[#1e2330] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Avg Proxy Latency</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">163 ms</div>
          </div>
        </Card>

        <Card className="p-4 bg-[#0d0f14] border-[#1e2330] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Total Intercepts</div>
            <div className="text-lg font-bold text-purple-300 font-mono">84,760 Events</div>
          </div>
        </Card>

        <Card className="p-4 bg-[#0d0f14] border-[#1e2330] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Network Boundary</div>
            <div className="text-lg font-bold text-amber-300 font-mono">Zero PII Egress</div>
          </div>
        </Card>
      </div>

      {/* Grid of Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {providers.map((p) => {
          const isPinging = pingingId === p.id;
          const isActive = p.status === 'Active';

          return (
            <motion.div key={p.id} layout transition={{ duration: 0.2 }}>
              <Card className={`p-5 space-y-4 relative overflow-hidden bg-gradient-to-br ${p.bgGlow} border ${p.borderColor} transition-all duration-300 hover:border-slate-500`}>
                
                {/* Top Title Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${p.iconBg}`}>
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {p.name}
                      </h3>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                        <Badge variant="cyan" className="text-[10px] py-0 px-1.5">{p.type}</Badge>
                        <span>{p.endpoint}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isActive ? "success" : "warning"}>{p.status}</Badge>
                  </div>
                </div>

                {/* Metadata & Controls */}
                <div className="bg-[#08090c]/80 backdrop-blur-md rounded-lg p-3.5 border border-[#1e2330] space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-cyan-400" /> Taint Guard Protocol:
                    </span>
                    <span className="text-slate-200 font-semibold">{p.protocol}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" /> Monitored Models:
                    </span>
                    <span className="text-cyan-400">{Array.isArray(p.models) ? p.models.join(', ') : p.models}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" /> API Auth Mask:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-mono">
                        {revealedKeys[p.id] ? (p.apiKeyFull || p.apiKeyMasked) : p.apiKeyMasked}
                      </span>
                      {p.apiKeyFull && (
                        <button 
                          type="button"
                          onClick={() => setRevealedKeys(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                          className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5"
                          title={revealedKeys[p.id] ? "Hide Key" : "Reveal Key"}
                        >
                          {revealedKeys[p.id] ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={() => {
                          const valToCopy = p.apiKeyFull || p.apiKeyMasked;
                          navigator.clipboard.writeText(valToCopy);
                          setCopiedCardKey(p.id);
                          setTimeout(() => setCopiedCardKey(null), 2000);
                        }}
                        className="text-slate-400 hover:text-cyan-400 transition-colors p-0.5"
                        title="Copy Key"
                      >
                        {copiedCardKey === p.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-[#1e2330]">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-400" /> Proxy Overhead:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 font-bold">{p.latency}</span>
                      <span className="text-[10px] text-slate-500">({p.health} Health)</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#1e2330]">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Interceptions: <strong className="text-white">{p.interceptionCount}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTestPing(p.id)}
                      disabled={isPinging}
                      className="text-xs gap-1.5 text-slate-300 hover:text-white"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin text-cyan-400' : ''}`} />
                      {isPinging ? "Pinging..." : "Test Ping"}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleToggleStatus(p.id)}
                      className={`text-xs ${isActive ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                    >
                      {isActive ? "Pause Fence" : "Enable Fence"}
                    </Button>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditingProvider(p)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 p-2"
                      title="Edit Proxy Configuration"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Add Custom Provider Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0c10] border border-[#1e2330] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-[#1e2330] flex items-center justify-between bg-[#0d0f14]">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Connect Model Provider Gateway</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAddProvider} className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Provider / Cluster Name</label>
                  <input 
                    type="text" 
                    required
                    value={newProvName}
                    onChange={(e) => setNewProvName(e.target.value)}
                    placeholder="e.g., DeepSeek Local vLLM Gateway"
                    className="w-full bg-[#14161f] border border-[#2a3142] rounded px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Deployment Topology</label>
                    <select 
                      value={newProvType}
                      onChange={(e) => setNewProvType(e.target.value)}
                      className="w-full bg-[#14161f] border border-[#2a3142] rounded px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Cloud API">Cloud API Gateway</option>
                      <option value="Air-Gapped VPC">Air-Gapped VPC Subnet</option>
                      <option value="Local Edge Model">Local Edge / Ollama</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Monitored Models (CSV)</label>
                    <input 
                      type="text" 
                      value={newProvModel}
                      onChange={(e) => setNewProvModel(e.target.value)}
                      placeholder="e.g., deepseek-r1, qwen-2.5"
                      className="w-full bg-[#14161f] border border-[#2a3142] rounded px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Base Endpoint URL</label>
                  <input 
                    type="text" 
                    value={newProvEndpoint}
                    onChange={(e) => setNewProvEndpoint(e.target.value)}
                    placeholder="http://10.0.4.12:8000/v1 or https://api.provider.com/v1"
                    className="w-full bg-[#14161f] border border-[#2a3142] rounded px-3 py-2 text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#1e2330]">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                  <Button type="submit">Connect Gateway</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Provider Modal */}
      <AnimatePresence>
        {editingProvider && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0c10] border border-[#1e2330] rounded-xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-[#1e2330] flex items-center justify-between bg-[#0d0f14]">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Configure Proxy Fence: {editingProvider.name}</h3>
                </div>
                <button onClick={() => setEditingProvider(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Guardrail Protocol</label>
                  <input 
                    type="text" 
                    defaultValue={editingProvider.protocol}
                    className="w-full bg-[#14161f] border border-[#2a3142] rounded px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Proxy Target Endpoint</label>
                  <input 
                    type="text" 
                    defaultValue={editingProvider.endpoint}
                    className="w-full bg-[#14161f] border border-[#2a3142] rounded px-3 py-2 text-slate-200 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="bg-[#12151e] border border-[#1e2330] rounded-lg p-3 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                    <Lock className="w-3.5 h-3.5" /> Hardware Security & Encryption
                  </div>
                  <p>All outgoing payloads are scrubbed by Presidio + OpenCV before forwarding to external cloud LLM endpoints.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#1e2330]">
                  <Button variant="outline" onClick={() => setEditingProvider(null)}>Cancel</Button>
                  <Button onClick={() => setEditingProvider(null)}>Save Configuration</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create API Key Modal */}
      <AnimatePresence>
        {isCreateApiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b0c10] border border-[#1e2330] rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-[#1e2330] flex items-center justify-between bg-[#0d0f14]">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base font-bold text-white">Create New API Key</h3>
                </div>
                <button onClick={() => setIsCreateApiModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              {createdKeyData ? (
                <div className="p-5 space-y-4 text-xs">
                  <div className="flex items-center gap-3 text-emerald-400 bg-emerald-950/60 p-3 rounded-lg border border-emerald-800/50">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-sm text-emerald-300">API Key Created Successfully!</div>
                      <div className="text-[11px] text-emerald-400/80">Bound to {createdKeyData.name} ({createdKeyData.provider})</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Your Secret API Key</label>
                    <div className="flex items-center gap-2 bg-[#14161f] border border-cyan-500/50 rounded-lg p-2.5 font-mono text-cyan-300 text-xs break-all relative shadow-inner">
                      <span className="flex-1 select-all">{createdKeyData.key}</span>
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(createdKeyData.key);
                          setCopiedModalKey(true);
                          setTimeout(() => setCopiedModalKey(false), 2000);
                        }}
                        className="gap-1.5 text-xs h-7 px-3 bg-cyan-600 hover:bg-cyan-500 text-white flex-shrink-0 font-semibold"
                      >
                        {copiedModalKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedModalKey ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-[#12151e] border border-[#1e2330] rounded-lg p-3 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                      <Lock className="w-3.5 h-3.5" /> Security & Privacy Guard
                    </div>
                    <p>This API Key is now active and protected by SDTT Presidio Egress filters. You can also view or copy this key anytime directly from your Provider Governance cards.</p>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-[#1e2330]">
                    <Button 
                      onClick={() => {
                        setIsCreateApiModalOpen(false);
                        setCreatedKeyData(null);
                        setApiName('');
                        setApiKeySecret('');
                      }}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-6"
                    >
                      Done & Close
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateApi} className="p-5 space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">API Name / Key Label</label>
                    <input 
                      type="text" 
                      required
                      value={apiName}
                      onChange={(e) => setApiName(e.target.value)}
                      placeholder="e.g., Production Gateway Key"
                      className="w-full bg-[#14161f] border border-[#2a3142] rounded px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Model Provider</label>
                    <select 
                      value={apiProvider}
                      onChange={(e) => setApiProvider(e.target.value)}
                      className="w-full bg-[#14161f] border border-[#2a3142] rounded px-3 py-2 text-slate-200 focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="OpenAI">OpenAI Cloud Gateway</option>
                      <option value="Anthropic">Anthropic Claude Proxy</option>
                      <option value="Google Gemini">Google Gemini Vertex</option>
                      <option value="Self-Hosted vLLM">Self-Hosted vLLM / Ollama</option>
                      <option value="Custom">Custom API Endpoint</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-[#1e2330]">
                    <Button type="button" variant="outline" onClick={() => setIsCreateApiModalOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold">Create API Key</Button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
