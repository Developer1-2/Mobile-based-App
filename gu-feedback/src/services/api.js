const BASE_URL = 'http://localhost:8000/api/v1'

async function handleResponse(res) {
  if (!res.ok) {
    let message = `Error ${res.status}`
    try {
      const data = await res.json()
      message = data.detail || data.message || message
    } catch {}
    throw new Error(message)
  }
  return res.json()
}

/**
 * Submit a new student suggestion
 * @param {Object} payload - Suggestion data
 * @returns {Promise<Object>} - Response with tracking_code
 */
export async function submitSuggestion(payload) {
  const res = await fetch(`${BASE_URL}/suggestions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      is_anonymous: payload.is_anonymous,
    }),
  })
  return handleResponse(res)
}

/**
 * Track a suggestion by tracking code
 * @param {string} trackingCode - The unique tracking code
 * @returns {Promise<Object>} - Suggestion details with responses
 */
export async function trackSuggestion(trackingCode) {
  const res = await fetch(`${BASE_URL}/suggestions/${encodeURIComponent(trackingCode)}`)
  if (res.status === 404) throw new Error('NOT_FOUND')
  return handleResponse(res)
}

/**
 * Get similar suggestions based on text
 * For demo: uses local matching. In production: call backend API
 * @param {string} title - Search title
 * @returns {Promise<Array>} - Similar suggestions
 */
export async function getSimilarSuggestions(title) {
  // Note: This is a lightweight client-side operation
  // In production, you could call: GET /admin/suggestions?search=title
  // For now, returns empty array - the hook handles local filtering
  return []
}
