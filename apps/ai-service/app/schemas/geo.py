from pydantic import BaseModel
from typing import List

class NDVIRequest(BaseModel):
    field_id: str
    date: str
    bbox: List[float]

class NDVIResponse(BaseModel):
    ndvi_mean: float
    ndvi_std: float
    map_uri: str
    advice: str
