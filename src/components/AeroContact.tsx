import React, { useState } from 'react';
import { Plane, Send, Copy, Check, Mail, MapPin, Radio, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GithubIcon, LinkedinIcon } from './Icons';
import { AEROSPACE_DATA } from '../data/aerospaceData';

export const AeroContact: React.FC = () => {
  const { pilot } = AEROSPACE_DATA;

  const [formData, setFormData] = useState({
    name: '',
    callsignOrOrg: '',
    email: '',
    missionBrief: '',
  });

  const [copied, setCopied] = useState(false);
  const [transmitted, setTransmitted] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(pilot.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTransmitting(true);

    setTimeout(() => {
      setIsTransmitting(false);
      setTransmitted(true);

      // Trigger celebratory aerodynamic confetti
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.65 },
          colors: ['#0284c7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
        });
      } catch {}

      setFormData({ name: '', callsignOrOrg: '', email: '', missionBrief: '' });
      setTimeout(() => setTransmitted(false), 6000);
    }, 600);
  };

  return (
    <section id="contact" className="section aero-contact-section">
      <div className="container">
        <div className="section-header">
          <span className="telemetry-tag">
            <Radio size={13} /> Final Approach & Touchdown
          </span>
          <h2 className="section-title">Flight Operations & Comms Dispatch</h2>
          <p className="section-subtitle">
            Touchdown confirmed. Available for aerospace internships, computational aerodynamics research, and collegiate engineering collaborations.
          </p>
        </div>

        {/* Runway Landing Banner */}
        <div className="runway-landing-strip">
          <div className="runway-centerline">
            <span>---</span>
            <Plane size={18} className="landing-plane-icon" />
            <span>---</span>
            <span className="runway-num">09L // TOUCHDOWN</span>
            <span>---</span>
          </div>
        </div>

        <div className="contact-grid-container">
          {/* Left Column: Direct Telemetry & Comms Information */}
          <div className="comms-dossier-column">
            <div className="aero-card dossier-card">
              <div className="dossier-badge">
                <Radio size={15} color="#0284c7" />
                <span>PILOT COMM LINK // ACTIVE</span>
              </div>

              <h3 className="dossier-title">Initiate Transmission</h3>
              <p className="dossier-desc">
                Whether you have an inquiry regarding my 3D waverider models, wish to discuss aerodynamic simulation methodologies, or explore internship opportunities, my comms channel is open.
              </p>

              <div className="dossier-contact-rows">
                <div className="dossier-row">
                  <div className="dossier-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="row-k">DIRECT FREQUENCY:</span>
                    <span className="row-v">{pilot.email}</span>
                  </div>
                </div>

                <div className="dossier-row">
                  <div className="dossier-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="row-k">BASE OF OPERATIONS:</span>
                    <span className="row-v">{pilot.location}</span>
                  </div>
                </div>
              </div>

              {/* One-Click Copy Button */}
              <button
                type="button"
                onClick={handleCopyEmail}
                className="copy-frequency-btn"
              >
                {copied ? (
                  <>
                    <Check size={16} color="#10b981" />
                    <span>FREQUENCY COPIED ({pilot.email})</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>COPY EMAIL TO CLIPBOARD</span>
                  </>
                )}
              </button>

              {/* Social Channels */}
              <div className="dossier-social-block">
                <span className="social-lead">PUBLIC TELEMETRY CHANNELS:</span>
                <div className="social-links-row">
                  <a
                    href={pilot.github}
                    target="_blank"
                    rel="noreferrer"
                    className="aero-social-link"
                    aria-label="GitHub Repository"
                  >
                    <GithubIcon size={19} />
                    <span>GitHub</span>
                  </a>

                  <a
                    href={pilot.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="aero-social-link"
                    aria-label="LinkedIn Network"
                  >
                    <LinkedinIcon size={19} />
                    <span>LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Mission Transmission Form */}
          <div className="comms-form-column">
            <div className="aero-card form-card">
              <div className="form-header-row">
                <h3 className="form-heading">Transmit Mission Brief</h3>
                <span className="spec-badge">ENCRYPTED // TLS 1.3</span>
              </div>

              {transmitted && (
                <div className="transmission-success-banner">
                  <Sparkles size={18} color="#10b981" />
                  <span>
                    Transmission acknowledged! Packet routed to pilot terminal. Response expected within 24 standard flight hours.
                  </span>
                </div>
              )}

              <form onSubmit={handleDispatch} className="aero-dispatch-form">
                <div className="form-two-col">
                  <div className="form-field">
                    <label htmlFor="name" className="field-label">
                      OPERATOR / YOUR NAME:
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="Dr. Theodore von Kármán"
                      className="aero-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label htmlFor="callsign" className="field-label">
                      CALLSIGN / AFFILIATION:
                    </label>
                    <input
                      id="callsign"
                      type="text"
                      placeholder="NASA Ames / SpaceX Aero"
                      className="aero-input"
                      value={formData.callsignOrOrg}
                      onChange={(e) => setFormData({ ...formData, callsignOrOrg: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="email" className="field-label">
                    TRANSMISSION RETURN EMAIL:
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="aerodynamics@laboratory.org"
                    className="aero-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="brief" className="field-label">
                    MISSION BRIEF / MESSAGE:
                  </label>
                  <textarea
                    id="brief"
                    required
                    placeholder="Detail research opportunity, wind tunnel collaboration, or model query..."
                    className="aero-textarea"
                    value={formData.missionBrief}
                    onChange={(e) => setFormData({ ...formData, missionBrief: e.target.value })}
                  ></textarea>
                </div>

                <div className="form-submit-row">
                  <button
                    type="submit"
                    disabled={isTransmitting}
                    className="btn btn-primary dispatch-submit-btn"
                  >
                    {isTransmitting ? (
                      <span>Transmitting Packet...</span>
                    ) : (
                      <>
                        <span>Transmit Dispatch</span>
                        <Send size={16} />
                      </>
                    )}
                  </button>

                  <span className="dispatch-telemetry-note">
                    Packet status: READY // PING: 18ms
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
