from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Backend settings
    app_name: str = "PI DatAnalyz API"
    version: str = "1.0.0"
    api_v1_str: str = "/api/v1"
    
    # Database
    database_url: Optional[str] = "sqlite:///./app.db"
    
    # Security
    secret_key: Optional[str] = "your-secret-key-here"
    algorithm: Optional[str] = "HS256"
    access_token_expire_minutes: Optional[int] = 30
    
    # CORS
    backend_cors_origins: list[str] = ["http://localhost:5173", "http://localhost:5174"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore les variables VITE_*

settings = Settings()