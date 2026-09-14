import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface ModelStageConfig {
  id: string;
  name: string;
  order: string;
  modelPath?: string;
  flowCharacter: 'Turbulent' | 'Chaotic' | 'Rough' | 'Laminar';
  streamlineColor: THREE.Color;
  targetScale: number;
  rotOffset: THREE.Euler;
  telemetry: {
    lift: string;
    drag: string;
    aoa: string;
  };
}

// Global Timing Configuration (Double/Triple slower for smooth readable transformations)
export const TIMING_CONFIG = {
  speedMultiplier: 1.0,
  holdDuration: 4500,          // 4.5s: hold settled model so visitor can comfortably examine it
  disintegrateDuration: 1600,  // 1.6s: deliberate aerodynamic peel-off along sweep front
  voidDuration: 500,           // 0.5s: brief breathing pause while airflow shifts color
  reassembleDuration: 1600,    // 1.6s: incoming streamlines converge into new silhouette
  settleDuration: 400,         // 0.4s: gentle settle
};

// Target left clearance: the leftmost tip of EVERY model stops at exactly this X coordinate (0.85),
// guaranteeing an 80px+ horizontal separation from Dhanesh's portrait.
const TARGET_LEFT_BOUND = 0.85;

export const MODEL_STAGES: ModelStageConfig[] = [
  {
    id: 'bird',
    name: 'Bird (American Kestrel)',
    order: '01 / 04',
    // Real kestrel GLTF — beak naturally faces left (-X), no Y-flip needed
    modelPath: '/models/kestrel/scene.gltf',
    flowCharacter: 'Turbulent',
    streamlineColor: new THREE.Color(0.12, 0.45, 0.90), // deep vivid aero blue
    targetScale: 2.9,
    rotOffset: new THREE.Euler(0.10, 150, -0.12), // Y=0: beak faces left (toward portrait)
    telemetry: { lift: '+ 1.15', drag: '0.18', aoa: '4.2°' },
  },
  {
    id: 'paper_plane',
    name: 'Paper Airplane',
    order: '02 / 04',
    modelPath: '/models/paper_plane/scene.gltf',
    flowCharacter: 'Chaotic',
    streamlineColor: new THREE.Color(0.85, 0.45, 0.12), // amber-orange flow
    targetScale: 2.6,
    rotOffset: new THREE.Euler(0.14, Math.PI, -0.16),
    telemetry: { lift: '+ 0.65', drag: '0.32', aoa: '2.8°' },
  },
  {
    id: 'vintage',
    name: 'Vintage Propeller Plane (1903)',
    order: '03 / 04',
    // Uses procedural createVintageBiplaneMesh() — no modelPath
    flowCharacter: 'Rough',
    streamlineColor: new THREE.Color(0.75, 0.55, 0.10), // warm ochre / vintage gold
    targetScale: 2.9,
    rotOffset: new THREE.Euler(0.12, 0, -0.14),
    telemetry: { lift: '+ 1.48', drag: '0.45', aoa: '5.1°' },
  },
  {
    id: 'drone',
    name: 'Modern Drone (MQ-9 Reaper)',
    order: '04 / 04',
    modelPath: '/models/reaper_drone/scene.gltf',
    flowCharacter: 'Laminar',
    streamlineColor: new THREE.Color(0.08, 0.60, 0.85), // cool cyan-blue
    targetScale: 6.0,
    rotOffset: new THREE.Euler(0.12, -Math.PI / 2, -0.16),
    telemetry: { lift: '+ 1.32', drag: '0.21', aoa: '3.5°' },
  },
];

// DEV-ONLY: Warn if any two GLTF stages share the same modelPath (silent wrong-model bug)
if (import.meta.env.DEV) {
  const paths = MODEL_STAGES.filter(s => s.modelPath).map(s => s.modelPath!);
  const dupes = paths.filter((p, i) => paths.indexOf(p) !== i);
  if (dupes.length > 0) {
    console.warn('[HeroMorph] ⚠️ Duplicate modelPaths detected across stages:', dupes);
  }
}

// Unified Flow-Field Function
function getStreamlineFlow(x: number, y: number, z: number, flowType: string, time: number) {
  let vx = 0.082;
  let vy = 0;
  let vz = 0;

  if (flowType === 'Turbulent') {
    vy = Math.sin(time * 3.0 + x * 1.5) * 0.024;
    vz = Math.cos(time * 2.6 + x * 1.2) * 0.016;
  } else if (flowType === 'Chaotic') {
    vy = Math.sin(time * 4.0 + x * 2.0 + z) * 0.022 + Math.sin(time * 7.5 + x * 3.8) * 0.01;
    vz = Math.cos(time * 3.2 + y * 1.8) * 0.016;
  } else if (flowType === 'Rough') {
    vy = Math.sin(x * 7.0 + time * 4.8) * 0.018;
    vz = Math.sin(x * 5.0 + time * 3.8) * 0.014;
  } else {
    const profileCurve = Math.exp(-x * x * 0.35);
    vy = (y >= 0 ? 0.016 : -0.016) * profileCurve;
    vz = (z >= 0 ? 0.01 : -0.01) * profileCurve;
  }

  return { vx, vy, vz };
}

