# Gulu University Student Feedback System

## Overview
A FastAPI-based backend application that manages student feedback and suggestions with an admin dashboard interface.

## Project Structure
```
app/
├── __init__.py
├── models/          # SQLAlchemy models
│   ├── __init__.py
│   └── suggestion.py
├── schemas/         # Pydantic schemas
│   ├── __init__.py
│   └── suggestion.py
├── routes/          # API endpoints
│   ├── __init__.py
│   ├── auth.py      # Admin login
│   ├── admin.py     # Admin endpoints
│   └── suggestion.py # Student endpoints
├── services/        # Business logic
│   ├── __init__.py
│   └── suggestion_service.py
├── utils/           # Utilities
│   ├── __init__.py
│   └── helpers.py
├── database.py      # SQLAlchemy configuration
└── main.py          # FastAPI app initialization

requirements.txt
.env.example
gulu-university-dashboard.html  # Admin dashboard frontend
```

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Database
Copy `.env.example` to `.env` and update with your MySQL credentials:
```bash
cp .env.example .env
```

Update `.env` with your database URL:
```
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/mobile_app_db
```

The application will automatically create the database and tables on startup.

### 3. Run the Server
```bash
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The server will start at `http://127.0.0.1:8000`

## API Endpoints

### Authentication
- **POST** `/api/v1/admin/login` - Admin login
  - Request: `{ "email": "admin@gulu.ac.ug", "password": "password123" }`
  - Response: `{ "access_token": "...", "token_type": "bearer", "admin": {...} }`

- **POST** `/api/v1/admin/logout` - Admin logout

### Student Suggestions (Public)
- **POST** `/api/v1/suggestions` - Submit a new suggestion
  - Rate Limited: 5 requests per minute per device
  - Request Schema: `SuggestionCreate`
  - Response: `SuggestionResponse` with tracking code

- **GET** `/api/v1/suggestions/{tracking_code}` - Get suggestion details
  - Returns: Suggestion with all submissions and responses

### Admin Dashboard
- **GET** `/api/v1/admin/suggestions` - List all suggestions
  - Query Parameters:
    - `category`: Filter by category
    - `status`: Filter by status (pending, in_progress, resolved)

- **GET** `/api/v1/admin/suggestions/{id}` - Get suggestion detail with submissions

- **PUT** `/api/v1/admin/suggestions/{id}/status` - Update suggestion status
  - Request: `{ "status": "in_progress" | "pending" | "resolved" }`

- **POST** `/api/v1/admin/suggestions/{id}/response` - Add admin response
  - Request: `{ "message": "Response text..." }`

- **GET** `/api/v1/admin/analytics/trending` - Get analytics data
  - Returns: Top categories, top issues (last 7 days), status breakdown

## Dashboard Frontend

### Access
Open `gulu-university-dashboard.html` in a modern web browser.

### Login Credentials (Demo Mode)
- **Email**: `admin@gulu.ac.ug`
- **Password**: `password123`

### Features

**Dashboard Tab**
- Overview statistics (total, pending, in progress, resolved)
- Trending categories (last 7 days)
- Top issues by report count
- High priority issues table

**Suggestions Tab**
- Browse all student suggestions
- Search and filter by category, status
- View individual suggestion details
- Update suggestion status
- Add admin responses

**Analytics Tab**
- Trending categories with percentages
- Weekly activity chart
- Top issues by report count
- Status distribution breakdown

## Database Models

### Suggestion
- Grouped issue/feedback with tracking code
- Track status: pending → in_progress → resolved
- Count duplicate submissions

### SuggestionSubmission
- Individual student submissions
- Links to parent Suggestion
- Can be anonymous
- Device hash for rate limiting

### Response
- Admin responses to suggestions
- Timestamp tracking

## Similarity Detection

The system uses **RapidFuzz** (token_set_ratio) to detect similar suggestions:
- Similarity threshold: 80%
- Automatically links duplicate submissions to existing suggestions
- Increases duplicate_count on the parent suggestion

## Rate Limiting

Student suggestion submissions are rate-limited:
- **Limit**: 5 requests per minute per device
- **Device Hash**: SHA256 of IP address + User Agent
- Enforced via SlowAPI

## Environment Variables

Required variables (see `.env.example`):
- `DATABASE_URL` - MySQL connection string
- `SERVER_HOST` - API server host (default: 127.0.0.1)
- `SERVER_PORT` - API server port (default: 8000)

## Database Creation

The application automatically:
1. Creates MySQL database if it doesn't exist
2. Creates all required tables on startup
3. Sets up relationships and constraints

## Frontend Integration

The HTML dashboard connects to the backend via:
- Base URL: `http://localhost:8000/api/v1`
- Fallback to mock data when API is unavailable
- JWT token-based authentication
- Real-time data updates

## Development

### Run Server with Auto-Reload
```bash
python -m uvicorn app.main:app --reload
```

### Check Health
```bash
curl http://localhost:8000/
```

### API Documentation
Interactive API docs: `http://localhost:8000/docs` (Swagger UI)

## Production Deployment

For production use, ensure:
1. Update CORS allowed origins
2. Use proper JWT signing with python-jose
3. Hash admin passwords with bcrypt
4. Implement actual authentication with database
5. Use environment variables for all sensitive data
6. Set up HTTPS/SSL
7. Configure proper database backups
8. Add rate limiting with persistence (Redis)

## Troubleshooting

**Database Connection Error**
- Ensure MySQL server is running
- Check DATABASE_URL in .env
- Verify credentials and database name

**Port Already in Use**
- Change port in uvicorn command: `--port 8001`
- Or kill existing process on port 8000

**CORS Errors in Frontend**
- Verify backend is running
- Check BASE_URL in HTML matches your server
- Ensure CORS middleware is enabled

**Import Errors**
- Ensure `app` folder has `__init__.py` files
- Run from project root directory
- Use: `python -m uvicorn app.main:app`
