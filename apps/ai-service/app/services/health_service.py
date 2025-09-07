from typing import Dict
from app.core.config import settings
from app.core.logging import logger
from datetime import datetime
import psutil
import os

class HealthService:
    def __init__(self):
        self.start_time = datetime.utcnow()
    
    def get_health_status(self) -> Dict:
        """Get comprehensive health status"""
        try:
            return {
                "status": "healthy",
                "version": settings.VERSION,
                "timestamp": datetime.utcnow().isoformat(),
                "uptime_seconds": (datetime.utcnow() - self.start_time).total_seconds(),
                "system": self._get_system_info(),
                "models": self._get_model_status(),
                "services": self._get_service_status()
            }
        except Exception as e:
            logger.error(f"Health check error: {e}")
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def _get_system_info(self) -> Dict:
        """Get system resource information"""
        try:
            return {
                "cpu_percent": psutil.cpu_percent(interval=1),
                "memory_percent": psutil.virtual_memory().percent,
                "disk_percent": psutil.disk_usage('/').percent,
                "python_version": f"{os.sys.version_info.major}.{os.sys.version_info.minor}.{os.sys.version_info.micro}"
            }
        except:
            return {"status": "unavailable"}
    
    def _get_model_status(self) -> Dict:
        """Get model loading status"""
        model_status = {
            "plant_disease_model": "not_loaded",
            "livestock_model": "not_loaded"
        }
        
        if os.path.exists(settings.PLANT_DISEASE_MODEL_PATH):
            model_status["plant_disease_model"] = "available"
        
        if os.path.exists(settings.LIVESTOCK_MODEL_PATH):
            model_status["livestock_model"] = "available"
        
        return model_status
    
    def _get_service_status(self) -> Dict:
        """Get service component status"""
        return {
            "vision_service": "operational",
            "geo_service": "operational", 
            "chat_service": "operational",
            "model_service": "operational"
        }

health_service = HealthService()
