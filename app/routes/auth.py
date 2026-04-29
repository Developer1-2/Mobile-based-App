from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()

# Pydantic model for login
class LoginRequest(BaseModel):
    email: str
    password: str

# Demo admin credentials (in production, use a proper user database)
DEMO_ADMIN_CREDENTIALS = {
    "email": "admin@gulu.ac.ug",
    "password": "password123"  # In production, this should be hashed
}

# Mock JWT token generation (in production, use python-jose)
def generate_demo_token(email: str) -> str:
    """Generate a simple demo JWT token."""
    import base64
    import json
    from datetime import datetime, timedelta
    
    payload = {
        "email": email,
        "role": "admin",
        "iat": datetime.utcnow().timestamp(),
        "exp": (datetime.utcnow() + timedelta(hours=24)).timestamp()
    }
    token = base64.b64encode(json.dumps(payload).encode()).decode()
    return f"Bearer_{token}"


@router.post("/admin/login")
async def admin_login(credentials: LoginRequest, db: Session = Depends(get_db)):
    print(f"Admin login attempt: {credentials.email}\nPassword: {credentials.password}")
    """
    Admin login endpoint.
    
    Args:
        credentials: LoginRequest with email and password
        db: Database session
    
    Returns:
        dict: Token and admin info
    
    Raises:
        HTTPException: If credentials are invalid
    """
    email = credentials.email
    password = credentials.password
    
    if not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Email and password are required"
        )
    
    # Demo authentication (in production, query admin users table)
    if email == DEMO_ADMIN_CREDENTIALS["email"] and password == DEMO_ADMIN_CREDENTIALS["password"]:
        token = generate_demo_token(email)
        return {
            "access_token": token,
            "token_type": "bearer",
            "admin": {
                "email": email,
                "name": "Admin User",
                "role": "admin"
            }
        }
    
    raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )


@router.post("/admin/logout")
async def admin_logout():
    """
    Admin logout endpoint (token invalidation handled on client side).
    
    Returns:
        dict: Success message
    """
    return {"message": "Logged out successfully"}
