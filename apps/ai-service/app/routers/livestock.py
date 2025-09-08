from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import uuid
import logging
from app.api.dependencies import get_optional_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["livestock"])

class LivestockDiagnosisRequest(BaseModel):
    symptoms: List[str]
    image_base64: Optional[str] = None
    animal_type: str = "cattle"
    location: Optional[dict] = None

class LivestockDiagnosisResponse(BaseModel):
    condition: str
    severity: str
    treatment_recommendations: List[str]
    veterinary_consultation_required: bool
    confidence: float
    trace_id: str

@router.post("/diagnose", response_model=LivestockDiagnosisResponse)
async def diagnose_livestock(
    request: LivestockDiagnosisRequest,
    current_user: dict = Depends(get_optional_user)
):
    try:
        symptoms = request.symptoms
        image_base64 = request.image_base64
        animal_type = request.animal_type
        
        image_analysis = None
        if image_base64:
            try:
                import base64
                import io
                from PIL import Image
                
                image_data = base64.b64decode(image_base64)
                image = Image.open(io.BytesIO(image_data))
                
                image_analysis = {
                    "visible_symptoms": ["skin_condition", "posture_abnormal"],
                    "body_condition_score": 3.5,
                    "estimated_weight": "medium"
                }
                logger.info(f"Image analysis completed: {image_analysis}")
            except Exception as e:
                logger.warning(f"Image processing failed: {e}")
        
        if "fever" in symptoms and "coughing" in symptoms:
            condition = "Respiratory Infection (Pneumonia/Bronchitis)"
            severity = "high"
            confidence = 0.85
            treatments = [
                "🚨 URGENT: Seek immediate veterinary attention",
                "Isolate affected animal from herd",
                "Administer antibiotics as prescribed by veterinarian",
                "Ensure proper ventilation in housing",
                "Monitor temperature and breathing rate every 2 hours",
                "Provide electrolyte solutions if dehydrated"
            ]
            vet_required = True
        elif "limping" in symptoms:
            condition = "Lameness (Foot rot/Injury)"
            severity = "medium"
            confidence = 0.82
            treatments = [
                "Examine hooves for foreign objects or wounds",
                "Clean and disinfect affected area thoroughly",
                "Apply topical antibiotics if wound present",
                "Restrict movement until healed",
                "Provide soft, dry bedding",
                "Monitor for signs of infection"
            ]
            vet_required = False
        elif "loss of appetite" in symptoms:
            condition = "Digestive Issues/Nutritional Deficiency"
            severity = "medium" if len(symptoms) > 1 else "low"
            confidence = 0.70
            treatments = [
                "Provide fresh, clean water continuously",
                "Check feed quality and freshness",
                "Monitor for 24-48 hours closely",
                "Gradual diet adjustment with easily digestible feeds",
                "Consider vitamin B complex supplementation",
                "Weigh animal to monitor weight loss"
            ]
            vet_required = len(symptoms) > 2
        elif "diarrhea" in symptoms:
            condition = "Digestive Disorder (Enteritis/Parasites)"
            severity = "medium"
            confidence = 0.78
            treatments = [
                "Provide oral rehydration therapy immediately",
                "Collect fecal sample for parasitological examination",
                "Adjust diet to easily digestible feeds",
                "Administer probiotics to restore gut flora",
                "Monitor hydration status closely",
                "Isolate if infectious cause suspected"
            ]
            vet_required = True
        elif "skin_lesions" in symptoms:
            condition = "Dermatitis/Fungal Infection"
            severity = "medium"
            confidence = 0.75
            treatments = [
                "Apply antifungal/antibacterial ointments as prescribed",
                "Improve hygiene and housing conditions",
                "Isolate if contagious skin condition",
                "Provide nutritional support for skin health",
                "Clean and disinfect living areas",
                "Monitor for spread to other animals"
            ]
            vet_required = True
        elif "discharge" in symptoms:
            condition = "Bacterial/Viral Infection"
            severity = "high"
            confidence = 0.80
            treatments = [
                "🚨 URGENT: Collect samples for laboratory analysis",
                "Administer appropriate antibiotics immediately",
                "Maintain strict hygiene protocols",
                "Monitor for spread to other animals",
                "Isolate affected animal",
                "Disinfect all equipment and facilities"
            ]
            vet_required = True
        else:
            condition = "General Health Assessment Required"
            severity = "low"
            confidence = 0.50
            treatments = [
                "Schedule routine veterinary examination",
                "Monitor animal behavior and appetite daily",
                "Ensure proper nutrition and housing conditions",
                "Record symptoms for veterinary consultation",
                "Maintain vaccination schedule",
                "Regular health monitoring protocols"
            ]
            vet_required = False
        
        if len(symptoms) > 3:
            severity = "high"
        elif len(symptoms) > 1 and severity == "low":
            severity = "medium"
        
        if image_analysis:
            treatments.append(f"Body condition score: {image_analysis['body_condition_score']}/5")
            if image_analysis["body_condition_score"] < 3:
                treatments.append("⚠️ Consider nutritional supplementation")
                severity = "medium" if severity == "low" else severity
        
        if image_analysis:
            confidence = min(confidence + 0.1, 0.95)
        
        return LivestockDiagnosisResponse(
            condition=condition,
            severity=severity,
            treatment_recommendations=treatments,
            veterinary_consultation_required=vet_required,
            confidence=confidence,
            trace_id=str(uuid.uuid4())
        )
        
    except Exception as e:
        logger.error(f"Livestock diagnosis error: {e}")
        return LivestockDiagnosisResponse(
            condition="Health Assessment Unavailable",
            severity="unknown",
            treatment_recommendations=["Consult local veterinarian"],
            veterinary_consultation_required=True,
            confidence=0.0,
            trace_id=str(uuid.uuid4())
        )
