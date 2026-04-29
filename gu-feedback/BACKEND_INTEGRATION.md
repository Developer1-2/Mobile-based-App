# Backend Integration Guide

This document outlines all the changes made to connect the `gu-feedback` React application to the FastAPI backend.

---

## Overview

The React student feedback app communicates with the FastAPI backend via REST API endpoints at `http://localhost:8000/api/v1`.

---

## Files Modified

### 1. `src/services/api.js`
**Changes Made:**
- Updated `BASE_URL` from `http://localhost:8000` to `http://localhost:8000/api/v1`
- Enhanced error handling with detailed response parsing
- Updated `submitSuggestion()` to send correct field names:
  - `is_anonymous` (not `anonymous`) - matches backend schema
- Updated `trackSuggestion()` with 404 detection for not found suggestions
- Added comprehensive JSDoc comments for API functions
- Added placeholder for future `getSimilarSuggestions()` backend endpoint

**Key Updates:**
```javascript
// API base URL with /api/v1 prefix
const BASE_URL = 'http://localhost:8000/api/v1'

// Submission payload mapping
await submitSuggestion({
  title: "...",
  description: "...",
  category: "...",
  is_anonymous: true,  // ← Renamed from 'anonymous'
})
```

---

### 2. `src/pages/Submit.jsx`
**Changes Made:**
- Updated `CATEGORIES` array to match backend schema:
  - Removed: `Facilities`, `WiFi`
  - Added: `Infrastructure`, `Student Services`, `Library`, `Health`, `Sports`, `Technology`
  - Kept: `Academics`, `Administration`
- Fixed field name mapping in form submission:
  - Changed `anonymous` → `is_anonymous`

**Category Mapping:**
```javascript
const CATEGORIES = [
  'Academics',
  'Infrastructure',
  'Student Services',
  'Library',
  'Health',
  'Sports',
  'Technology',
  'Administration'
]
```

---

### 3. `src/pages/Home.jsx`
**Changes Made:**
- Updated category icons and labels to match backend categories
- Added new categories with appropriate emoji icons:
  - 👥 Student Services
  - 📖 Library
  - ⚕️ Health
  - ⚽ Sports
  - 💻 Technology

**New Categories Display:**
```javascript
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
```

---

### 4. `src/hooks/useSimilarSuggestions.js`
**Changes Made:**
- Updated `MOCK_SIMILAR` array with realistic backend-style suggestions
- Changed status values to match backend:
  - Removed: `In Progress` → Changed to `in_progress` (lowercase with underscore)
  - Updated statuses to: `pending`, `in_progress`, `resolved`
- Updated category names to match backend categories
- Improved suggestion matching algorithm accuracy

**Updated Mock Data Structure:**
```javascript
const MOCK_SIMILAR = [
  {
    id: 1,
    title: 'Poor Internet Connectivity in Hostels',
    category: 'Technology',
    status: 'in_progress'  // ← Matches backend
  },
  // ... more suggestions
]
```

---

### 5. `vite.config.js`
**Status:** ✅ No changes needed
- Already configured with correct localhost:8000 URL in service worker cache settings
- PWA runtime caching properly set for API responses

---

### 6. `src/pages/Track.jsx`
**Status:** ✅ No changes needed
- Already properly maps backend status values
- Handles multiple response field names (message, text, content)
- Correctly displays admin responses

---

### 7. `src/components/Navbar.jsx`
**Status:** ✅ No changes needed
- Navigation structure is correct
- Routes properly connect to form pages

---

## API Endpoints

### Submit Feedback
```http
POST /api/v1/suggestions
Content-Type: application/json

{
  "title": "string (5-100 chars)",
  "description": "string (20-600 chars)",
  "category": "Technology|Academics|Infrastructure|...",
  "is_anonymous": true
}

Response:
{
  "id": 1,
  "title": "...",
  "description": "...",
  "category": "Technology",
  "status": "pending",
  "duplicate_count": 1,
  "tracking_code": "GU-1234",
  "created_at": "2024-01-30T10:00:00",
  "updated_at": "2024-01-30T10:00:00"
}
```

