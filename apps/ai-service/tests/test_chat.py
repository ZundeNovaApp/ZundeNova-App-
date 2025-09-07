import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_chat_success():
    """Test successful chat interaction"""
    payload = {
        "text": "My maize plants have yellow leaves. What should I do?",
        "lang": "en",
        "context": {"farm_id": "test_farm_001"}
    }
    
    response = client.post("/chat/", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "answer" in data
    assert "citations" in data
    assert "confidence" in data
    assert isinstance(data["citations"], list)
    assert 0.0 <= data["confidence"] <= 1.0

def test_chat_emergency():
    """Test chat with emergency keywords"""
    payload = {
        "text": "Emergency! My crops are dying!",
        "lang": "en"
    }
    
    response = client.post("/chat/", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "handoff" in data
    if data["handoff"]:
        assert "expert_id" in data["handoff"]
        assert "eta" in data["handoff"]

def test_chat_swahili():
    """Test chat in Swahili"""
    payload = {
        "text": "Mazao yangu yana matatizo",
        "lang": "sw"
    }
    
    response = client.post("/chat/", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data

def test_chat_empty_text():
    """Test chat with empty text"""
    payload = {
        "lang": "en"
    }
    
    response = client.post("/chat/", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
