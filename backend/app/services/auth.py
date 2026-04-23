from datetime import timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)
from app.core.config import settings


class AuthService:
    @staticmethod
    def register_user(db: Session, user_create: UserCreate) -> Optional[User]:
        """Create a new user with hashed password."""
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == user_create.email).first()
        if existing_user:
            return None

        # Create new user
        hashed_password = get_password_hash(user_create.password)
        db_user = User(
            email=user_create.email,
            password_hash=hashed_password,
        )
        db.add(db_user)
        try:
            db.commit()
            db.refresh(db_user)
            return db_user
        except IntegrityError:
            db.rollback()
            return None

    @staticmethod
    def authenticate_user(db: Session, user_login: UserLogin) -> Optional[User]:
        """Authenticate user with email and password."""
        user = db.query(User).filter(User.email == user_login.email).first()
        if not user:
            return None
        if not verify_password(user_login.password, user.password_hash):
            return None
        return user

    @staticmethod
    def create_access_token_for_user(user: User) -> str:
        """Create JWT access token for authenticated user."""
        token_data = {"sub": str(user.id)}
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        return create_access_token(
            data=token_data, expires_delta=access_token_expires
        )

    @staticmethod
    def get_current_user(db: Session, token: str) -> Optional[User]:
        """Get current user from JWT token."""
        payload = decode_access_token(token)
        if payload is None:
            return None
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(User).filter(User.id == int(user_id)).first()
        return user