// 1. High-Quality Stylized 3D Low-Poly Bird Mesh (American Kestrel in glide)
function createStylizedBirdMesh(): { group: THREE.Group; vertices: THREE.Vector3[] } {
  const group = new THREE.Group();
  const sampledVertices: THREE.Vector3[] = [];

  const pBeak = new THREE.Vector3(-1.6, -0.06, 0.0);
  const pHeadTop = new THREE.Vector3(-1.15, 0.22, 0.0);
  const pHeadR = new THREE.Vector3(-1.1, 0.12, 0.18);
  const pHeadL = new THREE.Vector3(-1.1, 0.12, -0.18);
  const pThroat = new THREE.Vector3(-1.0, -0.16, 0.0);

  const pBack = new THREE.Vector3(-0.1, 0.26, 0.0);
  const pBackR = new THREE.Vector3(-0.2, 0.20, 0.28);
  const pBackL = new THREE.Vector3(-0.2, 0.20, -0.28);
  const pKeel = new THREE.Vector3(-0.35, -0.30, 0.0);
  const pBellyR = new THREE.Vector3(-0.2, -0.16, 0.22);
  const pBellyL = new THREE.Vector3(-0.2, -0.16, -0.22);

  // Right Wing (+Z)
  const pWingR_RootLead = new THREE.Vector3(-0.4, 0.18, 0.38);
  const pWingR_MidLead = new THREE.Vector3(-0.6, 0.24, 1.35);
  const pWingR_TipLead = new THREE.Vector3(-0.45, 0.18, 2.45);
  const pWingR_Tip = new THREE.Vector3(-0.1, 0.10, 2.85);
  const pWingR_TipTrail = new THREE.Vector3(0.3, 0.04, 2.5);
  const pWingR_MidTrail = new THREE.Vector3(0.5, 0.08, 1.4);
  const pWingR_RootTrail = new THREE.Vector3(0.4, 0.14, 0.38);

  // Left Wing (-Z)
  const pWingL_RootLead = new THREE.Vector3(-0.4, 0.18, -0.38);
  const pWingL_MidLead = new THREE.Vector3(-0.6, 0.24, -1.35);
  const pWingL_TipLead = new THREE.Vector3(-0.45, 0.18, -2.45);
  const pWingL_Tip = new THREE.Vector3(-0.1, 0.10, -2.85);
  const pWingL_TipTrail = new THREE.Vector3(0.3, 0.04, -2.5);
  const pWingL_MidTrail = new THREE.Vector3(0.5, 0.08, -1.4);
  const pWingL_RootTrail = new THREE.Vector3(0.4, 0.14, -0.38);

  // Rump & Tail Fan
  const pRumpTop = new THREE.Vector3(0.7, 0.12, 0.0);
  const pRumpR = new THREE.Vector3(0.65, 0.06, 0.2);
  const pRumpL = new THREE.Vector3(0.65, 0.06, -0.2);
  const pTailTipMid = new THREE.Vector3(1.65, 0.02, 0.0);
  const pTailTipR = new THREE.Vector3(1.5, 0.02, 0.45);
  const pTailTipL = new THREE.Vector3(1.5, 0.02, -0.45);

  const triangles: THREE.Vector3[][] = [
    // Beak
    [pBeak, pHeadTop, pHeadR],
    [pBeak, pHeadR, pThroat],
    [pBeak, pThroat, pHeadL],
    [pBeak, pHeadL, pHeadTop],

    // Head / Neck
    [pHeadTop, pBack, pBackR],
    [pHeadTop, pBackR, pHeadR],
    [pHeadTop, pHeadL, pBackL],
    [pHeadTop, pBackL, pBack],
    [pThroat, pBellyR, pKeel],
    [pThroat, pHeadR, pBellyR],
    [pThroat, pKeel, pBellyL],
    [pThroat, pBellyL, pHeadL],

    // Torso Sides
    [pBackR, pWingR_RootLead, pBellyR],
    [pBackL, pBellyL, pWingL_RootLead],
    [pBack, pRumpTop, pBackR],
    [pBack, pBackL, pRumpTop],
    [pKeel, pBellyR, pRumpR],
    [pKeel, pRumpL, pBellyL],

    // Right Wing Upper
    [pWingR_RootLead, pWingR_MidLead, pWingR_RootTrail],
    [pWingR_MidLead, pWingR_MidTrail, pWingR_RootTrail],
    [pWingR_MidLead, pWingR_TipLead, pWingR_MidTrail],
    [pWingR_TipLead, pWingR_TipTrail, pWingR_MidTrail],
    [pWingR_TipLead, pWingR_Tip, pWingR_TipTrail],

    // Left Wing Upper
    [pWingL_RootLead, pWingL_RootTrail, pWingL_MidLead],
    [pWingL_MidLead, pWingL_RootTrail, pWingL_MidTrail],
    [pWingL_MidLead, pWingL_MidTrail, pWingL_TipLead],
    [pWingL_TipLead, pWingL_MidTrail, pWingL_TipTrail],
    [pWingL_TipLead, pWingL_TipTrail, pWingL_Tip],

    // Tail Fan
    [pRumpTop, pTailTipMid, pTailTipR],
    [pRumpTop, pTailTipL, pTailTipMid],
    [pRumpTop, pTailTipR, pRumpR],
    [pRumpTop, pRumpL, pTailTipL],
  ];

  const positions: number[] = [];
  triangles.forEach(([a, b, c]) => {
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
    sampledVertices.push(a.clone(), b.clone(), c.clone());
    for (let s = 1; s <= 4; s++) {
      const u = Math.random();
      const v = Math.random() * (1 - u);
      const w = 1 - u - v;
      sampledVertices.push(
        new THREE.Vector3(
          a.x * u + b.x * v + c.x * w,
          a.y * u + b.y * v + c.y * w,
          a.z * u + b.z * v + c.z * w
        )
      );
    }
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.85,
    roughness: 0.3,
    flatShading: true,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1.0,
  });
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  const edgesGeo = new THREE.EdgesGeometry(geo, 16);
  const edgesMat = new THREE.LineBasicMaterial({
    color: 0x0284c7,
    linewidth: 1.5,
    transparent: true,
    opacity: 0.85,
  });
  const edges = new THREE.LineSegments(edgesGeo, edgesMat);
  group.add(edges);

  return { group, vertices: sampledVertices };
}