### Track Suggestion
```http
GET /api/v1/suggestions/GU-1234

Response:
{
  "id": 1,
  "title": "...",
  "description": "...",
  "category": "Technology",
  "status": "pending|in_progress|resolved",
  "duplicate_count": 5,
  "tracking_code": "GU-1234",
  "created_at": "2024-01-30T10:00:00",
  "updated_at": "2024-01-30T10:00:00",
  "submissions": [...],
  "responses": [
    {
      "id": 1,
      "message": "We are reviewing this issue...",
      "created_at": "2024-01-30T15:00:00"
    }
  ]
}
```

---

## Status Mappings

The app correctly maps status values between frontend and backend:

| Backend Value | Frontend Label | Icon | Color Class |
|---|---|---|---|
| `pending` | Pending | 🕐 | badge-pending |
| `in_progress` | In Progress | ⚙️ | badge-in_progress |
| `resolved` | Resolved | ✅ | badge-resolved |

---

## Error Handling

The API service includes comprehensive error handling:

```javascript
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
```

Errors are displayed to users with clear messages from the backend.

---

## Configuration

### Development
- Backend: `http://localhost:8000/api/v1`
- Frontend: `http://localhost:5173` (Vite default)

### Production
Update `src/services/api.js`:
```javascript
const BASE_URL = 'https://api.example.com/api/v1'
```

Or use environment variables:
```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
```

---

## Rate Limiting

The backend enforces rate limiting on suggestion submissions:
- **Limit**: 5 requests per minute per device
- **Device Hash**: SHA256 of IP address + User Agent
- The frontend sends requests normally; server handles rate limiting

If rate limited, backend returns 429 status with error message.

---

## Similarity Detection

Backend uses RapidFuzz (token_set_ratio) to detect similar submissions:
- **Threshold**: 80% similarity
- **Automatic Linking**: Similar submissions are linked to existing suggestions
- **Duplicate Count**: Incremented when linking to existing suggestion
- Frontend provides local preview of similar suggestions (mock data)

---

## Features Per Page

### Home Page (`/`)
- Displays category chips that link to `/submit`
- Shows feature pills and footer note
- ✅ Working with backend categories

### Submit Page (`/submit`)
- Form validates: title (5-100 chars), description (20-600 chars)
- Category dropdown with all backend categories
- Anonymous toggle (default: true)
- Shows similar suggestions as you type (local matching)
- On submit: Sends POST to backend, displays tracking code
- ✅ Fully integrated with backend

### Track Page (`/track`)
- Input for tracking code (accepts URL search param `?code=GU-1234`)
- On submit: Fetches suggestion by tracking code
- Displays current status with icon & description
- Shows all admin responses
- ✅ Fully integrated with backend

---

## Testing the Integration

### 1. Start Backend
```bash
cd app/
python -m uvicorn app.main:app --reload
```

### 2. Start Frontend
```bash
cd gu-feedback/
npm run dev
```

### 3. Test Submission
1. Open `http://localhost:5173`
2. Click "Submit Feedback"
3. Fill in form with valid data
4. Submit
5. Copy tracking code

### 4. Test Tracking
1. Click "Track Suggestion"
2. Paste tracking code
3. Verify suggestion details and responses appear

---

## Known Limitations

1. **Similar Suggestions Hook**: Currently uses local mock data. Can be upgraded to query backend endpoint.
2. **Service Worker Caching**: Caches API responses for 5 minutes. Clear cache during development if needed.
3. **No Admin Dashboard**: This app is student-facing only. Admin dashboard is in `gulu-university-dashboard.html`.

---

## Future Enhancements

1. Implement actual similarity search by calling backend API
2. Add image/attachment upload support
3. Implement email notifications for tracking updates
4. Add categories/filters to home page
5. Social sharing of tracking links
6. Multilingual support (English + Luganda)

---

## Support

For issues or questions:
- Check backend logs: `python -m uvicorn app.main:app --reload`
- Check browser console: F12 → Console tab
- Check Network tab for API call details
- Verify backend URL in `src/services/api.js`
