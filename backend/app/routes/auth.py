"""
MOUNAM Authentication Endpoints
Prepares the API contracts and validation schemas for Firebase Authentication integration in Step 4.
"""

from fastapi import APIRouter, status, HTTPException
from app.models.auth import (
    LoginRequest,
    RegisterRequest,
    PasswordResetRequest,
    AuthStatusResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/status", response_model=AuthStatusResponse)
async def get_auth_status():
    """
    Check the authentication service configuration status.
    Informs frontend whether Firebase Authentication credentials are ready or scheduled.
    """
    return AuthStatusResponse(
        status="standby",
        message="Authentication endpoints prepared. Firebase Authentication integration is scheduled for Step 4.",
        provider="Firebase Authentication",
        provider_connected=False,
        next_step="Connect Firebase Admin SDK credentials in Phase 4"
    )

@router.post("/login")
async def login_user(payload: LoginRequest):
    """
    User login endpoint validation.
    Validates input schemas without storing passwords in plain text or claiming unverified authentication.
    """
    # Strict validation passed via Pydantic model
    return {
        "status": "pending_provider",
        "message": f"Login validation successful for {payload.email}. Firebase Auth provider connection will complete verification in Phase 4.",
        "email": payload.email,
        "remember_me": payload.remember_me
    }

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(payload: RegisterRequest):
    """
    User registration endpoint validation.
    Performs full input validation for name, email, phone, and language preference.
    """
    if not payload.accepted_terms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept the Terms and Conditions to register."
        )

    return {
        "status": "pending_provider",
        "message": f"Registration details verified for {payload.full_name} ({payload.email}). Firebase Auth account creation activates in Phase 4.",
        "user": {
            "full_name": payload.full_name,
            "email": payload.email,
            "phone_number": payload.phone_number,
            "preferred_language": payload.preferred_language,
            "user_type": payload.user_type
        }
    }

@router.post("/forgot-password")
async def request_password_reset(payload: PasswordResetRequest):
    """
    Password reset request endpoint.
    Validates email format and prepares reset dispatch via Firebase Auth.
    """
    return {
        "status": "pending_provider",
        "message": f"Password reset request received for {payload.email}. Email dispatch will be handled by Firebase Authentication in Phase 4.",
        "email": payload.email
    }
