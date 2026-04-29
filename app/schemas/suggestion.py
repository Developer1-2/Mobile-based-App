from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SuggestionCreate(BaseModel):
    """Schema for creating a new suggestion."""
    title: str = Field(..., min_length=5, max_length=100, description="Suggestion title")
    description: str = Field(..., min_length=20, max_length=600, description="Detailed description")
    category: str = Field(..., description="Suggestion category")
    is_anonymous: bool = Field(default=False, description="Whether submission is anonymous")


class AdminResponseCreate(BaseModel):
    """Schema for admin response to a suggestion."""
    message: str = Field(..., min_length=1, description="Admin response message")


class SuggestionStatusUpdate(BaseModel):
    """Schema for updating suggestion status."""
    status: str = Field(..., description="New status (pending, in_progress, resolved)")


class SuggestionSubmissionBase(BaseModel):
    """Base schema for suggestion submissions."""
    original_text: str
    is_anonymous: bool
    device_hash: str
    created_at: datetime

    class Config:
        from_attributes = True


class ResponseBase(BaseModel):
    """Base schema for responses."""
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class SuggestionResponse(BaseModel):
    """Schema for API response with suggestion details."""
    id: int
    title: str
    description: str
    category: str
    status: str
    duplicate_count: int
    tracking_code: str
    created_at: datetime
    updated_at: datetime
    submissions: Optional[List[SuggestionSubmissionBase]] = None
    responses: Optional[List[ResponseBase]] = None

    class Config:
        from_attributes = True