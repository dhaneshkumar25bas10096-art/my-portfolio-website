import React from 'react';
import { ArrowUp, Plane } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { AEROSPACE_DATA } from '../data/aerospaceData';

export const AeroFooter: React.FC = () => {
  const { pilot } = AEROSPACE_DATA;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="aero-footer">
      <div className="container aero-footer-inner">
        <div className="footer-left">
          <div className="footer-brand-row">
            <div className="footer-icon-badge">
              <Plane size={18} />
            </div>
            <span className="footer-brand-title">
              {pilot.name} <span className="cfd-text-gradient">// {pilot.callsign}</span>
            </span>
          </div>

          <p className="footer-tagline">
            Light-themed computational aerodynamics portfolio. Powered by React, Three.js WebGL particle simulations & custom CFD shaders.
          </p>

          <div className="footer-cfd-bar-decor">
            <div className="cfd-gradient-bar" style={{ height: '3px', maxWidth: '280px' }} />
            <span className="cfd-legend-mini">CFD TURBO PRESSURE SPECTRUM [LAMINAR → STAGNATION]</span>
          </div>
        </div>

        <div className="footer-right">
          <div className="footer-social-row">
            <a
              href={pilot.github}
              target="_blank"
              rel="noreferrer"
              className="footer-social-btn"
              aria-label="GitHub"
            >
              <GithubIcon size={18} />
            </a>
            <a
              href={pilot.linkedin}
              target="_blank"
              rel="noreferrer"
              className="footer-social-btn"
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={18} />
            </a>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="ascent-to-top-btn"
            title="Ascend back to Flight Deck"
          >
            <span>Ascend to Flight Deck</span>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>

      <div className="footer-bottom-line">
        <div className="container bottom-inner">
          <span>© {new Date().getFullYear()} {pilot.name}. Designed for SpaceX & NASA wind tunnel standards.</span>
          <span className="sys-status">TELEMETRY ENVELOPE // NOMINAL</span>
        </div>
      </div>
    </footer>
  );
};
