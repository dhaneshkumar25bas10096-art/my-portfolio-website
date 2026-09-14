import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface AeroFieldProps {
  mode?: 'assemble' | 'streamline' | 'vortex' | 'dissolve' | 'idle-drift';
  intensity?: number;
  colorRamp?: 'rainbow' | 'calm-blue' | 'high-stress';
  progress?: number;
  height?: string | number;
  className?: string;
  interactiveBank?: boolean;
}

export const AeroField: React.FC<AeroFieldProps> = ({
  mode = 'assemble',
  intensity = 1.0,
  colorRamp = 'rainbow',
  progress = 0,
  height = '100%',
  className = '',
  interactiveBank = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);
  const modeRef = useRef(mode);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 15, 60);
    camera.lookAt(0, 0, 0);

    // Color ramp definitions (Standard CFD Colormaps)
    const getCfdColor = (val: number, rampType: string) => {
      const v = THREE.MathUtils.clamp(val, 0, 1);
      const color = new THREE.Color();
      if (rampType === 'calm-blue') {
        // Deep blue to cyan to pale sky
        color.setHSL(0.55 + v * 0.15, 0.9, 0.45 + v * 0.3);
      } else if (rampType === 'high-stress') {
        // Yellow to orange to blazing red
        color.setHSL(0.15 - v * 0.15, 1.0, 0.5);
      } else {
        // Standard CFD Rainbow: Blue (0.66) -> Cyan (0.5) -> Green (0.33) -> Yellow (0.16) -> Red (0.0)
        const hue = (1.0 - v) * 0.66;
        color.setHSL(hue, 1.0, 0.5);
      }
      return color;
    };

    // Particle Count scaled by intensity
    const isMobile = window.innerWidth < 768;
    const baseCount = isMobile ? 1800 : 3800;
    const particleCount = Math.floor(baseCount * intensity);

    // Buffers for Particle System
    const initialPositions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const currentPositions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Generate Aerodynamic Glider / Jet Target Silhouette
    for (let i = 0; i < particleCount; i++) {
      // 1. Initial random ambient drifting cloud in wind tunnel
      const spreadX = (Math.random() - 0.5) * 90;
      const spreadY = (Math.random() - 0.5) * 50;
      const spreadZ = (Math.random() - 0.5) * 80;
      initialPositions[i * 3] = spreadX;
      initialPositions[i * 3 + 1] = spreadY;
      initialPositions[i * 3 + 2] = spreadZ;

      currentPositions[i * 3] = spreadX;
      currentPositions[i * 3 + 1] = spreadY;
      currentPositions[i * 3 + 2] = spreadZ;

      velocities[i * 3] = (Math.random() - 0.5) * 0.2;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      velocities[i * 3 + 2] = 0.5 + Math.random() * 0.8;

      // 2. Target Shape: Supersonic Waverider Glider with Delta Wings & Canards
      const r = Math.random();
      let tx = 0, ty = 0, tz = 0;
      let pressureVal = 0.1; // 0 to 1

      if (r < 0.25) {
        // Fuselage / Center Spine (Nose to Tail)
        const t = Math.random(); // 0 (nose) to 1 (tail)
        tz = -26 + t * 48;
        const widthAtZ = Math.sin(t * Math.PI) * 2.8;
        const angle = Math.random() * Math.PI * 2;
        tx = Math.cos(angle) * widthAtZ;
        ty = Math.sin(angle) * (widthAtZ * 0.6);
        pressureVal = (1.0 - t) * 0.95; // High pressure at nose stagnation point
      } else if (r < 0.7) {
        // Delta Wings (Swept-back lifting surfaces)
        const side = Math.random() < 0.5 ? 1 : -1;
        const wingSpanRatio = Math.random(); // 0 (root) to 1 (tip)
        const chordRatio = Math.random();
        const rootZ = -10 + wingSpanRatio * 30;
        const sweepZ = rootZ + chordRatio * (15 * (1 - wingSpanRatio));
        
        tx = side * (wingSpanRatio * 32);
        tz = sweepZ;
        // Camber & Anhedral / Dihedral curvature
        ty = -Math.sin(wingSpanRatio * Math.PI * 0.5) * 2.5 + Math.sin(chordRatio * Math.PI) * 0.8;
        
        // CFD Pressure Map across wing: leading edge suction + shock crest
        pressureVal = 0.2 + (1.0 - chordRatio) * 0.6 + (wingSpanRatio * 0.2);
      } else if (r < 0.88) {
        // Streamline Wind Tunnel Flow Curves surrounding body
        const sT = Math.random();
        const streamX = (Math.random() - 0.5) * 44;
        const streamY = (Math.random() - 0.5) * 16;
        tx = streamX;
        ty = streamY;
        tz = -35 + sT * 70;
        pressureVal = 0.15 + (Math.sin(sT * Math.PI) * 0.3);
      } else {
        // Wingtip Vortex Trails (Helical spirals off tip anchors)
        const side = Math.random() < 0.5 ? 1 : -1;
        const vT = Math.random(); // Distance behind wingtip
        const tipZ = 20 + vT * 30;
        const spiralRadius = 0.5 + vT * 3.5;
        const spiralAngle = vT * 22 * side;
        tx = side * 32 + Math.cos(spiralAngle) * spiralRadius;
        ty = Math.sin(spiralAngle) * spiralRadius;
        tz = tipZ;
        pressureVal = 0.85 - (vT * 0.5); // High vorticity core
      }

      targetPositions[i * 3] = tx;
      targetPositions[i * 3 + 1] = ty;
      targetPositions[i * 3 + 2] = tz;

      // Color based on CFD Pressure value
      const c = getCfdColor(pressureVal, colorRamp);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = 1.8 + Math.random() * 2.2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Particle Material
    // Create a circular blurred point texture programmatically for crisp WebGL rendering
    const createPointTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.25)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      map: createPointTexture(),
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Streamline Trailing Lines (Ribbons / Curves)
    const streamlineGroup = new THREE.Group();
    const streamlineCount = 14;
    for (let s = 0; s < streamlineCount; s++) {
      const side = (s % 2 === 0 ? 1 : -1) * (1 + Math.floor(s / 2) * 4);
      const points: THREE.Vector3[] = [];
      const curveLength = 30;
      for (let p = 0; p < curveLength; p++) {
        const pz = -30 + p * 2.5;
        // Curve around body
        const deflection = Math.exp(-Math.pow(pz / 12, 2)) * 3;
        const px = side + (side > 0 ? deflection : -deflection);
        const py = Math.sin(p * 0.2) * 1.2;
        points.push(new THREE.Vector3(px, py, pz));
      }
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.12, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x06b6d4),
        transparent: true,
        opacity: 0.35,
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      streamlineGroup.add(tubeMesh);
    }
    scene.add(streamlineGroup);

    // Mouse interactive bank
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactiveBank) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseRef.current.targetX = x * 0.4;
      mouseRef.current.targetY = y * 0.3;
    };

    if (interactiveBank) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse banking
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      pointCloud.rotation.z = -mouseRef.current.x * 0.5; // Bank angle
      pointCloud.rotation.x = mouseRef.current.y * 0.3 + 0.1; // Pitch angle
      pointCloud.rotation.y = mouseRef.current.x * 0.2;

      streamlineGroup.rotation.copy(pointCloud.rotation);

      const positions = geometry.attributes.position.array as Float32Array;
      const currentMode = modeRef.current;
      const scrubProgress = progressRef.current;

      // Update particles according to Mode & Progress
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;

        if (currentMode === 'assemble') {
          // Progress 0 = scattered ambient drift, Progress 1 = tightly assembled waverider
          // Auto-animate slightly if progress is 0
          const effectiveProgress = THREE.MathUtils.clamp(
            scrubProgress > 0 ? scrubProgress : 0.85 + Math.sin(elapsedTime * 0.8) * 0.1,
            0,
            1
          );

          // Interpolate between initial ambient position and target aircraft position
          const targetX = targetPositions[idx];
          const targetY = targetPositions[idx + 1];
          const targetZ = targetPositions[idx + 2];

          // High-speed aerodynamic flutter
          const flutter = Math.sin(elapsedTime * 8 + i) * 0.08;

          positions[idx] += (targetX - positions[idx]) * (0.04 * effectiveProgress) + flutter;
          positions[idx + 1] += (targetY - positions[idx + 1]) * (0.04 * effectiveProgress) + flutter;
          positions[idx + 2] += (targetZ - positions[idx + 2]) * (0.04 * effectiveProgress);
        } else if (currentMode === 'streamline' || currentMode === 'idle-drift') {
          // Flow field continuous forward motion (wind tunnel flow)
          positions[idx + 2] += velocities[idx + 2] * 0.6;
          // Wrap particles when exiting wind tunnel bounding box
          if (positions[idx + 2] > 45) {
            positions[idx + 2] = -45;
            positions[idx] = (Math.random() - 0.5) * 60;
            positions[idx + 1] = (Math.random() - 0.5) * 30;
          }
        } else if (currentMode === 'vortex') {
          // Vortex spiral rotation around Z axis
          const angle = elapsedTime * 2.5 + i * 0.01;
          const rad = 2 + Math.sin(elapsedTime + i) * 1.5;
          positions[idx] += Math.cos(angle) * (0.06 * rad);
          positions[idx + 1] += Math.sin(angle) * (0.06 * rad);
          positions[idx + 2] += 0.4;
          if (positions[idx + 2] > 40) positions[idx + 2] = -30;
        } else if (currentMode === 'dissolve') {
          // Disintegration outwards along vector paths
          positions[idx] += velocities[idx] * (1.5 + scrubProgress * 4);
          positions[idx + 1] += velocities[idx + 1] * (1.5 + scrubProgress * 4);
          positions[idx + 2] += velocities[idx + 2] * (2.0 + scrubProgress * 6);
        }
      }

      geometry.attributes.position.needsUpdate = true;

      // Streamline oscillation
      streamlineGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactiveBank) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [intensity, colorRamp, interactiveBank]);

  return (
    <div
      ref={containerRef}
      className={`aero-field-container ${className}`}
      style={{
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        position: 'relative',
        overflow: 'hidden',
        pointerEvents: interactiveBank ? 'auto' : 'none',
      }}
    />
  );
};
