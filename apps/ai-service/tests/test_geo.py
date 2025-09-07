import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_ndvi_analysis_success():
    """Test successful NDVI analysis"""
    payload = {
        "field_id": "test_field_001",
        "date": "2024-01-15",
        "bbox": [36.8, -1.3, 36.9, -1.2]
    }
    
    response = client.post("/geo/ndvi", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    
    assert "ndvi_mean" in data
    assert "ndvi_std" in data
    assert "map_uri" in data
    assert "advice" in data
    assert 0.0 <= data["ndvi_mean"] <= 1.0
    assert data["ndvi_std"] >= 0.0

def test_ndvi_analysis_missing_fields():
    """Test NDVI analysis with missing required fields"""
    payload = {
        "field_id": "test_field_001"
    }
    
    response = client.post("/geo/ndvi", json=payload)
    assert response.status_code == 422

def test_ndvi_analysis_invalid_bbox():
    """Test NDVI analysis with invalid bbox"""
    payload = {
        "field_id": "test_field_001",
        "date": "2024-01-15",
        "bbox": [36.8, -1.3]
    }
    
    response = client.post("/geo/ndvi", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert "ndvi_mean" in data
