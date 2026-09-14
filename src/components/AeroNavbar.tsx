import React, { useState, useEffect } from 'react';
import { Menu, X, Compass } from 'lucide-react';
import { AEROSPACE_DATA } from '../data/aerospaceData';

interface AeroNavbarProps {
  onOpenModelModal?: (modelId?: string) => void;
}

export const AeroNavbar: React.FC<AeroNavbarProps> = ({ onOpenModelModal: _onOpenModelModal }) => {
  const { pilot } = AEROSPACE_DATA;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const pct = Math.round((window.scrollY / totalHeight) * 100);
        setScrollPercentage(Math.min(Math.max(pct, 0), 100));
      }

      const sections = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className={`ref-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="ref-navbar-container">
        {/* Brand: Paper Plane Icon + Dhaneshkumar S */}
        <a href="#home" className="ref-brand" onClick={() => setMenuOpen(false)}>
          <div className="ref-brand-icon">
            <svg
              className="paper-plane-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="3 3 21 9 13 13 9 21 3 3" fill="#2563eb" fillOpacity="0.15" />
              <line x1="13" y1="13" x2="3" y2="3" />
            </svg>
          </div>
          <div className="ref-brand-meta">
            <span className="ref-brand-name">{pilot.name}</span>
            <span className="ref-brand-sub">{pilot.title}</span>
          </div>
        </a>

        {/* Center Navigation Links */}
        <nav className="ref-nav-center">
          <ul className={`ref-nav-links ${menuOpen ? 'mobile-open' : ''}`}>
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`ref-nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                  {activeSection === item.id && <span className="ref-active-indicator" />}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right Slogan & Scroll Telemetry */}
        <div className="ref-nav-right">
          <div className="ref-motto hide-tablet">
            <span>DREAM</span>
            <span className="sep">/</span>
            <span>DESIGN</span>
            <span className="sep">/</span>
            <span>BUILD</span>
            <span className="sep">/</span>
            <span>FLY</span>
          </div>

          <div className="ref-scroll-meter">
            <div className="ref-scroll-track">
              <div
                className="ref-scroll-fill"
                style={{ width: `${scrollPercentage}%` }}
              />
            </div>
            <span className="ref-scroll-text">SCROLL {scrollPercentage}%</span>
            <div className="ref-gyro-icon">
              <Compass size={15} className="spin-slow" />
            </div>
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            className="ref-menu-toggle"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
};
