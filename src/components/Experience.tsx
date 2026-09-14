import React from 'react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { PORTFOLIO_DATA } from '../data/portfolio';

export const Experience: React.FC = () => {
  const { experience } = PORTFOLIO_DATA;

  return (
    <section id="experience" className="section" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <Briefcase size={14} /> Career Journey
          </span>
          <h2 className="section-title">Work Experience</h2>
          <p className="section-subtitle">
            My professional track record building high-impact software systems and collaborating with product teams.
          </p>
        </div>

        <div className="timeline-container">
          {experience.map((item, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-node"></div>

              <div className="glass-card timeline-card">
                <div className="timeline-header">
                  <div>
                    <h3 className="timeline-role">{item.role}</h3>
                    <div className="timeline-company">{item.company}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="timeline-period">
                      <Calendar size={13} style={{ display: 'inline', marginRight: '6px' }} />
                      {item.period}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem', marginBottom: '14px' }}>
                  <MapPin size={14} />
                  <span>{item.location}</span>
                </div>

                <p style={{ fontSize: '0.95rem', color: '#cbd5e1', marginBottom: '14px', lineHeight: 1.6 }}>
                  {item.description}
                </p>

                <ul className="timeline-highlights">
                  {item.highlights.map((hl, hIdx) => (
                    <li key={hIdx} className="timeline-highlight-item">
                      {hl}
                    </li>
                  ))}
                </ul>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '18px' }}>
                  {item.techStack.map((tech, tIdx) => (
                    <span key={tIdx} className="tag-badge" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe' }}>
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
