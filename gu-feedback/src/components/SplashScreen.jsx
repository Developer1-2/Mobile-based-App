import React from 'react'
import './SplashScreen.css'

export default function SplashScreen() {
  return (
    <div className="splash" role="status" aria-label="Loading Gulu University Feedback">
      <div className="splash-logo">
        <img src="/logo.png" alt="Gulu University" width="110" height="110" />
      </div>
      <div className="splash-text">
        <h1 className="splash-uni-name">Gulu University</h1>
        <p className="splash-subtitle">Student Feedback System</p>
      </div>
      <div className="splash-bar">
        <div className="splash-bar-fill" />
      </div>
      <p className="splash-version">Empowering student voices</p>
    </div>
  )
}
