from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
import os

from app.database import get_db
from app.schemas.auth import (
    MagicLinkRequest,
    MagicLinkResponse,
    VerifyTokenRequest,
    VerifyTokenResponse,
    UserResponse
)
from app.services.auth_service import AuthService
from app.services.email_service import email_service
from app.models import User

router = APIRouter()


@router.post("/magic-link", response_model=MagicLinkResponse, status_code=status.HTTP_200_OK)
async def request_magic_link(
    request: MagicLinkRequest,
    db: Session = Depends(get_db)
):
    """
    Request a magic link for passwordless authentication.

    This endpoint:
    1. Creates a user if they don't exist
    2. Generates a secure magic link token
    3. Sends the magic link via email (mock for now)

    Args:
        request: MagicLinkRequest containing email and optional full_name
        db: Database session

    Returns:
        MagicLinkResponse with confirmation message
    """
    # Create or get user
    user = AuthService.create_or_get_user(
        db=db,
        email=request.email,
        full_name=request.full_name
    )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive. Please contact support."
        )

    # Create magic link
    magic_link = AuthService.create_magic_link(db=db, email=request.email, expiry_minutes=15)

    if not magic_link:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate magic link. Please try again."
        )

    # Send magic link via email (mock)
    email_sent = email_service.send_magic_link(
        email=request.email,
        token=magic_link.token,
        expires_at=magic_link.expires_at
    )

    if not email_sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send magic link email. Please try again."
        )

    return MagicLinkResponse(
        message="Magic link sent successfully! Check your email (or terminal for mock email).",
        email=request.email,
        expires_in_minutes=15
    )


@router.get("/verify")
async def verify_magic_link_get(
    token: str,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Verify a magic link token via GET request (for email links).
    Redirects to frontend with session token.

    Args:
        token: Magic link token from query parameter
        response: FastAPI Response object for setting cookies
        db: Database session

    Returns:
        Redirect to frontend with success or error
    """
    # Get frontend URL from environment or use default
    frontend_url = os.getenv("FRONTEND_URL", "https://plankton-app-zvzg5.ondigitalocean.app/smartkitchen-frontend")

    # Verify the token
    user = AuthService.verify_token(db=db, token=token)

    if not user:
        # Redirect to frontend with error
        return RedirectResponse(
            url=f"{frontend_url}?error=invalid_token&message=Invalid or expired token",
            status_code=status.HTTP_302_FOUND
        )

    # Check if user is active
    if not user.is_active:
        return RedirectResponse(
            url=f"{frontend_url}?error=inactive_account&message=Account is inactive",
            status_code=status.HTTP_302_FOUND
        )

    # Generate session token
    session_token = AuthService.generate_token(length=48)

    # Set session cookie
    response = RedirectResponse(
        url=f"{frontend_url}?success=true",
        status_code=status.HTTP_302_FOUND
    )

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        max_age=86400,  # 24 hours
        samesite="lax",
        secure=True,  # HTTPS on production
        domain=".ondigitalocean.app"
    )

    return response


@router.post("/verify", response_model=VerifyTokenResponse, status_code=status.HTTP_200_OK)
async def verify_magic_link(
    request: VerifyTokenRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Verify a magic link token and authenticate the user.

    This endpoint:
    1. Validates the magic link token
    2. Checks if token is not expired and not used
    3. Marks the token as used
    4. Creates a session for the user
    5. Returns user data and session token

    Args:
        request: VerifyTokenRequest containing the token
        response: FastAPI Response object for setting cookies
        db: Database session

    Returns:
        VerifyTokenResponse with user data and session token
    """
    # Verify the token
    user = AuthService.verify_token(db=db, token=request.token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token. Please request a new magic link."
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive. Please contact support."
        )

    # Generate session token (for now, using the same token generation method)
    # In production, use JWT or a proper session management system
    session_token = AuthService.generate_token(length=48)

    # Set session cookie (httponly for security)
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        max_age=86400,  # 24 hours
        samesite="lax",
        secure=True,  # HTTPS required for production
        domain=".ondigitalocean.app"
    )

    # Convert user to response schema
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        full_name=user.full_name,
        role=user.role.value,
        is_active=user.is_active,
        created_at=user.created_at
    )

    return VerifyTokenResponse(
        message="Authentication successful!",
        user=user_response,
        session_token=session_token
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(response: Response):
    """
    Logout the current user by clearing the session cookie.

    Args:
        response: FastAPI Response object for clearing cookies

    Returns:
        Confirmation message
    """
    # Clear session cookie
    response.delete_cookie(key="session_token")

    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
async def get_current_user(
    session_token: str = None,
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user information.

    Note: This is a simplified version. In production, you would:
    1. Validate the session_token from cookies or Authorization header
    2. Look up the user associated with that session
    3. Return the user data

    For now, this is a placeholder endpoint.

    Args:
        session_token: Session token (from cookie or header)
        db: Database session

    Returns:
        UserResponse with current user data
    """
    # This is a placeholder - implement proper session validation
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Session validation not yet implemented. Use /auth/verify to authenticate."
    )
