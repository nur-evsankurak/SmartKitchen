from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class MagicLinkRequest(BaseModel):
    """Request schema for magic link generation"""
    email: EmailStr
    full_name: Optional[str] = None


class MagicLinkResponse(BaseModel):
    """Response schema for magic link generation"""
    message: str
    email: str
    expires_in_minutes: int


class VerifyTokenRequest(BaseModel):
    """Request schema for token verification"""
    token: str


class UserResponse(BaseModel):
    """Response schema for user data"""
    id: uuid.UUID
    email: str
    username: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class VerifyTokenResponse(BaseModel):
    """Response schema for token verification"""
    message: str
    user: UserResponse
    session_token: str
