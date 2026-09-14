import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { EvolutionStage } from '../data/aerospaceData';

interface EvolutionStageViewerProps {
  stage: EvolutionStage;
  isActive: boolean;
}

export const EvolutionStageViewer: React.FC<EvolutionStageViewerProps> = ({ stage, isActive: _isActive }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const width = container.clientWidth || 340;
    const height = container.clientHeight || 260;

    // 1. Three.js Scene Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.2, 5.8);
    camera.lookAt(0, 0, 0);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 10, 8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    rimLight.position.set(-6, -4, -5);
    scene.add(rimLight);

    // Model group & transition particle system
    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    let loadedModel: THREE.Object3D | null = null;
    let particleMesh: THREE.Points | null = null;
    let transitionProgress = 0; // 0 = fully particles, 1 = fully solid mesh
    let isAssembling = true;

    // 2. Load 3D Model if path exists
    if (stage.modelPath) {
      setLoading(true);
      const loader = new GLTFLoader();
      loader.load(
        stage.modelPath,
        (gltf) => {
          loadedModel = gltf.scene;

          // Normalize model scale and center
          const box = new THREE.Box3().setFromObject(loadedModel);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          loadedModel.position.x -= center.x;
          loadedModel.position.y -= center.y;
          loadedModel.position.z -= center.z;

          const maxDim = Math.max(size.x, size.y, size.z);
          const targetScale = (stage.modelScale || 1.0) * (3.4 / (maxDim || 1));
          loadedModel.scale.set(targetScale, targetScale, targetScale);

          if (stage.modelRotY) {
            loadedModel.rotation.y = stage.modelRotY;
          }

          // Enhance materials
          loadedModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const m = child as THREE.Mesh;
              m.castShadow = true;
              m.receiveShadow = true;
              if (m.material) {
                if (Array.isArray(m.material)) {
                  m.material.forEach((mat) => {
                    mat.transparent = true;
                    mat.opacity = 0; // Starts transparent for particle assembly
                  });
                } else {
                  m.material.transparent = true;
                  m.material.opacity = 0;
                }
              }
            }
          });

          stageGroup.add(loadedModel);

          // 3. Create Assembly/Disassembly Particle Cloud from Mesh Vertices
          const sampledVertices: THREE.Vector3[] = [];
          loadedModel.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const geo = (child as THREE.Mesh).geometry;
              if (geo && geo.attributes.position) {
                const pos = geo.attributes.position;
                const step = Math.max(1, Math.floor(pos.count / 300));
                for (let k = 0; k < pos.count; k += step) {
                  const v = new THREE.Vector3(pos.getX(k), pos.getY(k), pos.getZ(k));
                  v.applyMatrix4(child.matrixWorld);
                  sampledVertices.push(v);
                }
              }
            }
          });

          // Fallback if vertices too few
          while (sampledVertices.length < 400) {
            sampledVertices.push(
              new THREE.Vector3(
                (Math.random() - 0.5) * 2.8,
                (Math.random() - 0.5) * 1.5,
                (Math.random() - 0.5) * 2.5
              )
            );
          }

          const pCount = Math.min(sampledVertices.length, 800);
          const pGeo = new THREE.BufferGeometry();
          const targetCoords = new Float32Array(pCount * 3);
          const currentCoords = new Float32Array(pCount * 3);
          const pColors = new Float32Array(pCount * 3);

          for (let i = 0; i < pCount; i++) {
            const v = sampledVertices[i % sampledVertices.length];
            targetCoords[i * 3] = v.x;
            targetCoords[i * 3 + 1] = v.y;
            targetCoords[i * 3 + 2] = v.z;

            // Scattered explosion origin
            currentCoords[i * 3] = v.x + (Math.random() - 0.5) * 6.0;
            currentCoords[i * 3 + 1] = v.y + (Math.random() - 0.5) * 5.0;
            currentCoords[i * 3 + 2] = v.z + (Math.random() - 0.5) * 6.0;

            // Color based on stage flow
            if (stage.flowType === 'laminar') {
              pColors[i * 3] = 0.2;
              pColors[i * 3 + 1] = 0.8;
              pColors[i * 3 + 2] = 1.0;
            } else if (stage.flowType === 'rough') {
              pColors[i * 3] = 0.95;
              pColors[i * 3 + 1] = 0.85;
              pColors[i * 3 + 2] = 0.5;
            } else {
              pColors[i * 3] = 0.5;
              pColors[i * 3 + 1] = 0.75;
              pColors[i * 3 + 2] = 1.0;
            }
          }

          pGeo.setAttribute('position', new THREE.BufferAttribute(currentCoords, 3));
          pGeo.setAttribute('targetPos', new THREE.BufferAttribute(targetCoords, 3));
          pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

          const pMat = new THREE.PointsMaterial({
            size: 0.07,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
          });

          particleMesh = new THREE.Points(pGeo, pMat);
          stageGroup.add(particleMesh);
          setLoading(false);
        },
        undefined,
        (err) => {
          console.warn('Could not load 3D model for stage:', stage.id, err);
          setLoading(false);
        }
      );
    } else {
      // da Vinci era: Leonardo sketch wings representation
      setLoading(false);
      const sketchGeo = new THREE.TorusGeometry(1.4, 0.08, 12, 48, Math.PI);
      const sketchMat = new THREE.MeshStandardMaterial({
        color: 0xd97706,
        wireframe: true,
        roughness: 0.4,
      });
      const sketchMesh = new THREE.Mesh(sketchGeo, sketchMat);
      sketchMesh.rotation.x = Math.PI / 2;
      stageGroup.add(sketchMesh);
    }

    // 4. Dynamic Aerodynamic Particle Flow Field (Spec 3.3a - 3.3d)
    const streamCount = stage.flowType === 'laminar' ? 120 : 80;
    const trailLen = 14;
    const flowGeo = new THREE.BufferGeometry();
    const flowPositions = new Float32Array(streamCount * trailLen * 3);
    const flowColors = new Float32Array(streamCount * trailLen * 3);

    interface FlowParticle {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      history: { x: number; y: number; z: number }[];
      color: THREE.Color;
      isHero?: boolean;
    }

    const flowParticles: FlowParticle[] = [];
    for (let i = 0; i < streamCount; i++) {
      const isHero = stage.flowType === 'laminar' && i < 4; // Hero streamline for drone
      const startX = (Math.random() - 0.5) * 3.5;
      const startY = (Math.random() - 0.5) * 2.2;
      const startZ = -3.5 - Math.random() * 2.0;

      const pColor = new THREE.Color();
      if (stage.flowType === 'turbulent') {
        pColor.setRGB(0.7, 0.86, 1.0); // Soft blue-white
      } else if (stage.flowType === 'chaotic') {
        pColor.setRGB(1.0, 0.82, 0.55); // Warm amber
      } else if (stage.flowType === 'rough') {
        pColor.setRGB(1.0, 0.92, 0.65); // Warm yellow-white
      } else {
        // Laminar cyan-blue
        if (isHero) {
          pColor.setRGB(0.1, 0.9, 1.0); // Ultra vibrant cyan
        } else {
          pColor.setRGB(0.5, 0.85, 1.0);
        }
      }

      const history: { x: number; y: number; z: number }[] = [];
      for (let j = 0; j < trailLen; j++) {
        history.push({ x: startX, y: startY, z: startZ });
      }

      flowParticles.push({
        x: startX,
        y: startY,
        z: startZ,
        vx: 0,
        vy: 0,
        vz: stage.flowType === 'rough' ? 0.12 : 0.08,
        history,
        color: pColor,
        isHero,
      });
    }

    flowGeo.setAttribute('position', new THREE.BufferAttribute(flowPositions, 3));
    flowGeo.setAttribute('color', new THREE.BufferAttribute(flowColors, 3));

    const flowMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: stage.flowType === 'laminar' ? 0.95 : 0.75,
      blending: THREE.AdditiveBlending,
    });
    const flowMesh = new THREE.LineSegments(flowGeo, flowMat);
    scene.add(flowMesh);

    // 5. IntersectionObserver (Spec 3.4)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(container);

    // 6. Interactive Orbit on Drag
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
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      stageGroup.rotation.y += dx * 0.012;
      stageGroup.rotation.x += dy * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 7. Animation Loop
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      clock += 0.016;

      // Auto-rotation when not dragging
      if (!isDragging) {
        stageGroup.rotation.y += 0.008;
      }

      // Particle Assembly / Disappearance Transition (Spec 6.3 / prompt request)
      if (particleMesh && loadedModel) {
        if (isAssembling) {
          transitionProgress = Math.min(transitionProgress + 0.02, 1.0);
        }

        const curPos = particleMesh.geometry.attributes.position.array as Float32Array;
        const tgtPos = (particleMesh.geometry.attributes.targetPos.array as Float32Array);
        const pLen = curPos.length / 3;

        for (let i = 0; i < pLen; i++) {
          const idx = i * 3;
          // Converge towards actual mesh coordinates
          curPos[idx] += (tgtPos[idx] - curPos[idx]) * 0.08;
          curPos[idx + 1] += (tgtPos[idx + 1] - curPos[idx + 1]) * 0.08;
          curPos[idx + 2] += (tgtPos[idx + 2] - curPos[idx + 2]) * 0.08;
        }
        particleMesh.geometry.attributes.position.needsUpdate = true;

        // Crossfade model material opacity
        const matOpacity = transitionProgress;
        loadedModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            if (m.material) {
              if (Array.isArray(m.material)) {
                m.material.forEach((mat) => {
                  mat.opacity = matOpacity;
                });
              } else {
                m.material.opacity = matOpacity;
              }
            }
          }
        });

        // Fade out particle mesh as solid model materializes
        (particleMesh.material as THREE.PointsMaterial).opacity = Math.max(0, 1.0 - transitionProgress);
      }

      // Update Aerodynamic Streamlines based on stage flow personality
      let linePtr = 0;
      const posArray = flowGeo.attributes.position.array as Float32Array;
      const colArray = flowGeo.attributes.color.array as Float32Array;

      for (let i = 0; i < streamCount; i++) {
        const p = flowParticles[i];

        if (stage.flowType === 'turbulent') {
          // 3.3a Bird: organic curl-noise, wingbeat amplitude
          p.z += 0.09;
          p.x += Math.sin(clock * 3.5 + p.z * 1.5) * 0.035;
          p.y += Math.cos(clock * 4.0 + p.z * 1.2) * 0.04;
        } else if (stage.flowType === 'chaotic') {
          // 3.3b da Vinci: sharp direction changes, some reverse
          p.z += Math.sin(clock * 2.0 + i) > -0.2 ? 0.08 : -0.04;
          p.x += (Math.random() - 0.5) * 0.05;
          p.y += (Math.random() - 0.5) * 0.05;
        } else if (stage.flowType === 'rough') {
          // 3.3c Wright Flyer: mostly directional with bumpy strut vibration
          p.z += 0.12;
          p.y += Math.sin(p.z * 6.0) * 0.02;
          p.x += Math.cos(p.z * 4.0) * 0.015;
        } else {
          // 3.3d Modern Drone: laminar parallel streamlines with hero streamline
          p.z += p.isHero ? 0.16 : 0.11;
          if (p.isHero) {
            // Arcs directly over wing / fuselage
            p.y = 0.35 + Math.sin((p.z + 2.0) * 0.8) * 0.25;
            p.x = 0;
          } else {
            p.y += Math.sin(p.z * 1.5) * 0.005;
          }
        }

        // Reset particle when past camera
        if (p.z > 3.5) {
          p.z = -3.5 - Math.random() * 2.0;
          p.x = (Math.random() - 0.5) * 3.5;
          p.y = (Math.random() - 0.5) * 2.2;
          for (let j = 0; j < trailLen; j++) {
            p.history[j].x = p.x;
            p.history[j].y = p.y;
            p.history[j].z = p.z;
          }
        }

        // Shift history
        for (let j = trailLen - 1; j > 0; j--) {
          p.history[j].x = p.history[j - 1].x;
          p.history[j].y = p.history[j - 1].y;
          p.history[j].z = p.history[j - 1].z;
        }
        p.history[0].x = p.x;
        p.history[0].y = p.y;
        p.history[0].z = p.z;

        // Render line segments
        for (let j = 0; j < trailLen - 1; j++) {
          const pt1 = p.history[j];
          const pt2 = p.history[j + 1];
          const alpha = Math.max(0, 1.0 - j / trailLen);

          posArray[linePtr * 3] = pt1.x;
          posArray[linePtr * 3 + 1] = pt1.y;
          posArray[linePtr * 3 + 2] = pt1.z;

          colArray[linePtr * 3] = p.color.r * alpha;
          colArray[linePtr * 3 + 1] = p.color.g * alpha;
          colArray[linePtr * 3 + 2] = p.color.b * alpha;
          linePtr++;

          posArray[linePtr * 3] = pt2.x;
          posArray[linePtr * 3 + 1] = pt2.y;
          posArray[linePtr * 3 + 2] = pt2.z;

          colArray[linePtr * 3] = p.color.r * alpha * 0.5;
          colArray[linePtr * 3 + 1] = p.color.g * alpha * 0.5;
          colArray[linePtr * 3 + 2] = p.color.b * alpha * 0.5;
          linePtr++;
        }
      }

      flowGeo.attributes.position.needsUpdate = true;
      flowGeo.attributes.color.needsUpdate = true;

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
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [stage]);

  return (
    <div className={`stage-3d-wrapper ${stage.flowType === 'laminar' ? 'laminar-card-glow' : ''}`}>
      {loading && (
        <div className="stage-model-loading">
          <span className="loading-spinner" />
          <span className="loading-text">Assembling 3D Aerodynamics...</span>
        </div>
      )}
      <div ref={containerRef} className="stage-canvas-container" />
      <div className="stage-3d-hint">
        <span>Click & drag to inspect aerodynamics</span>
      </div>
    </div>
  );
};
