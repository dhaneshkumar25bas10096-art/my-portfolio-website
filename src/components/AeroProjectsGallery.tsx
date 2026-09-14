import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { AeroProject } from '../data/aerospaceData';
import { AEROSPACE_DATA } from '../data/aerospaceData';

interface AeroProjectsGalleryProps {
  onOpenModelModal: (project: AeroProject) => void;
}

export const AeroProjectsGallery: React.FC<AeroProjectsGalleryProps> = ({ onOpenModelModal }) => {
  const { projects } = AEROSPACE_DATA;
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section id="projects" className="ref-projects-section">
      <div className="container">
        {/* Header Section from Reference Image */}
        <div className="ref-projects-header">
          <div className="header-left">
            <div className="ref-section-tag">
              <span className="tag-num">05</span>
              <span className="tag-txt">LAB & STUDIES</span>
            </div>
            <h2 className="ref-projects-heading">Interactive 3D Aerodynamics Lab</h2>
            <p className="ref-projects-desc">
              Capability demonstrations of computational flow visualization, parametric CAD modeling, and aeronautical design studies I'm developing as an aerospace student.
            </p>
          </div>

          <div className="header-right">
            <button
              type="button"
              className="ref-view-all-btn"
              onClick={() => onOpenModelModal(projects[0])}
            >
              <div className="btn-circle-arrow">
                <ArrowRight size={16} />
              </div>
              <span>View All Projects</span>
            </button>
          </div>
        </div>

        {/* 5 Project Cards Row matching reference image */}
        <div className="ref-projects-row">
          {projects.map((proj) => {
            const isHovered = hoveredCard === proj.id;
            return (
              <div
                key={proj.id}
                className={`ref-project-card card-theme-${proj.number}`}
                style={{
                  '--card-accent': proj.color,
                } as React.CSSProperties}
                onMouseEnter={() => setHoveredCard(proj.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => onOpenModelModal(proj)}
              >
                {/* Background artistic aerospace schematic illustration */}
                <div className="card-visual-layer">
                  <div className="card-schematic-bg">
                    {proj.number === '01' && (
                      <svg className="schematic-svg" viewBox="0 0 160 160" fill="none">
                        <path d="M20 140 L140 20 L120 20 L10 130 Z" fill="white" fillOpacity="0.15" />
                        <path d="M60 80 L140 100 L110 115 Z" fill="white" fillOpacity="0.25" />
                        <circle cx="80" cy="80" r="60" stroke="white" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.3" />
                      </svg>
                    )}
                    {proj.number === '02' && (
                      <svg className="schematic-svg" viewBox="0 0 160 160" fill="none">
                        <path d="M30 130 C 50 40, 110 40, 130 130" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
                        <path d="M40 120 C 60 60, 100 60, 120 120" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.3" />
                        <rect x="20" y="20" width="120" height="120" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />
                      </svg>
                    )}
                    {proj.number === '03' && (
                      <svg className="schematic-svg" viewBox="0 0 160 160" fill="none">
                        <circle cx="80" cy="80" r="50" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
                        <circle cx="80" cy="80" r="22" fill="white" fillOpacity="0.2" />
                        <line x1="80" y1="20" x2="80" y2="140" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                        <line x1="20" y1="80" x2="140" y2="80" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                      </svg>
                    )}
                    {proj.number === '04' && (
                      <svg className="schematic-svg" viewBox="0 0 160 160" fill="none">
                        <rect x="40" y="50" width="80" height="60" rx="10" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
                        <circle cx="55" cy="115" r="14" fill="white" fillOpacity="0.25" />
                        <circle cx="105" cy="115" r="14" fill="white" fillOpacity="0.25" />
                        <line x1="80" y1="50" x2="80" y2="25" stroke="white" strokeWidth="2" strokeOpacity="0.5" />
                      </svg>
                    )}
                    {proj.number === '05' && (
                      <svg className="schematic-svg" viewBox="0 0 160 160" fill="none">
                        <rect x="65" y="60" width="30" height="40" stroke="white" strokeWidth="1.5" fill="white" fillOpacity="0.15" />
                        <rect x="15" y="68" width="45" height="24" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
                        <rect x="100" y="68" width="45" height="24" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
                        <circle cx="80" cy="80" r="65" stroke="white" strokeWidth="0.8" strokeDasharray="5 3" strokeOpacity="0.3" />
                      </svg>
                    )}
                  </div>

                  {/* Upward particle drift on hover (Spec 6.2) */}
                  {isHovered && <div className="card-hover-particles" />}
                </div>

                {/* Card Top Number */}
                <div className="card-num-row">
                  <span className="project-num">{proj.number}</span>
                </div>

                {/* Card Content */}
                <div className="card-info">
                  <h3 className="project-title">{proj.title}</h3>
                  <p className="project-subtitle">{proj.subtitle}</p>
                </div>

                {/* Bottom Circular Action Arrow Button */}
                <div className="card-action-circle">
                  <ArrowRight size={15} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
