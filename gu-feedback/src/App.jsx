import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import SplashScreen from './components/SplashScreen'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Submit from './pages/Submit'
import Track from './pages/Track'

function AppContent() {
  const location = useLocation()

  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/track" element={<Track />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2800)
    return () => clearTimeout(timer)
  }, [])

  if (showSplash) return <SplashScreen />

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
