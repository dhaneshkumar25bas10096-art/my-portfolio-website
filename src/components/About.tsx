import React from 'react';
import { Zap, ShieldCheck, Layers, Users, MapPin, Coffee, Code2 } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';

export const About: React.FC = () => {
  const { personal } = PORTFOLIO_DATA;

  const corePillars = [
    {
      icon: <Zap size={22} />,
      title: "Performance First",
      desc: "Optimized bundles, lightning-fast rendering, and sub-second load times engineered from the ground up."
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Type Safety & Resiliency",
      desc: "Strict TypeScript contracts, robust error boundaries, and defensive API design ensuring zero runtime surprises."
    },
    {
      icon: <Layers size={22} />,
      title: "Scalable Architecture",
      desc: "Modular components, decoupled micro-services, and cloud-native patterns built to gracefully handle millions of requests."
    },
    {
      icon: <Users size={22} />,
      title: "Product & User Centric",
      desc: "Deep empathy for end-users, delivering intuitive, accessible, and delightful interactive web experiences."
    }
  ];

  return (
    <section id="about" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <Code2 size={14} /> Background & Philosophy
          </span>
          <h2 className="section-title">About Me</h2>
          <p className="section-subtitle">
            Bridging technical precision with human-centric interfaces to deliver software that scales.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-text">
            <p>
              Hello! I'm <strong style={{ color: '#fff' }}>{personal.name}</strong>, a Full-Stack Engineer based in{' '}
              <span style={{ color: '#38bdf8' }}>{personal.location}</span>. I enjoy turning complex system challenges into simple, elegant, and maintainable software architectures.
            </p>
            <p>
              My journey began tinkering with web standards and backend APIs, which rapidly evolved into engineering scalable web portals, distributed systems, and real-time interactive apps. I care deeply about the craft of programming — from crafting clean component hierarchies in React to writing efficient SQL queries and backend services.
            </p>
            <p>
              When I'm not writing code or experimenting with new technologies, you can find me exploring open-source tools, optimizing development workflows, or mentoring emerging developers.
            </p>

            <div style={{ display: 'flex', gap: '24px', marginTop: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <MapPin size={18} color="#06b6d4" />
                <span>{personal.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                <Coffee size={18} color="#ec4899" />
                <span>Fueled by Curiosity & Caffeine</span>
              </div>
            </div>
          </div>

          <div className="about-highlights-grid">
            {corePillars.map((pillar, i) => (
              <div key={i} className="glass-card highlight-box">
                <div className="highlight-icon-wrapper">
                  {pillar.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>{pillar.title}</h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
