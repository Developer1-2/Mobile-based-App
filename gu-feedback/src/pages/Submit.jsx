import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { submitSuggestion } from '../services/api'
import useSimilarSuggestions from '../hooks/useSimilarSuggestions'
import './Submit.css'

const CATEGORIES = ['Academics', 'Infrastructure', 'Student Services', 'Library', 'Health', 'Sports', 'Technology', 'Administration']
const DESC_MIN = 20
const DESC_MAX = 600
const TITLE_MIN = 5
const TITLE_MAX = 100

const STATUS_COLORS = {
  'Pending': 'badge-pending',
  'In Progress': 'badge-in_progress',
  'Resolved': 'badge-resolved',
}

function validate(fields) {
  const errors = {}
  if (!fields.title.trim()) errors.title = 'Title is required.'
  else if (fields.title.trim().length < TITLE_MIN) errors.title = `Title must be at least ${TITLE_MIN} characters.`
  else if (fields.title.trim().length > TITLE_MAX) errors.title = `Title cannot exceed ${TITLE_MAX} characters.`
  if (!fields.description.trim()) errors.description = 'Description is required.'
  else if (fields.description.trim().length < DESC_MIN) errors.description = `Description must be at least ${DESC_MIN} characters.`
  else if (fields.description.trim().length > DESC_MAX) errors.description = `Description cannot exceed ${DESC_MAX} characters.`
  if (!fields.category) errors.category = 'Please select a category.'
  return errors
}

