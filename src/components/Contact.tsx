import React, { useState } from 'react';
import { Mail, MapPin, Send, Copy, Check, Sparkles, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PORTFOLIO_DATA } from '../data/portfolio';

export const Contact: React.FC = () => {
  const { personal } = PORTFOLIO_DATA;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(personal.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API network latency
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#8b5cf6', '#06b6d4', '#ec4899'],
        });
      } catch {
        // Fallback gracefully if confetti fails
      }

      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 6000);
    }, 600);
  };

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">
            <MessageSquare size={14} /> Let's Connect
          </span>
          <h2 className="section-title">Get In Touch</h2>
          <p className="section-subtitle">
            Have a project in mind, a potential role, or simply want to say hello? My inbox is always open.
          </p>
        </div>

        <div className="contact-grid">
          {/* Left Column: Direct info & Copy email */}
          <div className="contact-info-cards">
            <div className="glass-card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px', color: '#fff' }}>
                Let's discuss something great together
              </h3>
              <p style={{ fontSize: '0.95rem', marginBottom: '24px' }}>
                I am actively considering full-stack engineering roles, contracts, and exciting open-source collaborations.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="contact-icon-box">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Direct Email</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{personal.email}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="contact-icon-box">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Location</div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{personal.location}</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="copy-email-btn"
                style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }}
              >
                {copied ? (
                  <>
                    <Check size={16} color="#10b981" /> Copied {personal.email}!
                  </>
                ) : (
                  <>
                    <Copy size={16} /> Copy email to clipboard
                  </>
                )}
              </button>
            </div>

            <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.05))' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Sparkles size={20} color="#38bdf8" />
                <h4 style={{ color: '#fff', fontSize: '1.05rem' }}>Fast Response Time</h4>
              </div>
              <p style={{ fontSize: '0.88rem' }}>
                Messages are forwarded directly to my personal device. You can expect a response within 24 hours on business days.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="glass-card">
            <form onSubmit={handleSubmit} className="contact-form">
              {submitted && (
                <div className="form-status success">
                  <Sparkles size={18} />
                  <span>Thank you! Your message was sent successfully. I'll get back to you soon.</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Your Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder="John Doe"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="john@example.com"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject" className="form-label">
                  Subject
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  placeholder="Project Opportunity / Collaboration"
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  placeholder="Tell me about your project, timeline, or just say hi..."
                  className="form-textarea"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start', padding: '14px 32px' }}
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    Send Message <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
