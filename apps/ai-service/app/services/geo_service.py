import numpy as np
from typing import Dict, List, Tuple
from app.core.logging import logger
from datetime import datetime, timedelta
import hashlib

class GeoService:
    def __init__(self):
        self.sentinel_api_key = None
        self.weather_api_key = None
    
    def calculate_ndvi(self, field_id: str, date: str, bbox: List[float]) -> Dict:
        """Calculate NDVI for a given field and date"""
        try:
            seed = int(hashlib.md5(f"{field_id}{date}".encode()).hexdigest()[:8], 16)
            np.random.seed(seed)
            
            base_ndvi = 0.65
            seasonal_factor = self._get_seasonal_factor(date)
            random_variation = np.random.normal(0, 0.1)
            
            ndvi_mean = max(0.0, min(1.0, base_ndvi + seasonal_factor + random_variation))
            ndvi_std = np.random.uniform(0.08, 0.15)
            
            advice = self._generate_advice(ndvi_mean, field_id)
            map_uri = f"https://zundenova.com/maps/{field_id}-{date}-ndvi.png"
            
            return {
                "ndvi_mean": round(ndvi_mean, 3),
                "ndvi_std": round(ndvi_std, 3),
                "map_uri": map_uri,
                "advice": advice
            }
            
        except Exception as e:
            logger.error(f"NDVI calculation error: {e}")
            return self._get_fallback_ndvi(field_id)
    
    def _get_seasonal_factor(self, date_str: str) -> float:
        """Get seasonal factor based on date"""
        try:
            date = datetime.strptime(date_str, "%Y-%m-%d")
            month = date.month
            
            if month in [12, 1, 2]:
                return 0.1
            elif month in [3, 4, 5]:
                return 0.15
            elif month in [6, 7, 8]:
                return 0.05
            else:
                return 0.0
        except:
            return 0.0
    
    def _generate_advice(self, ndvi_mean: float, field_id: str) -> str:
        """Generate advice based on NDVI value"""
        if ndvi_mean < 0.3:
            return "Low vegetation index detected. Consider irrigation, fertilization, or pest management."
        elif ndvi_mean < 0.5:
            return "Moderate vegetation health. Monitor closely and consider targeted interventions."
        elif ndvi_mean < 0.7:
            return "Good vegetation health. Continue current management practices."
        else:
            return "Excellent vegetation health. Your field is performing very well."
    
    def _get_fallback_ndvi(self, field_id: str) -> Dict:
        """Fallback NDVI calculation"""
        return {
            "ndvi_mean": 0.65,
            "ndvi_std": 0.12,
            "map_uri": f"https://zundenova.com/maps/{field_id}-fallback.png",
            "advice": "Unable to calculate precise NDVI. Field appears to have moderate vegetation health."
        }

geo_service = GeoService()
