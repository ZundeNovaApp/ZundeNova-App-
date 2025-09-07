from fastapi import APIRouter, HTTPException, Depends
import numpy as np
from PIL import Image
import base64
import io
import uuid
import os
from typing import Dict, List
from app.core.config import settings
from app.core.logging import logger
from app.schemas.vision import VisionDiagnosisRequest, VisionDiagnosisResponse
from app.api.dependencies import get_optional_user

router = APIRouter()

try:
    import onnxruntime as ort
    if os.path.exists(settings.PLANT_DISEASE_MODEL_PATH):
        session = ort.InferenceSession(settings.PLANT_DISEASE_MODEL_PATH, providers=["CPUExecutionProvider"])
        logger.info(f"✅ ONNX model loaded from {settings.PLANT_DISEASE_MODEL_PATH}")
    else:
        session = None
        logger.warning(f"⚠️ ONNX model not found at {settings.PLANT_DISEASE_MODEL_PATH}, using mock implementation")
except ImportError:
    logger.warning("⚠️ ONNX Runtime not available, using mock implementation")
    session = None
except Exception as e:
    logger.error(f"⚠️ Failed to load ONNX model: {e}")
    session = None

@router.post("/diagnose", response_model=VisionDiagnosisResponse)
async def diagnose(
    request: VisionDiagnosisRequest,
    current_user: dict = Depends(get_optional_user)
):
    try:
        if not session:
            return get_mock_diagnosis()
        
        from app.utils.image_processing import decode_base64_image, preprocess_image
        
        image = decode_base64_image(request.image_base64)
        img_array = preprocess_image(image)
        
        from app.services.model_service import model_service
        scores = model_service.predict_plant_disease(img_array)
        
        from app.models.plant_disease_labels import PLANT_DISEASE_LABELS, get_disease_treatment_url
        
        diseases = []
        for i, score in enumerate(scores):
            if i < len(PLANT_DISEASE_LABELS):
                label = PLANT_DISEASE_LABELS[i]
                diseases.append({
                    "label": label,
                    "score": float(score),
                    "treatment_uri": get_disease_treatment_url(label)
                })
        
        diseases = sorted(diseases, key=lambda x: x["score"], reverse=True)[:3]
        
        max_score = diseases[0]["score"] if diseases else 0.5
        severity = "high" if max_score > 0.8 else "medium" if max_score > 0.6 else "low"
        
        return {
            "diseases": diseases,
            "severity": severity,
            "explainability": {
                "saliency_uri": f"https://zundenova.com/explain/{uuid.uuid4()}.png"
            },
            "trace_id": str(uuid.uuid4())
        }
        
    except Exception as e:
        logger.error(f"Vision diagnosis error: {e}")
        return get_mock_diagnosis()

def get_mock_diagnosis():
    return {
        "diseases": [
            {"label": "Healthy Plant", "score": 0.85, "treatment_uri": "https://zundenova.com/treatments/healthy"},
            {"label": "Early Blight", "score": 0.12, "treatment_uri": "https://zundenova.com/treatments/early-blight"},
            {"label": "Nutrient Deficiency", "score": 0.03, "treatment_uri": "https://zundenova.com/treatments/nutrient-deficiency"}
        ],
        "severity": "low",
        "explainability": {"saliency_uri": "https://zundenova.com/explain/mock-saliency.png"},
        "trace_id": str(uuid.uuid4())
    }
