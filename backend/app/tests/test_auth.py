import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_negative_servings_validation():
    """
    UT-02: Ensure that the system prevents entering negative serving counts.
    """
    invalid_ingredient = {
        "name": "Tomato",
        "quantity": 10,
        "servings": -5  # Invalid negative number
    }
    response = client.post("/ingredients/", json=invalid_ingredient)

    # Assert that validation caught the error
    assert response.status_code == 422


def test_get_ingredient_list():
    """
    UT-03: Verify that the system can successfully retrieve the inventory list.
    """
    response = client.get("/ingredients/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)