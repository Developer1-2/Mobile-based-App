import React from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const features = [
  { icon: '🔒', label: 'Anonymous', desc: 'Submit without revealing your identity' },
  { icon: '📍', label: 'Trackable', desc: 'Get a code to follow up on your submission' },
  { icon: '⚡', label: 'Fast', desc: 'Quick 1-minute submission process' },
]

const categories = [
  { icon: '📚', label: 'Academics' },
  { icon: '🏛️', label: 'Infrastructure' },
  { icon: '👥', label: 'Student Services' },
  { icon: '📖', label: 'Library' },
  { icon: '⚕️', label: 'Health' },
  { icon: '⚽', label: 'Sports' },
  { icon: '💻', label: 'Technology' },
  { icon: '🏢', label: 'Administration' },
]

export default function Home() {
  return (
    <div className="page home-page">
      {/* Hero */}
      <div className="home-hero">
        <div className="home-hero-badge">
          <span className="dot" />
          Official University Portal
        </div>
        <h1 className="home-hero-title">
          Your Voice<br />
          <em>Matters Here</em>
        </h1>
        <p className="home-hero-desc">
          Submit suggestions, complaints, and feedback to Gulu University. Anonymously and securely.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="home-cta">
        <Link to="/submit" className="btn btn-primary btn-lg btn-full home-cta-btn home-cta-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
          </svg>
          Submit Feedback
        </Link>
        <Link to="/track" className="btn btn-secondary btn-lg btn-full home-cta-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Track Suggestion
        </Link>
      </div>

      {/* Feature Pills */}
      <div className="home-features">
        {features.map(f => (
          <div key={f.label} className="feature-pill">
            <span className="feature-pill-icon">{f.icon}</span>
            <div>
              <div className="feature-pill-label">{f.label}</div>
              <div className="feature-pill-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="home-categories">
        <p className="home-categories-title">Submit feedback on</p>
        <div className="home-category-grid">
          {categories.map(c => (
            <Link key={c.label} to="/submit" className="category-chip">
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer note */}
      <p className="home-footer-note">
        🛡️ All submissions are treated with strict confidentiality.
        Your feedback helps improve Gulu University.
      </p>
    </div>
  )
}
