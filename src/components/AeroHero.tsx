import React, { useEffect, useRef, useState } from 'react';
import { Play, ArrowRight, GraduationCap, Plane, Box, Compass, ChevronDown } from 'lucide-react';
import { HeroModelMorphSequence } from './HeroModelMorphSequence';
import { AEROSPACE_DATA } from '../data/aerospaceData';

interface AeroHeroProps {
  onOpenModelModal?: (modelId?: string) => void;
}

export const AeroHero: React.FC<AeroHeroProps> = ({ onOpenModelModal }) => {
  const { hudTelemetry } = AEROSPACE_DATA;
  const [liveTelemetry, setLiveTelemetry] = useState(hudTelemetry);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrolledPast, setScrolledPast] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // 1. Ambient Background Particle Drift (Spec 1.1)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const particleCount = isMobile ? 50 : 150;

    interface AmbientParticle {
      x: number;
      y: number;
      z: number; // 0.1 (far) to 1.0 (near)
      baseSize: number;
      vx: number;
      vy: number;
      alpha: number;
      life: number;
      maxLife: number;
      fadeTime: number;
    }

    const particles: AmbientParticle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const maxLife = 400 + Math.random() * 400;
      const z = 0.15 + Math.random() * 0.85;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z,
        baseSize: 0.8 + Math.random() * 1.8,
        // Nearer particles travel slightly faster across the camera plane
        vx: (0.2 + Math.random() * 0.4) * (0.5 + 0.7 * z),
        vy: (Math.random() - 0.5) * 0.2 * z,
        alpha: 0,
        life: Math.random() * maxLife,
        maxLife,
        fadeTime: 90, // ~1.5 - 2s fade in/out
      });
    }

    let time = 0;
    let currentScrollY = window.scrollY;

    const onScroll = () => {
      currentScrollY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const render = () => {
      animId = requestAnimationFrame(render);
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.life++;

        // Slow curl-noise perturbation scaled by depth
        const curlY = Math.sin(time + p.x * 0.005) * 0.35 * p.z;
        p.x += p.vx;
        p.y += p.vy + curlY;

        // Wrap around viewport edges
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;
        if (p.y > height + 20) p.y = -20;
        if (p.y < -20) p.y = height + 20;

        // Base opacity curve: fade in, hold, fade out
        let baseAlpha = 0.45;
        if (p.life < p.fadeTime) {
          baseAlpha = (p.life / p.fadeTime) * 0.45;
        } else if (p.life > p.maxLife - p.fadeTime) {
          baseAlpha = ((p.maxLife - p.life) / p.fadeTime) * 0.45;
        }

        // Depth modulation: far particles are smaller and more faded; near particles are larger and clearer
        const renderSize = p.baseSize * (0.4 + 0.8 * p.z);
        const renderAlpha = baseAlpha * (0.25 + 0.75 * p.z);

        // Subtle scroll parallax: nearer particles shift more with scroll
        const parallaxY = p.y - (currentScrollY * 0.08 * p.z);

        if (p.life >= p.maxLife) {
          p.life = 0;
          p.x = Math.random() * width;
          p.y = Math.random() * height;
        }

        ctx.beginPath();
        ctx.arc(p.x, parallaxY, renderSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37, 99, 235, ${Math.max(0, renderAlpha)})`;
        ctx.fill();
      }
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 1.6 Scroll cue exit when scrolled past 40px
  useEffect(() => {
    const handleScroll = () => {
      setScrolledPast(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1.2 Characters for Kinetic Reveal
  const nameChars = "DHANESHKUMAR".split("");

  return (
    <section id="home" className="ref-hero-section">
      {/* 1.1 Ambient Particle Canvas */}
      <canvas ref={canvasRef} className="ref-hero-ambient-canvas" />

      {/* 1.5 Hero Glow / Background Gradient Pulse */}
      <div className="ref-hero-glow-pulse" />

      <div className="ref-hero-container">
        {/* Left Column: Typography, CTAs, Stats Badges */}
        <div className="ref-hero-left">
          {/* Subtitle Badge */}
          <div className="ref-hero-tag">
            <span className="ref-tag-text">AEROSPACE ENGINEERING STUDENT</span>
          </div>

          {/* 1.2 Kinetic Name Reveal */}
          <h1 className="ref-hero-title">
            <span className="ref-name-letters">
              {nameChars.map((char, index) => (
                <span
                  key={index}
                  className="ref-char"
                  style={{ animationDelay: `${600 + index * 45}ms` }}
                >
                  {char}
                </span>
              ))}
            </span>
            <span className="ref-name-badge-s">S</span>
          </h1>

          {/* 1.3 Subtitle & Bio */}
          <h2 className="ref-hero-subhead">Turning Ideas into Flight</h2>
          <p className="ref-hero-desc">
            I'm an aerospace engineering student passionate about designing, building and exploring the skies — from CAD models to UAVs, and beyond.
          </p>

          {/* 1.4 CTA Action Buttons */}
          <div className="ref-hero-ctas">
            <a href="#projects" className="ref-btn-primary">
              <span>View Projects</span>
              <ArrowRight size={17} className="btn-arrow" />
            </a>

            <button
              type="button"
              className="ref-btn-intro"
              onClick={() => setVideoModalOpen(true)}
            >
              <div className="ref-play-circle">
                <Play size={14} fill="#2563eb" color="#2563eb" />
              </div>
              <span>Watch Intro</span>
            </button>
          </div>

          {/* 4 Metadata Badges from Reference Image */}
          <div className="ref-hero-badges-row">
            <div className="ref-badge-card">
              <div className="ref-badge-icon">
                <GraduationCap size={18} color="#2563eb" />
              </div>
              <div className="ref-badge-text">
                <span className="badge-val">VIT Bhopal</span>
                <span className="badge-sub">University</span>
              </div>
            </div>

            <div className="ref-badge-card">
              <div className="ref-badge-icon">
                <Plane size={18} color="#2563eb" />
              </div>
              <div className="ref-badge-text">
                <span className="badge-val">Aerospace</span>
                <span className="badge-sub">Engineering</span>
              </div>
            </div>

            <div className="ref-badge-card">
              <div className="ref-badge-icon">
                <Box size={18} color="#2563eb" />
              </div>
              <div className="ref-badge-text">
                <span className="badge-val">Fusion 360</span>
                <span className="badge-sub">3D CAD</span>
              </div>
            </div>

            <div className="ref-badge-card">
              <div className="ref-badge-icon">
                <Compass size={18} color="#2563eb" />
              </div>
              <div className="ref-badge-text">
                <span className="badge-val">UAV Design</span>
                <span className="badge-sub">Modeling & Simulation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Visual: Dhaneshkumar Portrait + Particle Explosion + 3D Glider with CFD */}
        <div className="ref-hero-right">
          {/* Top-Right HUD Flight Telemetry Box */}
          <div className="ref-hero-telemetry-hud">
            <div className="telemetry-item">
              <span className="tele-lbl">LIFT</span>
              <span className="tele-val cfd-lift">{liveTelemetry.lift}</span>
            </div>
            <div className="telemetry-item">
              <span className="tele-lbl">DRAG</span>
              <span className="tele-val cfd-drag">{liveTelemetry.drag}</span>
            </div>
            <div className="telemetry-item">
              <span className="tele-lbl">AoA</span>
              <span className="tele-val cfd-aoa">{liveTelemetry.aoa}</span>
            </div>
          </div>

          <div className="ref-hero-visual-stage">
            {/* Dhaneshkumar's Real Photo with Dispersion Splatter Effect */}
            <div className="ref-portrait-container">
              <div className="ref-portrait-wrapper">
                <img
                  src="/images/dhanush.png"
                  alt="Dhaneshkumar S"
                  className="ref-portrait-img"
                />
                <div className="ref-portrait-dispersion-particles" />
              </div>

              {/* Handwritten Note with Arrow — annotates Dhanesh, arrow curves down-right to portrait */}
              <div className="ref-handwritten-tag">
                <span className="handwritten-text">Future Aerospace Engineer</span>
                {/* Arrow curves downward-right, tip landing near portrait head/shoulder */}
                <svg
                  className="curved-arrow-svg"
                  viewBox="0 0 48 52"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  {/* Curve sweeps down-right from label toward the portrait */}
                  <path d="M6 5 C 10 20, 24 38, 38 46" />
                  {/* Arrowhead pointing toward portrait */}
                  <path d="M30 44 L 38 46 L 36 37" />
                </svg>
              </div>
            </div>

            {/* 3D Model-Morph Sequence: 4 Aircraft-Lineage Models with Thanos Snap Dust & Streamlines */}
            <div className="ref-glider-3d-wrapper">
              <HeroModelMorphSequence
                onTelemetryChange={(tele) => setLiveTelemetry((prev) => ({ ...prev, ...tele }))}
                onInteractiveClick={() => onOpenModelModal && onOpenModelModal('aircraft-design')}
              />
            </div>

            {/* Motto underneath */}
            <div className="ref-hero-motto">
              <span>BETTER DESIGN</span>
              <span>SAFER SKIES</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1.6 Scroll Cue Affordance */}
      <div className={`ref-scroll-cue ${scrolledPast ? 'faded' : ''}`}>
        <a href="#about" className="ref-scroll-cue-link">
          <div className="ref-bobbing-chevron">
            <ChevronDown size={18} color="#2563eb" />
          </div>
          <span className="ref-cue-label">SCROLL TO EXPLORE</span>
        </a>
      </div>

      {/* Watch Intro Modal */}
      {videoModalOpen && (
        <div className="ref-modal-backdrop" onClick={() => setVideoModalOpen(false)}>
          <div className="ref-intro-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Dhaneshkumar S — Aerospace Journey</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setVideoModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body intro-video-body">
              <div className="intro-badge-banner">
                <Plane size={24} color="#2563eb" />
                <div>
                  <h4>Designing, Building, & Simulating the Future of Flight</h4>
                  <p>From CAD modeling in Fusion 360 to autonomous UAV aerodynamic research at VIT Bhopal.</p>
                </div>
              </div>
              <div className="intro-details-grid">
                <div className="detail-card">
                  <h5>Focus Areas</h5>
                  <p>CFD Analysis, High-Lift Wings, Autonomous UAVs, Rocker-Bogie Robotics.</p>
                </div>
                <div className="detail-card">
                  <h5>Academic Vision</h5>
                  <p>Engineering sustainable, high-efficiency flight systems with computational fluid dynamics.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
