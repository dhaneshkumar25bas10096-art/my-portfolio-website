import React from 'react';
import { GraduationCap, Briefcase, Box, Rocket } from 'lucide-react';
import { AEROSPACE_DATA } from '../data/aerospaceData';

export const AeroFlightLog: React.FC = () => {
  const { roadmap } = AEROSPACE_DATA;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap size={20} color="#2563eb" />;
      case 'Briefcase':
        return <Briefcase size={20} color="#2563eb" />;
      case 'Box':
        return <Box size={20} color="#2563eb" />;
      case 'Rocket':
        return <Rocket size={20} color="#2563eb" />;
      default:
        return <Box size={20} color="#2563eb" />;
    }
  };

  return (
    <section id="experience" className="ref-roadmap-section">
      <div className="container">
        <div className="roadmap-inner-layout">
          {/* Left Title & Tag matching Section 06 in Reference Image */}
          <div className="roadmap-title-col">
            <div className="ref-section-tag">
              <span className="tag-num">06</span>
              <span className="tag-txt">EXPERIENCE & EDUCATION</span>
            </div>
            <h2 className="roadmap-heading">
              Building Towards <br />
              <span className="cfd-text-gradient">a Greater Vision</span>
            </h2>
          </div>

          {/* Center 4 Milestones Cards Row */}
          <div className="roadmap-milestones-row">
            {roadmap.map((item) => (
              <div key={item.id} className="milestone-card">
                <div className="milestone-icon-circle">
                  {getIcon(item.icon)}
                </div>
                <div className="milestone-info">
                  <h4 className="milestone-title">{item.title}</h4>
                  <p className="milestone-sub">{item.subtitle}</p>
                  <span className="milestone-period">{item.period}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Handwritten Cursive Annotation with Paper Plane Doodle */}
          <div className="roadmap-doodle-col">
            <div className="handwritten-doodle-wrap">
              <span className="cursive-sky-text">To the skies and beyond</span>
              <svg
                className="doodle-paper-plane-svg"
                viewBox="0 0 60 40"
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Dotted flight trail */}
                <path d="M5 32 C 15 36, 25 24, 38 22" strokeDasharray="3 3" />
                {/* Slanted flying paper airplane */}
                <polygon points="38 18 56 12 48 28 44 22 38 18" fill="#2563eb" fillOpacity="0.2" />
                <line x1="44" y1="22" x2="56" y2="12" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
