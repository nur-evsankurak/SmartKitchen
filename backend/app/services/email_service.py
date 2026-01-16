import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from datetime import datetime


class EmailService:
    """
    Real email service using Gmail SMTP.
    """

    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "nurevsankurak@gmail.com")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.frontend_url = os.getenv("FRONTEND_URL", "https://plankton-app-zvzg5.ondigitalocean.app/smartkitchen-frontend")

    def send_email(self, to_email: str, subject: str, html_body: str) -> bool:
        """
        Send email via Gmail SMTP.

        Args:
            to_email: Recipient email
            subject: Email subject
            html_body: HTML email content

        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not self.smtp_password:
            print("⚠️ SMTP_PASSWORD not configured, email not sent")
            return False

        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["From"] = f"SmartKitchen <{self.smtp_user}>"
            message["To"] = to_email
            message["Subject"] = subject

            # Attach HTML content
            html_part = MIMEText(html_body, "html")
            message.attach(html_part)

            # Connect to SMTP server
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()  # Secure connection
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(message)

            print(f"✅ Email sent successfully to {to_email}")
            return True

        except Exception as e:
            print(f"❌ Failed to send email: {e}")
            return False

    def send_magic_link(self, email: str, token: str, expires_at: datetime) -> bool:
        """
        Send magic link email.

        Args:
            email: Recipient email address
            token: Magic link token
            expires_at: Token expiration datetime

        Returns:
            bool: True if sent successfully
        """
        magic_link_url = f"{self.frontend_url}/auth/verify?token={token}"

        subject = "🔐 Your SmartKitchen Login Link"

        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🍳 SmartKitchen</h1>
    </div>

    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #667eea; margin-top: 0;">Your Login Link is Ready!</h2>

        <p>Hello,</p>

        <p>You requested to sign in to SmartKitchen. Click the button below to continue:</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{magic_link_url}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 40px;
                      text-decoration: none;
                      border-radius: 5px;
                      font-weight: bold;
                      display: inline-block;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                🔓 Sign In to SmartKitchen
            </a>
        </div>

        <p style="color: #666; font-size: 14px;">
            ⏰ This link will expire at: <strong>{expires_at.strftime('%Y-%m-%d %H:%M:%S UTC')}</strong>
        </p>

        <p style="color: #666; font-size: 14px;">
            If you didn't request this, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #999; font-size: 12px; text-align: center;">
            Best regards,<br>
            The SmartKitchen Team
        </p>
    </div>

    <p style="color: #999; font-size: 11px; text-align: center; margin-top: 20px;">
        This is an automated email. Please do not reply to this message.
    </p>
</body>
</html>
        """

        # Also print to console for debugging
        print("\n" + "=" * 80)
        print("📧 Sending Magic Link Email")
        print("=" * 80)
        print(f"To: {email}")
        print(f"Magic Link: {magic_link_url}")
        print(f"Token: {token}")
        print("=" * 80 + "\n")

        return self.send_email(email, subject, html_body)

    def send_welcome_email(self, email: str, username: str) -> bool:
        """
        Send welcome email for new users.

        Args:
            email: Recipient email address
            username: User's username

        Returns:
            bool: True if sent successfully
        """
        subject = "🎉 Welcome to SmartKitchen!"

        html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🍳 SmartKitchen</h1>
    </div>

    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #667eea; margin-top: 0;">Welcome to SmartKitchen!</h2>

        <p>Hello <strong>{username}</strong>,</p>

        <p>Your account has been successfully created. 🎉</p>

        <p>You can now start:</p>
        <ul>
            <li>📖 Managing your recipes</li>
            <li>🥗 Creating meal plans</li>
            <li>🛒 Organizing shopping lists</li>
            <li>🤖 Getting AI-powered recipe recommendations</li>
        </ul>

        <p>Happy cooking!</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="color: #999; font-size: 12px; text-align: center;">
            Best regards,<br>
            The SmartKitchen Team
        </p>
    </div>
</body>
</html>
        """

        return self.send_email(email, subject, html_body)


# Create singleton instance
email_service = EmailService()
