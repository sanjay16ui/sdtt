import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Badge, Button } from '@/components';
import { RotateCw, RotateCcw, ZoomIn, ZoomOut, Compass, Sparkles } from 'lucide-react';

export const pipeline3DNodes = [
  {
    id: 'subj-1',
    type: 'Subject',
    label: 'SUB-20491',
    detail: 'Principal Identity Vault',
    status: 'Protected',
    sensitivity: 'Restricted',
    color: 0x38bdf8, // cyan
    position: new THREE.Vector3(-14, 0, 0),
    geo: 'icosahedron',
    description: 'Cryptographically registered subject with persistent privacy state across chat sessions.'
  },
  {
    id: 'int-1',
    type: 'Interaction',
    label: 'Session Ingestion',
    detail: 'Channel: Chat #SESS-812',
    status: 'Active',
    sensitivity: 'Normal',
    color: 0x60a5fa, // blue
    position: new THREE.Vector3(-8.5, 1.8, 2.5),
    geo: 'octahedron',
    description: 'Inbound message ingress and multi-turn conversational context assembly.'
  },
  {
    id: 'data-1',
    type: 'Sensitive Data',
    label: 'Email + Financials',
    detail: 'Tainted QID Attributes',
    status: 'Tainted',
    sensitivity: 'Critical',
    color: 0xfbbf24, // amber
    position: new THREE.Vector3(-2.8, -0.5, -1.8),
    geo: 'dodecahedron',
    description: 'Direct identifiers and quasi-identifiers flagged with high differential sensitivity.'
  },
  {
    id: 'trans-1',
    type: 'Transformation',
    label: 'Differential Barrier',
    detail: 'Policy: POL-01 Safe Mask',
    status: 'Transforming',
    sensitivity: 'Enforced',
    color: 0xa855f7, // purple
    position: new THREE.Vector3(2.8, 2.2, 1.8),
    geo: 'barrier',
    description: 'Surrogate tokenization and differential noise injection applied before model egress.'
  },
  {
    id: 'sys-1',
    type: 'AI System',
    label: 'Gemini 2.5 Flash',
    detail: 'Inference Layer Cluster',
    status: 'Sanitized',
    sensitivity: 'Verified',
    color: 0x3b82f6, // deep blue
    position: new THREE.Vector3(8.5, -0.2, -2.2),
    geo: 'cube',
    description: 'Model inference execution bounded by zero prompt injection leakage verification.'
  },
  {
    id: 'rec-1',
    type: 'Recipient',
    label: 'External Vendor API',
    detail: 'Controlled Webhook Target',
    status: 'Delivered',
    sensitivity: 'Safe Release',
    color: 0x34d399, // emerald
    position: new THREE.Vector3(14, 1.2, 0),
    geo: 'beacon',
    description: 'Destination endpoint receiving fully de-identified, differential taint-scrubbed release payload.'
  }
];

