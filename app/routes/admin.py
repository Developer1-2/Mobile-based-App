from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from datetime import datetime, timedelta
from database import get_db
from models.suggestion import Suggestion, Response, SuggestionSubmission
from schemas.suggestion import (
    SuggestionResponse,
    SuggestionStatusUpdate,
    AdminResponseCreate
)

router = APIRouter()


@router.get("/admin/suggestions", response_model=list[SuggestionResponse])
async def list_suggestions(
    category: str = Query(None, description="Filter by category"),
    status: str = Query(None, description="Filter by status (pending, in_progress, resolved)"),
    db: Session = Depends(get_db)
):
    """
    List all suggestions with optional filtering.
    
    Args:
        category: Optional category filter
        status: Optional status filter (pending, in_progress, resolved)
        db: Database session
    
    Returns:
        list[SuggestionResponse]: List of suggestions
    """
    query = db.query(Suggestion)
    
    # Apply filters
    if category:
        query = query.filter(Suggestion.category == category)
    
    if status:
        query = query.filter(Suggestion.status == status)
    
    suggestions = query.order_by(desc(Suggestion.created_at)).all()
    
    return suggestions


@router.get("/admin/suggestions/{suggestion_id}", response_model=SuggestionResponse)
async def get_suggestion_detail(
    suggestion_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific suggestion.
    
    Args:
        suggestion_id: ID of the suggestion
        db: Database session
    
    Returns:
        SuggestionResponse: Suggestion with submissions and responses
    
    Raises:
        HTTPException: If suggestion not found
    """
    suggestion = db.query(Suggestion).filter(
        Suggestion.id == suggestion_id
    ).first()
    
    if not suggestion:
        raise HTTPException(
            status_code=404,
            detail=f"Suggestion with ID {suggestion_id} not found"
        )
    
    return suggestion


@router.put("/admin/suggestions/{suggestion_id}/status")
async def update_suggestion_status(
    suggestion_id: int,
    status_update: SuggestionStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update the status of a suggestion.
    
    Args:
        suggestion_id: ID of the suggestion
        status_update: New status (pending, in_progress, resolved)
        db: Database session
    
    Returns:
        dict: Updated suggestion with success message
    
    Raises:
        HTTPException: If suggestion not found
    """
    suggestion = db.query(Suggestion).filter(
        Suggestion.id == suggestion_id
    ).first()
    
    if not suggestion:
        raise HTTPException(
            status_code=404,
            detail=f"Suggestion with ID {suggestion_id} not found"
        )
    
    # Update status and updated_at timestamp
    suggestion.status = status_update.status
    suggestion.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(suggestion)
    
    return {
        "message": f"Suggestion status updated to {status_update.status}",
        "suggestion": suggestion
    }


@router.post("/admin/suggestions/{suggestion_id}/response")
async def add_admin_response(
    suggestion_id: int,
    response_data: AdminResponseCreate,
    db: Session = Depends(get_db)
):
    """
    Add an admin response to a suggestion.
    
    Args:
        suggestion_id: ID of the suggestion
        response_data: Admin response message
        db: Database session
    
    Returns:
        dict: Created response with success message
    
    Raises:
        HTTPException: If suggestion not found
    """
    suggestion = db.query(Suggestion).filter(
        Suggestion.id == suggestion_id
    ).first()
    
    if not suggestion:
        raise HTTPException(
            status_code=404,
            detail=f"Suggestion with ID {suggestion_id} not found"
        )
    
    # Create response
    new_response = Response(
        suggestion_id=suggestion_id,
        message=response_data.message
    )
    
    db.add(new_response)
    db.commit()
    db.refresh(new_response)
    
    return {
        "message": "Response added successfully",
        "response": new_response
    }


@router.get("/admin/analytics/trending")
async def get_trending_analytics(
    db: Session = Depends(get_db)
):
    """
    Get trending analytics for suggestions.
    
    Returns:
        1. Top categories (last 7 days)
        2. Top issues (by submissions count)
    
    Args:
        db: Database session
    
    Returns:
        dict: Analytics data
    """
    # Calculate date 7 days ago
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Get top categories in last 7 days
    top_categories = db.query(
        Suggestion.category,
        func.count(Suggestion.id).label("count")
    ).filter(
        Suggestion.created_at >= seven_days_ago
    ).group_by(
        Suggestion.category
    ).order_by(
        desc(func.count(Suggestion.id))
    ).limit(10).all()
    
    # Get top issues by submission count
    top_issues = db.query(
        Suggestion.id,
        Suggestion.title,
        Suggestion.category,
        Suggestion.duplicate_count,
        func.count(SuggestionSubmission.id).label("submission_count")
    ).join(
        SuggestionSubmission,
        Suggestion.id == SuggestionSubmission.suggestion_id
    ).group_by(
        Suggestion.id,
        Suggestion.title,
        Suggestion.category,
        Suggestion.duplicate_count
    ).order_by(
        desc(func.count(SuggestionSubmission.id))
    ).limit(10).all()
    
    return {
        "top_categories": [
            {"category": cat, "count": count}
            for cat, count in top_categories
        ],
        "top_issues": [
            {
                "id": issue[0],
                "title": issue[1],
                "category": issue[2],
                "duplicate_count": issue[3],
                "submission_count": issue[4]
            }
            for issue in top_issues
        ],
        "period": "last 7 days"
    }