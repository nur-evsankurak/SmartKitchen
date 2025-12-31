from typing import Optional
from datetime import datetime


class MockEmailService:
    """
    Mock email service for development and testing.
    Prints emails to the console instead of sending them.
    """

    @staticmethod
    def send_magic_link(email: str, token: str, expires_at: datetime) -> bool:
        """
        Mock send magic link email.

        Args:
            email: Recipient email address
            token: Magic link token
            expires_at: Token expiration datetime

        Returns:
            bool: Always True (simulating successful send)
        """
        magic_link_url = f"http://localhost:8000/auth/verify?token={token}"

        print("\n" + "=" * 80)
        print("📧 MOCK EMAIL SERVICE - Magic Link Email")
        print("=" * 80)
        print(f"To: {email}")
        print(f"Subject: Your SmartKitchen Login Link")
        print("-" * 80)
        print("\nHello,\n")
        print("You requested to sign in to SmartKitchen. Click the link below to continue:\n")
        print(f"🔗 Magic Link: {magic_link_url}\n")
        print(f"⏰ This link will expire at: {expires_at.strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print("\nIf you didn't request this, you can safely ignore this email.\n")
        print("Best regards,")
        print("The SmartKitchen Team")
        print("=" * 80)
        print(f"📋 Token (for manual testing): {token}")
        print("=" * 80 + "\n")

        return True

    @staticmethod
    def send_welcome_email(email: str, username: str) -> bool:
        """
        Mock send welcome email for new users.

        Args:
            email: Recipient email address
            username: User's username

        Returns:
            bool: Always True (simulating successful send)
        """
        print("\n" + "=" * 80)
        print("📧 MOCK EMAIL SERVICE - Welcome Email")
        print("=" * 80)
        print(f"To: {email}")
        print(f"Subject: Welcome to SmartKitchen!")
        print("-" * 80)
        print(f"\nHello {username},\n")
        print("Welcome to SmartKitchen! 🍳\n")
        print("Your account has been successfully created.")
        print("You can now start managing your recipes, meal plans, and smart appliances.\n")
        print("Happy cooking!")
        print("\nBest regards,")
        print("The SmartKitchen Team")
        print("=" * 80 + "\n")

        return True


# Create a singleton instance
email_service = MockEmailService()
