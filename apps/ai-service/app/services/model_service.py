import os
import numpy as np
from typing import Optional, List, Dict
from app.core.config import settings
from app.core.logging import logger

class ModelService:
    def __init__(self):
        self.vision_session = None
        self.livestock_session = None
        self._load_models()
    
    def _load_models(self):
        try:
            import onnxruntime as ort
            
            if os.path.exists(settings.PLANT_DISEASE_MODEL_PATH):
                self.vision_session = ort.InferenceSession(
                    settings.PLANT_DISEASE_MODEL_PATH, 
                    providers=["CPUExecutionProvider"]
                )
                logger.info(f"✅ Plant disease model loaded from {settings.PLANT_DISEASE_MODEL_PATH}")
            
            if os.path.exists(settings.LIVESTOCK_MODEL_PATH):
                self.livestock_session = ort.InferenceSession(
                    settings.LIVESTOCK_MODEL_PATH,
                    providers=["CPUExecutionProvider"]
                )
                logger.info(f"✅ Livestock model loaded from {settings.LIVESTOCK_MODEL_PATH}")
                
        except ImportError:
            logger.warning("⚠️ ONNX Runtime not available, using mock implementations")
        except Exception as e:
            logger.error(f"⚠️ Failed to load models: {e}")
    
    def predict_plant_disease(self, image_array: np.ndarray) -> List[float]:
        if self.vision_session:
            try:
                outputs = self.vision_session.run(None, {"image": image_array})
                return outputs[0][0].tolist()
            except Exception as e:
                logger.error(f"Model prediction error: {e}")
        
        from app.models.mock_model import get_mock_model
        mock_model = get_mock_model()
        return mock_model.predict(image_array[0])
    
    def predict_livestock_health(self, image_array: np.ndarray) -> List[float]:
        if self.livestock_session:
            try:
                outputs = self.livestock_session.run(None, {"image": image_array})
                return outputs[0][0].tolist()
            except Exception as e:
                logger.error(f"Livestock model prediction error: {e}")
        
        from app.models.mock_model import get_mock_model
        mock_model = get_mock_model()
        return mock_model.predict(image_array[0])

model_service = ModelService()
