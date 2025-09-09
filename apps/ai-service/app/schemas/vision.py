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

class LivestockDiagnosisRequest(BaseModel):
    symptoms: List[str]
    image_base64: Optional[str] = None
    animal_type: str
    location: Optional[Location] = None
    device: Optional[str] = None
    app_version: Optional[str] = None

class LivestockDiagnosisResponse(BaseModel):
    condition: str
    confidence: float
    severity: str
    treatment_recommendations: List[str]
    veterinary_consultation_required: bool
    trace_id: str
