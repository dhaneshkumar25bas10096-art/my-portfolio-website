import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Terminal } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ['home', 'about', 'skills', 'projects', 'experience', 'contact'];
      const scrollPos = window.scrollY + 120;

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

    window.addEventListener('scroll', handleScroll);
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
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container navbar-inner">
        <a href="#home" className="brand-logo" onClick={() => setMenuOpen(false)}>
          <div className="brand-badge">
            <Terminal size={20} />
          </div>
          <span>
            {PORTFOLIO_DATA.personal.name}
            <span className="gradient-text">.dev</span>
          </span>
        </a>

        <nav>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="mobile-only">
              <a
                href="#contact"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '10px' }}
                onClick={() => setMenuOpen(false)}
              >
                Let's Talk <ArrowUpRight size={16} />
              </a>
            </li>
          </ul>
        </nav>

        <div className="nav-cta">
          <a href="#contact" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>
            Get in Touch <ArrowUpRight size={16} />
          </a>

          <button
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>
    </header>
  );
};
