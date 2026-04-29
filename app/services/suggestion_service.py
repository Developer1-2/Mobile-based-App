from sqlalchemy.orm import Session
from sqlalchemy import desc
from models.suggestion import Suggestion, SuggestionSubmission
from utils.helpers import (
    normalize_text,
    calculate_similarity,
    generate_tracking_code
)


def create_suggestion(db: Session, suggestion_data, device_hash: str):
    """
    Create a new suggestion or link to existing similar one based on similarity score.
    
    Logic:
    1. Normalize incoming text
    2. Fetch existing suggestions (same category)
    3. Compare using rapidfuzz similarity
    4. If similarity > 80:
       - increment duplicate_count
       - create SuggestionSubmission linked to existing suggestion
       - return existing suggestion
    5. Else:
       - create new Suggestion
       - generate tracking code
       - create first SuggestionSubmission
       - return new suggestion
    
    Args:
        db (Session): Database session
        suggestion_data: Pydantic schema with title, description, category, is_anonymous
        device_hash (str): Hash of device/IP
    
    Returns:
        Suggestion: Created or existing suggestion
    """
    
    # Normalize the incoming text for comparison
    normalized_incoming = normalize_text(suggestion_data.title + " " + suggestion_data.description)
    
    # Fetch existing suggestions in the same category
    existing_suggestions = db.query(Suggestion).filter(
        Suggestion.category == suggestion_data.category
    ).all()
    
    # Check for similar suggestions
    max_similarity = 0
    matching_suggestion = None
    
    for existing in existing_suggestions:
        existing_text = normalize_text(existing.title + " " + existing.description)
        similarity = calculate_similarity(normalized_incoming, existing_text)
        
        if similarity > max_similarity:
            max_similarity = similarity
            if similarity > 80:
                matching_suggestion = existing
    
    # If similarity > 80, link to existing suggestion
    if matching_suggestion and max_similarity > 80:
        # Increment duplicate count
        matching_suggestion.duplicate_count += 1
        
        # Create submission linked to existing suggestion
        submission = SuggestionSubmission(
            suggestion_id=matching_suggestion.id,
            original_text=suggestion_data.description,
            is_anonymous=suggestion_data.is_anonymous,
            device_hash=device_hash
        )
        db.add(submission)
        db.commit()
        db.refresh(matching_suggestion)
        
        return matching_suggestion
    
    # Create new suggestion
    tracking_code = generate_tracking_code()
    
    new_suggestion = Suggestion(
        title=suggestion_data.title,
        description=suggestion_data.description,
        category=suggestion_data.category,
        tracking_code=tracking_code,
        status="pending",
        duplicate_count=1
    )
    
    db.add(new_suggestion)
    db.flush()  # Get the ID without committing
    
    # Create first submission
    submission = SuggestionSubmission(
        suggestion_id=new_suggestion.id,
        original_text=suggestion_data.description,
        is_anonymous=suggestion_data.is_anonymous,
        device_hash=device_hash
    )
    
    db.add(submission)
    db.commit()
    db.refresh(new_suggestion)
    
    return new_suggestion