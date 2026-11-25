"""Authentication Data Models and Schemas for MOUNAM."""

import re
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field, field_validator

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

class UserType(str, Enum):
    INDIVIDUAL = "individual"
    CAREGIVER = "caregiver"

class PreferredLanguage(str, Enum):
    ENGLISH = "en"
    TAMIL = "ta"
    HINDI = "hi"
    MALAYALAM = "ml"
    TELUGU = "te"
    KANNADA = "kn"

class LoginRequest(BaseModel):
    """Payload for user login."""
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password")
    remember_me: Optional[bool] = Field(default=False, description="Remember session preference")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_REGEX.match(v):
            raise ValueError("Invalid email format. Please provide a valid email address.")
        return v

class RegisterRequest(BaseModel):
    """Payload for user registration."""
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of user or caregiver")
    email: str = Field(..., description="Valid email address")
    phone_number: str = Field(..., min_length=7, max_length=20, description="Contact phone number with optional country code")
    password: str = Field(..., min_length=8, description="Secure account password")
    preferred_language: PreferredLanguage = Field(default=PreferredLanguage.ENGLISH, description="Preferred regional voice language")
    user_type: UserType = Field(default=UserType.INDIVIDUAL, description="Account role: individual or caregiver")
    accepted_terms: bool = Field(..., description="Must accept terms and conditions")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_REGEX.match(v):
            raise ValueError("Invalid email format. Please provide a valid email address.")
        return v

    @field_validator("phone_number")
    @classmethod
    def validate_phone_format(cls, v: str) -> str:
        cleaned = re.sub(r"[\s\-\(\)\+]", "", v)
        if not cleaned.isdigit() or len(cleaned) < 7:
            raise ValueError("Phone number must contain at least 7 digits.")
        return v

class PasswordResetRequest(BaseModel):
    """Payload for password recovery request."""
    email: str = Field(..., description="Email address associated with account")

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip().lower()
        if not EMAIL_REGEX.match(v):
            raise ValueError("Invalid email format. Please provide a valid email address.")
        return v

class UserProfileResponse(BaseModel):
    """Public user profile response representation."""
    user_id: str
    full_name: str
    email: str
    phone_number: Optional[str] = None
    preferred_language: str
    user_type: str
    created_at: str

class AuthStatusResponse(BaseModel):
    """Status information regarding authentication provider readiness."""
    status: str
    message: str
    provider: str = "Firebase Authentication"
    provider_connected: bool = False
    next_step: str = "Step 4: Firebase SDK initialization"
