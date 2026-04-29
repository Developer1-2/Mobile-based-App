import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="Go to home">
          <img src="/logo.png" alt="" className="navbar-logo" aria-hidden="true" />
          <div className="navbar-title-group">
            <span className="navbar-name">Gulu University</span>
            <span className="navbar-tagline">Feedback System</span>
          </div>
        </Link>

        <div className="navbar-actions">
          <Link
            to="/submit"
            className={`navbar-btn ${pathname === '/submit' ? 'active' : ''}`}
            aria-current={pathname === '/submit' ? 'page' : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>Submit</span>
          </Link>
          <Link
            to="/track"
            className={`navbar-btn ${pathname === '/track' ? 'active' : ''}`}
            aria-current={pathname === '/track' ? 'page' : undefined}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span>Track</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
