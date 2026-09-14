import React, { useState, useEffect } from 'react';
import { Compass, Wind, Gauge, Activity } from 'lucide-react';

export const AeroHud: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = window.scrollY / totalHeight;
        setScrollProgress(Math.min(Math.max(progress, 0), 1));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      // Check if hovering interactive element
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button'
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Compute live flight telemetry based on scroll depth
  const altitude = Math.floor(2500 + scrollProgress * 42500); // 2,500 ft to 45,000 ft
  const mach = (0.28 + scrollProgress * 3.92).toFixed(2); // M 0.28 to M 4.20
  const aoa = (1.8 + Math.sin(scrollProgress * Math.PI * 4) * 2.4).toFixed(1); // AoA degrees
  const dynPressure = (12.4 + scrollProgress * 34.2).toFixed(1); // kPa

  return (
    <>
      {/* Persistent Top Aerospace HUD Telemetry Strip */}
      <div className="aero-hud-bar">
        <div className="container hud-inner">
          <div className="hud-left">
            <div className="hud-badge">
              <span className="hud-radar-dot"></span>
              <span className="hud-label">TELEMETRY LINK:</span>
              <span className="hud-val-active">STABLE // CFD LIVE</span>
            </div>
            <div className="hud-item hide-mobile">
              <Gauge size={13} color="#0284c7" />
              <span className="hud-label">ALT:</span>
              <span className="hud-value">{altitude.toLocaleString()} FT</span>
            </div>
            <div className="hud-item">
              <Wind size={13} color="#06b6d4" />
              <span className="hud-label">SPEED:</span>
              <span className="hud-value cfd-text-gradient">MACH {mach}</span>
            </div>
          </div>

          <div className="hud-right">
            <div className="hud-item hide-mobile">
              <Compass size={13} color="#10b981" />
              <span className="hud-label">AoA:</span>
              <span className="hud-value">+{aoa}°</span>
            </div>
            <div className="hud-item hide-mobile">
              <Activity size={13} color="#eab308" />
              <span className="hud-label">q:</span>
              <span className="hud-value">{dynPressure} kPa</span>
            </div>
            <div className="hud-flight-mode">
              <span className="flight-mode-text">
                {scrollProgress < 0.25
                  ? 'ASCENT'
                  : scrollProgress < 0.75
                  ? 'TRANSONIC CRUISE'
                  : 'TERMINAL DESCENT'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Mach Flight Progress Indicator Bar */}
        <div
          className="hud-progress-line"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* Futuristic Targeting Reticle Cursor */}
      <div
        className={`aero-cursor-reticle ${isHovered ? 'targeting' : ''}`}
        style={{
          transform: `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`,
        }}
      >
        <div className="reticle-core" />
        <div className="reticle-ring" />
      </div>
    </>
  );
};
