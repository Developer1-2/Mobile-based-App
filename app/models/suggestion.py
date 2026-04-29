from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, func
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Suggestion(Base):
    """Model for grouped suggestions/issues."""
    __tablename__ = "suggestions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    status = Column(String(20), default="pending", index=True)  # pending, in_progress, resolved
    duplicate_count = Column(Integer, default=1)
    tracking_code = Column(String(20), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    submissions = relationship("SuggestionSubmission", back_populates="suggestion", cascade="all, delete-orphan")
    responses = relationship("Response", back_populates="suggestion", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Suggestion(id={self.id}, title={self.title}, status={self.status})>"


class SuggestionSubmission(Base):
    """Model for individual submissions of the same suggestion."""
    __tablename__ = "suggestion_submissions"

    id = Column(Integer, primary_key=True, index=True)
    suggestion_id = Column(Integer, ForeignKey("suggestions.id"), nullable=False, index=True)
    original_text = Column(Text, nullable=False)
    is_anonymous = Column(Boolean, default=False)
    device_hash = Column(String(255), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship
    suggestion = relationship("Suggestion", back_populates="submissions")

    def __repr__(self):
        return f"<SuggestionSubmission(id={self.id}, suggestion_id={self.suggestion_id})>"


class Response(Base):
    """Model for admin responses to suggestions."""
    __tablename__ = "responses"

    id = Column(Integer, primary_key=True, index=True)
    suggestion_id = Column(Integer, ForeignKey("suggestions.id"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationship
    suggestion = relationship("Suggestion", back_populates="responses")

    def __repr__(self):
        return f"<Response(id={self.id}, suggestion_id={self.suggestion_id})>"