export default function Submit() {
  const [fields, setFields] = useState({ title: '', description: '', category: '', anonymous: true })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [result, setResult] = useState(null)
  const [apiError, setApiError] = useState('')
  const [copied, setCopied] = useState(false)
  const [showSimilar, setShowSimilar] = useState(true)
  const descRef = useRef(null)

  const similar = useSimilarSuggestions(fields.title)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setFields(f => ({ ...f, [name]: val }))
    if (touched[name]) {
      const newErrors = validate({ ...fields, [name]: val })
      setErrors(e => ({ ...e, [name]: newErrors[name] }))
    }
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched(t => ({ ...t, [name]: true }))
    const newErrors = validate(fields)
    setErrors(e => ({ ...e, [name]: newErrors[name] }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const allTouched = { title: true, description: true, category: true }
    setTouched(allTouched)
    const errs = validate(fields)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    setStatus('loading')
    setApiError('')

    try {
      const data = await submitSuggestion({
        title: fields.title.trim(),
        description: fields.description.trim(),
        category: fields.category,
        is_anonymous: fields.anonymous,
      })
      setResult(data)
      setStatus('success')
      setFields({ title: '', description: '', category: '', anonymous: true })
      setTouched({})
      setErrors({})
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  function handleCopyCode() {
    if (result?.tracking_code) {
      navigator.clipboard.writeText(result.tracking_code).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  function handleReset() {
    setStatus('idle')
    setResult(null)
    setCopied(false)
    setShowSimilar(true)
  }

  const descLen = fields.description.length
  const descCounterClass = descLen > DESC_MAX ? 'over' : descLen > DESC_MAX * 0.85 ? 'warn' : ''

  if (status === 'success' && result) {
    return (
      <div className="page submit-page">
        <div className="success-screen">
          <div className="success-icon-wrap">
            <div className="success-icon">✓</div>
          </div>
          <h2 className="success-title">Feedback Submitted!</h2>
          <p className="success-desc">
            Your feedback has been received. Use the tracking code below to check its status.
          </p>

          <div className="tracking-code-box">
            <div className="tracking-code-label">Your Tracking Code</div>
            <div className="tracking-code-value">{result.tracking_code}</div>
            <div className="tracking-code-hint">Save this code — you'll need it to track your submission</div>
            <button className="copy-btn" onClick={handleCopyCode}>
              {copied ? (
                <><span>✓</span> Copied!</>
              ) : (
                <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy Code</>
              )}
            </button>
          </div>

          {result.title && (
            <div className="success-detail">
              <div className="success-detail-row">
                <span className="success-detail-label">Title</span>
                <span className="success-detail-value">{result.title}</span>
              </div>
              <div className="success-detail-row">
                <span className="success-detail-label">Category</span>
                <span className="success-detail-value">{result.category}</span>
              </div>
              <div className="success-detail-row">
                <span className="success-detail-label">Status</span>
                <span className={`badge ${STATUS_COLORS['Pending']}`}>
                  <span className="badge-dot" />Pending
                </span>
              </div>
            </div>
          )}

          <div className="success-actions">
            <Link to="/track" className="btn btn-primary btn-full">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Track This Suggestion
            </Link>
            <button className="btn btn-secondary btn-full" onClick={handleReset}>
              Submit Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page submit-page">
      <Link to="/" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
        Back
      </Link>

      <div className="page-header">
        <div className="eyebrow">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/></svg>
          New Submission
        </div>
        <h1>Submit Feedback</h1>
        <p>Share your suggestion, complaint, or feedback with the university administration.</p>
      </div>

      {status === 'error' && (
        <div className="alert alert-error mb-16" role="alert">
          <span className="alert-icon">⚠️</span>
          <div>{apiError}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="submit-form">

        {/* Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="title">
            Title <span className="required">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`form-input ${touched.title && errors.title ? 'error' : ''}`}
            placeholder="Brief title for your feedback…"
            value={fields.title}
            onChange={handleChange}
            onBlur={handleBlur}
            maxLength={TITLE_MAX + 10}
            autoComplete="off"
            aria-describedby={errors.title ? 'title-error' : undefined}
            aria-invalid={!!(touched.title && errors.title)}
          />
          {touched.title && errors.title && (
            <div className="form-error" id="title-error" role="alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" fill="none"/></svg>
              {errors.title}
            </div>
          )}
          <div className="form-hint">{TITLE_MIN}–{TITLE_MAX} characters</div>
        </div>

        {/* Similar suggestions hint */}
        {showSimilar && similar.length > 0 && fields.title.trim().length >= 5 && (
          <div className="suggestions-panel" role="region" aria-label="Similar existing suggestions">
            <div className="suggestions-panel-header">
              <span className="suggestions-panel-title">💡 Similar suggestions found</span>
              <button
                type="button"
                className="suggestions-close"
                onClick={() => setShowSimilar(false)}
                aria-label="Dismiss similar suggestions"
              >×</button>
            </div>
            {similar.map(s => (
              <div key={s.id} className="suggestion-item">
                <div className="suggestion-item-title">{s.title}</div>
                <div className="suggestion-item-meta">
                  <span>{s.category}</span>
                  <span>·</span>
                  <span className={`badge ${STATUS_COLORS[s.status] || ''}`} style={{ padding: '1px 8px', fontSize: '0.68rem' }}>{s.status}</span>
                </div>
              </div>
            ))}
            <p className="suggestions-note">These may already be in progress. You can still submit your own.</p>
          </div>
        )}

        {/* Category */}
        <div className="form-group">
          <label className="form-label" htmlFor="category">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            className={`form-select ${touched.category && errors.category ? 'error' : ''}`}
            value={fields.category}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-describedby={errors.category ? 'category-error' : undefined}
            aria-invalid={!!(touched.category && errors.category)}
          >
            <option value="">Select a category…</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {touched.category && errors.category && (
            <div className="form-error" id="category-error" role="alert">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" fill="none"/></svg>
              {errors.category}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="description">
            Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            ref={descRef}
            className={`form-textarea ${touched.description && errors.description ? 'error' : ''}`}
            placeholder="Please describe your suggestion or concern in detail…"
            value={fields.description}
            onChange={handleChange}
            onBlur={handleBlur}
            rows={5}
            aria-describedby={errors.description ? 'desc-error' : 'desc-hint'}
            aria-invalid={!!(touched.description && errors.description)}
          />
          <div className="form-desc-footer">
            {touched.description && errors.description ? (
              <div className="form-error" id="desc-error" role="alert">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01" stroke="white" strokeWidth="2" fill="none"/></svg>
                {errors.description}
              </div>
            ) : (
              <div className="form-hint" id="desc-hint">{DESC_MIN}–{DESC_MAX} characters</div>
            )}
            <div className={`char-counter ${descCounterClass}`}>
              {descLen}/{DESC_MAX}
            </div>
          </div>
        </div>

        {/* Anonymous toggle */}
        <div className="form-group">
          <label className="checkbox-group" htmlFor="anonymous">
            <input
              id="anonymous"
              name="anonymous"
              type="checkbox"
              checked={fields.anonymous}
              onChange={handleChange}
            />
            <div>
              <div className="checkbox-label">Submit anonymously</div>
              <div className="checkbox-desc">Your name will not be attached to this submission</div>
            </div>
          </label>
        </div>

        {/* Anon notice */}
        {fields.anonymous && (
          <div className="alert alert-info mb-16">
            <span className="alert-icon">🔒</span>
            <div>Your identity is protected. Use the tracking code we'll give you to follow up — no login required.</div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary btn-lg btn-full"
          disabled={status === 'loading'}
          aria-busy={status === 'loading'}
        >
          {status === 'loading' ? (
            <><div className="spinner" aria-hidden="true" /> Submitting…</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Submit Feedback
            </>
          )}
        </button>

        <p className="submit-legal">
          By submitting, you agree that your feedback will be reviewed by authorized university staff. All submissions are logged with a unique code.
        </p>
      </form>
    </div>
  )
}
