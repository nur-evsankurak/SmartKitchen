import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_magic_link_request_success():
    """
    UT-01: Verify that a user can request a magic link with a valid email.
    """
    payload = {
        "email": "abc@example.com",
        "full_name": "Nur K"
    }
    response = client.post("/auth/magic-link", json=payload)

    # Assert that the request was accepted successfully
    assert response.status_code == 200
    assert "Magic link sent" in response.json()["message"]


def test_invalid_email_format():
    """
    UT-01: Verify that the system rejects an invalid email format.
    """
    payload = {"email": "invalid-email-format", "full_name": "Test User"}
    response = client.post("/auth/magic-link", json=payload)

    # Expect 422 Unprocessable Entity due to Pydantic validation
    assert response.status_code == 422