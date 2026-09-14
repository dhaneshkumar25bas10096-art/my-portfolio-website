import React from 'react';
import { Layout, Server, Cloud, Cpu, Sparkles } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';

const ICON_MAP: Record<string, React.ReactNode> = {
  Layout: <Layout size={22} />,
  Server: <Server size={22} />,
  Cloud: <Cloud size={22} />,
  Cpu: <Cpu size={22} />,
};

export const Skills: React.FC = () => {
  const { skillCategories } = PORTFOLIO_DATA;

  return (
    <section id="skills" className="section" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <Sparkles size={14} /> Technical Arsenal
          </span>
          <h2 className="section-title">Skills & Technologies</h2>
          <p className="section-subtitle">
            A battle-tested stack of modern tools, libraries, and frameworks I use to build world-class applications.
          </p>
        </div>

        <div className="skills-grid">
          {skillCategories.map((cat, idx) => (
            <div key={idx} className="glass-card skill-category-card">
              <div className="skill-category-head">
                <div className="skill-cat-icon">
                  {ICON_MAP[cat.iconName] || <Cpu size={22} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>{cat.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {cat.skills.length} core technologies
                  </span>
                </div>
              </div>

              <div className="skills-list">
                {cat.skills.map((skill, sIdx) => (
                  <div key={sIdx} className="skill-item-row">
                    <div className="skill-name">
                      <span>{skill.name}</span>
                      {skill.badge && <span className="skill-badge">{skill.badge}</span>}
                    </div>
                    <span className="skill-level-text">{skill.level}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
