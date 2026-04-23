import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import get_db
from app.db.base import Base
from app.models.user import User


# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override dependency for testing."""
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def cleanup_db():
    """Clean up database after each test."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    yield
    
    # Drop tables
    Base.metadata.drop_all(bind=engine)


def test_register_user_success():
    """Test successful user registration."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_user_duplicate_email():
    """Test registration with duplicate email."""
    # First registration
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    
    # Second registration with same email
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "differentpassword"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


def test_register_user_invalid_email():
    """Test registration with invalid email format."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "invalid-email",
            "password": "password123"
        }
    )
    assert response.status_code == 422  # Validation error


def test_register_user_short_password():
    """Test registration with password less than 8 characters."""
    response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "short"
        }
    )
    assert response.status_code == 422  # Validation error


def test_login_user_success():
    """Test successful user login."""
    # First register a user
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    
    # Then login
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_user_wrong_password():
    """Test login with wrong password."""
    # Register a user
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    
    # Try login with wrong password
    response = client.post(
        "/api/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_user_nonexistent():
    """Test login with non-existent user."""
    response = client.post(
        "/api/auth/login",
        json={
            "email": "nonexistent@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"


def test_get_current_user_success():
    """Test getting current user with valid token."""
    # Register and get token
    register_response = client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    token = register_response.json()["access_token"]
    
    # Get current user
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data
    assert "created_at" in data


def test_get_current_user_invalid_token():
    """Test getting current user with invalid token."""
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid_token"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid authentication credentials"


def test_get_current_user_no_token():
    """Test getting current user without token."""
    response = client.get("/api/auth/me")
    assert response.status_code == 401  # FastAPI security returns 401 for missing auth header


def test_password_hashing():
    """Test that passwords are hashed and not stored in plain text."""
    from app.core.security import verify_password
    
    # Register a user
    client.post(
        "/api/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123"
        }
    )
    
    # Check database directly
    db = TestingSessionLocal()
    try:
        user = db.query(User).filter(User.email == "test@example.com").first()
        assert user is not None
        assert user.password_hash != "password123"  # Should be hashed
        assert verify_password("password123", user.password_hash)  # Should verify correctly
        assert not verify_password("wrongpassword", user.password_hash)  # Should fail
    finally:
        db.close()