import React, { useState, useEffect } from 'react';
import { ArrowRight, Download, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';
import { PORTFOLIO_DATA } from '../data/portfolio';

export const Hero: React.FC = () => {
  const { personal, stats } = PORTFOLIO_DATA;
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const currentFullText = personal.subtitles[titleIndex];
    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(currentFullText.slice(0, displayText.length + 1));
        if (displayText.length + 1 === currentFullText.length) {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        setDisplayText(currentFullText.slice(0, displayText.length - 1));
        if (displayText.length === 0) {
          setIsDeleting(false);
          setTitleIndex((prev) => (prev + 1) % personal.subtitles.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, titleIndex, personal.subtitles]);

  return (
    <section id="home" className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Column: Introductions & Actions */}
          <div className="hero-content">
            <div className="hero-status-pill">
              <span className="pulse-dot"></span>
              <span>{personal.status}</span>
            </div>

            <h1 className="hero-title">
              Hi, I'm <span className="gradient-text">{personal.name}</span>
            </h1>

            <div className="hero-typewriter">
              <span>&gt;</span>
              <span style={{ color: '#f1f5f9' }}>{displayText}</span>
              <span className="typewriter-cursor"></span>
            </div>

            <p className="hero-bio">
              {personal.bio}
            </p>

            <div className="hero-actions">
              <a href="#projects" className="btn btn-primary">
                View My Work <ArrowRight size={18} />
              </a>
              <a href="#contact" className="btn btn-secondary">
                <Download size={18} /> Get in Touch
              </a>
            </div>

            <div className="hero-socials">
              <a
                href={personal.github}
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="GitHub Profile"
              >
                <GithubIcon size={20} />
              </a>
              <a
                href={personal.linkedin}
                target="_blank"
                rel="noreferrer"
                className="social-icon-btn"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon size={20} />
              </a>
              <a
                href={`mailto:${personal.email}`}
                className="social-icon-btn"
                aria-label="Send an Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Code Mockup */}
          <div className="hero-visual">
            <div className="code-mockup-card">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="mockup-file">developer.config.ts</div>
                <Sparkles size={16} color="#8b5cf6" />
              </div>

              <div className="mockup-body">
                <div>
                  <span className="code-keyword">const</span>{' '}
                  <span className="code-fn">developer</span> = &#123;
                </div>
                <div style={{ paddingLeft: '1.25rem' }}>
                  name: <span className="code-str">'{personal.name}'</span>,
                </div>
                <div style={{ paddingLeft: '1.25rem' }}>
                  focus: <span className="code-str">'Full-Stack Architecture'</span>,
                </div>
                <div style={{ paddingLeft: '1.25rem' }}>
                  stack: [<span className="code-str">'React'</span>, <span className="code-str">'TypeScript'</span>, <span className="code-str">'Node'</span>],
                </div>
                <div style={{ paddingLeft: '1.25rem' }}>
                  passion: <span className="code-str">'Delivering ultra-fast, robust UX'</span>,
                </div>
                <div style={{ paddingLeft: '1.25rem' }}>
                  shipsFast: <span className="code-keyword">true</span>,
                </div>
                <div style={{ paddingLeft: '1.25rem' }}>
                  cleanCode: <span className="code-keyword">true</span>,
                </div>
                <div>&#125;;</div>
                <div style={{ marginTop: '0.75rem' }}>
                  <span className="code-comment">// Ready to collaborate and ship extraordinary apps</span>
                </div>
              </div>
            </div>

            <div className="hero-floating-badge animate-float">
              <CheckCircle2 size={22} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Production Ready</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>High Performance & Clean Code</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-grid">
          {stats.map((stat, idx) => (
            <div key={idx} className="glass-card stat-card">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-sub">{stat.sublabel}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
