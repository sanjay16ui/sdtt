import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { 
  Database, Lock, Shield, Cpu, ArrowRight, ArrowDown, 
  Layers, RefreshCw, CheckCircle2, Trash2, Sliders, Box, Eye, Zap, AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components';

// --- 3D KV Cache Matrix Canvas Component (Three.js) ---
function MemoryCache3DCanvas({ onSelectBlock }) {
  const mountRef = useRef(null);
  const [selectedBlockInfo, setSelectedBlockInfo] = useState(null);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // 1. Scene Setup
    const width = currentMount.clientWidth || 600;
    const height = 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050608);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 10, 14);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    // 2. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xc084fc, 2, 30);
    pointLight.position.set(-8, -5, -8);
    scene.add(pointLight);

    // 3. Grid Helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    // 4. Create 3D Voxel Memory Block Matrix (4x3x4 Grid)
    const blocksGroup = new THREE.Group();
    const blocksData = [];
    const geometry = new THREE.BoxGeometry(0.85, 0.85, 0.85);

    const colors = [
      0x38bdf8, // Cyan - Vector Embeddings
      0xc084fc, // Purple - Attention Tokens
      0x34d399, // Emerald - Sanitized Memory
      0xf43f5e, // Rose - Tainted Memory Block
      0xf59e0b  // Amber - Pending Verification
    ];

    let count = 0;
    for (let x = -2; x <= 1; x += 1.1) {
      for (let y = -1; y <= 1; y += 1.1) {
        for (let z = -2; z <= 1; z += 1.1) {
          count++;
          const typeIdx = Math.floor(Math.random() * colors.length);
          const material = new THREE.MeshStandardMaterial({
            color: colors[typeIdx],
            metalness: 0.3,
            roughness: 0.2,
            transparent: true,
            opacity: 0.85,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.set(x * 1.5, y * 1.5, z * 1.5);

          // Wireframe edge glow
          const edges = new THREE.EdgesGeometry(geometry);
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
          const wireframe = new THREE.LineSegments(edges, lineMaterial);
          mesh.add(wireframe);

          const blockInfo = {
            id: `0x7F${count.toString(16).toUpperCase().padStart(2, '0')}-CACHE`,
            x: mesh.position.x,
            y: mesh.position.y,
            z: mesh.position.z,
            type: typeIdx === 0 ? "Vector Embedding" : typeIdx === 1 ? "Attention Token" : typeIdx === 2 ? "Sanitized Block" : typeIdx === 3 ? "Tainted Memory" : "Pending Check",
            status: typeIdx === 3 ? "Tainted" : "Safe",
            tokens: Math.floor(Math.random() * 512 + 128),
            taintScore: typeIdx === 3 ? `${(Math.random() * 40 + 60).toFixed(1)}%` : '0.0%'
          };

          mesh.userData = blockInfo;
          blocksGroup.add(mesh);
          blocksData.push(mesh);
        }
      }
    }
    scene.add(blocksGroup);

    // 5. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      blocksGroup.rotation.y += 0.003;
      blocksGroup.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    // 6. Raycasting on Mouse Click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(blocksGroup.children);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object;
        const info = clickedMesh.userData;
        setSelectedBlockInfo(info);
        if (onSelectBlock) onSelectBlock(info);

        // Highlight flash effect
        clickedMesh.material.color.setHex(0xffffff);
        setTimeout(() => {
          const origColor = colors[info.type === "Vector Embedding" ? 0 : info.type === "Attention Token" ? 1 : info.type === "Sanitized Block" ? 2 : info.type === "Tainted Memory" ? 3 : 4];
          clickedMesh.material.color.setHex(origColor);
        }, 300);
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('click', handleCanvasClick);

    // Resize Handler
    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('click', handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      renderer.dispose();
    };
  }, [onSelectBlock]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[#1e2330] bg-[#050608]">
      <div ref={mountRef} className="w-full h-[340px] cursor-pointer" />
      
      {/* Overlay Title Badge */}
      <div className="absolute top-3 left-3 bg-[#0b0c10]/90 backdrop-blur-md border border-[#1e2330] px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono">
        <Box className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="text-white font-bold">Interactive 3D KV Cache Voxel Matrix</span>
        <span className="text-slate-500 text-[10px]">(Click any 3D memory block to inspect)</span>
      </div>

      {/* Selected Block Card Overlay */}
      {selectedBlockInfo && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-3 left-3 right-3 bg-[#0d0f14]/95 backdrop-blur-md border border-cyan-500/40 p-3 rounded-lg flex items-center justify-between text-xs font-mono text-slate-200"
        >
          <div className="flex items-center gap-3">
            <span className="text-cyan-400 font-bold">{selectedBlockInfo.id}</span>
            <Badge variant={selectedBlockInfo.status === 'Tainted' ? 'danger' : 'success'}>
              {selectedBlockInfo.type}
            </Badge>
            <span>{selectedBlockInfo.tokens} Tokens</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Taint Risk: <strong className={selectedBlockInfo.status === 'Tainted' ? 'text-rose-400' : 'text-emerald-400'}>{selectedBlockInfo.taintScore}</strong></span>
            <button onClick={() => setSelectedBlockInfo(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// --- Main Page Component ---
export default function MemoryCache() {
  const [retentionDays, setRetentionDays] = useState(14);
  const [epsilonNoise, setEpsilonNoise] = useState(0.25);
  const [isPurging, setIsPurging] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  // Trigger Cache Purge Simulation
  const handlePurgeCache = () => {
    setIsPurging(true);
    setTimeout(() => {
      setIsPurging(false);
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <Database className="w-6 h-6 text-cyan-400" />
            3D Memory & KV Cache Governance
          </h1>
          <p className="text-xs text-slate-400 mt-1">Guard long-term semantic memory and cross-session infrastructure layers from prompt injection and taint leakage.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            disabled={isPurging}
            onClick={handlePurgeCache} 
            className="gap-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border-rose-900/40"
          >
            <Trash2 className={`w-4 h-4 ${isPurging ? 'animate-spin' : ''}`} />
            {isPurging ? "Purging Tainted Blocks..." : "Purge Tainted Cache"}
          </Button>
        </div>
      </div>

      {/* Success Notification */}
      {purgeSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Zero-Trust Sweep Completed: All tainted KV memory pages and cross-subject attention blocks purged successfully.
        </motion.div>
      )}

      {/* 3D KV Cache Visualizer */}
      <MemoryCache3DCanvas onSelectBlock={setSelectedBlock} />

      {/* Interactive Controls & Governance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Semantic Memory Panel */}
        <Card className="border-blue-900/30 bg-gradient-to-b from-[#0b0c10] to-blue-950/10 p-5 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              Semantic Vector Memory Store
            </h3>
            <Badge variant="info">ACTIVE</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#14161f] p-3 rounded-lg border border-[#1e2330]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">Memory Writes</div>
              <div className="text-xl font-bold text-white font-mono">2,491</div>
            </div>
            <div className="bg-[#14161f] p-3 rounded-lg border border-[#1e2330]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">Memory Reads</div>
              <div className="text-xl font-bold text-white font-mono">18,294</div>
            </div>
            <div className="bg-[#14161f] p-3 rounded-lg border border-[#1e2330]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">Subject Scopes</div>
              <div className="text-xl font-bold text-cyan-400 font-mono">1,284</div>
            </div>
            <div className="bg-[#14161f] p-3 rounded-lg border border-[#1e2330]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">Configured Retention</div>
              <div className="text-xl font-bold text-white font-mono">{retentionDays} <span className="text-xs text-slate-500 font-normal">days</span></div>
            </div>
          </div>

          {/* Interactive Slider for Retention */}
          <div className="space-y-2 pt-2 border-t border-[#1e2330] text-xs">
            <div className="flex justify-between items-center text-slate-300 font-mono">
              <span>Dynamic Memory Retention Policy:</span>
              <span className="text-cyan-400 font-bold">{retentionDays} Days</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="90" 
              value={retentionDays} 
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-[#14161f] cursor-pointer"
            />
          </div>

          <div className="space-y-2.5 text-xs pt-2">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#12151e] border border-[#1e2330]">
              <span className="text-slate-300">Vector Embeddings Sanitization</span>
              <Badge variant="success">ENFORCED</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#12151e] border border-[#1e2330]">
              <span className="text-slate-300">Cross-Subject Barrier</span>
              <Badge variant="success">ISOLATED</Badge>
            </div>
          </div>
        </Card>

        {/* KV Cache Panel */}
        <Card className="border-purple-900/30 bg-gradient-to-b from-[#0b0c10] to-purple-950/10 p-5 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Prompt & Attention KV Cache
            </h3>
            <Badge variant="purple">PROTECTED</Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#14161f] p-3 rounded-lg border border-[#1e2330]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">Tainted Attention Blocks</div>
              <div className="text-xl font-bold text-purple-400 font-mono">0.00%</div>
            </div>
            <div className="bg-[#14161f] p-3 rounded-lg border border-[#1e2330]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">Context Flushes</div>
              <div className="text-xl font-bold text-white font-mono">8,921</div>
            </div>
            <div className="bg-[#14161f] p-3 rounded-lg border border-[#1e2330]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">Latency Penalty</div>
              <div className="text-xl font-bold text-emerald-400 font-mono">1.2 <span className="text-xs text-slate-500 font-normal">ms</span></div>
            </div>
            <div className="bg-[#14161f] p-3 rounded-lg border border-[#1e2330]">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-semibold">State Integrity</div>
              <div className="text-xl font-bold text-white font-mono">100%</div>
            </div>
          </div>

          {/* Interactive Slider for Epsilon Noise */}
          <div className="space-y-2 pt-2 border-t border-[#1e2330] text-xs">
            <div className="flex justify-between items-center text-slate-300 font-mono">
              <span>Differential Privacy Epsilon ($\varepsilon$):</span>
              <span className="text-purple-400 font-bold">ε = {epsilonNoise}</span>
            </div>
            <input 
              type="range" 
              min="0.05" 
              max="1.50" 
              step="0.05"
              value={epsilonNoise} 
              onChange={(e) => setEpsilonNoise(Number(e.target.value))}
              className="w-full accent-purple-400 bg-[#14161f] cursor-pointer"
            />
          </div>

          <div className="space-y-2.5 text-xs pt-2">
            <div className="flex items-center justify-between p-2.5 rounded bg-[#12151e] border border-[#1e2330]">
              <span className="text-slate-300">Prompt Prefix Hash Validation</span>
              <Badge variant="success">VERIFIED</Badge>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded bg-[#12151e] border border-[#1e2330]">
              <span className="text-slate-300">Soft Differential Scrubbing</span>
              <Badge variant="purple">ACTIVE</Badge>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
