# Gulu University — Student Feedback System

A mobile-first Progressive Web App (PWA) for students at Gulu University to submit and track feedback anonymously.

---

## Features

- 📝 **Submit Feedback** — Title, description, category, anonymous toggle
- 🔍 **Track Suggestions** — Enter tracking code to check status & admin responses
- 💡 **Similar Suggestions** — Lightweight auto-suggest as you type (local matching)
- 📱 **PWA** — Installable, offline-capable, mobile-first
- 🔒 **Anonymous** — No account required; tracking code system
- ⚡ **Fast** — Optimised for low-bandwidth connections

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| API | Fetch API |
| Styling | Plain CSS (design tokens via CSS variables) |
| PWA | vite-plugin-pwa + Workbox |
| Fonts | DM Serif Display + DM Sans (Google Fonts) |

---

## Backend Integration

This app connects to the FastAPI backend at `http://localhost:8000/api/v1`.

### Endpoints Used

| Method | Endpoint | Purpose | Request |
|--------|----------|---------|---------|
| POST | `/suggestions` | Submit feedback | `{ title, description, category, is_anonymous }` |
| GET | `/suggestions/{tracking_code}` | Track submission | Returns suggestion with responses |

### Response Format

**Submission Response:**
```json
{
  "id": 1,
  "title": "...",
  "description": "...",
  "category": "...",
  "status": "pending",
  "duplicate_count": 1,
  "tracking_code": "GU-1234",
  "created_at": "2024-01-30T10:00:00",
  "updated_at": "2024-01-30T10:00:00"
}
```

**Track Response:**
```json
{
  "id": 1,
  "title": "...",
  "description": "...",
  "category": "Academics|Infrastructure|Student Services|Library|Health|Sports|Technology|Administration",
  "status": "pending|in_progress|resolved",
  "duplicate_count": 5,
  "tracking_code": "GU-1234",
  "created_at": "2024-01-30T10:00:00",
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

## Categories Supported

- ✏️ Academics
- 🏛️ Infrastructure
- 👥 Student Services
- 📖 Library
- ⚕️ Health
- ⚽ Sports
- 💻 Technology
- 🏢 Administration

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running at `http://localhost:8000`

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
├── main.jsx              # React entry point
├── App.jsx               # Router & main layout
├── components/
│   ├── Navbar.jsx        # Top navigation
│   └── SplashScreen.jsx  # Loading splash
├── pages/
│   ├── Home.jsx          # Landing page
│   ├── Submit.jsx        # Feedback form
│   └── Track.jsx         # Status tracker
├── services/
│   └── api.js            # API client (connects to backend)
├── hooks/
│   └── useSimilarSuggestions.js  # Local similarity matching
├── styles/
│   └── global.css        # Design tokens & resets
```

---

## API Integration Details

### Submit Feedback

The `Submit` page sends POST requests to `/api/v1/suggestions`:

```javascript
// From: src/pages/Submit.jsx
await submitSuggestion({
  title: "string (5-100 chars)",
  description: "string (20-600 chars)",
  category: "Academics | Infrastructure | ...",
  is_anonymous: true/false,  // ← Note: is_anonymous (not anonymous)
})
```

Backend automatically:
- Generates unique `tracking_code` (GU-XXXX format)
- Checks for similar submissions (using RapidFuzz)
- Links duplicates to existing suggestions
- Applies rate limiting (5 requests/minute per device)

### Track Feedback

The `Track` page sends GET requests to `/api/v1/suggestions/{tracking_code}`:

```javascript
// From: src/pages/Track.jsx
const result = await trackSuggestion("GU-1234")
```

Returns full suggestion object with:
- Current status (pending / in_progress / resolved)
- All admin responses
- Metadata (category, dates, duplicate count)

---

## Configuration

The API base URL is configured in `src/services/api.js`:

```javascript
const BASE_URL = 'http://localhost:8000/api/v1'
```

For production, update this to your deployed backend URL.

---

## PWA Configuration

This app is a Progressive Web App with:
- Service Worker for offline support
- App manifest for installation
- Runtime caching of API responses (5 min TTL)
- Home screen installation capability

See `vite.config.js` for PWA configuration.

---

## Development

### Hot Module Reloading
```bash
npm run dev
```
Auto-reloads on file changes.

### Build & Preview
```bash
npm run build
npm run preview
```

### Browser DevTools
- React DevTools for component inspection
- Network tab to monitor API calls
- PWA tab to manage service worker

---

## Deployment

### Build for Production
```bash
npm run build
```

Output goes to `dist/` directory.

### Deploy to Static Hosting
The `dist` folder can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3
- Any static host

### Environment Variables

Create `.env.local` (if needed):
```env
VITE_API_BASE_URL=https://api.example.com/api/v1
```

Then update `src/services/api.js`:
```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
```

---

## Troubleshooting

**CORS Errors in Console**
- Ensure backend has CORS middleware enabled
- Check `BASE_URL` in `api.js` matches your backend

**Tracking Code Not Found**
- Verify tracking code format (GU-XXXX)
- Check backend database has the submission
- Confirm rate limiting isn't blocking requests

**PWA Not Installing**
- Ensure served over HTTPS (localhost works for dev)
- Check manifest.json exists in `public/`
- Check service worker registration in console

**API Calls Timing Out**
- Check backend is running on port 8000
- Verify network connectivity
- Check browser DevTools Network tab

---

## License

Gulu University — Student Feedback System


# Preview production build
npm run preview
```

