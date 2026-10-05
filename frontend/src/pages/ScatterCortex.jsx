import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { 
  Network, ShieldAlert, Cpu, Database, Server, Zap, Radio, 
  Activity, AlertTriangle, CheckCircle2, Lock, Eye, RefreshCw, 
  ArrowRight, ShieldCheck, Filter, Play, Pause, AlertOctagon, Terminal
} from 'lucide-react';
import { Card, Badge, Button } from '@/components';

// Predefined Leak Paths for Scatter Cortex Analysis
const LEAK_PATHS = [
  {
    id: 'path-beta',
    name: 'Exfiltration Route Beta (Unauthorized Webhook)',
    status: 'CRITICAL LEAK',
    riskScore: 94,
    source: 'Client Ingress API',
    destination: 'External Webhook Log (api.analytics-leak.net)',
    piiExfiltrated: ['IN_AADHAAR', 'AWS_SECRET_KEY', 'IN_PAN'],
    hops: ['Ingress Endpoint', 'Unfiltered Proxy', 'External Webhook Log'],
    packetCount: '1,420 pkts/s',
    color: '#f43f5e', // Rose
    glowHex: 0xf43f5e,
    active: true,
    protocol: 'Plaintext HTTPS Egress'
  },
  {
    id: 'path-gamma',
    name: 'Exfiltration Route Gamma (Vector DB Taint)',
    status: 'HIGH RISK',
    riskScore: 78,
    source: 'LLM Key-Value Cache',
    destination: 'Third-Party Vector DB (Pinecone Instance)',
    piiExfiltrated: ['EMPLOYEE_ID', 'SALARY_CTC', 'JWT_TOKEN'],
    hops: ['Memory Cache', 'Unsanitized Embedding', 'Vector DB Sink'],
    packetCount: '890 pkts/s',
    color: '#f59e0b', // Amber
    glowHex: 0xf59e0b,
    active: true,
    protocol: 'Unencrypted Embeddings'
  },
  {
    id: 'path-alpha',
    name: 'Protected Forwarding Route Alpha (Presidio Cleaned)',
    status: 'SECURE',
    riskScore: 12,
    source: 'Client Ingress API',
    destination: 'OpenAI Cloud Gateway (gpt-4o)',
    piiExfiltrated: ['Redacted (0 PII Leaked)'],
    hops: ['Ingress Endpoint', 'Presidio NLP Scrub', 'OpenAI Gateway'],
    packetCount: '4,150 pkts/s',
    color: '#10b981', // Emerald
    glowHex: 0x10b981,
    active: false,
    protocol: 'mTLS + Presidio Guard'
  },
  {
    id: 'path-delta',
    name: 'Exfiltration Route Delta (Unshielded S3 Bucket)',
    status: 'MEDIUM RISK',
    riskScore: 62,
    source: 'EasyOCR Vision Pipeline',
    destination: 'Public AWS S3 Data Dump',
    piiExfiltrated: ['MEDICAL_RECORD_NO', 'BLOOD_GROUP'],
    hops: ['OCR Vision', 'Temp Image Cache', 'Public S3 Storage'],
    packetCount: '340 pkts/s',
    color: '#a855f7', // Purple
    glowHex: 0xa855f7,
    active: true,
    protocol: 'Unrestricted IAM Role'
  }
];

// 3D Graph Nodes Setup
const SCATTER_NODES = [
  { id: 'node-ingress', name: 'V1: Ingress API Gateway', type: 'Source', x: -3.5, y: 1.2, z: 0, color: 0x38bdf8, hexStr: '#38bdf8' },
  { id: 'node-presidio', name: 'V2: Presidio PII Fence', type: 'Filter', x: -1.2, y: 2.2, z: 1.2, color: 0x10b981, hexStr: '#10b981' },
  { id: 'node-ocr', name: 'V3: PyTorch Vision OCR', type: 'Vision', x: -1.2, y: -1.5, z: -1.0, color: 0x06b6d4, hexStr: '#06b6d4' },
  { id: 'node-llm', name: 'V4: LLM Model Gateway', type: 'AI Model', x: 1.5, y: 1.8, z: 0.5, color: 0x8b5cf6, hexStr: '#8b5cf6' },
  { id: 'node-webhook', name: 'V5: Webhook Sink [LEAK]', type: 'Leak Sink', x: 3.8, y: 2.4, z: -1.5, color: 0xf43f5e, hexStr: '#f43f5e' },
  { id: 'node-vectordb', name: 'V6: Vector DB Storage', type: 'Storage', x: 2.2, y: -1.8, z: 1.8, color: 0xf59e0b, hexStr: '#f59e0b' },
  { id: 'node-s3', name: 'V7: Public AWS S3 Dump', type: 'Egress Sink', x: 3.5, y: -2.2, z: -0.8, color: 0xec4899, hexStr: '#ec4899' }
];

