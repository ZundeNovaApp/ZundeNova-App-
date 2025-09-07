from fastapi import APIRouter, Depends
from typing import Dict
import uuid
from app.core.logging import logger
from app.schemas.geo import NDVIRequest, NDVIResponse
from app.api.dependencies import get_optional_user

router = APIRouter()

@router.post("/ndvi", response_model=NDVIResponse)
async def get_ndvi(
    request: NDVIRequest,
    current_user: dict = Depends(get_optional_user)
):
    try:
        from app.services.geo_service import geo_service
        
        result = geo_service.calculate_ndvi(
            request.field_id,
            request.date,
            request.bbox
        )
        
        return result
    except Exception as e:
        return {"error": f"NDVI calculation failed: {str(e)}"}
