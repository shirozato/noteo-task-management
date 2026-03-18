from decouple import config
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Noteo"
    debug: bool = True
    database_url: str = config("DATABASE_URL")
    cors_origins: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    static_dir: str = "static"
    images_dir: str = "static/images"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()