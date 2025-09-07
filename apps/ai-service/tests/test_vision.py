import pytest
from fastapi.testclient import TestClient
from main import app
import base64
from PIL import Image
import io

client = TestClient(app)

def create_test_image():
    """Create a test image as base64"""
    img = Image.new('RGB', (224, 224), color='green')
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode()

def test_vision_diagnose_success():
    """Test successful vision diagnosis"""
    test_image = create_test_image()
    
    payload = {
        "image_base64": test_image,
        "crop_type": "maize",
        "location": {"lat": -1.2921, "lon": 36.8219}
    }
    
    response = client.post("/vision/diagnose", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "diseases" in data
    assert "severity" in data
    assert "trace_id" in data
    assert len(data["diseases"]) > 0
    assert all("label" in disease for disease in data["diseases"])
    assert all("score" in disease for disease in data["diseases"])

def test_vision_diagnose_invalid_image():
    """Test vision diagnosis with invalid image"""
    payload = {
        "image_base64": "invalid_base64",
        "crop_type": "maize"
    }
    
    response = client.post("/vision/diagnose", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "diseases" in data

def test_vision_diagnose_missing_fields():
    """Test vision diagnosis with missing required fields"""
    payload = {
        "crop_type": "maize"
    }
    
    response = client.post("/vision/diagnose", json=payload)
    assert response.status_code == 422
