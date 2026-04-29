import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { trackSuggestion } from '../services/api'
import './Track.css'

const STATUS_LABEL = {
  pending: 'Pending',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}
const STATUS_CLASS = {
  pending: 'badge-pending',
  in_progress: 'badge-in_progress',
  resolved: 'badge-resolved',
}
const STATUS_ICON = {
  pending: '🕐',
  in_progress: '⚙️',
  resolved: '✅',
}
const STATUS_DESC = {
  pending: 'Your feedback is queued for review.',
  in_progress: 'The team is currently reviewing your feedback.',
  resolved: 'Your feedback has been addressed.',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('en-UG', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function StatusCard({ status }) {
  const key = (status || 'pending').toLowerCase().replace(' ', '_')
  return (
    <div className={`status-card status-card-${key}`}>
      <div className="status-card-icon">{STATUS_ICON[key] || '📋'}</div>
      <div className="status-card-info">
        <div className="status-card-label">Current Status</div>
        <span className={`badge ${STATUS_CLASS[key] || 'badge-pending'}`}>
          {STATUS_LABEL[key] || status}
        </span>
        <p className="status-card-desc">{STATUS_DESC[key] || ''}</p>
      </div>
    </div>
  )
}

export default function Track() {
  const [searchParams] = useSearchParams()
  const [code, setCode] = useState(searchParams.get('code') || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  async function handleTrack(e) {
    e.preventDefault()
    const trimmedCode = code.trim()
    if (!trimmedCode) {
      setError('Please enter a tracking code.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    setSearched(true)

    try {
      const data = await trackSuggestion(trimmedCode)
      setResult(data)
    } catch (err) {
      if (err.message === 'NOT_FOUND') {
        setError(`No submission found for code "${trimmedCode}". Please check the code and try again.`)
      } else {
        setError(err.message || 'Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    setCode('')
    setResult(null)
    setError('')
    setSearched(false)
  }

  return (
    <div className="page track-page">
      <Link to="/" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </Link>

      <div className="page-header">
        <div className="eyebrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>
          Tracking
        </div>
        <h1>Track Suggestion</h1>
        <p>Enter your unique tracking code to see the status and updates on your submission.</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleTrack} className="track-form" noValidate>
        <div className="track-input-group">
          <label className="form-label" htmlFor="tracking-code">Tracking Code</label>
          <div className="track-input-row">
            <input
              id="tracking-code"
              type="text"
              className={`form-input track-code-input ${error ? 'error' : ''}`}
              placeholder="e.g. GU-2024-XXXXX"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              aria-label="Enter tracking code"
              aria-describedby={error ? 'track-error' : 'track-hint'}
            />
            {code && (
              <button type="button" className="track-clear-btn" onClick={handleClear} aria-label="Clear input">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
          {error ? (
            <div className="form-error" id="track-error" role="alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" fill="none"/></svg>
              {error}
            </div>
          ) : (
            <div className="form-hint" id="track-hint">The tracking code was provided when you submitted your feedback</div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-lg btn-full"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <><div className="spinner" aria-hidden="true" /> Checking…</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              Check Status
            </>
          )}
        </button>
      </form>

      {/* Loading skeleton */}
      {loading && (
        <div className="track-skeleton" aria-hidden="true">
          <div className="skeleton" style={{ height: 80, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 120, marginBottom: 12 }} />
          <div className="skeleton" style={{ height: 60 }} />
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="track-result" role="region" aria-label="Submission details">
          {/* Status card */}
          <StatusCard status={result.status} />

          {/* Detail card */}
          <div className="card track-detail-card">
            <div className="track-detail-header">
              <div className="track-detail-category-pill">
                {result.category}
              </div>
              {result.created_at && (
                <span className="track-detail-date">
                  {formatDate(result.created_at)}
                </span>
              )}
            </div>
            <div className="card-body">
              <h2 className="track-result-title">{result.title}</h2>
              {result.description && (
                <p className="track-result-desc">{result.description}</p>
              )}
            </div>
          </div>

          {/* Responses */}
          {result.responses && result.responses.length > 0 ? (
            <div className="track-responses">
              <h3 className="track-responses-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Admin Responses ({result.responses.length})
              </h3>
              <div className="response-thread">
                {result.responses.map((resp, i) => (
                  <div key={resp.id || i} className="response-item">
                    <div className="response-meta">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
                      <strong>Administration</strong>
                      {resp.created_at && <span>· {formatDate(resp.created_at)}</span>}
                    </div>
                    <div className="response-text">{resp.message || resp.text || resp.content}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="track-no-response">
              <div className="empty-state-icon">💬</div>
              <p>No responses yet. The administration team will respond once they review your feedback.</p>
            </div>
          )}

          {/* Actions */}
          <div className="track-actions">
            <button className="btn btn-secondary btn-full" onClick={handleClear}>
              Track Another
            </button>
            <Link to="/submit" className="btn btn-primary btn-full">
              Submit More Feedback
            </Link>
          </div>
        </div>
      )}

      {/* Empty / not-searched state hint */}
      {!result && !loading && !searched && (
        <div className="track-hint-card">
          <div className="track-hint-icon">🔍</div>
          <h3>Don't have a tracking code?</h3>
          <p>Submit your feedback first and you'll receive a unique tracking code to follow up.</p>
          <Link to="/submit" className="btn btn-accent mt-16">
            Submit Feedback
          </Link>
        </div>
      )}
    </div>
  )
}
