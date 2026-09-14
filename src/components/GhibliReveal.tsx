import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const GhibliReveal: React.FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [hasInteracted, setHasInteracted] = useState(false);

  // Position and radius refs for smooth 60fps lerp and edge-peel particles
  const mousePos = useRef({ x: 180, y: 180 });
  const lerpPos = useRef({ x: 180, y: 180 });
  const currentRadius = useRef(0);
  const targetRadius = useRef(0);
  const stillTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const panel = panelRef.current;
    if (!canvas || !panel) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = panel.clientWidth;
      canvas.height = panel.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle Burst structure (Spec 4.4)
    interface PeelParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      size: number;
    }

    const particles: PeelParticle[] = [];
    const maxParticles = 140;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mousePos.current = { x, y };

      if (!hasInteracted) {
        setHasInteracted(true);
      }

      // Target radius: 90px default
      targetRadius.current = 90;

      // Still timer for lingering >600ms -> grows to 110px
      if (stillTimer.current) clearTimeout(stillTimer.current);
      stillTimer.current = setTimeout(() => {
        targetRadius.current = 110;
      }, 600);

      // Spawn 2 edge-peel particles per movement frame (Spec 4.4)
      for (let k = 0; k < 2; k++) {
        if (particles.length >= maxParticles) {
          particles.shift(); // drop oldest
        }
        const angle = Math.random() * Math.PI * 2;
        const rad = currentRadius.current;
        const spawnX = lerpPos.current.x + Math.cos(angle) * rad;
        const spawnY = lerpPos.current.y + Math.sin(angle) * rad;
        const speed = 0.6 + Math.random() * 0.4;

        particles.push({
          x: spawnX,
          y: spawnY,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.2,
          vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.2,
          life: 0,
          maxLife: 40,
          size: 1.6,
        });
      }
    };

    const handleMouseLeave = () => {
      targetRadius.current = 0; // Spec 4.5: animates down to 0 over 500ms
      if (stillTimer.current) clearTimeout(stillTimer.current);
    };

    panel.addEventListener('mousemove', handleMouseMove);
    panel.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lerp position with 0.15 damping factor (Spec 4.3)
      lerpPos.current.x += (mousePos.current.x - lerpPos.current.x) * 0.15;
      lerpPos.current.y += (mousePos.current.y - lerpPos.current.y) * 0.15;

      // Smooth radius transition
      const radiusEase = targetRadius.current === 0 ? 0.08 : 0.12;
      currentRadius.current += (targetRadius.current - currentRadius.current) * radiusEase;

      // Update mask style on the Ghibli layer
      const ghibliLayer = panel.querySelector('.ghibli-overlay-layer') as HTMLElement;
      if (ghibliLayer) {
        const rad = Math.max(0, currentRadius.current);
        if (rad > 1) {
          // Circular feathered mask (Spec 4.3)
          // Cuts a hole where the cursor is: transparent in the center hole, black elsewhere
          const mask = `radial-gradient(circle ${rad}px at ${lerpPos.current.x}px ${lerpPos.current.y}px, transparent 0%, transparent 60%, black 100%)`;
          ghibliLayer.style.webkitMaskImage = mask;
          ghibliLayer.style.maskImage = mask;
        } else {
          ghibliLayer.style.webkitMaskImage = 'none';
          ghibliLayer.style.maskImage = 'none';
        }
      }

      // Render edge-peel particles (Spec 4.4)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const alpha = Math.max(0, 0.8 * (1 - p.life / p.maxLife));
        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fill();
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      panel.removeEventListener('mousemove', handleMouseMove);
      panel.removeEventListener('mouseleave', handleMouseLeave);
      if (stillTimer.current) clearTimeout(stillTimer.current);
    };
  }, [hasInteracted]);

  return (
    <section id="ghibli-reveal" className="ref-reveal-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header text-center">
          <div className="telemetry-tag">
            <Sparkles size={13} color="#2563eb" />
            <span>DUAL PERSPECTIVE // ART & SCIENCE</span>
          </div>
          <h2 className="section-title">
            The Vision: <span className="cfd-text-gradient">From Dream to Reality</span>
          </h2>
          <p className="section-subtitle">
            Hover or drag your cursor across the canvas to reveal the actual engineer beneath the artistic Studio Ghibli illustration.
          </p>
        </div>

        {/* 4.1 Panel Showcase Container */}
        <div className="ref-reveal-wrapper">
          <div ref={panelRef} className="evo-reveal-stage aero-card">
            {/* Real Photograph Layer (Underneath) */}
            <div className="real-photo-layer">
              <img
                src="/images/dhanush.png"
                alt="Dhaneshkumar S (Real)"
                className="reveal-img"
              />
              <div className="reveal-badge badge-real">
                <ShieldCheck size={14} />
                <span>REAL ENGINEER // VIT BHOPAL</span>
              </div>
            </div>

            {/* Ghibli Anime Art Layer (On Top, with cursor circular mask) */}
            <div className="ghibli-overlay-layer">
              <img
                src="/images/gibili.png"
                alt="Dhaneshkumar S (Ghibli Animation Art)"
                className="reveal-img"
              />
              <div className="reveal-badge badge-ghibli">
                <Sparkles size={14} />
                <span>STUDIO GHIBLI VISION</span>
              </div>
            </div>

            {/* Particle Peel Canvas */}
            <canvas ref={canvasRef} className="peel-particle-canvas" />

            {/* 4.2 Idle Hint Pulse */}
            {!hasInteracted && (
              <div className="reveal-idle-hint">
                <span className="hint-pulse-dot" />
                <span className="hint-text">Move your cursor to peel into reality →</span>
              </div>
            )}
          </div>

          <div className="reveal-caption-footer">
            <span className="handwritten-annotation">
              "The wind rises! We must try to live." — Jiro Horikoshi / Hayao Miyazaki
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
