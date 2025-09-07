import uuid
from typing import Dict, List, Optional
from app.core.logging import logger
import hashlib

class ChatService:
    def __init__(self):
        self.responses = {
            "en": {
                "crop_disease": [
                    "Based on your description, this could be a fungal infection. I recommend applying a copper-based fungicide and ensuring proper drainage.",
                    "The symptoms you describe suggest nutrient deficiency. Consider soil testing and appropriate fertilization.",
                    "This appears to be pest damage. Inspect your crops for insects and apply appropriate pest control measures."
                ],
                "livestock_health": [
                    "For livestock health concerns, ensure proper vaccination schedules and consult with a veterinarian.",
                    "The symptoms suggest possible nutritional issues. Review feed quality and consider supplements.",
                    "This could indicate a respiratory condition. Ensure proper ventilation and monitor closely."
                ],
                "general_farming": [
                    "Based on current weather patterns, I recommend adjusting your irrigation schedule.",
                    "Consider implementing crop rotation to improve soil health and reduce disease pressure.",
                    "Market prices suggest this is a good time to harvest and sell your produce."
                ],
                "emergency": [
                    "This appears to be an urgent situation. I'm connecting you with an expert immediately.",
                    "For emergency situations, please contact your local agricultural extension office.",
                    "This requires immediate attention. I recommend consulting with a specialist."
                ]
            },
            "sw": {
                "crop_disease": [
                    "Kulingana na maelezo yako, hii inaweza kuwa maambukizi ya kuvu. Napendekeza kutumia dawa ya kuvu ya shaba na kuhakikisha maji hayasimami.",
                    "Dalili unazozielezea zinaonyesha upungufu wa virutubisho. Fikiria kupima udongo na kutoa mbolea inayofaa."
                ],
                "livestock_health": [
                    "Kwa masuala ya afya ya mifugo, hakikisha ratiba za chanjo na kushauriana na daktari wa mifugo.",
                    "Dalili hizi zinaonyesha uwezekano wa matatizo ya lishe. Kagua ubora wa chakula na fikiria viongezeo."
                ],
                "general_farming": [
                    "Kulingana na hali ya hewa ya sasa, napendekeza kubadilisha ratiba yako ya umwagiliaji.",
                    "Fikiria kutekeleza mzunguko wa mazao ili kuboresha afya ya udongo."
                ]
            }
        }
    
    def generate_response(self, text: str, language: str = "en", context: Optional[Dict] = None) -> Dict:
        """Generate AI chat response"""
        try:
            category = self._categorize_query(text)
            language_responses = self.responses.get(language, self.responses["en"])
            category_responses = language_responses.get(category, language_responses["general_farming"])
            
            response_hash = hashlib.md5(text.encode()).hexdigest()
            response_index = int(response_hash[:2], 16) % len(category_responses)
            answer = category_responses[response_index]
            
            confidence = self._calculate_confidence(text, category)
            
            handoff = None
            if self._needs_expert_handoff(text, category):
                handoff = {
                    "expert_id": f"exp_{uuid.uuid4().hex[:8]}",
                    "eta": "2h"
                }
            
            return {
                "answer": answer,
                "citations": [
                    "https://zundenova.com/docs/agronomy",
                    "https://zundenova.com/docs/best-practices"
                ],
                "confidence": confidence,
                "handoff": handoff
            }
            
        except Exception as e:
            logger.error(f"Chat service error: {e}")
            return self._get_fallback_response(language)
    
    def _categorize_query(self, text: str) -> str:
        """Categorize the user query"""
        text_lower = text.lower()
        
        emergency_keywords = ["emergency", "urgent", "dying", "dead", "help", "crisis"]
        if any(keyword in text_lower for keyword in emergency_keywords):
            return "emergency"
        
        disease_keywords = ["disease", "sick", "spots", "yellow", "brown", "wilting", "infection"]
        if any(keyword in text_lower for keyword in disease_keywords):
            return "crop_disease"
        
        livestock_keywords = ["cattle", "cow", "chicken", "goat", "sheep", "livestock", "animal"]
        if any(keyword in text_lower for keyword in livestock_keywords):
            return "livestock_health"
        
        return "general_farming"
    
    def _calculate_confidence(self, text: str, category: str) -> float:
        """Calculate confidence score for the response"""
        base_confidence = 0.75
        
        if category == "emergency":
            return 0.95
        elif len(text.split()) > 10:
            return min(0.9, base_confidence + 0.1)
        elif len(text.split()) < 3:
            return max(0.6, base_confidence - 0.15)
        
        return base_confidence
    
    def _needs_expert_handoff(self, text: str, category: str) -> bool:
        """Determine if expert handoff is needed"""
        return category == "emergency" or "expert" in text.lower()
    
    def _get_fallback_response(self, language: str) -> Dict:
        """Fallback response when service fails"""
        fallback_answers = {
            "en": "I understand your concern about farming. Please consult with local agricultural experts for the best advice.",
            "sw": "Naelewa wasiwasi wako kuhusu kilimo. Tafadhali ongea na wataalamu wa kilimo wa eneo lako kwa ushauri bora."
        }
        
        return {
            "answer": fallback_answers.get(language, fallback_answers["en"]),
            "citations": ["https://zundenova.com/docs/support"],
            "confidence": 0.7,
            "handoff": None
        }

chat_service = ChatService()
