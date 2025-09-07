#!/usr/bin/env python3
"""Test script for ZundeNova AI Service"""

import requests
import base64
import json
from PIL import Image
import io
import numpy as np

def create_test_image():
    """Create a test plant image"""
    img = Image.new('RGB', (224, 224), color='green')
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    return base64.b64encode(buffer.getvalue()).decode()

def test_vision_endpoint():
    """Test vision diagnosis endpoint"""
    print("Testing vision diagnosis endpoint...")
    
    test_image = create_test_image()
    
    payload = {
        "image_base64": test_image,
        "crop_type": "maize",
        "location": {"lat": -1.2921, "lon": 36.8219},
        "device": "test",
        "app_version": "1.0.0"
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/vision/diagnose",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Vision diagnosis successful")
            print(f"   Diseases detected: {len(result['diseases'])}")
            print(f"   Severity: {result['severity']}")
            print(f"   Trace ID: {result['trace_id']}")
        else:
            print(f"❌ Vision diagnosis failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Vision diagnosis error: {e}")

def test_ndvi_endpoint():
    """Test NDVI analysis endpoint"""
    print("\nTesting NDVI analysis endpoint...")
    
    payload = {
        "field_id": "test_field_001",
        "date": "2024-01-15",
        "bbox": [36.8, -1.3, 36.9, -1.2]
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/geo/ndvi",
            json=payload,
            timeout=15
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ NDVI analysis successful")
            print(f"   NDVI Mean: {result['ndvi_mean']}")
            print(f"   NDVI Std: {result['ndvi_std']}")
            print(f"   Advice: {result['advice']}")
        else:
            print(f"❌ NDVI analysis failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ NDVI analysis error: {e}")

def test_chat_endpoint():
    """Test AI chat endpoint"""
    print("\nTesting AI chat endpoint...")
    
    payload = {
        "text": "My maize plants have yellow leaves. What should I do?",
        "lang": "en",
        "context": {"farm_id": "test_farm_001"}
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/chat",
            json=payload,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ AI chat successful")
            print(f"   Answer: {result['answer'][:100]}...")
            print(f"   Confidence: {result['confidence']}")
            if result.get('handoff'):
                print(f"   Expert handoff: {result['handoff']['expert_id']}")
        else:
            print(f"❌ AI chat failed: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ AI chat error: {e}")

def test_health_endpoint():
    """Test health check endpoint"""
    print("\nTesting health check endpoint...")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Health check successful")
            print(f"   Status: {result['status']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Health check error: {e}")

if __name__ == "__main__":
    print("🧪 ZundeNova AI Service Test Suite")
    print("=" * 50)
    
    test_health_endpoint()
    test_vision_endpoint()
    test_ndvi_endpoint()
    test_chat_endpoint()
    
    print("\n" + "=" * 50)
    print("✅ Test suite completed")
