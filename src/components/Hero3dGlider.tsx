import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hero3dGliderProps {
  onInteractiveClick?: () => void;
}

export const Hero3dGlider: React.FC<Hero3dGliderProps> = ({ onInteractiveClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 12);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight2.position.set(-15, -10, -10);
    scene.add(dirLight2);

    // 4. Build Detailed 3D High-Lift Glider / Jet Geometry with CFD Pressure Coloring
    const gliderGroup = new THREE.Group();

    // Helper: CFD rainbow colormap (0 = blue, 0.25 = cyan, 0.5 = green, 0.75 = yellow, 1.0 = red)
    const getCfdColor = (val: number) => {
      const v = THREE.MathUtils.clamp(val, 0, 1);
      const color = new THREE.Color();
      // Blue (0.66) -> Cyan (0.5) -> Green (0.33) -> Yellow (0.16) -> Red (0.0)
      const hue = (1.0 - v) * 0.66;
      color.setHSL(hue, 0.95, 0.5);
      return color;
    };

    // A. Fuselage (Smooth streamlined aerodynamic needle body)
    const fusePoints: THREE.Vector2[] = [];
    const fuseLength = 9.0;
    for (let i = 0; i <= 30; i++) {
      const t = i / 30; // 0 (nose) to 1 (tail)
      const z = -4.5 + t * fuseLength;
      // Nose radius starts small, expands to cabin, then tapers to sharp tail
      let radius = 0;
      if (t < 0.25) {
        radius = Math.sin((t / 0.25) * Math.PI * 0.5) * 0.48;
      } else if (t < 0.6) {
        radius = 0.48 - (t - 0.25) * 0.12;
      } else {
        radius = 0.43 * Math.pow(1 - (t - 0.6) / 0.4, 1.4);
      }
      fusePoints.push(new THREE.Vector2(radius, z));
    }
    const fuseGeo = new THREE.LatheGeometry(fusePoints, 32);
    // Apply vertex colors based on pressure (high stagnation pressure at nose, suction at canopy, recovery at tail)
    const fuseCount = fuseGeo.attributes.position.count;
    const fuseColors = new Float32Array(fuseCount * 3);
    const posAttr = fuseGeo.attributes.position;
    for (let i = 0; i < fuseCount; i++) {
      const z = posAttr.getZ(i);
      const y = posAttr.getY(i);
      // Normalized z from nose (-4.5) to tail (+4.5)
      const normZ = (z + 4.5) / 9.0;
      let pVal = 0.2;
      if (normZ < 0.12) {
        pVal = 0.85 + (0.12 - normZ) * 1.2; // Nose stagnation shock (Red / Yellow)
      } else if (normZ < 0.35) {
        pVal = y > 0 ? 0.05 : 0.4; // Canopy suction crest (Deep blue / cyan)
      } else {
        pVal = 0.3 + normZ * 0.3; // Tail recovery (Green)
      }
      const c = getCfdColor(pVal);
      fuseColors[i * 3] = c.r;
      fuseColors[i * 3 + 1] = c.g;
      fuseColors[i * 3 + 2] = c.b;
    }
    fuseGeo.setAttribute('color', new THREE.BufferAttribute(fuseColors, 3));
    const fuseMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.25,
      metalness: 0.2,
    });
    const fuselageMesh = new THREE.Mesh(fuseGeo, fuseMat);
    gliderGroup.add(fuselageMesh);

    // B. High-Aspect Ratio Swept Wings (Matching reference image glider!)
    const wingWidthSegments = 40;
    const wingLengthSegments = 16;
    const wingspan = 13.5;
    const rootChord = 1.35;
    const tipChord = 0.35;
    const sweep = 1.1;

    const wingGeo = new THREE.PlaneGeometry(wingspan, rootChord, wingWidthSegments, wingLengthSegments);
    const wingPositions = wingGeo.attributes.position;
    const wingColors = new Float32Array(wingPositions.count * 3);

    for (let i = 0; i < wingPositions.count; i++) {
      const x = wingPositions.getX(i);
      const chordY = wingPositions.getY(i); // Normalized across chord -rootChord/2 to rootChord/2
      const spanFrac = Math.abs(x) / (wingspan / 2); // 0 (root) to 1 (tip)

      // Sweep back and taper chord towards tip
      const currentChord = rootChord * (1 - spanFrac) + tipChord * spanFrac;
      const normalizedChordPos = (chordY + rootChord / 2) / rootChord; // 0 (leading) to 1 (trailing)
      const adjustedZ = -0.5 + spanFrac * sweep + normalizedChordPos * currentChord;
      
      // Camber profile (aerofoil thickness and camber lift)
      const camber = Math.sin(normalizedChordPos * Math.PI) * (0.16 * (1 - spanFrac * 0.5));
      // Slight wing dihedral (bent upwards towards tips)
      const dihedral = Math.pow(spanFrac, 1.8) * 0.55;

      wingPositions.setX(i, x);
      wingPositions.setY(i, camber + dihedral);
      wingPositions.setZ(i, adjustedZ);

      // CFD Colormap distribution across wing surface:
      // High suction (blue/cyan) on leading edge upper surface, transition (green/yellow) across mid-chord, stagnation at root
      let p = 0.2;
      if (normalizedChordPos < 0.25) {
        // Leading edge: high pressure stagnation on lower/leading, intense suction on upper
        p = 0.05 + spanFrac * 0.2; // Brilliant blue to cyan
      } else if (normalizedChordPos < 0.6) {
        // Mid chord transition zone
        p = 0.35 + Math.sin(spanFrac * Math.PI) * 0.35; // Green to bright yellow
      } else {
        // Trailing edge pressure recovery
        p = 0.65 + spanFrac * 0.3; // Yellow to red high pressure gradient
      }

      // Add colorful localized CFD pressure stripes matching reference image
      if (spanFrac > 0.2 && spanFrac < 0.7) {
        p = (p + Math.sin(spanFrac * 12 + normalizedChordPos * 6) * 0.25 + 1) % 1;
      }

      const c = getCfdColor(p);
      wingColors[i * 3] = c.r;
      wingColors[i * 3 + 1] = c.g;
      wingColors[i * 3 + 2] = c.b;
    }
    wingGeo.setAttribute('color', new THREE.BufferAttribute(wingColors, 3));
    wingGeo.computeVertexNormals();

    const wingMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.3,
      metalness: 0.15,
      side: THREE.DoubleSide,
    });
    const wingsMesh = new THREE.Mesh(wingGeo, wingMat);
    wingsMesh.position.set(0, 0.1, 0);
    gliderGroup.add(wingsMesh);

    // C. T-Tail Empennage (Vertical Fin + Horizontal Stabilizer)
    const finGeo = new THREE.BoxGeometry(0.08, 1.6, 0.9);
    finGeo.translate(0, 0.8, 3.8);
    const finMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
    const finMesh = new THREE.Mesh(finGeo, finMat);
    gliderGroup.add(finMesh);

    const stabGeo = new THREE.BoxGeometry(3.0, 0.06, 0.55);
    stabGeo.translate(0, 1.55, 3.9);
    const stabMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
    const stabMesh = new THREE.Mesh(stabGeo, stabMat);
    gliderGroup.add(stabMesh);

    // Initial glider orientation matching reference image (angled bank, nose pointing slightly left/up)
    gliderGroup.rotation.set(-0.25, -0.65, 0.45);
    gliderGroup.position.set(1.4, -0.2, 0);
    scene.add(gliderGroup);

    // 5. Dynamic Aerodynamic Streamlines with Wingtip Vortex Spirals (Specification 1.1, 3.3d, 6.5)
    const streamlineCount = 180;
    const trailLength = 22;
    const streamGeo = new THREE.BufferGeometry();
    const streamPositions = new Float32Array(streamlineCount * trailLength * 3);
    const streamColors = new Float32Array(streamlineCount * trailLength * 3);

    interface ParticleStream {
      headX: number;
      headY: number;
      headZ: number;
      speed: number;
      isVortex: boolean;
      vortexSide: number;
      vortexPhase: number;
      history: { x: number; y: number; z: number }[];
      baseColor: THREE.Color;
    }

    const streams: ParticleStream[] = [];
    const wingtipRightX = wingspan / 2;

    for (let i = 0; i < streamlineCount; i++) {
      const isVortex = i < 48; // Dedicated wingtip vortex particles
      const side = i % 2 === 0 ? 1 : -1;
      let startX = 0, startY = 0, startZ = 0;
      let baseCol = new THREE.Color();

      if (isVortex) {
        // Spawns near wingtips and curls outward/backward in vortex trails
        startX = side * (wingtipRightX - 0.2 + (Math.random() - 0.5) * 0.4);
        startY = 0.4 + (Math.random() - 0.5) * 0.3;
        startZ = 0.5 + Math.random() * 0.8;
        // Vortex core colors: cyan and neon blue
        baseCol.setHSL(0.52 + Math.random() * 0.1, 1.0, 0.65);
      } else {
        // Free stream air approaching glider
        startX = (Math.random() - 0.5) * 14.0;
        startY = (Math.random() - 0.5) * 4.0;
        startZ = -10.0 - Math.random() * 8.0;
        // CFD gradient color
        baseCol = getCfdColor(Math.random());
      }

      const history: { x: number; y: number; z: number }[] = [];
      for (let j = 0; j < trailLength; j++) {
        history.push({ x: startX, y: startY, z: startZ });
      }

      streams.push({
        headX: startX,
        headY: startY,
        headZ: startZ,
        speed: 0.12 + Math.random() * 0.14,
        isVortex,
        vortexSide: side,
        vortexPhase: Math.random() * Math.PI * 2,
        history,
        baseColor: baseCol,
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
    const streamlinesMesh = new THREE.LineSegments(streamGeo, streamMat);
    gliderGroup.add(streamlinesMesh);

    // 6. IntersectionObserver for Performance (Specification 11.1)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // 7. Interactive Mouse / Banking Physics
    let targetRotX = -0.25;
    let targetRotY = -0.65;
    let targetRotZ = 0.45;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotX = -0.25 + normY * 0.25;
      targetRotY = -0.65 + normX * 0.35;
      targetRotZ = 0.45 - normX * 0.2;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 8. Animation Loop
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      clock += 0.016;

      // Smooth banking towards target rotation with subtle flight oscillation
      gliderGroup.rotation.x += (targetRotX + Math.sin(clock * 1.5) * 0.02 - gliderGroup.rotation.x) * 0.06;
      gliderGroup.rotation.y += (targetRotY + Math.cos(clock * 1.2) * 0.02 - gliderGroup.rotation.y) * 0.06;
      gliderGroup.rotation.z += (targetRotZ + Math.sin(clock * 1.8) * 0.03 - gliderGroup.rotation.z) * 0.06;

      // Update streamlines
      let ptr = 0;
      const positions = streamGeo.attributes.position.array as Float32Array;
      const colors = streamGeo.attributes.color.array as Float32Array;

      for (let i = 0; i < streamlineCount; i++) {
        const s = streams[i];

        if (s.isVortex) {
          // Wingtip vortex spiral propagation
          s.vortexPhase += 0.16 * s.vortexSide;
          s.headZ += s.speed * 1.1;
          const distBehindTip = Math.max(s.headZ - 0.5, 0);
          const spiralRadius = 0.15 + distBehindTip * 0.18;
          s.headX = s.vortexSide * (wingtipRightX + Math.cos(s.vortexPhase) * spiralRadius);
          s.headY = 0.4 + Math.sin(s.vortexPhase) * spiralRadius;

          if (s.headZ > 12.0) {
            s.headZ = 0.5;
            s.vortexPhase = Math.random() * Math.PI * 2;
          }
        } else {
          // Approaching and flowing over body
          s.headZ += s.speed;
          // Gentle aerofoil deflection over wing
          if (s.headZ > -1.5 && s.headZ < 1.5) {
            s.headY += 0.02;
          } else if (s.headZ >= 1.5 && s.headZ < 3.0) {
            s.headY -= 0.015;
          }

          if (s.headZ > 12.0) {
            s.headZ = -12.0 - Math.random() * 4.0;
            s.headX = (Math.random() - 0.5) * 14.0;
            s.headY = (Math.random() - 0.5) * 3.5;
          }
        }

        // Shift history
        for (let j = trailLength - 1; j > 0; j--) {
          s.history[j].x = s.history[j - 1].x;
          s.history[j].y = s.history[j - 1].y;
          s.history[j].z = s.history[j - 1].z;
        }
        s.history[0].x = s.headX;
        s.history[0].y = s.headY;
        s.history[0].z = s.headZ;

        // Write line segments into buffer
        for (let j = 0; j < trailLength - 1; j++) {
          const p1 = s.history[j];
          const p2 = s.history[j + 1];
          const alpha = Math.max(0, 1.0 - j / trailLength);

          positions[ptr * 3] = p1.x;
          positions[ptr * 3 + 1] = p1.y;
          positions[ptr * 3 + 2] = p1.z;

          colors[ptr * 3] = s.baseColor.r * alpha;
          colors[ptr * 3 + 1] = s.baseColor.g * alpha;
          colors[ptr * 3 + 2] = s.baseColor.b * alpha;
          ptr++;

          positions[ptr * 3] = p2.x;
          positions[ptr * 3 + 1] = p2.y;
          positions[ptr * 3 + 2] = p2.z;

          colors[ptr * 3] = s.baseColor.r * alpha * 0.6;
          colors[ptr * 3 + 1] = s.baseColor.g * alpha * 0.6;
          colors[ptr * 3 + 2] = s.baseColor.b * alpha * 0.6;
          ptr++;
        }
      }

      streamGeo.attributes.position.needsUpdate = true;
      streamGeo.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

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
      observer.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-3d-glider-viewport"
      onClick={onInteractiveClick}
      title="Interactive CFD Glider — Drag to orbit, click to inspect in 3D"
    />
  );
};
