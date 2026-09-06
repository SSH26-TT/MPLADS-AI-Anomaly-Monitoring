import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "MPLADS AI-Powered Anomaly Detection & Monitoring System"
    API_V1_PREFIX: str = "/api"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./mplads.db")
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000")
    CSV_DATA_PATH: str = os.getenv("CSV_DATA_PATH", "mplads_final_master_risk.csv")

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