---

## Project Structure

```
gu-feedback/
├── public/
│   ├── logo.png              # University logo (PNG)
│   ├── manifest.json         # PWA manifest
│   ├── sw.js                 # Service worker (offline support)
│   ├── offline.html          # Offline fallback page
│   └── icons/
│       ├── icon-192.png      # PWA icon 192×192
│       └── icon-512.png      # PWA icon 512×512
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Root component, routing, splash logic
│   ├── styles/
│   │   └── global.css        # Global design system & CSS variables
│   ├── components/
│   │   ├── SplashScreen.jsx  # 2.5s branded splash on load
│   │   ├── SplashScreen.css
│   │   ├── Navbar.jsx        # Top navigation bar
│   │   └── Navbar.css
│   ├── pages/
│   │   ├── Home.jsx          # Landing page with CTA buttons
│   │   ├── Home.css
│   │   ├── Submit.jsx        # Feedback submission form
│   │   ├── Submit.css
│   │   ├── Track.jsx         # Tracking code lookup
│   │   └── Track.css
│   ├── services/
│   │   └── api.js            # API layer (submitSuggestion, trackSuggestion)
│   └── hooks/
│       └── useSimilarSuggestions.js  # Debounced similar-suggestions hook
├── scripts/
│   └── gen-icons.js          # Helper to generate PWA icons
├── vite.config.js
├── package.json
└── index.html
```

---

## API Integration

**Base URL:** `http://localhost:8000`

### POST `/suggestions`
```json
{
  "title": "Library closing time should be extended",
  "description": "The library closes at 8pm which is too early for students who have evening lectures.",
  "category": "Facilities",
  "anonymous": true
}
```
**Response:**
```json
{
  "tracking_code": "GU-2024-ABCDE",
  "title": "Library closing time should be extended",
  "category": "Facilities",
  "status": "pending"
}
```

### GET `/suggestions/{tracking_code}`
**Response:**
```json
{
  "tracking_code": "GU-2024-ABCDE",
  "title": "Library closing time should be extended",
  "description": "...",
  "category": "Facilities",
  "status": "in_progress",
  "created_at": "2024-03-15T10:30:00Z",
  "responses": [
    {
      "id": 1,
      "message": "Thank you for your feedback. We are reviewing this request.",
      "created_at": "2024-03-16T09:00:00Z"
    }
  ]
}
```

**Status values:** `pending` | `in_progress` | `resolved`

---

## Design System

CSS variables defined in `src/styles/global.css`:

| Variable | Value | Usage |
|---|---|---|
| `--primary` | `#44A08D` | Eucalyptus — buttons, links, accents |
| `--accent` | `#F4C542` | Picasso — highlights, warnings |
| `--background` | `#FFFFFF` | Page background |
| `--text` | `#1a2e28` | Body text |
| `--font-display` | DM Serif Display | Headings |
| `--font-body` | DM Sans | Body text |

---

## PWA Setup

For full PWA support including install prompts:

1. **Generate real PNG icons** from `public/logo.png`:
   ```bash
   # Using sharp CLI or similar
   npx @squoosh/cli --resize '{"width":192}' -d public/icons public/logo.png
   ```
   Place `icon-192.png` and `icon-512.png` in `public/icons/`.

2. **Serve over HTTPS** in production (required for service worker).

3. **Test PWA score** with Chrome DevTools → Lighthouse → PWA audit.

---

## Browser Support

Targets modern mobile browsers: Chrome 90+, Safari 14+, Firefox 88+, Samsung Internet 14+.

---

## License

For Gulu University internal use.
