import React from 'react';
import { Box, Layers, Wind, Terminal, Compass, Binary, Code, Sparkles, Cpu } from 'lucide-react';
import { AEROSPACE_DATA } from '../data/aerospaceData';

const ICON_COMPONENTS: Record<string, React.ReactNode> = {
  Box: <Box size={22} />,
  Layers: <Layers size={22} />,
  Wind: <Wind size={22} />,
  Terminal: <Terminal size={22} />,
  Compass: <Compass size={22} />,
  Binary: <Binary size={22} />,
  Code: <Code size={22} />,
  Sparkles: <Sparkles size={22} />,
};

export const AeroTools: React.FC = () => {
  const { tools } = AEROSPACE_DATA;

  return (
    <section id="tools" className="section aero-tools-section">
      <div className="container">
        <div className="section-header">
          <span className="telemetry-tag">
            <Cpu size={13} /> Engineering Software Suite
          </span>
          <h2 className="section-title">CAD, CFD & Flight Dynamics Tools</h2>
          <p className="section-subtitle">
            Industry-standard simulation solvers, finite volume codes, and 3D surface modeling platforms used across all research workflows.
          </p>
        </div>

        <div className="tools-card-grid">
          {tools.map((tool, idx) => (
            <div key={idx} className="tool-card aero-card">
              <div className="tool-card-header">
                <div className="tool-icon-wrapper">
                  {ICON_COMPONENTS[tool.iconName] || <Cpu size={22} />}
                </div>
                <span className="spec-badge">{tool.category}</span>
              </div>

              <div className="tool-info-block">
                <div className="tool-title-row">
                  <h3 className="tool-title">{tool.name}</h3>
                  <span className="tool-proficiency cfd-text-gradient">{tool.proficiency}</span>
                </div>

                <div className="tool-badge-pill">{tool.badge}</div>
                <p className="tool-metric-desc">{tool.metric}</p>

                {/* Technical Progress Gauge */}
                <div className="tool-gauge-bar">
                  <div
                    className="gauge-fill"
                    style={{ width: tool.proficiency }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