export default function DataJourney3D({ selectedNode, onSelectNode }) {
  const containerRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  const sceneStateRef = useRef({
    controls: null,
    camera: null,
    nodeMeshes: [],
    curve: null,
    particles: [],
    autoRotate: true,
  });

  useEffect(() => {
    sceneStateRef.current.autoRotate = isAutoRotate;
    if (sceneStateRef.current.controls) {
      sceneStateRef.current.controls.autoRotate = isAutoRotate;
    }
  }, [isAutoRotate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050608);
    scene.fog = new THREE.FogExp2(0x050608, 0.016);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 10, 28);
    sceneStateRef.current.camera = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 60;
    controls.minDistance = 8;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.autoRotate = isAutoRotate;
    controls.autoRotateSpeed = 0.8;
    sceneStateRef.current.controls = controls;

    const ambientLight = new THREE.AmbientLight(0x334155, 1.5);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight1.position.set(20, 25, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 1.8);
    dirLight2.position.set(-20, 20, -15);
    scene.add(dirLight2);

    const gridHelper = new THREE.GridHelper(50, 30, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    const ringGeo = new THREE.RingGeometry(18, 18.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x1e293b, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -4.95;
    scene.add(ringMesh);

    const nodeMeshes = [];

    pipeline3DNodes.forEach((nodeData) => {
      const group = new THREE.Group();
      group.position.copy(nodeData.position);
      group.userData = nodeData;

      let coreMesh;
      const coreMat = new THREE.MeshStandardMaterial({
        color: nodeData.color,
        emissive: nodeData.color,
        emissiveIntensity: 0.45,
        roughness: 0.2,
        metalness: 0.8,
      });

      if (nodeData.geo === 'icosahedron') {
        const geo = new THREE.IcosahedronGeometry(1.4, 0);
        coreMesh = new THREE.Mesh(geo, coreMat);
      } else if (nodeData.geo === 'octahedron') {
        const geo = new THREE.OctahedronGeometry(1.5, 0);
        coreMesh = new THREE.Mesh(geo, coreMat);
      } else if (nodeData.geo === 'dodecahedron') {
        const geo = new THREE.DodecahedronGeometry(1.4, 0);
        coreMesh = new THREE.Mesh(geo, coreMat);
      } else if (nodeData.geo === 'barrier') {
        const geo = new THREE.SphereGeometry(1.1, 16, 16);
        coreMesh = new THREE.Mesh(geo, coreMat);
        
        const torusGeo1 = new THREE.TorusGeometry(1.8, 0.08, 12, 32);
        const torusMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, wireframe: true });
        const torus1 = new THREE.Mesh(torusGeo1, torusMat);
        torus1.name = 'torus1';
        group.add(torus1);

        const torusGeo2 = new THREE.TorusGeometry(2.1, 0.06, 12, 32);
        const torus2 = new THREE.Mesh(torusGeo2, torusMat);
        torus2.name = 'torus2';
        torus2.rotation.x = Math.PI / 3;
        group.add(torus2);
      } else if (nodeData.geo === 'cube') {
        const geo = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        coreMesh = new THREE.Mesh(geo, coreMat);
      } else {
        const geo = new THREE.CylinderGeometry(1.0, 1.4, 2.0, 8);
        coreMesh = new THREE.Mesh(geo, coreMat);
      }

      coreMesh.name = 'core';
      group.add(coreMesh);

      const wireMat = new THREE.MeshBasicMaterial({
        color: nodeData.color,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      const wireMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(2.0, 1), wireMat);
      wireMesh.name = 'wire';
      group.add(wireMesh);

      const pLight = new THREE.PointLight(nodeData.color, 1.5, 8);
      pLight.position.set(0, 0, 0);
      group.add(pLight);

      const lineMat = new THREE.LineDashedMaterial({ color: 0x334155, dashSize: 0.5, gapSize: 0.3 });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, -5 - nodeData.position.y, 0)
      ]);
      const dropLine = new THREE.Line(lineGeo, lineMat);
      dropLine.computeLineDistances();
      group.add(dropLine);

      const baseRingGeo = new THREE.RingGeometry(0.8, 0.9, 16);
      const baseRingMat = new THREE.MeshBasicMaterial({ color: nodeData.color, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
      const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
      baseRing.rotation.x = Math.PI / 2;
      baseRing.position.y = -4.95 - nodeData.position.y;
      group.add(baseRing);

      scene.add(group);
      nodeMeshes.push(group);
    });

    sceneStateRef.current.nodeMeshes = nodeMeshes;

    const curvePoints = pipeline3DNodes.map(n => n.position);
    const splineCurve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.2);
    sceneStateRef.current.curve = splineCurve;

    const tubeGeo = new THREE.TubeGeometry(splineCurve, 80, 0.12, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tubeMesh);

    const particleCount = 20;
    const particles = [];
    const packetGeo = new THREE.SphereGeometry(0.22, 8, 8);

    for (let i = 0; i < particleCount; i++) {
      const packetMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xfbbf24 : (i % 2 === 0 ? 0xa855f7 : 0x38bdf8),
      });
      const packetMesh = new THREE.Mesh(packetGeo, packetMat);
      const progress = i / particleCount;
      packetMesh.userData = { progress, speed: 0.003 + Math.random() * 0.002 };
      
      const pt = splineCurve.getPoint(progress);
      packetMesh.position.copy(pt);
      
      scene.add(packetMesh);
      particles.push(packetMesh);
    }
    sceneStateRef.current.particles = particles;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const clickables = nodeMeshes.map(g => g.getObjectByName('core')).filter(Boolean);
      const intersects = raycaster.intersectObjects(clickables, false);

      if (intersects.length > 0) {
        const targetGroup = intersects[0].object.parent;
        const nodeInfo = targetGroup.userData;
        setHoveredNode(nodeInfo);
        setTooltipPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          visible: true,
        });
        container.style.cursor = 'pointer';
      } else {
        setHoveredNode(null);
        setTooltipPos(prev => ({ ...prev, visible: false }));
        container.style.cursor = 'grab';
      }
    };

    const handleClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const clickables = nodeMeshes.map(g => g.getObjectByName('core')).filter(Boolean);
      const intersects = raycaster.intersectObjects(clickables, false);

      if (intersects.length > 0) {
        const targetGroup = intersects[0].object.parent;
        if (onSelectNode) {
          onSelectNode(targetGroup.userData);
        }
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('click', handleClick);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      controls.update();

      nodeMeshes.forEach((group, index) => {
        const core = group.getObjectByName('core');
        const wire = group.getObjectByName('wire');
        const torus1 = group.getObjectByName('torus1');
        const torus2 = group.getObjectByName('torus2');

        if (core) {
          core.rotation.y += 0.01;
          core.rotation.x += 0.005;
        }
        if (wire) {
          wire.rotation.y -= 0.015;
          const scale = 1.0 + Math.sin(time * 2 + index) * 0.06;
          wire.scale.set(scale, scale, scale);
        }
        if (torus1) {
          torus1.rotation.z += 0.02;
          torus1.rotation.x += 0.01;
        }
        if (torus2) {
          torus2.rotation.y += 0.025;
        }
      });

      particles.forEach((p) => {
        p.userData.progress += p.userData.speed;
        if (p.userData.progress > 1) {
          p.userData.progress = 0;
        }
        const pt = splineCurve.getPoint(p.userData.progress);
        p.position.copy(pt);
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const resetCamera = () => {
    if (sceneStateRef.current.camera && sceneStateRef.current.controls) {
      sceneStateRef.current.camera.position.set(0, 10, 28);
      sceneStateRef.current.controls.target.set(0, 0, 0);
      sceneStateRef.current.controls.update();
    }
  };

  const zoomIn = () => {
    if (sceneStateRef.current.camera) {
      sceneStateRef.current.camera.position.multiplyScalar(0.85);
      sceneStateRef.current.controls.update();
    }
  };

  const zoomOut = () => {
    if (sceneStateRef.current.camera) {
      sceneStateRef.current.camera.position.multiplyScalar(1.15);
      sceneStateRef.current.controls.update();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden select-none bg-[#050608]">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b0c10]/90 border border-[#1e2330] backdrop-blur-md text-xs shadow-xl">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-white">3D Holographic Pipeline</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/50">WEBGL 3D</span>
        </div>

        <div className="flex items-center gap-1 bg-[#0b0c10]/90 border border-[#1e2330] rounded-lg p-1 backdrop-blur-md shadow-xl">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            className="gap-1.5 text-xs text-slate-300"
          >
            {isAutoRotate ? <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
            {isAutoRotate ? 'Auto-Orbiting' : 'Orbit Paused'}
          </Button>
          <div className="h-4 w-px bg-[#1e2330]" />
          <Button variant="ghost" size="icon" onClick={resetCamera} title="Reset Camera View" className="h-7 w-7 text-slate-400 hover:text-white">
            <Compass className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={zoomIn} title="Zoom In" className="h-7 w-7 text-slate-400 hover:text-white">
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={zoomOut} title="Zoom Out" className="h-7 w-7 text-slate-400 hover:text-white">
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 px-3 py-2 rounded-lg bg-[#0b0c10]/80 border border-[#1e2330] backdrop-blur-md text-[11px] text-slate-400 pointer-events-none shadow-xl">
        <span className="font-mono text-slate-500 font-semibold uppercase text-[10px]">Pipeline Stages:</span>
        <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Subject Vault
        </span>
        <span className="flex items-center gap-1.5 text-amber-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span> Tainted QID Core
        </span>
        <span className="flex items-center gap-1.5 text-purple-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span> Differential Fence
        </span>
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Safe Recipient
        </span>
      </div>

      {tooltipPos.visible && hoveredNode && (
        <div 
          className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="bg-[#0b0c10]/95 border border-[#2a3142] rounded-lg p-3 shadow-2xl backdrop-blur-md w-48 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">{hoveredNode.type}</span>
              <Badge variant={hoveredNode.status === 'Tainted' ? 'warning' : 'success'} className="text-[9px]">
                {hoveredNode.status}
              </Badge>
            </div>
            <div className="text-xs font-bold text-white truncate">{hoveredNode.label}</div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate">{hoveredNode.detail}</div>
            <div className="text-[9px] text-cyan-400 mt-2 font-mono flex items-center gap-1">
              Click to inspect vertex 3D details →
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
