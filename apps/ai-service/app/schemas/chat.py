from pydantic import BaseModel
from typing import Optional, List, Dict

class ChatContext(BaseModel):
    farm_id: Optional[str] = None

class ChatRequest(BaseModel):
    text: Optional[str] = None
    audio_uri: Optional[str] = None
    lang: str = "en"
    context: Optional[ChatContext] = None

class ExpertHandoff(BaseModel):
    expert_id: str
    eta: str

class ChatResponse(BaseModel):
    answer: str
    citations: List[str]
    confidence: float
    handoff: Optional[ExpertHandoff] = None
