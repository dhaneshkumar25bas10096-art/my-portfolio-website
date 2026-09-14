import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { X, Wind, Box, Grid, RotateCcw, Download, Sparkles, Activity, Layers } from 'lucide-react';
import type { AeroProject } from '../data/aerospaceData';
import { AEROSPACE_DATA } from '../data/aerospaceData';

interface AeroModelViewerProps {
  project: AeroProject | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectProject?: (proj: AeroProject) => void;
}

export const AeroModelViewer: React.FC<AeroModelViewerProps> = ({
  project,
  isOpen,
  onClose,
  onSelectProject,
}) => {
  const currentProject = project || AEROSPACE_DATA.projects[0];
  const mountRef = useRef<HTMLDivElement>(null);
  const [renderMode, setRenderMode] = useState<'aero' | 'solid' | 'wireframe'>('aero');
  const [autoRotate, setAutoRotate] = useState(true);
  const [streamlineActive, setStreamlineActive] = useState(true);

  const streamlineActiveRef = useRef(streamlineActive);
  useEffect(() => {
    streamlineActiveRef.current = streamlineActive;
  }, [streamlineActive]);

  const autoRotateRef = useRef(autoRotate);
  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    if (!isOpen) return;

    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Crisp light theme background

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(22, 14, 28);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup for Light Aerospace Studio
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(20, 35, 20);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x0284c7, 0.4);
    fillLight.position.set(-20, -10, -20);
    scene.add(fillLight);

    // Subtle Ground Grid
    const gridHelper = new THREE.GridHelper(50, 50, 0x0284c7, 0xe2e8f0);
    gridHelper.position.y = -6;
    scene.add(gridHelper);

    // 3. Build Aerodynamic 3D Aircraft Model based on project.modelType
    const aircraftGroup = new THREE.Group();

    // Helper: Create CFD Pressure-Gradient Vertex Colored Material
    const createCfdShaderMaterial = () => {
      return new THREE.ShaderMaterial({
        vertexShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          vec3 cfdTurbo(float t) {
            // Turbo / Jet colormap simulation
            float v = clamp(t, 0.0, 1.0);
            float r = clamp(1.5 - abs(v * 4.0 - 3.0), 0.0, 1.0);
            float g = clamp(1.5 - abs(v * 4.0 - 2.0), 0.0, 1.0);
            float b = clamp(1.5 - abs(v * 4.0 - 1.0), 0.0, 1.0);
            return vec3(r, g, b);
          }

          void main() {
            // Pressure simulation based on z coordinate & leading edge normal
            float forwardPressure = clamp(-vPosition.z * 0.08 + 0.5, 0.0, 1.0);
            float normalImpact = clamp(dot(vNormal, vec3(0.0, 0.0, -1.0)) * 0.5 + 0.5, 0.0, 1.0);
            float totalPressure = mix(forwardPressure, normalImpact, 0.5);

            vec3 baseColor = cfdTurbo(totalPressure);
            // Light diffuse shading
            vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
            float diff = max(dot(vNormal, lightDir), 0.25);
            
            gl_FragColor = vec4(baseColor * diff + vec3(0.15), 1.0);
          }
        `,
        side: THREE.DoubleSide,
      });
    };

    const solidMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.25,
      side: THREE.DoubleSide,
    });

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
    });

    const getMaterial = () => {
      if (renderMode === 'wireframe') return wireframeMaterial;
      if (renderMode === 'solid') return solidMaterial;
      return createCfdShaderMaterial();
    };

    const modelType = currentProject.modelType || 'waverider';

    if (modelType === 'waverider') {
      // Delta Waverider Geometry
      // 1. Fuselage
      const fuseGeo = new THREE.ConeGeometry(2.2, 18, 8);
      fuseGeo.rotateX(-Math.PI / 2);
      const fuseMesh = new THREE.Mesh(fuseGeo, getMaterial());
      fuseMesh.scale.set(1.1, 0.45, 1.0);
      aircraftGroup.add(fuseMesh);

      // 2. Anhedral Delta Wings
      const wingShape = new THREE.Shape();
      wingShape.moveTo(0, -9);
      wingShape.lineTo(13, 7);
      wingShape.lineTo(0, 5);
      wingShape.lineTo(-13, 7);
      wingShape.closePath();

      const extrudeSettings = { depth: 0.4, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 };
      const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
      wingGeo.rotateX(Math.PI / 2);
      const wingMesh = new THREE.Mesh(wingGeo, getMaterial());
      wingMesh.position.y = -0.3;
      aircraftGroup.add(wingMesh);

      // 3. Vertical Stabilizers (Twin Canted Fins)
      const finGeo = new THREE.BoxGeometry(0.2, 3.5, 4);
      const leftFin = new THREE.Mesh(finGeo, getMaterial());
      leftFin.position.set(7.5, 1.2, 5);
      leftFin.rotation.z = 0.35;
      aircraftGroup.add(leftFin);

      const rightFin = new THREE.Mesh(finGeo, getMaterial());
      rightFin.position.set(-7.5, 1.2, 5);
      rightFin.rotation.z = -0.35;
      aircraftGroup.add(rightFin);
    } else if (modelType === 'bwb') {
      // Blended Wing Body
      const bodyGeo = new THREE.CylinderGeometry(1.5, 6, 14, 16);
      bodyGeo.rotateX(Math.PI / 2);
      const bodyMesh = new THREE.Mesh(bodyGeo, getMaterial());
      bodyMesh.scale.set(2.4, 0.4, 1.0);
      aircraftGroup.add(bodyMesh);

      // Swept Outer Wings
      const wingGeo = new THREE.BoxGeometry(26, 0.35, 5);
      const wings = new THREE.Mesh(wingGeo, getMaterial());
      wings.position.set(0, 0, 1.5);
      aircraftGroup.add(wings);

      // Twin Top Engines
      const engGeo = new THREE.CylinderGeometry(0.9, 0.9, 4, 12);
      engGeo.rotateX(Math.PI / 2);
      const eng1 = new THREE.Mesh(engGeo, getMaterial());
      eng1.position.set(2.5, 1.2, 5);
      aircraftGroup.add(eng1);

      const eng2 = new THREE.Mesh(engGeo, getMaterial());
      eng2.position.set(-2.5, 1.2, 5);
      aircraftGroup.add(eng2);
    } else if (modelType === 'glider') {
      // High Aspect Ratio Glider
      // Fuselage pod
      const fuseGeo = new THREE.CapsuleGeometry(0.8, 14, 8, 16);
      fuseGeo.rotateX(Math.PI / 2);
      const fuse = new THREE.Mesh(fuseGeo, getMaterial());
      fuse.scale.set(0.7, 0.7, 1);
      aircraftGroup.add(fuse);

      // AR 32 Slender Wing
      const wingGeo = new THREE.BoxGeometry(32, 0.22, 1.8);
      const wing = new THREE.Mesh(wingGeo, getMaterial());
      wing.position.set(0, 0.4, -2);
      aircraftGroup.add(wing);

      // T-Tail
      const tailFinGeo = new THREE.BoxGeometry(0.2, 3.2, 1.5);
      const tailFin = new THREE.Mesh(tailFinGeo, getMaterial());
      tailFin.position.set(0, 1.6, 6.5);
      aircraftGroup.add(tailFin);

      const hTailGeo = new THREE.BoxGeometry(6, 0.15, 1.0);
      const hTail = new THREE.Mesh(hTailGeo, getMaterial());
      hTail.position.set(0, 3.2, 6.8);
      aircraftGroup.add(hTail);
    } else if (modelType === 'cfd_wing' || modelType === 'airfoil') {
      // 2. CFD Wing / Airfoil Section Study
      const airfoilShape = new THREE.Shape();
      airfoilShape.moveTo(-6, 0);
      airfoilShape.bezierCurveTo(-4, 2.4, 2, 1.8, 6, 0.1);
      airfoilShape.lineTo(6, -0.1);
      airfoilShape.bezierCurveTo(2, -0.6, -4, -1.0, -6, 0);

      const extrude = new THREE.ExtrudeGeometry(airfoilShape, { depth: 18, bevelEnabled: false });
      extrude.center();
      extrude.rotateY(Math.PI / 2);
      const foilMesh = new THREE.Mesh(extrude, getMaterial());
      aircraftGroup.add(foilMesh);
    } else if (modelType === 'turbofan') {
      // 3. Turbofan Engine CAD Assembly
      // Outer Nacelle Cowl
      const cowlGeo = new THREE.CylinderGeometry(5.2, 5.0, 14, 32, 1, true);
      cowlGeo.rotateX(Math.PI / 2);
      const cowlMesh = new THREE.Mesh(cowlGeo, getMaterial());
      aircraftGroup.add(cowlMesh);

      // Center Hub & Nose Spinner Cone
      const hubGeo = new THREE.CylinderGeometry(1.6, 1.6, 10, 24);
      hubGeo.rotateX(Math.PI / 2);
      const hubMesh = new THREE.Mesh(hubGeo, getMaterial());
      aircraftGroup.add(hubMesh);

      const spinnerGeo = new THREE.ConeGeometry(1.6, 4.0, 24);
      spinnerGeo.rotateX(-Math.PI / 2);
      const spinner = new THREE.Mesh(spinnerGeo, getMaterial());
      spinner.position.z = -5.0;
      aircraftGroup.add(spinner);

      // Fan Blades (16 swept blades)
      const bladeGeo = new THREE.BoxGeometry(0.18, 3.4, 1.2);
      for (let b = 0; b < 16; b++) {
        const angle = (b / 16) * Math.PI * 2;
        const blade = new THREE.Mesh(bladeGeo, getMaterial());
        blade.position.set(Math.cos(angle) * 2.8, Math.sin(angle) * 2.8, -3.2);
        blade.rotation.z = angle + 0.35;
        aircraftGroup.add(blade);
      }
    } else if (modelType === 'rover') {
      // 4. Autonomous Rover Chassis & Rocker-Bogie System
      // Main Chassis Body
      const chassisGeo = new THREE.BoxGeometry(7.0, 3.2, 9.0);
      const chassis = new THREE.Mesh(chassisGeo, getMaterial());
      chassis.position.y = 1.0;
      aircraftGroup.add(chassis);

      // Camera Mast
      const mastGeo = new THREE.CylinderGeometry(0.25, 0.25, 4.5, 12);
      const mast = new THREE.Mesh(mastGeo, getMaterial());
      mast.position.set(2.0, 4.0, -2.5);
      aircraftGroup.add(mast);

      const camHeadGeo = new THREE.BoxGeometry(1.8, 1.0, 1.2);
      const camHead = new THREE.Mesh(camHeadGeo, getMaterial());
      camHead.position.set(2.0, 6.2, -2.5);
      aircraftGroup.add(camHead);

      // 6 Wheels
      const wheelGeo = new THREE.CylinderGeometry(1.4, 1.4, 1.0, 16);
      wheelGeo.rotateZ(Math.PI / 2);
      const wheelOffsets = [
        [-4.5, -0.6, -3.5], [4.5, -0.6, -3.5],
        [-4.8, -0.6, 0.0],  [4.8, -0.6, 0.0],
        [-4.5, -0.6, 3.5],  [4.5, -0.6, 3.5],
      ];
      wheelOffsets.forEach(([wx, wy, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, getMaterial());
        wheel.position.set(wx, wy, wz);
        aircraftGroup.add(wheel);
      });
    } else if (modelType === 'satellite') {
      // 5. 3U CubeSat Spacecraft Structure
      // 3U Main Bus
      const busGeo = new THREE.BoxGeometry(3.6, 3.6, 11.0);
      const bus = new THREE.Mesh(busGeo, getMaterial());
      aircraftGroup.add(bus);

      // Deployable Solar Wings
      const panelGeo = new THREE.BoxGeometry(9.0, 0.15, 8.5);
      const leftPanel = new THREE.Mesh(panelGeo, getMaterial());
      leftPanel.position.set(-6.5, 0, 0);
      aircraftGroup.add(leftPanel);

      const rightPanel = new THREE.Mesh(panelGeo, getMaterial());
      rightPanel.position.set(6.5, 0, 0);
      aircraftGroup.add(rightPanel);

      // Communications Dish Antenna
      const dishGeo = new THREE.SphereGeometry(1.6, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      dishGeo.rotateX(-Math.PI / 2);
      const dish = new THREE.Mesh(dishGeo, getMaterial());
      dish.position.set(0, 0, -6.5);
      aircraftGroup.add(dish);
    } else {
      // Fallback: Glider / General Aircraft
      const fuseGeo = new THREE.CapsuleGeometry(1.0, 12, 8, 16);
      fuseGeo.rotateX(Math.PI / 2);
      const fuse = new THREE.Mesh(fuseGeo, getMaterial());
      aircraftGroup.add(fuse);

      const wingGeo = new THREE.BoxGeometry(24, 0.25, 2.5);
      const wing = new THREE.Mesh(wingGeo, getMaterial());
      wing.position.set(0, 0.3, -1);
      aircraftGroup.add(wing);
    }

    scene.add(aircraftGroup);

    // 4. Line-Based Real-time CFD Wind Tunnel Streamlines in Viewer
    const streamlineCount = 140;
    const trailLength = 12;
    const streamGeo = new THREE.BufferGeometry();
    const streamPositions = new Float32Array(streamlineCount * trailLength * 3);
    const streamColors = new Float32Array(streamlineCount * trailLength * 3);

    // CFD Rainbow colormap helper
    const getCfdColor = (val: number) => {
      const v = THREE.MathUtils.clamp(val, 0, 1);
      const color = new THREE.Color();
      // Blue (0.66) -> Cyan (0.5) -> Green (0.33) -> Yellow (0.16) -> Red (0.0)
      const hue = (1.0 - v) * 0.66;
      color.setHSL(hue, 1.0, 0.5);
      return color;
    };

    interface ViewerStreamline {
      x: number;
      y: number;
      z: number;
      speed: number;
      baseColor: THREE.Color;
      history: { x: number; y: number; z: number }[];
    }

    const streamlines: ViewerStreamline[] = [];
    for (let i = 0; i < streamlineCount; i++) {
      const startX = (Math.random() - 0.5) * 28;
      const startY = (Math.random() - 0.5) * 12;
      const startZ = -26 + Math.random() * 52;
      const pressureProxy = Math.random();
      const baseCol = getCfdColor(pressureProxy);

      const history: { x: number; y: number; z: number }[] = [];
      for (let j = 0; j < trailLength; j++) {
        history.push({ x: startX, y: startY, z: startZ });
      }

      streamlines.push({
        x: startX,
        y: startY,
        z: startZ,
        speed: 0.7 + Math.random() * 0.5,
        baseColor: baseCol,
        history,
      });
    }

    streamGeo.setAttribute('position', new THREE.BufferAttribute(streamPositions, 3));
    streamGeo.setAttribute('color', new THREE.BufferAttribute(streamColors, 3));

    const streamMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      linewidth: 1.5,
    });

    const streamLinesMesh = new THREE.LineSegments(streamGeo, streamMat);
    scene.add(streamLinesMesh);

    // 5. Orbit & Mouse Drag Controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      aircraftGroup.rotation.y += deltaX * 0.01;
      aircraftGroup.rotation.x += deltaY * 0.01;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.03;
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, 14, 65);
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 6. Render Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const render = () => {
      animationFrameId = requestAnimationFrame(render);
      const delta = clock.getDelta();

      if (autoRotateRef.current && !isDragging) {
        aircraftGroup.rotation.y += delta * 0.4;
      }

      // Wind tunnel line-based flow animation - strictly respects streamlineActive toggle
      streamLinesMesh.visible = streamlineActiveRef.current;

      if (streamlineActiveRef.current) {
        let ptr = 0;
        const posArray = streamGeo.attributes.position.array as Float32Array;
        const colArray = streamGeo.attributes.color.array as Float32Array;

        for (let i = 0; i < streamlineCount; i++) {
          const s = streamlines[i];
          s.z += s.speed;

          // Gentle deflection over model
          if (s.z > -6 && s.z < 6) {
            s.y += (Math.random() - 0.5) * 0.02;
          }

          if (s.z > 26) {
            s.z = -26;
            s.x = (Math.random() - 0.5) * 28;
            s.y = (Math.random() - 0.5) * 12;
            for (let j = 0; j < trailLength; j++) {
              s.history[j].x = s.x;
              s.history[j].y = s.y;
              s.history[j].z = s.z;
            }
          }

          // Shift history
          for (let j = trailLength - 1; j > 0; j--) {
            s.history[j].x = s.history[j - 1].x;
            s.history[j].y = s.history[j - 1].y;
            s.history[j].z = s.history[j - 1].z;
          }
          s.history[0].x = s.x;
          s.history[0].y = s.y;
          s.history[0].z = s.z;

          // Write line segments into buffer
          for (let j = 0; j < trailLength - 1; j++) {
            const p1 = s.history[j];
            const p2 = s.history[j + 1];
            const alpha = Math.max(0, 1.0 - j / trailLength);

            posArray[ptr * 3] = p1.x;
            posArray[ptr * 3 + 1] = p1.y;
            posArray[ptr * 3 + 2] = p1.z;

            colArray[ptr * 3] = s.baseColor.r * alpha;
            colArray[ptr * 3 + 1] = s.baseColor.g * alpha;
            colArray[ptr * 3 + 2] = s.baseColor.b * alpha;
            ptr++;

            posArray[ptr * 3] = p2.x;
            posArray[ptr * 3 + 1] = p2.y;
            posArray[ptr * 3 + 2] = p2.z;

            colArray[ptr * 3] = s.baseColor.r * alpha * 0.6;
            colArray[ptr * 3 + 1] = s.baseColor.g * alpha * 0.6;
            colArray[ptr * 3 + 2] = s.baseColor.b * alpha * 0.6;
            ptr++;
          }
        }

        streamGeo.attributes.position.needsUpdate = true;
        streamGeo.attributes.color.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    render();

    // Resize Handler
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
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [isOpen, currentProject, renderMode]);

  if (!isOpen) return null;

  return (
    <div className="aero-modal-backdrop" onClick={onClose}>
      <div className="aero-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Modal Navigation Header */}
        <div className="aero-modal-header">
          <div className="header-left">
            <div className="header-badge">
              <Box size={16} color="#0284c7" />
              <span>INTERACTIVE 3D AERODYNAMICS LAB</span>
            </div>
            <h3 className="modal-aircraft-title">{currentProject.title}</h3>
          </div>

          <div className="header-actions">
            {/* View Mode Switcher */}
            <div className="render-mode-group">
              <button
                type="button"
                className={`mode-btn ${renderMode === 'aero' ? 'active' : ''}`}
                onClick={() => setRenderMode('aero')}
                title="CFD Pressure Gradient Surface"
              >
                <Wind size={14} /> Aero CFD View
              </button>
              <button
                type="button"
                className={`mode-btn ${renderMode === 'solid' ? 'active' : ''}`}
                onClick={() => setRenderMode('solid')}
                title="Aerospace Composite Solid"
              >
                <Layers size={14} /> Solid
              </button>
              <button
                type="button"
                className={`mode-btn ${renderMode === 'wireframe' ? 'active' : ''}`}
                onClick={() => setRenderMode('wireframe')}
                title="Finite Element Mesh Wireframe"
              >
                <Grid size={14} /> Mesh Wireframe
              </button>
            </div>

            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close 3D Viewer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Main Body Grid */}
        <div className="aero-modal-body">
          {/* 3D WebGL Canvas Stage */}
          <div className="modal-canvas-column">
            <div ref={mountRef} className="webgl-mount-stage" />

            {/* Floating 3D Camera Controls */}
            <div className="canvas-hud-toolbar">
              <button
                type="button"
                className={`hud-tool-btn ${autoRotate ? 'active' : ''}`}
                onClick={() => setAutoRotate(!autoRotate)}
                title="Toggle Auto Orbit"
              >
                <RotateCcw size={15} />
                <span>{autoRotate ? 'Auto-Orbit: ON' : 'Auto-Orbit: PAUSED'}</span>
              </button>

              <button
                type="button"
                className={`hud-tool-btn ${streamlineActive ? 'active' : ''}`}
                onClick={() => setStreamlineActive(!streamlineActive)}
                title="Toggle Wind Tunnel Streamlines"
              >
                <Wind size={15} />
                <span>{streamlineActive ? 'Tunnel Streamlines: ON' : 'Streamlines: OFF'}</span>
              </button>

              <div className="hud-instructions">
                <span>Left Click + Drag to Rotate // Scroll to Zoom</span>
              </div>
            </div>

            {/* Model Selector Strip */}
            <div className="modal-model-strip">
              <span className="strip-title">SELECT AERO MODEL:</span>
              <div className="strip-buttons">
                {AEROSPACE_DATA.projects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`model-strip-tab ${p.id === currentProject.id ? 'active' : ''}`}
                    onClick={() => onSelectProject && onSelectProject(p)}
                  >
                    {p.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Engineering Telemetry & CFD Specs Panel */}
          <div className="modal-telemetry-column">
            <div className="telemetry-panel aero-card">
              <div className="panel-section">
                <span className="telemetry-tag">
                  <Activity size={12} /> Flight Envelope Specifications
                </span>
                <p className="project-description-text">{currentProject.description}</p>
              </div>

              {/* Engineering Specs Grid */}
              <div className="aero-specs-table">
                <div className="spec-row">
                  <span className="spec-name">WINGSPAN (b):</span>
                  <span className="spec-val">{currentProject.specs.wingspan}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">ASPECT RATIO (AR):</span>
                  <span className="spec-val">{currentProject.specs.aspectRatio}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">DESIGN VELOCITY:</span>
                  <span className="spec-val cfd-text-gradient">{currentProject.specs.maxMach}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">LIFT-TO-DRAG (L/D):</span>
                  <span className="spec-val">{currentProject.specs.liftToDrag}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">REYNOLDS NUMBER (Re):</span>
                  <span className="spec-val">{currentProject.specs.reynoldsNum}</span>
                </div>
                <div className="spec-row">
                  <span className="spec-name">STRUCTURAL MASS:</span>
                  <span className="spec-val">{currentProject.specs.mass}</span>
                </div>
              </div>

              {/* CFD Solver Data */}
              <div className="cfd-solver-summary">
                <h4 className="solver-title">
                  <Sparkles size={14} color="#0284c7" /> COMPUTATIONAL FLOW ANALYSIS
                </h4>
                <div className="solver-item">
                  <span className="k">SOLVER:</span>
                  <span className="v">{currentProject.cfdDetails.solver}</span>
                </div>
                <div className="solver-item">
                  <span className="k">MESH DENSITY:</span>
                  <span className="v">{currentProject.cfdDetails.meshCells}</span>
                </div>
                <div className="solver-item">
                  <span className="k">TURBULENCE:</span>
                  <span className="v">{currentProject.cfdDetails.turbulenceModel}</span>
                </div>
                <div className="solver-item">
                  <span className="k">PRESSURE PEAK:</span>
                  <span className="v">{currentProject.pressurePeak}</span>
                </div>
                <div className="solver-finding-box">
                  <strong>Key Finding:</strong> {currentProject.cfdDetails.keyFinding}
                </div>
              </div>

              {/* Tags & Action */}
              <div className="modal-footer-actions">
                <div className="modal-tags">
                  {currentProject.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="spec-badge">
                      #{tag}
                    </span>
                  ))}
                </div>

                <a
                  href="#contact"
                  onClick={onClose}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
                >
                  <Download size={15} /> Request Full CFD Report & CAD File
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
