import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import {
  Shield,
  ArrowRight,
  Activity,
  Sparkles,
  Cpu,
  FileText,
  Eye,
  Database,
  Lock,
  CheckCircle2,
  Zap,
  Bot,
  Sliders,
  Radio,
  Terminal,
  ShieldAlert,
  ChevronRight,
  MessageSquare,
  Globe,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components';
import { ROUTES } from '@/config/routes';

// Aegis Mascot AI Insights Knowledge Base
const MASCOT_INSIGHTS = [
  {
    question: "What is Aegis protecting right now?",
    answer: "I'm monitoring 48 Indian PII, PHI, and DevSecOps recognizers in real time — including Aadhaar, PAN, Credit Cards, AWS Secrets, and Employee IDs with sub-second vision OCR redaction!",
    badge: "Active Defense",
    color: 0x22d3ee // Cyan
  },
  {
    question: "How does 3D KV Cache Governance work?",
    answer: "SDTT intercepts token embeddings directly at the LLM key-value cache layer, applying zero-trust differential taint tracking before model context synthesis.",
    badge: "Tensor Security",
    color: 0xa855f7 // Purple
  },
  {
    question: "How are statutory audit reports generated?",
    answer: "Our automated DPIA & EU AI Act engine compiles full compliance certificates with real-time risk scores, SHA-256 signatures, and printable PDF exports.",
    badge: "Compliance Engine",
    color: 0x10b981 // Emerald
  }
];

export default function Home() {
  const mountRef = useRef(null);
  const visorMatRef = useRef(null);
  const crestMatRef = useRef(null);
  const cardBorderMatRef = useRef(null);

  const [activeInsight, setActiveInsight] = useState(0);

  // Three.js 3D Scene with Exact Aegis Mascot Artwork Texture Setup
  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.1, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    currentMount.appendChild(renderer.domElement);

    // 2. Avatar Master Root Group (Rotates in 3D with Mouse Movement)
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);

    // === 3. LOAD EXACT AEGIS MASCOT ARTWORK TEXTURE ===
    const textureLoader = new THREE.TextureLoader();
    const mascotTexture = textureLoader.load('/aegis_privacy_mascot.jpg');
    mascotTexture.colorSpace = THREE.SRGBColorSpace;
    mascotTexture.generateMipmaps = true;
    mascotTexture.minFilter = THREE.LinearMipmapLinearFilter;
    mascotTexture.magFilter = THREE.LinearFilter;
    mascotTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Front Face Material with Exact Image Texture (MeshBasicMaterial ensures 100% clear & bright rendering)
    const imageMat = new THREE.MeshBasicMaterial({
      map: mascotTexture,
    });

    // Outer Cyber Armor Frame Materials
    const frameArmorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.8,
      flatShading: true
    });

    const borderGlowMat = new THREE.MeshPhongMaterial({
      color: 0x06b6d4,
      emissive: 0x0284c7,
      emissiveIntensity: 1.8,
      transparent: true,
      opacity: 0.95
    });
    cardBorderMatRef.current = borderGlowMat;

    // === 4. 3D HOLOGRAPHIC MASCOT CARD / EMBEDDED SHIELD OBJECT ===
    // Main 3D Artwork Panel (Box with Depth)
    const cardWidth = 2.2;
    const cardHeight = 2.6;
    const cardDepth = 0.15;

    const panelGeo = new THREE.BoxGeometry(cardWidth, cardHeight, cardDepth);

    // Assign different materials to box faces (Front gets mascot texture, sides get dark armor)
    const boxMaterials = [
      frameArmorMat, // Right
      frameArmorMat, // Left
      frameArmorMat, // Top
      frameArmorMat, // Bottom
      imageMat,      // Front (Exact Aegis Image)
      frameArmorMat  // Back
    ];

    const mascotPanel = new THREE.Mesh(panelGeo, boxMaterials);
    mascotPanel.position.set(0, 0.1, 0);
    avatarGroup.add(mascotPanel);

    // Outer Glowing Holographic Bezel Frame
    const borderGeo = new THREE.BoxGeometry(cardWidth + 0.12, cardHeight + 0.12, cardDepth * 0.7);
    const borderMesh = new THREE.Mesh(borderGeo, borderGlowMat);
    borderMesh.position.set(0, 0.1, -0.02);
    avatarGroup.add(borderMesh);

    // Rounded Cyber Corner Pillars (4 Corners)
    const cornerGeo = new THREE.CylinderGeometry(0.08, 0.08, cardDepth + 0.05, 8);
    const cornerPositions = [
      [-cardWidth / 2 - 0.04, cardHeight / 2 + 0.1, 0],
      [cardWidth / 2 + 0.04, cardHeight / 2 + 0.1, 0],
      [-cardWidth / 2 - 0.04, -cardHeight / 2 + 0.1, 0],
      [cardWidth / 2 + 0.04, -cardHeight / 2 + 0.1, 0]
    ];

    cornerPositions.forEach(([x, y, z]) => {
      const corner = new THREE.Mesh(cornerGeo, borderGlowMat);
      corner.position.set(x, y, z);
      corner.rotation.x = Math.PI / 2;
      avatarGroup.add(corner);
    });

    // === 5. FLOATING NEURAL COLLAR RING & CHEST SHIELD CREST ===
    // Rotating Neural Collar Ring underneath Card
    const collarGeo = new THREE.TorusGeometry(1.4, 0.04, 16, 64);
    const collarMat = new THREE.MeshPhongMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      emissiveIntensity: 1.5,
      wireframe: true
    });
    const collarMesh = new THREE.Mesh(collarGeo, collarMat);
    collarMesh.position.set(0, -1.25, 0);
    collarMesh.rotation.x = Math.PI / 2 + 0.25;
    avatarGroup.add(collarMesh);

    // Aegis Shield Crest Emblem on Bottom Bezel
    const crestGeo = new THREE.OctahedronGeometry(0.28, 0);
    const crestMat = new THREE.MeshPhongMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.2
    });
    crestMatRef.current = crestMat;

    const crestMesh = new THREE.Mesh(crestGeo, crestMat);
    crestMesh.scale.set(1, 1.2, 0.4);
    crestMesh.position.set(0, -1.25, cardDepth / 2 + 0.08);
    avatarGroup.add(crestMesh);

    // === 6. ORBITING SATELLITE DATA NODES (4 Orbs) ===
    const nodeCount = 4;
    const nodeNodes = [];
    const nodeGeo = new THREE.OctahedronGeometry(0.12, 0);
    const nodeMat = new THREE.MeshPhongMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 2.2
    });

    for (let i = 0; i < nodeCount; i++) {
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      avatarGroup.add(node);
      nodeNodes.push(node);
    }

    // === 7. BACKGROUND SHIELD WIREFRAME & 1200 DATA PARTICLES ===
    const shieldOuterGeo = new THREE.OctahedronGeometry(2.4, 2);
    const shieldOuterMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const shieldOuter = new THREE.Mesh(shieldOuterGeo, shieldOuterMat);
    scene.add(shieldOuter);

    // Particle Stream (1200 points)
    const particleCount = 1200;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x22d3ee);
    const purpleColor = new THREE.Color(0xa855f7);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = Math.random() > 0.5 ? cyanColor : purpleColor;
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // === 8. LIGHTING ===
    const pointLight = new THREE.PointLight(0x38bdf8, 4.5, 100);
    pointLight.position.set(3, 4, 5);
    scene.add(pointLight);

    const purpleLight = new THREE.PointLight(0xa855f7, 3.5, 100);
    purpleLight.position.set(-4, -2, 3);
    scene.add(purpleLight);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    // === 9. REAL-TIME MOUSE TRACKING & ANIMATION LOOP ===
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const handlePointerMove = (event) => {
      const { clientX, clientY } = event;
      mouseX = (clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(clientY / window.innerHeight - 0.5) * 2;

      targetRotY = mouseX * 0.55; // 3D Turn Y
      targetRotX = -mouseY * 0.35; // 3D Tilt X
    };

    window.addEventListener('pointermove', handlePointerMove);

    let animationFrameId;
    let time = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.02;

      // Smooth 3D Mouse Tracking Interpolation (Lerp)
      avatarGroup.rotation.y += (targetRotY - avatarGroup.rotation.y) * 0.08;
      avatarGroup.rotation.x += (targetRotX - avatarGroup.rotation.x) * 0.08;

      // Lifelike Idle Floating / Hovering Animation
      avatarGroup.position.y = Math.sin(time * 1.5) * 0.08;

      // Rotate Neural Collar Ring & Outer Shield
      collarMesh.rotation.z += 0.015;
      shieldOuter.rotation.y += 0.003;
      shieldOuter.rotation.x += 0.001;
      particleSystem.rotation.y += 0.0012;

      // Pulse Aegis Crest Light
      crestMesh.rotation.y += 0.012;
      if (crestMatRef.current) {
        crestMatRef.current.emissiveIntensity = 1.5 + Math.sin(time * 4) * 0.8;
      }

      // Orbit Satellite Data Orbs around 3D Aegis Object
      nodeNodes.forEach((node, i) => {
        const orbitAngle = time * 1.2 + (i * (Math.PI * 2 / nodeCount));
        const radius = 1.8 + Math.sin(time + i) * 0.1;
        node.position.x = Math.cos(orbitAngle) * radius;
        node.position.z = Math.sin(orbitAngle) * radius;
        node.position.y = Math.sin(time * 2 + i) * 0.35;
        node.rotation.x += 0.02;
        node.rotation.y += 0.03;
      });

      // Update Light Position following mouse
      pointLight.position.x = mouseX * 4 + 2;
      pointLight.position.y = mouseY * 4 + 2;

      renderer.render(scene, camera);
    };

    animate();

    // Window Resize Listener
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
      cancelAnimationFrame(animationFrameId);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      // Memory cleanup
      panelGeo.dispose();
      borderGeo.dispose();
      cornerGeo.dispose();
      frameArmorMat.dispose();
      borderGlowMat.dispose();
      imageMat.dispose();
      collarGeo.dispose();
      collarMat.dispose();
      crestGeo.dispose();
      crestMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      shieldOuterGeo.dispose();
      shieldOuterMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      mascotTexture.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Border & Crest Color when insight pill is selected
  const selectInsight = (index) => {
    if (index === activeInsight) return;
    setActiveInsight(index);

    const insight = MASCOT_INSIGHTS[index];
    if (cardBorderMatRef.current && crestMatRef.current) {
      cardBorderMatRef.current.color.setHex(insight.color);
      cardBorderMatRef.current.emissive.setHex(insight.color);
      crestMatRef.current.color.setHex(insight.color);
      crestMatRef.current.emissive.setHex(insight.color);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] relative overflow-hidden flex flex-col text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* Background Ambient Glow FX */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-cyan-900/20 via-blue-900/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid Pattern Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370f_1px,transparent_1px),linear-gradient(to_bottom,#1f29370f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Content Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 w-full flex-grow flex flex-col justify-center">

        {/* Hero Section Split: Left 3D Mascot Artwork / Right Hero Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">

          {/* Left Column: Interactive 3D Aegis Mascot Canvas */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">

            {/* 3D Canvas Container */}
            <div className="w-full h-[450px] sm:h-[500px] relative flex items-center justify-center">
              <div
                ref={mountRef}
                className="w-full h-full cursor-grab active:cursor-grabbing z-10"
              />

            </div>

            {/* Mascot Interactive Speech Intelligence Widget */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full max-w-lg mt-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl shadow-xl relative"
            >
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800/80">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Aegis Security Intelligence
                </span>
                <span className="ml-auto text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  {MASCOT_INSIGHTS[activeInsight].badge}
                </span>
              </div>

              {/* Speech Text Area */}
              <div className="min-h-[60px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={activeInsight}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed"
                  >
                    "{MASCOT_INSIGHTS[activeInsight].answer}"
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Interactive Prompt Pills */}
              <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
                {MASCOT_INSIGHTS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectInsight(idx)}
                    className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all border ${activeInsight === idx
                        ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-300 shadow-sm shadow-cyan-950'
                        : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                  >
                    {item.question}
                  </button>
                ))}
              </div>
            </motion.div>

          </div>

          {/* Right Column: Hero Headline & Action Buttons */}
          <div className="lg:col-span-6 flex flex-col justify-center text-left">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
                Intelligent Privacy <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400">
                  Governance Platform.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-400 mb-8 leading-relaxed font-light">
                Protect sensitive data in real-time with our advanced AI-powered platform. Automatically redact PII, secure documents, and generate compliance reports seamlessly.
              </p>

              {/* Primary Launch Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link to={ROUTES.DASHBOARD}>
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold px-8 h-12 rounded-xl text-sm shadow-xl shadow-cyan-950/60 border border-cyan-400/30">
                    Launch Studio Console <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to={ROUTES.MULTIMODAL}>
                  <Button variant="outline" size="lg" className="gap-2 h-12 px-6 rounded-xl text-sm border-cyan-800/60 bg-slate-900/60 hover:bg-cyan-950/30 text-cyan-300 backdrop-blur">
                    <FileText className="w-4 h-4 text-cyan-400" /> Document Redaction
                  </Button>
                </Link>
                <Link to={ROUTES.LIVE}>
                  <Button variant="ghost" size="lg" className="gap-2 h-12 px-5 rounded-xl text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-900/50">
                    <Eye className="w-4 h-4 text-purple-400" /> Watch Live Stream
                  </Button>
                </Link>
              </div>

            </motion.div>
          </div>

        </div>

        {/* Core Capability Navigation Cards */}
        <div className="mt-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
              Privacy Governance Capabilities
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Explore SDTT's modules engineered for end-to-end data safety across text, vision, memory, and compliance reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Card 1: Multimodal Studio */}
            <Link to={ROUTES.MULTIMODAL} className="group">
              <div className="h-full p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/15 transition-all" />
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-base mb-1 group-hover:text-cyan-300 transition-colors">
                    Document Studio
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    Sub-second PyTorch EasyOCR vision masking with multi-angle auto-rotation and label separation.
                  </p>
                </div>
                <div className="flex items-center text-xs font-mono text-cyan-400 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Open Studio</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            {/* Card 2: 3D KV Cache Governance */}
            <Link to={ROUTES.MEMORY_CACHE} className="group">
              <div className="h-full p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/15 transition-all" />
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                    <Database className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-base mb-1 group-hover:text-purple-300 transition-colors">
                    3D KV Cache
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    Interactive 3D tensor grid visualization inspecting token key-value memory taint propagation.
                  </p>
                </div>
                <div className="flex items-center text-xs font-mono text-purple-400 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Inspect Taint</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            {/* Card 3: Statutory Audit Reports */}
            <Link to={ROUTES.REPORTS} className="group">
              <div className="h-full p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/15 transition-all" />
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-base mb-1 group-hover:text-emerald-300 transition-colors">
                    Audit Reports
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    Full DPIA & EU AI Act compliance audit generator with printable statutory PDF certificates.
                  </p>
                </div>
                <div className="flex items-center text-xs font-mono text-emerald-400 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Export PDF</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

            {/* Card 4: Model Providers & Policies */}
            <Link to={ROUTES.PROVIDERS} className="group">
              <div className="h-full p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900/90 transition-all duration-300 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/15 transition-all" />
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/50 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-base mb-1 group-hover:text-blue-300 transition-colors">
                    Model Gateways
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-4">
                    Configure LLM model providers, gateway latency ping status, and policy enforcement rules.
                  </p>
                </div>
                <div className="flex items-center text-xs font-mono text-blue-400 gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Manage Gateways</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>SDTT Privacy Governance Platform & Real-Time Masking Layer</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">

            <span>•</span>
            <span>Real-Time IST Alerting</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">v2.4 Production</span>
          </div>
        </div>
      </footer>

    </div>
  );
}


