from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from database import get_db
from schemas.suggestion import SuggestionCreate, SuggestionResponse
from services.suggestion_service import create_suggestion
from utils.helpers import generate_device_hash
from models.suggestion import Suggestion

# Initialize router and rate limiter
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/suggestions", response_model=SuggestionResponse, status_code=201)
@limiter.limit("5/minute")
async def submit_suggestion(
    request: Request,
    suggestion_data: SuggestionCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a new suggestion.
    
    - Validate input
    - Enforce rate limiting (5 requests per minute)
    - Generate device hash
    - Call create_suggestion service
    - Return suggestion with tracking code
    
    Args:
        request: FastAPI request object
        suggestion_data: SuggestionCreate schema with title, description, category, is_anonymous
        db: Database session
    
    Returns:
        SuggestionResponse: Created suggestion with tracking code
    
    Raises:
        HTTPException: If validation fails
    """
    try:
        # Generate device hash from request
        device_hash = generate_device_hash(request)
        
        # Call service to create suggestion (handles duplication logic)
        suggestion = create_suggestion(db, suggestion_data, device_hash)
        
        return suggestion
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error creating suggestion: {str(e)}"
        )


@router.get("/suggestions/{tracking_code}", response_model=SuggestionResponse)
async def get_suggestion(
    tracking_code: str,
    db: Session = Depends(get_db)
):
    print(f"Fetching suggestion with tracking code: {tracking_code}")
    """
    Retrieve suggestion details and responses by tracking code.
    
    Args:
        tracking_code: Unique tracking code (e.g., GU-1234)
        db: Database session
    
    Returns:
        SuggestionResponse: Suggestion details with submissions and responses
    
    Raises:
        HTTPException: If suggestion not found
    """
    suggestion = db.query(Suggestion).filter(
        Suggestion.tracking_code == tracking_code
    ).first()
    
    if not suggestion:
        raise HTTPException(
            status_code=404,
            detail=f"Suggestion with tracking code {tracking_code} not found"
        )
    
    return suggestion