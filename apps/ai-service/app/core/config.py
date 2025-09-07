import os
from typing import Optional

class Settings:
    PROJECT_NAME: str = "ZundeNova AI API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "AI services for diagnostics, forecasting, chat, and geo-intelligence"
    
    PLANT_DISEASE_MODEL_PATH: str = os.getenv("PLANT_DISEASE_MODEL_PATH", "app/models/plantdiag.onnx")
    LIVESTOCK_MODEL_PATH: str = os.getenv("LIVESTOCK_MODEL_PATH", "app/models/livestock.onnx")
    
    CORS_ORIGINS: list = ["*"]
    
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()
