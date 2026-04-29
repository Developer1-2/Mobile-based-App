from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import suggestion, admin, auth
import uvicorn

# Create all database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Mobile-Based Suggestion App API",
    description="API for managing suggestions and student feedback",
    version="1.0.0"
)

# Add CORS middleware - allow all origins for now
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event to create tables
@app.on_event("startup")
async def startup_event():
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint for API health check."""
    return {
        "message": "Welcome to Mobile-Based Suggestion App API",
        "version": "1.0.0",
        "status": "running"
    }


# Register routers
app.include_router(auth.router, prefix="/api/v1", tags=["Auth"])
app.include_router(suggestion.router, prefix="/api/v1", tags=["Suggestions"])
app.include_router(admin.router, prefix="/api/v1", tags=["Admin"])

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)