// Helper to generate glowing 3D canvas text sprite
const createTextSprite = (text, textColor = '#38bdf8') => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = 'rgba(11, 12, 16, 0.88)';
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(6, 6, 244, 52, 10);
  ctx.fill();
  ctx.stroke();

  ctx.font = 'Bold 14px monospace';
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.5, 0.38, 1.0);
  return sprite;
};

export default function ScatterCortex() {
  const mountRef = useRef(null);
  const [selectedPath, setSelectedPath] = useState(LEAK_PATHS[0]);
  const [activePaths, setActivePaths] = useState(LEAK_PATHS);
  const [isSimulating, setIsSimulating] = useState(true);
  const [filterDomain, setFilterDomain] = useState('ALL');

  // Three.js 3D Multi-Path Graph Scene Setup
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0.8, 8.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    currentMount.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 2. 3D Spatial Cyber Floor Grid
    const gridHelper = new THREE.GridHelper(16, 20, 0x06b6d4, 0x1e2330);
    gridHelper.position.y = -3.2;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.45;
    mainGroup.add(gridHelper);

    // 3. Render 3D Graph Nodes & 3D Text Badges
    const nodeMeshes = {};
    SCATTER_NODES.forEach((nodeData) => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(nodeData.x, nodeData.y, nodeData.z);

      // Core Vertex Sphere
      const coreGeo = new THREE.SphereGeometry(0.28, 16, 16);
      const coreMat = new THREE.MeshPhongMaterial({
        color: nodeData.color,
        emissive: nodeData.color,
        emissiveIntensity: 1.8,
        shininess: 90
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      nodeGroup.add(coreMesh);

      // Outer Cage Ring
      const cageGeo = new THREE.OctahedronGeometry(0.5, 0);
      const cageMat = new THREE.MeshBasicMaterial({
        color: nodeData.color,
        wireframe: true,
        transparent: true,
        opacity: 0.7
      });
      const cageMesh = new THREE.Mesh(cageGeo, cageMat);
      nodeGroup.add(cageMesh);

      // Floating 3D Text Badge Sprite above Node
      const textSprite = createTextSprite(nodeData.name, nodeData.hexStr);
      textSprite.position.set(0, 0.65, 0);
      nodeGroup.add(textSprite);

      mainGroup.add(nodeGroup);
      nodeMeshes[nodeData.id] = { group: nodeGroup, coreMesh, cageMesh, data: nodeData };
    });

    // 4. Render 3D Multi-Path Graph Edge Curves & Flowing Data Packets
    const particleSystems = [];

    // Curve Definitions between Graph Vertices
    const curveBeta = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.5, 1.2, 0),
      new THREE.Vector3(0, 3.2, -1.0),
      new THREE.Vector3(3.8, 2.4, -1.5)
    ]);

    const curveGamma = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.5, 1.2, 0),
      new THREE.Vector3(1.5, 1.8, 0.5),
      new THREE.Vector3(2.2, -1.8, 1.8)
    ]);

    const curveAlpha = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.5, 1.2, 0),
      new THREE.Vector3(-1.2, 2.2, 1.2),
      new THREE.Vector3(1.5, 1.8, 0.5)
    ]);

    const curveDelta = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.5, 1.2, 0),
      new THREE.Vector3(-1.2, -1.5, -1.0),
      new THREE.Vector3(3.5, -2.2, -0.8)
    ]);

    const pathCurveMap = {
      'path-beta': { curve: curveBeta, color: 0xf43f5e },
      'path-gamma': { curve: curveGamma, color: 0xf59e0b },
      'path-alpha': { curve: curveAlpha, color: 0x10b981 },
      'path-delta': { curve: curveDelta, color: 0xa855f7 }
    };

    // Build Graph Edges & Animated Particle Streams
    Object.entries(pathCurveMap).forEach(([pathId, { curve, color }]) => {
      // 3D Graph Edge Tube
      const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.035, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        wireframe: true
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      mainGroup.add(tubeMesh);

      // Graph Trajectory Stream Particles
      const pCount = 45;
      const pGeo = new THREE.BufferGeometry();
      const pPositions = new Float32Array(pCount * 3);
      const pOffsets = [];

      for (let i = 0; i < pCount; i++) {
        const t = i / pCount;
        const pt = curve.getPoint(t);
        pPositions[i * 3] = pt.x;
        pPositions[i * 3 + 1] = pt.y;
        pPositions[i * 3 + 2] = pt.z;
        pOffsets.push(t);
      }

      pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      const pMat = new THREE.PointsMaterial({
        color: color,
        size: 0.13,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending
      });
      const pSystem = new THREE.Points(pGeo, pMat);
      mainGroup.add(pSystem);

      particleSystems.push({ pathId, curve, pSystem, pOffsets, pCount, tubeMesh });
    });

    // 5. Background Starfield Data Nodes
    const bgParticleCount = 800;
    const bgGeo = new THREE.BufferGeometry();
    const bgPos = new Float32Array(bgParticleCount * 3);
    for (let i = 0; i < bgParticleCount * 3; i++) {
      bgPos[i] = (Math.random() - 0.5) * 22;
    }
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.03,
      transparent: true,
      opacity: 0.35
    });
    const bgSystem = new THREE.Points(bgGeo, bgMat);
    scene.add(bgSystem);

    // 6. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 4.5, 100);
    pointLight.position.set(3, 5, 6);
    scene.add(pointLight);

    // 7. Mouse Orbit Control & Animation Loop
    let mouseX = 0;
    let mouseY = 0;
    const handlePointerMove = (e) => {
      const { clientX, clientY } = e;
      mouseX = (clientX / window.innerWidth - 0.5) * 1.5;
      mouseY = -(clientY / window.innerHeight - 0.5) * 1.5;
    };
    window.addEventListener('pointermove', handlePointerMove);

    let animFrameId;
    let time = 0;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      time += 0.015;

      // Smooth 3D Graph Tilt & Turn Tracking
      mainGroup.rotation.y += (mouseX * 0.45 - mainGroup.rotation.y) * 0.05;
      mainGroup.rotation.x += (-mouseY * 0.35 - mainGroup.rotation.x) * 0.05;

      // Rotate Node Cage Shapes
      Object.values(nodeMeshes).forEach(({ coreMesh, cageMesh }, idx) => {
        coreMesh.rotation.y += 0.02;
        cageMesh.rotation.z += (idx % 2 === 0 ? 0.015 : -0.015);
        cageMesh.rotation.y += 0.01;
      });

      // Animate Packet Flows on 3D Graph Edges
      particleSystems.forEach(({ curve, pSystem, pOffsets, pCount }) => {
        const positions = pSystem.geometry.attributes.position.array;
        for (let i = 0; i < pCount; i++) {
          pOffsets[i] = (pOffsets[i] + 0.008) % 1.0;
          const point = curve.getPoint(pOffsets[i]);
          positions[i * 3] = point.x;
          positions[i * 3 + 1] = point.y;
          positions[i * 3 + 2] = point.z;
        }
        pSystem.geometry.attributes.position.needsUpdate = true;
      });

      gridHelper.rotation.y += 0.0005;
      bgSystem.rotation.y += 0.0005;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!currentMount) return;
      const w = currentMount.clientWidth;
      const h = currentMount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Neutralize Leak Path
  const handleNeutralizePath = (pathId) => {
    setActivePaths(prev => prev.map(p => {
      if (p.id === pathId) {
        return {
          ...p,
          status: 'NEUTRALIZED & BLOCKED',
          riskScore: 0,
          color: '#10b981',
          active: false,
          piiExfiltrated: ['Blocked by Taint Fence']
        };
      }
      return p;
    }));
    if (selectedPath.id === pathId) {
      setSelectedPath(prev => ({
        ...prev,
        status: 'NEUTRALIZED & BLOCKED',
        riskScore: 0,
        color: '#10b981',
        active: false,
        piiExfiltrated: ['Blocked by Taint Fence']
      }));
    }
  };

  const filteredPaths = filterDomain === 'ALL' 
    ? activePaths 
    : activePaths.filter(p => filterDomain === 'CRITICAL' ? p.riskScore > 75 : p.riskScore <= 75);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1e2330] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3 tracking-tight">
            <Network className="w-7 h-7 text-rose-500 animate-pulse" />
            Scatter Cortex: 3D Data Leak Graph Analyzer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Spatial 3D network topology graph monitoring multi-path exfiltration vectors, vertex taints, and unauthorized data forwarding routes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-[#14161f] border border-[#2a3142] rounded-lg p-1 text-xs">
            <button 
              onClick={() => setFilterDomain('ALL')}
              className={`px-3 py-1 rounded transition-colors ${filterDomain === 'ALL' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              All Paths ({activePaths.length})
            </button>
            <button 
              onClick={() => setFilterDomain('CRITICAL')}
              className={`px-3 py-1 rounded transition-colors ${filterDomain === 'CRITICAL' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              High Risk
            </button>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsSimulating(!isSimulating)}
            className="gap-2 text-xs border-[#2a3142]"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5 text-rose-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            {isSimulating ? 'Pause Streams' : 'Resume Streams'}
          </Button>
        </div>
      </div>

      {/* Metrics Header Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0d0f14] border-[#1e2330] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Active Exfiltration Routes</div>
            <div className="text-lg font-bold text-rose-400 font-mono">
              {activePaths.filter(p => p.active).length} Unsafe Paths
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-[#0d0f14] border-[#1e2330] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Forwarding Rate</div>
            <div className="text-lg font-bold text-amber-300 font-mono">6,800 pkts/sec</div>
          </div>
        </Card>

        <Card className="p-4 bg-[#0d0f14] border-[#1e2330] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">3D Graph Vertices</div>
            <div className="text-lg font-bold text-purple-300 font-mono">{SCATTER_NODES.length} Vertices Active</div>
          </div>
        </Card>

        <Card className="p-4 bg-[#0d0f14] border-[#1e2330] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-mono">Presidio Defense</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">100% Redaction</div>
          </div>
        </Card>
      </div>

      {/* Main Interactive Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: 3D Interactive WebGL Network Graph Scene (7 Cols) */}
        <div className="lg:col-span-7 bg-[#08090c] border border-[#1e2330] rounded-2xl p-4 relative overflow-hidden flex flex-col justify-between h-[520px] shadow-2xl">
          
          {/* Top Canvas HUD Overlay */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 backdrop-blur text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-slate-200 font-bold tracking-wider">3D NETWORK GRAPH SCENE</span>
            </div>
            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              CYBER GRID ACTIVE
            </span>
          </div>

          {/* 3D WebGL Canvas Mounting Element */}
          <div 
            ref={mountRef} 
            className="w-full h-full cursor-grab active:cursor-grabbing z-0" 
          />

          {/* Bottom HUD Legend */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 bg-slate-900/85 p-3 rounded-xl border border-slate-800/90 backdrop-blur text-xs font-mono">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Critical Leak</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>High Taint</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Clean Route</span>
              </div>
            </div>
            <span className="text-[11px] text-slate-400">Rotate 3D graph with mouse movement</span>
          </div>
        </div>

        {/* Right Column: Multi-Path Trajectory Inspector & Control List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          
          {/* Selected Path Details Card */}
          <Card className="p-5 bg-[#0b0c10] border-[#1e2330] space-y-4 relative overflow-hidden shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1">Inspected Exfiltration Pathway</span>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  {selectedPath.name}
                </h3>
              </div>
              <Badge variant={selectedPath.active ? "warning" : "success"} className="font-mono text-xs">
                {selectedPath.status}
              </Badge>
            </div>

            <div className="bg-[#14161f] border border-[#2a3142] rounded-xl p-3.5 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Exfiltration Risk Score:</span>
                <span className={`font-bold text-sm ${selectedPath.riskScore > 70 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedPath.riskScore} / 100
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Origin Source:</span>
                <span className="text-slate-200">{selectedPath.source}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Destination Sink:</span>
                <span className="text-rose-400 truncate max-w-[200px]" title={selectedPath.destination}>
                  {selectedPath.destination}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-[#2a3142]">
                <span className="text-slate-400">Exfiltrated PII Entities:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedPath.piiExfiltrated.map((pii, idx) => (
                    <span key={idx} className="text-[10px] bg-rose-950/80 text-rose-300 border border-rose-800/60 px-2 py-0.5 rounded">
                      {pii}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Path Hop Trajectory Sequence */}
            <div className="space-y-1.5 text-xs font-mono">
              <span className="text-slate-400 text-[11px]">Forwarding Hop Trajectory:</span>
              <div className="flex items-center gap-1.5 flex-wrap bg-[#08090c] p-2.5 rounded-lg border border-[#1e2330]">
                {selectedPath.hops.map((hop, i) => (
                  <React.Fragment key={i}>
                    <span className={`text-[11px] px-2 py-0.5 rounded ${i === selectedPath.hops.length - 1 ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800' : 'bg-slate-800 text-slate-300'}`}>
                      {hop}
                    </span>
                    {i < selectedPath.hops.length - 1 && <ArrowRight className="w-3 h-3 text-slate-600" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Action Neutralize Button */}
            {selectedPath.active && (
              <Button 
                onClick={() => handleNeutralizePath(selectedPath.id)}
                className="w-full gap-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs h-10 rounded-xl shadow-lg shadow-rose-950/60"
              >
                <ShieldAlert className="w-4 h-4" /> Sever & Neutralize Exfiltration Path
              </Button>
            )}
          </Card>

          {/* List of Detected Exfiltration Trajectories */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Detected Exfiltration Pathways ({filteredPaths.length})
            </h4>

            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {filteredPaths.map((path) => (
                <div 
                  key={path.id}
                  onClick={() => setSelectedPath(path)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-mono ${
                    selectedPath.id === path.id 
                      ? 'bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/40' 
                      : 'bg-[#0b0c10] border-[#1e2330] hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: path.color }} />
                    <div>
                      <div className="font-bold text-white">{path.name}</div>
                      <div className="text-[10px] text-slate-400">{path.protocol}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold" style={{ color: path.color }}>
                      Risk {path.riskScore}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
