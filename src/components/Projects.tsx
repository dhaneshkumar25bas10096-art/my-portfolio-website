import React, { useState } from 'react';
import { ExternalLink, FolderGit2, TrendingUp } from 'lucide-react';
import { GithubIcon } from './Icons';
import { PORTFOLIO_DATA } from '../data/portfolio';

export const Projects: React.FC = () => {
  const { projects } = PORTFOLIO_DATA;
  const [activeFilter, setActiveFilter] = useState('All');

  const categories = ['All', 'Full Stack', 'Frontend', 'AI & Cloud', 'Systems'];

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter((p) => p.category === activeFilter);

  return (
    <section id="projects" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <FolderGit2 size={14} /> Shipped Work
          </span>
          <h2 className="section-title">Featured Projects</h2>
          <p className="section-subtitle">
            A selection of software systems, web platforms, and open source tools I've engineered.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="project-filters">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <div key={project.id} className="glass-card project-card">
              <div className="project-card-header">
                <span className="project-category-tag">{project.category}</span>
                <div className="project-card-links">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="project-icon-link"
                      aria-label={`${project.title} GitHub repo`}
                    >
                      <GithubIcon size={19} />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="project-icon-link"
                      aria-label={`${project.title} Live Preview`}
                    >
                      <ExternalLink size={19} />
                    </a>
                  )}
                </div>
              </div>

              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>

              {project.metrics && (
                <div className="project-impact">
                  <TrendingUp size={16} />
                  <span>{project.metrics}</span>
                </div>
              )}

              <div className="project-tags">
                {project.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="tag-badge">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
