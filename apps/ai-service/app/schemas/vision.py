from pydantic import BaseModel
from typing import Optional, List, Dict

class Location(BaseModel):
    lat: float
    lon: float

class VisionDiagnosisRequest(BaseModel):
    image_base64: str
    crop_type: str
    location: Optional[Location] = None
    device: Optional[str] = None
    app_version: Optional[str] = None

class Disease(BaseModel):
    label: str
    score: float
    treatment_uri: str

class Explainability(BaseModel):
    saliency_uri: str

class VisionDiagnosisResponse(BaseModel):
    diseases: List[Disease]
    severity: str
    explainability: Explainability
    trace_id: str
