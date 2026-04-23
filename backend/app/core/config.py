from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Any
from pydantic import field_validator


class Settings(BaseSettings):
    app_name: str = "Backend API"
    debug: bool = False
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/vibeflow"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    @field_validator('debug', mode='before')
    @classmethod
    def validate_debug(cls, v: Any) -> bool:
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            v_lower = v.lower()
            if v_lower in ("true", "1", "yes", "y", "on", "enable", "enabled"):
                return True
            if v_lower in ("false", "0", "no", "n", "off", "disable", "disabled", "release"):
                return False
        # Default to False for any other value
        return False


settings = Settings()