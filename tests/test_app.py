import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_read_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)


def test_signup_activity():
    response = client.post("/activities/Chess Club/signup?email=test@example.com")
    assert response.status_code == 200
    assert "message" in response.json()


def test_unregister_activity():
    response = client.post("/activities/Chess Club/unregister", json={"participant": "test@example.com"})
    assert response.status_code == 200
    assert "message" in response.json()