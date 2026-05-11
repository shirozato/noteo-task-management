from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Noteo"
    debug: bool = True
    database_url: str = "postgresql+asyncpg://admin:1209348756@localhost:5432/noteo"
    cors_origins: list = [
        # Local dev
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost",
        "http://localhost:80",
        "http://127.0.0.1",
        "http://127.0.0.1:80",
        # Production
        "https://noteo.online",
        "https://www.noteo.online",
        "https://api.noteo.online",
    ]

    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_expire_minutes: int = 60 * 24 * 30  # 30 days


settings = Settings()
