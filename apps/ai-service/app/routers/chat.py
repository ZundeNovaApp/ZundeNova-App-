from fastapi import APIRouter, Depends
from typing import Dict, Optional
import uuid
from app.core.logging import logger
from app.schemas.chat import ChatRequest, ChatResponse
from app.api.dependencies import get_optional_user

router = APIRouter()

@router.post("/", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_optional_user)
):
    try:
        text = request.text or ""
        audio_uri = request.audio_uri
        lang = request.lang
        context = request.context
        
        responses = {
            "en": [
                "Based on your query about farming, I recommend consulting with local agricultural experts.",
                "That's a great question about agriculture. Here are some general recommendations for your farming practices.",
                "I understand your concern about crops. It's important to monitor the situation closely."
            ],
            "sw": [
                "Kulingana na swali lako kuhusu kilimo, napendekeza uongee na wataalamu wa kilimo wa eneo lako.",
                "Hilo ni swali zuri kuhusu kilimo. Hapa kuna mapendekezo ya jumla ya mbinu za kilimo."
            ]
        }
        
        language_responses = responses.get(lang, responses["en"])
        answer = language_responses[hash(text) % len(language_responses)]
        
        handoff = None
        if any(word in text.lower() for word in ["emergency", "urgent", "dying", "disease"]):
            handoff = {
                "expert_id": "exp_" + str(uuid.uuid4())[:8],
                "eta": "2h"
            }
        
        return {
            "answer": answer,
            "citations": ["https://zundenova.com/docs/agronomy", "https://zundenova.com/docs/best-practices"],
            "confidence": 0.82,
            "handoff": handoff
        }
    except Exception as e:
        return {"error": f"Chat processing failed: {str(e)}"}