// 2. High-Quality Solid Procedural 1903 Vintage Propeller Plane (Wright Flyer)
function createVintageBiplaneMesh(): { group: THREE.Group; vertices: THREE.Vector3[] } {
  const group = new THREE.Group();
  const sampledVertices: THREE.Vector3[] = [];

  const canvasMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // solid rich slate canvas
    roughness: 0.4,
    metalness: 0.6,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1.0,
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0xd97706, // warm honey spruce wood
    roughness: 0.6,
    metalness: 0.1,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1.0,
  });

  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.3,
    metalness: 0.9,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 1.0,
  });

  const edgeLineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8, // glowing cyan blueprint edge lines
    linewidth: 1.5,
    transparent: true,
    opacity: 0.85,
  });

  // A. Upper & Lower Wings (Span: 5.2, Chord: 1.15)
  const wingGeo = new THREE.BoxGeometry(1.15, 0.07, 5.2);
  const wingEdgesGeo = new THREE.EdgesGeometry(wingGeo, 16);

  // Upper Wing
  const upperWing = new THREE.Mesh(wingGeo, canvasMat);
  upperWing.position.set(0, 0.62, 0);
  upperWing.add(new THREE.LineSegments(wingEdgesGeo, edgeLineMat));
  group.add(upperWing);

  // Lower Wing
  const lowerWing = new THREE.Mesh(wingGeo, canvasMat);
  lowerWing.position.set(0, -0.42, 0);
  lowerWing.add(new THREE.LineSegments(wingEdgesGeo, edgeLineMat));
  group.add(lowerWing);

  // B. Interplane Spruce Struts (8 pairs connecting upper and lower wings)
  const strutGeo = new THREE.CylinderGeometry(0.035, 0.035, 1.04, 8);
  const strutZOffsets = [-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4];
  const strutXOffsets = [-0.42, 0.42];

  strutZOffsets.forEach((z) => {
    strutXOffsets.forEach((x) => {
      const strut = new THREE.Mesh(strutGeo, woodMat);
      strut.position.set(x, 0.1, z);
      group.add(strut);
    });
  });

  // C. Forward Canard Elevator (Nose section pointing strictly LEFT at -X)
  const canardGeo = new THREE.BoxGeometry(0.65, 0.05, 2.2);
  const canardEdgesGeo = new THREE.EdgesGeometry(canardGeo, 16);

  const canardUpper = new THREE.Mesh(canardGeo, canvasMat);
  canardUpper.position.set(-1.85, 0.18, 0);
  canardUpper.add(new THREE.LineSegments(canardEdgesGeo, edgeLineMat));
  group.add(canardUpper);

  const canardLower = new THREE.Mesh(canardGeo, canvasMat);
  canardLower.position.set(-1.85, -0.22, 0);
  canardLower.add(new THREE.LineSegments(canardEdgesGeo, edgeLineMat));
  group.add(canardLower);

  // Canard vertical struts
  [-0.9, 0, 0.9].forEach((cz) => {
    const cStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.4, 6), woodMat);
    cStrut.position.set(-1.85, -0.02, cz);
    group.add(cStrut);
  });

  // Forward structural boom trusses connecting wings to canard
  const boomGeo = new THREE.BoxGeometry(1.6, 0.04, 0.04);
  [-0.6, 0.6].forEach((bz) => {
    const uBoom = new THREE.Mesh(boomGeo, woodMat);
    uBoom.position.set(-1.0, 0.38, bz);
    uBoom.rotation.z = 0.22;
    group.add(uBoom);

    const lBoom = new THREE.Mesh(boomGeo, woodMat);
    lBoom.position.set(-1.0, -0.32, bz);
    lBoom.rotation.z = -0.12;
    group.add(lBoom);
  });

  // D. Rear Twin Vertical Rudders (Empennage at +X)
  const rudderGeo = new THREE.BoxGeometry(0.55, 0.85, 0.04);
  const rudderEdgesGeo = new THREE.EdgesGeometry(rudderGeo, 16);

  [-0.35, 0.35].forEach((rz) => {
    const rudder = new THREE.Mesh(rudderGeo, canvasMat);
    rudder.position.set(1.85, 0.12, rz);
    rudder.add(new THREE.LineSegments(rudderEdgesGeo, edgeLineMat));
    group.add(rudder);

    const rBoomUpper = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.04), woodMat);
    rBoomUpper.position.set(1.15, 0.36, rz);
    rBoomUpper.rotation.z = -0.26;
    group.add(rBoomUpper);

    const rBoomLower = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.04, 0.04), woodMat);
    rBoomLower.position.set(1.15, -0.18, rz);
    rBoomLower.rotation.z = 0.16;
    group.add(rBoomLower);
  });

  // E. Central Engine Block & Radiator on Lower Wing
  const engineGeo = new THREE.BoxGeometry(0.65, 0.3, 0.4);
  const engine = new THREE.Mesh(engineGeo, darkMetalMat);
  engine.position.set(0.12, -0.24, 0.32);
  group.add(engine);

  // Pilot Cradle (Hip cradle prone position)
  const cradleGeo = new THREE.BoxGeometry(0.7, 0.08, 0.35);
  const cradle = new THREE.Mesh(cradleGeo, woodMat);
  cradle.position.set(0.05, -0.34, -0.25);
  group.add(cradle);

  // F. Twin Pusher Propellers (Mounted behind wings at x = 0.72)
  const propBladeGeo = new THREE.BoxGeometry(0.04, 0.85, 0.1);
  [-0.8, 0.8].forEach((pz) => {
    const propHub = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.15, 8), darkMetalMat);
    propHub.rotation.z = Math.PI / 2;
    propHub.position.set(0.65, 0.1, pz);
    group.add(propHub);

    const blade1 = new THREE.Mesh(propBladeGeo, woodMat);
    blade1.position.set(0.72, 0.1, pz);
    blade1.rotation.x = 0.4;
    group.add(blade1);
  });

  // G. Twin Under-Wing Landing Skids
  const skidGeo = new THREE.BoxGeometry(2.4, 0.05, 0.06);
  [-0.6, 0.6].forEach((sz) => {
    const skid = new THREE.Mesh(skidGeo, woodMat);
    skid.position.set(-0.25, -0.62, sz);
    group.add(skid);

    [-0.8, 0.4].forEach((sx) => {
      const sStrut = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.22, 6), woodMat);
      sStrut.position.set(sx, -0.52, sz);
      group.add(sStrut);
    });
  });

  // Sample vertices across the biplane hierarchy
  group.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const m = child as THREE.Mesh;
      if (m.geometry && m.geometry.attributes.position) {
        const pos = m.geometry.attributes.position;
        const step = Math.max(1, Math.floor(pos.count / 40));
        for (let k = 0; k < pos.count; k += step) {
          const v = new THREE.Vector3(pos.getX(k), pos.getY(k), pos.getZ(k));
          v.applyMatrix4(m.matrix);
          sampledVertices.push(v);
        }
      }
    }
  });

  return { group, vertices: sampledVertices };
}

