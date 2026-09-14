import React from 'react';
import { ArrowUp, Mail, Heart } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { PORTFOLIO_DATA } from '../data/portfolio';

export const Footer: React.FC = () => {
  const { personal } = PORTFOLIO_DATA;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', marginBottom: '4px' }}>
            {personal.name}
            <span className="gradient-text">.dev</span>
          </div>
          <p className="footer-text">
            Designed & built with <Heart size={14} color="#ec4899" style={{ display: 'inline', margin: '0 2px' }} /> using React, TypeScript & Vanilla CSS.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="hero-socials">
            <a
              href={personal.github}
              target="_blank"
              rel="noreferrer"
              className="social-icon-btn"
              style={{ width: '38px', height: '38px' }}
              aria-label="GitHub"
            >
              <GithubIcon size={18} />
            </a>
            <a
              href={personal.linkedin}
              target="_blank"
              rel="noreferrer"
              className="social-icon-btn"
              style={{ width: '38px', height: '38px' }}
              aria-label="LinkedIn"
            >
              <LinkedinIcon size={18} />
            </a>
            <a
              href={`mailto:${personal.email}`}
              className="social-icon-btn"
              style={{ width: '38px', height: '38px' }}
              aria-label="Email"
            >
              <Mail size={18} />
            </a>
          </div>

          <button
            onClick={scrollToTop}
            className="back-to-top"
            aria-label="Scroll back to top"
            title="Back to Top"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
};
