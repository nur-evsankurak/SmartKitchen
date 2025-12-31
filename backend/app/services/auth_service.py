import secrets
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models import User, MagicLink


class AuthService:
    """Authentication service for magic link management"""

    @staticmethod
    def generate_token(length: int = 32) -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(length)

    @staticmethod
    def create_magic_link(db: Session, email: str, expiry_minutes: int = 15) -> Optional[MagicLink]:
        """
        Create a magic link for a user.

        Args:
            db: Database session
            email: User's email address
            expiry_minutes: Token expiration time in minutes (default: 15)

        Returns:
            MagicLink object if user exists, None otherwise
        """
        # Find user by email
        user = db.query(User).filter(User.email == email).first()

        if not user:
            return None

        # Generate secure token
        token = AuthService.generate_token()

        # Calculate expiration time
        expires_at = datetime.utcnow() + timedelta(minutes=expiry_minutes)

        # Create magic link
        magic_link = MagicLink(
            user_id=user.id,
            token=token,
            expires_at=expires_at,
            is_used=False
        )

        db.add(magic_link)
        db.commit()
        db.refresh(magic_link)

        return magic_link

    @staticmethod
    def verify_token(db: Session, token: str) -> Optional[User]:
        """
        Verify a magic link token and return the associated user.

        Args:
            db: Database session
            token: Magic link token to verify

        Returns:
            User object if token is valid, None otherwise
        """
        # Find the magic link
        magic_link = db.query(MagicLink).filter(
            and_(
                MagicLink.token == token,
                MagicLink.is_used == False,
                MagicLink.expires_at > datetime.utcnow()
            )
        ).first()

        if not magic_link:
            return None

        # Mark token as used
        magic_link.is_used = True
        db.commit()

        # Get and return the user
        user = db.query(User).filter(User.id == magic_link.user_id).first()
        return user

    @staticmethod
    def cleanup_expired_tokens(db: Session) -> int:
        """
        Clean up expired magic link tokens.

        Args:
            db: Database session

        Returns:
            Number of tokens deleted
        """
        deleted = db.query(MagicLink).filter(
            MagicLink.expires_at < datetime.utcnow()
        ).delete()
        db.commit()
        return deleted

    @staticmethod
    def create_or_get_user(db: Session, email: str, username: str = None, full_name: str = None) -> User:
        """
        Get existing user or create a new one.

        Args:
            db: Database session
            email: User's email address
            username: Optional username (defaults to email prefix)
            full_name: Optional full name

        Returns:
            User object
        """
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()

        if user:
            return user

        # Create new user
        if not username:
            username = email.split('@')[0]

        # Ensure username is unique
        base_username = username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1

        user = User(
            email=email,
            username=username,
            password_hash="",  # No password for magic link auth
            full_name=full_name or username,
            is_active=True
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user
