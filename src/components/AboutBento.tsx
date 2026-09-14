import React from 'react';
import { Mail, MapPin, ExternalLink } from 'lucide-react';
import { AEROSPACE_DATA } from '../data/aerospaceData';

export const AboutBento: React.FC = () => {
  const { pilot, experience, skills } = AEROSPACE_DATA;

  return (
    <section id="about" className="ref-about-section">
      <div className="ref-bento-container">
        {/* 01 ABOUT ME */}
        <div className="bento-card card-about">
          <div className="bento-tag">
            <span className="tag-number">01</span>
            <span className="tag-title">ABOUT ME</span>
          </div>
          <h3 className="bento-heading">
            Hello, I'm <span className="highlight-blue">{pilot.name.split(' ')[0]}</span>
          </h3>
          <p className="bento-text">{pilot.aboutDescription}</p>

          <div className="about-stats-grid">
            {pilot.stats.map((stat, i) => (
              <div key={i} className="stat-box">
                <span className="stat-number">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 02 EXPERIENCE */}
        <div className="bento-card card-experience">
          <div className="bento-tag">
            <span className="tag-number">02</span>
            <span className="tag-title">EXPERIENCE</span>
          </div>
          <div className="experience-list">
            {experience.map((exp, i) => (
              <div key={i} className="experience-item">
                <h4 className="exp-role">{exp.role}</h4>
                <div className="exp-meta">
                  <span className="exp-org">{exp.organization}</span>
                  <span className="exp-date">{exp.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 03 SKILLS & 04 CONTACT Stacked Column */}
        <div className="bento-stack-col">
          {/* 03 SKILLS */}
          <div className="bento-card card-skills">
            <div className="bento-tag">
              <span className="tag-number">03</span>
              <span className="tag-title">SKILLS</span>
            </div>
            <div className="skills-pill-wrap">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="skill-pill"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>

          {/* 04 CONTACT */}
          <div className="bento-card card-contact">
            <div className="bento-tag">
              <span className="tag-number">04</span>
              <span className="tag-title">CONTACT</span>
            </div>
            <div className="contact-links-list">
              <a
                href={pilot.behance}
                target="_blank"
                rel="noreferrer"
                className="contact-row"
              >
                <div className="contact-icon">
                  <ExternalLink size={14} />
                </div>
                <span className="contact-val">https://www.behance.net/dhaneshkumars</span>
              </a>

              <a
                href={`mailto:${pilot.email}`}
                className="contact-row"
              >
                <div className="contact-icon">
                  <Mail size={14} />
                </div>
                <span className="contact-val">{pilot.email}</span>
              </a>

              <div className="contact-row">
                <div className="contact-icon">
                  <MapPin size={14} />
                </div>
                <span className="contact-val">{pilot.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Polaroid Card: Real Photo with Blue Tape and Handwritten Note */}
        <div className="card-polaroid-wrapper">
          <div className="polaroid-card">
            {/* Blue Scotch Tape at Top */}
            <div className="scotch-tape" />

            {/* Photo frame */}
            <div className="polaroid-photo-box">
              <img
                src="/images/dhanush.png"
                alt="Dhaneshkumar S Polaroid"
                className="polaroid-img"
              />
            </div>

            {/* Handwritten Note with arrow */}
            <div className="polaroid-caption-wrap">
              <span className="polaroid-handwritten">Same person, just a little more real</span>
              <svg
                className="polaroid-arrow-svg"
                viewBox="0 0 36 24"
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <path d="M4 18 C 12 20, 24 12, 30 6" />
                <path d="M24 4 L 31 6 L 29 13" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