// Function to calculate exact bounding box and position any model so its leftmost extent
// (nose/elevator) stops at exactly TARGET_LEFT_BOUND, ensuring zero photo clipping.
function alignModelLeftward(model: THREE.Group, targetScale: number, rotEuler: THREE.Euler) {
  model.position.set(0, 0, 0);
  model.rotation.copy(rotEuler);

  // Compute bounding box in oriented space
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  // Proportional scale
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = targetScale / (maxDim || 1);
  model.scale.setScalar(scale);

  // Center on Y and Z
  model.position.y = -center.y * scale;
  model.position.z = -center.z * scale;

  // Align leftmost X to TARGET_LEFT_BOUND
  const currentBox = new THREE.Box3().setFromObject(model);
  const leftmostX = currentBox.min.x;
  model.position.x = TARGET_LEFT_BOUND - leftmostX;

  model.userData.baseScale = scale;
  model.userData.basePosX = model.position.x;
  model.userData.basePosY = model.position.y;
  model.userData.basePosZ = model.position.z;
}

interface HeroModelMorphSequenceProps {
  onTelemetryChange?: (telemetry: { lift: string; drag: string; aoa: string }) => void;
  onInteractiveClick?: () => void;
}

export const HeroModelMorphSequence: React.FC<HeroModelMorphSequenceProps> = ({
  onTelemetryChange,
  onInteractiveClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHoveredRef = useRef(false);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'hold' | 'disintegrate' | 'void' | 'reassemble' | 'settle'>('hold');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const width = container.clientWidth || 650;
    const height = container.clientHeight || 480;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0.8, 0.65, 7.2);
    camera.lookAt(0.8, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(6, 12, 10);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-8, -4, -6);
    scene.add(fillLight);

    // 2. Stage Models Container & Vertex Clouds
    const stageModels: (THREE.Group | null)[] = [null, null, null, null];
    const stageVertexClouds: THREE.Vector3[][] = [[], [], [], []];
    const loader = new GLTFLoader();

    // Helper: load a GLTF stage, wire opacity + vertex cloud
    const loadGLTFStage = (
      stageIdx: number,
      isFirst: boolean,
    ) => {
      const stage = MODEL_STAGES[stageIdx];
      if (!stage.modelPath) {
        if (import.meta.env.DEV) {
          console.warn(`[HeroMorph] Stage ${stageIdx} (${stage.id}) has no modelPath — skipping GLTF load.`);
        }
        return;
      }
      loader.load(
        stage.modelPath,
        (gltf) => {
          const model = gltf.scene;
          alignModelLeftward(model, stage.targetScale, stage.rotOffset);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const m = child as THREE.Mesh;
              if (m.material) {
                const cloned = (Array.isArray(m.material) ? m.material[0] : m.material).clone();
                cloned.transparent = true;
                cloned.opacity = isFirst ? 1.0 : 0;
                m.material = cloned;
              }
              if (m.geometry && m.geometry.attributes.position) {
                const pos = m.geometry.attributes.position;
                const step = Math.max(1, Math.floor(pos.count / 80));
                for (let k = 0; k < pos.count; k += step) {
                  const v = new THREE.Vector3(pos.getX(k), pos.getY(k), pos.getZ(k));
                  v.applyMatrix4(m.matrixWorld);
                  stageVertexClouds[stageIdx].push(v);
                }
              }
            }
          });

          stageModels[stageIdx] = model;
          model.visible = isFirst;
          scene.add(model);

          if (import.meta.env.DEV) {
            console.log(`[HeroMorph] ✅ Stage ${stageIdx} (${stage.id}) loaded: ${stage.modelPath}`);
          }
        },
        undefined,
        (err) => {
          console.warn(`[HeroMorph] ⚠️ Stage ${stageIdx} (${stage.id}) FAILED to load: ${stage.modelPath}`, err);
        }
      );
    };

    // Stage 0: Real American Kestrel GLTF (head left toward portrait)
    loadGLTFStage(0, true);

    // Stage 1: Paper Airplane (GLTF)
    loadGLTFStage(1, false);

    // Stage 2: High-Quality Solid 1903 Vintage Propeller Plane (procedural Wright Flyer)
    const biplane = createVintageBiplaneMesh();
    alignModelLeftward(biplane.group, MODEL_STAGES[2].targetScale, MODEL_STAGES[2].rotOffset);
    biplane.group.visible = false;
    stageModels[2] = biplane.group;
    stageVertexClouds[2] = biplane.vertices;
    scene.add(biplane.group);

    // Stage 3: Modern Drone (MQ-9 Reaper GLTF)
    loadGLTFStage(3, false);

    // 3. System A: Ambient Continuous Airflow Streamlines
    // High-contrast, elegant dark-blue/cyan lines on the light background
    const ambientStreamCount = 65;
    const ambientTrailPts = 14;
    const ambientGeo = new THREE.BufferGeometry();
    const ambientPositions = new Float32Array(ambientStreamCount * (ambientTrailPts - 1) * 2 * 3);
    const ambientColors = new Float32Array(ambientStreamCount * (ambientTrailPts - 1) * 2 * 3);

    interface AmbientLine {
      x: number;
      y: number;
      z: number;
      speed: number;
      history: { x: number; y: number; z: number }[];
    }

    const ambientStreams: AmbientLine[] = [];
    for (let i = 0; i < ambientStreamCount; i++) {
      const startX = 0.5 + Math.random() * 4.0;
      const startY = (Math.random() - 0.5) * 2.6;
      const startZ = (Math.random() - 0.5) * 2.2;
      const history: { x: number; y: number; z: number }[] = [];
      for (let j = 0; j < ambientTrailPts; j++) {
        history.push({ x: startX, y: startY, z: startZ });
      }
      ambientStreams.push({
        x: startX,
        y: startY,
        z: startZ,
        speed: 0.07 + Math.random() * 0.05,
        history,
      });
    }

    ambientGeo.setAttribute('position', new THREE.BufferAttribute(ambientPositions, 3));
    ambientGeo.setAttribute('color', new THREE.BufferAttribute(ambientColors, 3));

    const ambientMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      linewidth: 1.5,
    });
    const ambientMesh = new THREE.LineSegments(ambientGeo, ambientMat);
    scene.add(ambientMesh);

    // 4. System B: Disintegration / Reassembly Aerodynamic Line Strokes
    // REPLACES ALL BLACK BOXES WITH THIN CURVED LINE STROKES
    // Each stroke is composed of 4 points (3 connected line segments)
    const maxStrokes = 180;
    const ptsPerStroke = 4;
    const segmentsPerStroke = ptsPerStroke - 1; // 3 segments = 6 vertices
    const strokeVertices = maxStrokes * segmentsPerStroke * 2;

    const strokeGeo = new THREE.BufferGeometry();
    const strokePositions = new Float32Array(strokeVertices * 3);
    const strokeColors = new Float32Array(strokeVertices * 3);

    interface FlowStroke {
      x: number;
      y: number;
      z: number;
      vx: number;
      targetX: number;
      targetY: number;
      targetZ: number;
      life: number;
      maxLife: number;
      alpha: number;
      active: boolean;
      mode: 'dissolve' | 'assemble';
      history: { x: number; y: number; z: number }[];
    }

    const strokes: FlowStroke[] = [];
    for (let i = 0; i < maxStrokes; i++) {
      const history: { x: number; y: number; z: number }[] = [];
      for (let j = 0; j < ptsPerStroke; j++) {
        history.push({ x: 0, y: 0, z: 0 });
      }
      strokes.push({
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
        life: 0,
        maxLife: 60,
        alpha: 0,
        active: false,
        mode: 'dissolve',
        history,
      });
    }

    strokeGeo.setAttribute('position', new THREE.BufferAttribute(strokePositions, 3));
    strokeGeo.setAttribute('color', new THREE.BufferAttribute(strokeColors, 3));

    const strokeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      linewidth: 1.5,
    });
    const strokeMesh = new THREE.LineSegments(strokeGeo, strokeMat);
    scene.add(strokeMesh);

    // Dynamic Streamline Color Crossfade
    const currentStreamColor = MODEL_STAGES[0].streamlineColor.clone();
    const targetStreamColor = MODEL_STAGES[0].streamlineColor.clone();

    // 5. State Machine Lifecycle
    let activeIndex = 0;
    let nextIndex = 1;
    let phase: 'hold' | 'disintegrate' | 'void' | 'reassemble' | 'settle' = 'hold';
    let phaseElapsed = 0;
    let clock = 0;

    const setModelOpacity = (model: THREE.Group | null, opacity: number) => {
      if (!model) return;
      model.visible = opacity > 0.001;
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          if (m.material) {
            if (Array.isArray(m.material)) {
              m.material.forEach((mat) => { mat.opacity = opacity; });
            } else {
              m.material.opacity = opacity;
            }
          }
        } else if ((child as THREE.LineSegments).isLineSegments) {
          const ls = child as THREE.LineSegments;
          if (ls.material && (ls.material as THREE.LineBasicMaterial).opacity !== undefined) {
            (ls.material as THREE.LineBasicMaterial).opacity = opacity * 0.85;
          }
        }
      });
    };

    // Spawn curved line strokes along sweep front from tail to nose
    const spawnDisintegrationStrokes = (frontProgress: number, flowType: string) => {
      const vertices = stageVertexClouds[activeIndex];
      const curModel = stageModels[activeIndex];
      if (!vertices || vertices.length === 0 || !curModel) return;

      const modelBox = new THREE.Box3().setFromObject(curModel);
      const sweepX = modelBox.max.x - frontProgress * (modelBox.max.x - modelBox.min.x + 0.5);
      const bandWidth = 0.5;

      let spawned = 0;
      for (let i = 0; i < strokes.length && spawned < 14; i++) {
        const s = strokes[i];
        if (!s.active) {
          const randVert = vertices[Math.floor(Math.random() * vertices.length)];
          const worldPos = randVert.clone().applyMatrix4(curModel.matrixWorld);

          if (Math.abs(worldPos.x - sweepX) < bandWidth) {
            s.active = true;
            s.mode = 'dissolve';
            s.x = worldPos.x;
            s.y = worldPos.y;
            s.z = worldPos.z;

            const flow = getStreamlineFlow(s.x, s.y, s.z, flowType, clock);
            s.vx = flow.vx + 0.02 + Math.random() * 0.03;
            s.alpha = 1.0;
            s.life = 0;
            s.maxLife = 45 + Math.random() * 20;

            for (let j = 0; j < ptsPerStroke; j++) {
              s.history[j].x = s.x - j * 0.08;
              s.history[j].y = s.y;
              s.history[j].z = s.z;
            }
            spawned++;
          }
        }
      }
    };

    // Spawn reassembly curved strokes converging from upstream
    const spawnReassemblyStrokes = (frontProgress: number, flowType: string) => {
      const vertices = stageVertexClouds[nextIndex];
      const nxtModel = stageModels[nextIndex];
      if (!vertices || vertices.length === 0 || !nxtModel) return;

      const modelBox = new THREE.Box3().setFromObject(nxtModel);
      const sweepX = modelBox.min.x + frontProgress * (modelBox.max.x - modelBox.min.x + 0.5);
      const bandWidth = 0.55;

      let spawned = 0;
      for (let i = 0; i < strokes.length && spawned < 16; i++) {
        const s = strokes[i];
        if (!s.active) {
          const randVert = vertices[Math.floor(Math.random() * vertices.length)];
          const worldPos = randVert.clone().applyMatrix4(nxtModel.matrixWorld);

          if (Math.abs(worldPos.x - sweepX) < bandWidth) {
            s.active = true;
            s.mode = 'assemble';
            s.targetX = worldPos.x;
            s.targetY = worldPos.y;
            s.targetZ = worldPos.z;

            s.x = worldPos.x - 1.6 - Math.random() * 1.2;
            s.y = worldPos.y + (Math.random() - 0.5) * 0.8;
            s.z = worldPos.z + (Math.random() - 0.5) * 0.8;

            const flow = getStreamlineFlow(s.x, s.y, s.z, flowType, clock);
            s.vx = flow.vx;
            s.alpha = 0.3;
            s.life = 0;
            s.maxLife = 40;

            for (let j = 0; j < ptsPerStroke; j++) {
              s.history[j].x = s.x - j * 0.08;
              s.history[j].y = s.y;
              s.history[j].z = s.z;
            }
            spawned++;
          }
        }
      }
    };

    // Animation Loop
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = 16 * TIMING_CONFIG.speedMultiplier;
      clock += 0.016;

      const isPaused = isHoveredRef.current && phase === 'hold';
      if (!isPaused) {
        phaseElapsed += dt;
      }

      currentStreamColor.lerp(targetStreamColor, 0.035);
      const currentFlow = MODEL_STAGES[activeIndex].flowCharacter;

      // State Machine Transitions
      if (phase === 'hold') {
        setModelOpacity(stageModels[activeIndex], 1.0);
        const curModel = stageModels[activeIndex];
        if (curModel) {
          curModel.position.y = (curModel.userData.basePosY || 0) + Math.sin(clock * 2.2) * 0.04;
          curModel.rotation.z = MODEL_STAGES[activeIndex].rotOffset.z + Math.sin(clock * 1.4) * 0.02;
        }

        if (phaseElapsed > TIMING_CONFIG.holdDuration) {
          phase = 'disintegrate';
          phaseElapsed = 0;
          setCurrentPhase('disintegrate');
        }
      } else if (phase === 'disintegrate') {
        const progress = Math.min(phaseElapsed / TIMING_CONFIG.disintegrateDuration, 1.0);
        spawnDisintegrationStrokes(progress, currentFlow);
        setModelOpacity(stageModels[activeIndex], Math.max(0, 1.0 - progress * 1.15));

        if (phaseElapsed > TIMING_CONFIG.disintegrateDuration) {
          setModelOpacity(stageModels[activeIndex], 0.0);
          phase = 'void';
          phaseElapsed = 0;
          setCurrentPhase('void');
          targetStreamColor.copy(MODEL_STAGES[nextIndex].streamlineColor);
        }
      } else if (phase === 'void') {
        if (phaseElapsed > TIMING_CONFIG.voidDuration) {
          phase = 'reassemble';
          phaseElapsed = 0;
          setCurrentPhase('reassemble');
          const nextModel = stageModels[nextIndex];
          if (nextModel) {
            nextModel.visible = true;
            const bScale = nextModel.userData.baseScale || 1.0;
            nextModel.scale.setScalar(bScale * 0.95);
          }
        }
      } else if (phase === 'reassemble') {
        const progress = Math.min(phaseElapsed / TIMING_CONFIG.reassembleDuration, 1.0);
        spawnReassemblyStrokes(progress, MODEL_STAGES[nextIndex].flowCharacter);

        if (progress > 0.72) {
          const modelFade = (progress - 0.72) / 0.28;
          setModelOpacity(stageModels[nextIndex], modelFade);
        }

        if (phaseElapsed > TIMING_CONFIG.reassembleDuration) {
          phase = 'settle';
          phaseElapsed = 0;
          setCurrentPhase('settle');
          activeIndex = nextIndex;
          nextIndex = (nextIndex + 1) % MODEL_STAGES.length;
          setCurrentStageIdx(activeIndex);
          if (onTelemetryChange) {
            onTelemetryChange(MODEL_STAGES[activeIndex].telemetry);
          }
        }
      } else if (phase === 'settle') {
        const progress = Math.min(phaseElapsed / TIMING_CONFIG.settleDuration, 1.0);
        const curModel = stageModels[activeIndex];
        if (curModel) {
          const bScale = curModel.userData.baseScale || 1.0;
          const s = 1.025 - progress * 0.025;
          curModel.scale.setScalar(bScale * s);
          setModelOpacity(curModel, 1.0);
        }

        if (phaseElapsed > TIMING_CONFIG.settleDuration) {
          phase = 'hold';
          phaseElapsed = 0;
          setCurrentPhase('hold');
        }
      }

      // Update System A: Continuous Ambient Airflow
      let aPtr = 0;
      const aPos = ambientGeo.attributes.position.array as Float32Array;
      const aCol = ambientGeo.attributes.color.array as Float32Array;

      for (let i = 0; i < ambientStreamCount; i++) {
        const s = ambientStreams[i];
        const flow = getStreamlineFlow(s.x, s.y, s.z, currentFlow, clock);

        s.x += s.speed;
        s.y += flow.vy;
        s.z += flow.vz;

        if (s.x > 5.5) {
          s.x = 0.55 + Math.random() * 0.35;
          s.y = (Math.random() - 0.5) * 2.6;
          s.z = (Math.random() - 0.5) * 2.2;
          for (let j = 0; j < ambientTrailPts; j++) {
            s.history[j].x = s.x;
            s.history[j].y = s.y;
            s.history[j].z = s.z;
          }
        }

        for (let j = ambientTrailPts - 1; j > 0; j--) {
          s.history[j].x = s.history[j - 1].x;
          s.history[j].y = s.history[j - 1].y;
          s.history[j].z = s.history[j - 1].z;
        }
        s.history[0].x = s.x;
        s.history[0].y = s.y;
        s.history[0].z = s.z;

        for (let j = 0; j < ambientTrailPts - 1; j++) {
          const p1 = s.history[j];
          const p2 = s.history[j + 1];
          const alpha = Math.max(0, 1.0 - j / ambientTrailPts) * 0.65;

          aPos[aPtr * 3] = p1.x;
          aPos[aPtr * 3 + 1] = p1.y;
          aPos[aPtr * 3 + 2] = p1.z;

          aCol[aPtr * 3] = currentStreamColor.r * alpha;
          aCol[aPtr * 3 + 1] = currentStreamColor.g * alpha;
          aCol[aPtr * 3 + 2] = currentStreamColor.b * alpha;
          aPtr++;

          aPos[aPtr * 3] = p2.x;
          aPos[aPtr * 3 + 1] = p2.y;
          aPos[aPtr * 3 + 2] = p2.z;

          aCol[aPtr * 3] = currentStreamColor.r * alpha * 0.4;
          aCol[aPtr * 3 + 1] = currentStreamColor.g * alpha * 0.4;
          aCol[aPtr * 3 + 2] = currentStreamColor.b * alpha * 0.4;
          aPtr++;
        }
      }

      ambientGeo.attributes.position.needsUpdate = true;
      ambientGeo.attributes.color.needsUpdate = true;

      // Update System B: Curved Airflow Line Strokes (No boxes, no filled sprites)
      let sPtr = 0;
      const sPos = strokeGeo.attributes.position.array as Float32Array;
      const sCol = strokeGeo.attributes.color.array as Float32Array;

      for (let i = 0; i < maxStrokes; i++) {
        const s = strokes[i];
        if (s.active) {
          s.life++;

          if (s.mode === 'dissolve') {
            const flow = getStreamlineFlow(s.x, s.y, s.z, currentFlow, clock);
            s.x += s.vx;
            s.y += flow.vy;
            s.z += flow.vz;
            s.alpha = Math.max(0, 1.0 - s.life / s.maxLife);
          } else {
            const flow = getStreamlineFlow(s.x, s.y, s.z, MODEL_STAGES[activeIndex].flowCharacter, clock);
            s.x += (s.targetX - s.x) * 0.12 + flow.vx * 0.1;
            s.y += (s.targetY - s.y) * 0.12 + flow.vy;
            s.z += (s.targetZ - s.z) * 0.12 + flow.vz;
            s.alpha = Math.min(1.0, s.life / 12);
            if (s.life > 28) {
              s.alpha = Math.max(0, (s.maxLife - s.life) / 12);
            }
          }

          // Shift history for curved line stroke
          for (let j = ptsPerStroke - 1; j > 0; j--) {
            s.history[j].x = s.history[j - 1].x;
            s.history[j].y = s.history[j - 1].y;
            s.history[j].z = s.history[j - 1].z;
          }
          s.history[0].x = s.x;
          s.history[0].y = s.y;
          s.history[0].z = s.z;

          if (s.life >= s.maxLife) {
            s.active = false;
            s.alpha = 0;
          }
        }

        // Render each active stroke as 3 short line segments
        for (let j = 0; j < segmentsPerStroke; j++) {
          const pt1 = s.history[j];
          const pt2 = s.history[j + 1];
          const segAlpha = s.active ? s.alpha * (1.0 - j * 0.25) : 0;

          sPos[sPtr * 3] = pt1.x;
          sPos[sPtr * 3 + 1] = pt1.y;
          sPos[sPtr * 3 + 2] = pt1.z;

          sCol[sPtr * 3] = currentStreamColor.r * segAlpha;
          sCol[sPtr * 3 + 1] = currentStreamColor.g * segAlpha;
          sCol[sPtr * 3 + 2] = currentStreamColor.b * segAlpha;
          sPtr++;

          sPos[sPtr * 3] = pt2.x;
          sPos[sPtr * 3 + 1] = pt2.y;
          sPos[sPtr * 3 + 2] = pt2.z;

          sCol[sPtr * 3] = currentStreamColor.r * segAlpha * 0.5;
          sCol[sPtr * 3 + 1] = currentStreamColor.g * segAlpha * 0.5;
          sCol[sPtr * 3 + 2] = currentStreamColor.b * segAlpha * 0.5;
          sPtr++;
        }
      }

      strokeGeo.attributes.position.needsUpdate = true;
      strokeGeo.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    triggerStageRef.current = (targetIdx: number) => {
      if (targetIdx === activeIndex) return;
      setModelOpacity(stageModels[activeIndex], 0);
      activeIndex = targetIdx;
      nextIndex = (targetIdx + 1) % MODEL_STAGES.length;
      phase = 'hold';
      phaseElapsed = 0;
      setCurrentPhase('hold');
      setCurrentStageIdx(activeIndex);
      setModelOpacity(stageModels[activeIndex], 1.0);
      targetStreamColor.copy(MODEL_STAGES[activeIndex].streamlineColor);
      currentStreamColor.copy(MODEL_STAGES[activeIndex].streamlineColor);
      if (onTelemetryChange) {
        onTelemetryChange(MODEL_STAGES[activeIndex].telemetry);
      }
    };

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const triggerStageRef = useRef<((idx: number) => void) | null>(null);
  const activeStage = MODEL_STAGES[currentStageIdx];

  return (
    <div
      className="hero-morph-sequence-wrapper"
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      onClick={onInteractiveClick}
      title="Interactive Flight Lineage — Loops 4 historical aircraft, pause on hover"
    >
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="hero-morph-canvas-container" />

      {/* Progress & Lineage Indicator Bar */}
      <div className="hero-morph-status-bar">
        <div className="morph-stage-pills-row">
          {MODEL_STAGES.map((st, i) => (
            <button
              key={st.id}
              type="button"
              className={`morph-stage-pill ${i === currentStageIdx ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (triggerStageRef.current) triggerStageRef.current(i);
              }}
              title={`Switch to ${st.name}`}
            >
              {i === currentStageIdx && <span className="morph-dot-pulse" />}
              <span className="pill-order">{st.order.split('/')[0].trim()}</span>
              <span className="pill-name">{st.name.split('(')[0].trim()}</span>
            </button>
          ))}
        </div>

        <div className="morph-flow-badge">
          <span className="morph-flow-lbl">FLOW:</span>
          <span className={`morph-flow-val flow-${activeStage.flowCharacter.toLowerCase()}`}>
            {activeStage.flowCharacter.toUpperCase()}
          </span>
        </div>

        {currentPhase === 'disintegrate' || currentPhase === 'reassemble' ? (
          <div className="morph-state-tag">TRANSITIONING...</div>
        ) : null}
      </div>
    </div>
  );
};
